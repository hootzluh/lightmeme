import React, { useState, useEffect } from "react"
import { useAccount, usePublicClient } from "wagmi"
import { Link } from "react-router-dom"
import PageLayout from "../components/PageLayout"
import WalletButton from "../components/WalletButton"
import { FACTORY_ADDRESS } from "../config/lightchain"
import factoryAbi from "../abi/factoryAbi.json"

const erc20Abi = [
  { name: 'name', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { name: 'totalSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] }
]

export default function LaunchPresale() {
  const { address, isConnected } = useAccount()
  const client = usePublicClient()
  const [userTokens, setUserTokens] = useState([])
  const [selectedToken, setSelectedToken] = useState(null)
  const [presaleData, setPresaleData] = useState({
    tokenAddress: '',
    presalePrice: '',
    presaleAmount: '',
    minContribution: '',
    maxContribution: '',
    startTime: '',
    endTime: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  if (!isConnected) {
    return (
      <PageLayout>
        <div className="presale-container">
          <div className="presale-header">
            <h1 className="title">Launch Presale</h1>
            <p className="subtitle">Connect your wallet to launch a presale for your tokens</p>
          </div>
          <div className="connect-wallet-prompt">
            <div className="connect-card">
              <h3>🔗 Connect Your Wallet</h3>
              <p>Connect your wallet to launch a presale for your meme coins.</p>
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
      <div className="presale-container">
        <div className="presale-header">
          <h1 className="title">Launch Presale</h1>
          <p className="subtitle">Create a presale for your meme coin to build community and raise funds</p>
        </div>

        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Select Token</div>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Configure Presale</div>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Review & Launch</div>
          </div>
        </div>

        <div className="step-content">
          <h2 className="step-title">Coming Soon</h2>
          <p className="step-description">Presale functionality is being developed. Check back soon!</p>
        </div>
      </div>
    </PageLayout>
  )
}
