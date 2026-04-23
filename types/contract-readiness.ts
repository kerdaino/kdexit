export type ContractConfigSummaryTone = "neutral" | "warning" | "success"

export type ContractReadinessSnapshot = {
  enabled: boolean
  modeRequested: boolean
  supportedChainIds: number[]
  strategyRegistryAddress: string | null
  executionControllerAddress: string | null
  strategyRegistryAbiRef: string | null
  executionControllerAbiRef: string | null
  missingReasons: string[]
  summary: {
    label: string
    description: string
    tone: ContractConfigSummaryTone
  }
}
