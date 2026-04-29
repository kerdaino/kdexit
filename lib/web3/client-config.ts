"use client"

import type { Config } from "wagmi"
import { injected, createConfig, http } from "wagmi"
import { walletConnect } from "@wagmi/connectors"
import {
  getWalletEnvironment,
  getWeb3AppUrl,
} from "@/lib/web3/env"
import { kdexitWalletChains, primaryKdexitChain } from "@/lib/web3/chains"

declare global {
  var __kdexitWagmiConfig: Config | undefined
  var __kdexitWalletConfigError: string | null | undefined
}

const metadata = {
  name: "KDEXIT",
  description:
    "KDEXIT helps traders manage take-profit and stop-loss strategies with a clean dashboard built for control, visibility, and future automation.",
  url: getWeb3AppUrl(),
  icons: [`${getWeb3AppUrl()}/favicon.ico`],
}

function createWalletConfig() {
  const walletEnvironment = getWalletEnvironment()

  return createConfig({
    chains: kdexitWalletChains,
    connectors: walletEnvironment.projectId
      ? [
          injected({ shimDisconnect: true }),
          walletConnect({
            projectId: walletEnvironment.projectId,
            metadata,
            showQrModal: true,
          }),
        ]
      : [],
    ssr: true,
    transports: {
      [primaryKdexitChain.chain.id]: http(),
    },
  })
}

function createDisabledWalletConfig() {
  return createConfig({
    chains: kdexitWalletChains,
    connectors: [],
    ssr: true,
    transports: {
      [primaryKdexitChain.chain.id]: http(),
    },
  })
}

export function getWalletConfigError() {
  return globalThis.__kdexitWalletConfigError ?? null
}

export function getWagmiConfig() {
  if (!globalThis.__kdexitWagmiConfig) {
    try {
      globalThis.__kdexitWalletConfigError = null
      globalThis.__kdexitWagmiConfig = createWalletConfig()
    } catch {
      globalThis.__kdexitWalletConfigError =
        "Wallet configuration could not be initialized. Wallet connection is disabled for now."
      globalThis.__kdexitWagmiConfig = createDisabledWalletConfig()
    }
  }

  return globalThis.__kdexitWagmiConfig
}
