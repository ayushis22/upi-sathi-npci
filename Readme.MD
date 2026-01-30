# UPI Accessibility Platform - Complete Hackathon Solution

## 🎯 Problem Statement
Design assistive and accessibility-focused solutions that make UPI-based digital payments safer, more inclusive, and usable for diverse users, especially those with disabilities.

## ✨ Key Features Implemented

### 1. Accessibility-Focused Interaction Mechanisms
- **Voice Navigation**: Full voice-guided interface with Web Speech API
- **Screen Reader Optimization**: ARIA labels and semantic HTML
- **High Contrast Mode**: Toggle between normal and high contrast themes
- **Large Touch Targets**: Minimum 44x44px touch targets for motor impairments
- **Keyboard Navigation**: Complete keyboard accessibility
- **Multi-modal Feedback**: Visual, audio, and haptic feedback

### 2. Intent Verification & Safe Transaction Confirmation
- **Multi-step Confirmation**: Visual + Voice confirmation required
- **Transaction Preview**: Clear review before confirmation
- **Cooling Period**: 5-second confirmation delay for safety
- **Trusted Contacts**: Whitelist frequently used contacts
- **Amount Verification**: Voice readback of transaction details

### 3. Error Detection, Prevention & Recovery
- **Real-time Validation**: Input validation with helpful error messages
- **Auto-correction Suggestions**: Smart suggestions for common errors
- **Undo Mechanism**: 30-second grace period to cancel transactions
- **Error Recovery Flows**: Step-by-step guided error resolution
- **Plain Language Errors**: No technical jargon in error messages

### 4. Secure & Accessible Authentication
- **Biometric Authentication**: Fingerprint and Face ID support
- **Voice PIN**: Audio-based PIN entry option
- **Pattern Lock**: Visual pattern with haptic feedback
- **Adaptive Timeouts**: Configurable session timeouts
- **Multi-factor Options**: Choose your preferred auth method

### 5. Fraud Awareness & Prevention
- **Real-time Fraud Detection**: ML-based suspicious pattern detection
- **Transaction Alerts**: Immediate notifications for all transactions
- **Spending Limits**: Configurable daily/per-transaction limits
- **Trusted Device Management**: Device fingerprinting
- **Educational Prompts**: Contextual fraud awareness tips
- **Emergency Freeze**: One-tap account freeze option

## 🏗️ Architecture

```
Frontend (React)
├── Accessibility Layer (WCAG 2.1 AAA compliant)
├── Voice Interface (Web Speech API)
├── UI Components (High contrast, Large targets)
└── State Management (React Context)

Backend (Node.js + Express)
├── Authentication Service (JWT, Biometric)
├── Transaction Service (UPI simulation)
├── Fraud Detection Service (Pattern analysis)
├── Accessibility Service (Voice, TTS)
└── Database (MongoDB)
```

## 📋 Prerequisites

- Node.js 16+ and npm
- MongoDB (local or cloud)
- Modern browser (Chrome/Firefox recommended)
- Microphone access (for voice features)

## 🚀 Quick Start (5 Minutes)

### Step 1: Clone and Install

```bash
# Navigate to project directory
cd upi-saathi-app

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Environment Configuration

**Backend (.env file):**
```bash
cd backend
cp .env.example .env
# Edit .env with your settings (or use defaults for demo)
```

**Frontend (.env file):**
```bash
cd frontend
cp .env.example .env
# Edit .env with your settings (or use defaults)
```

### Step 3: Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud) - update connection string in backend/.env
```

### Step 4: Run the Application

```bash
# Terminal 1 - Start Backend (from backend directory)
cd backend
npm run dev

# Terminal 2 - Start Frontend (from frontend directory)
cd frontend
npm start
```

Application will open at: **http://localhost:3000**

## 📁 Project Structure

```
upi-accessibility-app/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   ├── errorHandler.js       # Error handling
│   │   └── fraudDetection.js     # Fraud detection middleware
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Transaction.js        # Transaction schema
│   │   └── TrustedContact.js     # Trusted contacts schema
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── transactions.js       # Transaction routes
│   │   ├── accessibility.js      # Accessibility features routes
│   │   └── fraud.js              # Fraud detection routes
│   ├── services/
│   │   ├── fraudDetection.js     # Fraud detection logic
│   │   ├── voiceService.js       # Voice processing
│   │   └── notificationService.js # Notification service
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Entry point
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── AccessibilityControls.js
│   │   │   ├── VoiceInterface.js
│   │   │   ├── TransactionForm.js
│   │   │   ├── TransactionConfirmation.js
│   │   │   ├── BiometricAuth.js
│   │   │   ├── FraudAlert.js
│   │   │   ├── ErrorRecovery.js
│   │   │   └── Dashboard.js
│   │   ├── contexts/
│   │   │   ├── AccessibilityContext.js
│   │   │   ├── AuthContext.js
│   │   │   └── TransactionContext.js
│   │   ├── hooks/
│   │   │   ├── useVoice.js
│   │   │   ├── useBiometric.js
│   │   │   └── useAccessibility.js
│   │   ├── utils/
│   │   │   ├── voiceCommands.js
│   │   │   ├── validation.js
│   │   │   └── accessibility.js
│   │   ├── styles/
│   │   │   ├── accessibility.css
│   │   │   └── highContrast.css
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
├── README.md
└── DEPLOYMENT.md
```

