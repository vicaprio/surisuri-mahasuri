const crypto = require('crypto');
const prisma = require('../utils/db');

// Haversine formula로 두 좌표 간 거리 계산 (km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반지름 (km)
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
  const { category, serviceId, latitude, longitude } = serviceRequest;

  // 모든 활성 기사님 조회 (ONLINE 또는 AVAILABLE 상태)
  const allTechnicians = prisma.raw.prepare(`
    SELECT * FROM Technician
    WHERE status IN ('ONLINE', 'AVAILABLE')
  `).all();

  if (allTechnicians.length === 0) {
    return [];
  }

  // 각 기사님의 전문 분야 조회
  const eligibleTechnicians = [];

  for (const tech of allTechnicians) {
    // 거리 계산
    if (!tech.currentLatitude || !tech.currentLongitude) {
      continue; // 위치 정보 없으면 제외
    }

    const distance = calculateDistance(
      latitude,
      longitude,
      tech.currentLatitude,
      tech.currentLongitude
    );

    // 서비스 지역 범위 확인 (기본 15km)
    const maxDistance = 15;
    if (distance > maxDistance) {
      continue; // 너무 멀면 제외
    }

    // 기사님의 전문 분야 확인
    let hasRequiredSkill = false;

    if (serviceId) {
      // 특정 서비스에 대한 스킬이 있는지 확인
      const skills = prisma.technicianSkill.findMany({
        where: { technicianId: tech.id }
      });
      hasRequiredSkill = skills.some(skill => skill.serviceId === serviceId);
    } else if (category) {
      // 카테고리로 매칭 (GENERAL 등)
      // 모든 기사님이 GENERAL 작업 가능하다고 가정
      hasRequiredSkill = true;
    }

    if (hasRequiredSkill) {
      eligibleTechnicians.push({
        ...tech,
        distance
      });
    }
  }

  return eligibleTechnicians;
}

// 기사님 우선순위 점수 계산 및 정렬
function rankTechnicians(technicians, serviceRequest) {
  return technicians.map(tech => {
    let score = 0;

    // 1. 거리 점수 (가까울수록 높음) - 최대 100점
    const distanceScore = Math.max(0, (15 - tech.distance) / 15 * 100);
    score += distanceScore;

    // 2. 평점 점수 - 최대 100점
    const ratingScore = (tech.rating / 5) * 100;
    score += ratingScore;

    // 3. 수락률 점수 - 최대 100점
    score += tech.acceptanceRate || 0;

    // 4. 정시 도착률 점수 - 최대 50점
    score += (tech.ontimeRate || 0) * 0.5;

    // 5. 경험 점수 (완료 건수) - 최대 50점
    score += Math.min(tech.completedJobs || 0, 50);

    // 6. 불만 감점 (불만율이 높으면 감점)
    score -= (tech.complaintRate || 0) * 2;

    return {
      ...tech,
      score: Math.round(score)
    };
  }).sort((a, b) => b.score - a.score);
}

// 자동 매칭 시작
async function startAutoMatch(serviceRequestId) {
  // 1. 서비스 요청 정보 가져오기
  const serviceRequest = prisma.serviceRequest.findFirst({
    where: { id: serviceRequestId }
  });

  if (!serviceRequest) {
    throw new Error('Service request not found');
  }

  // 이미 기사님이 배정되었는지 확인
  if (serviceRequest.technicianId) {
    return {
      success: false,
      message: 'Already assigned to a technician'
    };
  }

  // 이미 대기중인 매칭이 있는지 확인
  const existingMatch = prisma.serviceRequestMatch.findFirst({
    where: {
      service_request_id: serviceRequestId,
      status: 'PENDING'
    }
  });

  if (existingMatch) {
    return {
      success: false,
      message: 'Matching already in progress',
      matchId: existingMatch.id
    };
  }

  // 2. 적합한 기사님 목록 찾기
  const eligibleTechnicians = await findEligibleTechnicians(serviceRequest);

  if (eligibleTechnicians.length === 0) {
    return {
      success: false,
      message: 'No available technicians found',
      eligibleCount: 0
    };
  }

  // 3. 우선순위 점수로 정렬
  const rankedTechnicians = rankTechnicians(eligibleTechnicians, serviceRequest);

  console.log(`Found ${rankedTechnicians.length} eligible technicians`);
  console.log('Top 3 technicians:', rankedTechnicians.slice(0, 3).map(t => ({
    id: t.id,
    name: t.name,
    score: t.score,
    distance: t.distance.toFixed(2) + 'km'
  })));

  // 4. 1순위 기사님에게 매칭 생성
  const topTechnician = rankedTechnicians[0];
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5분 후

  const match = prisma.serviceRequestMatch.create({
    data: {
      id: crypto.randomUUID(),
      service_request_id: serviceRequestId,
      technician_id: topTechnician.id,
      status: 'PENDING',
      priority: topTechnician.score,
      notified_at: now,
      expires_at: expiresAt
    }
  });

  console.log(`Created match ${match.id} for technician ${topTechnician.name}`);

  // 5. 실제 앱에서는 여기서 푸시 알림/SMS 전송
  // await sendNotification(topTechnician.id, serviceRequest);

  return {
    success: true,
    matchId: match.id,
    technicianId: topTechnician.id,
    technicianName: topTechnician.name,
    estimatedResponseTime: '5분 이내',
    backupTechniciansCount: rankedTechnicians.length - 1
  };
}

