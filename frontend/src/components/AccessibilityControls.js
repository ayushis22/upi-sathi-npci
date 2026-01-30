import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../contexts/AllContexts';

const AccessibilityControls = () => {
  const navigate = useNavigate();
  const {
    settings,
    toggleVoice,
    toggleHighContrast,
    toggleScreenReader,
    setFontSize
  } = useAccessibility();

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <h3 className="section-title">Quick Accessibility</h3>
      <div className="actions-row">
        <button onClick={toggleVoice} className="btn btn-secondary">
          {settings.enableVoiceNavigation ? 'Disable Voice' : 'Enable Voice'}
        </button>
        <button onClick={toggleHighContrast} className="btn btn-secondary">
          {settings.highContrastMode ? 'Normal Contrast' : 'High Contrast'}
        </button>
        <button onClick={toggleScreenReader} className="btn btn-secondary">
          {settings.enableScreenReader ? 'Screen Reader Off' : 'Screen Reader On'}
        </button>
        <select
          className="select"
          aria-label="Font size"
          value={settings.fontSize}
          onChange={(e) => setFontSize(e.target.value)}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="extra-large">Extra Large</option>
        </select>
        <button onClick={() => navigate('/settings')} className="btn btn-outline">
          Open Settings
        </button>
      </div>
    </div>
  );
};

export default AccessibilityControls;
