"use client"

import { useMemo, useState } from "react"
import { useSignTypedData } from "wagmi"
import type { Strategy } from "@/types/strategy"
import type { Phase5ExecutionUiGates } from "@/types/phase5-gates"
import type { WalletLinkRecord } from "@/types/database-records"
import { getStrategyStatusClass } from "@/lib/dashboard/utils"
import { storeDashboardExecutionAuthorization, cancelDashboardExecutionAuthorization } from "@/lib/dashboard/mutation-gateway"
import {
  buildExecutionAuthorizationTypedData,
  createExecutionAuthorizationNonce,
  getExecutionAuthorizationDeadline,
  hashExecutionAuthorization,
} from "@/lib/execution-authorization/typed-data"
import { useLinkedWallets } from "@/lib/wallet/use-linked-wallets"
import { formatWalletAddress, useWalletConnection } from "@/lib/web3/use-wallet-connection"
import SectionHeading from "@/components/shared/section-heading"

type StrategyListProps = {
  strategies: Strategy[]
  pendingStrategyActionById?: Record<string, "pause" | "resume" | "delete" | undefined>
  phase5Gates: Phase5ExecutionUiGates
  onPauseStrategy: (id: string) => Promise<void>
  onResumeStrategy: (id: string) => Promise<void>
  onDeleteStrategy: (id: string) => Promise<boolean>
  onEditStrategy: (strategy: Strategy) => void
  onAuthorizationUpdated: (strategy: Strategy) => void
}

type FilterStatus = "all" | "active" | "paused"

