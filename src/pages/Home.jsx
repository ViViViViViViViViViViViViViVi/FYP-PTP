import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StockChart from '../components/StockChart';
import { getLiveQuote, getCompanyProfile } from '../api/finnhub-api';
import { logUserAction } from '../server/request_server';

import '../css/home.css';


const getMarketStatus = (hour, mins, day) => {
  const isWeekend = (day === 0 || day === 6);
  if (isWeekend) return "CLOSED";
  if ((hour > 14 || (hour === 14 && mins >= 30)) && hour < 21) return "OPEN";
  if (hour >= 21 || hour < 1) return "AFTER-HOURS";
  return "CLOSED";
};


function Home({ symbol, user }) {
  const navigate = useNavigate();
  const [stockPrice, setStockPrice] = useState(0);
  const [marketStatus, setMarketStatus] = useState("CLOSED");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [companyInfo, setCompanyInfo] = useState({ name: '', marketCap: 0, currency: '' });
  const [globalMarkets, setGlobalMarkets] = useState({ 
    sydney: "CLOSED", tokyo: "CLOSED", london: "CLOSED", newYork: "CLOSED" 
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchDashboardData = useCallback(async () => {
    if (!symbol) return;

    try {
      const profile = await getCompanyProfile(symbol);
      
      setCompanyInfo({
        name: profile.name || symbol,
        marketCap: profile.marketCapitalization || 0,
        currency: profile.currency || 'USD'
      });

      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const d = now.getDay();

      setMarketStatus(getMarketStatus(h, m, d));
      
      setGlobalMarkets({
        sydney: (h >= 23 || h < 5) && d !== 0 && d !== 6 ? "OPEN" : "CLOSED",
        tokyo: (h >= 0 && h < 6) && d !== 0 && d !== 6 ? "OPEN" : "CLOSED",
        london: ((h >= 8 && h < 16) || (h === 16 && m <= 30)) && d !== 0 && d !== 6 ? "OPEN" : "CLOSED",
        newYork: getMarketStatus(h, m, d) === "OPEN" ? "OPEN" : "CLOSED"
      });

    } catch (err) {
      console.error("Dashboard Metadata Error:", err);
    }
  }, [symbol]);


  const fetchPriceOnly = useCallback(async () => {
    if (!symbol) return;
    try {
      const quote = await getLiveQuote(symbol);
      if (quote.c) {
        setStockPrice(quote.c);
      }
    } catch (err) {
      console.error("Price Fetch Error:", err);
    }
  }, [symbol]);



  useEffect(() => {
    fetchDashboardData();
    fetchPriceOnly();

    const priceTimer = setInterval(fetchPriceOnly, 2000);

    const dashboardTimer = setInterval(() => {
      fetchDashboardData();
      setRefreshTrigger(prev => prev + 1);
    }, 30000);

    return () => {
      clearInterval(priceTimer);
      clearInterval(dashboardTimer);
    };
  }, [fetchDashboardData, fetchPriceOnly]);


  const handleTrade = (type) => {
    navigate('/receipt', { 
      state: { symbol, price: stockPrice.toFixed(2), quantity: 10, type } 
    });
  };

  return (
    <div className="page-wrapper">
      <div className="glass-pill">
        <div className="dashboard-flex-content">
          <div className="graph-section">
            <div className="header-flex">
              <h3 className="chart-ticker">{symbol} / {companyInfo.currency}</h3>
              <div className="global-status-container">
                <MarketTag label="SYD" status={globalMarkets.sydney} />
                <MarketTag label="TYO" status={globalMarkets.tokyo} />
                <MarketTag label="LDN" status={globalMarkets.london} />
                <MarketTag label="NY" status={globalMarkets.newYork} />
              </div>
            </div>

            <div className="placeholder-chart">
              <StockChart symbol={symbol} key={`${symbol}-${refreshTrigger}`} />
            </div>
          </div>

          <div className="stats-section">
            <div className="info-box centered-content">
              <h3>{companyInfo.name}</h3>
              <p className="market-cap">Market Cap: ${(companyInfo.marketCap / 1000).toFixed(2)}B</p>
              <p className={`status-label ${marketStatus.toLowerCase().replace('-', '')}`}>
                {marketStatus}
              </p>
            </div>

            <div className="profit-box centered-content">
              <h3 className="price-title">Current Price</h3>
              <p className="profit-amount">${stockPrice.toFixed(2)}</p>
              
              <div className="trade-actions">
                <button className="btn-buy" onClick={() => handleTrade('BUY')}>
                  Buy {symbol}
                </button>
                <button className="btn-sell" onClick={() => handleTrade('SELL')}>
                  Sell {symbol}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MarketTag = ({ label, status }) => (
  <div className={`market-tag ${status === "OPEN" ? "open" : "closed"}`}>
    {label}: {status}
  </div>
);

export default Home;
