const express = require('express');
const router = express.Router();
const warrantyController = require('../controllers/warrantyController');
const { authenticate } = require('../middleware/auth');

// Get warranty details (JSON)
router.get('/:serviceRequestId', authenticate, warrantyController.getWarranty);

// Download warranty PDF
router.get('/:serviceRequestId/pdf', authenticate, warrantyController.generateWarrantyPDF);

module.exports = router;
