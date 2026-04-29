"use client"

import { useEffect, useState } from "react"
import ActionFeedback from "@/components/shared/action-feedback"
import ConnectWalletButton from "@/components/wallet/connect-wallet-button"
import { reportWalletLinkingErrorAlert } from "@/lib/alerts"
import { useLinkedWallets } from "@/lib/wallet/use-linked-wallets"
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
    isClientReady,
    isConnected,
    isConnecting,
    isWalletEnabled,
    pendingConnectorId,
  } = useWalletConnection()
  const {
    createLinkedWallet,
    deleteLinkedWallet,
    isLoadingLinkedWallets,
    linkedWallets,
    linkedWalletsError,
    updateLinkedWallet,
  } = useLinkedWallets()
  const [isLinkingWallet, setIsLinkingWallet] = useState(false)
  const [pendingPrimaryId, setPendingPrimaryId] = useState<string | null>(null)
  const [pendingUnlinkId, setPendingUnlinkId] = useState<string | null>(null)
  const [linkLabel, setLinkLabel] = useState("")
  const [feedback, setFeedback] = useState<{
    message: string
    tone: "success" | "error"
  } | null>(null)

  const normalizedConnectedAddress = address?.toLowerCase() ?? null

  const activeLinkedWallet =
    normalizedConnectedAddress && chain?.id
      ? linkedWallets.find(
          (wallet) =>
            wallet.wallet_address.toLowerCase() === normalizedConnectedAddress &&
            wallet.chain_id === chain.id
        ) ?? null
      : null

  useEffect(() => {
    if (!feedback) return

    const timer = window.setTimeout(() => {
      setFeedback(null)
    }, 3500)

    return () => window.clearTimeout(timer)
  }, [feedback])

  const connectedWalletReadyToLink = Boolean(
    isConnected && address && chain?.id && connector?.name
  )

  async function handleLinkWallet() {
    if (!address || !chain?.id || !connector?.name) {
      setFeedback({
        message: "Connect a supported wallet session before linking it to your account.",
        tone: "error",
      })
      return
    }

    try {
      setIsLinkingWallet(true)

      await createLinkedWallet({
        wallet_address: address,
        chain_id: chain.id,
        connector_name: connector.name,
        label: linkLabel.trim() || null,
        is_primary: linkedWallets.length === 0,
      })
      setLinkLabel("")
      setFeedback({
        message:
          linkedWallets.length === 0
            ? "Wallet session linked to your account and saved as the primary linked wallet."
            : "Wallet session linked to your account.",
        tone: "success",
      })
    } catch (error) {
      console.error("Failed to link wallet:", error)
      void reportWalletLinkingErrorAlert({
        code: "client_wallet_link_create_failed",
        operation: "create",
        source: "client",
      })
      setFeedback({
        message:
          error instanceof Error ? error.message : "We could not link that wallet right now.",
        tone: "error",
      })
    } finally {
      setIsLinkingWallet(false)
    }
  }

  async function handleSetPrimary(walletId: string) {
    try {
      setPendingPrimaryId(walletId)

      await updateLinkedWallet(walletId, {
        is_primary: true,
      })
      setFeedback({
        message: "Primary wallet updated.",
        tone: "success",
      })
    } catch (error) {
      console.error("Failed to update primary wallet:", error)
      void reportWalletLinkingErrorAlert({
        code: "client_wallet_link_update_failed",
        operation: "update",
        source: "client",
      })
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : "We could not update the primary wallet right now.",
        tone: "error",
      })
    } finally {
      setPendingPrimaryId(null)
    }
  }

  async function handleUnlinkWallet(walletId: string) {
    try {
      setPendingUnlinkId(walletId)
      await deleteLinkedWallet(walletId)
      setFeedback({
        message: "Wallet link removed from your account. Your current wallet session was not disconnected.",
        tone: "success",
      })
    } catch (error) {
      console.error("Failed to unlink wallet:", error)
      void reportWalletLinkingErrorAlert({
        code: "client_wallet_link_delete_failed",
        operation: "delete",
        source: "client",
      })
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : "We could not unlink that wallet right now.",
        tone: "error",
      })
    } finally {
      setPendingUnlinkId(null)
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400">Wallet Integration</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Wallet Session And Linking</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.16em] text-gray-400">
          {!isClientReady ? "Checking" : isWalletEnabled ? "Foundation Ready" : "Disabled"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-gray-400">Session State</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {!isClientReady
              ? "Checking"
              : isConnected
                ? "Connected"
                : isWalletEnabled
                  ? "Not connected"
                  : "Unavailable"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-gray-400">Session Address</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {formatWalletAddress(address)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-gray-400">Session Network</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {chain?.name ?? `${primaryKdexitChain.label} not connected`}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-gray-400">Session Connector</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {connector?.name ?? "No active connector"}
          </p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-gray-400">
        {!isClientReady
          ? "Wallet availability is being checked in the browser before connection controls are enabled."
          : disabledReason ??
          "Wallet session connection and account linking are separate. Connecting a wallet creates a temporary session in this browser. Linking saves that wallet to your authenticated KDEXIT account. Live execution remains intentionally disabled at this stage."}
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
            ? `Connecting session with ${pendingConnectorId}...`
            : `${availableConnectors.length} session connector${availableConnectors.length === 1 ? "" : "s"} available`}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">Account Linking</p>
            <p className="mt-2 text-base font-semibold text-white">
              {activeLinkedWallet
                ? "This connected wallet session already matches a linked wallet record on your account."
                : !isClientReady
                  ? "Wallet session status is still loading."
                  : isConnected
                  ? "This wallet session is connected, but it is not linked to your account until you confirm the link action below."
                  : "Connect a wallet session first, then choose whether to link it to your account."}
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-gray-400">
            {activeLinkedWallet
              ? "Linked"
              : !isClientReady
                ? "Checking"
                : isConnected
                  ? "Session Only"
                  : "Idle"}
          </span>
        </div>

        <p className="mt-3 text-sm leading-6 text-gray-400">
          Linking is always an explicit account action. A connected wallet session does not
          automatically become a linked wallet. Disconnecting a wallet session does not remove
          saved linked-wallet records, and removing a saved wallet link does not automatically
          disconnect the current session.
        </p>

        {feedback ? (
          <div className="mt-4">
            <ActionFeedback message={feedback.message} tone={feedback.tone} />
          </div>
        ) : null}

        {!feedback && linkedWalletsError ? (
          <div className="mt-4">
            <ActionFeedback message={linkedWalletsError} tone="error" />
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-gray-400">Current Wallet Session</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Session Wallet</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {formatWalletAddress(address)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Session Chain</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {chain?.name ?? "No active chain"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Session Connector</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {connector?.name ?? "No active connector"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Account Link State</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {activeLinkedWallet
                    ? activeLinkedWallet.is_primary
                      ? "Linked and primary"
                      : "Linked"
                    : !isClientReady
                      ? "Checking"
                      : isConnected
                      ? "Session only, not linked"
                      : "No active session"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <label className="block">
              <span className="text-sm text-gray-400">Linked Wallet Label (Optional)</span>
              <input
                value={linkLabel}
                onChange={(event) => setLinkLabel(event.target.value)}
                placeholder="Trading wallet"
                maxLength={80}
                className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-emerald-500/40"
                disabled={!connectedWalletReadyToLink || !!activeLinkedWallet || isLinkingWallet}
              />
            </label>

            <button
              type="button"
              onClick={() => void handleLinkWallet()}
              disabled={
                !connectedWalletReadyToLink ||
                !!activeLinkedWallet ||
                isLinkingWallet ||
                !isWalletEnabled
              }
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {!isWalletEnabled
                ? "Wallet Unavailable"
                : activeLinkedWallet
                  ? "Wallet Already Linked"
                  : isLinkingWallet
                    ? "Saving Wallet Link..."
                    : "Link This Session To My Account"}
            </button>

            <p className="mt-3 text-xs leading-6 text-gray-500">
              This action saves the currently connected wallet session as a linked wallet on your
              account. Review the address before confirming.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400">Saved Account Links</p>
            <h4 className="mt-2 text-lg font-semibold text-white">Linked wallets on this account</h4>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-gray-400">
            {linkedWallets.length} linked
          </span>
        </div>

        {isLoadingLinkedWallets ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-5">
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-40 rounded-full bg-white/10" />
              <div className="h-3 w-64 max-w-full rounded-full bg-white/10" />
            </div>
            <p className="mt-4 text-sm text-gray-400">Loading linked wallets...</p>
          </div>
        ) : linkedWallets.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm leading-6 text-gray-400">
            No wallets are linked to this account yet. You can connect a wallet session without
            linking it, or explicitly save the current session as a linked wallet above.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {linkedWallets.map((wallet) => {
              const isSessionWallet =
                normalizedConnectedAddress === wallet.wallet_address.toLowerCase() &&
                chain?.id === wallet.chain_id

              return (
                <div
                  key={wallet.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-white">
                          {wallet.label?.trim() || formatWalletAddress(wallet.wallet_address)}
                        </p>
                        {wallet.is_primary ? (
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-emerald-300">
                            Primary
                          </span>
                        ) : null}
                        {isSessionWallet ? (
                          <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-gray-300">
                            Matches Current Session
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-gray-400 sm:grid-cols-2">
                        <p>Address: <span className="text-gray-200">{wallet.wallet_address}</span></p>
                        <p>Chain ID: <span className="text-gray-200">{wallet.chain_id}</span></p>
                        <p>Connector: <span className="text-gray-200">{wallet.connector_name ?? "Unknown"}</span></p>
                        <p>Linked Record Created: <span className="text-gray-200">{new Date(wallet.created_at).toLocaleString()}</span></p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                      <button
                        type="button"
                        onClick={() => void handleSetPrimary(wallet.id)}
                        disabled={wallet.is_primary || pendingPrimaryId === wallet.id}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pendingPrimaryId === wallet.id
                          ? "Updating..."
                          : wallet.is_primary
                            ? "Primary Wallet"
                            : "Set As Primary Link"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleUnlinkWallet(wallet.id)}
                        disabled={pendingUnlinkId === wallet.id}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pendingUnlinkId === wallet.id ? "Removing Link..." : "Remove Account Link"}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
