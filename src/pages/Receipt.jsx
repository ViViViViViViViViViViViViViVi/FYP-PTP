import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/receipt.css';

const Receipt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { symbol, price: rawPrice, type } = location.state || { symbol: "BTC", price: 60000, type: "BUY" };
  const price = parseFloat(rawPrice); 
  const [balance, setBalance] = useState(0);
  const [quantity, setQuantity] = useState(1); 
  const [leverage, setLeverage] = useState(1);
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");

  const currentUserId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchLiveAccount = async () => {
      if (!currentUserId) return;
      try {
        const response = await fetch(`http://localhost:5000/api/receipt/user-details/${currentUserId}`);
        const data = await response.json();
        if (data && data.balance) {
          const liveBalance = parseFloat(data.balance);
          setBalance(liveBalance);
          
          const riskAmount = liveBalance * 0.05;
          const priceMove = riskAmount / quantity;
          const initialSL = type === 'BUY' ? (price - priceMove) : (price + priceMove);
          
          setStopLoss(initialSL.toFixed(2));
          setTakeProfit((type === 'BUY' ? price * 1.10 : price * 0.90).toFixed(2));
        }
      } catch (err) {
        console.error("Balance fetch failed:", err);
      }
    };
    fetchLiveAccount();
  }, [currentUserId, price, type]);

  const totalValue = useMemo(() => (price * quantity).toFixed(2), [price, quantity]);
  const marginRequired = useMemo(() => (totalValue / leverage).toFixed(2), [totalValue, leverage]);
  
  const maxLoss = useMemo(() => {
    const sl = parseFloat(stopLoss) || 0;
    const diff = Math.abs(price - sl);
    return (diff * quantity).toFixed(2);
  }, [price, stopLoss, quantity]);

  const estProfit = useMemo(() => {
    const tp = parseFloat(takeProfit) || 0;
    const diff = Math.abs(tp - price);
    return (diff * quantity).toFixed(2);
  }, [price, takeProfit, quantity]);


  // TRADE EXECUTION
  const handleTrade = async () => {
    const token = localStorage.getItem('token'); 

    const tradeData = {
      user_id: currentUserId,
      symbol: symbol,
      type: type,
      entry_price: price,
      quantity: quantity,
      risk_score: ((parseFloat(maxLoss) / balance) * 100).toFixed(2)
    };

    try {
      const response = await fetch('http://localhost:5000/api/receipt/submit-to-buffer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(tradeData)
      });

      if (response.ok) {
        alert("Trade sent to Admin Buffer.");
        navigate('/profile');
      } else if (response.status === 401) {
        alert("Session expired. Please login again.");
        navigate('/login');
      }
    } catch (err) {
      console.error("Buffer Error:", err);
    }
  };

  return (
    <div className="receipt-page-wrapper">
      <div className="receipt-pill-container">
        
        <div className={`trade-type-header ${type.toLowerCase()}`}>
          {type} {symbol} NOW
        </div>
        <div className="risk-dashboard">
          <div className="risk-col sl">
            <span className="risk-label">STOP LOSS</span>
            <input 
              type="number" 
              value={stopLoss} 
              onChange={(e) => setStopLoss(e.target.value)} 
            />
            <span className="risk-subtext">5% Auto-Protection</span>
          </div>

          <div className="risk-col entry">
            <span className="risk-label">ENTRY PRICE</span>
            <span className="entry-value">${price.toLocaleString()}</span>
            <span className="risk-subtext">Market Value</span>
          </div>

          <div className="risk-col tp">
            <span className="risk-label">TAKE PROFIT</span>
            <input 
              type="number" 
              value={takeProfit} 
              onChange={(e) => setTakeProfit(e.target.value)} 
            />
            <span className="risk-subtext">Target Gain</span>
          </div>
        </div>

        <div className="order-controls-grid">
          <div className="control-item">
            <label>Leverage (Multiplier)</label>
            <select value={leverage} onChange={(e) => setLeverage(Number(e.target.value))}>
              <option value={1}>1x</option>
              <option value={10}>10x</option>
              <option value={50}>50x</option>
            </select>
          </div>

          <div className="control-item">
            <label>Order Quantity</label>
            <input 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(Number(e.target.value))} 
            />
          </div>
        </div>

        <div className="financial-health-box">
          <div className="health-row">
            <span>Available Balance:</span>
            <span className="balance-value">${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
          <div className="health-row">
            <span>Estimated Profit:</span>
            <span className="profit-value" style={{color: '#44ff44', fontWeight: 'bold'}}>
              +${estProfit}
            </span>
          </div>
          <div className="health-row highlight-risk">
            <span>Calculated Risk (Max Loss):</span>
            <span className="risk-value">${maxLoss}</span>
          </div>
          <p className="education-note">
            *This trade risks exactly <strong>5.0%</strong> of your total ${balance.toLocaleString()} equity.
          </p>
        </div>

        <div className="receipt-actions">
          <button className={`execute-btn ${type.toLowerCase()}`} onClick={handleTrade}>
            Confirm {type}
          </button>
          <button className="cancel-btn" onClick={() => navigate('/home')}>Abandon Trade</button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
