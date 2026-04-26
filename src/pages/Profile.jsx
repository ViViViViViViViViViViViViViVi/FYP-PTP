import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '../css/profile.css';

const Profile = () => {

  const [transactions, setTransactions] = useState([]);
  const [bufferTrades, setBufferTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [userData, setUserData] = useState({ 
    name: "User", 
    balance: 100.00, 
    totalWins: 0 
  });

  const currentUserId = localStorage.getItem('user_id');
  const FINNHUB_KEY = 'X';


  const fetchProfileData = useCallback(async () => {
    if (!currentUserId || currentUserId === "undefined") {
      setLoading(false);
      return;
    }

    try {
      const [transRes, userRes, bufferRes] = await Promise.all([
        fetch(`http://localhost:5000/api/profile/return-transactions/${currentUserId}`), 
        fetch(`http://localhost:5000/api/profile/return-name/${currentUserId}`),         
        fetch(`http://localhost:5000/api/profile/return-buffer/${currentUserId}`)        
      ]);

      const transData = await transRes.json();
      const userDataRes = await userRes.json();
      const bufferData = await bufferRes.json();

      setTransactions(Array.isArray(transData) ? transData : []);
      setBufferTrades(Array.isArray(bufferData) ? bufferData : []);

      if (userDataRes) {
        setUserData({
          name: userDataRes.full_name || "User",
          balance: parseFloat(userDataRes.balance) || 100.00,
          totalWins: parseInt(userDataRes.total_wins) || 0
        });
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);


  const stats = useMemo(() => {
    let won = 0, be = 0, lost = 0, moneyWon = 0, moneyLost = 0;

    transactions.forEach(t => {
      const pnl = (parseFloat(t.profit_loss) || 0) * (parseInt(t.quantity) || 1);
      const outcome = t.outcome || (pnl > 0 ? 'WIN' : pnl < 0 ? 'LOSS' : 'NEUTRAL');

      if (outcome === 'WIN') { won++; moneyWon += pnl; }
      else if (outcome === 'NEUTRAL') { be++; }
      else if (outcome === 'LOSS') { lost++; moneyLost += Math.abs(pnl); }
    });

    return { won, be, lost, moneyWon, moneyLost };
  }, [transactions]);

  const progressWidth = Math.min((userData.totalWins / 50) * 100, 100);


  const handleClosePosition = async (trade) => {
    try {
      const priceRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${trade.symbol}&token=${FINNHUB_KEY}`);
      const priceData = await priceRes.json();
      const liveExitPrice = priceData.c;

      const response = await fetch(`http://localhost:5000/api/profile/close-position/${trade.transaction_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exit_price: liveExitPrice })
      });

      if (response.ok) {
        alert(`Position Closed Successfully at $${liveExitPrice}`);
        fetchProfileData();
      }
    } catch (err) {
      alert("Error closing position. Please check your connection.");
    }
  };



  const allDisplayTrades = useMemo(() => {
    const pending = bufferTrades.map(t => ({ 
      ...t, 
      status: 'AWAITING AUTHORISATION', 
      transaction_id: `buf-${t.id}` 
    }));
    return [...pending, ...transactions];
  }, [bufferTrades, transactions]);


  // FILTER LOGIC
  const filteredTransactions = useMemo(() => {
    return allDisplayTrades.filter(t => {
      const status = (t.status || '').toUpperCase().trim();
      
      if (filterStatus === 'ALL') return true;
      if (filterStatus === 'AWAITING AUTHORISATION') return status === 'AWAITING AUTHORISATION';
      if (filterStatus === 'ACTIVE') return status === 'OPEN';
      if (filterStatus === 'CLOSED') return status === 'CLOSED';
      return true;
    });
  }, [allDisplayTrades, filterStatus]);

  if (loading) return (
    
    <div className="profile-page-wrapper">
      <div className="main-pill-container loading-state">Syncing Performance Data...</div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="glass-pill">
        <h1 className="user-firstname-title">{userData.name}'s Portfolio</h1>
        
        <div className="profile-flex-content">
          <div className="performance-dashboard-panel">
            <div className="dashboard-header">
              <span className="small-greeting">Account Analytics</span>
            </div>

            <div className="stats-split-box">
              <div className="stat-segment won">
                <span className="stat-label">Wins (TP)</span>
                <span className="stat-value">{stats.won}</span>
              </div>
              <div className="stat-segment be">
                <span className="stat-label">B.E</span>
                <span className="stat-value">{stats.be}</span>
              </div>
              <div className="stat-segment lost">
                <span className="stat-label">Losses (SL)</span>
                <span className="stat-value">{stats.lost}</span>
              </div>
            </div>

            <div className="milestone-container">
              <div className="milestone-labels">
                <span>Novice</span><span>Pro</span><span>Elite</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressWidth}%` }}></div>
              </div>
              <p className="milestone-subtext">{userData.totalWins} / 50 Wins to Elite Ranking</p>
            </div>

            <div className="financial-summary-box">
  <div className="summary-row">
    <span>Total Profit:</span>
    <span className="profit-text">+${stats.moneyWon.toFixed(2)}</span>
  </div>
  <div className="summary-row">
    <span>Total Loss:</span>
    <span className="loss-text">-${stats.moneyLost.toFixed(2)}</span>
  </div>
  <hr className="summary-divider" />
  <div className="summary-row equity-total">
    <span>Available Balance:</span>
    <span>
      $
      {(
        (parseFloat(userData.originalBalance) || 1000.00) + 
        stats.moneyWon - 
        stats.moneyLost
      ).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  </div>
</div>
          </div>

          <div className="table-section-profile">
            <div className="table-header-flex">
              <h3 className="section-title">Trade History</h3>
              <div className="filter-group">
                {['ALL', 'AWAITING AUTHORISATION', 'ACTIVE', 'CLOSED'].map(status => (
                  <button 
                    key={status} 
                    className={`filter-btn ${filterStatus === status ? 'active' : ''}`} 
                    onClick={() => setFilterStatus(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-scroll-wrapper">
              <table className="profile-table">
                <thead>
                  <tr>
                    <th>Asset</th><th>Type</th><th>Entry</th><th>Exit/Live</th><th>P/L</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((t) => {
                      const isPending = t.status === 'AWAITING AUTHORISATION';
                      const pl = isPending ? 0 : (parseFloat(t.profit_loss) || 0) * (parseInt(t.quantity) || 1);
                      
                      return (
                        <tr key={t.transaction_id} className={isPending ? 'row-awaiting' : ''}>
                          <td><strong>{t.symbol}</strong></td>
                          <td className={t.type === 'BUY' ? 'buy-text' : 'sell-text'}>{t.type}</td>
                          <td>${parseFloat(t.entry_price || 0).toFixed(2)}</td>
                          <td>{isPending ? '---' : (t.exit_price ? `$${parseFloat(t.exit_price).toFixed(2)}` : 'Market...')}</td>
                          <td className={pl >= 0 ? 'profit-text' : 'loss-text'}>
                            {isPending ? 'PENDING' : `${pl >= 0 ? '+' : ''}${pl.toFixed(2)}`}
                          </td>
                          <td>
                            <span className={`status-pill ${t.status.replace(/\s+/g, '-').toLowerCase()}`}>
                              {t.status}
                            </span>
                          </td>
                          <td>
                            {t.status === 'OPEN' && (
                              <button className="close-trade-btn" onClick={() => handleClosePosition(t)}>Close</button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="7" className="empty-row">No trade data available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
