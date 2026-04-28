This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

Copy `.env.example` to `.env.local` and provide your Supabase project values:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_APP_URL`

One public Supabase client key is required:

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- or `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional wallet variables:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

Optional data mode variable:

- `NEXT_PUBLIC_STRATEGY_DATA_MODE`

Phase 5 execution-readiness flags:

- `NEXT_PUBLIC_KDEXIT_DASHBOARD_BETA_MODE`
- `NEXT_PUBLIC_KDEXIT_WALLET_LINKED_BETA_MODE`
- `NEXT_PUBLIC_KDEXIT_CONTRACT_READINESS_MODE`
- `NEXT_PUBLIC_KDEXIT_LIVE_EXECUTION_MODE`
- `KDEXIT_ENABLE_WATCHER_SIMULATION`
- `KDEXIT_LIVE_EXECUTION_KILL_SWITCH`

Optional contract-readiness references:

- `NEXT_PUBLIC_KDEXIT_CONTRACT_SUPPORTED_CHAIN_IDS`
- `NEXT_PUBLIC_KDEXIT_STRATEGY_REGISTRY_ADDRESS`
- `NEXT_PUBLIC_KDEXIT_STRATEGY_REGISTRY_ABI_REF`
- `NEXT_PUBLIC_KDEXIT_EXECUTION_CONTROLLER_ADDRESS`
- `NEXT_PUBLIC_KDEXIT_EXECUTION_CONTROLLER_ABI_REF`

If `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is missing, wallet connection UI stays visible in a disabled state instead of crashing the app.

For Vercel or any production deployment, `NEXT_PUBLIC_APP_URL` should be set to your final public origin, for example `https://app.kdexit.com`.

`NEXT_PUBLIC_STRATEGY_DATA_MODE` defaults to `localStorage`. For the authenticated Supabase-backed dashboard flow, set it to `supabase`. Keep `localStorage` only for explicit local/dev fallback use.

Execution-readiness safe defaults:

- dashboard beta mode defaults to disabled
- wallet-linked beta mode defaults to disabled
- contract readiness defaults to disabled
- live execution defaults to disabled
- watcher simulation defaults to disabled unless explicitly enabled
- the global live execution kill switch defaults to enabled

Contract readiness can report configured chain IDs, contract addresses, and ABI references for future use. These flags and references do not add or enable trade execution, token approvals, swaps, or contract writes. They are only a centralized readiness and gating layer for future Phase 5 work, and live contract execution remains disabled.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
