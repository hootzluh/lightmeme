import React from "react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { injected } from "@wagmi/connectors"

// Lightchain testnet constants and seed data for token index
export const LIGHTCHAIN_TESTNET_ID = 504
export const LIGHTCHAIN_EXPLORER_URL = "https://testnet.lightscan.app"
// Add known deployed testnet ERC-20 token addresses here to index them on the homepage
// Example: "0x1234..." (42-char checksum address)
export const TESTNET_TOKEN_ADDRESSES = [
  // "0x0000000000000000000000000000000000000000",
]

export default function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="px-4 py-2 cta-button primary"
    >
      Connect Wallet
    </button>
  )
}
