const DEFAULT_KEY = import.meta.env.VITE_POLYGON_KEY;

export const getCandlestickData = async (symbol, range = "1M", apiKey = DEFAULT_KEY) => {
  if (!symbol) return null;

  // CALCULATE DATE WINDOW
  const to = new Date().toISOString().split('T')[0];
  const fromDate = new Date();

  if (range === '1W') fromDate.setDate(fromDate.getDate() - 7);
  else if (range === '1M') fromDate.setMonth(fromDate.getMonth() - 1);
  else if (range === '1Y') fromDate.setFullYear(fromDate.getFullYear() - 1);

  const from = fromDate.toISOString().split('T')[0];


  // API REQUEST
  try {
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${apiKey}`
    );

    if (response.status === 429) {
      console.error("Polygon Rate Limit Hit (5 calls/min)");
      return { error: "RATE_LIMIT" };
    }

    const data = await response.json();

    if (data.results) {
      return data.results.map(item => ({
        x: item.t,              
        y: [
          parseFloat(item.o),   
          parseFloat(item.h),   
          parseFloat(item.l),   
          parseFloat(item.c)    
        ]
      }));
    }
    
    return [];
  } catch (err) {
    console.error("Polygon API Failure:", err);
    throw err;
  }
};