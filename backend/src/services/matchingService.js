const crypto = require('crypto');
const prisma = require('../utils/prisma');

// Haversine formula로 두 좌표 간 거리 계산 (km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 적합한 기사님 찾기
async function findEligibleTechnicians(serviceRequest) {
  const { serviceId, latitude, longitude } = serviceRequest;

  const allTechnicians = await prisma.technician.findMany({
    where: { status: { in: ['ONLINE', 'AVAILABLE'] } },
  });

  if (allTechnicians.length === 0) return [];

  const eligibleTechnicians = [];

  for (const tech of allTechnicians) {
    if (!tech.currentLatitude || !tech.currentLongitude) continue;

    const distance = calculateDistance(latitude, longitude, tech.currentLatitude, tech.currentLongitude);
    if (distance > 15) continue;

    let hasRequiredSkill = false;
    if (serviceId) {
      const skills = await prisma.technicianSkill.findMany({ where: { technicianId: tech.id } });
      hasRequiredSkill = skills.some(skill => skill.serviceId === serviceId);
    } else {
      // GENERAL 또는 서비스 미지정: 모든 기사님 가능
      hasRequiredSkill = true;
    }

    if (hasRequiredSkill) {
      eligibleTechnicians.push({ ...tech, distance });
    }
  }

  return eligibleTechnicians;
}

// 기사님 우선순위 점수 계산 및 정렬
function rankTechnicians(technicians) {
  return technicians.map(tech => {
    let score = 0;
    score += Math.max(0, (15 - tech.distance) / 15 * 100);
    score += (tech.rating / 5) * 100;
    score += tech.acceptanceRate || 0;
    score += (tech.ontimeRate || 0) * 0.5;
    score += Math.min(tech.completedJobs || 0, 50);
    score -= (tech.complaintRate || 0) * 2;
    return { ...tech, score: Math.round(score) };
  }).sort((a, b) => b.score - a.score);
}

// 자동 매칭 시작
async function startAutoMatch(serviceRequestId) {
  const serviceRequest = await prisma.serviceRequest.findFirst({
    where: { id: serviceRequestId },
  });

  if (!serviceRequest) throw new Error('Service request not found');

  if (serviceRequest.technicianId) {
    return { success: false, message: 'Already assigned to a technician' };
  }

  const existingMatch = await prisma.serviceRequestMatch.findFirst({
    where: { serviceRequestId, status: 'PENDING' },
  });

  if (existingMatch) {
    return { success: false, message: 'Matching already in progress', matchId: existingMatch.id };
  }

  const eligibleTechnicians = await findEligibleTechnicians(serviceRequest);

  if (eligibleTechnicians.length === 0) {
    return { success: false, message: 'No available technicians found', eligibleCount: 0 };
  }

  const rankedTechnicians = rankTechnicians(eligibleTechnicians);

  const topTechnician = rankedTechnicians[0];
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const match = await prisma.serviceRequestMatch.create({
    data: {
      id: crypto.randomUUID(),
      serviceRequestId,
      technicianId: topTechnician.id,
      status: 'PENDING',
      priority: topTechnician.score,
      expiresAt,
    },
  });

  return {
    success: true,
    matchId: match.id,
    technicianId: topTechnician.id,
    technicianName: topTechnician.name,
    estimatedResponseTime: '5분 이내',
    backupTechniciansCount: rankedTechnicians.length - 1,
  };
}

// 매칭 수락 (기사님)
async function acceptMatch(matchId, technicianId) {
  const match = await prisma.serviceRequestMatch.findFirst({ where: { id: matchId } });

  if (!match) throw new Error('Match not found');
  if (match.technicianId !== technicianId) throw new Error('Unauthorized');
  if (match.status !== 'PENDING') throw new Error('Match is no longer pending');

  const updatedMatch = await prisma.serviceRequestMatch.update({
    where: { id: matchId },
    data: { status: 'ACCEPTED', respondedAt: new Date() },
  });

  await prisma.serviceRequest.update({
    where: { id: match.serviceRequestId },
    data: { technicianId, status: 'ASSIGNED', assignedAt: new Date() },
  });

  return updatedMatch;
}

// 매칭 거절 (기사님)
async function rejectMatch(matchId, technicianId, reason = '') {
  const match = await prisma.serviceRequestMatch.findFirst({ where: { id: matchId } });

  if (!match) throw new Error('Match not found');
  if (match.technicianId !== technicianId) throw new Error('Unauthorized');
  if (match.status !== 'PENDING') throw new Error('Match is no longer pending');

  await prisma.serviceRequestMatch.update({
    where: { id: matchId },
    data: { status: 'REJECTED', respondedAt: new Date() },
  });

  return { success: true, message: 'Match rejected' };
}

// 매칭 상태 조회 (고객용)
async function getMatchStatus(serviceRequestId) {
  const serviceRequest = await prisma.serviceRequest.findFirst({ where: { id: serviceRequestId } });

  if (!serviceRequest) throw new Error('Service request not found');

  const acceptedMatch = await prisma.serviceRequestMatch.findFirst({
    where: { serviceRequestId, status: 'ACCEPTED' },
  });

  if (acceptedMatch) {
    const technician = await prisma.technician.findUnique({ where: { id: acceptedMatch.technicianId } });
    return {
      status: 'MATCHED',
      match: acceptedMatch,
      technician: {
        id: technician.id,
        name: technician.name,
        phone: technician.phone,
        rating: technician.rating,
        profilePhoto: technician.profilePhoto,
      },
      estimatedArrival: calculateEstimatedArrival(technician, serviceRequest),
    };
  }

  const currentMatch = await prisma.serviceRequestMatch.findFirst({
    where: { serviceRequestId, status: 'PENDING' },
  });

  if (currentMatch) {
    const technician = await prisma.technician.findUnique({ where: { id: currentMatch.technicianId } });
    return {
      status: 'NOTIFYING',
      match: currentMatch,
      technician: {
        id: technician.id,
        name: technician.name,
        rating: technician.rating,
        profilePhoto: technician.profilePhoto,
      },
      expiresAt: currentMatch.expiresAt,
    };
  }

  return { status: 'SEARCHING', message: '가까운 전문가를 찾고 있습니다...' };
}

// 예상 도착 시간 계산
function calculateEstimatedArrival(technician, serviceRequest) {
  const distance = calculateDistance(
    serviceRequest.latitude, serviceRequest.longitude,
    technician.currentLatitude, technician.currentLongitude
  );
  const totalMinutes = Math.ceil((distance / 30) * 60) + 15;
  return new Date(Date.now() + totalMinutes * 60 * 1000).toISOString();
}

// 기사님 대기중인 매칭 조회
async function getPendingMatchesForTechnician(technicianId) {
  const matches = await prisma.serviceRequestMatch.findMany({
    where: { technicianId, status: 'PENDING' },
  });

  const result = [];
  for (const match of matches) {
    const serviceRequest = await prisma.serviceRequest.findFirst({ where: { id: match.serviceRequestId } });
    const service = serviceRequest?.serviceId
      ? await prisma.service.findUnique({ where: { id: serviceRequest.serviceId } })
      : null;
    result.push({
      ...match,
      serviceRequest: { ...serviceRequest, serviceName: service?.name || '기타 수리' },
    });
  }
  return result;
}

module.exports = {
  startAutoMatch,
  acceptMatch,
  rejectMatch,
  getMatchStatus,
  getPendingMatchesForTechnician,
  calculateDistance,
};
