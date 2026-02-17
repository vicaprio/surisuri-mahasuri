const express = require('express');
const router = express.Router();
const technicianController = require('../controllers/technicianController');
const { authenticate } = require('../middleware/auth');

// Get all technicians (with optional filters)
router.get('/', technicianController.getAllTechnicians);

// Get specific technician profile
router.get('/:id', technicianController.getTechnicianProfile);

module.exports = router;
