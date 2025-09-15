import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { injected } from '@wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a query client
const queryClient = new QueryClient()

// Lightchain Testnet definition
const lightchainTestnet = {
  id: 504,
  name: 'Lightchain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Lightchain AI',
    symbol: 'LCAI',
  },
  rpcUrls: {
    default: { http: ['https://light-testnet-rpc.lightchain.ai/'] },
  },
  blockExplorers: {
    default: {
      name: 'LightchainAI Testnet blockchain explorer',
      url: 'https://testnet.lightscan.app/',
    },
  },
  testnet: true,
}

// Create wagmi config
const config = createConfig({
  chains: [lightchainTestnet],
  connectors: [injected()],
  transports: {
    [lightchainTestnet.id]: http('https://light-testnet-rpc.lightchain.ai/'),
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </WagmiProvider>
)
