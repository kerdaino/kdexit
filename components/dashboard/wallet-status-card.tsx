"use client"

import { primaryKdexitChain } from "@/lib/web3/chains"
import { useLinkedWallets } from "@/lib/wallet/use-linked-wallets"
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
    isClientReady,
    isConnected,
    isConnecting,
    isWalletEnabled,
    pendingConnectorId,
  } = useWalletConnection()
  const { linkedWallets } = useLinkedWallets()

  const normalizedAddress = address?.toLowerCase() ?? null

  const currentSessionLinkedWallet =
    normalizedAddress && chain?.id
      ? linkedWallets.find(
          (wallet) =>
            wallet.wallet_address.toLowerCase() === normalizedAddress &&
            wallet.chain_id === chain.id
        ) ?? null
      : null

  const primaryLinkedWallet = linkedWallets.find((wallet) => wallet.is_primary) ?? null

  let badgeLabel = "Disconnected"
  let badgeClassName: string = statusStyles.disconnected
  let primaryValue = "No wallet session connected"
  let secondaryValue = "No linked wallet saved yet. Connect a wallet session from Settings when you are ready."

  if (!isClientReady) {
    badgeLabel = "Checking"
    primaryValue = "Checking wallet session status"
    secondaryValue = "Wallet session availability is loading in the browser."
  } else if (!isWalletEnabled) {
    badgeLabel = "Unavailable"
    badgeClassName = statusStyles.unavailable
    primaryValue = "Wallet session connection is off"
    secondaryValue = disabledReason ?? "Wallet session integration is currently unavailable."
  } else if (isConnecting) {
    badgeLabel = "Connecting"
    badgeClassName = statusStyles.connecting
    primaryValue = "Waiting for wallet session approval"
    secondaryValue = pendingConnectorId
      ? `Request sent to ${pendingConnectorId}.`
      : "Approve the session connection request in your wallet."
  } else if (isConnected && currentSessionLinkedWallet?.is_primary) {
    badgeLabel = "Primary Linked"
    badgeClassName = statusStyles.connected
    primaryValue = `Primary ${formatWalletAddress(currentSessionLinkedWallet.wallet_address)}`
    secondaryValue =
      `${chain?.name ?? primaryKdexitChain.label}. This connected wallet session matches your primary linked wallet.`
  } else if (isConnected && currentSessionLinkedWallet) {
    badgeLabel = "Linked"
    badgeClassName = statusStyles.connected
    primaryValue = `Linked ${formatWalletAddress(currentSessionLinkedWallet.wallet_address)}`
    secondaryValue =
      `${chain?.name ?? primaryKdexitChain.label}. This connected wallet session is linked to your account.`
  } else if (isConnected) {
    badgeLabel = "Session Only"
    badgeClassName = statusStyles.connecting
    primaryValue = `Session ${formatWalletAddress(address)}`
    secondaryValue =
      `${chain?.name ?? primaryKdexitChain.label}. This wallet session is connected, but it is not linked to your account.`
  } else if (primaryLinkedWallet) {
    badgeLabel = "Primary Linked"
    badgeClassName = statusStyles.connected
    primaryValue = `Primary ${formatWalletAddress(primaryLinkedWallet.wallet_address)}`
    secondaryValue =
      `Saved on chain ${primaryLinkedWallet.chain_id}. No wallet session is currently connected.`
  } else if (linkedWallets.length > 0) {
    const linkedWallet = linkedWallets[0]

    badgeLabel = "Linked"
    badgeClassName = statusStyles.connected
    primaryValue = `${linkedWallets.length} linked wallet${linkedWallets.length === 1 ? "" : "s"}`
    secondaryValue =
      `Latest saved wallet ${formatWalletAddress(linkedWallet.wallet_address)} on chain ${linkedWallet.chain_id}. No wallet session is currently connected.`
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-white/15 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-gray-400">Wallet Session</p>
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
