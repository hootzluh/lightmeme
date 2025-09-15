import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Search, Filter, TrendingUp, TrendingDown, Star, Heart, Eye, MessageCircle, Share2, MoreVertical, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import TokenManagementService from '../services/tokenManagementService'

export default function Marketplace() {
  const { address, isConnected } = useAccount()
  const [tokens, setTokens] = useState([])
  const [filteredTokens, setFilteredTokens] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('marketCap')
  const [filterBy, setFilterBy] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load tokens from localStorage (user-created tokens)
  useEffect(() => {
    const loadTokens = () => {
      try {
        setLoading(true)
        setError('')
        
        // Get user-created tokens from localStorage
        const userTokens = TokenManagementService.getAllTokens()
        
        // Transform user tokens into marketplace format
        const marketplaceTokens = userTokens.map((token, index) => ({
          id: token.id || `token-${index}`,
          name: token.name || 'Unnamed Token',
          symbol: token.symbol || 'TOKEN',
          address: token.address || '0x0000...0000',
          price: 0.000001, // Default price - would come from DEX in real app
          priceChange24h: 0, // Would come from price feed in real app
          marketCap: 0, // Would be calculated from price * supply
          volume24h: 0, // Would come from trading data
          liquidity: 0, // Would come from pool data
          holders: 1, // At least the creator
          description: token.description || 'No description available',
          image: TokenManagementService.getTokenImage(token),
          isVerified: false, // Would be verified through contract verification
          launchDate: new Date(token.createdAt || Date.now()),
          socialLinks: {
            twitter: token.socialLinks?.twitter || '',
            telegram: token.socialLinks?.telegram || '',
            website: token.socialLinks?.website || ''
          },
          tags: ['user-created', 'meme'],
          creator: token.creator || address,
          supply: token.supply || 1000000000,
          decimals: token.decimals || 18
        }))

        setTokens(marketplaceTokens)
        setFilteredTokens(marketplaceTokens)
        setLoading(false)
      } catch (err) {
        console.error('Error loading tokens:', err)
        setError('Failed to load tokens. Please try again.')
        setLoading(false)
      }
    }

    loadTokens()
  }, [address])

  useEffect(() => {
    let filtered = [...tokens]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(token =>
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(token => token.tags.includes(filterBy))
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'marketCap':
          return b.marketCap - a.marketCap
        case 'price':
          return b.price - a.price
        case 'volume24h':
          return b.volume24h - a.volume24h
        case 'priceChange24h':
          return b.priceChange24h - a.priceChange24h
        case 'holders':
          return b.holders - a.holders
        case 'newest':
          return new Date(b.launchDate) - new Date(a.launchDate)
        case 'oldest':
          return new Date(a.launchDate) - new Date(b.launchDate)
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredTokens(filtered)
  }, [tokens, searchTerm, sortBy, filterBy])

  const formatPrice = (price) => {
    if (price === 0) return 'N/A'
    return `$${price.toFixed(6)}`
  }

  const formatMarketCap = (marketCap) => {
    if (marketCap === 0) return 'N/A'
    if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(2)}M`
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(2)}K`
    }
    return `$${marketCap.toFixed(2)}`
  }

  const formatVolume = (volume) => {
    if (volume === 0) return 'N/A'
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(2)}K`
    }
    return `$${volume.toFixed(2)}`
  }

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`
    }
    return num.toString()
  }

  const toggleFavorite = (tokenId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(tokenId)) {
        newFavorites.delete(tokenId)
      } else {
        newFavorites.add(tokenId)
      }
      return newFavorites
    })
  }

  const handleBuyToken = (token) => {
    // In a real app, this would integrate with a DEX like Uniswap
    alert(`Buy functionality for ${token.name} (${token.symbol}) would be implemented here.\n\nThis would typically:\n1. Connect to Uniswap or similar DEX\n2. Open a swap interface\n3. Allow users to buy with ETH/USDC`)
  }

  const handleSellToken = (token) => {
    // In a real app, this would integrate with a DEX
    alert(`Sell functionality for ${token.name} (${token.symbol}) would be implemented here.\n\nThis would typically:\n1. Connect to Uniswap or similar DEX\n2. Open a swap interface\n3. Allow users to sell for ETH/USDC`)
  }

  const handleViewToken = (token) => {
    // In a real app, this would show detailed token information
    alert(`Token Details for ${token.name} (${token.symbol}):\n\nAddress: ${token.address}\nCreator: ${token.creator}\nSupply: ${formatNumber(token.supply)}\nDecimals: ${token.decimals}\nLaunch Date: ${token.launchDate.toLocaleDateString()}\n\nThis would typically open a detailed token page with charts, holder information, and trading history.`)
  }

  const handleCreateToken = () => {
    // Redirect to token creation page
    window.location.href = '/create-token'
  }

  if (!isConnected) {
    return (
      <PageLayout>
        <div className="marketplace-container">
          <div className="marketplace-connection-prompt">
            <h1>Marketplace</h1>
            <p>Connect your wallet to discover and trade meme tokens</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="marketplace-container">
        <div className="marketplace-header">
          <div className="header-content">
            <h1>Meme Token Marketplace</h1>
            <p>Discover and trade tokens created by the community</p>
          </div>
          <div className="marketplace-stats">
            <div className="stat-item">
              <span className="stat-label">Total Tokens</span>
              <span className="stat-value">{tokens.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Your Tokens</span>
              <span className="stat-value">{tokens.filter(t => t.creator === address).length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Favorites</span>
              <span className="stat-value">{favorites.size}</span>
            </div>
          </div>
        </div>

        <div className="marketplace-controls">
          <div className="search-section">
            <div className="search-container">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search tokens by name, symbol, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button 
              className={`filter-btn ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} />
              Filters
            </button>
            <button 
              className="create-token-btn"
              onClick={handleCreateToken}
            >
              <Plus size={20} />
              Create Token
            </button>
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>Category</label>
                <select 
                  value={filterBy} 
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Categories</option>
                  <option value="user-created">User Created</option>
                  <option value="meme">Meme</option>
                  <option value="community">Community</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Sort By</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="marketCap">Market Cap</option>
                  <option value="price">Price</option>
                  <option value="volume24h">24h Volume</option>
                  <option value="priceChange24h">24h Change</option>
                  <option value="holders">Holders</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        <div className="tokens-grid">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading tokens...</p>
            </div>
          ) : filteredTokens.length === 0 ? (
            <div className="no-tokens">
              <div className="no-tokens-content">
                <h3>No tokens found</h3>
                <p>
                  {searchTerm || filterBy !== 'all' 
                    ? 'No tokens match your search criteria. Try adjusting your filters.'
                    : 'No tokens have been created yet. Be the first to create a meme token!'
                  }
                </p>
                {!searchTerm && filterBy === 'all' && (
                  <button className="create-token-btn" onClick={handleCreateToken}>
                    <Plus size={20} />
                    Create Your First Token
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredTokens.map((token) => (
              <div key={token.id} className="token-card">
                <div className="token-card-header">
                  <div className="token-info">
                    <div className="token-image">
                      {token.image ? (
                        <img src={token.image} alt={token.name} />
                      ) : (
                        <div className="token-image-placeholder">
                          {token.symbol.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="token-details">
                      <div className="token-name-row">
                        <h3>{token.name}</h3>
                        {token.isVerified && <Star size={16} className="verified-icon" />}
                        <span className="token-symbol">{token.symbol}</span>
                      </div>
                      <p className="token-address">{token.address}</p>
                      <p className="token-creator">Created by: {token.creator === address ? 'You' : `${token.creator.slice(0, 6)}...${token.creator.slice(-4)}`}</p>
                    </div>
                  </div>
                  <div className="token-actions">
                    <button 
                      className={`favorite-btn ${favorites.has(token.id) ? 'favorited' : ''}`}
                      onClick={() => toggleFavorite(token.id)}
                      title="Add to favorites"
                    >
                      <Heart size={16} />
                    </button>
                    <button 
                      className="more-btn"
                      onClick={() => handleViewToken(token)}
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>

                <div className="token-stats">
                  <div className="stat-row">
                    <span className="stat-label">Price</span>
                    <span className="stat-value">{formatPrice(token.price)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">24h Change</span>
                    <span className={`stat-value ${token.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                      {token.priceChange24h !== 0 && (
                        token.priceChange24h >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />
                      )}
                      {token.priceChange24h === 0 ? 'N/A' : `${Math.abs(token.priceChange24h).toFixed(2)}%`}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Market Cap</span>
                    <span className="stat-value">{formatMarketCap(token.marketCap)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">24h Volume</span>
                    <span className="stat-value">{formatVolume(token.volume24h)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Liquidity</span>
                    <span className="stat-value">{formatMarketCap(token.liquidity)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Holders</span>
                    <span className="stat-value">{formatNumber(token.holders)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Supply</span>
                    <span className="stat-value">{formatNumber(token.supply)}</span>
                  </div>
                </div>

                <div className="token-description">
                  <p>{token.description}</p>
                </div>

                <div className="token-tags">
                  {token.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>

                <div className="token-card-footer">
                  <div className="social-links">
                    {token.socialLinks.twitter && (
                      <a href={token.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-link" title="Twitter">
                        <MessageCircle size={16} />
                      </a>
                    )}
                    {token.socialLinks.telegram && (
                      <a href={token.socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="social-link" title="Telegram">
                        <MessageCircle size={16} />
                      </a>
                    )}
                    {token.socialLinks.website && (
                      <a href={token.socialLinks.website} target="_blank" rel="noopener noreferrer" className="social-link" title="Website">
                        <Share2 size={16} />
                      </a>
                    )}
                  </div>
                  <div className="trade-buttons">
                    <button 
                      className="buy-btn"
                      onClick={() => handleBuyToken(token)}
                      title="Buy token (requires DEX integration)"
                    >
                      Buy
                    </button>
                    <button 
                      className="sell-btn"
                      onClick={() => handleSellToken(token)}
                      title="Sell token (requires DEX integration)"
                    >
                      Sell
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  )
}