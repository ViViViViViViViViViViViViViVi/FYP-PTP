import React from 'react';
import '../css/footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-left">
        <span className="copyright">© 2026 Paper Trading Web Application</span>
        
        
      </div>

      <div className="footer-right">
        <a href="/about" className="footer-link">ABOUT US</a>
      </div>
    </footer>
  );
};

export default Footer;