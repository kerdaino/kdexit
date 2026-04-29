# KDEXIT Beta Incident Response

This runbook is for the maintainer operating `kdexit-web` during beta.

Beta boundaries still apply during incidents: do not add live execution,
contract writes, token approvals, swaps, relayers, or private-key flows as a
fix. Prefer disabling risky surfaces, rolling back, or applying narrow forward
fixes.

## Incident Basics

For any incident:

- Identify the affected environment: local, preview, staging, or production beta.
- Record the Vercel deployment ID, Git commit, Supabase project, and incident
  start time.
- Decide severity:
  - `SEV-1`: security risk, data exposure, auth broadly broken, or user data
    corruption.
  - `SEV-2`: dashboard, wallet linking, or persistence broken for many beta
    users.
  - `SEV-3`: isolated feature failure with clear workaround.
- Contain first, debug second.
- Avoid sharing raw wallet addresses, auth tokens, cookies, session data, or
  database exports in chat or tickets.
- Use Vercel rollback when the current app deployment is likely the cause.
- Use reviewed forward Supabase migrations for database fixes. Do not manually
  edit production policy state without recording exactly what changed.

## Auth Breaks

Symptoms:

- Users cannot sign in or sign up.
- `/dashboard` redirects in a loop.
- `/auth/callback` fails after email link or provider auth.
- Authenticated API routes return `401`.

First response:

- Check Supabase Auth status and project health.
- Verify `NEXT_PUBLIC_SUPABASE_URL` and the publishable or anon key in Vercel.
- Verify Supabase redirect allowlist includes the beta domain and
  `/auth/callback`.
- Confirm `NEXT_PUBLIC_APP_URL` matches the deployed beta origin.
- Test with a fresh private browser session.

Containment:

- If auth is broadly broken after a deploy, roll back to the previous known-good
  Vercel deployment.
- If redirect configuration is wrong, fix Supabase Auth URL settings and retest
  before redeploying.
- Pause beta invites until sign-in and dashboard access are stable.

Follow-up:

- Record failing URL, browser, deployment ID, and whether the issue was Vercel
  env, Supabase Auth config, or app code.

## Supabase Or RLS Issue

Symptoms:

- Users see empty dashboard data unexpectedly.
- Users cannot create, update, or delete records.
- API routes return database errors.
- Cross-user data appears accessible.
- RLS policy changes break beta flows.

First response:

- Confirm the expected Supabase project is connected.
- Check whether recent migrations were applied.
- Verify RLS is enabled on `profiles`, `strategies`, `executions`,
  `wallet_links`, and `execution_attempts`.
- Test as two separate users. User A must not read, update, or delete user B
  records.
- Check whether the security hardening migration intentionally blocks active
  strategies, trigger-enabled writes, transaction hashes, or non-simulation
  execution attempts.

Containment:

- If there is possible cross-user access, treat as `SEV-1`, pause beta access,
  and remove public links/invites.
- If a migration broke normal beta writes, apply a reviewed forward migration or
  roll app behavior back to a compatible deployment.
- Do not disable RLS globally to restore service.

Follow-up:

- Record affected table, policy name, user IDs involved, and the exact SQL
  migration used to fix the issue.

## Wallet Connection Issue

Symptoms:

- WalletConnect modal does not open.
- Wallet connection works locally but not on beta domain.
- Users can connect but cannot link wallets.
- Wallet UI implies more capability than beta supports.

First response:

- Verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` exists in Vercel.
- Confirm WalletConnect project allowlist includes the beta domain.
- Confirm `NEXT_PUBLIC_APP_URL` is the deployed beta origin.
- Test from the deployed beta domain with one injected wallet and one
  WalletConnect-compatible wallet.
- Check browser console for provider/config errors.

Containment:

- If connection is broken but the rest of beta works, leave wallet UI in disabled
  mode by removing or correcting the WalletConnect project ID and redeploying.
- If wallet linking fails, keep wallet connection available only if copy remains
  clear that linking does not grant approval or execution permission.
- Never introduce token approval, transaction signing, or contract write logic as
  a hotfix.

Follow-up:

- Record wallet type, browser, domain, WalletConnect project settings, and
  whether the issue was config, provider outage, or app code.

## Watcher Simulation Bug

Symptoms:

- Internal watcher simulation route returns errors.
- Simulation attempts show incorrect status.
- Strategy evaluation metadata looks stale or wrong.
- Repeated failed simulation attempts appear in activity or audit surfaces.

First response:

- Confirm whether watcher simulation is expected to be enabled in this
  environment.
- In production beta, the internal simulation route should remain unavailable.
- Check `KDEXIT_ENABLE_WATCHER_SIMULATION` and legacy
  `KDEXIT_ENABLE_INTERNAL_WATCHER_SIMULATION`.
- Review recent changes in `lib/watcher/*`, execution attempts, and strategy
  evaluation state.

Containment:

- Disable watcher simulation env flags if simulation behavior is confusing users
  or generating bad records.
- Roll back the app deployment if the bug was introduced by code.
- If bad simulation records were written, preserve them for audit first, then
  decide whether a corrective migration or UI clarification is safer.

Follow-up:

- Record affected strategy IDs, attempt IDs, failure counts, and whether the
  simulation produced any misleading user-facing state.

## Readiness Gate Misconfiguration

Symptoms:

- Dashboard suggests beta execution readiness when it should not.
- Strategy activation is unexpectedly allowed or blocked.
- Contract-readiness metadata appears incomplete or misleading.
- Audit view reports readiness gate misconfiguration.

First response:

- Check these env vars in Vercel:
  - `NEXT_PUBLIC_KDEXIT_DASHBOARD_BETA_MODE`
  - `NEXT_PUBLIC_KDEXIT_WALLET_LINKED_BETA_MODE`
  - `NEXT_PUBLIC_KDEXIT_CONTRACT_READINESS_MODE`
  - `NEXT_PUBLIC_KDEXIT_LIVE_EXECUTION_MODE`
  - `KDEXIT_LIVE_EXECUTION_KILL_SWITCH`
  - `KDEXIT_ENABLE_WATCHER_SIMULATION`
- Confirm beta defaults:
  - live execution mode is `false`
  - kill switch is `true`
  - watcher simulation is disabled in production beta
  - contract readiness is off unless references are intentionally configured

Containment:

- Set risky flags back to safe defaults and redeploy.
- Keep strategy activation disabled unless a future reviewed release explicitly
  changes the execution model.
- If copy is misleading, ship a copy-only clarification rather than enabling new
  controls.

Follow-up:

- Record the before/after env values and the exact deployment that picked up the
  correction.

## Suspected Security Issue

Symptoms:

- Possible cross-user data access.
- Untrusted origin can mutate data.
- Exposed secret or server-only env value.
- Suspicious wallet, auth, or API behavior.
- Unexpected contract, approval, or transaction prompt.

First response:

- Treat as `SEV-1` until ruled out.
- Preserve evidence: deployment ID, request path, timestamps, user reports,
  screenshots, and logs.
- Do not paste secrets, full cookies, full wallet addresses, auth tokens, or raw
  database exports into shared channels.
- Check recent deployments, env changes, migrations, and dependency changes.

Containment:

- Roll back the app if the issue may be deployment-related.
- Rotate any exposed secrets immediately.
- Disable affected beta flows by env flag or rollback.
- Pause beta invites or temporarily take the beta app private if user data could
  be exposed.
- Do not disable RLS globally.

Follow-up:

- Write an incident note with impact, root cause, containment, remediation, and
  whether users need to be notified.
- Add a regression check before reopening beta access.

## User Data Issue

Symptoms:

- Missing, duplicated, corrupted, or incorrect strategy records.
- Linked wallets look wrong.
- Activity, audit, or execution-attempt records are inconsistent.
- User reports data changed without action.

First response:

- Identify affected user, table, record IDs, and time window.
- Check whether the issue is display-only or persisted data.
- Compare API behavior with direct Supabase table state.
- Check recent migrations and deploys.

Containment:

- If data corruption is ongoing, pause the affected mutation path by rollback or
  env/config change.
- Preserve existing records before repair.
- Prefer forward repair migrations or targeted admin actions with a written
  change log.
- Do not delete audit-relevant records unless there is a clear privacy or legal
  reason.

Follow-up:

- Tell affected beta users what happened, what data was affected, whether it was
  restored, and what they should do next.
- Add validation, RLS, or UI guardrails to prevent recurrence.

## Communication Template

Use this shape for beta user updates:

```text
KDEXIT beta incident update

Status: Investigating | Mitigated | Resolved
Impact: [what users may see]
Scope: [who/what is affected, without sensitive data]
Current action: [rollback/config fix/investigation]
User action needed: [none/sign in again/retry later/contact maintainer]
Next update: [time]
```

## Recovery Checklist

- `[ ]` Root cause is understood or bounded.
- `[ ]` Risky env flags are back to safe beta values.
- `[ ]` Supabase RLS and ownership checks still pass.
- `[ ]` `npm run lint` passes after code changes.
- `[ ]` `npm run build` passes after code changes.
- `[ ]` Beta smoke test passes on the deployed domain.
- `[ ]` Incident note is written.
- `[ ]` Follow-up owner is assigned.
