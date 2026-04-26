import axios from 'axios';

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

// FUNCTION TO GET LIVE QUOTE
export const getLiveQuote = async (symbol) => {
  const response = await axios.get(`${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
  return response.data; 
};

// FUNCTION TO GET COMPANY PROFILE 
export const getCompanyProfile = async (symbol) => {
  const response = await axios.get(`${BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_KEY}`);
  return response.data;
};