import React from 'react';
import logo from '../assets/logo.png'; 
import { useNavigate } from 'react-router-dom';
import '../css/about_us.css'; 

function AboutUs() {

  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <div className="glass-pill about-pill">
        <div className="about-hero">
          <div className="hero-left">
            <img src={logo} alt="Risk Sandbox" className="big-logo" />
          </div>
          <div className="hero-right">
            <div className="info-content">
              <h1 className="about-header">ABOUT US</h1>
              <div className="about-divider"></div>
              <p className="about-description">
                This simulated trading platform is designed to help young investors learn to build and manage wealth in a risk-free environment. By replicating real-world market dynamics, it empowers the next generation to develop financial literacy and navigate investment landscapes with confidence.
              </p>
            </div>
          </div>

        </div>

       <div className="about-modules">
  <button className="continue-button" onClick={() => navigate('/home')}>
    CONTINUE
  </button>
</div>
      </div>
    </div>
  );
}

export default AboutUs;