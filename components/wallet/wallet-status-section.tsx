"use client"

import ConnectWalletButton from "@/components/wallet/connect-wallet-button"
import { primaryKdexitChain, getSupportedChainLabels } from "@/lib/web3/chains"
import { formatWalletAddress, useWalletConnection } from "@/lib/web3/use-wallet-connection"

export default function WalletStatusSection() {
  const {
    address,
    availableConnectors,
    chain,
    connectError,
    connector,
    disabledReason,
    isConnected,
    isConnecting,
    isWalletEnabled,
    pendingConnectorId,
  } = useWalletConnection()

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400">Wallet Integration</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Wallet Status</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.16em] text-gray-400">
          {isWalletEnabled ? "Foundation Ready" : "Disabled"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-gray-400">Connection</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {isConnected ? "Connected" : isWalletEnabled ? "Not connected" : "Unavailable"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-gray-400">Address</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {formatWalletAddress(address)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-gray-400">Network</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {chain?.name ?? `${primaryKdexitChain.label} not connected`}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-gray-400">Connector</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {connector?.name ?? "No active connector"}
          </p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-gray-400">
        {disabledReason ??
          "Wallet connection is available for account presence and session state only. Trade execution remains intentionally disabled at this stage."}
      </p>

      <p className="mt-3 text-sm leading-6 text-gray-400">
        Supported chain rollout: {getSupportedChainLabels().join(", ")}. Only{" "}
        {primaryKdexitChain.label} is enabled in the wallet foundation right now.
      </p>

      {connectError ? (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {connectError.message}
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ConnectWalletButton />
        <p className="text-sm text-gray-400">
          {isConnecting && pendingConnectorId
            ? `Connecting with ${pendingConnectorId}...`
            : `${availableConnectors.length} supported connector${availableConnectors.length === 1 ? "" : "s"} available`}
        </p>
      </div>
    </div>
  )
}
