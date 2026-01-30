# Complete Setup & Deployment Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### Step 2: Environment Setup

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Use the defaults or customize
```

**Frontend (.env):**
```bash
cd frontend
cp .env.example .env
# Use the defaults or customize
```

### Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
sudo systemctl start mongod
# OR
mongod
```

**Option B: MongoDB Atlas (Cloud - Recommended for Hackathon)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update backend/.env: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/upi-accessibility`

### Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Access:** http://localhost:3000

---

## 📱 Demo Accounts

Create these test accounts or use the registration:

```
Account 1 (Visually Impaired User):
Email: visually@test.com
Password: Test@123

Account 2 (Motor Impaired User):  
Email: motor@test.com
Password: Test@123

Account 3 (Elderly User):
Email: elderly@test.com  
Password: Test@123
```

---

## 🎯 Testing Key Features

### 1. Voice Navigation
1. Enable voice navigation in settings
2. Say: "Show balance"
3. Say: "Send money"
4. Say: "Show transactions"

### 2. High Contrast Mode
1. Go to settings
2. Toggle "High Contrast Mode"
3. Interface changes to high contrast theme

### 3. Transaction with Fraud Detection
1. Send ₹51,000 to new recipient
2. System flags as high-risk
3. Additional confirmation required

### 4. Transaction Cancellation
1. Start a transaction
2. Click "Cancel" within 30 seconds
3. Transaction cancelled successfully

### 5. Screen Reader
1. Enable screen reader (NVDA/VoiceOver)
2. Navigate with Tab key
3. All elements properly announced

---

## 🏗️ Project Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend (React)               │
│  ┌──────────────────────────────────────────┐  │
│  │  Accessibility Layer                     │  │
│  │  - Voice Interface (Web Speech API)      │  │
│  │  - Screen Reader Support (ARIA)          │  │
│  │  - High Contrast Mode                    │  │
│  │  - Keyboard Navigation                   │  │
│  └──────────────────────────────────────────┘  │
│                      ↓                          │
│  ┌──────────────────────────────────────────┐  │
│  │  UI Components                           │  │
│  │  - Dashboard                             │  │
│  │  - Transaction Form                      │  │
│  │  - Confirmation Flow                     │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                       ↓ HTTP/REST API
┌─────────────────────────────────────────────────┐
│              Backend (Node.js + Express)        │
│  ┌──────────────────────────────────────────┐  │
│  │  API Routes                              │  │
│  │  - Auth (/api/auth)                      │  │
│  │  - Transactions (/api/transactions)      │  │
│  │  - Accessibility (/api/accessibility)    │  │
│  │  - Fraud (/api/fraud)                    │  │
│  └──────────────────────────────────────────┘  │
│                      ↓                          │
│  ┌──────────────────────────────────────────┐  │
│  │  Middleware                              │  │
│  │  - JWT Authentication                    │  │
│  │  - Fraud Detection (ML)                  │  │
│  │  - Error Handling                        │  │
│  └──────────────────────────────────────────┘  │
│                      ↓                          │
│  ┌──────────────────────────────────────────┐  │
│  │  MongoDB Database                        │  │
│  │  - Users Collection                      │  │
│  │  - Transactions Collection               │  │
│  │  - Trusted Contacts Collection           │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 🔧 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/accessibility-settings` - Update accessibility preferences
- `POST /api/auth/freeze-account` - Emergency freeze

### Transactions
- `POST /api/transactions/send` - Initiate transaction
- `POST /api/transactions/:id/confirm` - Confirm transaction
- `POST /api/transactions/:id/cancel` - Cancel transaction
- `GET /api/transactions` - Get transaction history
- `GET /api/transactions/stats/summary` - Get statistics

### Accessibility
- `POST /api/accessibility/text-to-speech` - TTS conversion
- `POST /api/accessibility/voice-command` - Process voice command
- `GET /api/accessibility/voice-prompts` - Get voice prompts
- `POST /api/accessibility/error-assistance` - Error recovery help

### Fraud Detection
- `GET /api/fraud/stats` - Get fraud statistics
- `GET /api/fraud/alerts` - Get active alerts
- `GET /api/fraud/education` - Fraud awareness content
- `POST /api/fraud/report` - Report suspicious activity

---

## 🎨 Accessibility Features Implementation

### 1. Voice Navigation (Web Speech API)
```javascript
// Frontend: src/hooks/useVoice.js
const recognition = new window.webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false;
recognition.lang = 'en-IN';

recognition.onresult = (event) => {
  const command = event.results[0][0].transcript;
  handleVoiceCommand(command);
};
```

### 2. Screen Reader Support
```javascript
// All interactive elements have:
aria-label="Description"
aria-describedby="help-text"
aria-live="polite"
role="button|alert|status"
```

### 3. High Contrast Mode
```css
.high-contrast {
  background: #000;
  color: #FFFF00;
  border: 2px solid #FFFF00;
}
```

### 4. Keyboard Navigation
- Tab - Next element
- Shift+Tab - Previous element  
- Enter - Activate
- Escape - Cancel

---

## 🛡️ Fraud Detection Algorithm

### Risk Score Calculation

