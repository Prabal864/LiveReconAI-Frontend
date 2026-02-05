import React, { useState, useEffect } from 'react';
import { useSetu } from '../contexts/SetuContext';
import axios from 'axios';
import Toast from './Toast';
import ConfirmationModal from './ConfirmationModal';
import { LogOut, Undo2 } from 'lucide-react';
import { saveUserConsent, fetchUserConsents } from '../services/authService';
import '../styles/ConsentManager.css';

const ConsentManager = () => {
  const { token, login, createConsent, getConsentStatus, loading, error: contextError, logout, clearError } = useSetu();
  
  // Initialize consents as empty - will be fetched based on userConsentIds
  const [consents, setConsents] = useState([]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState(null);
  const [localError, setLocalError] = useState('');
  const [revokeModal, setRevokeModal] = useState({ show: false, consentId: null });
  const [isRevoking, setIsRevoking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch full consent details for user's consent IDs
  useEffect(() => {
    const fetchUserConsents = async () => {
      const userConsentIdsStr = localStorage.getItem('userConsentIds');
      
      let userConsentIds = [];
      try {
        userConsentIds = userConsentIdsStr ? JSON.parse(userConsentIdsStr) : [];
      } catch (error) {
        console.error("Error parsing userConsentIds:", error);
        return;
      }

      if (userConsentIds.length === 0) {
        setConsents([]);
        return;
      }

      const fetchedConsents = [];

      try {
        // Fetch details for each consent ID
        for (const consentId of userConsentIds) {
          try {
            const consentData = await getConsentStatus(consentId);
            if (consentData) {
              fetchedConsents.push({
                id: consentId,
                ...consentData,
                status: consentData.status || 'ACTIVE',
                createdAt: consentData.createdAt || new Date().toISOString()
              });
            }
          } catch (err) {
            console.error(`Failed to fetch consent ${consentId}:`, err);
            // Add placeholder if fetch fails
            fetchedConsents.push({
              id: consentId,
              status: 'UNKNOWN',
              createdAt: new Date().toISOString(),
              fetchError: true
            });
          }
        }

        setConsents(fetchedConsents);
        // Update localStorage with fetched consents
        localStorage.setItem('setu_consents', JSON.stringify(fetchedConsents));
      } catch (error) {
        console.error("Error fetching user consents:", error);
      }
    };

    fetchUserConsents();
  }, [getConsentStatus]); // Add getConsentStatus as dependency

  // Timer logic for session expiry
  useEffect(() => {
    if (token) {
      const SESSION_DURATION = 5 * 60 * 1000; // 5 minutes
      
      let expiry = localStorage.getItem('setu_session_expiry');
      if (!expiry) {
        expiry = Date.now() + SESSION_DURATION;
        localStorage.setItem('setu_session_expiry', expiry);
      } else {
        // If expiry is in the past, reset it (or logout immediately)
        if (parseInt(expiry) < Date.now()) {
             logout();
             localStorage.removeItem('setu_session_expiry');
             return;
        }
      }

      const updateTimer = () => {
        const now = Date.now();
        const diff = parseInt(expiry) - now;
        
        if (diff <= 0) {
          setTimeLeft(0);
          logout();
          localStorage.removeItem('setu_session_expiry');
        } else {
          setTimeLeft(Math.ceil(diff / 1000));
        }
      };

      updateTimer(); // Initial call
      const timerId = setInterval(updateTimer, 1000);

      return () => clearInterval(timerId);
    } else {
      setTimeLeft(null);
      localStorage.removeItem('setu_session_expiry');
    }
  }, [token, logout]);

  const formatTime = (seconds) => {
    if (seconds === null) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getCardStyle = (id) => {
      // Functional hash for consistent randomness
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
      }
      hash = Math.abs(hash);

      const angle = (hash % 160) + 10; // 10deg to 170deg
      
      const gradients = [
          // 1. Midnight Fintech (Deep Navy & Teal Glow)
          'radial-gradient(circle at 100% 0%, rgba(45, 212, 191, 0.15) 0%, transparent 50%), linear-gradient(135deg, #020617 0%, #0f172a 50%, #172554 100%)',
          
          // 2. Cyber Void (Deep Black & Neon Purple)
          'radial-gradient(circle at 0% 0%, rgba(124, 58, 237, 0.15) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(219, 39, 119, 0.15) 0%, transparent 50%), linear-gradient(180deg, #09090b 0%, #18181b 100%)',
          
          // 3. Obsidian Gold (Premium Dark & Gold Sheen)
          'linear-gradient(120deg, transparent 30%, rgba(234, 179, 8, 0.08) 45%, rgba(234, 179, 8, 0.02) 50%, transparent 60%), linear-gradient(180deg, #1c1917 0%, #0c0a09 100%)',
          
          // 4. Aurora Dark (Slate with Cyan/Violet)
          'radial-gradient(circle at 85% 15%, rgba(56, 189, 248, 0.12) 0%, transparent 50%), radial-gradient(circle at 15% 85%, rgba(139, 92, 246, 0.12) 0%, transparent 50%), linear-gradient(180deg, #0f172a 0%, #020617 100%)',
          
          // 5. Verdant Deep (Emerald & Forest)
          'radial-gradient(circle at 90% 10%, rgba(16, 185, 129, 0.15) 0%, transparent 60%), linear-gradient(135deg, #022c22 0%, #064e3b 100%)',
          
          // 6. Crimson Night (Rich Red & Dark Carbon)
          'radial-gradient(circle at 50% 120%, rgba(220, 38, 38, 0.15) 0%, transparent 60%), linear-gradient(to bottom, #18181b 0%, #1a0505 100%)',

          // 7. Royal Velvet (Deep Mauve/Black)
          'linear-gradient(to top right, #2e1065 0%, #000000 60%, #4c1d95 100%)'
      ];

      const patterns = [
        'pattern-mesh', 
        'pattern-waves', 
        'pattern-geo', 
        'pattern-circles', 
        'pattern-lines',
        'pattern-hex'
      ];
      
      const pattern = patterns[hash % patterns.length];
      
      // Variable pattern opacity (0.1 to 0.3) - lowered for subtle look
      const op = 0.08 + ((hash % 20) / 100);
      
      // Variable pattern size (20px to 60px)
      const sz = 20 + (hash % 40);
      
      const deg = (hash % 180);

      // 40% chance of using the "Obsidian Gold" (index 2) or "Cyber Void" (index 1) specifically for that premium dark feel
      const usePremiumDark = (hash % 10) < 4;
      const bg = usePremiumDark 
         ? gradients[(hash % 2) + 1] // Index 1 or 2
         : gradients[hash % gradients.length];

      return {
          background: bg,
          pattern: pattern,
          vars: {
             '--op': op,
             '--sz': `${sz}px`,
             '--deg': `${deg}deg`,
             '--pos-x': `${hash % 100}%`,
             '--pos-y': `${(hash >> 2) % 100}%`
          }
      };
  };
  
  // Persist consents to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('setu_consents', JSON.stringify(consents));
    
    // Update userConsentIds to include all consent IDs from the user
    const userConsentIdsStr = localStorage.getItem('userConsentIds');
    let userConsentIds = [];
    try {
      userConsentIds = userConsentIdsStr ? JSON.parse(userConsentIdsStr) : [];
    } catch (error) {
      console.error("Error parsing userConsentIds:", error);
    }
    
    // Add new consent IDs that aren't already in the list
    const currentConsentIds = consents.map(c => c.id);
    const updatedConsentIds = [...new Set([...userConsentIds, ...currentConsentIds])];
    
    // Only update if there's a change
    if (JSON.stringify(updatedConsentIds.sort()) !== JSON.stringify(userConsentIds.sort())) {
      localStorage.setItem('userConsentIds', JSON.stringify(updatedConsentIds));
    }

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('consentsUpdated'));
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

          // Save consent ID to backend for the user (silently, no toast)
          const username = localStorage.getItem('username');
          if (username) {
            try {
              const saveResponse = await saveUserConsent(username, id);

              // Refetch user's consent IDs
              const userId = localStorage.getItem('userId');
              if (userId) {
                const userConsentsData = await fetchUserConsents(userId);
                if (userConsentsData && userConsentsData.consentIds) {
                  localStorage.setItem('userConsentIds', JSON.stringify(userConsentsData.consentIds));
                  // Dispatch event to notify Dashboard
                  window.dispatchEvent(new Event('consentsUpdated'));
                }
              }
            } catch (saveError) {
              console.error('Error saving consent ID on redirect:', saveError);
            }
          }
          
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
      console.error("Login error:", err);
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
    e.stopPropagation();
    
    if (isSubmitting || loading) return;
    
    setIsSubmitting(true);
    setLocalError('');

    if (!formData.mobileNumber) {
      setLocalError("Mobile number is required");
      setIsSubmitting(false);
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

      // Save consent ID to backend and update user's consent list
      if (result && result.id) {
        try {
          const username = localStorage.getItem('username');
          if (username) {
            // Save consent ID for user (silently)
            await saveUserConsent(username, result.id);

            // Refetch user's consent IDs
            const userId = localStorage.getItem('userId');
            if (userId) {
              const userConsentsData = await fetchUserConsents(userId);
              if (userConsentsData && userConsentsData.consentIds) {
                localStorage.setItem('userConsentIds', JSON.stringify(userConsentsData.consentIds));
                // Dispatch event to notify Dashboard
                window.dispatchEvent(new Event('consentsUpdated'));
              }
            }
          }
        } catch (saveError) {
          console.error('Error saving consent ID:', saveError);
          // Only show error toast if linking failed
          setToastMessage({ type: 'error', text: 'Consent created but failed to link with user account' });
        }
      }

      if (result && result.url) {
        window.open(result.url, '_blank');
      }
    } catch (err) {
      console.error("Create consent error:", err);
      setLocalError('Failed to create consent.');
      setToastMessage({ type: 'error', text: 'Failed to create consent' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = (e, consentId) => {
    e.stopPropagation();
    setRevokeModal({ show: true, consentId });
  };

  const confirmRevoke = async () => {
    const consentId = revokeModal.consentId;
    if (!consentId) return;

    setIsRevoking(true);
    try {
      await axios.post(`https://api.prabalsingh.dev/api/setu/auth/${consentId}/revokeConsent`);
      
      setConsents(prev => prev.map(c => c.id === consentId ? { ...c, status: 'REVOKED' } : c));
      if (selectedConsent && selectedConsent.id === consentId) {
        setSelectedConsent(prev => ({ ...prev, status: 'REVOKED' }));
      }
      setRevokeModal({ show: false, consentId: null });
    } catch (err) {
      console.error("Revoke error:", err);
      setLocalError('Failed to revoke consent');
      setRevokeModal({ show: false, consentId: null });
    } finally {
      setIsRevoking(false);
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
              <span>Session Active {timeLeft !== null && `(${formatTime(timeLeft)})`}</span>
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
                  <button type="submit" className="btn-primary" disabled={loading || isSubmitting}>
                    {loading || isSubmitting ? 'Creating...' : 'Create Request'}
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
                          {selectedConsent.accountsLinked.map((acc, idx) => {
                            const styleObj = getCardStyle(acc.maskedAccNumber || `acc-${idx}`);
                            return (
                              <div 
                                key={idx} 
                                className={`consent-card-premium ${styleObj.pattern}`}
                                style={{ 
                                  background: styleObj.background,
                                  ...styleObj.vars
                                }}
                              >
                                <div className="card-shine"></div>
                                
                                {/* Top Row: Bank & Verification */}
                                <div className="card-top-row">
                                  <div className="provider-logo" style={{ fontSize: '1.1rem' }}>
                                    {acc.fipId ? acc.fipId.replace('setu-', '').toUpperCase() : 'BANK'}
                                  </div>
                                  <div className="status-badge-pill">
                                    <span className="status-dot-pulse active"></span>
                                    <span className="status-label">VERIFIED</span>
                                  </div>
                                </div>

                                {/* Chip Row */}
                                <div className="card-chip-row">
                                  <div className="contactless-symbol" style={{ marginLeft: 'auto' }}>
                                    <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                                      <path d="M12 10.9c-.6.6-1.5.6-2.1 0-.6-.6-.6-1.5 0-2.1.6-.6 1.5-.6 2.1 0 .6.6.6 1.5 0 2.1z" fill="rgba(255,255,255,0.8)" />
                                      <path d="M14.8 13.7c1.4-1.4 1.4-3.7 0-5.1-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0 2.2 2.2 2.2 5.7 0 7.9-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4z" fill="rgba(255,255,255,0.6)" />
                                      <path d="M17.6 16.5c2.9-2.9 2.9-7.7 0-10.6-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0 3.7 3.7 3.7 9.6 0 13.4-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4z" fill="rgba(255,255,255,0.4)" />
                                    </svg>
                                  </div>
                                </div>

                                {/* Account Number */}
                                <div className="card-number-large" style={{ fontSize: '1.4rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                                  ••••  ••••  ••••  {acc.maskedAccNumber.slice(-4)}
                                </div>

                                {/* Bottom Details */}
                                <div className="card-bottom-row">
                                  <div className="card-info-col">
                                    <span className="info-label">ACCOUNT TYPE</span>
                                    <span className="info-value">{acc.accType}</span>
                                  </div>
                                  <div className="card-info-col">
                                    <span className="info-label">FI TYPE</span>
                                    <span className="info-value">{acc.fiType}</span>
                                  </div>
                                  <div className="card-logo-circles">
                                    <div className="circle red"></div>
                                    <div className="circle yellow"></div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
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
                  {consents.map((consent, idx) => {
                    const styleObj = getCardStyle(consent.id);                    const cleanId = (consent.id || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
                    const displayId = cleanId.padEnd(16, "0").slice(0, 16).match(/.{1,4}/g)?.join(" ") || "0000 0000 0000 0000";                    return (
                        <div 
                            key={idx} 
                            className={`consent-card-premium ${styleObj.pattern}`} 
                            onClick={() => setSelectedConsent(consent)}
                            style={{ 
                                background: styleObj.background,
                                ...styleObj.vars
                            }}
                        >
                          {/* Glass Shine Effect */}
                          <div className="card-shine"></div>
                          
                          {/* Top Row: Provider & Status */}
                          <div className="card-top-row">
                              <span className="provider-logo">SETU<span className="font-light">CONSENT</span></span>
                              <div className="status-badge-pill">
                                  <span className={`status-dot-pulse ${consent.status?.toLowerCase()}`}></span>
                                  <span className="status-label">{consent.status}</span>
                              </div>
                          </div>

                          {/* Chip Row */}
                          <div className="card-chip-row">
                              <div className="contactless-symbol" style={{ marginLeft: 'auto' }}>
                                  <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
                                      <path d="M12 10.9c-.6.6-1.5.6-2.1 0-.6-.6-.6-1.5 0-2.1.6-.6 1.5-.6 2.1 0 .6.6.6 1.5 0 2.1z" fill="rgba(255,255,255,0.8)" />
                                      <path d="M14.8 13.7c1.4-1.4 1.4-3.7 0-5.1-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0 2.2 2.2 2.2 5.7 0 7.9-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4z" fill="rgba(255,255,255,0.6)" />
                                      <path d="M17.6 16.5c2.9-2.9 2.9-7.7 0-10.6-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0 3.7 3.7 3.7 9.6 0 13.4-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4z" fill="rgba(255,255,255,0.4)" />
                                  </svg>
                              </div>
                          </div>

                          {/* Card Number (Consent ID) */}
                          <div className="card-number-large">
                              {displayId}
                          </div>

                          {/* Bottom Details */}
                          <div className="card-bottom-row">
                              <div className="card-info-col">
                                  <span className="info-label">AUTHORIZED FOR</span>
                                  <span className="info-value truncate w-32" title={consent.vua}>{consent.vua ? consent.vua.split('@')[0].toUpperCase() : 'USER'}</span>
                              </div>
                              <div className="card-info-col">
                                  <span className="info-label">VALID THRU</span>
                                  <span className="info-value">
                                      {consent.dataRange?.to 
                                        ? new Date(consent.dataRange.to).toLocaleDateString(undefined, { month: '2-digit', year: '2-digit' }) 
                                        : '12/99'}
                                  </span>
                              </div>
                              {/* Revoke visual button (small) */}
                              {consent.status !== 'REVOKED' && (
                                 <button 
                                    className="card-revoke-icon"
                                    onClick={(e) => handleRevoke(e, consent.id)}
                                    title="Revoke"
                                 >
                                    <LogOut size={16} />
                                 </button>
                              )}
                              <div className="card-logo-circles">
                                  <div className="circle red"></div>
                                  <div className="circle yellow"></div>
                              </div>
                          </div>
                        </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {(error || localError) && (
        <Toast 
          message={error || localError} 
          type="error" 
          onClose={() => {
            setLocalError('');
            clearError();
          }} 
        />
      )}

      <ConfirmationModal
        isOpen={revokeModal.show}
        onClose={() => setRevokeModal({ show: false, consentId: null })}
        onConfirm={confirmRevoke}
        title="Revoke Consent"
        message="Are you sure you want to revoke this consent? This action cannot be undone."
        isLoading={isRevoking}
      />

      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default ConsentManager;
