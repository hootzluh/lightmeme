import React from 'react';
import { Link } from 'react-router-dom';
import 'animate.css';
import '../styles/global.css';
import PageLayout from '../components/PageLayout';
import TokenIndex from '../components/TokenIndex';
import PlatformStats from '../components/PlatformStats';

const HomePage = () => {
  return (
    <PageLayout>
      <PlatformStats />
      {/* Hero Section */}
      <div className="hero-section">
        <div className="cosmic-bg">
          <div className="floating-orb orb-1"></div>
          <div className="floating-orb orb-2"></div>
          <div className="floating-orb orb-3"></div>
          <div className="floating-orb orb-4"></div>
          <div className="floating-orb orb-5"></div>
          <div className="floating-orb orb-6"></div>
          <div className="wave-layer"></div>
          <div className="stars">
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
          </div>
        </div>

        <div className="content-overlay">
          <div className="content-wrapper">
            <h1 className="hero-title">Welcome to the Future of Meme Coins</h1>
          </div>

          <div className="hero-subtitle">
            <p>Launch your meme coin on the Lightchain AI Networkin minutes</p>
            <p>No coding required • Instant deployment • Community ready</p>
          </div>

          <div className="hero-cta">
            <Link to="/create-token" className="cta-button primary">
              🚀 Launch Your Token
            </Link>
            <Link to="/dashboard" className="cta-button secondary">
              📊 View Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="features-container">
          <h2 className="section-title">Why Choose LightMeme?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Deploy your token in under 60 seconds with our streamlined process</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Low Cost</h3>
              <p>Minimal gas fees on Lightchain AI make token creation affordable for everyone</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure</h3>
              <p>Battle-tested smart contracts with full transparency and audit-ready code</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Community Ready</h3>
              <p>Built-in features for community building and token management</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>User Friendly</h3>
              <p>Intuitive interface designed for both beginners and experienced creators</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Analytics Dashboard</h3>
              <p>Comprehensive tracking and insights for your token's performance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-container">
          <h2 className="section-title">Platform Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number" id="tokens-created">0</div>
              <div className="stat-label">Tokens Created</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" id="total-volume">0 LCAI</div>
              <div className="stat-label">Total Volume</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" id="active-users">0</div>
              <div className="stat-label">Active Creators</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" id="success-rate">100%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tokens Section */}
      <div className="recent-tokens-section">
        <div className="recent-tokens-container">
          <TokenIndex />
        </div>
      </div>

      {/* CTA Section */}
      <div className="final-cta-section">
        <div className="final-cta-container">
          <h2 className="section-title">Ready to Launch?</h2>
          <p>Join thousands of creators who have already launched their meme coins on Lightchain AI</p>
          <div className="final-cta-buttons">
            <Link to="/create-token" className="cta-button primary large">
              🚀 Create Your Token Now
            </Link>
            <Link to="/analytics" className="cta-button secondary large">
              👥 View Community
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default HomePage;
