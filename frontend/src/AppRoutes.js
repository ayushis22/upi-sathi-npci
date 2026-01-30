import React, { useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAccessibility, useAuth } from './contexts/AllContexts';
import VoiceInterface from './components/VoiceInterface';

import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import SendMoney from './components/SendMoney';
import Transactions from './components/Transactions';
import Settings from './components/Settings';
import FraudAlerts from './components/FraudAlerts';
import TrustedContacts from './components/TrustedContacts';
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

const AppRoutes = () => {
  const navigate = useNavigate(); // ✅ NOW SAFE
  const location = useLocation();
  const { speak, settings } = useAccessibility();
  const { user, logout } = useAuth();
  const lastRouteRef = useRef('');

  useEffect(() => {
    if (!settings.enableVoiceNavigation) return;
    if (lastRouteRef.current === location.pathname) return;
    lastRouteRef.current = location.pathname;
    speak('Say help to hear available voice commands.');
  }, [location.pathname, settings.enableVoiceNavigation, speak]);

  return (
    <>
      {/* 🎤 GLOBAL VOICE LISTENER */}
      {settings.enableVoiceNavigation && (
        <VoiceInterface
          onAction={(command) => {
            console.log('🎯 Voice Action:', command);

            if (command.action === 'NAVIGATE') {
              speak('Navigating');
              navigate(command.target);
            }

            if (command.action === 'SHOW_BALANCE') {
              if (user?.balance != null) {
                speak(`Your current balance is Rupees ${user.balance}`);
              }
            }

            if (command.action === 'VOICE_SEND_DRAFT') {
              const { recipientUpiId, amount } = command;
              navigate('/send-money', {
                state: {
                  recipientUpiId,
                  amount,
                  viaVoice: true
                }
              });
            }

            if (command.action === 'BACK') {
              navigate(-1);
            }

            if (command.action === 'LOGOUT') {
              speak('Logging you out.');
              logout();
              navigate('/login');
            }

            if (command.action === 'HELP') {
              speak('You can say: send money, show balance, show transactions, settings, fraud alerts, trusted contacts, go back, or logout.');
            }
          }}
        />
      )}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/send-money"
          element={
            <PrivateRoute>
              <SendMoney />
            </PrivateRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <Transactions />
            </PrivateRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />

        <Route
          path="/fraud-alerts"
          element={
            <PrivateRoute>
              <FraudAlerts />
            </PrivateRoute>
          }
        />
        <Route
          path="/trusted-contacts"
          element={
            <PrivateRoute>
              <TrustedContacts />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
