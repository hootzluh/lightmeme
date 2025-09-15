import React, { useState, useEffect } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import PageLayout from '../components/PageLayout'
import ImageService from '../services/imageService'
import TokenManagementService from '../services/tokenManagementService'
import { FACTORY_ADDRESS } from '../config/lightchain'
import factoryAbi from '../abi/factoryAbi.json'

// ERC-20 ABI for basic token functions
const erc20Abi = [
  { name: 'name', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { name: 'totalSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] }
]

// Fetch user's tokens
async function fetchUserTokens(client, address) {
  if (!client || !address || !FACTORY_ADDRESS) return []
  
  try {
    const userTokensList = await client.readContract({
      address: FACTORY_ADDRESS,
      abi: factoryAbi,
      functionName: 'getTokensByOwner',
      args: [address]
    })

    const tokenDetails = await Promise.all(
      userTokensList.map(async (tokenAddress) => {
        try {
          const [name, symbol, decimals, totalSupply] = await Promise.all([
            client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'name' }),
            client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'symbol' }),
            client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'decimals' }),
            client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: 'totalSupply' })
          ])

          // Get stored image and metadata
          const imageUrl = TokenManagementService.getTokenImage(tokenAddress)
          const metadata = TokenManagementService.getTokenMetadata(tokenAddress)

          return {
            address: tokenAddress,
            name,
            symbol,
            decimals: Number(decimals),
            totalSupply: totalSupply.toString(),
            imageUrl: imageUrl || ImageService.getDefaultTokenImage(symbol),
            metadata
          }
        } catch (error) {
          console.error(`Error fetching token ${tokenAddress}:`, error)
          return null
        }
      })
    )

    return tokenDetails.filter(detail => detail !== null)
  } catch (error) {
    console.error('Error fetching user tokens:', error)
    return []
  }
}

export default function TokenManagement() {
  const { address, isConnected } = useAccount()
  const client = usePublicClient()
  const [selectedToken, setSelectedToken] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  const { data: userTokens, isLoading, refetch } = useQuery({
    queryKey: ['userTokens', address],
    queryFn: () => fetchUserTokens(client, address),
    enabled: !!client && !!address && isConnected,
  })

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !selectedToken) return

    setIsUploading(true)
    
    try {
      const result = await ImageService.uploadTokenImage(file, selectedToken.address)
      
      if (result.success) {
        // Update the token image in storage
        const updateResult = await TokenManagementService.updateTokenImage(
          selectedToken.address, 
          result.imageUrl
        )
        
        if (updateResult.success) {
          setImagePreview(result.imageUrl)
          // Refresh the token list
          refetch()
          alert('Token image updated successfully!')
        } else {
          alert('Failed to update token image: ' + updateResult.message)
        }
      } else {
        alert('Image upload failed: ' + result.message)
      }
    } catch (error) {
      console.error('Image upload error:', error)
      alert('Image upload failed: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = async () => {
    if (!selectedToken) return

    try {
      const result = await TokenManagementService.removeTokenImage(selectedToken.address)
      
      if (result.success) {
        setImagePreview(null)
        refetch()
        alert('Token image removed successfully!')
      } else {
        alert('Failed to remove token image: ' + result.message)
      }
    } catch (error) {
      console.error('Remove image error:', error)
      alert('Failed to remove token image: ' + error.message)
    }
  }

  const openTokenEditor = (token) => {
    setSelectedToken(token)
    setImagePreview(token.imageUrl)
  }

  const closeTokenEditor = () => {
    setSelectedToken(null)
    setImagePreview(null)
  }

  if (!isConnected) {
    return (
      <PageLayout>
        <div className="token-management-container">
          <div className="no-wallet-message">
            <h1>Token Management</h1>
            <p>Connect your wallet to manage your created tokens.</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="token-management-container">
          <div className="loading-message">
            <div className="spinner"></div>
            <p>Loading your tokens...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="token-management-container">
        <div className="token-management-header">
          <h1>Token Management</h1>
          <p>Manage your created tokens and update their images</p>
        </div>

        {!userTokens || userTokens.length === 0 ? (
          <div className="no-tokens-message">
            <h3>No Tokens Found</h3>
            <p>You haven't created any tokens yet.</p>
            <a href="/create-token" className="create-token-btn">
              Create Your First Token
            </a>
          </div>
        ) : (
          <div className="tokens-grid">
            {userTokens.map((token) => (
              <div key={token.address} className="token-management-card">
                <div className="token-card-header">
                  <img 
                    src={token.imageUrl} 
                    alt={`${token.name} token`}
                    className="token-image"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="token-image-placeholder" style={{ display: 'none' }}>
                    {token.symbol.charAt(0).toUpperCase()}
                  </div>
                  <div className="token-info">
                    <h3>{token.name}</h3>
                    <p>({token.symbol})</p>
                    <small>{token.address.slice(0, 6)}...{token.address.slice(-4)}</small>
                  </div>
                </div>
                <div className="token-card-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => openTokenEditor(token)}
                  >
                    ✏️ Edit Image
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Token Editor Modal */}
        {selectedToken && (
          <div className="token-editor-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Edit {selectedToken.name} Image</h2>
                <button className="close-btn" onClick={closeTokenEditor}>✕</button>
              </div>
              
              <div className="modal-body">
                <div className="current-image">
                  <h3>Current Image:</h3>
                  <img 
                    src={imagePreview} 
                    alt="Current token image"
                    className="current-image-preview"
                  />
                </div>

                <div className="image-upload-section">
                  <h3>Upload New Image:</h3>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      id="token-image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="image-upload-input"
                      disabled={isUploading}
                    />
                    <label htmlFor="token-image-upload" className="image-upload-label">
                      {isUploading ? 'Uploading...' : 'Choose New Image'}
                    </label>
                  </div>
                  
                  {imagePreview && (
                    <button 
                      className="remove-image-btn"
                      onClick={removeImage}
                      disabled={isUploading}
                    >
                      🗑️ Remove Image
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

