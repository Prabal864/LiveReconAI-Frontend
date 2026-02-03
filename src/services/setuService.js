
import axios from "axios";

const API_URL = "https://fiu-uat.setu.co"; // Example URL, should be configured

export const setuService = {
  login: async () => {
    console.log("Logging in to SETU via backend...");
    try {
      const response = await axios.post("http://localhost:8072/api/setu/auth/login", {}, {
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
      const response = await axios.post("http://localhost:8072/api/setu/auth/consent", consentDetails, {
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
      const response = await axios.get(`http://localhost:8072/api/setu/auth/${consentId}/status?expanded=false`, {
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
        // User specified port 8085 for this specific endpoint
        // Sending empty body {} is important for some backend frameworks to process POST correctly
        const response = await axios.get(`http://localhost:8085/api/setu/transaction/${consentId}/ingestData`, {}, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 120000 // 120 seconds (2 minutes) timeout for long-running ingest operation
        });
        return response.data;
    } catch (error) {
        // Log detailed error for debugging
        if (error.response) {
            console.error("Ingest Data Server Error:", error.response.status, error.response.data);
            // Throw more descriptive error if available
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
