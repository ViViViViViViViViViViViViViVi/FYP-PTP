import axios from 'axios';

// 1. INITIALISE THE SERVER LINK
// This is the "Front Door" to your Express server
const BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// 2. AUTHENTICATION FUNCTIONS
export const loginRequest = async (email, password) => {
  // This replaces your old "res.json" logic we fixed earlier
  return await api.post('/login', { email, password });
};

// 3. PROFILE & ACCOUNT DATA FUNCTIONS
// This combines the 3 fetches from your Profile page into 1 easy call
export const fetchFullProfile = async (userId) => {
  const [transRes, userRes, bufferRes] = await Promise.all([
    api.get(`/return-transactions/${userId}`),
    api.get(`/return-name/${userId}`),
    api.get(`/return-buffer/${userId}`)
  ]);
  
  return {
    transactions: transRes.data,
    userData: userRes.data,
    buffer: bufferRes.data
  };
};

// 4. TRADING & ACTIONS
export const closePositionRequest = async (transactionId, exitPrice) => {
  return await api.put(`/close-position/${transactionId}`, { 
    exit_price: exitPrice 
  });
};

// Helper for Admin/Action Logs
export const logUserAction = async (actionData) => {
  return await api.post('/log-action', actionData);
};