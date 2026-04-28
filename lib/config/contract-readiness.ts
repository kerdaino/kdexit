import { readBooleanEnvFlag } from "@/lib/config/env"
import type { ContractReadinessSnapshot } from "@/types/contract-readiness"

const EVM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/
const LIVE_CONTRACT_EXECUTION_ENABLED = false

export const CONTRACT_READINESS_ENV_KEYS = {
  contractReadinessMode: "NEXT_PUBLIC_KDEXIT_CONTRACT_READINESS_MODE",
  executionControllerAbiRef: "NEXT_PUBLIC_KDEXIT_EXECUTION_CONTROLLER_ABI_REF",
  executionControllerAddress: "NEXT_PUBLIC_KDEXIT_EXECUTION_CONTROLLER_ADDRESS",
  strategyRegistryAbiRef: "NEXT_PUBLIC_KDEXIT_STRATEGY_REGISTRY_ABI_REF",
  strategyRegistryAddress: "NEXT_PUBLIC_KDEXIT_STRATEGY_REGISTRY_ADDRESS",
  supportedChainIds: "NEXT_PUBLIC_KDEXIT_CONTRACT_SUPPORTED_CHAIN_IDS",
} as const

function readOptionalString(value: string | undefined) {
  const trimmedValue = value?.trim()
  return trimmedValue ? trimmedValue : null
}

function readSupportedChainIds(value: string | undefined) {
  if (!value) {
    return []
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => Number(entry))
    .filter((entry) => Number.isInteger(entry) && entry > 0)
}

function isValidContractAddress(value: string | null) {
  if (!value) {
    return false
  }

  return EVM_ADDRESS_PATTERN.test(value)
}

export function getContractReadinessSnapshot(): ContractReadinessSnapshot {
  const modeRequested = readBooleanEnvFlag(
    process.env.NEXT_PUBLIC_KDEXIT_CONTRACT_READINESS_MODE,
    false
  )
  const supportedChainIds = readSupportedChainIds(
    process.env.NEXT_PUBLIC_KDEXIT_CONTRACT_SUPPORTED_CHAIN_IDS
  )
  const strategyRegistryAddress = readOptionalString(
    process.env.NEXT_PUBLIC_KDEXIT_STRATEGY_REGISTRY_ADDRESS
  )
  const executionControllerAddress = readOptionalString(
    process.env.NEXT_PUBLIC_KDEXIT_EXECUTION_CONTROLLER_ADDRESS
  )
  const strategyRegistryAbiRef = readOptionalString(
    process.env.NEXT_PUBLIC_KDEXIT_STRATEGY_REGISTRY_ABI_REF
  )
  const executionControllerAbiRef = readOptionalString(
    process.env.NEXT_PUBLIC_KDEXIT_EXECUTION_CONTROLLER_ABI_REF
  )

  const missingReasons: string[] = []

  if (!modeRequested) {
    missingReasons.push(
      "Contract readiness mode is disabled until it is explicitly enabled."
    )
  }

  if (supportedChainIds.length === 0) {
    missingReasons.push(
      "No supported contract chain IDs are configured for the dashboard."
    )
  }

  if (!strategyRegistryAddress && !executionControllerAddress) {
    missingReasons.push(
      "No strategy registry or execution controller address is configured."
    )
  }

  if (strategyRegistryAddress && !isValidContractAddress(strategyRegistryAddress)) {
    missingReasons.push("The configured strategy registry address is not a valid EVM address.")
  }

  if (
    executionControllerAddress &&
    !isValidContractAddress(executionControllerAddress)
  ) {
    missingReasons.push(
      "The configured execution controller address is not a valid EVM address."
    )
  }

  if (strategyRegistryAddress && !strategyRegistryAbiRef) {
    missingReasons.push(
      "The strategy registry address is configured, but its ABI reference is missing."
    )
  }

  if (executionControllerAddress && !executionControllerAbiRef) {
    missingReasons.push(
      "The execution controller address is configured, but its ABI reference is missing."
    )
  }

  const enabled = missingReasons.length === 0

  if (enabled) {
    return {
      enabled,
      liveExecutionEnabled: LIVE_CONTRACT_EXECUTION_ENABLED,
      modeRequested,
      supportedChainIds,
      strategyRegistryAddress,
      executionControllerAddress,
      strategyRegistryAbiRef,
      executionControllerAbiRef,
      missingReasons,
      summary: {
        label: "Configured",
        description:
          "Contract infrastructure references are configured for read-only readiness checks. No live contract write path is enabled.",
        tone: "success",
      },
    }
  }

  if (modeRequested) {
    return {
      enabled,
      liveExecutionEnabled: LIVE_CONTRACT_EXECUTION_ENABLED,
      modeRequested,
      supportedChainIds,
      strategyRegistryAddress,
      executionControllerAddress,
      strategyRegistryAbiRef,
      executionControllerAbiRef,
      missingReasons,
      summary: {
        label: "Incomplete",
        description:
          "Contract readiness was requested, but required contract infrastructure references are still missing or invalid.",
        tone: "warning",
      },
    }
  }

  return {
    enabled,
    liveExecutionEnabled: LIVE_CONTRACT_EXECUTION_ENABLED,
    modeRequested,
    supportedChainIds,
    strategyRegistryAddress,
    executionControllerAddress,
    strategyRegistryAbiRef,
    executionControllerAbiRef,
    missingReasons,
    summary: {
      label: "Disabled",
      description:
        "Contract readiness is disabled by default until chain support, addresses, and ABI references are configured explicitly.",
      tone: "neutral",
    },
  }
}

export function isContractInfrastructureConfigured() {
  return getContractReadinessSnapshot().enabled
}

export function isLiveContractExecutionEnabled() {
  return LIVE_CONTRACT_EXECUTION_ENABLED
}

export function getContractReadinessUiSummary() {
  return getContractReadinessSnapshot().summary
}
