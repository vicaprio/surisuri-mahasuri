const prisma = require('../utils/db');

// Create review
exports.createReview = async (req, res) => {
  try {
    const {
      serviceRequestId,
      rating,
      serviceQuality,
      technicianRating,
      cleanliness,
      punctuality,
      comment,
      photoUrls
    } = req.body;
    const userId = req.user.id;

    // Validate service request
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId }
    });

    if (!serviceRequest) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    if (serviceRequest.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if review already exists
    // In production, check database for existing review

    // Validate ratings (1-5)
    const ratings = { rating, serviceQuality, technicianRating, cleanliness, punctuality };
    for (const [key, value] of Object.entries(ratings)) {
      if (value < 1 || value > 5) {
        return res.status(400).json({ error: `${key} must be between 1 and 5` });
      }
    }

    // Validate photos (at least 1 required)
    if (!photoUrls || photoUrls.length === 0) {
      return res.status(400).json({ error: 'At least one photo is required' });
    }

    // Create review (in production, save to database)
    const review = {
      id: `REV${Date.now()}`,
      serviceRequestId,
      userId,
      rating,
      serviceQuality,
      technicianRating,
      cleanliness,
      punctuality,
      comment,
      photoUrls,
      createdAt: new Date().toISOString(),
      helpful: 0,
      verified: true
    };

    // Update technician rating (in production)
    // Calculate average and update technician profile

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Get reviews for service request
exports.getReviewByServiceRequest = async (req, res) => {
  try {
    const { serviceRequestId } = req.params;

    // In production, fetch from database
    const review = {
      id: 'REV001',
      serviceRequestId,
      userName: '김**',
      rating: 5,
      serviceQuality: 5,
      technicianRating: 5,
      cleanliness: 5,
      punctuality: 4,
      comment: '정말 친절하시고 꼼꼼하게 작업해주셨어요. 다음에도 꼭 부르고 싶습니다!',
      photoUrls: ['/uploads/review1.jpg', '/uploads/review2.jpg'],
      createdAt: '2026-02-10T10:30:00Z',
      helpful: 12,
      verified: true
    };

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ error: 'Failed to get review' });
  }
};

// Get reviews for technician
exports.getReviewsByTechnician = async (req, res) => {
  try {
    const { technicianId } = req.params;
    const { limit = 20, offset = 0, minRating, sortBy = 'recent' } = req.query;

    // In production, fetch from database with filters
    const reviews = [
      {
        id: 'REV001',
        userName: '김**',
        rating: 5,
        serviceQuality: 5,
        technicianRating: 5,
        cleanliness: 5,
        punctuality: 5,
        comment: '정말 친절하시고 꼼꼼하게 작업해주셨어요. 다음에도 꼭 부르고 싶습니다!',
        serviceName: '싱크대 배수구 누수 수리',
        photoUrls: ['/uploads/review1.jpg', '/uploads/review2.jpg'],
        createdAt: '2026-02-10T10:30:00Z',
        helpful: 12,
        verified: true
      },
      {
        id: 'REV002',
        userName: '이**',
        rating: 5,
        serviceQuality: 5,
        technicianRating: 5,
        cleanliness: 4,
        punctuality: 5,
        comment: '시간 약속도 잘 지키시고, 작업 속도도 빨라서 만족스러웠습니다.',
        serviceName: '화장실 수전 교체',
        photoUrls: ['/uploads/review3.jpg'],
        createdAt: '2026-02-05T14:20:00Z',
        helpful: 8,
        verified: true
      },
      {
        id: 'REV003',
        userName: '박**',
        rating: 4,
        serviceQuality: 4,
        technicianRating: 4,
        cleanliness: 5,
        punctuality: 3,
        comment: '전문적으로 잘 고쳐주셨어요. 가격도 합리적이었습니다. 약간 늦게 도착하신 점만 아쉬웠습니다.',
        serviceName: '세면대 배수구 교체',
        photoUrls: ['/uploads/review4.jpg', '/uploads/review5.jpg'],
        createdAt: '2026-01-28T09:15:00Z',
        helpful: 5,
        verified: true
      }
    ];

    // Apply filters
    let filteredReviews = reviews;
    if (minRating) {
      filteredReviews = filteredReviews.filter(r => r.rating >= parseInt(minRating));
    }

    // Sort
    if (sortBy === 'helpful') {
      filteredReviews.sort((a, b) => b.helpful - a.helpful);
    } else if (sortBy === 'rating') {
      filteredReviews.sort((a, b) => b.rating - a.rating);
    }

    // Calculate statistics
    const totalReviews = filteredReviews.length;
    const avgRating = filteredReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    const avgServiceQuality = filteredReviews.reduce((sum, r) => sum + r.serviceQuality, 0) / totalReviews;
    const avgTechnicianRating = filteredReviews.reduce((sum, r) => sum + r.technicianRating, 0) / totalReviews;
    const avgCleanliness = filteredReviews.reduce((sum, r) => sum + r.cleanliness, 0) / totalReviews;
    const avgPunctuality = filteredReviews.reduce((sum, r) => sum + r.punctuality, 0) / totalReviews;

    // Rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: filteredReviews.filter(r => Math.round(r.rating) === star).length,
      percentage: (filteredReviews.filter(r => Math.round(r.rating) === star).length / totalReviews * 100).toFixed(1)
    }));

    res.json({
      success: true,
      data: {
        reviews: filteredReviews.slice(parseInt(offset), parseInt(offset) + parseInt(limit)),
        total: totalReviews,
        statistics: {
          avgRating: avgRating.toFixed(1),
          avgServiceQuality: avgServiceQuality.toFixed(1),
          avgTechnicianRating: avgTechnicianRating.toFixed(1),
          avgCleanliness: avgCleanliness.toFixed(1),
          avgPunctuality: avgPunctuality.toFixed(1),
          ratingDistribution
        }
      }
    });
  } catch (error) {
    console.error('Get technician reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    // In production, update database

    res.json({
      success: true,
      message: 'Review marked as helpful'
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ error: 'Failed to mark review as helpful' });
  }
};

// Get review statistics
exports.getReviewStatistics = async (req, res) => {
  try {
    const { technicianId } = req.params;

    // In production, calculate from database
    const stats = {
      totalReviews: 127,
      avgRating: 4.8,
      avgServiceQuality: 4.9,
      avgTechnicianRating: 4.8,
      avgCleanliness: 4.7,
      avgPunctuality: 4.6,
      ratingDistribution: [
        { star: 5, count: 98, percentage: 77.2 },
        { star: 4, count: 23, percentage: 18.1 },
        { star: 3, count: 4, percentage: 3.1 },
        { star: 2, count: 1, percentage: 0.8 },
        { star: 1, count: 1, percentage: 0.8 }
      ],
      photoReviewPercentage: 89.5,
      verifiedPurchasePercentage: 100
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get review statistics error:', error);
    res.status(500).json({ error: 'Failed to get review statistics' });
  }
};
