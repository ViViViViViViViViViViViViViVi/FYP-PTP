import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaHome, FaUserCircle, FaBookOpen } from 'react-icons/fa';
import '../css/navbar.css';

function Navbar({ setSymbol, pageName }) {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const userId = localStorage.getItem('user_id');
  const fullStoredName = localStorage.getItem('user_name') || "User";
  const firstName = fullStoredName.split(' ')[0];
  const topStocks = ["AAPL", "TSLA", "NVDA", "BTC", "AMZN"];

  const handleLogout = () => {
    localStorage.clear(); 
    setIsProfileOpen(false);
    navigate('/login');
    window.location.reload(); 
  };

  return (
    <nav className="navbar">
      <div className="left">
        {userId && (
          <div className={`search-group ${isSearchOpen ? 'active' : ''}`}>
            {isSearchOpen && (
              <div className="search-reveal">
                <input type="text" placeholder="Search..." autoFocus className="nav-input" />
                <ul className="stock-dropdown">
                  {topStocks.map(stock => (
                    <li key={stock} onClick={() => { setSymbol(stock); setIsSearchOpen(false); }}>
                      {stock}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <FaSearch 
              className="search-icon" 
              onClick={() => { setIsSearchOpen(!isSearchOpen); setIsProfileOpen(false); }} 
            />
          </div>
        )}
      </div>

      <div className="center">
        <span className="navbar-title-display">{pageName}</span>
      </div>

      <div className="right">
        {userId && (
          <>
            <Link to="/home"><FaHome className="nav-icon" title="Home" /></Link>
            <Link to="/learning"><FaBookOpen className="nav-icon" title="Sandbox" /></Link>

            <div className={`profile-tab ${isProfileOpen ? 'active' : ''}`}>
              <div className="profile-trigger" onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsSearchOpen(false);
              }}>
                <FaUserCircle className="nav-icon" />
              </div>
              {isProfileOpen && (
                <div className="profile-tab-content">
                  <div className="tab-header">
                    <span className="tab-username">{firstName}</span>
                  </div>
                  <Link to="/profile" className="tab-link" onClick={() => setIsProfileOpen(false)}>
                    Profile
                  </Link>
                  <Link to="/settings" className="tab-link" onClick={() => setIsProfileOpen(false)}>
                    Settings
                  </Link>
                  <button className="tab-logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;