```javascript
riskScore = 0

// 1. Velocity Check (30 points)
if (transactions_in_30min >= 5) riskScore += 30

// 2. Amount Check (25 points)  
if (amount >= 50000) riskScore += 25
if (amount > avg_transaction * 3) riskScore += 20

// 3. New Recipient (15 points)
if (first_time_recipient && amount > 10000) riskScore += 15

// 4. Time-based (10 points)
if (hour >= 23 || hour <= 5) riskScore += 10

// 5. Daily Limit (20 points)
if (today_total + amount > daily_limit) riskScore += 20

// 6. User History (variable)
riskScore += user_fraud_score * 0.2

// Flag if score >= 70
if (riskScore >= 70) FLAG_TRANSACTION
```

---

## 📊 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  phoneNumber: String,
  upiId: String (unique),
  balance: Number,
  accessibilitySettings: {
    enableVoiceNavigation: Boolean,
    enableScreenReader: Boolean,
    highContrastMode: Boolean,
    fontSize: String,
    voiceSpeed: Number,
    hapticFeedback: Boolean,
    confirmationDelay: Number
  },
  disabilityProfile: {
    hasVisualImpairment: Boolean,
    hasMotorImpairment: Boolean,
    hasCognitiveImpairment: Boolean
  },
  securitySettings: {
    transactionLimit: Number,
    dailyLimit: Number,
    trustedDevices: Array
  },
  fraudScore: Number,
  accountStatus: String
}
```

### Transactions Collection
```javascript
{
  transactionId: String (unique),
  sender: ObjectId (ref: User),
  senderUpiId: String,
  recipient: {
    upiId: String,
    name: String
  },
  amount: Number,
  description: String,
  status: String,
  confirmationSteps: {
    voiceConfirmed: Boolean,
    visualConfirmed: Boolean,
    biometricConfirmed: Boolean
  },
  fraudAnalysis: {
    riskScore: Number,
    flagged: Boolean,
    flagReason: String
  },
  cancellable: Boolean,
  accessibilityMetadata: {
    usedVoiceNavigation: Boolean,
    confirmationMethod: String
  }
}
```

---

## 🎬 Hackathon Presentation Script

### 1. Problem Statement (2 min)
- Show statistics on digital exclusion
- Demonstrate pain points with current UPI apps
- Highlight vulnerable user groups

### 2. Solution Demo (5 min)

**Demo Flow:**
1. **Voice Navigation**
   - "Show balance" → Balance displayed
   - "Send money" → Opens send money form
   
2. **Accessibility Features**
   - Toggle high contrast mode
   - Demonstrate screen reader
   - Show large button sizes
   
3. **Safe Transaction**
   - Fill transaction details
   - Multi-step confirmation
   - Voice readback of amount
   - 5-second cooling period
   
4. **Fraud Detection**
   - Attempt large transaction
   - Show risk score calculation
   - Display fraud alert
   
5. **Error Recovery**
   - Trigger validation error
   - Show plain language message
   - Demonstrate quick fix

### 3. Technical Architecture (2 min)
- Show system diagram
- Explain fraud detection algorithm
- Highlight scalability

### 4. Impact & Future (1 min)
- Potential user base
- Social impact
- Future enhancements

---

## 🐛 Troubleshooting Guide

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check port
netstat -an | grep 27017

# Solution: Start MongoDB
sudo systemctl start mongod
```

### Voice Not Working
- Enable microphone permissions
- Use HTTPS or localhost
- Try Chrome browser (best support)

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000  
lsof -ti:3000 | xargs kill -9
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🚀 Production Deployment

### Option 1: Heroku (Recommended for Hackathons)

**Backend:**
```bash
cd backend
heroku create upi-accessibility-api
heroku addons:create mongolab
git push heroku main
```

**Frontend:**
```bash
cd frontend
# Update REACT_APP_API_URL in .env
npm run build
# Deploy to Netlify/Vercel
```

### Option 2: AWS/Digital Ocean
- Deploy backend on EC2/Droplet
- MongoDB on Atlas
- Frontend on S3 + CloudFront

### Option 3: Docker (All-in-One)
```bash
docker-compose up
```

---

## 📈 Performance Optimization

1. **Frontend**
   - Code splitting with React.lazy
   - Image optimization
   - Service worker for offline support

2. **Backend**
   - Redis caching for frequently accessed data
   - Database indexing
   - Connection pooling

3. **Database**
   - Index on frequently queried fields
   - Aggregation pipeline optimization

---

## ✅ Pre-Presentation Checklist

- [ ] MongoDB running and accessible
- [ ] Backend server running (port 5000)
- [ ] Frontend running (port 3000)
- [ ] Demo accounts created
- [ ] Voice permissions enabled
- [ ] High contrast mode tested
- [ ] Screen reader tested (optional)
- [ ] Sample transactions created
- [ ] Fraud detection tested
- [ ] Presentation slides ready
- [ ] Backup demo video (just in case)

---

## 🏆 Winning Strategies

1. **Focus on Impact**
   - Emphasize social good
   - Show real user personas
   - Demonstrate accessibility gains

2. **Technical Excellence**
   - Clean, well-documented code
   - Proper error handling
   - Scalable architecture

3. **Innovation**
   - Voice-based UPI (novel)
   - ML fraud detection
   - Multi-modal confirmations

4. **Completeness**
   - Full working prototype
   - All features implemented
   - Professional UI/UX

---

## 📞 Support & Resources

- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- MongoDB Docs: https://docs.mongodb.com/
- React Docs: https://react.dev/

---

**Good Luck with Your Hackathon! 🎉**

Remember: The goal is to make digital payments accessible to everyone. Your solution can change lives!