import React, { useEffect, useMemo, useState } from 'react';
import BiometricAuth from './BiometricAuth';

const getAmountLabel = (amount) => {
  if (typeof amount === 'number') return amount;
  if (!amount) return '';
  return amount.value || amount.$numberDecimal || amount;
};

const TransactionConfirmation = ({
  transaction,
  voiceEnabled,
  speak,
  confirmationDelay = 0,
  onConfirm,
  onCancel,
  requireBiometric
}) => {
  const [remaining, setRemaining] = useState(confirmationDelay);
  const [visualConfirmed, setVisualConfirmed] = useState(false);
  const [voiceConfirmed, setVoiceConfirmed] = useState(false);
  const [biometricConfirmed, setBiometricConfirmed] = useState(false);
  const amount = useMemo(() => getAmountLabel(transaction?.amount), [transaction?.amount]);

  useEffect(() => {
    if (!confirmationDelay) return;
    setRemaining(confirmationDelay);
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [confirmationDelay]);

  useEffect(() => {
    if (!voiceEnabled || !transaction) return;
    speak?.(`Please review your transaction. Sending Rupees ${amount} to ${transaction.recipient?.upiId}.`);
  }, [voiceEnabled, transaction, amount, speak]);

  const handleReadback = () => {
    setVoiceConfirmed(true);
    speak?.(`You are sending Rupees ${amount} to ${transaction.recipient?.upiId}.`);
  };

  const canConfirm = visualConfirmed
    && (!voiceEnabled || voiceConfirmed)
    && (!requireBiometric || biometricConfirmed)
    && remaining === 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Confirm Transaction</div>
          <p className="subtle">Take a moment to review details before sending.</p>
        </div>
      </div>
      <div className="card">
        <p><strong>To:</strong> {transaction.recipient?.upiId}</p>
        <p><strong>Amount:</strong> ₹{amount}</p>
        <p><strong>Description:</strong> {transaction.description || 'None'}</p>
        {transaction.fraudAnalysis?.flagged && (
          <p style={{ color: '#dc3545', marginTop: '10px' }}>
            ⚠️ This transaction has been flagged for security review
          </p>
        )}
      </div>

      <div className="card">
        <label>
          <input
            type="checkbox"
            checked={visualConfirmed}
            onChange={(e) => setVisualConfirmed(e.target.checked)}
            style={{ marginRight: '10px' }}
          />
          I have verified the recipient and amount
        </label>

        {voiceEnabled && (
          <div style={{ marginTop: '15px' }}>
            <button type="button" onClick={handleReadback} className="btn btn-secondary">
              Read details aloud
            </button>
            {voiceConfirmed && (
              <span style={{ marginLeft: '10px', color: '#28a745' }}>Voice confirmed</span>
            )}
          </div>
        )}

        <div style={{ marginTop: '15px' }}>
          <BiometricAuth
            enabled={requireBiometric}
            onSuccess={() => setBiometricConfirmed(true)}
          />
        </div>

        {remaining > 0 && (
          <p style={{ marginTop: '15px', color: '#856404' }} role="status" aria-live="polite">
            Confirmation available in {remaining} second{remaining === 1 ? '' : 's'}...
          </p>
        )}

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onConfirm?.({ voiceConfirmed, visualConfirmed, biometricConfirmed })}
            disabled={!canConfirm}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="btn btn-danger"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionConfirmation;
