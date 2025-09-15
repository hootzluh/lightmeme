import React, { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Moon, Sun, Wallet, Bell } from 'lucide-react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import Footer from './Footer'
import '../styles/global.css'

export default function PageLayout({ children }) {
  const glassRef = useRef(null)
  const settingsRef = useRef(null)
  const walletRef = useRef(null)
  const notificationsRef = useRef(null)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsHovered, setSettingsHovered] = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)
  const [walletHovered, setWalletHovered] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationsHovered, setNotificationsHovered] = useState(false)
  const [isDayMode, setIsDayMode] = useState(false) // Start in night mode and disable
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Welcome to LightMeme Launchpad!", time: "2 hours ago", read: false },
    { id: 2, message: "Your token has been created successfully!", time: "1 day ago", read: false },
    { id: 3, message: "New feature: Token image management is now available", time: "3 days ago", read: true },
  ])
  const dropdownRef = useRef(null)
  
  // Wagmi hooks
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const handleMouseMove = (e) => {
    if (!glassRef.current) return
    const rect = glassRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    glassRef.current.style.setProperty('--x', `${x}px`)
    glassRef.current.style.setProperty('--y', `${y}px`)
  }

  const handleMouseLeave = () => {
    if (!glassRef.current) return
    glassRef.current.style.setProperty('--x', `50%`)
    glassRef.current.style.setProperty('--y', `50%`)
  }

  const handleDropdownClick = (dropdown) => {
    // Toggle dropdown - if clicking the same dropdown, close it
    if (activeDropdown === dropdown) {
      setActiveDropdown(null)
    } else {
      setActiveDropdown(dropdown)
    }
  }

  const handleDropdownItemClick = () => {
    // Close dropdown when clicking on any dropdown item
    setActiveDropdown(null)
  }

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close settings dropdown if clicking outside
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setSettingsOpen(false)
      }
      
      // Close wallet dropdown if clicking outside
      if (walletRef.current && !walletRef.current.contains(event.target)) {
        setWalletOpen(false)
      }
      
      // Close notifications dropdown if clicking outside
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
      
      // Close main dropdown if clicking outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null)
      }
    }

    if (settingsOpen || activeDropdown || walletOpen || notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [settingsOpen, activeDropdown, walletOpen, notificationsOpen])

  const handleSettingsClick = () => {
    setSettingsOpen(!settingsOpen)
  }

  const handleSettingsHover = () => {
    setSettingsHovered(true)
  }

  const handleSettingsLeave = () => {
    setSettingsHovered(false)
  }

  const handleWalletClick = () => {
    if (isConnected) {
      setWalletOpen(!walletOpen)
    } else {
      // Connect wallet
      if (connectors.length > 0) {
        connect({ connector: connectors[0] })
      }
    }
  }

  const handleWalletHover = () => {
    setWalletHovered(true)
  }

  const handleWalletLeave = () => {
    setWalletHovered(false)
  }

  const handleNotificationsClick = () => {
    setNotificationsOpen(!notificationsOpen)
  }

  const handleNotificationsHover = () => {
    setNotificationsHovered(true)
  }

  const handleNotificationsLeave = () => {
    setNotificationsHovered(false)
  }

  const handleDayNightToggle = () => {
    setIsDayMode(!isDayMode)
  }

  const handleDisconnect = () => {
    disconnect()
    setWalletOpen(false)
  }

  const handleClearAllNotifications = () => {
    setNotifications([])
  }

  const handleNotificationClick = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="homepage">
      <div className="cosmic-bg"></div>
      <div className="wave-layer"></div>

      <div className="floating-orb orb-1"></div>
      <div className="floating-orb orb-2"></div>
      <div className="floating-orb orb-3"></div>
      <div className="floating-orb orb-4"></div>
      <div className="floating-orb orb-5"></div>
      <div className="floating-orb orb-6"></div>

      <div className="stars">
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
      </div>

      <div
        className="glass-box home-topbar"
        ref={glassRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="title-overlay">
          <Link to="/" className="brand-link">
            <div className="title">LightMeme</div>
            <img
              className="logo"
              src="/assets/lightmeme.png"
              alt="Lightmeme Logo"
              height="120"
            />
            <div className="title">Launchpad</div>
          </Link>
        </div>
        <nav className="home-nav-links" ref={dropdownRef}>
          {/* Dashboard Dropdown */}
          <div className="nav-dropdown-container">
            <div 
              className="nav-item dashboard-glow"
              onClick={() => handleDropdownClick('dashboard')}
            >
              Dashboard
            </div>
            {activeDropdown === 'dashboard' && (
              <div className="nav-dropdown dashboard-dropdown">
                <Link to="/dashboard" className="dropdown-item" onClick={handleDropdownItemClick}>View Dashboard</Link>
                <Link to="/profile" className="dropdown-item" onClick={handleDropdownItemClick}>View Profile</Link>
                <Link to="/token-management" className="dropdown-item" onClick={handleDropdownItemClick}>Manage Tokens</Link>
              </div>
            )}
          </div>

          {/* Tokens Dropdown */}
          <div className="nav-dropdown-container">
            <div 
              className="nav-item tokens-glow"
              onClick={() => handleDropdownClick('tokens')}
            >
              Tokens
            </div>
            {activeDropdown === 'tokens' && (
              <div className="nav-dropdown tokens-dropdown">
                <Link to="/create-token" className="dropdown-item" onClick={handleDropdownItemClick}>Create Tokens</Link>
                <Link to="/launch-presale" className="dropdown-item" onClick={handleDropdownItemClick}>Launch Presale</Link>
              </div>
            )}
          </div>

          {/* Marketplace Dropdown */}
          <div className="nav-dropdown-container">
            <div 
              className="nav-item marketplace-glow"
              onClick={() => handleDropdownClick('marketplace')}
            >
              Marketplace
            </div>
            {activeDropdown === 'marketplace' && (
              <div className="nav-dropdown marketplace-dropdown">
                <Link to="/marketplace" className="dropdown-item" onClick={handleDropdownItemClick}>Marketplace</Link>
                <Link to="/liquidity-pools" className="dropdown-item" onClick={handleDropdownItemClick}>Liquidity Pools</Link>
                <Link to="/buy-sell" className="dropdown-item" onClick={handleDropdownItemClick}>Buy/Sell</Link>
                <Link to="/send-receive" className="dropdown-item" onClick={handleDropdownItemClick}>Send/Receive</Link>
                <Link to="/stake" className="dropdown-item" onClick={handleDropdownItemClick}>Stake</Link>
              </div>
            )}
          </div>

          {/* Community Dropdown */}
          <div className="nav-dropdown-container">
            <div 
              className="nav-item community-glow"
              onClick={() => handleDropdownClick('community')}
            >
              Community
            </div>
            {activeDropdown === 'community' && (
              <div className="nav-dropdown community-dropdown">
                <Link to="/live-chat" className="dropdown-item" onClick={handleDropdownItemClick}>Live Chat</Link>
                <Link to="/direct-chat" className="dropdown-item" onClick={handleDropdownItemClick}>Direct Messages</Link>
                <Link to="/live-stream" className="dropdown-item" onClick={handleDropdownItemClick}>Live Stream</Link>
                <button className="dropdown-item disabled">Blog</button>
                <button className="dropdown-item disabled">Forum</button>
              </div>
            )}
          </div>
        </nav>
      </div>

      <div className="wallet-cta-fixed">
        {/* Top Row: Settings, Notifications, Day/Night */}
        <div className="nav-controls-top">
          {/* Settings Button - Left */}
          <div 
            ref={settingsRef}
            className="settings-container"
            onMouseEnter={handleSettingsHover}
            onMouseLeave={handleSettingsLeave}
          >
            <button 
              className={`settings-button ${settingsHovered || settingsOpen ? 'text-visible' : ''} ${settingsOpen ? 'active' : ''}`}
              onClick={handleSettingsClick}
            >
              <span className={`settings-text ${settingsHovered || settingsOpen ? 'show' : ''}`}>Settings</span>
              <Settings size={20} />
            </button>
            {settingsOpen && (
              <div className="settings-dropdown">
                <Link to="/account-settings" className="dropdown-item" onClick={() => setSettingsOpen(false)}>Account Settings</Link>
                <Link to="/notifications" className="dropdown-item" onClick={() => setSettingsOpen(false)}>Notifications</Link>
                <Link to="/security" className="dropdown-item" onClick={() => setSettingsOpen(false)}>Security</Link>
                <Link to="/preferences" className="dropdown-item" onClick={() => setSettingsOpen(false)}>Preferences</Link>
              </div>
            )}
          </div>

          {/* Notifications Button - Middle */}
          <div 
            ref={notificationsRef}
            className="notifications-container"
            onMouseEnter={handleNotificationsHover}
            onMouseLeave={handleNotificationsLeave}
          >
            <button 
              className="notifications-button"
              onClick={handleNotificationsClick}
              title="Notifications"
            >
              <div className="notifications-icon-container">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </div>
            </button>
            {notificationsOpen && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  <button 
                    className="clear-all-btn"
                    onClick={handleClearAllNotifications}
                  >
                    Clear All
                  </button>
                </div>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">No notifications</div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id}
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="notification-content">
                          <p>{notification.message}</p>
                          <span className="notification-time">{notification.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Day/Night Toggle Button - Top Right */}
          <button 
            className={`day-night-button ${isDayMode ? 'day-mode' : 'night-mode'}`}
            onClick={handleDayNightToggle}
            disabled
            title={isDayMode ? 'Switch to Night Mode' : 'Switch to Day Mode'}
          >
            {isDayMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Bottom Row: Wallet Connect Button */}
        <div className="nav-controls-bottom">
          <div 
            ref={walletRef}
            className="wallet-container"
            onMouseEnter={handleWalletHover}
            onMouseLeave={handleWalletLeave}
          >
            <button 
              className={`wallet-button ${walletHovered || walletOpen ? 'text-visible' : ''} ${isConnected ? 'connected' : ''}`}
              onClick={handleWalletClick}
            >
              <span className={`wallet-text ${walletHovered || walletOpen ? 'show' : ''}`}>
                {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
              </span>
              {isConnected ? (
                <div className="profile-avatar">
                  {/* Profile photo placeholder - will be replaced with actual profile photo */}
                  <div className="avatar-placeholder">
                    {address?.slice(0, 2).toUpperCase()}
                  </div>
                </div>
              ) : (
                <Wallet size={20} />
              )}
            </button>
            {walletOpen && isConnected && (
              <div className="wallet-dropdown">
                <Link to="/profile" className="dropdown-item" onClick={() => setWalletOpen(false)}>View Profile</Link>
                <button className="dropdown-item" onClick={handleDisconnect}>Log Out</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {children && (
        <div className="page-content">
          {children}
        </div>
      )}

      <Footer />
    </div>
  )
}
