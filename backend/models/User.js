const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide a phone number'],
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  upiId: {
    type: String,
    unique: true,
    required: true
  },
  balance: {
    type: Number,
    default: 10000 // Demo balance
  },
  
  // Accessibility preferences
  accessibilitySettings: {
    enableVoiceNavigation: {
      type: Boolean,
      default: false
    },
    enableScreenReader: {
      type: Boolean,
      default: false
    },
    highContrastMode: {
      type: Boolean,
      default: false
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'extra-large'],
      default: 'medium'
    },
    voiceSpeed: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 2.0
    },
    hapticFeedback: {
      type: Boolean,
      default: true
    },
    confirmationDelay: {
      type: Number,
      default: 5, // seconds
      min: 0,
      max: 30
    },
    enableBiometric: {
      type: Boolean,
      default: false
    }
  },
  
  // Disability profile
  disabilityProfile: {
    hasVisualImpairment: {
      type: Boolean,
      default: false
    },
    hasMotorImpairment: {
      type: Boolean,
      default: false
    },
    hasCognitiveImpairment: {
      type: Boolean,
      default: false
    },
    hasSpeechImpairment: {
      type: Boolean,
      default: false
    }
  },
  
  // Security settings
  securitySettings: {
    transactionLimit: {
      type: Number,
      default: 10000 // per transaction
    },
    dailyLimit: {
      type: Number,
      default: 50000
    },
    requireBiometric: {
      type: Boolean,
      default: false
    },
    trustedDevices: [{
      deviceId: String,
      deviceName: String,
      addedAt: Date
    }]
  },
  
  // Fraud tracking
  fraudScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  accountStatus: {
    type: String,
    enum: ['active', 'frozen', 'suspended'],
    default: 'active'
  },
  
  lastLogin: {
    type: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);