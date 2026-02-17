const express = require('express');
const router = express.Router();
const oauthController = require('../controllers/oauthController');

// OAuth routes
router.post('/kakao', oauthController.kakaoAuth);
router.post('/naver', oauthController.naverAuth);
router.post('/google', oauthController.googleAuth);

module.exports = router;
