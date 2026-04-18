import { getPublicAppUrl } from "@/lib/site/url"

const WALLETCONNECT_PROJECT_ID_ENV = "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"

function readEnvValue(name: typeof WALLETCONNECT_PROJECT_ID_ENV) {
  return process.env[name]
}

export function hasWalletConnectProjectId() {
  return Boolean(readEnvValue(WALLETCONNECT_PROJECT_ID_ENV))
}

export function getWalletConnectProjectId() {
  const value = readEnvValue(WALLETCONNECT_PROJECT_ID_ENV)

  if (!value) {
    throw new Error(`Missing required wallet environment variable: ${WALLETCONNECT_PROJECT_ID_ENV}`)
  }

  return value
}

export function getWalletIntegrationDisabledReason() {
  if (!hasWalletConnectProjectId()) {
    return `${WALLETCONNECT_PROJECT_ID_ENV} is not configured yet. Wallet connection is disabled for now.`
  }

  return null
}

export function getWeb3AppUrl() {
  return getPublicAppUrl()
}
