const express = require('express');
const router = express.Router();
const matchingService = require('../services/matchingService');
const { authenticate } = require('../middleware/auth');

// 자동 매칭 시작 (고객)
router.post('/auto-match', authenticate, async (req, res) => {
  try {
    const { serviceRequestId } = req.body;

    if (!serviceRequestId) {
      return res.status(400).json({ error: 'Service request ID is required' });
    }

    const result = await matchingService.startAutoMatch(serviceRequestId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Auto match error:', error);
    res.status(500).json({ error: error.message || 'Failed to start matching' });
  }
});

// 매칭 상태 조회 (고객)
router.get('/service-request/:serviceRequestId', authenticate, async (req, res) => {
  try {
    const { serviceRequestId } = req.params;

    const status = await matchingService.getMatchStatus(serviceRequestId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Get match status error:', error);
    res.status(500).json({ error: error.message || 'Failed to get match status' });
  }
});

// 매칭 수락 (기사님)
router.post('/:matchId/accept', authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;
    const technicianId = req.user.technicianId || req.user.id;

    const result = await matchingService.acceptMatch(matchId, technicianId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Accept match error:', error);
    res.status(500).json({ error: error.message || 'Failed to accept match' });
  }
});

// 매칭 거절 (기사님)
router.post('/:matchId/reject', authenticate, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { reason } = req.body;
    const technicianId = req.user.technicianId || req.user.id;

    const result = await matchingService.rejectMatch(matchId, technicianId, reason);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Reject match error:', error);
    res.status(500).json({ error: error.message || 'Failed to reject match' });
  }
});

// 기사님 대기중인 매칭 조회
router.get('/technician/pending', authenticate, async (req, res) => {
  try {
    const technicianId = req.user.technicianId || req.user.id;

    const matches = await matchingService.getPendingMatchesForTechnician(technicianId);

    res.json({
      success: true,
      data: matches
    });
  } catch (error) {
    console.error('Get pending matches error:', error);
    res.status(500).json({ error: error.message || 'Failed to get pending matches' });
  }
});

module.exports = router;
