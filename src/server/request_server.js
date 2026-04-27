import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});


export const loginRequest = async (email, password) => {
  return await api.post('/login', { email, password });
};


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

export const closePositionRequest = async (transactionId, exitPrice) => {
  return await api.put(`/close-position/${transactionId}`, { 
    exit_price: exitPrice 
  });
};

export const logUserAction = async (actionData) => {
  return await api.post('/log-action', actionData);
};