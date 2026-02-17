const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// User routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Technician routes
router.post('/technician/register', authController.registerTechnician);
router.post('/technician/login', authController.loginTechnician);

module.exports = router;
