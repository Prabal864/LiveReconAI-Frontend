import axios from 'axios';

export const API_BASE_URL = 'https://api.prabalsingh.dev/api';

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Handle body for axios (axios uses 'data', fetch uses 'body')
  const { body, ...restOptions } = options;

  const config = {
    url,
    method: options.method || 'GET',
    headers,
    ...restOptions,
    data: body,
    withCredentials: true, // axios equivalent of credentials: 'include'
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`API error: ${error.response.status}`);
    }
    throw error;
  }
}

// Fetch all transactions for a consentId (pagination handled on frontend)
export async function fetchTransactionsByConsentId(consentId) {
  const SERVER_PORT = import.meta.env.VITE_SERVER_PORT || 8085;
  const url = `https://api.prabalsingh.dev/api/setu/transaction/byConsentID?consentId=${consentId}`;
  try {
    const headers = {};
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}
