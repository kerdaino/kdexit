import { injected, createConfig, http } from "wagmi"
import { walletConnect } from "@wagmi/connectors"
import {
  getWalletConnectProjectId,
  getWeb3AppUrl,
  hasWalletConnectProjectId,
} from "@/lib/web3/env"
import { kdexitWalletChains, primaryKdexitChain } from "@/lib/web3/chains"

export const metadata = {
  name: "KDEXIT",
  description:
    "KDEXIT helps traders manage take-profit and stop-loss strategies with a clean dashboard built for control, visibility, and future automation.",
  url: getWeb3AppUrl(),
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
}

const chains = kdexitWalletChains

export const isWalletIntegrationEnabled = hasWalletConnectProjectId()

export const config = createConfig({
  chains,
  connectors: isWalletIntegrationEnabled
    ? [
        injected({ shimDisconnect: true }),
        walletConnect({
          projectId: getWalletConnectProjectId(),
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
