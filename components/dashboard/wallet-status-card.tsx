"use client"

import { primaryKdexitChain } from "@/lib/web3/chains"
import {
  formatWalletAddress,
  useWalletConnection,
} from "@/lib/web3/use-wallet-connection"

const statusStyles = {
  connected: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  connecting: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  disconnected: "border-white/10 bg-black/20 text-gray-300",
  unavailable: "border-red-500/20 bg-red-500/10 text-red-200",
} as const

export default function WalletStatusCard() {
  const {
    address,
    chain,
    disabledReason,
    isConnected,
    isConnecting,
    isWalletEnabled,
    pendingConnectorId,
  } = useWalletConnection()

  let badgeLabel = "Disconnected"
  let badgeClassName: string = statusStyles.disconnected
  let primaryValue = "No wallet connected"
  let secondaryValue = "Connect from Settings when you are ready."

  if (!isWalletEnabled) {
    badgeLabel = "Unavailable"
    badgeClassName = statusStyles.unavailable
    primaryValue = "Wallet connection is off"
    secondaryValue = disabledReason ?? "Wallet integration is currently unavailable."
  } else if (isConnecting) {
    badgeLabel = "Connecting"
    badgeClassName = statusStyles.connecting
    primaryValue = "Waiting for wallet approval"
    secondaryValue = pendingConnectorId
      ? `Request sent to ${pendingConnectorId}.`
      : "Approve the connection request in your wallet."
  } else if (isConnected) {
    badgeLabel = "Connected"
    badgeClassName = statusStyles.connected
    primaryValue = formatWalletAddress(address)
    secondaryValue = chain?.name ?? primaryKdexitChain.label
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-white/15 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-gray-400">Connected Wallet</p>
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${badgeClassName}`}
        >
          {badgeLabel}
        </span>
      </div>
      <p className="mt-3 text-xl font-semibold text-white sm:text-2xl">
        {primaryValue}
      </p>
      <p className="mt-2 text-sm leading-6 text-gray-400">{secondaryValue}</p>
    </div>
  )
}
