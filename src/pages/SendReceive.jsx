import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Send, Download, Copy, Check, AlertCircle, ExternalLink } from 'lucide-react'
import PageLayout from '../components/PageLayout'
import TokenManagementService from '../services/tokenManagementService'

export default function SendReceive() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState('send') // 'send' or 'receive'
  const [tokens, setTokens] = useState([])
  const [selectedToken, setSelectedToken] = useState(null)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)

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

  const handleSend = async () => {
    if (!selectedToken || !recipientAddress || !amount) {
      setError('Please fill in all required fields')
      return
    }

    // Basic address validation
    if (!recipientAddress.startsWith('0x') || recipientAddress.length !== 42) {
      setError('Please enter a valid Ethereum address')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess(`Transaction sent successfully!\n\nToken: ${selectedToken.name} (${selectedToken.symbol})\nAmount: ${amount}\nRecipient: ${recipientAddress}\n\nIn a real application, this would:\n1. Connect to the token contract\n2. Execute the transfer transaction\n3. Wait for confirmation\n4. Show transaction hash`)
      
      setRecipientAddress('')
      setAmount('')
      setMessage('')
    } catch (err) {
      setError('Transaction failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const generateQRCode = () => {
    alert('QR Code Generation\n\nIn a real application, this would:\n1. Generate a QR code for your wallet address\n2. Allow easy sharing for receiving tokens\n3. Include token-specific information if needed')
  }

  if (!isConnected) {
    return (
      <PageLayout>
        <div className="send-receive-container">
          <div className="connection-prompt">
            <h1>Send & Receive Tokens</h1>
            <p>Connect your wallet to send and receive tokens</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="send-receive-container">
        <div className="send-receive-header">
          <h1>Send & Receive Tokens</h1>
          <p>Transfer tokens to other wallets or receive tokens from others</p>
        </div>

        <div className="tab-selector">
          <button 
            className={`tab-btn ${activeTab === 'send' ? 'active' : ''}`}
            onClick={() => setActiveTab('send')}
          >
            <Send size={20} />
            Send
          </button>
          <button 
            className={`tab-btn ${activeTab === 'receive' ? 'active' : ''}`}
            onClick={() => setActiveTab('receive')}
          >
            <Download size={20} />
            Receive
          </button>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="success-message">
            <Check size={20} />
            <p style={{ whiteSpace: 'pre-line' }}>{success}</p>
          </div>
        )}

        {activeTab === 'send' ? (
          <div className="send-interface">
            <div className="token-selector">
              <label>Select Token to Send</label>
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
                <div className="token-balance">
                  <span className="balance-label">Your Balance</span>
                  <span className="balance-value">1,000,000 {selectedToken.symbol}</span>
                </div>
              </div>
            )}

            <div className="send-form">
              <div className="form-group">
                <label>Recipient Address</label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                  className="send-input"
                />
                <small>Enter the Ethereum wallet address of the recipient</small>
              </div>

              <div className="form-group">
                <label>Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="send-input"
                />
                <small>Enter the amount of {selectedToken?.symbol || 'tokens'} to send</small>
              </div>

              <div className="form-group">
                <label>Message (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message with your transfer..."
                  className="send-textarea"
                  rows={3}
                />
              </div>

              <button 
                className="send-btn"
                onClick={handleSend}
                disabled={loading || !selectedToken || !recipientAddress || !amount}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send {selectedToken?.symbol || 'Tokens'}
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="receive-interface">
            <div className="receive-info">
              <h3>Your Wallet Address</h3>
              <div className="address-display">
                <span className="address-text">{address}</span>
                <button 
                  className="copy-btn"
                  onClick={copyAddress}
                  title="Copy address"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="address-note">Share this address to receive tokens</p>
            </div>

            <div className="qr-section">
              <button 
                className="qr-btn"
                onClick={generateQRCode}
              >
                <ExternalLink size={20} />
                Generate QR Code
              </button>
            </div>

            <div className="receive-instructions">
              <h4>How to receive tokens:</h4>
              <ol>
                <li>Share your wallet address with the sender</li>
                <li>Make sure they have the correct token contract address</li>
                <li>Wait for the transaction to be confirmed on the blockchain</li>
                <li>Check your wallet balance to see the received tokens</li>
              </ol>
            </div>

            <div className="supported-tokens">
              <h4>Supported Tokens</h4>
              <div className="tokens-list">
                {tokens.map(token => (
                  <div key={token.id} className="supported-token">
                    <div className="token-image">
                      {TokenManagementService.getTokenImage(token) ? (
                        <img src={TokenManagementService.getTokenImage(token)} alt={token.name} />
                      ) : (
                        <div className="token-image-placeholder">
                          {token.symbol.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="token-info">
                      <span className="token-name">{token.name}</span>
                      <span className="token-symbol">{token.symbol}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="integration-info">
          <div className="info-card">
            <h4>Blockchain Integration Required</h4>
            <p>This feature requires integration with:</p>
            <ul>
              <li>Ethereum blockchain for token transfers</li>
              <li>Token contract interactions</li>
              <li>Gas estimation and transaction execution</li>
              <li>Transaction status monitoring</li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}