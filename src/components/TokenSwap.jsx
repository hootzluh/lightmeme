import React, { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useReadContract } from 'wagmi'
import { parseEther, formatEther } from 'viem'

// ERC-20 ABI for token interactions
const erc20Abi = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'transfer', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { name: 'approve', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { name: 'allowance', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] }
]

// Simple swap contract ABI (we'll create this)
const swapAbi = [
  {
    name: 'swapLCAIForToken',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'tokenAddress', type: 'address' },
      { name: 'minTokensOut', type: 'uint256' }
    ],
    outputs: [{ name: 'tokensOut', type: 'uint256' }]
  },
  {
    name: 'swapTokenForLCAI',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenAddress', type: 'address' },
      { name: 'tokenAmount', type: 'uint256' },
      { name: 'minLCAIOut', type: 'uint256' }
    ],
    outputs: [{ name: 'lcaiOut', type: 'uint256' }]
  },
  {
    name: 'getTokenPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenAddress', type: 'address' }],
    outputs: [{ name: 'price', type: 'uint256' }]
  }
]

export default function TokenSwap({ token, onClose }) {
  const { address, isConnected } = useAccount()
  const client = usePublicClient()
  const [swapType, setSwapType] = useState('buy') // 'buy' or 'sell'
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [price, setPrice] = useState('0')
  const [userBalance, setUserBalance] = useState('0')
  const [tokenBalance, setTokenBalance] = useState('0')

  // For demo purposes, we'll use a simple transfer system
  // In production, this would be a proper swap contract with liquidity

  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })

  // Fetch user balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!client || !address) return

      try {
        // Get LCAI balance (native token)
        const lcaiBalance = await client.getBalance({ address })
        setUserBalance(formatEther(lcaiBalance))

        // Get token balance
        const tokenBalance = await client.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address]
        })
        setTokenBalance(formatEther(tokenBalance))
      } catch (error) {
        console.error('Error fetching balances:', error)
      }
    }

    fetchBalances()
  }, [client, address, token.address])

  // Calculate output amount based on input
  const calculateOutput = (inputAmount) => {
    if (!inputAmount || inputAmount === '0') return '0'

    // Simple price calculation - in real implementation, this would use AMM formulas
    const input = parseFloat(inputAmount)
    const tokenPrice = parseFloat(price) || 0.000001 // Default price if not available

    if (swapType === 'buy') {
      // LCAI to Token: input LCAI / token price
      return (input / tokenPrice).toFixed(6)
    } else {
      // Token to LCAI: input tokens * token price
      return (input * tokenPrice).toFixed(6)
    }
  }

  const handleSwap = async () => {
    if (!isConnected || !amount || amount === '0') {
      alert('Please connect wallet and enter amount')
      return
    }

    setIsLoading(true)

    try {
      if (swapType === 'buy') {
        // For demo: Show that buying would work with a real swap contract
        alert(`Demo Mode: In production, this would buy ${calculateOutput(amount)} ${token.symbol} for ${amount} LCAI using a swap contract with liquidity.`)
        setIsLoading(false)
      } else {
        // For demo: Show that selling would work with a real swap contract
        alert(`Demo Mode: In production, this would sell ${amount} ${token.symbol} for ${calculateOutput(amount)} LCAI using a swap contract with liquidity.`)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Swap error:', error)
      alert('Swap failed: ' + error.message)
      setIsLoading(false)
    }
  }

  // Handle successful transaction
  useEffect(() => {
    if (isConfirmed) {
      setIsLoading(false)
      alert('Swap completed successfully!')
      setAmount('')
      onClose()
    }
  }, [isConfirmed, onClose])

  return (
    <div className="swap-modal">
      <div className="swap-content">
        <div className="swap-header">
          <h2>🔄 Trade {token.symbol}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="demo-notice">
          <p>🎭 <strong>Demo Mode:</strong> This is a demonstration interface. No real transactions will be executed.</p>
        </div>

        <div className="swap-tabs">
          <button
            className={`tab ${swapType === 'buy' ? 'active' : ''}`}
            onClick={() => setSwapType('buy')}
          >
            Buy {token.symbol}
          </button>
          <button
            className={`tab ${swapType === 'sell' ? 'active' : ''}`}
            onClick={() => setSwapType('sell')}
          >
            Sell {token.symbol}
          </button>
        </div>

        <div className="swap-form">
          <div className="input-group">
            <label>
              {swapType === 'buy' ? 'Pay (LCAI)' : `Sell (${token.symbol})`}
            </label>
            <div className="input-container">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.000001"
              />
              <button
                className="max-btn"
                onClick={() => setAmount(swapType === 'buy' ? userBalance : tokenBalance)}
              >
                MAX
              </button>
            </div>
            <div className="balance">
              Balance: {swapType === 'buy' ? `${parseFloat(userBalance).toFixed(4)} LCAI` : `${parseFloat(tokenBalance).toFixed(4)} ${token.symbol}`}
            </div>
          </div>

          <div className="swap-arrow">↓</div>

          <div className="output-group">
            <label>
              {swapType === 'buy' ? `Receive (${token.symbol})` : 'Receive (LCAI)'}
            </label>
            <div className="output-container">
              <input
                type="text"
                value={calculateOutput(amount)}
                readOnly
                className="output-input"
              />
            </div>
            <div className="price-info">
              Price: 1 {token.symbol} = {price} LCAI
            </div>
          </div>

          <button
            className="swap-btn"
            onClick={handleSwap}
            disabled={isLoading || isPending || !amount || amount === '0'}
          >
            {isLoading || isPending ? 'Processing...' : `${swapType === 'buy' ? 'Buy' : 'Sell'} ${token.symbol}`}
          </button>

          {error && (
            <div className="error-message">
              Error: {error.message}
            </div>
          )}
        </div>

        <div className="swap-info">
          <p>⚠️ <strong>Demo Mode:</strong> This is a demonstration of the trading interface.</p>
          <p>To enable real trading, you would need:</p>
          <ul>
            <li><strong>Swap Contract:</strong> Deployed smart contract with liquidity pools</li>
            <li><strong>Initial Liquidity:</strong> Token creators add LCAI/token pairs</li>
            <li><strong>Price Oracle:</strong> Real-time price feeds from DEXs</li>
            <li><strong>AMM Logic:</strong> Automated market maker algorithms</li>
            <li><strong>Slippage Protection:</strong> Price impact limits</li>
            <li><strong>Gas Optimization:</strong> Efficient transaction batching</li>
          </ul>
          <p><strong>Current Status:</strong> All calculations are simulated for demonstration purposes.</p>
        </div>
      </div>
    </div>
  )
}
