import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTransaction } from '../contexts/AllContexts';
import { useAccessibility } from '../contexts/AllContexts';
import { notifyError, notifySuccess } from '../utils/notification';
import ErrorRecovery from './ErrorRecovery';
import TransactionConfirmation from './TransactionConfirmation';


function SendMoney() {
  const [formData, setFormData] = useState({
    recipientUpiId: '',
    amount: '',
    description: ''
  });
  const [confirming, setConfirming] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const { sendMoney, confirmTransaction, cancelTransaction } = useTransaction();
  const { settings, speak } = useAccessibility();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorDetails, setErrorDetails] = useState(null);
  const [voiceDraft, setVoiceDraft] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitTransaction = useCallback(async (data) => {
   try {
    setErrorDetails(null);
    const result = await sendMoney(data);

    if (!result?.success) {
      notifyError({
        message: result?.message || 'Transaction could not be processed',
        speakEnabled: settings.enableVoiceNavigation,
        speak
      });
      setErrorDetails({
        type: 'validation',
        message: result?.message || 'Transaction could not be processed',
        input: data
      });
      return;
    }

    notifySuccess({
      message: result.message || 'Transaction initiated',
      speakEnabled: settings.enableVoiceNavigation,
      speak
    });

    setTransaction(result.data);
    setConfirming(true);
  } catch (error) {
    notifyError({
      message: error?.response?.data?.message || 'Unable to send money. Please try again.',
      speakEnabled: settings.enableVoiceNavigation,
      speak
    });
    setErrorDetails({
      type: 'network',
      message: error?.response?.data?.message || 'Network error',
      input: data
    });
  }
  }, [sendMoney, settings.enableVoiceNavigation, speak]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  // try {
  //   const result = await sendMoney(formData);

  //   notifySuccess({
  //     message: result.message || 'Transaction initiated',
  //     speakEnabled,
  //     speak
  //   });

  //   setTransaction(result.data);
  //   setConfirming(true);
  // } catch (error) {
  //   notifyError({
  //     message:
  //       error?.response?.data?.message ||
  //       'Unable to send money. Please try again.',
  //     speakEnabled,
  //     speak
  //   });
  // }
   await submitTransaction(formData);

};

  const handleConfirm = async (confirmationSteps) => {
    const result = await confirmTransaction(transaction._id, confirmationSteps);
    if (!result?.success) {
      setErrorDetails({
        type: 'validation',
        message: result?.message || 'Confirmation failed',
        input: { transactionId: transaction._id }
      });
      return;
    }
    if (settings.hapticFeedback && navigator.vibrate) {
      navigator.vibrate(100);
    }
    navigate('/dashboard');
  };

  const handleCancel = async () => {
    await cancelTransaction(transaction._id, 'User cancelled');
    if (settings.hapticFeedback && navigator.vibrate) {
      navigator.vibrate(50);
    }
    navigate('/dashboard');
  };

  useEffect(() => {
    const state = location.state;
    if (!state) return;
    if (state.recipientUpiId || state.amount) {
      setFormData((prev) => ({
        ...prev,
        recipientUpiId: state.recipientUpiId || prev.recipientUpiId,
        amount: state.amount != null ? String(state.amount) : prev.amount
      }));
    }
    if (state.viaVoice) {
      setVoiceDraft(true);
      if (settings.enableVoiceNavigation) {
        speak('Draft ready. Say confirm to continue or cancel to stop.');
      }
    }
  }, [location.state, settings.enableVoiceNavigation, speak]);

  useEffect(() => {
    const handleVoiceConfirm = () => {
      if (confirming && transaction) {
        handleConfirm({ voiceConfirmed: true, visualConfirmed: true });
        return;
      }
      if (!formData.recipientUpiId || !formData.amount) {
        if (settings.enableVoiceNavigation) {
          speak('Please provide recipient and amount before confirming.');
        }
        return;
      }
      submitTransaction(formData);
    };

    const handleVoiceCancel = () => {
      if (confirming && transaction) {
        handleCancel();
        return;
      }
      setVoiceDraft(false);
      setFormData({ recipientUpiId: '', amount: '', description: '' });
      if (settings.enableVoiceNavigation) {
        speak('Draft cancelled.');
      }
    };

    window.addEventListener('voice:confirm', handleVoiceConfirm);
    window.addEventListener('voice:cancel', handleVoiceCancel);
    return () => {
      window.removeEventListener('voice:confirm', handleVoiceConfirm);
      window.removeEventListener('voice:cancel', handleVoiceCancel);
    };
  }, [confirming, transaction, formData, handleConfirm, handleCancel, settings.enableVoiceNavigation, speak, submitTransaction]);

  if (confirming && transaction) {
    return (
      <TransactionConfirmation
        transaction={transaction}
        voiceEnabled={settings.enableVoiceNavigation}
        speak={speak}
        confirmationDelay={settings.confirmationDelay}
        requireBiometric={settings.enableBiometric}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Send Money</div>
          <p className="subtle">Verify the recipient before confirming.</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn btn-outline">
          Back to Dashboard
        </button>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="label" htmlFor="recipientUpiId">Recipient UPI ID</label>
            <input
              className="input"
              id="recipientUpiId"
              name="recipientUpiId"
              placeholder="example@upi"
              value={formData.recipientUpiId}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label className="label" htmlFor="amount">Amount (₹)</label>
            <input
              className="input"
              id="amount"
              name="amount"
              type="number"
              placeholder="1000"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label className="label" htmlFor="description">Description (Optional)</label>
            <input
              className="input"
              id="description"
              name="description"
              placeholder="Payment for..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Continue
          </button>
        </form>
      </div>
      {voiceDraft && (
        <div className="card" style={{ marginTop: '16px', background: '#eef2ff' }}>
          <p className="subtle">Voice draft ready. Say “confirm” to continue or “cancel” to clear.</p>
        </div>
      )}
      {errorDetails && (
        <ErrorRecovery
          errorType={errorDetails.type}
          errorMessage={errorDetails.message}
          userInput={errorDetails.input}
          onRetry={() => setErrorDetails(null)}
          onDismiss={() => setErrorDetails(null)}
        />
      )}
    </div>
  );
}

export default SendMoney;