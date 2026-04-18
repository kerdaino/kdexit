"use client"

import { useEffect, useState } from "react"
import { generateClientId } from "@/lib/dashboard/utils"
import {
  getStrategyChainEntryByLabel,
  kdexitStrategyChainOptions,
  primaryKdexitChain,
} from "@/lib/web3/chains"
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
  tokenAddress?: string
  sellPercentage?: string
  takeProfitPrice?: string
  stopLossPrice?: string
  slippage?: string
  notes?: string
  general?: string
}

type StrategyFormValues = {
  tokenName: string
  tokenSymbol: string
  tokenAddress: string
  chain: string
  chainId: string
  sellPercentage: string
  takeProfitPrice: string
  stopLossPrice: string
  triggerEnabled: boolean
  slippage: string
  notes: string
}

const EVM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/
const TOKEN_SYMBOL_PATTERN = /^[A-Z0-9._-]+$/
const MAX_NOTES_LENGTH = 240
const MAX_TOKEN_NAME_LENGTH = 80
const MAX_TOKEN_SYMBOL_LENGTH = 10
const MAX_DECIMAL_PLACES = 8

type NumericFieldValidation = {
  value?: number
  error?: string
}

function countDecimalPlaces(value: string) {
  const normalizedValue = value.trim()

  if (!normalizedValue.includes(".")) {
    return 0
  }

  return normalizedValue.split(".")[1]?.length ?? 0
}

function validateNumericField(
  rawValue: string,
  options: {
    label: string
    required?: boolean
    min?: number
    max?: number
    maxDecimals?: number
    integerOnly?: boolean
  }
): NumericFieldValidation {
  const trimmedValue = rawValue.trim()

  if (!trimmedValue) {
    return options.required
      ? { error: `${options.label} is required.` }
      : { value: undefined }
  }

  const parsedValue = Number(trimmedValue)

  if (!Number.isFinite(parsedValue)) {
    return { error: `${options.label} must be a valid number.` }
  }

  if (options.integerOnly && !Number.isInteger(parsedValue)) {
    return { error: `${options.label} must be a whole number.` }
  }

  if (
    options.maxDecimals !== undefined &&
    countDecimalPlaces(trimmedValue) > options.maxDecimals
  ) {
    return {
      error: `${options.label} can have at most ${options.maxDecimals} decimal places.`,
    }
  }

  if (options.min !== undefined && parsedValue < options.min) {
    return { error: `${options.label} must be at least ${options.min}.` }
  }

  if (options.max !== undefined && parsedValue > options.max) {
    return { error: `${options.label} must be at most ${options.max}.` }
  }

  return { value: parsedValue }
}

function hasAdvancedContent(strategy?: Strategy | null) {
  if (!strategy) {
    return false
  }

  return Boolean(
    strategy.tokenAddress ||
      strategy.notes ||
      strategy.slippage !== 1 ||
      !strategy.triggerEnabled
  )
}

function getInitialFormValues(editingStrategy?: Strategy | null): StrategyFormValues {
  if (!editingStrategy) {
    return {
      tokenName: "",
      tokenSymbol: "",
      tokenAddress: "",
      chain: primaryKdexitChain.label,
      chainId: String(primaryKdexitChain.chain.id),
      sellPercentage: "",
      takeProfitPrice: "",
      stopLossPrice: "",
      triggerEnabled: true,
      slippage: "1",
      notes: "",
    }
  }

  return {
    tokenName: editingStrategy.tokenName,
    tokenSymbol: editingStrategy.tokenSymbol,
    tokenAddress: editingStrategy.tokenAddress,
    chain: editingStrategy.chain,
    chainId: String(editingStrategy.chainId),
    sellPercentage: String(editingStrategy.sellPercentage),
    takeProfitPrice:
      editingStrategy.takeProfitPrice !== undefined
        ? String(editingStrategy.takeProfitPrice)
        : "",
    stopLossPrice:
      editingStrategy.stopLossPrice !== undefined
        ? String(editingStrategy.stopLossPrice)
        : "",
    triggerEnabled: editingStrategy.triggerEnabled,
    slippage: String(editingStrategy.slippage),
    notes: editingStrategy.notes ?? "",
  }
}

