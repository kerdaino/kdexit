import type { Metadata } from "next"
import Providers from "@/components/shared/providers"
import { getConfiguredAppUrl } from "@/lib/site/url"
import "./globals.css"

const appDescription =
  "KDEXIT helps traders manage take-profit and stop-loss strategies with a clean dashboard built for control, visibility, and future automation."
const configuredAppUrl = getConfiguredAppUrl()

export const metadata: Metadata = {
  applicationName: "KDEXIT",
  title: {
    default: "KDEXIT",
    template: "%s | KDEXIT",
  },
  description: appDescription,
  metadataBase: configuredAppUrl ? new URL(configuredAppUrl) : undefined,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "KDEXIT",
    description: appDescription,
    siteName: "KDEXIT",
    type: "website",
    url: configuredAppUrl ?? undefined,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
