const APP_URL_ENV = "NEXT_PUBLIC_APP_URL"

function readAppUrlEnv() {
  return process.env[APP_URL_ENV]
}

function normalizeAppUrl(value?: string) {
  if (!value) {
    return undefined
  }

  try {
    const url = new URL(value)
    return url.origin
  } catch {
    return undefined
  }
}

function getRuntimeOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin
  }

  return undefined
}

export function getConfiguredAppUrl() {
  return normalizeAppUrl(readAppUrlEnv())
}

export function getPublicAppUrl() {
  return (
    getConfiguredAppUrl() ??
    getRuntimeOrigin() ??
    "http://localhost:3000"
  )
}
