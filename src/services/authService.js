// authService.js
// Example service for authentication API calls
import { apiFetch } from '../api';
import axios from 'axios';

export async function login(data) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Fetch user-specific consent IDs
export async function fetchUserConsents(userId) {
  try {
    const response = await axios.get(`https://api.prabalsingh.dev/api/auth/internal/user/${userId}/consents`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user consents:', error);
    throw error;
  }
}

// Save consent ID for user
export async function saveUserConsent(username, consentId) {
  try {
    const response = await axios.post('https://api.prabalsingh.dev/api/auth/internal/user/consent', {
      username,
      consentId
    });
    return response.data;
  } catch (error) {
    console.error('Error saving user consent:', error);
    throw error;
  }
}
