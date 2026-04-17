import { defaultWagmiConfig } from "@web3modal/wagmi/react/config"
import { bsc } from "wagmi/chains"

const projectId = "YOUR_WALLETCONNECT_PROJECT_ID"

export const metadata = {
  name: "KDEXIT",
  description:
    "KDEXIT helps traders manage take-profit and stop-loss strategies with a clean dashboard built for control, visibility, and future automation.",
  url: "http://localhost:3000",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
}

export const config = defaultWagmiConfig({
  chains: [bsc],
  projectId,
  metadata,
})
