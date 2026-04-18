"use client"

import { useMemo } from "react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { getWalletIntegrationDisabledReason } from "@/lib/web3/env"

const SUPPORTED_CONNECTOR_IDS = ["injected", "walletConnect"]

export function formatWalletAddress(address?: string) {
  if (!address) {
    return "Not connected"
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function useWalletConnection() {
  const { address, chain, connector, isConnected } = useAccount()
  const {
    connect,
    connectors,
    error: connectError,
    isPending: isConnecting,
    variables,
  } = useConnect()
  const { disconnect, isPending: isDisconnecting } = useDisconnect()

  const disabledReason = getWalletIntegrationDisabledReason()
  const isWalletEnabled = !disabledReason

  const availableConnectors = useMemo(
    () => connectors.filter((connector) => SUPPORTED_CONNECTOR_IDS.includes(connector.id)),
    [connectors]
  )

  const preferredConnector =
    availableConnectors.find((connector) => connector.id === "injected") ??
    availableConnectors.find((connector) => connector.id === "walletConnect") ??
    null

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
    isConnected,
    isConnecting,
    isDisconnecting,
    isWalletEnabled,
    pendingConnectorId,
    preferredConnector,
  }
}
