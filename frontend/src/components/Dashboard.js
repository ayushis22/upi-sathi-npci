import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AllContexts';
import AccessibilityControls from './AccessibilityControls';
function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // const handleVoiceAction = (command) => {
  //   console.log('🎯 Action received:', command);

  //   switch (command.action) {
  //     case 'SEND_MONEY':
  //       navigate('/send-money');
  //       break;
  //     case 'GO_DASHBOARD':
  //       navigate('/dashboard');
  //       break;
  //     case 'CONFIRM_TRANSACTION':
  //       console.log('Confirm transaction action'); // replace with your logic
  //       break;
  //     case 'CANCEL_TRANSACTION':
  //       console.log('Cancel transaction action'); // replace with your logic
  //       break;
  //     default:
  //       console.log('Unknown action');
  //   }
  // };
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">UPI Saathi</div>
          <p className="subtle">Welcome back, {user?.name}</p>
        </div>
        <button onClick={logout} className="btn btn-outline">
          Logout
        </button>
      </div>

      <div className="grid two-col">
        <div className="card">
          <div className="badge">Primary Account</div>
          <h2 style={{ marginTop: '12px' }}>₹{user?.balance}</h2>
          <p className="subtle">Available balance</p>
          <div className="divider" />
          <p><strong>UPI ID:</strong> {user?.upiId}</p>
        </div>
        <div className="card">
          <h3 className="section-title">Quick Actions</h3>
          <div className="actions-row">
            <button onClick={() => navigate('/send-money')} className="btn btn-primary">
              Send Money
            </button>
            <button onClick={() => navigate('/transactions')} className="btn btn-secondary">
              View Transactions
            </button>
            <button onClick={() => navigate('/trusted-contacts')} className="btn btn-secondary">
              Trusted Contacts
            </button>
            <button onClick={() => navigate('/fraud-alerts')} className="btn btn-secondary">
              Fraud Alerts
            </button>
            <button onClick={() => navigate('/settings')} className="btn btn-secondary">
              Settings
            </button>
          </div>
        </div>
      </div>
      <AccessibilityControls />
    </div>
  );
}

export default Dashboard;