function formatTokenAddress(address: string) {
  if (!address) {
    return "Not set"
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatAuthorizationStatus(strategy: Strategy) {
  if (
    strategy.authorizationDeadline &&
    strategy.authorizationStatus === "signed" &&
    Number(strategy.authorizationDeadline) <= Math.floor(Date.now() / 1000)
  ) {
    return "authorization expired"
  }

  switch (strategy.authorizationStatus) {
    case "signed":
      return "authorization signed"
    case "cancelled":
    case "revoked":
      return "authorization cancelled"
    case "expired":
      return "authorization expired"
    default:
      return "not authorized"
  }
}

function formatUnixSeconds(value?: string) {
  const timestamp = Number(value)

  if (!value || !Number.isFinite(timestamp)) {
    return "Not set"
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp * 1000))
}

function isPositiveUintString(value: string) {
  return /^(0|[1-9][0-9]*)$/.test(value) && BigInt(value) > BigInt(0)
}

export default function StrategyList({
  strategies,
  pendingStrategyActionById = {},
  onPauseStrategy,
  onResumeStrategy,
  onDeleteStrategy,
  onEditStrategy,
  onAuthorizationUpdated,
  phase5Gates,
}: StrategyListProps) {
  const [filter, setFilter] = useState<FilterStatus>("all")
  const [strategyToDelete, setStrategyToDelete] = useState<Strategy | null>(null)
  const walletConnection = useWalletConnection()
  const { linkedWallets } = useLinkedWallets()

  const filteredStrategies = useMemo(() => {
    if (filter === "all") return strategies
    return strategies.filter((strategy) => strategy.status === filter)
  }, [filter, strategies])

  function getFilterButtonClass(value: FilterStatus) {
    return filter === value
      ? "bg-emerald-500 text-black"
      : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
  }

  function handleConfirmDelete() {
    if (!strategyToDelete) return
    void onDeleteStrategy(strategyToDelete.id).then((wasSuccessful) => {
      if (wasSuccessful) {
        setStrategyToDelete(null)
      }
    })
  }

  function getActivationDisabledTitle(action: "pause" | "resume") {
    if (phase5Gates.strategyActivationEnabled) {
      return undefined
    }

    return action === "resume"
      ? phase5Gates.disabledReason ?? "Strategy activation is disabled."
      : "Pause remains available only for strategies already created before the Phase 5 gate. Resume is disabled until internal beta gates are enabled."
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <SectionHeading
          title="Strategies"
          description="View and manage your take-profit and stop-loss rules."
        />

        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`min-h-11 rounded-xl px-3 py-2 text-sm font-medium transition sm:px-4 ${getFilterButtonClass(
              "all"
            )}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`min-h-11 rounded-xl px-3 py-2 text-sm font-medium transition sm:px-4 ${getFilterButtonClass(
              "active"
            )}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("paused")}
            className={`min-h-11 rounded-xl px-3 py-2 text-sm font-medium transition sm:px-4 ${getFilterButtonClass(
              "paused"
            )}`}
          >
            Paused
          </button>
        </div>
      </div>

      {strategyToDelete ? (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
          <h3 className="text-base font-semibold text-white">Delete strategy?</h3>
          <p className="mt-2 text-sm text-gray-300">
            You are about to remove{" "}
            <span className="font-semibold text-white">
              {strategyToDelete.tokenName} ({strategyToDelete.tokenSymbol})
            </span>
            . This action cannot be undone.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleConfirmDelete}
              disabled={pendingStrategyActionById[strategyToDelete.id] === "delete"}
              className="rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendingStrategyActionById[strategyToDelete.id] === "delete"
                ? "Deleting..."
                : "Yes, Delete"}
            </button>

            <button
              onClick={() => setStrategyToDelete(null)}
              disabled={pendingStrategyActionById[strategyToDelete.id] === "delete"}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        {filteredStrategies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-5 sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg text-emerald-400">
              S
            </div>
            <p className="mt-4 text-base font-semibold text-white">
              {filter === "all"
                ? "No strategies yet"
                : `No ${filter} strategies right now`}
            </p>
            <p className="mt-2 max-w-md text-sm leading-6 text-gray-400">
              {filter === "all"
                ? "Create your first take-profit or stop-loss rule to start building a more disciplined exit workflow."
                : `Nothing in this filter at the moment. Try switching views or create a new strategy to populate your ${filter} list.`}
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-gray-500">
              Strategies you create will appear here for quick review and management.
            </p>
          </div>
        ) : (
          filteredStrategies.map((strategy) => (
            <div
              key={strategy.id}
              className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white sm:text-lg">
                      {strategy.tokenName} ({strategy.tokenSymbol})
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-gray-400">
                      Chain: {strategy.chain} (ID {strategy.chainId}) • Sell:{" "}
                      {strategy.sellPercentage}%
                    </p>
                    <p className="mt-1 text-sm leading-6 text-gray-400">
                      TP: {strategy.takeProfitPrice ?? "-"} • SL:{" "}
                      {strategy.stopLossPrice ?? "-"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-gray-400">
                      Token: {formatTokenAddress(strategy.tokenAddress)} • Trigger:{" "}
                      {strategy.triggerEnabled ? "Enabled" : "Disabled"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Slippage: {strategy.slippage}%{strategy.notes ? ` • ${strategy.notes}` : ""}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium capitalize ${getStrategyStatusClass(
                      strategy.status
                    )}`}
                  >
                    {strategy.status}
                  </span>
                </div>

                <ExecutionAuthorizationCard
                  linkedWallets={linkedWallets}
                  onAuthorizationUpdated={onAuthorizationUpdated}
                  strategy={strategy}
                  walletConnection={walletConnection}
                />

                <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
                  <button
                    onClick={() => onEditStrategy(strategy)}
                    disabled={Boolean(pendingStrategyActionById[strategy.id])}
                    className="min-h-11 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Edit
                  </button>

                  {strategy.status === "active" ? (
                    <button
                      onClick={() => void onPauseStrategy(strategy.id)}
                      disabled={pendingStrategyActionById[strategy.id] === "pause"}
                      title={getActivationDisabledTitle("pause")}
                      className="min-h-11 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-400 hover:bg-yellow-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendingStrategyActionById[strategy.id] === "pause"
                        ? "Pausing..."
                        : "Pause"}
                    </button>
                  ) : strategy.status === "paused" ? (
                    <button
                      onClick={() => void onResumeStrategy(strategy.id)}
                      disabled={
                        pendingStrategyActionById[strategy.id] === "resume" ||
                        !phase5Gates.strategyActivationEnabled
                      }
                      title={getActivationDisabledTitle("resume")}
                      className="min-h-11 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendingStrategyActionById[strategy.id] === "resume"
                        ? "Resuming..."
                        : phase5Gates.strategyActivationEnabled
                          ? "Resume"
                          : "Resume Disabled"}
                    </button>
                  ) : null}

                  <button
                    disabled={Boolean(pendingStrategyActionById[strategy.id])}
                    onClick={() => setStrategyToDelete(strategy)}
                    className="min-h-11 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {!phase5Gates.strategyActivationEnabled &&
              strategy.status === "paused" ? (
                <p className="mt-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-200">
                  {phase5Gates.disabledReason}
                </p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

type WalletConnection = ReturnType<typeof useWalletConnection>

function ExecutionAuthorizationCard({
  linkedWallets,
  onAuthorizationUpdated,
  strategy,
  walletConnection,
}: {
  linkedWallets: WalletLinkRecord[]
  onAuthorizationUpdated: (strategy: Strategy) => void
  strategy: Strategy
  walletConnection: WalletConnection
}) {
  const { signTypedDataAsync, isPending } = useSignTypedData()
  const [adapter, setAdapter] = useState(
    process.env.NEXT_PUBLIC_KDEXIT_EXECUTION_CONTROLLER_ADDRESS ?? ""
  )
  const [maxAmount, setMaxAmount] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const connectedAddress = walletConnection.address?.toLowerCase()
  const linkedWallet = linkedWallets.find(
    (wallet) =>
      wallet.chain_id === strategy.chainId &&
      wallet.wallet_address.toLowerCase() === connectedAddress
  )
  const canRequestSignature =
    walletConnection.isConnected &&
    Boolean(strategy.tokenAddress) &&
    Boolean(linkedWallet) &&
    /^0x[a-fA-F0-9]{40}$/.test(adapter) &&
    isPositiveUintString(maxAmount)

  async function handleSignAuthorization() {
    if (!walletConnection.address || !canRequestSignature) {
      setFeedback("Connect and link the strategy wallet, then enter adapter and max amount.")
      return
    }

    try {
      setFeedback(null)
      const deadline = getExecutionAuthorizationDeadline(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      )
      const nonce = createExecutionAuthorizationNonce().toString()
      const authorization = {
        adapter,
        chainId: strategy.chainId,
        deadline,
        maxAmount,
        nonce,
        sellPercentage: strategy.sellPercentage,
        strategyId: strategy.id,
        tokenAddress: strategy.tokenAddress,
        walletAddress: walletConnection.address,
      }
      const typedData = buildExecutionAuthorizationTypedData(authorization)
      const digest = hashExecutionAuthorization(authorization)
      const signature = await signTypedDataAsync(
        typedData as unknown as Parameters<typeof signTypedDataAsync>[0]
      )
      const updatedStrategy = await storeDashboardExecutionAuthorization(strategy.id, {
        adapter,
        deadline,
        digest,
        maxAmount,
        nonce,
        signature,
        walletAddress: walletConnection.address,
      })

      onAuthorizationUpdated(updatedStrategy)
      setFeedback("Authorization signature stored. No transaction or approval was sent.")
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Authorization signing failed.")
    }
  }

  async function handleCancelAuthorization() {
    try {
      setIsCancelling(true)
      setFeedback(null)
      const updatedStrategy = await cancelDashboardExecutionAuthorization(strategy.id)

      onAuthorizationUpdated(updatedStrategy)
      setFeedback("Stored authorization cancelled in the app. No onchain transaction was sent.")
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Cancellation failed.")
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
            Execution authorization
          </p>
          <h4 className="mt-2 text-sm font-semibold text-white">
            {formatAuthorizationStatus(strategy)}
          </h4>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Wallet linking proves account ownership. This signature is separate typed
            data consent for a bounded future execution path, and it is not a token
            approval or a transaction.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-gray-300">
          Wallet {formatWalletAddress(walletConnection.address)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-gray-300 sm:grid-cols-2">
        <div>Token: {formatTokenAddress(strategy.tokenAddress)}</div>
        <div>Chain ID: {strategy.chainId}</div>
        <div>Sell bps: {Math.round(strategy.sellPercentage * 100)}</div>
        <div>Max amount: {(strategy.authorizationMaxAmount ?? maxAmount) || "Not set"}</div>
        <div>Adapter: {formatTokenAddress(strategy.authorizationAdapter ?? adapter)}</div>
        <div>Expiry: {formatUnixSeconds(strategy.authorizationDeadline)}</div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-gray-300">
          <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-gray-500">
            Adapter
          </span>
          <input
            value={adapter}
            onChange={(event) => setAdapter(event.target.value)}
            placeholder="0x..."
            className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white outline-none focus:border-emerald-500/60"
          />
        </label>
        <label className="text-sm text-gray-300">
          <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-gray-500">
            Max amount
          </span>
          <input
            value={maxAmount}
            onChange={(event) => setMaxAmount(event.target.value)}
            inputMode="numeric"
            placeholder="Raw base units"
            className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white outline-none focus:border-emerald-500/60"
          />
        </label>
      </div>

      {!linkedWallet ? (
        <p className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          The connected wallet must be linked for chain {strategy.chainId} before
          authorization can be signed.
        </p>
      ) : null}

      {feedback ? (
        <p className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-gray-300">
          {feedback}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => void handleSignAuthorization()}
          disabled={!canRequestSignature || isPending}
          className="min-h-11 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Signing..." : "Sign Typed Data"}
        </button>
        <button
          onClick={() => void handleCancelAuthorization()}
          disabled={
            isCancelling ||
            !["signed", "pending", "authorized"].includes(
              strategy.authorizationStatus ?? "missing"
            )
          }
          className="min-h-11 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCancelling ? "Cancelling..." : "Cancel Stored Authorization"}
        </button>
      </div>
    </div>
  )
}
