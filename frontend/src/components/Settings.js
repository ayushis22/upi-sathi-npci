import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility, useAuth } from '../contexts/AllContexts';

function Settings() {
  const { settings, toggleHighContrast, toggleVoice, toggleScreenReader, toggleHaptic, toggleBiometric, setFontSize, setVoiceSpeed, setConfirmationDelay } = useAccessibility();
  const { updateAccessibilitySettings } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateAccessibilitySettings(settings);
    setSaving(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Accessibility Settings</div>
          <p className="subtle">Tune the experience to your needs.</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn btn-outline">
          Back to Dashboard
        </button>
      </div>

      <div className="grid two-col">
        <div className="card">
          <h3 className="section-title">Visual Settings</h3>
          <label>
            <input
              type="checkbox"
              checked={settings.highContrastMode}
              onChange={toggleHighContrast}
              style={{ marginRight: '10px' }}
            />
            High Contrast Mode
          </label>
          <div className="form-row" style={{ marginTop: '15px' }}>
            <label className="label">Font Size</label>
            <select
              className="select"
              value={settings.fontSize}
              onChange={(e) => setFontSize(e.target.value)}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Voice Settings</h3>
          <label>
            <input
              type="checkbox"
              checked={settings.enableVoiceNavigation}
              onChange={toggleVoice}
              style={{ marginRight: '10px' }}
            />
            Enable Voice Navigation
          </label>
          <div className="form-row" style={{ marginTop: '15px' }}>
            <label className="label">Voice Speed</label>
            <input
              className="input"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.voiceSpeed}
              onChange={(e) => setVoiceSpeed(e.target.value)}
            />
            <span className="subtle">{settings.voiceSpeed.toFixed(1)}x</span>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Screen Reader & Haptics</h3>
          <label>
            <input
              type="checkbox"
              checked={settings.enableScreenReader}
              onChange={toggleScreenReader}
              style={{ marginRight: '10px' }}
            />
            Screen Reader Mode
          </label>
          <div style={{ marginTop: '10px' }}>
            <label>
              <input
                type="checkbox"
                checked={settings.hapticFeedback}
                onChange={toggleHaptic}
                style={{ marginRight: '10px' }}
              />
              Haptic Feedback (if supported)
            </label>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Safe Confirmation</h3>
          <label className="label">Confirmation Delay (seconds)</label>
          <input
            className="input"
            type="number"
            min="0"
            max="30"
            value={settings.confirmationDelay}
            onChange={(e) => setConfirmationDelay(e.target.value)}
          />
          <div className="divider" />
          <h3 className="section-title">Biometric Authentication</h3>
          <label>
            <input
              type="checkbox"
              checked={settings.enableBiometric}
              onChange={toggleBiometric}
              style={{ marginRight: '10px' }}
            />
            Enable Biometric (Demo)
          </label>
          <p className="subtle" style={{ marginTop: '8px' }}>
            Uses a simulated biometric check for demo purposes.
          </p>
        </div>
      </div>

      <div className="actions-row" style={{ marginTop: '24px' }}>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

export default Settings;