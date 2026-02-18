const express = require('express');
const router = express.Router();
const { supportChat } = require('../controllers/supportController');

// Public endpoint - no auth required so users can ask before signing up
router.post('/chat', supportChat);

module.exports = router;
