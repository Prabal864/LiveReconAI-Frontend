import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { setuService } from '../services/setuService';

const SetuContext = createContext(null);

export const useSetu = () => {
  const context = useContext(SetuContext);
  if (!context) {
    throw new Error('useSetu must be used within a SetuProvider');
  }
  return context;
};

export const SetuProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
/* removed useEffect that was reading from localStorage */

  const login = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await setuService.login();
      // Assuming the backend returns { token: "..." } or similar. 
      // Adjust if it returns just the string or different key.
      const accessToken = response.token || response.accessToken || (typeof response === 'string' ? response : null);
      
      if (accessToken) {
        setToken(accessToken);
        localStorage.setItem('access_token', accessToken);
      } else {
        throw new Error("Invalid token received from backend");
      }
    } catch (err) {
      console.error(err);
      setError('Failed to login to SETU. Please check backend connection.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createConsent = useCallback(async (consentDetails) => {
    if (!token) {
      setError("Authentication required");
      throw new Error("Authentication required");
    }
    setLoading(true);
    setError(null);
    try {
      const result = await setuService.createConsent(token, consentDetails);
      return result;
    } catch (err) {
      console.error(err);
      setError('Failed to create consent.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const getConsentStatus = useCallback(async (consentId) => {
    // If token is not in state, check localStorage one last time (edge case on reload)
    const currentToken = token || localStorage.getItem('access_token');
    
    if (!currentToken) {
      setError("Authentication required");
      throw new Error("Authentication required");
    }
    
    setLoading(true);
    setError(null);
    try {
      const result = await setuService.getConsentStatus(currentToken, consentId);
      return result;
    } catch (err) {
      console.error(err);
      setError('Failed to fetch consent status.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('access_token');
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(() => ({
    token,
    loading,
    error,
    login,
    logout,
    createConsent,
    getConsentStatus,
    clearError
  }), [token, loading, error, login, logout, createConsent, getConsentStatus, clearError]);

  return (
    <SetuContext.Provider value={value}>
      {children}
    </SetuContext.Provider>
  );
};
