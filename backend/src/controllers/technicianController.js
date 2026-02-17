const prisma = require('../utils/db');

// Get technician profile
exports.getTechnicianProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const technician = await prisma.technician.findUnique({
      where: { id }
    });

    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    // Get technician skills
    const skills = await prisma.technicianSkill.findMany({
      where: { technicianId: id }
    });

    // Get service categories from skills
    const categories = skills.map(skill => skill.category);

    // Calculate stats
    const stats = {
      totalJobs: technician.totalJobs || 0,
      rating: technician.rating || 0,
      acceptanceRate: technician.acceptanceRate || 0,
      ontimeRate: technician.ontimeRate || 0,
      responseTime: technician.avgResponseTime || 0,
      completionRate: technician.totalJobs > 0
        ? Math.round((technician.totalJobs / (technician.totalJobs + (technician.complaints || 0))) * 100)
        : 100
    };

    // Mock reviews (in production, fetch from database)
    const reviews = [
      {
        id: 1,
        userName: '김**',
        rating: 5,
        comment: '정말 친절하시고 꼼꼼하게 작업해주셨어요. 다음에도 꼭 부르고 싶습니다!',
        serviceName: '수도 배관 누수 수리',
        date: '2026-02-10',
        images: []
      },
      {
        id: 2,
        userName: '이**',
        rating: 5,
        comment: '시간 약속도 잘 지키시고, 작업 속도도 빨라서 만족스러웠습니다.',
        serviceName: '싱크대 배수구 교체',
        date: '2026-02-05',
        images: []
      },
      {
        id: 3,
        userName: '박**',
        rating: 4,
        comment: '전문적으로 잘 고쳐주셨어요. 가격도 합리적이었습니다.',
        serviceName: '화장실 수전 교체',
        date: '2026-01-28',
        images: []
      }
    ];

    // Mock certifications
    const certifications = [
      { name: '배관기능사', issuer: '한국산업인력공단', year: 2018 },
      { name: '위생사', issuer: '한국산업인력공단', year: 2019 }
    ];

    res.json({
      success: true,
      data: {
        id: technician.id,
        name: technician.name,
        phone: technician.phone,
        profileImage: technician.profileImage || '/default-profile.png',
        yearsOfExperience: Math.floor((Date.now() - new Date(technician.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365)),
        bio: technician.bio || `${stats.totalJobs}건 이상의 수리 경험을 가진 전문 기사입니다.`,
        categories: categories,
        stats: stats,
        reviews: reviews,
        certifications: certifications,
        isAvailable: technician.currentStatus === 'AVAILABLE',
        currentLocation: technician.currentLocation
      }
    });
  } catch (error) {
    console.error('Get technician profile error:', error);
    res.status(500).json({ error: 'Failed to get technician profile' });
  }
};

// Get all technicians
exports.getAllTechnicians = async (req, res) => {
  try {
    const { category, available } = req.query;

    let whereClause = {};

    if (available === 'true') {
      whereClause.currentStatus = 'AVAILABLE';
    }

    const technicians = await prisma.technician.findMany({
      where: whereClause
    });

    // Filter by category if provided
    let filteredTechnicians = technicians;
    if (category) {
      const techniciansWithCategory = [];
      for (const tech of technicians) {
        const skills = await prisma.technicianSkill.findMany({
          where: {
            technicianId: tech.id,
            category: category
          }
        });
        if (skills.length > 0) {
          techniciansWithCategory.push(tech);
        }
      }
      filteredTechnicians = techniciansWithCategory;
    }

    const technicianList = filteredTechnicians.map(tech => ({
      id: tech.id,
      name: tech.name,
      profileImage: tech.profileImage || '/default-profile.png',
      rating: tech.rating || 0,
      totalJobs: tech.totalJobs || 0,
      acceptanceRate: tech.acceptanceRate || 0,
      isAvailable: tech.currentStatus === 'AVAILABLE',
      currentLocation: tech.currentLocation
    }));

    res.json({
      success: true,
      data: {
        technicians: technicianList,
        total: technicianList.length
      }
    });
  } catch (error) {
    console.error('Get technicians error:', error);
    res.status(500).json({ error: 'Failed to get technicians' });
  }
};
