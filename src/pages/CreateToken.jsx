import React, { useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi"
import { parseEther, formatEther } from "viem"
import PageLayout from "../components/PageLayout"
import { FACTORY_ADDRESS } from "../config/lightchain"
import factoryAbi from "../abi/factoryAbi.json"
import ImageService from "../services/imageService"

export default function CreateToken() {
  const { address, isConnected } = useAccount()
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    decimals: "18",
    initialSupply: "",
    description: "",
    image: null
  })
  const [isCreating, setIsCreating] = useState(false)
  const [createdToken, setCreatedToken] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const client = usePublicClient()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploadingImage(true)
    
    try {
      const result = await ImageService.uploadTokenImage(file, 'temp')
      
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          image: result.imageUrl
        }))
        setImagePreview(result.imageUrl)
      } else {
        alert('Image upload failed: ' + result.message)
      }
    } catch (error) {
      console.error('Image upload error:', error)
      alert('Image upload failed: ' + error.message)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }))
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }

    if (!formData.name || !formData.symbol || !formData.initialSupply) {
      alert("Please fill in all required fields")
      return
    }

    setIsCreating(true)

    try {
      const initialSupplyWei = parseEther(formData.initialSupply)

      writeContract({
        address: FACTORY_ADDRESS,
        abi: factoryAbi,
        functionName: 'createToken',
        args: [
          formData.name,
          formData.symbol,
          parseInt(formData.decimals),
          initialSupplyWei,
          address
        ],
      })
    } catch (err) {
      console.error("Error creating token:", err)
      alert("Error creating token: " + err.message)
      setIsCreating(false)
    }
  }

  // Handle successful transaction
  React.useEffect(() => {
    if (isConfirmed && hash && client) {
      setIsCreating(false)

      // Get the transaction receipt to extract the token address
      client.getTransactionReceipt({ hash }).then((receipt) => {
        // Find the TokenCreated event in the logs
        const tokenCreatedEvent = receipt.logs.find(log => {
          try {
            const decoded = client.decodeEventLog({
              abi: factoryAbi,
              data: log.data,
              topics: log.topics,
            })
            return decoded.eventName === 'TokenCreated'
          } catch {
            return false
          }
        })

        if (tokenCreatedEvent) {
          const decoded = client.decodeEventLog({
            abi: factoryAbi,
            data: tokenCreatedEvent.data,
            topics: tokenCreatedEvent.topics,
          })

          setCreatedToken({
            hash,
            name: formData.name,
            symbol: formData.symbol,
            address: decoded.args.token,
            decimals: parseInt(formData.decimals)
          })
        } else {
          // Fallback if we can't find the event
          setCreatedToken({
            hash,
            name: formData.name,
            symbol: formData.symbol,
            address: null,
            decimals: parseInt(formData.decimals)
          })
        }
      }).catch(console.error)

      // Reset form
      setFormData({
        name: "",
        symbol: "",
        decimals: "18",
        initialSupply: "",
        description: ""
      })
    }
  }, [isConfirmed, hash, client])

  return (
    <PageLayout>
      <div className="create-token-container">
        <div className="create-token-header">
          <h1 className="title">Create Your Meme Token</h1>
          <p className="subtitle">Launch your token on Lightchain AI in just a few clicks</p>
        </div>

        <div className="create-token-content">
          <div className="form-section">
            <form onSubmit={handleSubmit} className="token-form">
              <div className="form-group">
                <label htmlFor="name">Token Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., DogeCoin, ShibaInu, etc."
                  required
                  className="form-input"
                />
                <small>This is the full name of your token</small>
              </div>

              <div className="form-group">
                <label htmlFor="symbol">Token Symbol *</label>
                <input
                  type="text"
                  id="symbol"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  placeholder="e.g., DOGE, SHIB, etc."
                  required
                  className="form-input"
                  maxLength="10"
                />
                <small>Short symbol for your token (max 10 characters)</small>
              </div>

              <div className="form-group">
                <label htmlFor="decimals">Decimals</label>
                <select
                  id="decimals"
                  name="decimals"
                  value={formData.decimals}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="18">18 (Recommended)</option>
                  <option value="9">9</option>
                  <option value="6">6</option>
                  <option value="0">0</option>
                </select>
                <small>Number of decimal places for your token</small>
              </div>

              <div className="form-group">
                <label htmlFor="initialSupply">Initial Supply *</label>
                <input
                  type="number"
                  id="initialSupply"
                  name="initialSupply"
                  value={formData.initialSupply}
                  onChange={handleInputChange}
                  placeholder="e.g., 1000000"
                  required
                  className="form-input"
                  min="1"
                  step="1"
                />
                <small>Total number of tokens to create</small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your token, its purpose, and community..."
                  className="form-textarea"
                  rows="4"
                />
                <small>Help others understand your token</small>
              </div>

              <div className="form-group">
                <label htmlFor="image">Token Image (Optional)</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="image-upload-input"
                    disabled={isUploadingImage}
                  />
                  <label htmlFor="image" className="image-upload-label">
                    {isUploadingImage ? 'Uploading...' : 'Choose Image'}
                  </label>
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Token preview" />
                      <button type="button" onClick={removeImage} className="remove-image-btn">
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                <small>Upload a logo or image for your token (max 5MB, JPEG/PNG/GIF/WebP)</small>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={isPending || isConfirming || isCreating || !isConnected}
                  className="create-button"
                >
                  {isPending || isConfirming || isCreating ? (
                    <>
                      <span className="spinner"></span>
                      {isPending ? "Confirming..." : isConfirming ? "Creating..." : "Creating Token..."}
                    </>
                  ) : (
                    "🚀 Create Token"
                  )}
                </button>
              </div>

              {error && (
                <div className="error-message">
                  Error: {error.shortMessage || error.message}
                </div>
              )}
            </form>
          </div>

          <div className="info-section">
            <div className="info-card">
              <h3>📋 Token Creation Info</h3>
              <ul>
                <li>✅ No coding required</li>
                <li>✅ Instant deployment</li>
                <li>✅ Low gas fees on Lightchain AI</li>
                <li>✅ Full ownership of your token</li>
                <li>✅ Compatible with all wallets</li>
              </ul>
            </div>

            <div className="info-card">
              <h3>💰 Cost Breakdown</h3>
              <div className="cost-item">
                <span>Smart Contract Deployment</span>
                <span>~0.001 LCAI</span>
              </div>
              <div className="cost-item">
                <span>Gas Fees</span>
                <span>~0.0005 LCAI</span>
              </div>
              <div className="cost-item total">
                <span>Total Estimated Cost</span>
                <span>~0.0015 LCAI</span>
              </div>
            </div>

            <div className="info-card">
              <h3>⚠️ Important Notes</h3>
              <ul>
                <li>Make sure you have enough LCAI tokens for gas fees</li>
                <li>Token name and symbol cannot be changed after creation</li>
                <li>You will be the owner of the created token</li>
                <li>All tokens will be minted to your wallet</li>
              </ul>
            </div>
          </div>
        </div>

        {createdToken && (
          <div className="success-modal">
            <div className="success-content">
              <h2>🎉 Token Created Successfully!</h2>
              <div className="success-details">
                <p><strong>Token Name:</strong> {createdToken.name}</p>
                <p><strong>Symbol:</strong> {createdToken.symbol}</p>
                <p><strong>Token Address:</strong>
                  <span className="token-address">
                    {createdToken.address.slice(0, 10)}...{createdToken.address.slice(-8)}
                  </span>
                </p>
                <p><strong>Transaction Hash:</strong>
                  <a
                    href={`https://testnet.lightscan.app/tx/${createdToken.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tx-link"
                  >
                    {createdToken.hash.slice(0, 10)}...{createdToken.hash.slice(-8)}
                  </a>
                </p>
              </div>

              <div className="wallet-actions">
                <button
                  onClick={() => {
                    if (window.ethereum) {
                      window.ethereum.request({
                        method: 'wallet_watchAsset',
                        params: {
                          type: 'ERC20',
                          options: {
                            address: createdToken.address,
                            symbol: createdToken.symbol,
                            decimals: createdToken.decimals,
                            image: 'https://via.placeholder.com/32x32/FFC107/000000?text=' + createdToken.symbol.charAt(0)
                          }
                        }
                      }).catch(console.error)
                    } else {
                      alert('Please install MetaMask or another Web3 wallet to add tokens')
                    }
                  }}
                  className="add-to-wallet-button"
                >
                  📱 Add to Wallet
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdToken.address)
                    alert('Token address copied to clipboard!')
                  }}
                  className="copy-address-button"
                >
                  📋 Copy Address
                </button>
              </div>
              <button
                onClick={() => setCreatedToken(null)}
                className="close-button"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
