import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0B0F14]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-sm text-gray-400 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.24em] text-white sm:text-base">
            KDEXIT
          </p>
          <p className="mt-2 max-w-xl leading-6">
            Clean strategy management for take-profit and stop-loss planning.
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 transition hover:border-white/15 hover:bg-white/10 hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 transition hover:border-white/15 hover:bg-white/10 hover:text-white"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </footer>
  )
}
