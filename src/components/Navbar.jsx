import React, { useState, useEffect, useRef } from "react"
import { Menu, X, Settings, Moon } from "lucide-react"
import { Link } from "react-router-dom"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const navRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    // initialize variables
    nav.style.setProperty("--x", "50%")
    nav.style.setProperty("--y", "50%")

    // use requestAnimationFrame to batch style updates
    const onMove = (clientX, clientY) => {
      const rect = nav.getBoundingClientRect()
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left))
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top))

      // use rAF to avoid layout thrash
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        nav.style.setProperty("--x", `${Math.round(x)}px`)
        nav.style.setProperty("--y", `${Math.round(y)}px`)
      })
    }

    const handleMouseMove = (e) => onMove(e.clientX, e.clientY)
    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY)
    }
    const handleLeave = () => {
      // set to center or fade out by toggling a class
      nav.style.setProperty("--x", "50%")
      nav.style.setProperty("--y", "50%")
      // optionally add a class to fade out the glow:
      nav.classList.add("no-pointer")
      setTimeout(() => nav.classList.remove("no-pointer"), 160)
    }

    nav.addEventListener("mousemove", handleMouseMove)
    nav.addEventListener("touchmove", handleTouchMove, { passive: true })
    nav.addEventListener("mouseleave", handleLeave)
    nav.addEventListener("touchend", handleLeave)

    return () => {
      nav.removeEventListener("mousemove", handleMouseMove)
      nav.removeEventListener("touchmove", handleTouchMove)
      nav.removeEventListener("mouseleave", handleLeave)
      nav.removeEventListener("touchend", handleLeave)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const handleDropdownEnter = (dropdown) => {
    setActiveDropdown(dropdown)
  }

  const handleDropdownLeave = () => {
    setActiveDropdown(null)
  }

  return (
    <nav ref={navRef} className="nav glass-box">
      <div className="container-row">
        <h1 className="brand">Meme Launchpad</h1>

        <div className="show-desktop flex gap-4 items-center">
          {/* Dashboard Dropdown */}
          <div 
            className="nav-dropdown-container"
            onMouseEnter={() => handleDropdownEnter('dashboard')}
            onMouseLeave={handleDropdownLeave}
          >
            <div className="nav-item dashboard-glow">Dashboard</div>
            {activeDropdown === 'dashboard' && (
              <div className="nav-dropdown dashboard-dropdown">
                <Link to="/dashboard" className="dropdown-item">View Dashboard</Link>
                <Link to="/profile" className="dropdown-item">View Profile</Link>
              </div>
            )}
          </div>

          {/* Tokens Dropdown */}
          <div 
            className="nav-dropdown-container"
            onMouseEnter={() => handleDropdownEnter('tokens')}
            onMouseLeave={handleDropdownLeave}
          >
            <div className="nav-item tokens-glow">Tokens</div>
            {activeDropdown === 'tokens' && (
              <div className="nav-dropdown tokens-dropdown">
                <Link to="/create-token" className="dropdown-item">Create Tokens</Link>
                <Link to="/launch-presale" className="dropdown-item">Launch Presale</Link>
              </div>
            )}
          </div>

          {/* Marketplace Dropdown */}
          <div 
            className="nav-dropdown-container"
            onMouseEnter={() => handleDropdownEnter('marketplace')}
            onMouseLeave={handleDropdownLeave}
          >
            <div className="nav-item marketplace-glow">Marketplace</div>
            {activeDropdown === 'marketplace' && (
              <div className="nav-dropdown marketplace-dropdown">
                <Link to="/buy-sell" className="dropdown-item">Buy/Sell</Link>
                <Link to="/send-receive" className="dropdown-item">Send/Receive</Link>
                <Link to="/stake" className="dropdown-item">Stake</Link>
              </div>
            )}
          </div>

          {/* Community Dropdown */}
          <div 
            className="nav-dropdown-container"
            onMouseEnter={() => handleDropdownEnter('community')}
            onMouseLeave={handleDropdownLeave}
          >
            <div className="nav-item community-glow">Community</div>
            {activeDropdown === 'community' && (
              <div className="nav-dropdown community-dropdown">
                <button className="dropdown-item disabled">Blog</button>
                <button className="dropdown-item disabled">Forum</button>
                <button className="dropdown-item disabled">Live Stream</button>
              </div>
            )}
          </div>

          {/* Settings and Dark Mode */}
          <div className="nav-controls">
            <div 
              className="settings-container"
              onMouseEnter={() => setSettingsOpen(true)}
              onMouseLeave={() => setSettingsOpen(false)}
            >
              <button className="settings-button">
                <Settings size={20} />
                <span className="settings-text">Settings</span>
              </button>
              {settingsOpen && (
                <div className="settings-dropdown">
                  <Link to="/account-settings" className="dropdown-item">Account Settings</Link>
                  <Link to="/notifications" className="dropdown-item">Notifications</Link>
                  <Link to="/security" className="dropdown-item">Security</Link>
                  <Link to="/preferences" className="dropdown-item">Preferences</Link>
                </div>
              )}
            </div>
            
            <button className="dark-mode-button" disabled>
              <Moon size={20} />
            </button>
          </div>
        </div>

        <div className="show-mobile">
          <button
            className="icon-button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mt-4 show-mobile flex flex-col gap-2">
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link to="/create-token" onClick={() => setMenuOpen(false)}>Create Token</Link>
          <Link to="/launch-presale" onClick={() => setMenuOpen(false)}>Launch Presale</Link>
          <Link to="/analytics" onClick={() => setMenuOpen(false)}>Community</Link>
        </div>
      )}
    </nav>
  )
}