export const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_ADDRESS

export const LIGHTSCAN_BASE_URL = 'https://testnet.lightscan.app'

export function getTokenUrl(address) {
  return `${LIGHTSCAN_BASE_URL}/address/${address}`
}

export function getTxUrl(txHash) {
  return `${LIGHTSCAN_BASE_URL}/tx/${txHash}`
}
