const prisma = require('../utils/db');
const crypto = require('crypto');

// Create payment
exports.createPayment = async (req, res) => {
  try {
    const { serviceRequestId, amount, method } = req.body;
    const userId = req.user.id;

    // Validate service request
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId }
    });

    if (!serviceRequest) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    if (serviceRequest.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Generate payment ID
    const paymentId = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create payment record (in production, store in database)
    const payment = {
      id: paymentId,
      orderId: orderId,
      serviceRequestId: serviceRequestId,
      userId: userId,
      amount: amount,
      method: method || 'CARD',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    // In production, integrate with actual payment gateway (Toss Payments, etc.)
    // For now, return mock payment data

    res.json({
      success: true,
      data: {
        payment: payment,
        checkoutUrl: `/payment/checkout?orderId=${orderId}&amount=${amount}`,
      }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

// Confirm payment (webhook/callback from payment gateway)
exports.confirmPayment = async (req, res) => {
  try {
    const { orderId, paymentKey, amount } = req.body;

    // In production, verify payment with payment gateway
    // For now, simulate successful payment

    // Update service request payment status
    // await prisma.serviceRequest.update({
    //   where: { id: serviceRequestId },
    //   data: { paymentStatus: 'PAID' }
    // });

    res.json({
      success: true,
      data: {
        orderId: orderId,
        paymentKey: paymentKey,
        status: 'COMPLETED',
        amount: amount,
        paidAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

// Get payment details
exports.getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // In production, fetch from database
    // For now, return mock data
    const payment = {
      id: id,
      orderId: `ORD${id}`,
      amount: 65000,
      method: 'CARD',
      status: 'COMPLETED',
      paidAt: new Date().toISOString(),
      cardInfo: {
        company: '신한카드',
        number: '1234-****-****-5678',
        installment: '일시불'
      }
    };

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Failed to get payment' });
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    // In production, fetch from database
    // For now, return mock data
    const payments = [
      {
        id: 'PAY001',
        orderId: 'ORD001',
        serviceName: '싱크대 배수구 누수 수리',
        amount: 65000,
        method: 'CARD',
        status: 'COMPLETED',
        paidAt: '2026-02-10T10:30:00Z'
      },
      {
        id: 'PAY002',
        orderId: 'ORD002',
        serviceName: '거실 조명 교체',
        amount: 45000,
        method: 'TRANSFER',
        status: 'COMPLETED',
        paidAt: '2026-01-28T14:20:00Z'
      }
    ];

    res.json({
      success: true,
      data: {
        payments: payments,
        total: payments.length
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
};

// Cancel payment (refund)
exports.cancelPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    // In production, process refund with payment gateway
    // For now, return success

    res.json({
      success: true,
      data: {
        paymentId: id,
        status: 'CANCELLED',
        cancelledAt: new Date().toISOString(),
        reason: reason
      }
    });
  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({ error: 'Failed to cancel payment' });
  }
};
