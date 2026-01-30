import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TrustedContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({
    contactUpiId: '',
    contactName: '',
    nickname: '',
    relationship: 'other',
    notes: '',
    verificationMethod: 'none'
  });

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${API_URL}/trustedContacts`);
      setContacts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/trustedContacts`, formData);
      setContacts(prev => [res.data, ...prev]);
      toast.success('Trusted contact added');
      setFormData({
        contactUpiId: '',
        contactName: '',
        nickname: '',
        relationship: 'other',
        notes: '',
        verificationMethod: 'none'
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding contact');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await axios.delete(`${API_URL}/trustedContacts/${id}`);
      setContacts(prev => prev.filter(c => c._id !== id));
      toast.success('Contact deleted');
    } catch (err) {
      toast.error('Error deleting contact');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Trusted Contacts</div>
          <p className="subtle">Add verified recipients for safer transfers.</p>
        </div>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input className="input" name="contactUpiId" placeholder="UPI ID" value={formData.contactUpiId} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <input className="input" name="contactName" placeholder="Name" value={formData.contactName} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <input className="input" name="nickname" placeholder="Nickname" value={formData.nickname} onChange={handleChange} />
          </div>
          <div className="form-row">
            <select className="select" name="relationship" value={formData.relationship} onChange={handleChange}>
              <option value="family">Family</option>
              <option value="friend">Friend</option>
              <option value="business">Business</option>
              <option value="service">Service</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-row">
            <select className="select" name="verificationMethod" value={formData.verificationMethod} onChange={handleChange}>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="manual">Manual</option>
              <option value="none">None</option>
            </select>
          </div>
          <div className="form-row">
            <textarea className="textarea" name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} maxLength={500} />
          </div>
          <button type="submit" className="btn btn-primary">Add Contact</button>
        </form>
      </div>

      <div className="card">
        <h3 className="section-title">Saved Contacts</h3>
        <div className="list">
          {contacts.map(contact => (
            <div key={contact._id} className="list-item">
              <div className="actions-row" style={{ justifyContent: 'space-between' }}>
                <strong>{contact.contactName}</strong>
                <span className="pill">{contact.relationship}</span>
              </div>
              <p className="subtle">{contact.contactUpiId}</p>
              {contact.nickname && <p className="subtle">Nickname: {contact.nickname}</p>}
              <button onClick={() => handleDelete(contact._id)} className="btn btn-outline">
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustedContacts;
