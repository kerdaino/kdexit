import type { Metadata } from "next"
import "./globals.css"

const appDescription =
  "KDEXIT helps traders manage take-profit and stop-loss strategies with a clean dashboard built for control, visibility, and future automation."

export const metadata: Metadata = {
  applicationName: "KDEXIT",
  title: {
    default: "KDEXIT",
    template: "%s | KDEXIT",
  },
  description: appDescription,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
