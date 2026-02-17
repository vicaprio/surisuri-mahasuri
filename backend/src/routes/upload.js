const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');

// Upload single image
router.post('/single', authenticate, upload.single('image'), uploadController.uploadSingle);

// Upload multiple images (max 5)
router.post('/multiple', authenticate, upload.array('images', 5), uploadController.uploadMultiple);

module.exports = router;
