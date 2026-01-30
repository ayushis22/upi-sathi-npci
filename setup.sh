#!/bin/bash

# ============================================
# COMPLETE UPI ACCESSIBILITY APP SETUP SCRIPT
# ============================================

echo "🚀 Setting up UPI Accessibility Platform..."
echo "============================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Navigate to project root
cd "$(dirname "$0")"

# ============================================
# STEP 1: Check Prerequisites
# ============================================
echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16+${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version) found${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version) found${NC}"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    echo -e "${RED}⚠️  MongoDB not found locally. You'll need MongoDB Atlas or install MongoDB${NC}"
    echo -e "${BLUE}   Get MongoDB Atlas: https://www.mongodb.com/cloud/atlas${NC}"
else
    echo -e "${GREEN}✅ MongoDB found${NC}"
fi

# ============================================
# STEP 2: Create missing files
# ============================================
echo -e "\n${BLUE}Step 2: Creating missing project files...${NC}"

# Create frontend index.js
cat > frontend/src/index.js << 'INDEXJS'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
INDEXJS

# Create index.css
cat > frontend/src/index.css << 'INDEXCSS'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 16px;
  line-height: 1.5;
}

button {
  font-family: inherit;
}
INDEXCSS

# Create public/index.html
mkdir -p frontend/public
cat > frontend/public/index.html << 'INDEXHTML'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#000000" />
  <meta name="description" content="Accessible UPI Payment Platform" />
  <title>Accessible UPI</title>
</head>
<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
</body>
</html>
INDEXHTML

# Create accessibility CSS
cat > frontend/src/styles/accessibility.css << 'ACCESSCSS'
/* High Contrast Mode */
.high-contrast {
  background: #000 !important;
  color: #FFFF00 !important;
}

.high-contrast button,
.high-contrast input,
.high-contrast .card {
  background: #000 !important;
  color: #FFFF00 !important;
  border: 2px solid #FFFF00 !important;
}

.high-contrast button:hover {
  background: #333 !important;
}

/* Font Sizes */
.font-small { font-size: 14px; }
.font-medium { font-size: 16px; }
.font-large { font-size: 20px; }
.font-extra-large { font-size: 24px; }

/* Touch Targets (Minimum 44x44px) */
button, input, a {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}

/* Focus Indicators */
*:focus {
  outline: 3px solid #0066CC;
  outline-offset: 2px;
}

/* Loading Spinner */
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 20px;
}
ACCESSCSS

echo -e "${GREEN}✅ Project files created${NC}"

# ============================================
# STEP 3: Install Dependencies
# ============================================
echo -e "\n${BLUE}Step 3: Installing dependencies...${NC}"

# Backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd backend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Backend installation failed${NC}"
    exit 1
fi

# Frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd ../frontend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Frontend installation failed${NC}"
    exit 1
fi

cd ..

# ============================================
# STEP 4: Environment Setup
# ============================================
echo -e "\n${BLUE}Step 4: Setting up environment variables...${NC}"

# Backend .env
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Backend .env created${NC}"
else
    echo -e "${BLUE}⚠️  Backend .env already exists${NC}"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✅ Frontend .env created${NC}"
else
    echo -e "${BLUE}⚠️  Frontend .env already exists${NC}"
fi

# ============================================
# STEP 5: MongoDB Check
# ============================================
echo -e "\n${BLUE}Step 5: Checking MongoDB...${NC}"

if command -v mongod &> /dev/null; then
    # Try to start MongoDB
    if pgrep -x "mongod" > /dev/null; then
        echo -e "${GREEN}✅ MongoDB is already running${NC}"
    else
        echo -e "${BLUE}Starting MongoDB...${NC}"
        mongod --fork --logpath /tmp/mongodb.log --dbpath /tmp/mongodb-data 2>/dev/null || {
            echo -e "${RED}⚠️  Could not start MongoDB automatically${NC}"
            echo -e "${BLUE}   Please start MongoDB manually: mongod${NC}"
        }
    fi
else
    echo -e "${RED}⚠️  MongoDB not found locally${NC}"
    echo -e "${BLUE}   Option 1: Install MongoDB locally${NC}"
    echo -e "${BLUE}   Option 2: Use MongoDB Atlas (cloud)${NC}"
    echo -e "${BLUE}   Get Atlas: https://www.mongodb.com/cloud/atlas${NC}"
    echo ""
    echo -e "${BLUE}   To use Atlas, update backend/.env with your connection string:${NC}"
    echo -e "${BLUE}   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/upi${NC}"
fi

# ============================================
# STEP 6: Create Start Scripts
# ============================================
echo -e "\n${BLUE}Step 6: Creating start scripts...${NC}"

# Create start script for backend
cat > start-backend.sh << 'BACKENDSH'
#!/bin/bash
echo "🚀 Starting Backend Server..."
cd backend
npm run dev
BACKENDSH
chmod +x start-backend.sh

# Create start script for frontend
cat > start-frontend.sh << 'FRONTENDSH'
#!/bin/bash
echo "🚀 Starting Frontend Server..."
cd frontend
npm start
FRONTENDSH
chmod +x start-frontend.sh

# Create combined start script
cat > start-all.sh << 'ALLSH'
#!/bin/bash
echo "🚀 Starting UPI Accessibility Platform..."
echo "========================================="

# Start backend in background
./start-backend.sh &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
./start-frontend.sh &
FRONTEND_PID=$!

echo ""
echo "✅ Application started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "📱 Access the app at: http://localhost:3000"
echo "📡 API available at: http://localhost:5000/api"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
ALLSH
chmod +x start-all.sh

echo -e "${GREEN}✅ Start scripts created${NC}"

# ============================================
# COMPLETION
# ============================================
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo -e "1️⃣  Start the application:"
echo -e "   ${GREEN}./start-all.sh${NC}  (starts both backend and frontend)"
echo ""
echo -e "   Or start separately:"
echo -e "   ${GREEN}./start-backend.sh${NC}  (Terminal 1)"
echo -e "   ${GREEN}./start-frontend.sh${NC}  (Terminal 2)"
echo ""
echo -e "2️⃣  Access the application:"
echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:5000/api${NC}"
echo ""
echo -e "3️⃣  Create a test account or use demo credentials"
echo ""
echo -e "4️⃣  Read ${GREEN}README.md${NC} for features and ${GREEN}DEPLOYMENT.md${NC} for detailed guide"
echo ""
echo -e "${BLUE}For Hackathon Presentation:${NC}"
echo -e "   - Test voice commands: 'Show balance', 'Send money'"
echo -e "   - Toggle high contrast mode"
echo -e "   - Demonstrate fraud detection"
echo -e "   - Show transaction cancellation"
echo ""
echo -e "${GREEN}Good luck with your hackathon! 🏆${NC}"
echo ""