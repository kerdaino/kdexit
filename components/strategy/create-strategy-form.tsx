"use client"

import { useState } from "react"
import { generateClientId } from "@/lib/dashboard/utils"
import { kdexitStrategyChainOptions, primaryKdexitChain } from "@/lib/web3/chains"
import type { Strategy } from "@/types/strategy"

type CreateStrategyFormProps = {
  onAddStrategy: (strategy: Strategy) => Promise<boolean>
  onUpdateStrategy: (strategy: Strategy) => Promise<boolean>
  onCancel: () => void
  editingStrategy?: Strategy | null
}

type FormErrors = {
  tokenName?: string
  tokenSymbol?: string
  sellPercentage?: string
  takeProfitPrice?: string
  stopLossPrice?: string
  slippage?: string
  general?: string
}

function getInitialFormValues(editingStrategy?: Strategy | null) {
  if (!editingStrategy) {
    return {
      tokenName: "",
      tokenSymbol: "",
      chain: primaryKdexitChain.label,
      sellPercentage: "",
      takeProfitPrice: "",
      stopLossPrice: "",
      slippage: "1",
    }
  }

  return {
    tokenName: editingStrategy.tokenName,
    tokenSymbol: editingStrategy.tokenSymbol,
    chain: editingStrategy.chain,
    sellPercentage: String(editingStrategy.sellPercentage),
    takeProfitPrice:
      editingStrategy.takeProfitPrice !== undefined
        ? String(editingStrategy.takeProfitPrice)
        : "",
    stopLossPrice:
      editingStrategy.stopLossPrice !== undefined
        ? String(editingStrategy.stopLossPrice)
        : "",
    slippage: String(editingStrategy.slippage),
  }
}