export default function CreateStrategyForm({
  onAddStrategy,
  onUpdateStrategy,
  onCancel,
  editingStrategy,
}: CreateStrategyFormProps) {
  const [tokenName, setTokenName] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [tokenAddress, setTokenAddress] = useState("")
  const [chain, setChain] = useState<string>(primaryKdexitChain.label)
  const [chainId, setChainId] = useState(String(primaryKdexitChain.chain.id))
  const [sellPercentage, setSellPercentage] = useState("")
  const [takeProfitPrice, setTakeProfitPrice] = useState("")
  const [stopLossPrice, setStopLossPrice] = useState("")
  const [triggerEnabled, setTriggerEnabled] = useState(true)
  const [slippage, setSlippage] = useState("1")
  const [notes, setNotes] = useState("")
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const initialValues = getInitialFormValues(editingStrategy)

    setTokenName(initialValues.tokenName)
    setTokenSymbol(initialValues.tokenSymbol)
    setTokenAddress(initialValues.tokenAddress)
    setChain(initialValues.chain)
    setChainId(initialValues.chainId)
    setSellPercentage(initialValues.sellPercentage)
    setTakeProfitPrice(initialValues.takeProfitPrice)
    setStopLossPrice(initialValues.stopLossPrice)
    setTriggerEnabled(initialValues.triggerEnabled)
    setSlippage(initialValues.slippage)
    setNotes(initialValues.notes)
    setIsAdvancedOpen(hasAdvancedContent(editingStrategy))
    setErrors({})
  }, [editingStrategy])

  function handleChainChange(nextChain: string) {
    const chainEntry = getStrategyChainEntryByLabel(nextChain)

    setChain(nextChain)
    setChainId(String(chainEntry.chain.id))
  }

  function validateForm() {
    const nextErrors: FormErrors = {}

    const trimmedTokenName = tokenName.trim()
    const trimmedTokenSymbol = tokenSymbol.trim().toUpperCase()
    const trimmedTokenAddress = tokenAddress.trim()
    const trimmedNotes = notes.trim()
    const selectedChain = getStrategyChainEntryByLabel(chain)
    const expectedChainId = selectedChain.chain.id

    const sellValidation = validateNumericField(sellPercentage, {
      label: "Sell percentage",
      required: true,
      min: 1,
      max: 100,
      maxDecimals: 2,
    })
    const takeProfitValidation = validateNumericField(takeProfitPrice, {
      label: "Take-profit price",
      min: Number.EPSILON,
      maxDecimals: MAX_DECIMAL_PLACES,
    })
    const stopLossValidation = validateNumericField(stopLossPrice, {
      label: "Stop-loss price",
      min: Number.EPSILON,
      maxDecimals: MAX_DECIMAL_PLACES,
    })
    const slippageValidation = validateNumericField(slippage, {
      label: "Slippage",
      required: true,
      min: 0.1,
      max: 50,
      maxDecimals: 2,
    })

    if (!trimmedTokenName) {
      nextErrors.tokenName = "Token name is required."
    } else if (trimmedTokenName.length > MAX_TOKEN_NAME_LENGTH) {
      nextErrors.tokenName = `Token name must stay under ${MAX_TOKEN_NAME_LENGTH} characters.`
    }

    if (!trimmedTokenSymbol) {
      nextErrors.tokenSymbol = "Token symbol is required."
    } else if (trimmedTokenSymbol.length > MAX_TOKEN_SYMBOL_LENGTH) {
      nextErrors.tokenSymbol = "Token symbol looks too long."
    } else if (!TOKEN_SYMBOL_PATTERN.test(trimmedTokenSymbol)) {
      nextErrors.tokenSymbol =
        "Token symbol can only include letters, numbers, dots, dashes, and underscores."
    }

    if (trimmedTokenAddress && !EVM_ADDRESS_PATTERN.test(trimmedTokenAddress)) {
      nextErrors.tokenAddress = "Enter a valid EVM token contract address."
    }

    if (chainId !== String(expectedChainId)) {
      nextErrors.general =
        "The selected chain details are out of sync. Please reselect the chain and try again."
    }

    if (!takeProfitPrice.trim() && !stopLossPrice.trim()) {
      nextErrors.general = "Set at least a take-profit price or a stop-loss price."
    }

    if (sellValidation.error) {
      nextErrors.sellPercentage = sellValidation.error
    }

    if (takeProfitValidation.error) {
      nextErrors.takeProfitPrice = takeProfitValidation.error
    }

    if (stopLossValidation.error) {
      nextErrors.stopLossPrice = stopLossValidation.error
    }

    if (
      takeProfitValidation.value !== undefined &&
      stopLossValidation.value !== undefined &&
      takeProfitValidation.value <= stopLossValidation.value
    ) {
      nextErrors.general =
        "Take-profit price should be higher than stop-loss price so the rule stays sensible."
    }

    if (slippageValidation.error) {
      nextErrors.slippage = slippageValidation.error
    }

    if (trimmedNotes.length > MAX_NOTES_LENGTH) {
      nextErrors.notes = `Notes must stay under ${MAX_NOTES_LENGTH} characters.`
    }

    if (
      nextErrors.tokenAddress ||
      nextErrors.slippage ||
      nextErrors.notes
    ) {
      setIsAdvancedOpen(true)
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
      tokenAddress: tokenAddress.trim(),
      chain,
      chainId: Number(chainId),
      sellPercentage: Number(sellPercentage.trim()),
      takeProfitPrice: takeProfitPrice.trim()
        ? Number(takeProfitPrice.trim())
        : undefined,
      stopLossPrice: stopLossPrice.trim() ? Number(stopLossPrice.trim()) : undefined,
      triggerEnabled,
      slippage: Number(slippage.trim()),
      notes: notes.trim() || undefined,
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
              ? "Update the core rule now, then expand advanced settings only if you need extra automation context."
              : "Set the core exit rule first, then expand advanced settings only when you need more automation detail."}
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
            onChange={(e) => handleChainChange(e.target.value)}
            disabled={isSubmitting}
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {kdexitStrategyChainOptions.map((chainOption) => (
              <option key={chainOption}>{chainOption}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">Chain ID</label>
          <input
            type="text"
            value={chainId}
            readOnly
            disabled
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-gray-300 outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">Sell Percentage</label>
          <input
            type="number"
            value={sellPercentage}
            onChange={(e) => setSellPercentage(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. 50"
            min="1"
            max="100"
            step="0.01"
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
            min="0.00000001"
            step="0.00000001"
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
            min="0.00000001"
            step="0.00000001"
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
          {errors.stopLossPrice ? (
            <p className="mt-2 text-sm text-red-400">{errors.stopLossPrice}</p>
          ) : null}
        </div>

        <div className="md:col-span-2 rounded-2xl border border-white/10 bg-black/20">
          <button
            type="button"
            onClick={() => setIsAdvancedOpen((prev) => !prev)}
            className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 text-left sm:px-5"
          >
            <div>
              <p className="text-sm font-medium text-white">Advanced Settings</p>
              <p className="mt-1 text-sm leading-6 text-gray-400">
                Optional token metadata, notes, and execution preferences for future automation.
              </p>
            </div>
            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">
              {isAdvancedOpen ? "Collapse" : "Expand"}
            </span>
          </button>

          {isAdvancedOpen ? (
            <div className="grid gap-4 border-t border-white/10 px-4 py-4 sm:px-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-gray-300">
                  Token Address <span className="text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="0x..."
                  className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
                {errors.tokenAddress ? (
                  <p className="mt-2 text-sm text-red-400">{errors.tokenAddress}</p>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">
                    Add the contract address if this rule needs to map cleanly into later automation.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">Chain ID</label>
                <input
                  type="text"
                  value={chainId}
                  readOnly
                  disabled
                  className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-gray-300 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">Slippage %</label>
                <input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="e.g. 1"
                  min="0.1"
                  max="50"
                  step="0.01"
                  className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
                {errors.slippage ? (
                  <p className="mt-2 text-sm text-red-400">{errors.slippage}</p>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">
                    Default execution tolerance for future automated exits.
                  </p>
                )}
              </div>

              <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-medium text-white">Execution Preferences</p>
                <label className="mt-3 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={triggerEnabled}
                    onChange={(e) => setTriggerEnabled(e.target.checked)}
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-black/30 text-emerald-500"
                  />
                  <span>
                    <span className="block text-sm font-medium text-white">
                      Trigger Enabled
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-gray-400">
                      Keep this on when the rule should be considered ready for future
                      automation runs.
                    </span>
                  </span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-gray-300">
                  Notes <span className="text-gray-500">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                  placeholder="Add brief context for why this rule exists or when it should be reviewed."
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
                <div className="mt-2 flex items-center justify-between gap-3">
                  {errors.notes ? (
                    <p className="text-sm text-red-400">{errors.notes}</p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Keep notes lightweight so the strategy list stays readable.
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {notes.trim().length}/{MAX_NOTES_LENGTH}
                  </p>
                </div>
              </div>
            </div>
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
