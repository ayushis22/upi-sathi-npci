import React, { useState } from 'react';

const BiometricAuth = ({ enabled, onSuccess }) => {
  const [status, setStatus] = useState('');

  if (!enabled) {
    return (
      <p className="subtle">
        Biometric confirmation is disabled in settings.
      </p>
    );
  }

  const handleBiometric = () => {
    const approved = window.confirm('Simulate biometric verification success?');
    if (approved) {
      setStatus('Biometric verified');
      onSuccess?.();
    } else {
      setStatus('Biometric verification failed');
    }
  };

  return (
    <div>
      <button type="button" onClick={handleBiometric} className="btn btn-secondary">
        Simulate Biometric
      </button>
      {status && <span style={{ marginLeft: '10px' }}>{status}</span>}
      <p className="subtle" style={{ marginTop: '8px' }}>
        Demo-only: replace with device biometrics in production.
      </p>
    </div>
  );
};

export default BiometricAuth;
