
import axios from "axios";
import { fetchTransactionsByConsentId } from "../api";

const API_URL = "https://fiu-uat.setu.co"; // Example URL, should be configured

export const setuService = {
  login: async () => {
    console.log("Logging in to SETU via backend...");
    try {
      const response = await axios.post("https://api.prabalsingh.dev/api/setu/auth/login", {}, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.error("SETU Login Error:", error);
      throw error;
    }
  },

  createConsent: async (token, consentDetails) => {
    console.log("Creating consent via backend...", consentDetails);
    try {
      const response = await axios.post("https://api.prabalsingh.dev/api/setu/auth/consent", consentDetails, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error("SETU Consent Error:", error);
      throw error;
    }
  },

  getConsentStatus: async (token, consentId) => {
    console.log(`Fetching consent status for ${consentId}...`);
    try {
      const response = await axios.get(`https://api.prabalsingh.dev/api/setu/auth/${consentId}/status?expanded=false`, {
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });

      return response.data;
    } catch (error) {
      console.error("SETU Consent Status Error:", error);
      throw error;
    }
  },

  ingestData: async (consentId) => {
    console.log(`Ingesting data for consent ${consentId}...`);
    try {
        const userId = localStorage.getItem('userId') || localStorage.getItem('username') || 'Unknown';
        
        // First, fetch the transactions for this consent
        const transactionData = await fetchTransactionsByConsentId(consentId);
        const transactions = Array.isArray(transactionData) ? transactionData : (transactionData.transactions || []);
        
        // Then, send to the new ingest endpoint
        const response = await axios.post('https://api.prabalsingh.dev/ingest', {
            context_data: transactions,
            user_id: userId
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 120000
        });
        
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error("Ingest Data Server Error:", error.response.status, error.response.data);
            const serverMsg = error.response.data && (error.response.data.message || error.response.data.error);
            if (serverMsg) throw new Error(serverMsg);
        } else if (error.request) {
            console.error("Ingest Data Network Error - No Response:", error.request);
        } else {
            console.error("Ingest Data Setup Error:", error.message);
        }
        throw error;
    }
  }
};
