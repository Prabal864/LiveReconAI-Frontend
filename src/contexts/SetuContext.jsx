import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const login = async () => {
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
  };

  const createConsent = async (consentDetails) => {
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
  };

  const getConsentStatus = async (consentId) => {
    if (!token) {
      // If token is not in state, check localStorage one last time (edge case on reload)
      const storedToken = localStorage.getItem('access_token');
      if (!storedToken) {
        setError("Authentication required");
        throw new Error("Authentication required");
      }
      // Use stored token if state is not yet updated
      try {
        const result = await setuService.getConsentStatus(storedToken, consentId);
        return result;
      } catch (err) {
        console.error(err);
        setError('Failed to fetch consent status.');
        throw err;
      }
    }
    
    setLoading(true);
    setError(null);
    try {
      const result = await setuService.getConsentStatus(token, consentId);
      return result;
    } catch (err) {
      console.error(err);
      setError('Failed to fetch consent status.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('access_token');
  };

  const value = {
    token,
    loading,
    error,
    login,
    logout,
    createConsent,
    getConsentStatus
  };

  return (
    <SetuContext.Provider value={value}>
      {children}
    </SetuContext.Provider>
  );
};