// 매칭 수락 (기사님)
async function acceptMatch(matchId, technicianId) {
  const match = prisma.serviceRequestMatch.findFirst({
    where: { id: matchId }
  });

  if (!match) {
    throw new Error('Match not found');
  }

  if (match.technicianId !== technicianId) {
    throw new Error('Unauthorized');
  }

  if (match.status !== 'PENDING') {
    throw new Error('Match is no longer pending');
  }

  // 매칭 상태 업데이트
  const updatedMatch = prisma.serviceRequestMatch.update({
    where: { id: matchId },
    data: {
      status: 'ACCEPTED',
      responded_at: new Date().toISOString()
    }
  });

  // 서비스 요청에 기사님 배정
  prisma.serviceRequest.update({
    where: { id: match.serviceRequestId },
    data: {
      technicianId: technicianId,
      status: 'ASSIGNED',
      assignedAt: new Date().toISOString()
    }
  });

  console.log(`Match ${matchId} accepted by technician ${technicianId}`);

  return updatedMatch;
}

// 매칭 거절 (기사님)
async function rejectMatch(matchId, technicianId, reason = '') {
  const match = prisma.serviceRequestMatch.findFirst({
    where: { id: matchId }
  });

  if (!match) {
    throw new Error('Match not found');
  }

  if (match.technicianId !== technicianId) {
    throw new Error('Unauthorized');
  }

  if (match.status !== 'PENDING') {
    throw new Error('Match is no longer pending');
  }

  // 매칭 상태 업데이트
  prisma.serviceRequestMatch.update({
    where: { id: matchId },
    data: {
      status: 'REJECTED',
      responded_at: new Date().toISOString()
    }
  });

  console.log(`Match ${matchId} rejected by technician ${technicianId}. Reason: ${reason}`);

  // 다음 순위 기사님에게 자동으로 매칭 시도
  // (실제로는 백그라운드 작업으로 처리)
  const serviceRequest = prisma.serviceRequest.findFirst({
    where: { id: match.serviceRequestId }
  });

  if (serviceRequest && !serviceRequest.technicianId) {
    console.log('Will try to match with next available technician...');
    // await startAutoMatch(match.serviceRequestId);
  }

  return { success: true, message: 'Match rejected' };
}

// 매칭 상태 조회 (고객용)
async function getMatchStatus(serviceRequestId) {
  const serviceRequest = prisma.serviceRequest.findFirst({
    where: { id: serviceRequestId }
  });

  if (!serviceRequest) {
    throw new Error('Service request not found');
  }

  // 현재 매칭 상태 조회
  const currentMatch = prisma.serviceRequestMatch.findFirst({
    where: {
      service_request_id: serviceRequestId,
      status: 'PENDING'
    }
  });

  // 수락된 매칭 조회
  const acceptedMatch = prisma.serviceRequestMatch.findFirst({
    where: {
      service_request_id: serviceRequestId,
      status: 'ACCEPTED'
    }
  });

  if (acceptedMatch) {
    const technician = prisma.technician.findUnique({
      where: { id: acceptedMatch.technicianId }
    });

    return {
      status: 'MATCHED',
      match: acceptedMatch,
      technician: {
        id: technician.id,
        name: technician.name,
        phone: technician.phone,
        rating: technician.rating,
        profilePhoto: technician.profilePhoto
      },
      estimatedArrival: calculateEstimatedArrival(technician, serviceRequest)
    };
  }

  if (currentMatch) {
    const technician = prisma.technician.findUnique({
      where: { id: currentMatch.technicianId }
    });

    return {
      status: 'NOTIFYING',
      match: currentMatch,
      technician: {
        id: technician.id,
        name: technician.name,
        rating: technician.rating,
        profilePhoto: technician.profilePhoto
      },
      expiresAt: currentMatch.expiresAt
    };
  }

  return {
    status: 'SEARCHING',
    message: '가까운 전문가를 찾고 있습니다...'
  };
}

// 예상 도착 시간 계산
function calculateEstimatedArrival(technician, serviceRequest) {
  const distance = calculateDistance(
    serviceRequest.latitude,
    serviceRequest.longitude,
    technician.currentLatitude,
    technician.currentLongitude
  );

  // 평균 속도 30km/h 가정
  const travelTimeMinutes = Math.ceil((distance / 30) * 60);
  const prepTimeMinutes = 15; // 준비 시간
  const totalMinutes = travelTimeMinutes + prepTimeMinutes;

  const arrivalTime = new Date(Date.now() + totalMinutes * 60 * 1000);
  return arrivalTime.toISOString();
}

// 기사님 대기중인 매칭 조회
function getPendingMatchesForTechnician(technicianId) {
  const matches = prisma.serviceRequestMatch.findMany({
    where: {
      technician_id: technicianId,
      status: 'PENDING'
    }
  });

  return matches.map(match => {
    const serviceRequest = prisma.serviceRequest.findFirst({
      where: { id: match.serviceRequestId }
    });

    const service = serviceRequest.serviceId
      ? prisma.service.findUnique({ where: { id: serviceRequest.serviceId } })
      : null;

    return {
      ...match,
      serviceRequest: {
        ...serviceRequest,
        serviceName: service?.name || '기타 수리'
      }
    };
  });
}

module.exports = {
  startAutoMatch,
  acceptMatch,
  rejectMatch,
  getMatchStatus,
  getPendingMatchesForTechnician,
  calculateDistance
};
