const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

// Create payment
router.post('/', authenticate, paymentController.createPayment);

// Confirm payment (webhook/callback)
router.post('/confirm', paymentController.confirmPayment);

// Get payment details
router.get('/:id', authenticate, paymentController.getPayment);

// Get payment history
router.get('/', authenticate, paymentController.getPaymentHistory);

// Cancel payment (refund)
router.post('/:id/cancel', authenticate, paymentController.cancelPayment);

module.exports = router;
