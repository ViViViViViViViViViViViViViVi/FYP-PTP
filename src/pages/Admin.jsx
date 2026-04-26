import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/admin.css';

const Admin = () => {

  const navigate = useNavigate();
  const [bufferTrades, setBufferTrades] = useState([]);      
  const [logs, setLogs] = useState([]);                      
  const [users, setUsers] = useState([]);                    
  const [stats, setStats] = useState({ totalProfit: 0, totalUsers: 0 }); 


  // DATA FETCHING & LIVE SYNC
  const refreshDashboard = useCallback(async () => {
    try {
      const [bufferRes, logsRes, usersRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/view-buffer'),
        fetch('http://localhost:5000/api/admin/logs'),
        fetch('http://localhost:5000/api/admin/users'),
        fetch('http://localhost:5000/api/admin/platform-stats')
      ]);

      const bufferData = await bufferRes.json();
      const logsData = await logsRes.json();
      const usersData = await usersRes.json();
      const statsData = await statsRes.json();

      setBufferTrades(Array.isArray(bufferData) ? bufferData : []);
      setLogs(Array.isArray(logsData) ? logsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setStats(statsData);
    } catch (err) {
      console.error("Dashboard Refresh Failed:", err);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
    const interval = setInterval(refreshDashboard, 5000);
    return () => clearInterval(interval); 
  }, [refreshDashboard]);


  // ADUIT TRADE DETAILS
  const handleViewTrade = (trade) => {
    alert(`
      --- BUFFER SECURITY AUDIT ---
      Trader: ${trade.full_name}
      Symbol: ${trade.symbol}
      Type: ${trade.type}
      Price: £${parseFloat(trade.entry_price).toFixed(2)}
      
      ANALYSIS: Trade is currently AWAITING AUTHORISATION.
    `);
  };


// TRADE AUTHORISATION 
  const authorizeTrade = async (id) => {
    if (!window.confirm(`Authorize trade #${id}?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/authorize-and-move/${id}`, {
        method: 'POST'
      });

      const result = await response.json();

      if (result.error) {
        alert(`Failed: ${result.error}`);
      } else {
        console.log("ORDER_AUTHORISED");
        refreshDashboard();
      }
    } catch (err) {
      alert("Network Error: Could not connect to the server.");
    }
  };


  // TRADE REJECTION 
  const rejectTrade = async (id) => {
    if (!window.confirm("Reject and delete this trade?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/reject-buffer-trade/${id}`, {
        method: 'POST'
      });

      const result = await response.json();

      if (result.error) {
        alert(`Reject Failed: ${result.error}`);
      } else {
        console.log("ORDER_REJECTED");
        refreshDashboard();
      }
    } catch (err) {
      console.error("Network Error during rejection:", err);
    }
  };


  // LOGOUT
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };


  return (
    <div className="admin-container">
      <header className="admin-main-header">
        <div className="header-left">
          <h1>Admin</h1>
          <p className="admin-subtitle">Paper Trading Web Application</p>
        </div>
        <button className="admin-logout-btn" onClick={handleLogout}>Sign Out</button>
      </header>

      <div className="admin-grid-2x2">

        <section className="admin-section">
          <span className="section-pill color-grey">Console Detections</span>
          <div className="log-list">
            {logs.length > 0 ? logs.map(log => (
              <div key={log.id} className="log-item">
                <span className="log-time">[{new Date(log.created_at).toLocaleTimeString()}]</span> 
                <strong style={{marginLeft: '5px'}}>{log.action}:</strong> {log.details}
              </div>
            )) : <p className="empty-state">Waiting for activity...</p>}
          </div>
        </section>

        <section className="admin-section">
          <span className="section-pill color-blue">Trade Buffer</span>
          <div className="trade-approval-list">
            <table className="admin-mini-table">
              <thead>
                <tr>
                  <th>Trader</th>
                  <th>Asset</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bufferTrades.length > 0 ? bufferTrades.map(trade => (
                  <tr key={trade.id}>
                    <td>{trade.full_name}</td>
                    <td><strong>{trade.symbol}</strong></td>
                    <td className="admin-actions-cell">
                      <button className="view-btn" onClick={() => handleViewTrade(trade)}>View</button>
                      <button className="auth-btn" onClick={() => authorizeTrade(trade.id)}>Authorize</button>
                      <button className="reject-btn" onClick={() => rejectTrade(trade.id)}>Reject</button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="3" className="empty-state">Buffer Empty.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section">
          <span className="section-pill color-purple">System Accounts</span>
          <div className="account-stats">
            <div className="stat-row">
              <span>Total Registered Traders:</span>
              <strong>{stats.totalUsers}</strong>
            </div>
            
          </div>
        </section>

        <section className="admin-section">
          <span className="section-pill color-green">Platform Revenue</span>
          <div className="financial-card">
            <h2 className={stats.totalProfit >= 0 ? "profit-up" : "profit-down"}>
              £{parseFloat(stats.totalProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <p>Net Platform Profit/Loss</p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Admin;
