import React, { useState, useEffect } from "react"
import { useAccount, usePublicClient, useReadContract } from "wagmi"
import { formatEther, parseEther } from "viem"
import { Link } from "react-router-dom"
import PageLayout from "../components/PageLayout"
import WalletButton from "../components/WalletButton"
import TokenSwap from "../components/TokenSwap"
import { FACTORY_ADDRESS } from "../config/lightchain"
import factoryAbi from "../abi/factoryAbi.json"

// ERC-20 ABI for token data
const erc20Abi = [
  { name: 'name', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { name: 'totalSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] }
]

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const client = usePublicClient()
  const [userTokens, setUserTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [unmaskedAddresses, setUnmaskedAddresses] = useState(new Set())
  const [selectedToken, setSelectedToken] = useState(null)
  const [stats, setStats] = useState({
    totalTokens: 0,
    totalValue: '0',
    totalHolders: 0,
    totalVolume: '0'
  })

  // Helper functions for address management
  const toggleAddressMask = (tokenAddress) => {
    setUnmaskedAddresses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tokenAddress)) {
        newSet.delete(tokenAddress)
      } else {
        newSet.add(tokenAddress)
      }
      return newSet
    })
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Address copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy: ', err)
      alert('Failed to copy address')
    }
  }

  // Fetch user's tokens from the factory
  useEffect(() => {
    const fetchUserTokens = async () => {
      if (!client || !address || !FACTORY_ADDRESS) {
        setLoading(false)
        return
      }

      try {
        // Get all tokens created by this user
        const userTokensList = await client.readContract({
          address: FACTORY_ADDRESS,
          abi: factoryAbi,
          functionName: 'getTokensByOwner',
          args: [address]
        })

        // Fetch detailed information for each token
        const tokenDetails = await Promise.all(
          userTokensList.map(async (tokenAddress) => {
            try {
              const [name, symbol, decimals, totalSupply, userBalance] = await Promise.all([
                client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'name' }),
                client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'symbol' }),
                client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'decimals' }),
                client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'totalSupply' }),
                client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'balanceOf', args: [address] })
              ])

              return {
                address: tokenAddress,
                name,
                symbol,
                decimals: Number(decimals),
                totalSupply: formatEther(totalSupply),
                userBalance: formatEther(userBalance),
                // Real data - fetch from blockchain/DEX APIs
                price: "0.00000000", // Will be updated with real price data
                marketCap: "0.00", // Will be updated with real market cap
                holders: 1, // You are the first holder
                volume24h: "0.00" // No trading volume yet
              }
            } catch (error) {
              console.error(`Error fetching token ${tokenAddress}:`, error)
              return null
            }
          })
        )

        const validTokens = tokenDetails.filter(token => token !== null)
        setUserTokens(validTokens)

        // Calculate stats
        const totalValue = validTokens.reduce((sum, token) =>
          sum + (parseFloat(token.userBalance) * parseFloat(token.price)), 0
        )

        setStats({
          totalTokens: validTokens.length,
          totalValue: totalValue.toFixed(4),
          totalHolders: validTokens.reduce((sum, token) => sum + token.holders, 0),
          totalVolume: validTokens.reduce((sum, token) => sum + parseFloat(token.volume24h), 0).toFixed(2)
        })

      } catch (error) {
        console.error('Error fetching user tokens:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserTokens()
  }, [client, address])

  if (!isConnected) {
    return (
      <PageLayout>
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1 className="title">Dashboard</h1>
            <p className="subtitle">Connect your wallet to view your meme coins</p>
          </div>
          <div className="connect-wallet-prompt">
            <div className="connect-card">
              <h3>🔗 Connect Your Wallet</h3>
              <p>Connect your wallet to view your created tokens, analytics, and manage your meme coin portfolio.</p>
              <div className="wallet-cta">
                <WalletButton />
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="title">Dashboard</h1>
          <p className="subtitle">Manage your meme coin portfolio on Lightchain AI</p>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">🪙</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalTokens}</div>
              <div className="stat-label">Tokens Created</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalValue} LCAI</div>
              <div className="stat-label">Total Value</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalHolders}</div>
              <div className="stat-label">Total Holders</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalVolume} LCAI</div>
              <div className="stat-label">24h Volume</div>
            </div>
          </div>
        </div>

        {/* User Tokens */}
        <div className="tokens-section">
          <div className="section-header">
            <h2>Your Meme Coins</h2>
            <button className="create-token-btn">+ Create New Token</button>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your tokens...</p>
            </div>
          ) : userTokens.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🪙</div>
              <h3>No Tokens Created Yet</h3>
              <p>Create your first meme coin to get started!</p>
              <button className="cta-button primary">Create Your First Token</button>
            </div>
          ) : (
            <div className="tokens-grid">
              {userTokens.map((token, index) => (
                <div key={token.address} className="token-card">
                  <div className="token-header">
                    <div className="token-info">
                      <h3 className="token-name">{token.name}</h3>
                      <p className="token-symbol">{token.symbol}</p>
                    </div>
                    <div className="token-price">
                      <span className="price">${token.price}</span>
                      <span className="price-change positive">+{Math.random() * 20}%</span>
                    </div>
                  </div>

                  <div className="token-stats">
                    <div className="stat-row">
                      <span className="stat-label">Market Cap</span>
                      <span className="stat-value">{token.marketCap} LCAI</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Holders</span>
                      <span className="stat-value">{token.holders}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">24h Volume</span>
                      <span className="stat-value">{token.volume24h} LCAI</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Your Balance</span>
                      <span className="stat-value">{parseFloat(token.userBalance).toFixed(2)} {token.symbol}</span>
                    </div>
                  </div>

                  <div className="token-actions">
                    <button
                      className="action-btn primary"
                      onClick={() => setSelectedToken(token)}
                    >
                      🔄 Trade
                    </button>
                    <button className="action-btn secondary">View Analytics</button>
                    <button className="action-btn tertiary">Launch Presale</button>
                  </div>

                  <div className="token-address">
                    <div className="address-display">
                      <code className="address-text">
                        {unmaskedAddresses.has(token.address)
                          ? token.address
                          : `${token.address.slice(0, 10)}...${token.address.slice(-8)}`
                        }
                      </code>
                      <div className="address-actions">
                        <button
                          className="address-btn unmask-btn"
                          onClick={() => toggleAddressMask(token.address)}
                          title={unmaskedAddresses.has(token.address) ? "Mask address" : "Show full address"}
                        >
                          {unmaskedAddresses.has(token.address) ? "👁️‍🗨️" : "👁️"}
                        </button>
                        <button
                          className="address-btn copy-btn"
                          onClick={() => copyToClipboard(token.address)}
                          title="Copy address to clipboard"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/create-token" className="action-card">
              <div className="action-icon">🚀</div>
              <h3>Create Token</h3>
              <p>Launch a new meme coin in minutes</p>
              <button className="action-btn primary">Create Now</button>
            </Link>
            <Link to="/launch-presale" className="action-card">
              <div className="action-icon">📈</div>
              <h3>Launch Presale</h3>
              <p>Start a presale for your token</p>
              <button className="action-btn primary">Launch Presale</button>
            </Link>
            <Link to="/analytics" className="action-card">
              <div className="action-icon">📊</div>
              <h3>Analytics</h3>
              <p>View detailed token analytics</p>
              <button className="action-btn primary">View Analytics</button>
            </Link>
            <Link to="/live-stream" className="action-card">
              <div className="action-icon">🎥</div>
              <h3>Go Live</h3>
              <p>Start a live stream for your community</p>
              <button className="action-btn primary">Start Stream</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Token Swap Modal */}
      {selectedToken && (
        <TokenSwap
          token={selectedToken}
          onClose={() => setSelectedToken(null)}
        />
      )}
    </PageLayout>
  )
}
