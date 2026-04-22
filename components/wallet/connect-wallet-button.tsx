"use client"

import { useMemo, useState } from "react"
import { formatWalletAddress, useWalletConnection } from "@/lib/web3/use-wallet-connection"

type ConnectWalletButtonProps = {
  compact?: boolean
}

export default function ConnectWalletButton({
  compact = false,
}: ConnectWalletButtonProps) {
  const [isChooserOpen, setIsChooserOpen] = useState(false)
  const {
    address,
    availableConnectors,
    connect,
    disconnect,
    isClientReady,
    isConnected,
    isConnecting,
    isDisconnecting,
    isWalletEnabled,
    preferredConnector,
  } = useWalletConnection()

  const buttonClassName = compact
    ? "inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
    : "rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"

  const chooserButtonClassName =
    "inline-flex min-h-11 w-full items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"

  const shouldShowConnectorChooser =
    !compact && availableConnectors.length > 1 && !isConnected

  const connectorOptions = useMemo(
    () =>
      availableConnectors.map((connector) => ({
        id: connector.id,
        label:
          connector.id === "walletConnect"
            ? "WalletConnect"
            : connector.id === "injected"
              ? "Browser Wallet"
              : connector.name,
        connector,
      })),
    [availableConnectors]
  )

  function handleConnectWithPreferredConnector() {
    if (!preferredConnector) return

    connect({ connector: preferredConnector })
  }

  if (!isClientReady) {
    return (
      <button disabled className={buttonClassName}>
        Checking Wallet...
      </button>
    )
  }

  if (isConnected) {
    return (
      <button
        onClick={() => disconnect()}
        disabled={isDisconnecting}
        className={buttonClassName}
        title="Disconnect wallet session"
      >
        {isDisconnecting ? "Disconnecting Session..." : `Session ${formatWalletAddress(address)}`}
      </button>
    )
  }

  if (shouldShowConnectorChooser) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsChooserOpen((value) => !value)}
          disabled={!isWalletEnabled || isConnecting || availableConnectors.length === 0}
          className={buttonClassName}
        >
          {!isWalletEnabled
            ? "Wallet Unavailable"
            : isConnecting
              ? "Connecting Session..."
              : "Connect Wallet Session"}
        </button>

        {isChooserOpen && isWalletEnabled ? (
          <div className="absolute left-0 top-full z-20 mt-3 w-full min-w-[250px] rounded-2xl border border-white/10 bg-[#10151C] p-3 shadow-2xl">
            <p className="px-1 pb-2 text-xs uppercase tracking-[0.16em] text-gray-500">
              Choose Connector
            </p>
            <div className="space-y-2">
              {connectorOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setIsChooserOpen(false)
                    connect({ connector: option.connector })
                  }}
                  disabled={isConnecting}
                  className={chooserButtonClassName}
                >
                  <span>{option.label}</span>
                  <span className="text-xs uppercase tracking-[0.16em] text-gray-500">
                    {option.id === "walletConnect" ? "Recommended" : option.id}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <button
      onClick={handleConnectWithPreferredConnector}
      disabled={!isWalletEnabled || isConnecting || !preferredConnector}
      className={buttonClassName}
    >
      {!isWalletEnabled
        ? "Wallet Unavailable"
        : isConnecting
          ? "Connecting Session..."
          : "Connect Wallet Session"}
    </button>
  )
}
