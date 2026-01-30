import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAccessibility } from '../contexts/AllContexts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const fallbackAssistance = {
  message: 'An error occurred',
  steps: ['Please try again', 'Check your details', 'Contact support if it persists'],
  voiceGuidance: 'An error occurred. Please try again.'
};

const ErrorRecovery = ({ errorType, errorMessage, userInput, onRetry, onDismiss }) => {
  const { settings, speak } = useAccessibility();
  const [assistance, setAssistance] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchAssistance = async () => {
      try {
        const response = await axios.post(`${API_URL}/accessibility/error-assistance`, {
          errorType,
          errorMessage,
          userInput
        });
        if (!cancelled) {
          setAssistance(response.data.data);
        }
      } catch (error) {
        if (!cancelled) {
          setAssistance(fallbackAssistance);
        }
      }
    };

    if (errorType || errorMessage) {
      fetchAssistance();
    }

    return () => {
      cancelled = true;
    };
  }, [errorType, errorMessage, userInput]);

  useEffect(() => {
    if (!assistance?.voiceGuidance) return;
    if (settings.enableVoiceNavigation) {
      speak(assistance.voiceGuidance);
    }
  }, [assistance, settings.enableVoiceNavigation, speak]);

  if (!assistance) return null;

  return (
    <div className="card" style={{ marginTop: '20px', background: '#fff7ed' }} role="alert" aria-live="polite">
      <h3 style={{ marginTop: 0 }}>We can help fix this</h3>
      <p>{assistance.message}</p>
      <ul>
        {assistance.steps?.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ul>
      <div className="actions-row">
        <button type="button" onClick={onRetry} className="btn btn-secondary">
          Try Again
        </button>
        <button type="button" onClick={onDismiss} className="btn btn-outline">
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default ErrorRecovery;
