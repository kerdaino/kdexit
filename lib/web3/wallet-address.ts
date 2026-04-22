import { getAddress } from "viem"

export function normalizeWalletAddress(address: string) {
  return getAddress(address).toLowerCase()
}
