const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

// Create review
router.post('/', authenticate, reviewController.createReview);

// Get review by service request
router.get('/service-request/:serviceRequestId', reviewController.getReviewByServiceRequest);

// Get reviews for technician
router.get('/technician/:technicianId', reviewController.getReviewsByTechnician);

// Get review statistics
router.get('/technician/:technicianId/statistics', reviewController.getReviewStatistics);

// Mark review as helpful
router.post('/:id/helpful', authenticate, reviewController.markHelpful);

module.exports = router;
