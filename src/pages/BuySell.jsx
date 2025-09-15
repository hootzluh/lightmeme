import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ArrowUpDown, TrendingUp, TrendingDown, DollarSign, AlertCircle, ExternalLink } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import TokenManagementService from '../services/tokenManagementService'

export default function BuySell() {
  const { address, isConnected } = useAccount()
  const [tokens, setTokens] = useState([])
  const [selectedToken, setSelectedToken] = useState(null)
  const [tradeType, setTradeType] = useState('buy') // 'buy' or 'sell'
  const [amount, setAmount] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadTokens = () => {
      try {
        const userTokens = TokenManagementService.getAllTokens()
        setTokens(userTokens)
        if (userTokens.length > 0) {
          setSelectedToken(userTokens[0])
        }
      } catch (err) {
        console.error('Error loading tokens:', err)
        setError('Failed to load tokens')
      }
    }

    if (isConnected) {
      loadTokens()
    }
  }, [isConnected])

  const handleTrade = async () => {
    if (!selectedToken || !amount || !price) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Simulate trade processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert(`${tradeType === 'buy' ? 'Buy' : 'Sell'} Order Placed!\n\nToken: ${selectedToken.name} (${selectedToken.symbol})\nAmount: ${amount}\nPrice: $${price}\n\nIn a real application, this would:\n1. Connect to a DEX like Uniswap\n2. Execute the trade on-chain\n3. Update your token balance\n4. Show transaction hash`)
      
      setAmount('')
      setPrice('')
    } catch (err) {
      setError('Trade failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    if (amount && price) {
      return (parseFloat(amount) * parseFloat(price)).toFixed(2)
    }
    return '0.00'
  }

  if (!isConnected) {
    return (
      <PageLayout>
        <div className="buy-sell-container">
          <div className="connection-prompt">
            <h1>Buy & Sell Tokens</h1>
            <p>Connect your wallet to start trading</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="buy-sell-container">
        <div className="trade-header">
          <h1>Buy & Sell Tokens</h1>
          <p>Trade tokens directly on the platform</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="trade-interface">
          <div className="trade-type-selector">
            <button 
              className={`trade-type-btn ${tradeType === 'buy' ? 'active' : ''}`}
              onClick={() => setTradeType('buy')}
            >
              <TrendingUp size={20} />
              Buy
            </button>
            <button 
              className={`trade-type-btn ${tradeType === 'sell' ? 'active' : ''}`}
              onClick={() => setTradeType('sell')}
            >
              <TrendingDown size={20} />
              Sell
            </button>
          </div>

          <div className="token-selector">
            <label>Select Token</label>
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
                  <h3>{selectedToken.name}</h3>
                  <p>{selectedToken.symbol}</p>
                </div>
              </div>
              <div className="token-price">
                <span className="price-label">Current Price</span>
                <span className="price-value">$0.000001</span>
              </div>
            </div>
          )}

          <div className="trade-form">
            <div className="form-group">
              <label>Amount ({selectedToken?.symbol || 'TOKEN'})</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="trade-input"
              />
            </div>

            <div className="form-group">
              <label>Price per Token (USD)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.000001"
                step="0.000001"
                className="trade-input"
              />
            </div>

            <div className="trade-summary">
              <div className="summary-row">
                <span>Total Value</span>
                <span>${calculateTotal()}</span>
              </div>
              <div className="summary-row">
                <span>Trade Type</span>
                <span className={`trade-type-badge ${tradeType}`}>
                  {tradeType === 'buy' ? 'Buy Order' : 'Sell Order'}
                </span>
              </div>
            </div>

            <button 
              className={`trade-btn ${tradeType}`}
              onClick={handleTrade}
              disabled={loading || !amount || !price}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Processing...
                </>
              ) : (
                <>
                  <ArrowUpDown size={20} />
                  {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedToken?.symbol || 'Token'}
                </>
              )}
            </button>
          </div>

          <div className="trade-info">
            <div className="info-card">
              <h4>How it works</h4>
              <ul>
                <li>Select a token from your created tokens</li>
                <li>Choose to buy or sell</li>
                <li>Enter amount and price</li>
                <li>Execute the trade</li>
              </ul>
            </div>
            <div className="info-card">
              <h4>Integration Required</h4>
              <p>This feature requires integration with:</p>
              <ul>
                <li>Uniswap V2/V3 for trading</li>
                <li>Price feeds for real-time data</li>
                <li>Wallet connection for transactions</li>
                <li>Gas estimation and execution</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}