export default function CreateStrategyForm({
  onAddStrategy,
  onUpdateStrategy,
  onCancel,
  editingStrategy,
}: CreateStrategyFormProps) {
  const initialValues = getInitialFormValues(editingStrategy)

  const [tokenName, setTokenName] = useState(initialValues.tokenName)
  const [tokenSymbol, setTokenSymbol] = useState(initialValues.tokenSymbol)
  const [chain, setChain] = useState(initialValues.chain)
  const [sellPercentage, setSellPercentage] = useState(initialValues.sellPercentage)
  const [takeProfitPrice, setTakeProfitPrice] = useState(initialValues.takeProfitPrice)
  const [stopLossPrice, setStopLossPrice] = useState(initialValues.stopLossPrice)
  const [slippage, setSlippage] = useState(initialValues.slippage)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validateForm() {
    const nextErrors: FormErrors = {}

    const trimmedTokenName = tokenName.trim()
    const trimmedTokenSymbol = tokenSymbol.trim().toUpperCase()

    const sellValue = Number(sellPercentage)
    const tpValue = takeProfitPrice ? Number(takeProfitPrice) : undefined
    const slValue = stopLossPrice ? Number(stopLossPrice) : undefined
    const slippageValue = Number(slippage)

    if (!trimmedTokenName) {
      nextErrors.tokenName = "Token name is required."
    }

    if (!trimmedTokenSymbol) {
      nextErrors.tokenSymbol = "Token symbol is required."
    } else if (trimmedTokenSymbol.length > 10) {
      nextErrors.tokenSymbol = "Token symbol looks too long."
    }

    if (!sellPercentage.trim()) {
      nextErrors.sellPercentage = "Sell percentage is required."
    } else if (Number.isNaN(sellValue)) {
      nextErrors.sellPercentage = "Sell percentage must be a number."
    } else if (sellValue < 1 || sellValue > 100) {
      nextErrors.sellPercentage = "Sell percentage must be between 1 and 100."
    }

    if (!takeProfitPrice.trim() && !stopLossPrice.trim()) {
      nextErrors.general = "Set at least a take-profit price or a stop-loss price."
    }

    if (takeProfitPrice.trim()) {
      if (Number.isNaN(tpValue)) {
        nextErrors.takeProfitPrice = "Take-profit price must be a number."
      } else if ((tpValue ?? 0) <= 0) {
        nextErrors.takeProfitPrice = "Take-profit price must be greater than 0."
      }
    }

    if (stopLossPrice.trim()) {
      if (Number.isNaN(slValue)) {
        nextErrors.stopLossPrice = "Stop-loss price must be a number."
      } else if ((slValue ?? 0) <= 0) {
        nextErrors.stopLossPrice = "Stop-loss price must be greater than 0."
      }
    }

    if (!slippage.trim()) {
      nextErrors.slippage = "Slippage is required."
    } else if (Number.isNaN(slippageValue)) {
      nextErrors.slippage = "Slippage must be a number."
    } else if (slippageValue < 0.1 || slippageValue > 50) {
      nextErrors.slippage = "Slippage must be between 0.1 and 50."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!validateForm() || isSubmitting) return

    const strategyPayload: Strategy = {
      id: editingStrategy?.id ?? generateClientId(),
      tokenName: tokenName.trim(),
      tokenSymbol: tokenSymbol.trim().toUpperCase(),
      chain,
      sellPercentage: Number(sellPercentage),
      takeProfitPrice: takeProfitPrice ? Number(takeProfitPrice) : undefined,
      stopLossPrice: stopLossPrice ? Number(stopLossPrice) : undefined,
      slippage: Number(slippage),
      status: editingStrategy?.status ?? "active",
      createdAt: editingStrategy?.createdAt ?? new Date().toISOString(),
    }

    setIsSubmitting(true)

    try {
      const wasSuccessful = editingStrategy
        ? await onUpdateStrategy(strategyPayload)
        : await onAddStrategy(strategyPayload)

      if (wasSuccessful) {
        onCancel()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditing = Boolean(editingStrategy)

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            {isEditing ? "Edit Strategy" : "Create New Strategy"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            {isEditing
              ? "Update your take-profit and stop-loss rules."
              : "Set your take-profit and stop-loss rules."}
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="min-h-11 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          Cancel
        </button>
      </div>

      {errors.general ? (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errors.general}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-gray-300">Token Name</label>
          <input
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. Binance Coin"
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
          {errors.tokenName ? (
            <p className="mt-2 text-sm text-red-400">{errors.tokenName}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">Token Symbol</label>
          <input
            type="text"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. BNB"
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
          {errors.tokenSymbol ? (
            <p className="mt-2 text-sm text-red-400">{errors.tokenSymbol}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">Chain</label>
          <select
            value={chain}
            onChange={(e) => setChain(e.target.value)}
            disabled={isSubmitting}
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {kdexitStrategyChainOptions.map((chainOption) => (
              <option key={chainOption}>{chainOption}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">Sell Percentage</label>
          <input
            type="number"
            value={sellPercentage}
            onChange={(e) => setSellPercentage(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. 50"
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
          {errors.sellPercentage ? (
            <p className="mt-2 text-sm text-red-400">{errors.sellPercentage}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">Take Profit Price</label>
          <input
            type="number"
            value={takeProfitPrice}
            onChange={(e) => setTakeProfitPrice(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. 850"
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
          {errors.takeProfitPrice ? (
            <p className="mt-2 text-sm text-red-400">{errors.takeProfitPrice}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">Stop Loss Price</label>
          <input
            type="number"
            value={stopLossPrice}
            onChange={(e) => setStopLossPrice(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. 540"
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
          {errors.stopLossPrice ? (
            <p className="mt-2 text-sm text-red-400">{errors.stopLossPrice}</p>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm text-gray-300">Slippage %</label>
          <input
            type="number"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. 1"
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
          {errors.slippage ? (
            <p className="mt-2 text-sm text-red-400">{errors.slippage}</p>
          ) : null}
        </div>

        <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Saving..."
              : isEditing
                ? "Update Strategy"
                : "Save Strategy"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 px-6 py-3 font-semibold text-white hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
        </div>
      </form>
    </div>
  )
}
