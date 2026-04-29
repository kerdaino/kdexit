# KDEXIT Beta Deployment Readiness Checklist

Use this checklist before promoting `kdexit-web` to a beta deployment.

Beta scope: authenticated dashboard, strategy planning records, linked-wallet
visibility, watcher simulation visibility, operational audit UI, monitoring and
alerting placeholders. Beta must not enable live execution, token approvals,
contract writes, swaps, relayers, or private-key flows.

## Release Gate

- `[Must]` Release owner is assigned.
- `[Must]` Rollback owner is assigned.
- `[Must]` Supabase project owner is available during deploy.
- `[Must]` Vercel project owner is available during deploy.
- `[Must]` Beta user list and support channel are known.
- `[Must]` Known limitations are accepted: wallet linking is account association,
  watcher activity is simulation/readiness only, and live execution is disabled.

## Local Testing

- `[Must]` Install dependencies from lockfile with `npm install`.
- `[Must]` Copy `.env.example` to `.env.local` and use local or staging-safe
  values only.
- `[Must]` Start local app with `npm run dev`.
- `[Must]` Landing page loads without console errors.
- `[Must]` Auth pages load and sign-in/sign-up flows reach Supabase.
- `[Must]` Dashboard redirects unauthenticated users to `/login?next=%2Fdashboard`.
- `[Must]` Authenticated dashboard loads with Supabase env configured.
- `[Must]` Strategy create, edit, pause, resume, and delete flows show correct UI
  feedback.
- `[Must]` Activity and audit sections show real records or clear empty states.
- `[Must]` Settings show wallet, readiness, and data-mode state accurately.
- `[Must]` Wallet connection unavailable state is clear when
  `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is missing.
- `[Should]` Test local browser refresh, sign-out, and expired-session behavior.
- `[Should]` Test mobile viewport for landing, dashboard, settings, and audit.

## Production Build Testing

- `[Must]` `npm run lint` passes.
- `[Must]` `npm run build` passes.
- `[Must]` Build output includes expected dynamic routes:
  `/dashboard`, `/login`, `/signup`, `/auth/callback`, and API routes.
- `[Must]` No build logs expose secrets or full environment values.
- `[Must]` No production build warning suggests accidental static rendering of
  authenticated dashboard data.
- `[Should]` Run the built app with `npm run start` against staging env values
  before promoting.

## Supabase Checks

- `[Must]` Staging and production Supabase projects are separate.
- `[Must]` Production Supabase URL and publishable or anon key are configured in
  Vercel.
- `[Must]` Required migrations are applied in order.
- `[Must]` `profiles`, `strategies`, `executions`, `wallet_links`, and
  `execution_attempts` tables exist.
- `[Must]` Auth callback URLs include the beta domain and any preview domain used
  for QA.
- `[Must]` Email/auth provider settings use beta-safe branding and redirect URLs.
- `[Must]` No seed/test user data is mixed into production beta tables.
- `[Should]` Backup and restore expectations are documented before inviting beta
  users.

## RLS Verification

- `[Must]` RLS is enabled for `profiles`, `strategies`, `executions`,
  `wallet_links`, and `execution_attempts`.
- `[Must]` Select policies require `auth.uid() = user_id` or equivalent owner
  match.
- `[Must]` Insert/update/delete policies require owner match.
- `[Must]` Strategy public-client writes cannot activate strategies or enable
  triggers during beta.
- `[Must]` Execution and execution-attempt public-client writes cannot attach
  transaction hashes.
- `[Must]` Execution attempts remain simulation-only for public-client writes.
- `[Must]` Cross-user access test fails: user A cannot read, update, or delete
  user B records through API routes or Supabase client.
- `[Should]` Keep a short SQL/RLS verification note with the deployment record.

## WalletConnect Configuration

- `[Must]` `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set in Vercel if wallet
  connection is expected to work in beta.
- `[Must]` WalletConnect project allowlist includes the beta domain.
- `[Must]` Wallet metadata uses beta-safe name, description, URL, and icon.
- `[Must]` Wallet connection is tested from the deployed beta domain, not only
  localhost.
- `[Must]` Wallet linking copy remains clear that linking does not grant token
  approval or execution permission.
- `[Should]` Test at least one injected wallet and WalletConnect-compatible mobile
  wallet.
- `[Should]` Confirm disconnecting a wallet session does not delete linked-wallet
  records, and unlinking does not imply a wallet transaction.

## Vercel Environment Setup

