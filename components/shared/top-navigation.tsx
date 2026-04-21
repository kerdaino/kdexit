import Link from "next/link"
import AuthSessionControls from "@/components/auth/auth-session-controls"
import ConnectWalletButton from "@/components/wallet/connect-wallet-button"

type TopNavigationProps = {
  variant: "landing" | "dashboard"
}

const landingLinks = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#trust", label: "Trust" },
  { href: "/dashboard", label: "Dashboard" },
]

const dashboardLinks = [{ href: "/", label: "Home" }]

export default function TopNavigation({ variant }: TopNavigationProps) {
  const links = variant === "landing" ? landingLinks : dashboardLinks

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0B0F14]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          className="text-base font-semibold tracking-[0.24em] text-white transition hover:text-emerald-400 sm:text-lg"
        >
          KDEXIT
        </Link>

        <nav className="grid w-full grid-cols-2 gap-2 text-sm text-gray-300 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
          {links.map((link) => {
            const sharedClassName =
              "inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center transition hover:border-white/15 hover:bg-white/10 hover:text-white"

            if (link.href.startsWith("#")) {
              return (
                <a key={link.href} href={link.href} className={sharedClassName}>
                  {link.label}
                </a>
              )
            }

            return (
              <Link key={link.href} href={link.href} className={sharedClassName}>
                {link.label}
              </Link>
            )
          })}

          <AuthSessionControls compact variant={variant} />
          {variant === "dashboard" ? <ConnectWalletButton compact /> : null}
        </nav>
      </div>
    </header>
  )
}
