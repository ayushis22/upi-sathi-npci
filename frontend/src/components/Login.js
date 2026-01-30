import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AllContexts';
import { useAccessibility } from '../contexts/AllContexts';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { speak, settings } = useAccessibility();
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    if (settings.enableVoiceNavigation) {
      speak('Login page loaded. Please enter your email and password.');
    }
  }, []); // 🔴 Runs only once on page load
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const success = await login(email, password);
  //   if (success) navigate('/dashboard');
  // };
  const handleSubmit = async (e) => {
  e.preventDefault();

  setStatusMessage('Logging in. Please wait');
  if (settings.enableVoiceNavigation) {
    speak('Logging in. Please wait');
  }

  const success = await login(email, password);

  if (success) {
    setStatusMessage('Login successful. Welcome to UPI Saathi. Redirecting to dashboard');
    if (settings.enableVoiceNavigation) {
      speak('Login successful. Welcome to UPI Saathi. Redirecting to dashboard');
    }

    // ⏳ Let speech finish before navigation
    setTimeout(() => {
      navigate('/dashboard');
    }, 1200);
  } else {
    setStatusMessage('Login failed. Please check your credentials');
    if (settings.enableVoiceNavigation) {
      speak('Login failed. Please check your credentials');
    }
  }
};


  return (
    <div className="page auth-page">
      <div className="card auth-card">
        <div className="brand">
          <div className="brand-mark">UPI</div>
          <div>
            <h2>UPI Saathi</h2>
            <p className="subtle">Accessible payments for everyone</p>
          </div>
        </div>
        <h3>Login</h3>
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={{ position: 'absolute', left: '-9999px' }}
        >
          {statusMessage}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="label" htmlFor="email">Email</label>
            <input
              className="input"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label className="label" htmlFor="password">Password</label>
            <input
              className="input"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button aria-label="Login to your UPI Saathi account" type="submit" className="btn btn-primary btn-block">
            Login
          </button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;