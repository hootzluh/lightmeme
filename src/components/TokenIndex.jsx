import React, { useMemo, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAccount, usePublicClient } from 'wagmi'
import { formatEther } from 'viem'
import factoryAbi from '../abi/factoryAbi.json'
import { FACTORY_ADDRESS, getTokenUrl } from '../config/lightchain'
import TokenSwap from './TokenSwap'
import PriceService from '../services/priceService'
import ImageService from '../services/imageService'
import TokenManagementService from '../services/tokenManagementService'

const erc20Name = { name: 'name', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] }
const erc20Symbol = { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] }
const erc20Decimals = { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] }
const erc20TotalSupply = { name: 'totalSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] }

async function fetchFactoryTokens(client) {
  if (!FACTORY_ADDRESS) throw new Error('FACTORY_ADDRESS not set')
  const total = await client.readContract({ address: FACTORY_ADDRESS, abi: factoryAbi, functionName: 'allTokensLength', args: [] })
  const page = await client.readContract({ address: FACTORY_ADDRESS, abi: factoryAbi, functionName: 'getTokens', args: [0n, total] })
  return page
}

async function fetchErc20Meta(client, token) {
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    client.readContract({ address: token, abi: [erc20Name], functionName: 'name' }),
    client.readContract({ address: token, abi: [erc20Symbol], functionName: 'symbol' }),
    client.readContract({ address: token, abi: [erc20Decimals], functionName: 'decimals' }),
    client.readContract({ address: token, abi: [erc20TotalSupply], functionName: 'totalSupply' }),
  ])
  
  // Fetch price data
  const price = await PriceService.getTokenPrice(token)
  
  // Get token image - check for stored image first, then use default
  const storedImageUrl = TokenManagementService.getTokenImage(token)
  const imageUrl = storedImageUrl || ImageService.getDefaultTokenImage(symbol)
  
  return { 
    token, 
    name, 
    symbol, 
    decimals: Number(decimals), 
    totalSupply,
    price: PriceService.formatPrice(price),
    imageUrl
  }
}

export default function TokenIndex() {
  const client = usePublicClient()
  const { isConnected } = useAccount()
  const [query, setQuery] = useState('')
  const [selectedToken, setSelectedToken] = useState(null)

  const { data: tokens, isLoading: loadingTokens, error: tokensError } = useQuery({
    queryKey: ['factoryTokens'],
    queryFn: () => fetchFactoryTokens(client),
    enabled: !!client,
  })

  const { data: metas, isLoading: loadingMeta, error: metaError } = useQuery({
    queryKey: ['tokenMetas', tokens?.length],
    queryFn: async () => {
      if (!tokens) return []
      const list = await Promise.all(tokens.map((t) => fetchErc20Meta(client, t)))
      return list
    },
    enabled: !!client && Array.isArray(tokens) && tokens.length > 0,
  })

  const filtered = useMemo(() => {
    if (!metas) return []
    const q = query.trim().toLowerCase()
    if (!q) return metas
    return metas.filter((m) =>
      m.name.toLowerCase().includes(q) || m.symbol.toLowerCase().includes(q) || m.token.toLowerCase().includes(q)
    )
  }, [metas, query])

  return (
    <div className="token-index">
      <div className="token-index-header">
        <h3 className="title" style={{ fontSize: '1.5rem' }}>Recently Launched Tokens</h3>
      </div>
      <div className="token-search-container">
        <input
          className="token-search"
          placeholder="Search by name, symbol, or address"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {tokensError && <p className="token-hint">Factory read failed: {String(tokensError.message || tokensError)}</p>}
      {metaError && <p className="token-hint">Metadata read failed: {String(metaError.message || metaError)}</p>}

      {loadingTokens || loadingMeta ? (
        <div className="token-grid token-grid-loading">Loading…</div>
      ) : filtered && filtered.length > 0 ? (
        <div className="token-grid">
          {filtered.map((m) => (
            <div key={m.token} className="token-card">
              <div className="token-card-content">
                <div className="token-card-info">
                  <div className="token-card-name">{m.name}</div>
                  <div className="token-card-symbol">({m.symbol})</div>
                  <div className="token-card-price">{m.price}</div>
                </div>
                <div className="token-card-image">
                  <img 
                    src={m.imageUrl} 
                    alt={`${m.name} token`}
                    className="token-image"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div className="token-image-placeholder" style={{ display: 'none' }}>
                    {m.symbol.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
              <div className="token-card-actions">
                <button
                  className="trade-btn"
                  onClick={() => setSelectedToken({
                    address: m.token,
                    name: m.name,
                    symbol: m.symbol,
                    decimals: m.decimals
                  })}
                >
                  🔄 Trade
                </button>
                <a
                  href={getTokenUrl(m.token)}
                  target="_blank"
                  rel="noreferrer"
                  className="view-btn"
                >
                  🔍 View
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="token-grid token-grid-empty">No tokens yet</div>
      )}

      {/* Token Swap Modal */}
      {selectedToken && (
        <TokenSwap
          token={selectedToken}
          onClose={() => setSelectedToken(null)}
        />
      )}
    </div>
  )
}
