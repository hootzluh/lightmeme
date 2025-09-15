import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Lock, Unlock, TrendingUp, Award, Clock, AlertCircle, ExternalLink } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import TokenManagementService from '../services/tokenManagementService'

export default function Stake() {
  const { address, isConnected } = useAccount()
  const [tokens, setTokens] = useState([])
  const [selectedToken, setSelectedToken] = useState(null)
  const [stakeAmount, setStakeAmount] = useState('')
  const [stakeDuration, setStakeDuration] = useState('30') // days
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userStakes, setUserStakes] = useState([])

  const stakeOptions = [
    { days: 30, apy: 12, multiplier: 1.0 },
    { days: 90, apy: 18, multiplier: 1.5 },
    { days: 180, apy: 25, multiplier: 2.0 },
    { days: 365, apy: 35, multiplier: 2.5 }
  ]

  useEffect(() => {
    const loadData = () => {
      try {
        const userTokens = TokenManagementService.getAllTokens()
        setTokens(userTokens)
        if (userTokens.length > 0) {
          setSelectedToken(userTokens[0])
        }

        // Load user stakes from localStorage
        const savedStakes = JSON.parse(localStorage.getItem('userStakes') || '[]')
        setUserStakes(savedStakes)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load data')
      }
    }

    if (isConnected) {
      loadData()
    }
  }, [isConnected])

  const selectedStakeOption = stakeOptions.find(option => option.days.toString() === stakeDuration)

  const calculateRewards = () => {
    if (stakeAmount && selectedStakeOption) {
      const amount = parseFloat(stakeAmount)
      const apy = selectedStakeOption.apy
      const days = selectedStakeOption.days
      const dailyRate = apy / 365 / 100
      const totalRewards = amount * dailyRate * days
      return totalRewards.toFixed(2)
    }
    return '0.00'
  }

  const handleStake = async () => {
    if (!selectedToken || !stakeAmount || !stakeDuration) {
      setError('Please fill in all fields')
      return
    }

    const amount = parseFloat(stakeAmount)
    if (amount <= 0) {
      setError('Please enter a valid stake amount')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Simulate staking process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newStake = {
        id: Date.now(),
        tokenId: selectedToken.id,
        tokenName: selectedToken.name,
        tokenSymbol: selectedToken.symbol,
        amount: amount,
        duration: parseInt(stakeDuration),
        apy: selectedStakeOption.apy,
        startDate: new Date(),
        endDate: new Date(Date.now() + parseInt(stakeDuration) * 24 * 60 * 60 * 1000),
        status: 'active',
        rewards: 0
      }

      const updatedStakes = [...userStakes, newStake]
      setUserStakes(updatedStakes)
      localStorage.setItem('userStakes', JSON.stringify(updatedStakes))
      
      setSuccess(`Staking successful!\n\nToken: ${selectedToken.name} (${selectedToken.symbol})\nAmount: ${amount}\nDuration: ${stakeDuration} days\nAPY: ${selectedStakeOption.apy}%\nExpected Rewards: ${calculateRewards()} ${selectedToken.symbol}\n\nIn a real application, this would:\n1. Lock tokens in a staking contract\n2. Start earning rewards immediately\n3. Show real-time reward accumulation\n4. Allow unstaking after the lock period`)
      
      setStakeAmount('')
    } catch (err) {
      setError('Staking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUnstake = async (stakeId) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Simulate unstaking process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const stake = userStakes.find(s => s.id === stakeId)
      const updatedStakes = userStakes.map(s => 
        s.id === stakeId ? { ...s, status: 'completed' } : s
      )
      setUserStakes(updatedStakes)
      localStorage.setItem('userStakes', JSON.stringify(updatedStakes))
      
      setSuccess(`Unstaking successful!\n\nToken: ${stake.tokenName} (${stake.tokenSymbol})\nAmount: ${stake.amount}\nRewards Earned: ${stake.rewards.toFixed(2)} ${stake.tokenSymbol}\n\nIn a real application, this would:\n1. Unlock tokens from the staking contract\n2. Transfer tokens and rewards to your wallet\n3. Update your staking position status`)
    } catch (err) {
      setError('Unstaking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString()
  }

  const isStakeExpired = (endDate) => {
    return new Date(endDate) <= new Date()
  }

  if (!isConnected) {
    return (
      <PageLayout>
        <div className="stake-container">
          <div className="connection-prompt">
            <h1>Stake Tokens</h1>
            <p>Connect your wallet to stake tokens and earn rewards</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="stake-container">
        <div className="stake-header">
          <h1>Stake Tokens</h1>
          <p>Lock your tokens to earn rewards over time</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="success-message">
            <Award size={20} />
            <p style={{ whiteSpace: 'pre-line' }}>{success}</p>
          </div>
        )}

        <div className="stake-interface">
          <div className="stake-form">
            <h3>Stake New Tokens</h3>
            
            <div className="token-selector">
              <label>Select Token to Stake</label>
              <select 
                value={selectedToken?.id || ''} 
                onChange={(e) => {
                  const token = tokens.find(t => t.id === e.target.value)
                  setSelectedToken(token)
                }}
                className="token-select"
              >
                {tokens.map(token => (
                  <option key={token.id} value={token.id}>
                    {token.name} ({token.symbol})
                  </option>
                ))}
              </select>
            </div>

            {selectedToken && (
              <div className="token-info">
                <div className="token-details">
                  <div className="token-image">
                    {TokenManagementService.getTokenImage(selectedToken) ? (
                      <img src={TokenManagementService.getTokenImage(selectedToken)} alt={selectedToken.name} />
                    ) : (
                      <div className="token-image-placeholder">
                        {selectedToken.symbol.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="token-info-text">
                    <h4>{selectedToken.name}</h4>
                    <p>{selectedToken.symbol}</p>
                  </div>
                </div>
                <div className="token-balance">
                  <span className="balance-label">Available Balance</span>
                  <span className="balance-value">1,000,000 {selectedToken.symbol}</span>
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Stake Amount</label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.00"
                className="stake-input"
              />
              <small>Enter the amount of {selectedToken?.symbol || 'tokens'} to stake</small>
            </div>

            <div className="form-group">
              <label>Stake Duration</label>
              <select 
                value={stakeDuration} 
                onChange={(e) => setStakeDuration(e.target.value)}
                className="stake-select"
              >
                {stakeOptions.map(option => (
                  <option key={option.days} value={option.days}>
                    {option.days} days - {option.apy}% APY
                  </option>
                ))}
              </select>
            </div>

            {selectedStakeOption && (
              <div className="stake-summary">
                <div className="summary-row">
                  <span>Duration</span>
                  <span>{selectedStakeOption.days} days</span>
                </div>
                <div className="summary-row">
                  <span>APY</span>
                  <span className="apy-value">{selectedStakeOption.apy}%</span>
                </div>
                <div className="summary-row">
                  <span>Expected Rewards</span>
                  <span className="rewards-value">{calculateRewards()} {selectedToken?.symbol || 'tokens'}</span>
                </div>
              </div>
            )}

            <button 
              className="stake-btn"
              onClick={handleStake}
              disabled={loading || !selectedToken || !stakeAmount}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Staking...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Stake {selectedToken?.symbol || 'Tokens'}
                </>
              )}
            </button>
          </div>

          <div className="active-stakes">
            <h3>Your Active Stakes</h3>
            {userStakes.length === 0 ? (
              <div className="no-stakes">
                <Lock size={48} />
                <h4>No active stakes</h4>
                <p>Start staking tokens to earn rewards</p>
              </div>
            ) : (
              <div className="stakes-list">
                {userStakes.map(stake => (
                  <div key={stake.id} className="stake-item">
                    <div className="stake-header-info">
                      <div className="stake-token">
                        <div className="token-image">
                          {TokenManagementService.getTokenImage({ symbol: stake.tokenSymbol }) ? (
                            <img src={TokenManagementService.getTokenImage({ symbol: stake.tokenSymbol })} alt={stake.tokenName} />
                          ) : (
                            <div className="token-image-placeholder">
                              {stake.tokenSymbol.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="stake-info">
                          <h4>{stake.tokenName}</h4>
                          <p>{stake.amount} {stake.tokenSymbol}</p>
                        </div>
                      </div>
                      <div className="stake-status">
                        <span className={`status-badge ${stake.status}`}>
                          {stake.status}
                        </span>
                      </div>
                    </div>

                    <div className="stake-details">
                      <div className="detail-row">
                        <span>Duration</span>
                        <span>{stake.duration} days</span>
                      </div>
                      <div className="detail-row">
                        <span>APY</span>
                        <span>{stake.apy}%</span>
                      </div>
                      <div className="detail-row">
                        <span>Start Date</span>
                        <span>{formatDate(stake.startDate)}</span>
                      </div>
                      <div className="detail-row">
                        <span>End Date</span>
                        <span>{formatDate(stake.endDate)}</span>
                      </div>
                      <div className="detail-row">
                        <span>Rewards Earned</span>
                        <span className="rewards-earned">{stake.rewards.toFixed(2)} {stake.tokenSymbol}</span>
                      </div>
                    </div>

                    <div className="stake-actions">
                      {isStakeExpired(stake.endDate) && stake.status === 'active' ? (
                        <button 
                          className="unstake-btn"
                          onClick={() => handleUnstake(stake.id)}
                          disabled={loading}
                        >
                          <Unlock size={16} />
                          Unstake
                        </button>
                      ) : (
                        <div className="time-remaining">
                          <Clock size={16} />
                          <span>
                            {isStakeExpired(stake.endDate) 
                              ? 'Expired' 
                              : `${Math.ceil((new Date(stake.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days remaining`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="stake-info">
          <div className="info-card">
            <h4>How Staking Works</h4>
            <ul>
              <li>Lock your tokens for a specific duration</li>
              <li>Earn rewards based on the APY and duration</li>
              <li>Longer staking periods offer higher rewards</li>
              <li>Tokens are locked until the staking period ends</li>
            </ul>
          </div>
          <div className="info-card">
            <h4>Integration Required</h4>
            <p>This feature requires integration with:</p>
            <ul>
              <li>Staking smart contracts</li>
              <li>Reward calculation algorithms</li>
              <li>Token locking mechanisms</li>
              <li>Automatic reward distribution</li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}