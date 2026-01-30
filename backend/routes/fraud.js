const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getFraudStats } = require('../middleware/fraudDetection');

/**
 * @route   GET /api/fraud/stats
 * @desc    Get fraud statistics and risk score
 * @access  Private
 */
router.get('/stats', protect, getFraudStats);

/**
 * @route   GET /api/fraud/alerts
 * @desc    Get fraud alerts and warnings
 * @access  Private
 */
router.get('/alerts', protect, async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    
    // Get recent flagged transactions
    const flaggedTransactions = await Transaction.find({
      sender: req.user._id,
      'fraudAnalysis.flagged': true,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    })
    .sort({ createdAt: -1 })
    .select('transactionId amount recipient.upiId fraudAnalysis.riskScore fraudAnalysis.flagReason createdAt status');

    // Generate alerts
    const alerts = [];

    if (req.user.fraudScore > 70) {
      alerts.push({
        type: 'high_risk',
        severity: 'critical',
        title: 'High Risk Activity Detected',
        message: 'Your account shows unusual activity patterns. Please review recent transactions.',
        action: 'Review transactions',
        timestamp: new Date()
      });
    }

    if (flaggedTransactions.length > 0) {
      alerts.push({
        type: 'flagged_transactions',
        severity: 'warning',
        title: `${flaggedTransactions.length} Transaction(s) Flagged`,
        message: 'Some transactions were flagged for security review.',
        action: 'View details',
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        alerts,
        flaggedTransactions,
        currentRiskScore: req.user.fraudScore
      }
    });
  } catch (error) {
    console.error('Get fraud alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fraud alerts'
    });
  }
});

/**
 * @route   GET /api/fraud/education
 * @desc    Get fraud awareness education content
 * @access  Private
 */
router.get('/education', protect, async (req, res) => {
  try {
    const educationContent = {
      tips: [
        {
          title: 'Verify Recipient Details',
          description: 'Always double-check the UPI ID before sending money. One wrong character can send money to the wrong person.',
          icon: '🔍',
          importance: 'critical'
        },
        {
          title: 'Beware of Phishing',
          description: 'Never share your UPI PIN, OTP, or password with anyone. Banks never ask for these details.',
          icon: '🎣',
          importance: 'critical'
        },
        {
          title: 'Use Trusted Contacts',
          description: 'Add frequently used contacts to your trusted list for quicker and safer transactions.',
          icon: '👥',
          importance: 'moderate'
        },
        {
          title: 'Set Transaction Limits',
          description: 'Configure daily and per-transaction limits to protect yourself from large unauthorized transactions.',
          icon: '💰',
          importance: 'moderate'
        },
        {
          title: 'Enable Notifications',
          description: 'Keep transaction alerts enabled to monitor all account activity in real-time.',
          icon: '🔔',
          importance: 'moderate'
        },
        {
          title: 'Review Regularly',
          description: 'Check your transaction history regularly to spot any unauthorized activity early.',
          icon: '📊',
          importance: 'moderate'
        }
      ],
      commonScams: [
        {
          type: 'Fake Payment Requests',
          description: 'Scammers pose as merchants or service providers and send fake payment requests.',
          howToAvoid: 'Always verify payment requests through official channels before paying.'
        },
        {
          type: 'Refund Scams',
          description: 'Fraudsters claim you need to refund money by entering your UPI PIN.',
          howToAvoid: 'You never need to enter PIN to receive money. Only to send.'
        },
        {
          type: 'Prize/Lottery Scams',
          description: 'Messages claiming you won a prize and need to pay taxes or fees via UPI.',
          howToAvoid: 'Legitimate prizes never require upfront payment.'
        },
        {
          type: 'Wrong Transfer Scams',
          description: 'Someone claims they sent money to your account by mistake and asks for refund.',
          howToAvoid: 'Check your actual transaction history. Scammers often send fake screenshots.'
        }
      ],
      securityChecklist: [
        { item: 'Never share UPI PIN with anyone', done: false },
        { item: 'Enable biometric authentication', done: req.user.accessibilitySettings.enableBiometric },
        { item: 'Set transaction limits', done: req.user.securitySettings.transactionLimit < 50000 },
        { item: 'Add trusted contacts', done: false }, // Would check in production
        { item: 'Enable transaction alerts', done: true },
        { item: 'Review transactions weekly', done: false }
      ]
    };

    res.json({
      success: true,
      data: educationContent
    });
  } catch (error) {
    console.error('Get fraud education error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fraud education content'
    });
  }
});

/**
 * @route   POST /api/fraud/report
 * @desc    Report suspicious activity
 * @access  Private
 */
router.post('/report', protect, async (req, res) => {
  try {
    const { transactionId, reason, description } = req.body;

    // In production, this would create a fraud report in a separate collection
    // and notify security team

    console.log('Fraud reported:', {
      userId: req.user._id,
      transactionId,
      reason,
      description,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Thank you for reporting. Our security team will investigate.',
      data: {
        reportId: `REP${Date.now()}`,
        status: 'under_review'
      }
    });
  } catch (error) {
    console.error('Report fraud error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting fraud report'
    });
  }
});

module.exports = router;