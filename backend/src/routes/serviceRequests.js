const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');
const { authenticate, requireUser, requireTechnician } = require('../middleware/auth');

// User routes
router.post(
  '/',
  authenticate,
  requireUser,
  serviceRequestController.createServiceRequest
);

router.get(
  '/',
  authenticate,
  requireUser,
  serviceRequestController.getServiceRequests
);

router.get(
  '/:id',
  authenticate,
  requireUser,
  serviceRequestController.getServiceRequestById
);

router.post(
  '/:id/cancel',
  authenticate,
  requireUser,
  serviceRequestController.cancelServiceRequest
);

// Technician routes
router.post(
  '/:id/complete',
  authenticate,
  requireTechnician,
  serviceRequestController.completeServiceRequest
);

module.exports = router;
