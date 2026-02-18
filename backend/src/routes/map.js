const express = require('express');
const router  = express.Router();
const { getMapJobs, updateTechnicianLocation } = require('../controllers/mapController');
const { authenticate, requireTechnician }       = require('../middleware/auth');

// 주변 일감 조회 (기사님 전용)
router.get('/jobs', authenticate, requireTechnician, getMapJobs);

// 기사님 현재 위치 갱신
router.patch('/location', authenticate, requireTechnician, updateTechnicianLocation);

module.exports = router;
