const prisma = require('../utils/db');

// In-memory notification store (in production, use Redis or database)
const notificationConnections = new Map();
const notificationQueues = new Map();

// SSE endpoint for real-time notifications
exports.streamNotifications = (req, res) => {
  const userId = req.user.id;

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for nginx

  // Send initial connection message
  res.write('data: {"type":"connected","message":"알림 연결 성공"}\n\n');

  // Store connection
  notificationConnections.set(userId, res);

  // Send any queued notifications
  const queue = notificationQueues.get(userId) || [];
  queue.forEach(notification => {
    res.write(`data: ${JSON.stringify(notification)}\n\n`);
  });
  notificationQueues.set(userId, []);

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  // Clean up on close
  req.on('close', () => {
    clearInterval(heartbeat);
    notificationConnections.delete(userId);
    console.log(`SSE connection closed for user ${userId}`);
  });
};

// Send notification to user
exports.sendNotification = (userId, notification) => {
  const connection = notificationConnections.get(userId);

  if (connection) {
    // User is connected, send immediately
    try {
      connection.write(`data: ${JSON.stringify(notification)}\n\n`);
    } catch (error) {
      console.error('Failed to send notification:', error);
      notificationConnections.delete(userId);
    }
  } else {
    // User not connected, queue notification
    const queue = notificationQueues.get(userId) || [];
    queue.push(notification);
    // Keep only last 10 notifications
    if (queue.length > 10) {
      queue.shift();
    }
    notificationQueues.set(userId, queue);
  }
};

// Get notification history
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    // In production, fetch from database
    // For now, return mock notifications
    const mockNotifications = [
      {
        id: '1',
        type: 'SERVICE_ASSIGNED',
        title: '기사님 배정 완료',
        message: '김기사님이 배정되었습니다. 2시간 이내 도착 예정입니다.',
        data: { requestId: '123', technicianId: '456' },
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'SERVICE_STARTED',
        title: '작업 시작',
        message: '기사님이 작업을 시작했습니다.',
        data: { requestId: '123' },
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        type: 'SERVICE_COMPLETED',
        title: '작업 완료',
        message: '작업이 완료되었습니다. 보증서가 발급되었습니다.',
        data: { requestId: '122', warrantyId: '789' },
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    res.json({
      success: true,
      data: {
        notifications: mockNotifications,
        total: mockNotifications.length,
        unreadCount: mockNotifications.filter(n => !n.read).length
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // In production, update database
    // For now, just return success

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    // In production, update database
    // For now, just return success

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

module.exports = {
  streamNotifications: exports.streamNotifications,
  sendNotification: exports.sendNotification,
  getNotifications: exports.getNotifications,
  markAsRead: exports.markAsRead,
  markAllAsRead: exports.markAllAsRead
};
