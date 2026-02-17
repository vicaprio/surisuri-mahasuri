const prisma = require('../utils/prisma');
const { autoAssignTechnician } = require('../services/slaMatchingService');
const { randomUUID } = require('crypto');

// 서비스 요청 생성
exports.createServiceRequest = async (req, res) => {
  try {
    const {
      serviceId,
      address,
      addressDetail,
      latitude,
      longitude,
      description,
      photoUrls,
      requestType,
      scheduledAt,
      unitId,
      category,
    } = req.body;

    const userId = req.user.id;

    // 서비스 조회 (serviceId가 있는 경우만)
    let service = null;
    if (serviceId) {
      service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service || !service.isActive) {
        return res.status(404).json({ error: 'Service not found or inactive' });
      }
    }

    // 요청 번호 생성
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await prisma.serviceRequest.count();
    const requestNumber = `SR-${today}-${String(count + 1).padStart(4, '0')}`;

    // AI 예상 견적 계산 (간단한 로직)
    // TODO: 실제 AI 모델 연동
    // serviceId가 없는 경우 (기타수리) 기본 견적 설정
    const estimatedCost = service ? service.basePrice : 50000;

    // UUID 생성
    const requestId = randomUUID();

    // 서비스 요청 생성
    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        id: requestId,
        requestNumber,
        userId,
        serviceId: serviceId || null,
        unitId: unitId || null,
        requestType: requestType || 'ASAP',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        address,
        addressDetail,
        latitude,
        longitude,
        description,
        photoUrls: photoUrls ? JSON.stringify(photoUrls) : null,
        estimatedCost,
        status: 'REQUESTED',
      },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    console.log('Service request created:', serviceRequest);

    if (!serviceRequest || !serviceRequest.id) {
      throw new Error('Failed to create service request - no ID returned');
    }

    // 로그 생성
    await prisma.serviceLog.create({
      data: {
        serviceRequestId: serviceRequest.id,
        logType: 'STATUS_CHANGE',
        newStatus: 'REQUESTED',
        content: '서비스 요청이 접수되었습니다',
        createdBy: userId,
      },
    });

    // ASAP 요청인 경우 자동 매칭 시작 (serviceId가 있는 경우만)
    if (requestType === 'ASAP' && serviceId) {
      // 비동기로 매칭 실행 (응답 지연 방지)
      setImmediate(async () => {
        await autoAssignTechnician(serviceRequest.id);
      });
    }

    res.status(201).json({
      message: 'Service request created successfully',
      data: serviceRequest,
    });
  } catch (error) {
    console.error('Create service request error:', error);
    res.status(500).json({ error: 'Failed to create service request' });
  }
};

// 서비스 요청 목록 조회
exports.getServiceRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const requests = await prisma.serviceRequest.findMany({
      where,
      include: {
        service: true,
        technician: {
          select: {
            id: true,
            name: true,
            phone: true,
            rating: true,
          },
        },
        warranty: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });

    const total = await prisma.serviceRequest.count({ where });

    res.json({
      data: requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get service requests error:', error);
    res.status(500).json({ error: 'Failed to fetch service requests' });
  }
};

// 서비스 요청 상세 조회
exports.getServiceRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const serviceRequest = await prisma.serviceRequest.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        service: true,
        user: true,
        technician: true,
        logs: {
          orderBy: { createdAt: 'desc' },
        },
        warranty: true,
      },
    });

    if (!serviceRequest) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    res.json({ data: serviceRequest });
  } catch (error) {
    console.error('Get service request error:', error);
    res.status(500).json({ error: 'Failed to fetch service request' });
  }
};

// 서비스 요청 취소
exports.cancelServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const serviceRequest = await prisma.serviceRequest.findFirst({
      where: { id, userId },
    });

    if (!serviceRequest) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    if (!['REQUESTED', 'ASSIGNING', 'ASSIGNED'].includes(serviceRequest.status)) {
      return res.status(400).json({
        error: 'Cannot cancel request in current status',
      });
    }

    // 요청 취소
    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });

    // 로그 생성
    await prisma.serviceLog.create({
      data: {
        serviceRequestId: id,
        logType: 'STATUS_CHANGE',
        oldStatus: serviceRequest.status,
        newStatus: 'CANCELLED',
        content: '사용자가 요청을 취소했습니다',
        createdBy: userId,
      },
    });

    // 배정된 기사님이 있다면 상태 복원
    if (serviceRequest.technicianId) {
      await prisma.technician.update({
        where: { id: serviceRequest.technicianId },
        data: { status: 'AVAILABLE' },
      });
    }

    res.json({
      message: 'Service request cancelled',
      data: updated,
    });
  } catch (error) {
    console.error('Cancel service request error:', error);
    res.status(500).json({ error: 'Failed to cancel service request' });
  }
};

// 작업 완료 처리 (기사님용)
exports.completeServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const technicianId = req.technician.id;
    const { finalCost, notes, afterPhotoUrls } = req.body;

    const serviceRequest = await prisma.serviceRequest.findFirst({
      where: {
        id,
        technicianId,
        status: 'IN_PROGRESS',
      },
      include: { service: true },
    });

    if (!serviceRequest) {
      return res.status(404).json({
        error: 'Service request not found or not in progress',
      });
    }

    const completedAt = new Date();

    // 요청 완료 처리
    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        finalCost: finalCost || serviceRequest.estimatedCost,
        completedAt,
      },
    });

    // 로그 생성
    await prisma.serviceLog.create({
      data: {
        serviceRequestId: id,
        logType: 'STATUS_CHANGE',
        oldStatus: 'IN_PROGRESS',
        newStatus: 'COMPLETED',
        content: notes || '작업이 완료되었습니다',
        photoUrls: afterPhotoUrls ? JSON.stringify(afterPhotoUrls) : null,
        createdBy: technicianId,
      },
    });

    // 보증서 생성
    const warrantyEndDate = new Date(completedAt);
    warrantyEndDate.setDate(warrantyEndDate.getDate() + serviceRequest.service.warrantyDays);

    const warrantyNumber = `WR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const warranty = await prisma.warranty.create({
      data: {
        warrantyNumber,
        serviceRequestId: id,
        status: 'ACTIVE',
        startDate: completedAt,
        endDate: warrantyEndDate,
        terms: `${serviceRequest.service.name} 작업에 대한 ${serviceRequest.service.warrantyDays}일 품질 보증`,
      },
    });

    // 기사님 상태 및 통계 업데이트
    await prisma.technician.update({
      where: { id: technicianId },
      data: {
        status: 'AVAILABLE',
        completedJobs: { increment: 1 },
      },
    });

    res.json({
      message: 'Service request completed',
      data: {
        serviceRequest: updated,
        warranty,
      },
    });
  } catch (error) {
    console.error('Complete service request error:', error);
    res.status(500).json({ error: 'Failed to complete service request' });
  }
};
