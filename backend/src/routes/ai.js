const express = require('express');
const router = express.Router();
const { analyzeEstimate } = require('../controllers/aiController');

router.post('/estimate', analyzeEstimate);

module.exports = router;
