/**
 * Utility for fetching OHLC (Candlestick) data from Polygon.io
 * Free Tier: 5 calls per minute
 */

// Your active key is now the default fall-back
const DEFAULT_KEY = "FGpzAasZM9u19u7BB8pTGkQADIy81uaT";

export const getCandlestickData = async (symbol, range = "1M", apiKey = DEFAULT_KEY) => {
  if (!symbol) return null;
  if (!symbol) return null;

  // 1. Calculate the date window (Date Math)
  const to = new Date().toISOString().split('T')[0];
  const fromDate = new Date();

  // Range Logic: Determines the look-back period
  if (range === '1W') fromDate.setDate(fromDate.getDate() - 7);
  else if (range === '1M') fromDate.setMonth(fromDate.getMonth() - 1);
  else if (range === '1Y') fromDate.setFullYear(fromDate.getFullYear() - 1);

  const from = fromDate.toISOString().split('T')[0];

  // 2. The API Request
  try {
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${apiKey}`
    );

    // Handle Rate Limiting
    if (response.status === 429) {
      console.error("Polygon Rate Limit Hit (5 calls/min)");
      return { error: "RATE_LIMIT" };
    }

    const data = await response.json();

    if (data.results) {
      // 3. Format specifically for ApexCharts OHLC
      return data.results.map(item => ({
        x: item.t, // Unix Timestamp
        y: [
          parseFloat(item.o), // Open
          parseFloat(item.h), // High
          parseFloat(item.l), // Low
          parseFloat(item.c)  // Close
        ]
      }));
    }
    
    return [];
  } catch (err) {
    console.error("Polygon API Failure:", err);
    throw err;
  }
};