- `[Must]` Production and preview variables are set separately.
- `[Must]` `NEXT_PUBLIC_APP_URL` matches the beta canonical origin.
- `[Must]` `NEXT_PUBLIC_STRATEGY_DATA_MODE=supabase` for beta.
- `[Must]` `NEXT_PUBLIC_KDEXIT_LIVE_EXECUTION_MODE=false`.
- `[Must]` `KDEXIT_LIVE_EXECUTION_KILL_SWITCH=true`.
- `[Must]` `KDEXIT_ENABLE_WATCHER_SIMULATION=false` for production beta unless a
  restricted internal simulation exercise is explicitly planned outside
  `NODE_ENV=production`.
- `[Must]` Monitoring and alerting flags stay disabled unless a transport has
  been registered.
- `[Must]` No server-only secrets are placed in `NEXT_PUBLIC_*` variables.
- `[Must]` `NEXT_PUBLIC_KDEXIT_RELEASE` and `KDEXIT_RELEASE` identify the deployed
  commit, tag, or Vercel deployment ID.
- `[Should]` Keep staging and production WalletConnect, Supabase, and release
  labels distinct.

See `docs/production-environment-checklist.md` for the full environment matrix.

## Domain Setup

- `[Must]` Beta domain is chosen and documented.
- `[Must]` DNS points to the Vercel project.
- `[Must]` HTTPS certificate is active.
- `[Must]` Canonical app URL matches `NEXT_PUBLIC_APP_URL`.
- `[Must]` Supabase auth redirect allowlist includes the beta domain callback:
  `/auth/callback`.
- `[Must]` WalletConnect allowlist includes the beta domain.
- `[Should]` Decide whether `www` redirects to apex or apex redirects to `www`.
- `[Should]` Verify metadata, favicon, and social preview are acceptable for beta.

## Monitoring And Alert Placeholders

- `[Must]` Confirm monitoring is no-op unless explicitly enabled and a transport
  is registered.
- `[Must]` Confirm alerting is no-op unless explicitly enabled and a transport is
  registered.
- `[Must]` Confirm alert and monitoring contexts do not include raw wallet
  addresses, auth tokens, cookies, session values, private keys, or webhook URLs.
- `[Must]` Dashboard API failures surface user-visible retry/error states.
- `[Must]` Operational audit view shows load failures where available.
- `[Should]` Define where deployment failures and beta user reports will be
  triaged until real monitoring transports are wired.
- `[Should]` Record expected future alert scenarios: failed API mutation, failed
  watcher simulation, repeated failures, wallet-linking errors, and readiness
  gate misconfiguration.

## Beta Smoke Test

Run this on the Vercel preview deployment first, then on the promoted beta domain.

- `[Must]` Open landing page.
- `[Must]` Sign up or sign in with a beta account.
- `[Must]` Confirm `/dashboard` is protected when signed out.
- `[Must]` Create a strategy and verify it remains paused/triggers disabled when
  execution gates are off.
- `[Must]` Edit the strategy.
- `[Must]` Pause/resume behavior respects disabled execution gates.
- `[Must]` Delete the strategy.
- `[Must]` Open activity and audit sections.
- `[Must]` Connect wallet session if WalletConnect is configured.
- `[Must]` Link wallet, set primary, and unlink wallet without any wallet
  transaction prompt.
- `[Must]` Confirm no UI implies live trading, token approval, or fund movement.

## Rollback Steps

- `[Must]` Identify the previous known-good Vercel deployment before release.
- `[Must]` Keep database migrations reviewed before applying to production; avoid
  irreversible schema changes in beta deploys where possible.
- `[Must]` If app deploy fails, use Vercel rollback to promote the previous
  deployment.
- `[Must]` If environment configuration is wrong, revert Vercel env vars and
  redeploy the previous known-good build.
- `[Must]` If Supabase migration causes access issues, pause beta invites, capture
  the failing policy/table, and apply a reviewed forward migration rather than
  editing production state manually.
- `[Must]` If WalletConnect origin configuration fails, disable wallet connection
  by removing or correcting `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, then redeploy.
- `[Must]` If beta users are blocked, post a status update in the support channel
  with impact, workaround, and next update time.
- `[Should]` After rollback, record root cause, deployment ID, migration status,
  env changes, and follow-up owner.

## Final Sign-Off

- `[Must]` Local checks completed.
- `[Must]` Production build checks completed.
- `[Must]` Supabase and RLS checks completed.
- `[Must]` WalletConnect deployed-origin check completed or intentionally
  disabled.
- `[Must]` Vercel env and domain checks completed.
- `[Must]` Monitoring/alert placeholders confirmed no-op or intentionally wired.
- `[Must]` Rollback path confirmed.
- `[Must]` Beta release owner approves promotion.
