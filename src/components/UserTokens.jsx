import React, { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import WalletButton from './WalletButton';
import { FACTORY_ADDRESS } from '../config/lightchain';
import factoryAbi from '../abi/factoryAbi.json';

const erc20Name = { name: 'name', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] };
const erc20Symbol = { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] };
const erc20Decimals = { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] };
const erc20TotalSupply = { name: 'totalSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] };
const erc20BalanceOf = { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] };

async function fetchUserTokens(client, userAddress) {
  if (!FACTORY_ADDRESS || !userAddress) return [];

  try {
    const userTokens = await client.readContract({
      address: FACTORY_ADDRESS,
      abi: factoryAbi,
      functionName: 'getTokensByOwner',
      args: [userAddress]
    });
    return userTokens;
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    return [];
  }
}

async function fetchTokenDetails(client, tokenAddress, userAddress) {
  try {
    const [name, symbol, decimals, totalSupply, balance] = await Promise.all([
      client.readContract({ address: tokenAddress, abi: [erc20Name], functionName: 'name' }),
      client.readContract({ address: tokenAddress, abi: [erc20Symbol], functionName: 'symbol' }),
      client.readContract({ address: tokenAddress, abi: [erc20Decimals], functionName: 'decimals' }),
      client.readContract({ address: tokenAddress, abi: [erc20TotalSupply], functionName: 'totalSupply' }),
      client.readContract({ address: tokenAddress, abi: [erc20BalanceOf], functionName: 'balanceOf', args: [userAddress] })
    ]);

    return {
      address: tokenAddress,
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: totalSupply.toString(),
      balance: balance.toString()
    };
  } catch (error) {
    console.error('Error fetching token details:', error);
    return null;
  }
}

const UserTokens = () => {
  const { address, isConnected } = useAccount();
  const client = usePublicClient();
  const [selectedToken, setSelectedToken] = useState(null);

  const { data: userTokens, isLoading: loadingTokens } = useQuery({
    queryKey: ['userTokens', address],
    queryFn: () => fetchUserTokens(client, address),
    enabled: !!client && !!address && isConnected,
  });

  const { data: tokenDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ['tokenDetails', userTokens, address],
    queryFn: async () => {
      if (!userTokens || userTokens.length === 0) return [];
      const details = await Promise.all(
        userTokens.map(token => fetchTokenDetails(client, token, address))
      );
      return details.filter(detail => detail !== null);
    },
    enabled: !!client && !!userTokens && userTokens.length > 0,
  });

  const formatTokenAmount = (amount, decimals) => {
    const formatted = (Number(amount) / Math.pow(10, decimals)).toLocaleString();
    return formatted;
  };

  const calculateTokenValue = (balance, decimals) => {
    // Mock calculation - in real app, you'd get price from an oracle or DEX
    const amount = Number(balance) / Math.pow(10, decimals);
    const mockPrice = Math.random() * 0.01; // Random price between 0 and 0.01 LCAI
    return (amount * mockPrice).toFixed(6);
  };

  if (!isConnected) {
    return (
      <div className="user-tokens-container">
        <div className="no-wallet-message">
          <h3>Connect Your Wallet</h3>
          <p>Connect your wallet to view your created tokens and analytics.</p>
          <div className="wallet-cta">
            <WalletButton />
          </div>
        </div>
      </div>
    );
  }

  if (loadingTokens || loadingDetails) {
    return (
      <div className="user-tokens-container">
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Loading your tokens...</p>
        </div>
      </div>
    );
  }

  if (!tokenDetails || tokenDetails.length === 0) {
    return (
      <div className="user-tokens-container">
        <div className="no-tokens-message">
          <h3>No Tokens Created Yet</h3>
          <p>You haven't created any tokens yet. Start by creating your first meme token!</p>
          <a href="/create-token" className="create-first-token-btn">
            🚀 Create Your First Token
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="user-tokens-container">
      <div className="tokens-header">
        <h2>Your Tokens ({tokenDetails.length})</h2>
        <p>Manage and track your created meme tokens</p>
      </div>

      <div className="tokens-grid">
        {tokenDetails.map((token, index) => (
          <div key={token.address} className="token-card">
            <div className="token-card-header">
              <div className="token-info">
                <h3>{token.name}</h3>
                <span className="token-symbol">{token.symbol}</span>
              </div>
              <div className="token-actions">
                <button
                  className="action-btn primary"
                  onClick={() => setSelectedToken(token)}
                >
                  📊 Analytics
                </button>
                <a
                  href={`https://testnet.lightscan.app/address/${token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn secondary"
                >
                  🔍 Explorer
                </a>
              </div>
            </div>

            <div className="token-stats">
              <div className="stat-item">
                <span className="stat-label">Your Balance</span>
                <span className="stat-value">
                  {formatTokenAmount(token.balance, token.decimals)} {token.symbol}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Supply</span>
                <span className="stat-value">
                  {formatTokenAmount(token.totalSupply, token.decimals)} {token.symbol}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Estimated Value</span>
                <span className="stat-value">
                  {calculateTokenValue(token.balance, token.decimals)} LCAI
                </span>
              </div>
            </div>

            <div className="token-address">
              <code>{token.address.slice(0, 10)}...{token.address.slice(-8)}</code>
            </div>
          </div>
        ))}
      </div>

      {selectedToken && (
        <div className="token-analytics-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedToken.name} Analytics</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedToken(null)}
              >
                ✕
              </button>
            </div>
            <div className="analytics-content">
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h4>Token Metrics</h4>
                  <div className="metric">
                    <span>Symbol:</span>
                    <span>{selectedToken.symbol}</span>
                  </div>
                  <div className="metric">
                    <span>Decimals:</span>
                    <span>{selectedToken.decimals}</span>
                  </div>
                  <div className="metric">
                    <span>Total Supply:</span>
                    <span>{formatTokenAmount(selectedToken.totalSupply, selectedToken.decimals)}</span>
                  </div>
                </div>
                <div className="analytics-card">
                  <h4>Your Holdings</h4>
                  <div className="metric">
                    <span>Balance:</span>
                    <span>{formatTokenAmount(selectedToken.balance, selectedToken.decimals)} {selectedToken.symbol}</span>
                  </div>
                  <div className="metric">
                    <span>Estimated Value:</span>
                    <span>{calculateTokenValue(selectedToken.balance, selectedToken.decimals)} LCAI</span>
                  </div>
                  <div className="metric">
                    <span>Ownership %:</span>
                    <span>{((Number(selectedToken.balance) / Number(selectedToken.totalSupply)) * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTokens;
