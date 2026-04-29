# KDEXIT Production Environment Checklist

This checklist covers environment variables used by `kdexit-web` today.

Only variables prefixed with `NEXT_PUBLIC_` are exposed to browser JavaScript.
Everything else must remain server-only. Never put service-role keys, private
keys, webhook URLs, auth tokens, cookies, session secrets, or vendor API secrets
in `NEXT_PUBLIC_*`.

## Required For Production

| Variable | Public? | Production value | Local value | Staging value |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Yes | Final production origin, for example `https://app.kdexit.com` | `http://localhost:3000` | Staging origin, for example `https://staging.kdexit.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Production Supabase project URL | Local/dev Supabase project URL | Separate staging Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Production publishable key | Local/dev publishable key | Staging publishable key |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Only use if publishable key is unavailable | Local/dev anon key | Staging anon key |
| `NEXT_PUBLIC_STRATEGY_DATA_MODE` | Yes | `supabase` for authenticated production persistence | `localStorage` or `supabase` | `supabase` |

One Supabase public client key is required: prefer
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; `NEXT_PUBLIC_SUPABASE_ANON_KEY` remains
supported for compatibility.

## Optional Public Variables

| Variable | Purpose | Production guidance | Local/Staging guidance |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Enables wallet connection UI flows. | Set to the production WalletConnect project ID if wallet connection should work. Omit only if disabled wallet mode is intentional. | Use a dev/staging WalletConnect project ID, not production. |
| `NEXT_PUBLIC_KDEXIT_MONITORING_ENABLED` | Enables client-side monitoring boundary. | Keep `false` until a client transport is registered. | Usually `false`; staging can use `true` for transport testing. |
| `NEXT_PUBLIC_KDEXIT_MONITORING_ENVIRONMENT` | Client monitoring environment label. | `production` | `development` or `staging` |
| `NEXT_PUBLIC_KDEXIT_RELEASE` | Public release/version label. | Commit SHA, tag, or deployment ID. | Local build label or staging deployment ID. |
| `NEXT_PUBLIC_KDEXIT_ALERTS_ENABLED` | Enables client-side alert reporting boundary. | Keep `false` until a transport is registered. | Usually `false`; staging can test no-op behavior. |

## Execution-Readiness Flags

These variables control UI and readiness state only. They do not add live
execution controls, contract writes, token approvals, swaps, or relayers.

| Variable | Public? | Production guidance | Local guidance | Staging guidance |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_KDEXIT_DASHBOARD_BETA_MODE` | Yes | `false` unless an internal beta release is approved. | `false` by default. | `true` only for beta testing. |
| `NEXT_PUBLIC_KDEXIT_WALLET_LINKED_BETA_MODE` | Yes | `false` unless wallet-linked beta UX is approved. | `false` by default. | `true` only when testing gated wallet-linked flows. |
| `NEXT_PUBLIC_KDEXIT_CONTRACT_READINESS_MODE` | Yes | `false` unless read-only contract readiness references are intentionally configured. | `false` by default. | `true` only when testing readiness metadata. |
| `NEXT_PUBLIC_KDEXIT_LIVE_EXECUTION_MODE` | Yes | `false`. Do not enable without a reviewed execution launch plan. | `false` | `false` unless explicitly testing future gated UI. |
| `KDEXIT_ENABLE_WATCHER_SIMULATION` | No | `false`; internal simulation route is hidden in `NODE_ENV=production`. | `true` only when testing dry-run watcher simulation. | `true` only for restricted internal simulation testing. |
| `KDEXIT_ENABLE_INTERNAL_WATCHER_SIMULATION` | No | Legacy fallback. Prefer leaving unset. | Optional legacy fallback only. | Optional legacy fallback only. |
| `KDEXIT_LIVE_EXECUTION_KILL_SWITCH` | No | `true` by default and for launch. | `true` | `true` |

## Contract-Readiness References

These are public read-only metadata values. Use them only for readiness display
and validation. They must not be treated as permission to execute transactions.

| Variable | Public? | Production guidance | Local/Staging guidance |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_KDEXIT_CONTRACT_SUPPORTED_CHAIN_IDS` | Yes | Comma-separated supported chain IDs only after contract-readiness review. | Empty unless testing readiness surfaces. |
| `NEXT_PUBLIC_KDEXIT_STRATEGY_REGISTRY_ADDRESS` | Yes | Valid EVM address for the reviewed production registry reference. | Use test/staging addresses only. |
| `NEXT_PUBLIC_KDEXIT_STRATEGY_REGISTRY_ABI_REF` | Yes | Public ABI reference or version label. | Test/staging ABI reference. |
| `NEXT_PUBLIC_KDEXIT_EXECUTION_CONTROLLER_ADDRESS` | Yes | Valid EVM address for the reviewed production controller reference. | Use test/staging addresses only. |
| `NEXT_PUBLIC_KDEXIT_EXECUTION_CONTROLLER_ABI_REF` | Yes | Public ABI reference or version label. | Test/staging ABI reference. |

## Server-Only Operational Variables

| Variable | Purpose | Production guidance | Local/Staging guidance |
| --- | --- | --- | --- |
| `KDEXIT_MONITORING_ENABLED` | Enables server monitoring boundary. | Keep `false` until a server transport is registered. | Usually `false`; staging can test transport setup. |
| `KDEXIT_MONITORING_ENVIRONMENT` | Server monitoring environment label. | `production` | `development` or `staging` |
| `KDEXIT_RELEASE` | Server release/version label. | Commit SHA, tag, or deployment ID. | Local build label or staging deployment ID. |
| `KDEXIT_ALERTS_ENABLED` | Enables server alerting boundary. | Keep `false` until an alert transport is registered. | Usually `false`; staging can verify no-op behavior. |
| `KDEXIT_INTERNAL_ADMIN_USER_IDS` | Comma-separated allowlist for internal watcher simulation outside development. | Leave unset in production because the internal route returns 404 in production. | Use staging Supabase user IDs only. |
| `KDEXIT_INTERNAL_ADMIN_EMAILS` | Comma-separated email allowlist for internal watcher simulation outside development. | Leave unset in production because the internal route returns 404 in production. | Use staging admin emails only. |

## Values That Must Differ By Environment

- `NEXT_PUBLIC_APP_URL` must match the exact deployed origin for that
  environment.
- Supabase URL and public key should point to separate local/dev, staging, and
  production projects.
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` should use separate project IDs for
  staging and production when possible.
- Monitoring and alert environment labels should be `development`, `staging`,
  and `production` respectively.
- Release labels should identify the exact build deployed to each environment.
- Any contract addresses or ABI references must be test/staging references
  outside production.
- Internal allowlists must use staging users for staging and should not be used
  as production admin permissions.

## Production Preflight

- Confirm every `NEXT_PUBLIC_*` value is safe to expose in browser source.
- Confirm no server-only secret appears in `.env.local`, Vercel public vars, or
  client-side code.
- Confirm production uses `NEXT_PUBLIC_STRATEGY_DATA_MODE=supabase`.
- Confirm `KDEXIT_LIVE_EXECUTION_KILL_SWITCH=true`.
- Confirm `NEXT_PUBLIC_KDEXIT_LIVE_EXECUTION_MODE=false`.
- Confirm watcher simulation is not enabled in production.
- Confirm alerting and monitoring are either disabled or have registered
  transports with sanitized context.
- Confirm `.env.example` remains placeholder-only and contains no real project
  values.
