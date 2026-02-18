const crypto = require('crypto');
const prisma = require('../utils/prisma');

exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, error: '메시지를 불러오지 못했습니다.' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, senderType, senderName } = req.body;

    if (!content || !senderType || !senderName) {
      return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
    }

    const message = await prisma.message.create({
      data: {
        id: crypto.randomUUID(),
        roomId,
        senderType,
        senderName,
        content,
      },
    });

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, error: '메시지 전송에 실패했습니다.' });
  }
};
