const prisma = require('../utils/prisma');

// 전체 서비스 목록 조회
exports.getAllServices = async (req, res) => {
  try {
    const { category, isActive } = req.query;

    const where = {};

    // Only filter by isActive if explicitly provided
    if (isActive !== undefined) {
      where.isActive = isActive === 'true' || isActive === true;
    } else {
      // Default to active services
      where.isActive = true;
    }

    if (category) {
      where.category = category;
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { code: 'asc' },
      ],
    });

    // 카테고리별로 그룹화
    const grouped = services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {});

    res.json({
      data: {
        services,
        grouped,
      },
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

// 서비스 상세 조회
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ data: service });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
};

// 서비스 생성 (관리자용)
exports.createService = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      category,
      difficulty,
      estimatedDuration,
      basePrice,
      slaAvailable,
      warrantyDays,
    } = req.body;

    const service = await prisma.service.create({
      data: {
        code,
        name,
        description,
        category,
        difficulty,
        estimatedDuration,
        basePrice,
        slaAvailable: slaAvailable !== false,
        warrantyDays: warrantyDays || 365,
      },
    });

    res.status(201).json({
      message: 'Service created successfully',
      data: service,
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
};
