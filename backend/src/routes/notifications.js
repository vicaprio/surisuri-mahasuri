const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// SSE stream endpoint
router.get('/stream', authenticate, notificationController.streamNotifications);

// Get notification history
router.get('/', authenticate, notificationController.getNotifications);

// Mark notification as read
router.patch('/:id/read', authenticate, notificationController.markAsRead);

// Mark all notifications as read
router.post('/read-all', authenticate, notificationController.markAllAsRead);

module.exports = router;
