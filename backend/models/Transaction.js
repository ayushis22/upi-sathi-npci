const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderUpiId: {
    type: String,
    required: true
  },
  recipient: {
    upiId: {
      type: String,
      required: true
    },
    name: {
      type: String
    }
  },
  amount: {
    type: Number,
    required: [true, 'Please provide transaction amount'],
    min: [1, 'Amount must be at least 1 rupee']
  },
  description: {
    type: String,
    maxlength: 200
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'flagged'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['send', 'receive', 'request'],
    default: 'send'
  },
  
  // Confirmation tracking
  confirmationSteps: {
    voiceConfirmed: {
      type: Boolean,
      default: false
    },
    visualConfirmed: {
      type: Boolean,
      default: false
    },
    biometricConfirmed: {
      type: Boolean,
      default: false
    },
    confirmationTimestamp: {
      type: Date
    }
  },
  
  // Fraud detection
  fraudAnalysis: {
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    flagged: {
      type: Boolean,
      default: false
    },
    flagReason: {
      type: String
    },
    deviceFingerprint: {
      type: String
    },
    ipAddress: {
      type: String
    },
    location: {
      type: String
    },
    isNewRecipient: {
      type: Boolean,
      default: false
    },
    velocityCheck: {
      recentTransactionCount: {
        type: Number,
        default: 0
      },
      timeWindow: {
        type: String
      }
    }
  },
  
  // Cancellation tracking
  cancellable: {
    type: Boolean,
    default: true
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  },
  
  // Accessibility metadata
  accessibilityMetadata: {
    usedVoiceNavigation: {
      type: Boolean,
      default: false
    },
    usedScreenReader: {
      type: Boolean,
      default: false
    },
    confirmationMethod: {
      type: String,
      enum: ['voice', 'touch', 'keyboard', 'biometric']
    }
  },
  
  // Error tracking
  errors: [{
    errorType: String,
    errorMessage: String,
    timestamp: Date,
    resolved: Boolean
  }],
  
  completedAt: {
    type: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate unique transaction ID
transactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Index for quick queries
transactionSchema.index({ sender: 1, createdAt: -1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);