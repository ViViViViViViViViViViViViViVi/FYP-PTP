import React from 'react';
import logo from '../assets/logo.png'; 
import { useNavigate } from 'react-router-dom';
import '../css/welcome.css'; 

function Welcome() {

  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <div className="glass-pill welcome-pill">
        
        {/* TOP SECTION: THE SPLIT HERO (3/4 Height) */}
        <div className="welcome-hero">
          
          {/* LEFT: THE BIG LOGO */}
          <div className="hero-left">
            <img src={logo} alt="Risk Sandbox" className="big-logo" />
          </div>

          {/* RIGHT: THE WELCOME INFO */}
          <div className="hero-right">
            <div className="info-content">
              <h1 className="welcome-header">WELCOME</h1>
              <div className="welcome-divider"></div>
              <p className="welcome-description">
                Professional simulated trading environment.
              </p>
            </div>
          </div>

        </div>

       <div className="welcome-modules">
  <button className="continue-button" onClick={() => navigate('/login')}>
    CONTINUE
  </button>
</div>
      </div>
    </div>
  );
}

export default Welcome;