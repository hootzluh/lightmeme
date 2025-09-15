import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="logo-section">
            <img className="logo" src="/assets/lightmeme.png" alt="LightMeme Logo" style={{ height: '100px', width: 'auto' }} />
            <div className="logo-content">
            <h3>LightMeme Launchpad</h3>
            <p>The ultimate platform for launching meme coins on the Lightchain AI Network.</p>
            {/* <div className="social-links">
            <a href="#" className="social-link">Twitter</a>
            <a href="#" className="social-link">Discord</a>
            <a href="#" className="social-link">Telegram</a>
            </div> */}
            </div>
          </div>
        </div>


        <div className="footer-section">
          <h4>Platform</h4>
          <ul>
            <li><Link to="/create-token">Create Token</Link></li>
            <li><Link to="/launch-presale">Launch Presale</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/analytics">Community</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><a href="https://docs.lightchain.ai" target="_blank" rel="noopener noreferrer">Documentation</a></li>
            <li><a href="https://testnet.lightscan.app" target="_blank" rel="noopener noreferrer">Lightscan Explorer</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">API Docs</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Support</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Disclaimer</a></li>
            <li><a href="#">Cookie Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2025 LightMeme Launchpad. All rights reserved.</p>
          <p>Built on Lightchain AI • Powered by Community</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
