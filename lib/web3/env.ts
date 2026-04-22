import { getPublicAppUrl } from "@/lib/site/url"

export const WALLETCONNECT_PROJECT_ID_ENV = "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"

function readWalletConnectProjectId() {
  return process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ?? ""
}

export type WalletEnvironment = {
  disabledReason: string | null
  isWalletConnectConfigured: boolean
  projectId: string | null
}

function isValidWalletConnectProjectId(projectId: string) {
  return /^[a-fA-F0-9]{32}$/.test(projectId)
}

export function getWalletEnvironment(): WalletEnvironment {
  const projectId = readWalletConnectProjectId()

  if (!projectId) {
    return {
      disabledReason: `${WALLETCONNECT_PROJECT_ID_ENV} is not configured yet. Wallet connection is disabled for now.`,
      isWalletConnectConfigured: false,
      projectId: null,
    }
  }

  if (!isValidWalletConnectProjectId(projectId)) {
    return {
      disabledReason: `${WALLETCONNECT_PROJECT_ID_ENV} is invalid. Wallet connection is disabled until the WalletConnect project ID is corrected.`,
      isWalletConnectConfigured: false,
      projectId: null,
    }
  }

  return {
    disabledReason: null,
    isWalletConnectConfigured: true,
    projectId,
  }
}

export function getWeb3AppUrl() {
  return getPublicAppUrl()
}
