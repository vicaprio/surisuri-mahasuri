const prisma = require('../utils/prisma');

/**
 * SLA 기반 기사님 매칭 서비스
 *
 * 목표: 2시간 내 도착 가능한 기사님 자동 배정
 *
 * 매칭 알고리즘:
 * 1. 필터링: 서비스 지역, 스킬 레벨, 가용성, ETA
 * 2. 점수 계산:
 *    - 40% ETA (짧을수록 높은 점수)
 *    - 25% 수락률
 *    - 20% 정시 도착률
 *    - 10% 불만율 (낮을수록 높은 점수)
 *    - 5% 서비스 적합도
 * 3. 상위 3명에게 동시 요청, 먼저 수락한 기사님 배정
 */

// 두 지점 간 거리 계산 (Haversine formula) - km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// ETA 계산 (분) - 거리 기반 간단 추정
function calculateETA(distance) {
  // 평균 이동 속도: 30km/h (도심 기준)
  const speedKmPerHour = 30;
  const etaMinutes = (distance / speedKmPerHour) * 60;
  // 준비 시간 추가 (10분)
  return Math.ceil(etaMinutes + 10);
}

// 기사님 점수 계산
function calculateTechnicianScore(technician, eta, serviceDifficulty) {
  const scores = {
    eta: 0,
    acceptanceRate: 0,
    ontimeRate: 0,
    complaintRate: 0,
    serviceFit: 0,
  };

  // 1. ETA 점수 (40%) - 2시간(120분) 내에서 짧을수록 높은 점수
  const slaWindow = parseInt(process.env.SLA_WINDOW_MINUTES) || 120;
  scores.eta = Math.max(0, (slaWindow - eta) / slaWindow) * 40;

  // 2. 수락률 점수 (25%)
  scores.acceptanceRate = (technician.acceptanceRate / 100) * 25;

  // 3. 정시 도착률 점수 (20%)
  scores.ontimeRate = (technician.ontimeRate / 100) * 20;

  // 4. 불만율 점수 (10%) - 낮을수록 높은 점수
  scores.complaintRate = (1 - (technician.complaintRate / 100)) * 10;

  // 5. 서비스 적합도 (5%) - 기본 점수
  // TODO: 실제로는 기사님의 해당 서비스 완료 횟수 등으로 계산
  scores.serviceFit = 5;

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  return {
    score: totalScore,
    breakdown: scores,
    eta,
  };
}

// SLA 매칭: 적합한 기사님 찾기
async function findMatchingTechnicians(serviceRequest) {
  const { latitude, longitude, serviceId, requestType } = serviceRequest;

  // SLA 윈도우 (분)
  const slaWindow = parseInt(process.env.SLA_WINDOW_MINUTES) || 120;

  // 1. 서비스 정보 조회
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new Error('Service not found');
  }

  // 2. 가용 기사님 조회
  const availableTechnicians = await prisma.technician.findMany({
    where: {
      status: 'AVAILABLE',
      skills: {
        some: {
          serviceId: serviceId,
        },
      },
    },
    include: {
      skills: {
        where: { serviceId },
      },
    },
  });

  if (availableTechnicians.length === 0) {
    return {
      matched: [],
      reason: 'No available technicians',
    };
  }

  // 3. 각 기사님별 점수 계산
  const scoredTechnicians = availableTechnicians
    .map(technician => {
      // 거리 계산
      const distance = calculateDistance(
        latitude,
        longitude,
        technician.currentLatitude || 37.5665, // 기본값: 서울 시청
        technician.currentLongitude || 126.9780
      );

      // ETA 계산
      const eta = calculateETA(distance);

      // SLA 체크
      if (requestType === 'ASAP' && eta > slaWindow) {
        return null; // SLA 내 도착 불가
      }

      // 스킬 레벨 체크
      const skill = technician.skills[0];
      const requiredLevel = service.difficulty === 'A' ? 1 :
                           service.difficulty === 'B' ? 2 : 3;
      if (skill.skillLevel < requiredLevel) {
        return null; // 스킬 부족
      }

      // 점수 계산
      const scoreData = calculateTechnicianScore(
        technician,
        eta,
        service.difficulty
      );

      return {
        technician,
        distance,
        ...scoreData,
      };
    })
    .filter(Boolean) // null 제거
    .sort((a, b) => b.score - a.score); // 점수 높은 순 정렬

  // 4. 상위 3명 반환
  const topMatches = scoredTechnicians.slice(0, 3);

  return {
    matched: topMatches,
    totalCandidates: availableTechnicians.length,
    qualifiedCandidates: scoredTechnicians.length,
  };
}

// 기사님에게 서비스 요청 할당
async function assignToTechnician(serviceRequestId, technicianId) {
  const now = new Date();
  const slaWindow = parseInt(process.env.SLA_WINDOW_MINUTES) || 120;
  const slaDeadline = new Date(now.getTime() + slaWindow * 60000);

  // 서비스 요청 업데이트
  const updated = await prisma.serviceRequest.update({
    where: { id: serviceRequestId },
    data: {
      status: 'ASSIGNED',
      technicianId,
      assignedAt: now,
      slaDeadline,
    },
    include: {
      service: true,
      user: true,
      technician: true,
    },
  });

  // 로그 생성
  await prisma.serviceLog.create({
    data: {
      serviceRequestId,
      logType: 'STATUS_CHANGE',
      oldStatus: 'ASSIGNING',
      newStatus: 'ASSIGNED',
      content: `기사님 ${updated.technician.name}에게 배정됨`,
      createdBy: 'SYSTEM',
    },
  });

  // 기사님 상태 변경
  await prisma.technician.update({
    where: { id: technicianId },
    data: {
      status: 'BUSY',
    },
  });

  return updated;
}

// 자동 매칭 프로세스 실행
async function autoAssignTechnician(serviceRequestId) {
  try {
    // 서비스 요청 조회
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
      include: { service: true },
    });

    if (!serviceRequest) {
      throw new Error('Service request not found');
    }

    // 상태 변경: ASSIGNING
    await prisma.serviceRequest.update({
      where: { id: serviceRequestId },
      data: { status: 'ASSIGNING' },
    });

    // 매칭 실행
    const matchResult = await findMatchingTechnicians(serviceRequest);

    if (matchResult.matched.length === 0) {
      // 매칭 실패
      await prisma.serviceRequest.update({
        where: { id: serviceRequestId },
        data: { status: 'REQUESTED' },
      });

      await prisma.serviceLog.create({
        data: {
          serviceRequestId,
          logType: 'STATUS_CHANGE',
          content: `매칭 실패: ${matchResult.reason || '가능한 기사님 없음'}`,
          createdBy: 'SYSTEM',
        },
      });

      return {
        success: false,
        message: matchResult.reason || '가능한 기사님이 없습니다',
      };
    }

    // 첫 번째 매칭된 기사님에게 자동 배정 (MVP)
    // TODO: 실제로는 상위 3명에게 동시 요청 후 수락 대기
    const bestMatch = matchResult.matched[0];
    const assigned = await assignToTechnician(
      serviceRequestId,
      bestMatch.technician.id
    );

    return {
      success: true,
      serviceRequest: assigned,
      matchInfo: {
        score: bestMatch.score,
        eta: bestMatch.eta,
        distance: bestMatch.distance,
      },
    };
  } catch (error) {
    console.error('Auto-assign error:', error);
    return {
      success: false,
      message: error.message,
    };
  }
}

module.exports = {
  findMatchingTechnicians,
  assignToTechnician,
  autoAssignTechnician,
  calculateDistance,
  calculateETA,
};
