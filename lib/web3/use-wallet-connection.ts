"use client"

import { useMemo, useSyncExternalStore } from "react"
import { useAccount, useConnect, useConnectors, useDisconnect } from "wagmi"
import { getWalletEnvironment } from "@/lib/web3/env"
import { getWalletConfigError } from "@/lib/web3/client-config"

const subscribe = () => () => {}

export function formatWalletAddress(address?: string) {
  if (!address) {
    return "Not connected"
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function useWalletConnection() {
  const isClientReady = useSyncExternalStore(subscribe, () => true, () => false)
  const { address, chain, connector, isConnected } = useAccount()
  const connectors = useConnectors()
  const {
    connect,
    error: connectError,
    isPending: isConnecting,
    variables,
  } = useConnect()
  const { disconnect, isPending: isDisconnecting } = useDisconnect()

  const walletEnvironment = isClientReady
    ? getWalletEnvironment()
    : {
        disabledReason: null,
        isWalletConnectConfigured: true,
        projectId: null,
      }
  const walletConfigError = isClientReady ? getWalletConfigError() : null
  const disabledReason = walletConfigError ?? walletEnvironment.disabledReason
  const isWalletEnabled = walletEnvironment.isWalletConnectConfigured && !walletConfigError

  const availableConnectors = useMemo(() => connectors, [connectors])

  const walletConnectConnector =
    availableConnectors.find((connector) => connector.id === "walletConnect") ?? null

  const injectedConnector =
    availableConnectors.find((connector) => connector.id === "injected") ?? null

  const preferredConnector =
    walletConnectConnector ?? injectedConnector ?? availableConnectors[0] ?? null

  const pendingConnectorId =
    variables?.connector && "id" in variables.connector ? variables.connector.id : null

  return {
    address,
    availableConnectors,
    chain,
    connect,
    connectError,
    connector,
    disabledReason,
    disconnect,
    isClientReady,
    isConnected,
    isConnecting,
    isDisconnecting,
    isWalletEnabled,
    injectedConnector,
    pendingConnectorId,
    preferredConnector,
    walletConnectConnector,
  }
}
