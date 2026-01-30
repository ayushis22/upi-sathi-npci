import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransaction } from '../contexts/AllContexts';

function Transactions() {
  const { transactions, fetchTransactions } = useTransaction();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Transaction History</div>
          <p className="subtle">Review recent activity and statuses.</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn btn-outline">
          Back to Dashboard
        </button>
      </div>
      {transactions.length === 0 ? (
        <div className="card">
          <p>No transactions yet</p>
        </div>
      ) : (
        <div className="list">
          {transactions.map((txn) => (
            <div key={txn._id} className="list-item">
              <div className="actions-row" style={{ justifyContent: 'space-between' }}>
                <strong>{txn.recipient.upiId}</strong>
                <span className="pill" style={{ color: txn.status === 'completed' ? '#0f9d58' : '#dc3545' }}>
                  {txn.status}
                </span>
              </div>
              <p><strong>Amount:</strong> ₹{txn.amount}</p>
              <p className="subtle">ID: {txn.transactionId}</p>
              <p className="subtle">{new Date(txn.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Transactions;