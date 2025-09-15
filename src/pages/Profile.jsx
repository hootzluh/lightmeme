import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Link } from 'react-router-dom'
import { Edit3, Camera, User, Mail, Calendar, MapPin, Link as LinkIcon, Twitter, Github, Globe, Trophy, Coins, TrendingUp, Eye, Heart, MessageCircle, Share2 } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import TokenManagementService from '../services/tokenManagementService'

export default function Profile() {
  const { address, isConnected } = useAccount()
  const [profile, setProfile] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    twitter: '',
    github: '',
    avatar: null,
    coverImage: null,
    joinedDate: new Date().toISOString(),
    isVerified: false
  })
  const [isEditing, setIsEditing] = useState(false)
  const [stats, setStats] = useState({
    tokensCreated: 0,
    totalVolume: 0,
    followers: 0,
    following: 0,
    profileViews: 0
  })
  const [recentTokens, setRecentTokens] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isConnected && address) {
      loadProfile()
      loadStats()
      loadRecentTokens()
    }
  }, [isConnected, address])

  const loadProfile = async () => {
    try {
      // Load profile from localStorage or API
      const savedProfile = localStorage.getItem(`profile_${address}`)
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile))
      } else {
        // Create default profile
        const defaultProfile = {
          displayName: `${address?.slice(0, 6)}...${address?.slice(-4)}`,
          bio: 'Welcome to my profile!',
          location: '',
          website: '',
          twitter: '',
          github: '',
          avatar: null,
          coverImage: null,
          joinedDate: new Date().toISOString(),
          isVerified: false
        }
        setProfile(defaultProfile)
        localStorage.setItem(`profile_${address}`, JSON.stringify(defaultProfile))
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading profile:', error)
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Mock stats - in production, these would come from the blockchain/API
      setStats({
        tokensCreated: 3,
        totalVolume: 125000,
        followers: 42,
        following: 18,
        profileViews: 156
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadRecentTokens = async () => {
    try {
      // Load user's recent tokens
      const tokens = await TokenManagementService.getStoredTokenImages()
      const tokenList = Object.keys(tokens).map(address => ({
        address,
        imageUrl: tokens[address],
        name: `Token ${address.slice(0, 6)}...`,
        symbol: 'TKN',
        price: '$0.001234'
      }))
      setRecentTokens(tokenList.slice(0, 6))
    } catch (error) {
      console.error('Error loading recent tokens:', error)
    }
  }

  const handleSaveProfile = async () => {
    try {
      localStorage.setItem(`profile_${address}`, JSON.stringify(profile))
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to update profile')
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      // Create a simple file URL for now
      const imageUrl = URL.createObjectURL(file)
      setProfile(prev => ({ ...prev, avatar: imageUrl }))
    } catch (error) {
      console.error('Error uploading avatar:', error)
    }
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      // Create a simple file URL for now
      const imageUrl = URL.createObjectURL(file)
      setProfile(prev => ({ ...prev, coverImage: imageUrl }))
    } catch (error) {
      console.error('Error uploading cover:', error)
    }
  }

  if (!isConnected) {
    return (
      <PageLayout>
        <div className="profile-container">
          <div className="no-wallet-message">
            <h1>Profile</h1>
            <p>Connect your wallet to view your profile.</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="profile-container">
          <div className="loading-message">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="profile-container">
        {/* Cover Image */}
        <div className="profile-cover">
          {profile.coverImage ? (
            <img src={profile.coverImage} alt="Cover" className="cover-image" />
          ) : (
            <div className="cover-placeholder">
              <div className="cover-gradient"></div>
            </div>
          )}
          {isEditing && (
            <div className="cover-upload">
              <input
                type="file"
                id="cover-upload"
                accept="image/*"
                onChange={handleCoverUpload}
                className="cover-upload-input"
              />
              <label htmlFor="cover-upload" className="cover-upload-label">
                <Camera size={20} />
                Change Cover
              </label>
            </div>
          )}
        </div>

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar-container">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {profile.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              {isEditing && (
                <div className="avatar-upload">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="avatar-upload-input"
                  />
                  <label htmlFor="avatar-upload" className="avatar-upload-label">
                    <Camera size={16} />
                  </label>
                </div>
              )}
            </div>
            {profile.isVerified && (
              <div className="verified-badge">
                <Trophy size={16} />
              </div>
            )}
          </div>

          <div className="profile-info">
            <div className="profile-name-section">
              <h1 className="profile-name">
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    className="profile-name-input"
                  />
                ) : (
                  profile.displayName
                )}
              </h1>
              <div className="wallet-address">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
            </div>

            <div className="profile-bio">
              {isEditing ? (
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  className="profile-bio-input"
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              ) : (
                <p>{profile.bio}</p>
              )}
            </div>

            <div className="profile-links">
              {isEditing ? (
                <div className="profile-links-edit">
                  <div className="link-input-group">
                    <MapPin size={16} />
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Location"
                      className="link-input"
                    />
                  </div>
                  <div className="link-input-group">
                    <Globe size={16} />
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="Website"
                      className="link-input"
                    />
                  </div>
                  <div className="link-input-group">
                    <Twitter size={16} />
                    <input
                      type="text"
                      value={profile.twitter}
                      onChange={(e) => setProfile(prev => ({ ...prev, twitter: e.target.value }))}
                      placeholder="Twitter handle"
                      className="link-input"
                    />
                  </div>
                  <div className="link-input-group">
                    <Github size={16} />
                    <input
                      type="text"
                      value={profile.github}
                      onChange={(e) => setProfile(prev => ({ ...prev, github: e.target.value }))}
                      placeholder="GitHub username"
                      className="link-input"
                    />
                  </div>
                </div>
              ) : (
                <div className="profile-links-display">
                  {profile.location && (
                    <div className="profile-link">
                      <MapPin size={16} />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="profile-link">
                      <Globe size={16} />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  {profile.twitter && (
                    <div className="profile-link">
                      <Twitter size={16} />
                      <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer">
                        @{profile.twitter}
                      </a>
                    </div>
                  )}
                  {profile.github && (
                    <div className="profile-link">
                      <Github size={16} />
                      <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer">
                        {profile.github}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <div className="edit-actions">
                  <button className="save-btn" onClick={handleSaveProfile}>
                    Save Changes
                  </button>
                  <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-value">{stats.tokensCreated}</div>
            <div className="stat-label">Tokens Created</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">${stats.totalVolume.toLocaleString()}</div>
            <div className="stat-label">Total Volume</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.followers}</div>
            <div className="stat-label">Followers</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.following}</div>
            <div className="stat-label">Following</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.profileViews}</div>
            <div className="stat-label">Profile Views</div>
          </div>
        </div>

        {/* Recent Tokens */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Recent Tokens</h2>
            <Link to="/token-management" className="view-all-link">
              View All
            </Link>
          </div>
          <div className="tokens-grid">
            {recentTokens.map((token, index) => (
              <div key={index} className="token-card">
                <img src={token.imageUrl} alt={token.name} className="token-image" />
                <div className="token-info">
                  <h3>{token.name}</h3>
                  <p>{token.symbol}</p>
                  <span className="token-price">{token.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="activity-feed">
            <div className="activity-item">
              <div className="activity-icon">
                <Coins size={20} />
              </div>
              <div className="activity-content">
                <p>Created new token <strong>MEME</strong></p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <TrendingUp size={20} />
              </div>
              <div className="activity-content">
                <p>Token <strong>DOGE</strong> reached new ATH</p>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <Heart size={20} />
              </div>
              <div className="activity-content">
                <p>Received 5 likes on your profile</p>
                <span className="activity-time">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}