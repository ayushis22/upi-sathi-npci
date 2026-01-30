import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAccessibility } from '../contexts/AllContexts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function FraudAlerts() {
  const navigate = useNavigate();
  const { settings, speak } = useAccessibility();
  const [alerts, setAlerts] = useState([]);
  const [flaggedTransactions, setFlaggedTransactions] = useState([]);
  const [education, setEducation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState({ transactionId: '', reason: '', description: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertsRes, educationRes] = await Promise.all([
          axios.get(`${API_URL}/fraud/alerts`),
          axios.get(`${API_URL}/fraud/education`)
        ]);
        setAlerts(alertsRes.data?.data?.alerts || []);
        setFlaggedTransactions(alertsRes.data?.data?.flaggedTransactions || []);
        setEducation(educationRes.data?.data || null);
      } catch (error) {
        toast.error('Unable to load fraud alerts');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFreeze = async () => {
    try {
      await axios.post(`${API_URL}/auth/freeze-account`);
      toast.success('Account frozen successfully');
      if (settings.enableVoiceNavigation) {
        speak('Account frozen successfully');
      }
    } catch (error) {
      toast.error('Unable to freeze account');
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/fraud/report`, report);
      toast.success('Fraud report submitted');
      setReport({ transactionId: '', reason: '', description: '' });
    } catch (error) {
      toast.error('Unable to submit fraud report');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Fraud Alerts & Security</div>
          <p className="subtle">Stay informed about risky activity.</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn btn-outline">
          Back to Dashboard
        </button>
      </div>

      {loading ? (
        <div className="card">
          <p>Loading security insights...</p>
        </div>
      ) : (
        <>
          {alerts.length === 0 ? (
            <div className="card" style={{ background: '#ecfdf3' }}>
              <h3 style={{ color: '#0f9d58' }}>✅ No Active Alerts</h3>
              <p>Your account security looks good!</p>
            </div>
          ) : (
            <div className="list">
              {alerts.map((alert, index) => (
                <div key={index} className="list-item" style={{ background: '#fff7ed' }}>
                  <strong>{alert.title}</strong>
                  <p>{alert.message}</p>
                </div>
              ))}
            </div>
          )}

          {flaggedTransactions.length > 0 && (
            <div className="card">
              <h3 className="section-title">Flagged Transactions</h3>
              <div className="list">
                {flaggedTransactions.map((txn) => (
                  <div key={txn._id} className="list-item">
                    <p><strong>ID:</strong> {txn.transactionId}</p>
                    <p><strong>To:</strong> {txn.recipient?.upiId}</p>
                    <p><strong>Amount:</strong> ₹{txn.amount}</p>
                    <p><strong>Risk Score:</strong> {txn.fraudAnalysis?.riskScore}</p>
                    <p><strong>Reason:</strong> {txn.fraudAnalysis?.flagReason || 'Unknown'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {education && (
            <div className="card">
              <h3 className="section-title">Security Tips</h3>
              <ul>
                {education.tips?.map((tip, index) => (
                  <li key={index}><strong>{tip.title}:</strong> {tip.description}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="card">
            <h3 className="section-title">Emergency Actions</h3>
            <button onClick={handleFreeze} className="btn btn-danger">
              Freeze Account
            </button>
          </div>

          <div className="card">
            <h3 className="section-title">Report Suspicious Activity</h3>
            <form onSubmit={handleReport}>
              <div className="form-row">
                <input
                  className="input"
                  name="transactionId"
                  placeholder="Transaction ID (optional)"
                  value={report.transactionId}
                  onChange={(e) => setReport(prev => ({ ...prev, transactionId: e.target.value }))}
                />
              </div>
              <div className="form-row">
                <input
                  className="input"
                  name="reason"
                  placeholder="Reason"
                  value={report.reason}
                  onChange={(e) => setReport(prev => ({ ...prev, reason: e.target.value }))}
                  required
                />
              </div>
              <div className="form-row">
                <textarea
                  className="textarea"
                  name="description"
                  placeholder="Describe what happened"
                  value={report.description}
                  onChange={(e) => setReport(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Submit Report
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default FraudAlerts;