// ============================================
// ALL REACT CONTEXTS IN ONE FILE
// ============================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { notifySuccess } from '../utils/notification';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ============================================
// AUTH CONTEXT
// ============================================

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on mount
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return; 
    } 
    loadUser();
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data.data);
    } catch (error) {
      // console.error('Load user error:', error);
      // logout();
      console.error('Load user error:', error);

      if (error.response?.status === 401) {
        logout(); // token invalid
      } else {
        toast.error('Unable to load user profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      toast.success('Logged in successfully!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateAccessibilitySettings = async (settings) => {
    try {
      await axios.put(`${API_URL}/auth/accessibility-settings`, {
        accessibilitySettings: settings
      });
      await loadUser();
      toast.success('Settings updated successfully');
      return true;
    } catch (error) {
      toast.error('Failed to update settings');
      return false;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateAccessibilitySettings,
    loadUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================
// ACCESSIBILITY CONTEXT
// ============================================

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const defaultSettings = {
    enableVoiceNavigation: true,
    enableScreenReader: false,
    highContrastMode: false,
    fontSize: 'medium',
    voiceSpeed: 1.0,
    hapticFeedback: true,
    confirmationDelay: 5,
    enableBiometric: false
  };
  const [settings, setSettings] = useState(defaultSettings);
  const { user } = useAuth();

  // const [isListening, setIsListening] = useState(false);
  // const [recognition, setRecognition] = useState(null);

  const normalizeSettings = (incoming = {}) => {
    const mapped = { ...incoming };
    if ('voiceEnabled' in incoming) mapped.enableVoiceNavigation = incoming.voiceEnabled;
    if ('highContrast' in incoming) mapped.highContrastMode = incoming.highContrast;
    if ('screenReaderMode' in incoming) mapped.enableScreenReader = incoming.screenReaderMode;
    return { ...defaultSettings, ...mapped };
  };

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('accessibilitySettings');
    if (saved) {
      setSettings(normalizeSettings(JSON.parse(saved)));
    }

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-IN';
      // setRecognition(recognitionInstance);
    }
  }, []);

  useEffect(() => {
    if (user?.accessibilitySettings) {
      setSettings(prev => normalizeSettings({ ...prev, ...user.accessibilitySettings }));
    }
  }, [user]);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));

    // Apply global styles
    document.body.className = '';
    if (settings.highContrastMode) {
      document.body.classList.add('high-contrast');
    }
    document.body.classList.add(`font-${settings.fontSize}`);
  }, [settings]);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = settings.voiceSpeed || 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // const startListening = (onCommand) => {
  //   if (recognition && !isListening) {
  //     recognition.onresult = (event) => {
  //       const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
  //       console.log('Voice command:', command);
  //       if (onCommand) onCommand(command);
  //     };

  //     recognition.onerror = (event) => {
  //       console.error('Speech recognition error:', event.error);
  //       setIsListening(false);
  //     };

  //     recognition.start();
  //     setIsListening(true);
  //   }
  // };

  // const stopListening = () => {
  //   if (recognition && isListening) {
  //     recognition.stop();
  //     setIsListening(false);
  //   }
  // };

  const toggleVoice = () => {
    setSettings(prev => ({ ...prev, enableVoiceNavigation: !prev.enableVoiceNavigation }));
  };

  const toggleScreenReader = () => {
    setSettings(prev => ({ ...prev, enableScreenReader: !prev.enableScreenReader }));
  };

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrastMode: !prev.highContrastMode }));
  };

  const toggleHaptic = () => {
    setSettings(prev => ({ ...prev, hapticFeedback: !prev.hapticFeedback }));
  };

  const toggleBiometric = () => {
    setSettings(prev => ({ ...prev, enableBiometric: !prev.enableBiometric }));
  };

  const setFontSize = (size) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  };

  const setVoiceSpeed = (speed) => {
    const parsed = parseFloat(speed);
    if (!Number.isNaN(parsed)) {
      setSettings(prev => ({ ...prev, voiceSpeed: parsed }));
    }
  };

  const setConfirmationDelay = (seconds) => {
    const parsed = parseInt(seconds, 10);
    if (!Number.isNaN(parsed)) {
      setSettings(prev => ({ ...prev, confirmationDelay: parsed }));
    }
  };

  const value = {
    settings,
    speak,
    // startListening,
    // stopListening,
    // isListening,
    toggleVoice,
    toggleHighContrast,
    toggleScreenReader,
    toggleHaptic,
    toggleBiometric,
    setFontSize,
    setVoiceSpeed,
    setConfirmationDelay
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// ============================================
// TRANSACTION CONTEXT
// ============================================

const TransactionContext = createContext();

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within TransactionProvider');
  }
  return context;
};

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const { settings, speak } = useAccessibility();
  const { loadUser } = useAuth();
  const sendMoney = async (transactionData) => {
    try {

      setLoading(true);
      const response = await axios.post(`${API_URL}/transactions/send`, {
        ...transactionData,
        usedVoiceNavigation: settings.enableVoiceNavigation,
        usedScreenReader: settings.enableScreenReader,
        confirmationMethod: settings.enableBiometric ? 'biometric' : 'voice'
      });
      setCurrentTransaction(response.data.data);
      const rawAmount = transactionData?.amount;

    const amount = typeof rawAmount === 'number' ? rawAmount
    : rawAmount?.value || rawAmount?.$numberDecimal;
    const message = amount ? `Transaction of Rupees ${amount} initiated successfully`
  : 'Transaction initiated successfully';
      if (response.data?.flagged) {
        toast.warning('Transaction flagged for security review');
        if (settings.enableVoiceNavigation) {
          speak('Transaction flagged for security review');
        }
      } else {
        notifySuccess({
          message,
          speakEnabled: settings.enableVoiceNavigation,
          speak
        });
      }
      // return response.data;
      return {
      success: true,
      data: response.data.data,
      flagged: response.data.flagged
    };
    } catch (error) {
      // CASE 1: backend intentionally flagged the transaction
  // if (error.response?.data?.flagged) {
  //   toast.warning('⚠️ Transaction flagged for security review');
  //   return error.response.data; // allow UI to continue
  // }

  // CASE 2: normal validation / server error
  // const message =
  //   error.response?.data?.message || 'Transaction failed';

  // toast.error(message);
  //     throw error;
  //   } finally {
  //     setLoading(false);
  //   }
  // 🟡 CASE 1: Backend flagged / validation error (expected)
    if (error.response?.data) {
      const message =
        error.response.data.message ||
        'Transaction could not be processed';

      toast.warning(message);

      // ✅ RETURN — DO NOT THROW
      return {
        success: false,
        message,
        flagged: error.response.data.flagged || false
      };
    }

    // 🔴 CASE 2: Unexpected error (network, server down, etc.)
    console.error('SendMoney error:', error);
    toast.error('Something went wrong. Please try again.');

    // ✅ Still return safely
    return {
      success: false,
      message: 'Unexpected error'
    };

  } finally {
    setLoading(false);
  }
  };

  const confirmTransaction = async (transactionId, confirmationData) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/transactions/${transactionId}/confirm`,
        confirmationData
      );
      const rawAmount = currentTransaction?.amount;

      const amount =
        typeof rawAmount === 'number'
          ? rawAmount
          : rawAmount?.value || rawAmount?.$numberDecimal;

      const message = amount
        ? `Rupees ${amount} paid successfully on UPI Saathi`
        : 'Payment completed successfully on UPI Saathi';
    notifySuccess({
      message,
      speakEnabled: settings.enableVoiceNavigation,
      speak
    });
      setCurrentTransaction(null);
      await fetchTransactions();
      await loadUser();
      return response.data;
    } catch (error) {
      // const message = error.response?.data?.message || 'Confirmation failed';
      // toast.error(message);
      // throw error;
      const message =
    error.response?.data?.message || 'Confirmation failed';
    toast.error(message);

    // ✅ DO NOT THROW
    return {
      success: false,
      message
    };
    } finally {
      setLoading(false);
    }
  };

  const cancelTransaction = async (transactionId, reason) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/transactions/${transactionId}/cancel`,
        { reason }
      );
      toast.success('Transaction cancelled successfully');
      if (settings.enableVoiceNavigation) {
        speak('Transaction cancelled');
      }
      setCurrentTransaction(null);
      await fetchTransactions();
      return response.data;
    } catch (error) {
      // const message = error.response?.data?.message || 'Cancellation failed';
      // toast.error(message);
      // throw error;
      const message =
      error.response?.data?.message || 'Cancellation failed';

      toast.error(message);

      // ✅ safe return
      return {
        success: false,
        message
      };
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (params = {}) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/transactions`, { params });
      setTransactions(response.data.data);
      return response.data;
    } catch (error) {
      console.error('Fetch transactions error:', error);
      toast.error('Failed to load transactions');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    transactions,
    currentTransaction,
    loading,
    sendMoney,
    confirmTransaction,
    cancelTransaction,
    fetchTransactions
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};