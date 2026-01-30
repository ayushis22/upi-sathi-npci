const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const TrustedContact = require('../models/TrustedContact');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { detectFraud } = require('../middleware/fraudDetection');
const mongoose = require('mongoose');
/**
 * @route   POST /api/transactions/send
 * @desc    Send money via UPI
 * @access  Private
 */
router.post('/send', protect, detectFraud, async (req, res) => {
  // const session = await mongoose.startSession();   
  // session.startTransaction();
  try {
    const { recipientUpiId, amount, description, confirmationMethod } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }

    // Check if amount exceeds transaction limit
    if (amount > req.user.securitySettings.transactionLimit) {
      return res.status(400).json({
        success: false,
        message: `Amount exceeds your transaction limit of ₹${req.user.securitySettings.transactionLimit}`
      });
    }

    // Check balance
    if (amount > req.user.balance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Get recipient name (in production, this would be from UPI API)
    const recipientName = recipientUpiId.split('@')[0];
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    // Create transaction
    const transaction = await Transaction.create({
      transactionId,
      sender: req.user._id,
      senderUpiId: req.user.upiId,
      recipient: {
        upiId: recipientUpiId,
        name: recipientName
      },
      amount,
      description,
      status: req.fraudAnalysis.flagged ? 'flagged' : 'pending',
      fraudAnalysis: {
        ...req.fraudAnalysis,
        deviceFingerprint: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress
      },
      accessibilityMetadata: {
        usedVoiceNavigation: req.body.usedVoiceNavigation || false,
        usedScreenReader: req.body.usedScreenReader || false,
        confirmationMethod
      }
    });

    // If flagged, don't process immediately
    if (req.fraudAnalysis.flagged) {
      return res.json({
        success: true,
        flagged: true,
        message: 'Transaction flagged for security review',
        data: transaction,
        fraudAnalysis: req.fraudAnalysis
      });
    }

    res.status(201).json({
      success: true,
      message: 'Transaction initiated successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Send money error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing transaction'
    });
  }
});

/**
 * @route   POST /api/transactions/:id/confirm
 * @desc    Confirm transaction after review
 * @access  Private
 */
router.post('/:id/confirm', protect, async (req, res) => {
  try {
    const { voiceConfirmed, visualConfirmed, biometricConfirmed } = req.body;
    
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      sender: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status !== 'pending' && transaction.status !== 'flagged') {
      return res.status(400).json({
        success: false,
        message: 'Transaction cannot be confirmed in current status'
      });
    }

    // Update confirmation steps
    transaction.confirmationSteps = {
      voiceConfirmed: voiceConfirmed || false,
      visualConfirmed: visualConfirmed || false,
      biometricConfirmed: biometricConfirmed || false,
      confirmationTimestamp: new Date()
    };

    // Process transaction
    transaction.status = 'processing';
    await transaction.save();

    // Update balances (in production, this would be handled by UPI backend)
    req.user.balance -= transaction.amount;
    await req.user.save();

    // Mark as completed
    transaction.status = 'completed';
    transaction.completedAt = new Date();
    transaction.cancellable = false;
    await transaction.save();

    // Update trusted contact if exists
    await TrustedContact.findOneAndUpdate(
      {
        user: req.user._id,
        contactUpiId: transaction.recipient.upiId
      },
      {
        $inc: { 
          transactionCount: 1,
          totalAmountTransferred: transaction.amount
        },
        lastTransactionDate: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Transaction completed successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Confirm transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming transaction'
    });
  }
});

/**
 * @route   POST /api/transactions/:id/cancel
 * @desc    Cancel a pending transaction
 * @access  Private
 */
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      sender: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (!transaction.cancellable) {
      return res.status(400).json({
        success: false,
        message: 'Transaction cannot be cancelled'
      });
    }

    // Check if within cancellation window (30 seconds)
    const elapsedTime = (Date.now() - transaction.createdAt.getTime()) / 1000;
    if (elapsedTime > 30) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation window expired'
      });
    }

    transaction.status = 'cancelled';
    transaction.cancellable = false;
    transaction.cancelledAt = new Date();
    transaction.cancellationReason = reason || 'User cancelled';
    await transaction.save();

    res.json({
      success: true,
      message: 'Transaction cancelled successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Cancel transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling transaction'
    });
  }
});

/**
 * @route   GET /api/transactions
 * @desc    Get user's transactions
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;

    const query = { sender: req.user._id };
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions'
    });
  }
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Get transaction details
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      sender: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction'
    });
  }
});

/**
 * @route   GET /api/transactions/stats/summary
 * @desc    Get transaction statistics
 * @access  Private
 */
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Total transactions
    const totalTransactions = await Transaction.countDocuments({
      sender: userId,
      status: 'completed'
    });

    // Total amount sent
    const totalAmount = await Transaction.aggregate([
      { $match: { sender: userId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // This month's transactions
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyTransactions = await Transaction.countDocuments({
      sender: userId,
      status: 'completed',
      createdAt: { $gte: thisMonth }
    });

    const monthlyAmount = await Transaction.aggregate([
      { 
        $match: { 
          sender: userId, 
          status: 'completed',
          createdAt: { $gte: thisMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalTransactions,
        totalAmountSent: totalAmount[0]?.total || 0,
        monthlyTransactions,
        monthlyAmountSent: monthlyAmount[0]?.total || 0,
        balance: req.user.balance
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

/**
 * @route   POST /api/transactions/trusted-contacts
 * @desc    Add trusted contact
 * @access  Private
 */
router.post('/trusted-contacts', protect, async (req, res) => {
  try {
    const { contactUpiId, contactName, relationship, nickname } = req.body;

    // Check if already exists
    const existing = await TrustedContact.findOne({
      user: req.user._id,
      contactUpiId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Contact already in trusted list'
      });
    }

    const trustedContact = await TrustedContact.create({
      user: req.user._id,
      contactUpiId,
      contactName,
      relationship,
      nickname
    });

    res.status(201).json({
      success: true,
      message: 'Contact added to trusted list',
      data: trustedContact
    });
  } catch (error) {
    console.error('Add trusted contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding trusted contact'
    });
  }
});

/**
 * @route   GET /api/transactions/trusted-contacts
 * @desc    Get trusted contacts
 * @access  Private
 */
router.get('/trusted-contacts/list', protect, async (req, res) => {
  try {
    const contacts = await TrustedContact.find({ user: req.user._id })
      .sort({ transactionCount: -1 });

    res.json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('Get trusted contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trusted contacts'
    });
  }
});

module.exports = router;