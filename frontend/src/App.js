// import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { ScreenReaderProvider } from './contexts/ScreenReaderContext';
// Contexts
import { AuthProvider, useAuth } from './contexts/AllContexts';
import { AccessibilityProvider } from './contexts/AllContexts';
import { TransactionProvider } from './contexts/AllContexts';


import AppRoutes from './AppRoutes'; 

// Components
// import Login from './components/Login';
// import Register from './components/Register';
// import Dashboard from './components/Dashboard';
// import SendMoney from './components/SendMoney';
// import Transactions from './components/Transactions';
// import Settings from './components/Settings';
// import FraudAlerts from './components/FraudAlerts';

// Styles
import './styles/accessibility.css';


function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <div className="spinner" aria-label="Loading"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AccessibilityProvider>
          <TransactionProvider>
            <AppRoutes />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              role="alert"
              aria-live="assertive"
            />
          </TransactionProvider>
        </AccessibilityProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;