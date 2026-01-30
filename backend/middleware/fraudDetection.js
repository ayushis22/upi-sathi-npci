const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Fraud detection thresholds
const FRAUD_THRESHOLDS = {
  VELOCITY_LIMIT: parseInt(process.env.FRAUD_VELOCITY_THRESHOLD) || 5, // transactions
  TIME_WINDOW: parseInt(process.env.FRAUD_TIME_WINDOW_MINUTES) || 30, // minutes
  AMOUNT_THRESHOLD: parseInt(process.env.FRAUD_AMOUNT_THRESHOLD) || 50000, // INR
  RISK_SCORE_THRESHOLD: 70, // out of 100
  NEW_RECIPIENT_THRESHOLD: 10000 // INR for first-time recipients
};

/**
 * Middleware to detect fraudulent transaction patterns
 */
exports.detectFraud = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { amount, recipientUpiId } = req.body;
    
    let riskScore = 0;
    let flagReason = [];

    // 1. Velocity Check - Multiple transactions in short time
    const timeWindow = new Date(Date.now() - FRAUD_THRESHOLDS.TIME_WINDOW * 60 * 1000);
    const recentTransactions = await Transaction.countDocuments({
      sender: userId,
      createdAt: { $gte: timeWindow },
      status: { $in: ['completed', 'pending', 'processing'] }
    });

    if (recentTransactions >= FRAUD_THRESHOLDS.VELOCITY_LIMIT) {
      riskScore += 30;
      flagReason.push(`High velocity: ${recentTransactions} transactions in ${FRAUD_THRESHOLDS.TIME_WINDOW} minutes`);
    }

    // 2. Amount Check - Large or unusual amount
    if (amount >= FRAUD_THRESHOLDS.AMOUNT_THRESHOLD) {
      riskScore += 25;
      flagReason.push(`Large amount: ₹${amount}`);
    }

    // Check against user's transaction history
    const avgTransaction = await Transaction.aggregate([
      { 
        $match: { 
          sender: userId, 
          status: 'completed' 
        } 
      },
      { 
        $group: { 
          _id: null, 
          avg: { $avg: '$amount' },
          max: { $max: '$amount' }
        } 
      }
    ]);

    if (avgTransaction.length > 0) {
      const avg = avgTransaction[0].avg;
      const max = avgTransaction[0].max;
      
      // Amount is 3x average or exceeds previous max significantly
      if (amount > avg * 3 || amount > max * 1.5) {
        riskScore += 20;
        flagReason.push('Amount significantly higher than usual pattern');
      }
    }

    // 3. New Recipient Check
    const previousTransactions = await Transaction.countDocuments({
      sender: userId,
      'recipient.upiId': recipientUpiId,
      status: 'completed'
    });

    const isNewRecipient = previousTransactions === 0;
    req.isNewRecipient = isNewRecipient;

    if (isNewRecipient && amount > FRAUD_THRESHOLDS.NEW_RECIPIENT_THRESHOLD) {
      riskScore += 15;
      flagReason.push(`First transaction to new recipient with amount ₹${amount}`);
    }

    // 4. Time-based Check - Unusual hour transactions
    const currentHour = new Date().getHours();
    if (currentHour >= 23 || currentHour <= 5) {
      riskScore += 10;
      flagReason.push('Transaction at unusual hour');
    }

    // 5. Daily Limit Check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = await Transaction.aggregate([
      {
        $match: {
          sender: userId,
          createdAt: { $gte: today },
          status: { $in: ['completed', 'pending', 'processing'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const todayTotal = todayTransactions.length > 0 ? todayTransactions[0].total : 0;
    const dailyLimit = req.user.securitySettings.dailyLimit;

    if (todayTotal + amount > dailyLimit) {
      riskScore += 20;
      flagReason.push(`Exceeds daily limit: ₹${todayTotal + amount} > ₹${dailyLimit}`);
    }

    // 6. User's fraud score
    if (req.user.fraudScore > 50) {
      riskScore += req.user.fraudScore * 0.2;
      flagReason.push(`User has elevated fraud score: ${req.user.fraudScore}`);
    }

    // Attach fraud analysis to request
    req.fraudAnalysis = {
      riskScore: Math.min(riskScore, 100),
      flagged: riskScore >= FRAUD_THRESHOLDS.RISK_SCORE_THRESHOLD,
      flagReason: flagReason.join('; '),
      isNewRecipient,
      recentTransactionCount: recentTransactions,
      timeWindow: `${FRAUD_THRESHOLDS.TIME_WINDOW} minutes`
    };

    // If high risk, require additional verification
    if (req.fraudAnalysis.flagged) {
      // Update user's fraud score
      req.user.fraudScore = Math.min(req.user.fraudScore + 10, 100);
      await req.user.save();

      // For demo purposes, we'll allow but flag the transaction
      // In production, you might block or require additional verification
      console.warn(`⚠️ High-risk transaction detected for user ${userId}:`, req.fraudAnalysis);
    }

    next();
  } catch (error) {
    console.error('Fraud detection error:', error);
    // Don't block transaction on fraud detection errors
    req.fraudAnalysis = {
      riskScore: 0,
      flagged: false,
      flagReason: 'Fraud detection unavailable'
    };
    next();
  }
};

/**
 * Get fraud statistics for a user
 */
exports.getFraudStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get flagged transactions
    const flaggedTransactions = await Transaction.find({
      sender: userId,
      'fraudAnalysis.flagged': true
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('transactionId amount recipient.upiId fraudAnalysis.riskScore fraudAnalysis.flagReason createdAt status');

    // Get fraud score history
    const fraudScore = req.user.fraudScore;

    // Calculate risk level
    let riskLevel = 'Low';
    if (fraudScore > 70) riskLevel = 'High';
    else if (fraudScore > 40) riskLevel = 'Medium';

    res.json({
      success: true,
      data: {
        currentFraudScore: fraudScore,
        riskLevel,
        flaggedTransactionsCount: flaggedTransactions.length,
        recentFlaggedTransactions: flaggedTransactions,
        recommendations: generateSecurityRecommendations(fraudScore, flaggedTransactions)
      }
    });
  } catch (error) {
    console.error('Get fraud stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fraud statistics'
    });
  }
};

/**
 * Generate security recommendations based on fraud score
 */
function generateSecurityRecommendations(fraudScore, flaggedTransactions) {
  const recommendations = [];

  if (fraudScore > 50) {
    recommendations.push('Your account shows unusual activity. Consider reviewing recent transactions.');
  }

  if (flaggedTransactions.length > 0) {
    recommendations.push('Some of your transactions were flagged. Enable biometric authentication for added security.');
  }

  if (fraudScore < 30 && flaggedTransactions.length === 0) {
    recommendations.push('Your account security is excellent! Keep following safe transaction practices.');
  } else {
    recommendations.push('Enable transaction alerts to stay informed of all account activity.');
    recommendations.push('Add trusted contacts to whitelist frequent recipients.');
    recommendations.push('Set conservative transaction limits for additional protection.');
  }

  return recommendations;
}

module.exports = exports;