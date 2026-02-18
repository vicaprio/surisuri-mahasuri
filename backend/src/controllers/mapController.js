const prisma = require('../utils/prisma');

// 지도에 표시할 서비스 요청 목록 (위치 정보 있는 것만)
exports.getMapJobs = async (req, res) => {
  try {
    const jobs = await prisma.serviceRequest.findMany({
      where: {
        status: { in: ['REQUESTED', 'PENDING', 'MATCHING'] },
        latitude:  { not: null },
        longitude: { not: null },
      },
      select: {
        id:            true,
        requestNumber: true,
        address:       true,
        latitude:      true,
        longitude:     true,
        description:   true,
        estimatedCost: true,
        status:        true,
        requestedAt:   true,
        service: {
          select: { name: true, category: true },
        },
      },
      orderBy: { requestedAt: 'desc' },
      take: 200,
    });

    // category 필드가 서비스 요청에 직접 없으면 service.category 로 대체
    const result = jobs.map(job => ({
      ...job,
      category: job.service?.category || 'GENERAL',
      serviceName: job.service?.name || null,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get map jobs error:', error);
    res.status(500).json({ error: 'Failed to get map jobs' });
  }
};

// 기사님 현재 위치 업데이트
exports.updateTechnicianLocation = async (req, res) => {
  try {
    const technicianId = req.user.id;
    const { latitude, longitude, status } = req.body;

    const data = {};
    if (latitude  !== undefined) data.currentLatitude  = latitude;
    if (longitude !== undefined) data.currentLongitude = longitude;
    if (status)                  data.status            = status;

    await prisma.technician.update({
      where: { id: technicianId },
      data,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Update technician location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};
