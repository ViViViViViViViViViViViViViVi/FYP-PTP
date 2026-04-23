import axios from 'axios';

const FINNHUB_KEY = 'd5qgpspr01qhn30fjr20d5qgpspr01qhn30fjr2g';
const BASE_URL = 'https://finnhub.io/api/v1';

// Function to get the Current Quote (Price)
export const getLiveQuote = async (symbol) => {
  const response = await axios.get(`${BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
  return response.data; // This returns { c: price, h: high, l: low... }
};

// Function to get Company Information
export const getCompanyProfile = async (symbol) => {
  const response = await axios.get(`${BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_KEY}`);
  return response.data;
};