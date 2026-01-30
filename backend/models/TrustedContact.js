const mongoose = require('mongoose');

const trustedContactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactUpiId: {
    type: String,
    required: true
  },
  contactName: {
    type: String,
    required: true
  },
  nickname: {
    type: String
  },
  relationship: {
    type: String,
    enum: ['family', 'friend', 'business', 'service', 'other'],
    default: 'other'
  },
  transactionCount: {
    type: Number,
    default: 0
  },
  totalAmountTransferred: {
    type: Number,
    default: 0
  },
  lastTransactionDate: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationMethod: {
    type: String,
    enum: ['phone', 'email', 'manual', 'none'],
    default: 'none'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure unique contacts per user
trustedContactSchema.index({ user: 1, contactUpiId: 1 }, { unique: true });

module.exports = mongoose.model('TrustedContact', trustedContactSchema);