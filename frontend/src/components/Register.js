import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AllContexts';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    disabilityProfile: {
      hasVisualImpairment: false,
      hasMotorImpairment: false,
      hasCognitiveImpairment: false,
      hasSpeechImpairment: false
    },
    accessibilitySettings: {
      enableVoiceNavigation: true,
      enableScreenReader: false,
      highContrastMode: false,
      fontSize: 'medium',
      enableBiometric: false
    }
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDisabilityChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      disabilityProfile: {
        ...prev.disabilityProfile,
        [name]: checked
      }
    }));
  };

  const handleAccessibilityChange = (e) => {
    const { name, checked, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      accessibilitySettings: {
        ...prev.accessibilitySettings,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="page auth-page">
      <div className="card auth-card">
        <div className="brand">
          <div className="brand-mark">UPI</div>
          <div>
            <h2>Create your UPI Saathi profile</h2>
            <p className="subtle">Set up accessibility preferences right away.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="label">Full Name</label>
            <input
              className="input"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label className="label">Email</label>
            <input
              className="input"
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label className="label">Password</label>
            <input
              className="input"
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <label className="label">Phone Number</label>
            <input
              className="input"
              name="phoneNumber"
              placeholder="Phone (10 digits)"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="divider" />
          <div className="form-row">
            <h3 className="section-title">Accessibility Profile</h3>
            <label>
              <input
                type="checkbox"
                name="hasVisualImpairment"
                checked={formData.disabilityProfile.hasVisualImpairment}
                onChange={handleDisabilityChange}
              />
              Visual impairment
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                name="hasMotorImpairment"
                checked={formData.disabilityProfile.hasMotorImpairment}
                onChange={handleDisabilityChange}
              />
              Motor impairment
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                name="hasCognitiveImpairment"
                checked={formData.disabilityProfile.hasCognitiveImpairment}
                onChange={handleDisabilityChange}
              />
              Cognitive impairment
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                name="hasSpeechImpairment"
                checked={formData.disabilityProfile.hasSpeechImpairment}
                onChange={handleDisabilityChange}
              />
              Speech impairment
            </label>
          </div>
          <div className="divider" />
          <div className="form-row">
            <h3 className="section-title">Preferred Access Settings</h3>
            <label>
              <input
                type="checkbox"
                name="enableVoiceNavigation"
                checked={formData.accessibilitySettings.enableVoiceNavigation}
                onChange={handleAccessibilityChange}
              />
              Enable Voice Navigation
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                name="enableScreenReader"
                checked={formData.accessibilitySettings.enableScreenReader}
                onChange={handleAccessibilityChange}
              />
              Screen Reader Mode
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                name="highContrastMode"
                checked={formData.accessibilitySettings.highContrastMode}
                onChange={handleAccessibilityChange}
              />
              High Contrast
            </label>
            <br />
            <label className="label" style={{ marginTop: '10px' }}>
              Font Size
            </label>
            <select
              className="select"
              name="fontSize"
              value={formData.accessibilitySettings.fontSize}
              onChange={handleAccessibilityChange}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Register
          </button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;