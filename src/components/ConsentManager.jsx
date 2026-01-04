import React, { useState, useEffect } from 'react';
import { useSetu } from '../contexts/SetuContext';
import Toast from './Toast';
import '../styles/ConsentManager.css';

const ConsentManager = () => {
  const { token, login, createConsent, getConsentStatus, loading, error: contextError, logout, clearError } = useSetu();
  
  // Initialize consents from localStorage
  const [consents, setConsents] = useState(() => {
    const saved = localStorage.getItem('setu_consents');
    return saved ? JSON.parse(saved) : [];
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState(null);
  const [localError, setLocalError] = useState('');
  
  // Persist consents to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('setu_consents', JSON.stringify(consents));
  }, [consents]);

  // Check for redirect params (success & id) to update status
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const id = params.get('id');

    if (success === 'true' && id) {
      const fetchStatus = async () => {
        try {
          // Call backend to get latest status
          const statusData = await getConsentStatus(id);
          
          setConsents(prev => {
            const exists = prev.find(c => c.id === id);
            if (exists) {
              // Update existing
              return prev.map(c => c.id === id ? { ...c, ...statusData, status: statusData.status || 'ACTIVE' } : c);
            } else {
              // Add new if not found (e.g. created on another device or cleared cache)
              return [{ 
                id, 
                ...statusData, 
                status: statusData.status || 'ACTIVE', 
                createdAt: new Date().toISOString(),
                vua: statusData.vua || 'Unknown'
              }, ...prev];
            }
          });
          
          // Clear query params to prevent re-fetching on reload
          // window.history.replaceState({}, document.title, window.location.pathname);
          
          // Automatically show details for the newly activated consent
          setSelectedConsent({ id, ...statusData, status: statusData.status || 'ACTIVE' });
        } catch (err) {
          console.error("Failed to update status from URL", err);
          setLocalError("Failed to verify consent status from redirect.");
        } finally {
          // Clear query params to prevent re-fetching on reload or error
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
      fetchStatus();
    }
  }, [getConsentStatus]);

  const [formData, setFormData] = useState({
    mobileNumber: '',
    unit: 'MONTH',
    value: '2',
    dateFrom: '2022-01-01',
    dateTo: '2024-01-24',
    consentTypes: {
      PROFILE: true,
      SUMMARY: true,
      TRANSACTIONS: true
    }
  });

  const handleLogin = async () => {
    setLocalError('');
    try {
      await login();
    } catch (err) {
      // Error is handled in context
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      consentTypes: {
        ...prev.consentTypes,
        [name]: checked
      }
    }));
  };

  const handleCreateConsent = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.mobileNumber) {
      setLocalError("Mobile number is required");
      return;
    }

    try {
      const payload = {
        consentDuration: {
          unit: formData.unit,
          value: formData.value
        },
        vua: `${formData.mobileNumber}@onemoney`,
        dataRange: {
          from: new Date(formData.dateFrom).toISOString(),
          to: new Date(formData.dateTo).toISOString()
        },
        consentTypes: Object.keys(formData.consentTypes).filter(k => formData.consentTypes[k]),
        context: [],
        redirectUrl: `${window.location.origin}/dashboard`
      };

      const result = await createConsent(payload);
      
      // Add to list and reset view
      const newConsent = {
        ...result,
        ...payload, // Merge payload to show details if not returned
        createdAt: new Date().toISOString()
      };
      
      setConsents(prev => [newConsent, ...prev]);
      setShowCreateForm(false);

      if (result && result.url) {
        window.open(result.url, '_blank');
      }
    } catch (err) {
      setLocalError('Failed to create consent.');
    }
  };

  const error = contextError || localError;

  return (
    <div className="consent-manager">
      <div className="consent-header">
        <div className="header-content">
          <h2>Consent Management</h2>
          <p>Manage your financial data consents securely</p>
        </div>
        {token && !showCreateForm && !selectedConsent && (
          <button className="btn-primary create-btn" onClick={() => setShowCreateForm(true)}>
            <span className="icon">+</span> New Consent
          </button>
        )}
      </div>

      {!token ? (
        <div className="login-card">
          <div className="login-icon">🔐</div>
          <h3>Connect to SETU</h3>
          <p>Authenticate to access your financial data consents.</p>
          
          <button onClick={handleLogin} className="btn-primary login-btn" disabled={loading}>
            {loading ? 'Connecting...' : 'Login with SETU'}
          </button>
        </div>
      ) : (
        <div className="dashboard-content">
          <div className="status-bar">
            <div className="status-indicator">
              <span className="dot"></span>
              <span>Session Active</span>
            </div>
            <button onClick={logout} className="btn-text logout-btn">Logout</button>
          </div>

          {/* Create Form View */}
          {showCreateForm && (
            <div className="form-card fade-in">
              <div className="card-header">
                <h3>Create New Consent</h3>
                <button className="close-btn" onClick={() => setShowCreateForm(false)}>✕</button>
              </div>
              <p className="form-subtitle">Request access to financial information</p>
              
              <form onSubmit={handleCreateConsent} className="consent-form">
                <div className="form-section">
                  <label>Mobile Number</label>
                  <div className="input-group">
                    <input 
                      type="text" 
                      name="mobileNumber"
                      value={formData.mobileNumber} 
                      onChange={handleInputChange} 
                      placeholder="9876543210"
                      required
                    />
                    <span className="input-suffix">@onemoney</span>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-section">
                    <label>Duration</label>
                    <div className="split-inputs">
                      <input 
                        type="number" 
                        name="value"
                        value={formData.value} 
                        onChange={handleInputChange} 
                        required
                        className="short-input"
                      />
                      <select name="unit" value={formData.unit} onChange={handleInputChange}>
                        <option value="MONTH">Months</option>
                        <option value="YEAR">Years</option>
                        <option value="DAY">Days</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-section">
                    <label>Date Range</label>
                    <div className="split-inputs">
                      <input 
                        type="date" 
                        name="dateFrom"
                        value={formData.dateFrom} 
                        onChange={handleInputChange} 
                        required
                      />
                      <span className="separator">to</span>
                      <input 
                        type="date" 
                        name="dateTo"
                        value={formData.dateTo} 
                        onChange={handleInputChange} 
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <label>Data Permissions</label>
                  <div className="checkbox-group">
                    {['PROFILE', 'SUMMARY', 'TRANSACTIONS'].map(type => (
                      <label key={type} className={`checkbox-label ${formData.consentTypes[type] ? 'checked' : ''}`}>
                        <input 
                          type="checkbox" 
                          name={type} 
                          checked={formData.consentTypes[type]} 
                          onChange={handleCheckboxChange} 
                        />
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Request'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Details View */}
          {selectedConsent && !showCreateForm && (
            <div className="details-view fade-in">
              {/* Navigation & Header */}
              <div className="details-header">
                <button className="back-nav-btn" onClick={() => setSelectedConsent(null)}>
                  <span className="arrow-icon">←</span> Back
                </button>
                <div className="header-title">
                  <h2>Consent Overview</h2>
                  <span className={`status-badge-large ${selectedConsent.status?.toLowerCase()}`}>
                    <span className="status-dot"></span>
                    {selectedConsent.status || 'PENDING'}
                  </span>
                </div>
                {selectedConsent.url && (
                  <a href={selectedConsent.url} target="_blank" rel="noopener noreferrer" className="action-link">
                    View Agreement ↗
                  </a>
                )}
              </div>

              <div className="details-grid-layout">
                {/* Left Column: Meta Information */}
                <div className="meta-column">
                  {/* ID Card */}
                  <div className="info-card highlight-card">
                    <span className="info-label">Consent ID</span>
                    <div className="code-block">
                      {selectedConsent.id}
                    </div>
                  </div>

                  {/* VUA & Date Card */}
                  <div className="info-card">
                    <div className="info-row">
                      <div className="info-group">
                        <span className="info-label">Data Consumer</span>
                        <span className="info-value large">{selectedConsent.vua}</span>
                      </div>
                    </div>
                    <div className="divider"></div>
                    <div className="info-row split">
                      <div className="info-group">
                        <span className="info-label">Created</span>
                        <span className="info-value">{new Date(selectedConsent.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="info-group">
                        <span className="info-label">Valid Until</span>
                        <span className="info-value">{new Date(selectedConsent.dataRange?.to).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Permissions Card */}
                  <div className="info-card">
                    <span className="info-label">Authorized Permissions</span>
                    <div className="permission-tags">
                      {selectedConsent.consentTypes?.map(t => (
                        <div key={t} className="perm-tag">
                          <span className="check-icon">✓</span>
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Linked Accounts */}
                <div className="accounts-column">
                  <div className="section-title">
                    <h3>Linked Accounts</h3>
                    <span className="count-pill">{selectedConsent.accountsLinked?.length || 0}</span>
                  </div>
                  
                  {selectedConsent.accountsLinked && selectedConsent.accountsLinked.length > 0 ? (
                    <div className="accounts-grid">
                      {selectedConsent.accountsLinked.map((acc, idx) => (
                        <div key={idx} className="account-card">
                          <div className="acc-top">
                            <span className="bank-name">{acc.fipId.replace('setu-', '').toUpperCase()}</span>
                            <span className="acc-type">{acc.accType}</span>
                          </div>
                          <div className="acc-mid">
                            <span className="acc-num">•••• {acc.maskedAccNumber.slice(-4)}</span>
                          </div>
                          <div className="acc-bot">
                            <span className="fi-type">{acc.fiType}</span>
                            <span className="verified-badge">✓ Verified</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-accounts">
                      <p>No accounts linked yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* List View */}
          {!showCreateForm && !selectedConsent && (
            <div className="consents-container fade-in">
              {consents.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <h3>No Consents Found</h3>
                  <p>Create a new consent request to get started.</p>
                  <button className="btn-link" onClick={() => setShowCreateForm(true)}>Create Now</button>
                </div>
              ) : (
                <div className="consents-grid">
                  {consents.map((consent, idx) => (
                    <div key={idx} className="consent-card" onClick={() => setSelectedConsent(consent)}>
                      <div className="card-top">
                        <span className={`status-dot ${consent.status?.toLowerCase()}`}></span>
                        <span className="status-text">{consent.status || 'PENDING'}</span>
                      </div>
                      <div className="card-mid">
                        <span className="vua-text">{consent.vua ? consent.vua.split('@')[0] : ''}</span>
                        <span className="date-text">{new Date(consent.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="card-bot">
                        <span className="id-text">ID: {consent.id.slice(0, 8)}...</span>
                        <span className="arrow">→</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Toast 
        message={error} 
        type="error" 
        onClose={() => {
          setLocalError('');
          clearError();
        }} 
      />
    </div>
  );
};

export default ConsentManager;
