"use client"

import { formatWalletAddress, useWalletConnection } from "@/lib/web3/use-wallet-connection"

type ConnectWalletButtonProps = {
  compact?: boolean
}

export default function ConnectWalletButton({
  compact = false,
}: ConnectWalletButtonProps) {
  const {
    address,
    connect,
    disconnect,
    isConnected,
    isConnecting,
    isDisconnecting,
    isWalletEnabled,
    preferredConnector,
  } = useWalletConnection()

  const className = compact
    ? "inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
    : "rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        disabled={isDisconnecting}
        className={className}
      >
        {isDisconnecting ? "Disconnecting..." : formatWalletAddress(address)}
      </button>
    )
  }

  return (
    <button
      onClick={() => {
        if (!preferredConnector) return

        connect({ connector: preferredConnector })
      }}
      disabled={!isWalletEnabled || isConnecting || !preferredConnector}
      className={className}
    >
      {!isWalletEnabled
        ? "Wallet Unavailable"
        : isConnecting
          ? "Connecting..."
          : "Connect Wallet"}
    </button>
  )
}