## 🎮 Demo Credentials

```
User 1 (Visually Impaired Profile):
Email: demo@accessible-upi.com
Password: Demo@123
Features: Voice navigation, Screen reader optimized

User 2 (Motor Impaired Profile):
Email: motor@accessible-upi.com
Password: Demo@123
Features: Large buttons, Voice PIN
```

## 🧪 Testing Accessibility Features

### Voice Commands (Say these commands):
- "Show balance"
- "Send money"
- "Show recent transactions"
- "Enable high contrast"
- "Read transaction details"

### Keyboard Navigation:
- `Tab` - Navigate between elements
- `Enter` - Activate buttons
- `Esc` - Cancel/Go back
- `Arrow Keys` - Navigate lists

### Screen Reader Testing:
- Enable NVDA (Windows) or VoiceOver (Mac)
- Navigate through the application
- All elements should be properly announced

## 🔒 Security Features

1. **JWT Authentication**: Secure token-based auth
2. **Rate Limiting**: Prevents brute force attacks
3. **Input Sanitization**: XSS and injection prevention
4. **HTTPS Only**: Enforced in production
5. **CORS Configuration**: Restricted origins
6. **Transaction Encryption**: End-to-end encryption
7. **Audit Logging**: All transactions logged

## 📊 Fraud Detection Algorithms

The system uses multiple signals:
- Transaction velocity (frequency & amount)
- Unusual time patterns
- New device detection
- Location anomalies
- Beneficiary risk scoring
- User behavior patterns

## ♿ Accessibility Compliance

- **WCAG 2.1 Level AAA**: Full compliance
- **ARIA Labels**: All interactive elements
- **Color Contrast**: 7:1 minimum ratio
- **Text Scaling**: Supports up to 200%
- **Focus Indicators**: Clear and visible
- **Error Identification**: Multiple modalities

## 🎨 Customization Options

Users can customize:
- Font size (Small, Medium, Large, Extra Large)
- Color theme (Normal, High Contrast, Dark)
- Voice speed and pitch
- Haptic feedback intensity
- Animation speed
- Confirmation delays

## 📱 Browser Compatibility

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

Note: Voice features require microphone permissions.

## 🐛 Troubleshooting

### Voice not working?
- Check microphone permissions
- Ensure using HTTPS (required for Web Speech API)
- Try Chrome (best support)

### MongoDB connection error?
- Verify MongoDB is running: `mongod`
- Check connection string in backend/.env
- Ensure port 27017 is not blocked

### Frontend won't start?
- Clear node_modules: `rm -rf node_modules && npm install`
- Check port 3000 is available
- Verify REACT_APP_API_URL in .env

## 📈 Performance Optimization

- Code splitting for faster load times
- Lazy loading of components
- Service worker for offline support
- Optimized images and assets
- Memoization of expensive computations

## 🏆 Hackathon Presentation Tips

1. **Start with the problem**: Show real user pain points
2. **Demo the voice interface**: Most impressive feature
3. **Show fraud detection**: Real-time alerts in action
4. **Highlight accessibility**: Screen reader + keyboard nav
5. **Discuss impact**: Potential users and social benefit

## 📝 Future Enhancements

- [ ] Regional language support (Hindi, Tamil, etc.)
- [ ] Offline transaction queuing
- [ ] AI-powered voice assistant
- [ ] Integration with real UPI APIs
- [ ] Mobile app (React Native)
- [ ] Blockchain-based audit trail
- [ ] Advanced ML fraud models
- [ ] Accessibility analytics dashboard

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

## 📄 License

MIT License - feel free to use for learning and hackathons

## 👥 Team

Built with ❤️ for making digital payments accessible to everyone.

---

**Need Help?** Check DEPLOYMENT.md for production deployment instructions.

**Good luck with your hackathon! 🚀**