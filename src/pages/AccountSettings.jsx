import React from "react"
import PageLayout from "../components/PageLayout"

export default function AccountSettings() {
  return (
    <PageLayout>
      <div className="content-overlay" style={{ marginTop: 32 }}>
        <h2 className="title" style={{ fontSize: '2rem' }}>Account Settings</h2>
        
        {/* Coming Soon Banner */}
        <div className="coming-soon-banner">
          <div className="banner-content">
            <div className="banner-icon">⚙️</div>
            <div className="banner-text">
              <h3>Pardon our progress, we are building something great and can't wait for you to see!</h3>
              <p>Check back soon!</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
