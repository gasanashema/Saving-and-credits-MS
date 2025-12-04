const express = require('express');
const router = express.Router();
const conn = require('../db/connection');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Store pending payments in memory (in production, use Redis or database)
const pendingPayments = new Map();

// Fake MTN Mobile Money payment endpoint
router.post('/mtn-payment', async (req, res) => {
  try {
    const { loanId, amount, phone } = req.body;
    const token = req.headers.authorization;
    
    console.log('Payment request received:', { loanId, amount, phone });
    console.log('Authorization header:', token);
    
    let userId = 1; // default fallback
    
    if (token && token.startsWith('Bearer ')) {
      try {
        const tokenString = token.substring(7);
        console.log('Extracted token:', tokenString.substring(0, 20) + '...');
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
        userId = decoded.id;
        console.log('User ID from token:', userId);
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError.message);
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid or expired token',
          error: jwtError.message 
        });
      }
    } else {
      console.log('No valid authorization token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'Authorization token required' 
      });
    }
    
    const transactionId = 'MTN' + Date.now() + Math.floor(Math.random() * 1000);
    
    // Store payment as pending
    pendingPayments.set(transactionId, {
      loanId,
      amount,
      phone,
      userId,
      status: 'pending',
      timestamp: Date.now()
    });
    
    // Simulate payment processing delay
    setTimeout(async () => {
      try {
        // Record the payment
        await conn.query(
          "INSERT INTO `loanpayment`(`loanId`, `amount`, `recorderID`, `status`) VALUES(?,?,?,?)",
          [loanId, amount, userId, 'success']
        );

        // Update loan status
        const [loan] = await conn.query(
          "SELECT * FROM loan WHERE `loanId`=?",
          [loanId]
        );
        
        if (loan.length > 0) {
          const newPaidAmount = Number(amount) + Number(loan[0].payedAmount || 0);
          const loanStatus = loan[0].amountTopay <= newPaidAmount ? "paid" : "active";
          
          await conn.query(
            "UPDATE `loan` SET `payedAmount`=?, status=? WHERE `loanId`=?",
            [newPaidAmount, loanStatus, loanId]
          );
        }
        
        // Update payment status
        const payment = pendingPayments.get(transactionId);
        if (payment) {
          payment.status = 'completed';
          pendingPayments.set(transactionId, payment);
        }
        
        console.log('Fake MTN payment processed successfully:', transactionId);
      } catch (error) {
        console.error('Payment processing error:', error);
        const payment = pendingPayments.get(transactionId);
        if (payment) {
          payment.status = 'failed';
          pendingPayments.set(transactionId, payment);
        }
      }
    }, 3000); // 3 second delay to simulate processing
    
    res.json({ 
      success: true, 
      message: 'Payment request sent to your phone. Please enter your MTN Mobile Money PIN to complete the transaction.',
      transactionId
    });
    
  } catch (error) {
    console.error('MTN Payment Error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token',
        error: error.message 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired',
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Payment failed',
      error: error.message 
    });
  }
});

// Check payment status endpoint
router.get('/status/:transactionId', (req, res) => {
  const { transactionId } = req.params;
  const payment = pendingPayments.get(transactionId);
  
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Transaction not found' });
  }
  
  res.json({ 
    success: true, 
    status: payment.status,
    transactionId
  });
});

// Test endpoint to verify payment route is working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Payment route is working' });
});

module.exports = router;