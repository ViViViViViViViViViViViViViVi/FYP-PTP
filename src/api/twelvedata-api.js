import axios from 'axios';

const TWELVE_KEY = '3e8fd5750eaf47b0908328222611507d';

export const getChartHistory = async (symbol) => {
  // We'll calculate the end_date right here in the service
  const now = new Date();
  const coeff = 1000 * 60 * 5;
  const roundedUK = new Date(Math.floor(now.getTime() / coeff) * coeff);
  const usDate = new Date(roundedUK.getTime() - (5 * 60 * 60 * 1000));
  const endDateStr = usDate.toISOString().slice(0, 19).replace('T', ' ');

  const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=5min&outputsize=12&end_date=${endDateStr}&apikey=${TWELVE_KEY}`;
  
  const response = await axios.get(url);
  return response.data;
};