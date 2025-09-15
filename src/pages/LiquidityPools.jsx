import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Plus, Minus, TrendingUp, TrendingDown, Info, Settings, RefreshCw, Wallet, Lock, Unlock, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import TokenManagementService from '../services/tokenManagementService'

export default function LiquidityPools() {
  const { address, isConnected } = useAccount()
  const [pools, setPools] = useState([])
  const [userPools, setUserPools] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [showAddLiquidity, setShowAddLiquidity] = useState(false)
  const [showRemoveLiquidity, setShowRemoveLiquidity] = useState(false)
  const [selectedPool, setSelectedPool] = useState(null)
  const [launchpadWallets, setLaunchpadWallets] = useState([])
  const [showWalletGenerator, setShowWalletGenerator] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load pools and wallets from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        setLoading(true)
        setError('')
        
        // Get user-created tokens to create potential pools
        const userTokens = TokenManagementService.getAllTokens()
        
        // Create pools based on user tokens (in a real app, these would come from DEX contracts)
        const availablePools = userTokens.map((token, index) => ({
          id: `pool-${token.id || index}`,
          tokenA: {
            symbol: token.symbol || 'TOKEN',
            name: token.name || 'Unnamed Token',
            address: token.address || '0x0000...0000',
            image: TokenManagementService.getTokenImage(token)
          },
          tokenB: {
            symbol: 'ETH',
            name: 'Ethereum',
            address: '0x0000...0000',
            image: null
          },
          liquidity: 0, // Would come from DEX contract
          volume24h: 0, // Would come from trading data
          fees24h: 0, // Would be calculated from volume
          apr: 0, // Would be calculated from fees and liquidity
          tvl: 0, // Total Value Locked
          price: 0.000001, // Would come from price feed
          priceChange24h: 0, // Would come from price feed
          isActive: false, // Pools are inactive until liquidity is added
          launchDate: new Date(token.createdAt || Date.now()),
          poolAddress: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
          creator: token.creator || address
        }))

        setPools(availablePools)
        setUserPools([]) // User has no liquidity positions yet
        
        // Load launchpad wallets from localStorage
        const savedWallets = JSON.parse(localStorage.getItem('launchpadWallets') || '[]')
        setLaunchpadWallets(savedWallets)
        
        setLoading(false)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load liquidity data. Please try again.')
        setLoading(false)
      }
    }

    loadData()
  }, [address])

  const formatCurrency = (amount) => {
    if (amount === 0) return 'N/A'
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`
    }
    return `$${amount.toFixed(2)}`
  }

  const formatNumber = (num) => {
    if (num === 0) return 'N/A'
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`
    }
    return num.toString()
  }

  const formatPrice = (price) => {
    if (price === 0) return 'N/A'
    return `$${price.toFixed(6)}`
  }

  const handleAddLiquidity = (pool) => {
    setSelectedPool(pool)
    setShowAddLiquidity(true)
    alert(`Add Liquidity for ${pool.tokenA.symbol}/${pool.tokenB.symbol}\n\nThis would typically:\n1. Connect to Uniswap V2/V3 or similar DEX\n2. Open the liquidity provision interface\n3. Allow users to add both tokens to create a pool\n4. Handle slippage and price impact calculations`)
  }

  const handleRemoveLiquidity = (pool) => {
    setSelectedPool(pool)
    setShowRemoveLiquidity(true)
    alert(`Remove Liquidity from ${pool.tokenA.symbol}/${pool.tokenB.symbol}\n\nThis would typically:\n1. Connect to the DEX where liquidity was provided\n2. Show current LP token balance\n3. Allow users to remove liquidity and receive both tokens back\n4. Handle impermanent loss calculations`)
  }

  const handleStakeLiquidity = (pool) => {
    alert(`Stake LP Tokens for ${pool.tokenA.symbol}/${pool.tokenB.symbol}\n\nThis would typically:\n1. Connect to a staking contract\n2. Allow users to stake their LP tokens\n3. Earn additional rewards on top of trading fees\n4. Show staking rewards and APY`)
  }

  const handleUnstakeLiquidity = (pool) => {
    alert(`Unstake LP Tokens for ${pool.tokenA.symbol}/${pool.tokenB.symbol}\n\nThis would typically:\n1. Connect to the staking contract\n2. Allow users to unstake their LP tokens\n3. Claim accumulated rewards\n4. Return LP tokens to user's wallet`)
  }

  const generateNewWallet = () => {
    // In a real app, this would generate a proper wallet with private key
    const newWallet = {
      id: Date.now(),
      name: `Launchpad Wallet ${launchpadWallets.length + 1}`,
      address: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
      balance: 0,
      tokens: [],
      isActive: true,
      createdDate: new Date(),
      privateKey: `0x${Math.random().toString(16).substr(2, 64)}`, // In real app, this would be properly generated
      mnemonic: 'This would be a proper BIP39 mnemonic phrase in a real application'
    }
    
    const updatedWallets = [...launchpadWallets, newWallet]
    setLaunchpadWallets(updatedWallets)
    localStorage.setItem('launchpadWallets', JSON.stringify(updatedWallets))
    setShowWalletGenerator(false)
    
    alert(`New wallet generated!\n\nAddress: ${newWallet.address}\nName: ${newWallet.name}\n\n⚠️ IMPORTANT: In a real application, you would need to:\n1. Securely store the private key and mnemonic\n2. Fund the wallet with ETH for gas fees\n3. Never share private keys with anyone\n4. Consider using hardware wallets for large amounts`)
  }

  const filteredPools = activeTab === 'all' ? pools : userPools

  if (!isConnected) {
    return (
      <PageLayout>
        <div className="liquidity-pools-container">
          <div className="pools-connection-prompt">
            <h1>Liquidity Pools</h1>
            <p>Connect your wallet to manage liquidity pools and generate launchpad wallets</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="liquidity-pools-container">
        <div className="pools-header">
          <div className="header-content">
            <h1>Liquidity Pools</h1>
            <p>Provide liquidity for tokens and earn trading fees</p>
          </div>
          <div className="pools-stats">
            <div className="stat-item">
              <span className="stat-label">Available Pools</span>
              <span className="stat-value">{pools.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Your Positions</span>
              <span className="stat-value">{userPools.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Launchpad Wallets</span>
              <span className="stat-value">{launchpadWallets.length}</span>
            </div>
          </div>
        </div>

        <div className="pools-tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Pools
          </button>
          <button 
            className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            My Positions
          </button>
          <button 
            className={`tab-btn ${activeTab === 'wallets' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallets')}
          >
            Launchpad Wallets
          </button>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {activeTab === 'wallets' ? (
          <div className="wallets-section">
            <div className="wallets-header">
              <h2>Launchpad Wallets</h2>
              <button 
                className="generate-wallet-btn"
                onClick={() => setShowWalletGenerator(true)}
              >
                <Plus size={20} />
                Generate New Wallet
              </button>
            </div>

            {launchpadWallets.length === 0 ? (
              <div className="no-wallets">
                <div className="no-wallets-content">
                  <Wallet size={48} />
                  <h3>No Launchpad Wallets</h3>
                  <p>Generate wallets to manage your launchpad operations</p>
                  <button 
                    className="generate-wallet-btn"
                    onClick={() => setShowWalletGenerator(true)}
                  >
                    <Plus size={20} />
                    Generate Your First Wallet
                  </button>
                </div>
              </div>
            ) : (
              <div className="wallets-grid">
                {launchpadWallets.map((wallet) => (
                  <div key={wallet.id} className="wallet-card">
                    <div className="wallet-header">
                      <div className="wallet-info">
                        <h3>{wallet.name}</h3>
                        <p className="wallet-address">{wallet.address}</p>
                      </div>
                      <div className="wallet-status">
                        <span className={`status-badge ${wallet.isActive ? 'active' : 'inactive'}`}>
                          {wallet.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="wallet-stats">
                      <div className="stat-row">
                        <span className="stat-label">Balance</span>
                        <span className="stat-value">{formatCurrency(wallet.balance)}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Tokens</span>
                        <span className="stat-value">{wallet.tokens.length}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Created</span>
                        <span className="stat-value">{wallet.createdDate.toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="wallet-tokens">
                      <h4>Tokens</h4>
                      <div className="tokens-list">
                        {wallet.tokens.length === 0 ? (
                          <span className="no-tokens">No tokens</span>
                        ) : (
                          wallet.tokens.map((token, index) => (
                            <span key={index} className="token-tag">{token}</span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="wallet-actions">
                      <button 
                        className="action-btn"
                        onClick={() => alert(`Manage wallet: ${wallet.name}\n\nThis would typically:\n1. Show wallet details and private key (securely)\n2. Allow funding with ETH\n3. Show transaction history\n4. Allow exporting/importing`)}
                      >
                        <Settings size={16} />
                        Manage
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => alert(`Refresh wallet: ${wallet.name}\n\nThis would typically:\n1. Update balance from blockchain\n2. Sync transaction history\n3. Update token holdings`)}
                      >
                        <RefreshCw size={16} />
                        Refresh
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="pools-section">
            <div className="pools-grid">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading pools...</p>
                </div>
              ) : filteredPools.length === 0 ? (
                <div className="no-pools">
                  <div className="no-pools-content">
                    <AlertCircle size={48} />
                    <h3>No {activeTab === 'all' ? 'Available' : 'User'} Pools</h3>
                    <p>
                      {activeTab === 'all' 
                        ? 'No liquidity pools are available yet. Create tokens first to enable pool creation.'
                        : 'You have no liquidity positions. Add liquidity to pools to start earning fees.'
                      }
                    </p>
                    {activeTab === 'all' && (
                      <button 
                        className="create-token-btn"
                        onClick={() => window.location.href = '/create-token'}
                      >
                        <Plus size={20} />
                        Create Token
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                filteredPools.map((pool) => (
                  <div key={pool.id} className="pool-card">
                    <div className="pool-header">
                      <div className="pool-tokens">
                        <div className="token-pair">
                          <div className="token-image">
                            {pool.tokenA.image ? (
                              <img src={pool.tokenA.image} alt={pool.tokenA.symbol} />
                            ) : (
                              <div className="token-image-placeholder">
                                {pool.tokenA.symbol.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="token-image">
                            {pool.tokenB.image ? (
                              <img src={pool.tokenB.image} alt={pool.tokenB.symbol} />
                            ) : (
                              <div className="token-image-placeholder">
                                {pool.tokenB.symbol.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="token-pair-info">
                          <h3>{pool.tokenA.symbol}/{pool.tokenB.symbol}</h3>
                          <p className="pool-address">{pool.poolAddress}</p>
                          <p className="pool-creator">Created by: {pool.creator === address ? 'You' : `${pool.creator.slice(0, 6)}...${pool.creator.slice(-4)}`}</p>
                        </div>
                      </div>
                      <div className="pool-status">
                        <span className={`status-badge ${pool.isActive ? 'active' : 'inactive'}`}>
                          {pool.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="pool-stats">
                      <div className="stat-row">
                        <span className="stat-label">TVL</span>
                        <span className="stat-value">{formatCurrency(pool.tvl)}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">24h Volume</span>
                        <span className="stat-value">{formatCurrency(pool.volume24h)}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">24h Fees</span>
                        <span className="stat-value">{formatCurrency(pool.fees24h)}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">APR</span>
                        <span className="stat-value">{pool.apr === 0 ? 'N/A' : `${pool.apr.toFixed(2)}%`}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Price</span>
                        <span className="stat-value">{formatPrice(pool.price)}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">24h Change</span>
                        <span className={`stat-value ${pool.priceChange24h >= 0 ? 'positive' : 'negative'}`}>
                          {pool.priceChange24h !== 0 && (
                            pool.priceChange24h >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />
                          )}
                          {pool.priceChange24h === 0 ? 'N/A' : `${Math.abs(pool.priceChange24h).toFixed(2)}%`}
                        </span>
                      </div>
                    </div>

                    {activeTab === 'my' && (
                      <div className="user-pool-stats">
                        <h4>Your Position</h4>
                        <div className="stat-row">
                          <span className="stat-label">Your Liquidity</span>
                          <span className="stat-value">N/A</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">Your Share</span>
                          <span className="stat-value">N/A</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">Your Fees</span>
                          <span className="stat-value">N/A</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">Your Rewards</span>
                          <span className="stat-value">N/A</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">LP Tokens</span>
                          <span className="stat-value">N/A</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">Staking Rewards</span>
                          <span className="stat-value">N/A</span>
                        </div>
                      </div>
                    )}

                    <div className="pool-actions">
                      {activeTab === 'all' ? (
                        <>
                          <button 
                            className="action-btn primary"
                            onClick={() => handleAddLiquidity(pool)}
                            disabled={!pool.isActive}
                          >
                            <Plus size={16} />
                            Add Liquidity
                          </button>
                          <button 
                            className="action-btn"
                            onClick={() => alert(`Pool Details for ${pool.tokenA.symbol}/${pool.tokenB.symbol}\n\nThis would typically show:\n1. Detailed pool statistics\n2. Trading history\n3. Liquidity provider information\n4. Price charts and analytics`)}
                          >
                            <Info size={16} />
                            Details
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className="action-btn primary"
                            onClick={() => handleAddLiquidity(pool)}
                          >
                            <Plus size={16} />
                            Add More
                          </button>
                          <button 
                            className="action-btn"
                            onClick={() => handleRemoveLiquidity(pool)}
                          >
                            <Minus size={16} />
                            Remove
                          </button>
                          <button 
                            className="action-btn"
                            onClick={() => alert(`Stake LP Tokens for ${pool.tokenA.symbol}/${pool.tokenB.symbol}\n\nThis would typically:\n1. Connect to staking contract\n2. Allow staking LP tokens for additional rewards\n3. Show staking APY and rewards`)}
                          >
                            <Lock size={16} />
                            Stake
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {showWalletGenerator && (
          <div className="wallet-generator-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Generate New Launchpad Wallet</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowWalletGenerator(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="warning-message">
                  <AlertCircle size={20} />
                  <p><strong>Important:</strong> This is a demonstration. In a real application, proper wallet generation with secure key management would be implemented.</p>
                </div>
                <p>This will generate a new wallet for the launchpad with a unique address and private key.</p>
                <div className="wallet-preview">
                  <div className="preview-item">
                    <span className="preview-label">Wallet Name:</span>
                    <span className="preview-value">Launchpad Wallet {launchpadWallets.length + 1}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Network:</span>
                    <span className="preview-value">Ethereum Mainnet</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Security:</span>
                    <span className="preview-value">Demo Mode (Not Secure)</span>
                  </div>
                </div>
                <div className="modal-actions">
                  <button 
                    className="generate-btn"
                    onClick={generateNewWallet}
                  >
                    <Wallet size={20} />
                    Generate Demo Wallet
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={() => setShowWalletGenerator(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}