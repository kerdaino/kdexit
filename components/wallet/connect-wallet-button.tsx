"use client"

import { useAccount, useConnect, useDisconnect } from "wagmi"

export default function ConnectWalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-black"
      >
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    )
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-black"
    >
      Connect Wallet
    </button>
  )
}