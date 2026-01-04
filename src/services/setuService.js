
const API_URL = "https://fiu-uat.setu.co"; // Example URL, should be configured

export const setuService = {
  login: async () => {
    console.log("Logging in to SETU via backend...");
    try {
      const response = await fetch("http://localhost:8072/api/setu/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("SETU Login Error:", error);
      throw error;
    }
  },

  createConsent: async (token, consentDetails) => {
    console.log("Creating consent via backend...", consentDetails);
    try {
      const response = await fetch("http://localhost:8072/api/setu/auth/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(consentDetails)
      });

      if (!response.ok) {
        throw new Error(`Consent creation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("SETU Consent Error:", error);
      throw error;
    }
  },

  getConsentStatus: async (token, consentId) => {
    console.log(`Fetching consent status for ${consentId}...`);
    try {
      const response = await fetch(`http://localhost:8072/api/setu/auth/${consentId}/status?expanded=false`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch consent status: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("SETU Consent Status Error:", error);
      throw error;
    }
  }
};
