import React, { useState, useEffect } from 'react';
import { useSetu } from '../contexts/SetuContext';
import Toast from './Toast';
import { LogOut, Undo2 } from 'lucide-react';
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

  const handleRevoke = async (e, consentId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to revoke this consent?")) return;

    try {
      const response = await fetch(`http://localhost:8072/api/setu/auth/${consentId}/revokeConsent`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setConsents(prev => prev.map(c => c.id === consentId ? { ...c, status: 'REVOKED' } : c));
        if (selectedConsent && selectedConsent.id === consentId) {
          setSelectedConsent(prev => ({ ...prev, status: 'REVOKED' }));
        }
      } else {
        throw new Error('Failed to revoke');
      }
    } catch (err) {
      console.error("Revoke error:", err);
      setLocalError('Failed to revoke consent');
    }
  };

  const error = contextError || localError;

  return (
    <div className="consent-manager">
      <div className="consent-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {token && (
            <div className="status-indicator" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(34, 197, 94, 0.1)', 
              padding: '6px 12px', 
              borderRadius: '20px', 
              border: '1px solid rgba(34, 197, 94, 0.2)',
              color: 'var(--success-green)',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}>
              <span className="dot" style={{ width: '6px', height: '6px', background: 'var(--success-green)', borderRadius: '50%', boxShadow: '0 0 6px var(--success-green)' }}></span>
              <span>Session Active</span>
            </div>
          )}
          {token && (
            <button onClick={logout} className="logout-btn-styled">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {token && !showCreateForm && !selectedConsent && (
            <button className="btn-primary create-btn" onClick={() => setShowCreateForm(true)}>
              <span className="icon">+</span> New Consent
            </button>
          )}
        </div>
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

              <div className="details-layout-v2">
                {/* Top Summary Cards */}
                <div className="summary-cards-row">
                  <div className="summary-card highlight">
                    <span className="summary-label">Consent ID</span>
                    <span className="summary-value mono" title={selectedConsent.id}>{selectedConsent.id}</span>
                  </div>
                  <div className="summary-card">
                    <span className="summary-label">Data Consumer</span>
                    <span className="summary-value">{selectedConsent.vua}</span>
                  </div>
                  <div className="summary-card">
                    <span className="summary-label">Valid Until</span>
                    <span className="summary-value">{new Date(selectedConsent.dataRange?.to).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="main-panel-full">
                  <div className="section-header">
                    <h3>Linked Accounts</h3>
                    <span className="count-badge">{selectedConsent.accountsLinked?.length || 0}</span>
                  </div>
                  
                  {selectedConsent.accountsLinked && selectedConsent.accountsLinked.length > 0 ? (
                    <div className="accounts-grid-premium">
                          {selectedConsent.accountsLinked.map((acc, idx) => (
                            <div key={idx} className="premium-account-card">
                              <div className="card-background-glow"></div>
                              <div className="card-content">
                                <div className="card-header">
                                  <span className="bank-logo-text">{acc.fipId.replace('setu-', '').toUpperCase()}</span>
                                  <span className="card-type-badge">{acc.accType}</span>
                                </div>
                                <div className="card-chip">
                                  <div className="chip-line"></div>
                                  <div className="chip-line"></div>
                                  <div className="chip-line"></div>
                                  <div className="chip-line"></div>
                                </div>
                                <div className="card-number">
                                  <span className="dots">••••</span>
                                  <span className="dots">••••</span>
                                  <span className="dots">••••</span>
                                  <span className="last-four">{acc.maskedAccNumber.slice(-4)}</span>
                                </div>
                                <div className="card-footer">
                                  <div className="card-info-group">
                                    <span className="label">STATUS</span>
                                    <span className="value verified">
                                      <span className="check-circle">✓</span> Verified
                                    </span>
                                  </div>
                                  <div className="card-info-group right">
                                     <span className="label">TYPE</span>
                                     <span className="value">{acc.fiType}</span>
                                  </div>
                                </div>
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
                        {consent.status !== 'REVOKED' && (
                          <button 
                            className="revoke-btn" 
                            onClick={(e) => handleRevoke(e, consent.id)}
                            title="Revoke Consent"
                          >
                            <Undo2 size={14} />
                          </button>
                        )}
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
