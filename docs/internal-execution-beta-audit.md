# KDEXIT Implementation And Capability Audit

Audit date: April 30, 2026

Purpose: provide a complete, practical inventory of the current `kdexit-web` application so the team can prepare for a tightly controlled internal execution beta without confusing the current dashboard with a live execution system.

Important conclusion: the current app is an authenticated strategy-planning, wallet-linking, readiness, and simulation dashboard. It does not currently move tokens, request token approvals, submit swaps, write execution contracts, run a production watcher, or operate a relayer.

## Current State Inventory

### 1. Everything Currently Implemented And Working

#### Public web app

- Next.js App Router application using Next `16.2.2`, React `19.2.4`, TypeScript, Tailwind CSS, and file-system routes under `app/`.
- Landing page at `/` composed from `components/landing/*` with navigation, product explanation, trust sections, and CTA.
- Shared layout, top navigation, footer, global styles, and client providers.
- Basic static assets in `public/`.

#### Authentication

- Email/password authentication screens at `/login` and `/signup`.
- Supabase browser client sign-in, sign-up, email confirmation redirect support, and post-auth redirect handling.
- `/auth/callback` exchanges Supabase auth codes and redirects to a sanitized local path.
- `/dashboard` is server-protected when Supabase env is configured; unauthenticated users are redirected to `/login?next=%2Fdashboard`.
- `proxy.ts` refreshes Supabase auth cookies on request when Supabase env exists.
- Dashboard displays a clear configuration state when Supabase env is missing instead of crashing.

#### Dashboard shell and user workflows

- Authenticated dashboard client shell with tabs/sections: overview, strategies, activity, audit, and settings.
- Dashboard hydration loads strategies, execution/activity records, and execution attempts.
- Loading, retry, and partial failure panels exist for dashboard data-load issues.
- Summary metrics display total strategies, active/paused strategy counts, execution count, and simulation-attempt count.
- Quick actions and settings surfaces explain current execution-readiness status.

#### Strategy planning records

- Strategy creation, edit, pause, resume, and delete UI exists.
- Strategy form validates token name, token symbol, optional EVM token address, chain/chain ID consistency, sell percentage, take-profit price, stop-loss price, slippage, and notes.
- Strategy records support:
  - `token_name`
  - `token_symbol`
  - `token_address`
  - `chain`
  - `chain_id`
  - `sell_percentage`
  - `take_profit_price`
  - `stop_loss_price`
  - `trigger_enabled`
  - `slippage`
  - `notes`
  - `status`
  - watcher evaluation metadata
  - `simulation_mode`
- Strategy changes also create dashboard activity records in `executions` with trigger types such as `strategy_created`, `strategy_updated`, `strategy_paused`, `strategy_resumed`, and `strategy_deleted`.
- New strategies are normalized to paused and trigger-disabled when Phase 5 execution gates are not enabled.

#### API routes

- Authenticated API routes exist for:
  - `GET /api/strategies`
  - `POST /api/strategies`
  - `GET /api/strategies/[strategyId]`
  - `PATCH /api/strategies/[strategyId]`
  - `DELETE /api/strategies/[strategyId]`
  - `GET /api/executions`
  - `POST /api/executions`
  - `GET /api/executions/[executionId]`
  - `PATCH /api/executions/[executionId]`
  - `DELETE /api/executions/[executionId]`
  - `GET /api/execution-attempts?mode=all|simulation|live`
  - `GET /api/wallet-links`
  - `POST /api/wallet-links`
  - `GET /api/wallet-links/[walletLinkId]`
  - `PATCH /api/wallet-links/[walletLinkId]`
  - `DELETE /api/wallet-links/[walletLinkId]`
  - `POST /api/internal/watcher/simulate`
- API responses use a consistent `{ ok, data/meta }` or `{ ok, error }` JSON envelope.
- API routes validate request bodies through local validation modules before database writes.
- Mutation routes check same-origin requests when an `Origin` header is present.
- API routes scope reads/writes to the authenticated Supabase user.

#### Supabase persistence

- Supabase schema migrations define:
  - `profiles`
  - `strategies`
  - `executions`
  - `wallet_links`
  - `execution_attempts`
  - enum types for strategy status, execution trigger type, execution status, strategy evaluation state, and execution-attempt status.
- RLS is enabled on the application tables.
- Owner-based RLS policies are present for user-scoped select/insert/update/delete operations.
- Security-hardening migration restricts public-client strategy writes so they cannot set `trigger_enabled = true` or `status = active`.
- Security-hardening migration restricts public-client `executions` and `execution_attempts` writes so they cannot attach transaction hashes.
- Security-hardening migration restricts public-client `execution_attempts` writes to `simulation_mode = true`.
- Database constraints enforce important field limits, EVM address format checks, positive chain IDs, price rules, slippage bounds, and one primary wallet link per user.

#### Data access model

- `NEXT_PUBLIC_STRATEGY_DATA_MODE=supabase` uses authenticated API routes for dashboard mutations.
- Missing or non-Supabase mode falls back to `localStorage` mode.
- `lib/dashboard/mutation-gateway.ts` centralizes transport choice between client repository and API routes.
- `lib/dashboard/repository.ts` maps Supabase records into dashboard UI models.
- Legacy/local storage helpers and mock dashboard data remain available for local fallback.

#### Wallet session and wallet linking

- Wagmi + WalletConnect foundation exists.
- Wallet connection uses BNB Chain as the enabled wallet chain.
- WalletConnect is disabled safely when `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is missing or invalid.
- Wallet UI distinguishes:
  - wallet session connected/disconnected state
  - current session address
  - current session network
  - current connector
  - linked-wallet records saved to the authenticated account
- Wallet linking is explicit; connecting a wallet does not automatically link it.
- Linked wallets support create, list, set primary, and delete.
- Duplicate wallet links are blocked per user/address/chain.
- Wallet addresses are normalized to lowercase in the client repository path and constrained lowercase by migration.

#### Watcher simulation

- Watcher module exists under `lib/watcher/`.
- Internal execution-worker scaffold exists under `lib/execution-worker/` for dry-run-only preparation of future execution payload hashes.
- Strategy selection checks active status, trigger-enabled state, and evaluation schedule.
- Trigger evaluator handles blocked, idle/no-market-data, stale-market-data, no-trigger, take-profit, and stop-loss outcomes.
- Simulation decision logic creates execution-attempt payloads only when a trigger fires.
- Simulation orchestration records strategy evaluation timestamps and creates/finalizes `execution_attempts` rows as `simulated` or `failed`.
- Manual simulation route composes authenticated Supabase repositories with caller-supplied static market observations.
- Simulation history is visible in dashboard activity/audit surfaces.
- Internal execution-worker dry-run attempts can be stored with blocked reasons, payload hashes, execution mode, and reconciliation status, but no transaction is signed or sent.

#### Execution-readiness and feature gates

- Centralized execution-readiness flags exist:
  - `NEXT_PUBLIC_KDEXIT_DASHBOARD_BETA_MODE`
  - `NEXT_PUBLIC_KDEXIT_WALLET_LINKED_BETA_MODE`
  - `NEXT_PUBLIC_KDEXIT_CONTRACT_READINESS_MODE`
  - `NEXT_PUBLIC_KDEXIT_LIVE_EXECUTION_MODE`
  - `KDEXIT_ENABLE_WATCHER_SIMULATION`
  - `KDEXIT_LIVE_EXECUTION_KILL_SWITCH`
- Readiness status resolves to:
  - `public_execution_unavailable`
  - `simulation_only`
  - `contract_ready_execution_disabled`
  - `internal_beta_execution_only`
- UI gates derive execution-control visibility, strategy activation availability, execution preference editing availability, watcher simulation visibility, and live execution state.
- Contract-readiness metadata validates supported chain IDs, registry/controller addresses, and ABI references.
- Contract-readiness live execution is hard-coded off.

#### Monitoring and alerting foundations

- Vendor-neutral monitoring boundary exists for client and server.
- Monitoring is no-op unless explicitly enabled and a transport is registered.
- Alerting boundary exists with scenarios for API mutation failure, watcher simulation failure, repeated failures, wallet-linking errors, and readiness-gate misconfiguration.
- Alerting is no-op unless explicitly enabled and a transport is registered.
- Alert contexts sanitize secret-like keys and redact wallet addresses.
- Dashboard invokes readiness-gate misconfiguration alert checks.
- API and watcher paths call alert helper functions on selected failures.

#### Existing operational documentation

- Existing docs cover technical architecture, contract architecture, Phase 3 watcher boundaries, Phase 5 authorization model, monitoring readiness, alerting plan, deployment readiness, production env checklist, production launch checklist, and incident response.

### 2. Everything Partially Implemented Or Scaffold-Only

- API routes are implemented for dashboard records, but they are not a complete execution backend.
- `executions` table currently stores strategy activity/dashboard history and possible future execution metadata, not verified onchain execution outcomes.
- `execution_attempts` table supports simulation and has statuses for future live states (`submitted`, `confirmed`, etc.), but the app only creates simulation attempts today.
- Contract-readiness support stores/display-checks public config references, but there is no ABI import, contract client, contract read layer, bytecode verification, or contract write path.
- Internal execution controls panel exists only as disabled placeholder UI.
- Monitoring and alerting abstractions exist, but no vendor transport is registered.
- Operational audit panel is a useful read-only dashboard view, but it is not a full immutable audit log.
- Wallet linking supports account association, but not wallet ownership proof beyond the current connected session and not execution authorization.
- `localStorage` mode remains for fallback/dev, but internal beta should use Supabase mode.
- The watcher module is structured for future worker composition, but there is no production background worker or scheduler in this repo.
- Market data provider is static/manual for simulation; no live price feed integration exists.
- Strategy lifecycle is sufficient for planning and gating, but not for onchain authorization, execution, reconciliation, revocation, or expiry.

### 3. Everything Intentionally Disabled

- Live execution is disabled.
- Contract writes are disabled.
- Token approvals are disabled.
- Swap routing is disabled.
- Relayer/private-key flow is absent and intentionally not imported.
- Strategy activation is disabled unless future execution gates say otherwise; current hard-coded contract readiness prevents true live activation.
- Execution preference editing is disabled until internal beta gates are ready.
- Watcher simulation is disabled unless `KDEXIT_ENABLE_WATCHER_SIMULATION=true`.
- Internal watcher simulation route returns `404` in production regardless of allowlist or flags.
- Wallet connection is disabled if WalletConnect project ID is absent or invalid.
- Monitoring and alerting are disabled unless flags and transports are configured.
- Contract-readiness mode defaults off.
- Dashboard beta and wallet-linked beta flags default off.
- Live execution kill switch defaults on.
- Execution-worker dry-run route defaults off and refuses live or contract-write modes.

### 4. Current Frontend Architecture

- Next.js App Router with server components for route-level auth/config checks and client components for interactive dashboard/wallet forms.
- `app/layout.tsx` wraps the app with shared providers.
- `components/shared/providers.tsx` provides Wagmi and React Query.
- Landing page is componentized under `components/landing`.
- Auth pages reuse `AuthPageShell` and `EmailAuthForm`.
- Dashboard is split into:
  - `app/dashboard/page.tsx` for server auth/profile/readiness
  - `components/dashboard/dashboard-page-client.tsx` for client dashboard state composition
  - focused panels for summary, quick actions, strategy management, activity, audit, settings, wallet status, readiness, and internal disabled controls
  - `lib/dashboard/use-dashboard-controller.ts` as the main dashboard state/controller hook
- Strategy form owns client-side validation and produces UI `Strategy` objects.
- Wallet UI is split between session connection (`useWalletConnection`, `ConnectWalletButton`) and linked-wallet persistence (`useLinkedWallets`, wallet panels).

### 5. Current Backend/API Architecture

- Backend is currently Next route handlers plus Supabase.
- There is no separate backend service, job runner, queue, worker, keeper, or relayer process.
- Route auth is centralized in `lib/api/route-auth.ts`.
- HTTP response formatting is centralized in `lib/api/http.ts`.
- Payload validation is centralized in `lib/api/validation/*`.
- API client wrappers live in `lib/dashboard/api-client.ts`.
- Dashboard mutations are routed through `lib/dashboard/mutation-gateway.ts`, which allows current UI code to move between local/browser persistence and authenticated API routes.
- Internal watcher simulation route calls `runAuthenticatedWatcherSimulation()`, which composes Supabase repository adapters and static market observations.

### 6. Current Authentication And Authorization Model

- Supabase Auth is the authentication provider.
- Email/password login and signup are implemented.
- Auth cookies are refreshed through the Next proxy.
- Dashboard access requires a Supabase user when Supabase env is configured.
- API routes require an authenticated Supabase user.
- Authorization is owner-based:
  - route handlers add or check `user_id = auth.user.id`
  - Supabase RLS enforces `auth.uid() = user_id` or `auth.uid() = id`
- Internal watcher simulation has extra checks:
  - unavailable in production
  - server flag must be enabled
  - non-development environments require user ID or email allowlist
- There is no role-based admin dashboard.
- There is no team/multi-tenant organization model.
- There is no execution authorization model yet.

### 7. Current Supabase Schema Usage And RLS Assumptions

- `profiles`: one row per auth user. The signup trigger was removed, and the dashboard now bootstraps profiles server-side with an upsert.
- `strategies`: user-owned offchain strategy/planning records with validation constraints and watcher evaluation metadata.
- `executions`: user-owned dashboard activity/history records. These are not canonical onchain execution records today.
- `wallet_links`: user-owned account association records for wallet address, chain ID, connector, label, and primary marker.
- `execution_attempts`: user-owned watcher attempt records. Current writes are simulation-only.
- RLS assumptions:
  - users can only access their own rows
  - public-client strategy writes cannot activate live triggers
  - public-client execution writes cannot include transaction hashes
  - public-client execution attempts must remain simulation-mode
  - service-role or future backend worker access would need its own reviewed policy/privilege model

### 8. Current Wallet-Linking Flow And Limitations

Current flow:

1. User signs in with Supabase Auth.
2. User connects a wallet session through Wagmi.
3. UI displays session address, chain, connector, and linked-state comparison.
4. User explicitly clicks to link the current session to their account.
5. API stores `wallet_address`, `chain_id`, optional `connector_name`, optional label, and primary flag.
6. User can set primary or remove the account link.

Limitations:

- Linking a wallet is not execution authorization.
- No typed-message ownership challenge is stored.
- No nonce/signature proof is persisted.
- No onchain permission, token allowance, Permit2 permission, smart-account policy, or strategy authorization is created.
- No chain-switching UX beyond the configured Wagmi chain foundation.
- Only BNB Chain is enabled for wallet connection; Polygon and Ethereum are listed in the registry but disabled.
- Linked wallet history is not separately audited; the audit panel shows current records only.

### 9. Current Strategy Lifecycle Flow

Current dashboard lifecycle:

1. User creates a strategy with token metadata, chain, sell percentage, take-profit and/or stop-loss threshold, optional address, slippage, notes, and trigger preference.
2. If Phase 5 activation gates are disabled, the strategy is saved as `paused` with `trigger_enabled=false`.
3. API and RLS also enforce disabled activation defaults.
4. User may edit, pause, delete, or attempt to resume.
5. Resume is blocked when strategy activation is disabled.
6. Each dashboard lifecycle operation creates an `executions` activity row for history.
7. Watcher simulation only considers strategies that are active, trigger-enabled, simulation-mode, and due for evaluation.

Limitations:

- There is no durable distinction between draft, saved offchain, authorized onchain, watching, execution pending, executed, revoked, expired, or reconciled.
- There is no onchain strategy ID.
- There is no strategy authorization transaction hash.
- There is no strategy owner wallet binding beyond authenticated user rows and optional wallet links.

### 10. Current Execution-Attempt And Watcher-Simulation Flow

Current simulation flow:

1. Authorized internal caller posts manual observations to `/api/internal/watcher/simulate`.
2. Route validates payload and internal access.
3. Simulation repository selects user-owned strategies where:
   - `simulation_mode=true`
   - `status=active`
   - `trigger_enabled=true`
   - `next_evaluation_at` is null or due
   - optional requested strategy IDs match
4. Static market observations are matched to strategy IDs.
5. Trigger evaluator returns blocked, idle, no-trigger, or triggered result.
6. Strategy evaluation metadata is updated.
7. If triggered, an `execution_attempts` row is created with `simulation_mode=true` and status `evaluating`.
8. The attempt is finalized as `simulated` or `failed`.
9. Dashboard reads simulation attempts through `/api/execution-attempts?mode=simulation`.

Limitations:

- No cron/scheduler/worker exists.
- No live market data exists.
- No duplicate-execution protection beyond attempt numbering exists.
- No onchain transaction is submitted.
- No confirmation/reorg handling exists.
- No execution retry policy beyond fields exists.
- No production simulation endpoint exists.

### 11. Current Feature-Flag And Readiness-Gate System

- Public flags drive dashboard/readiness presentation.
- Server flags control watcher simulation and kill-switch state.
- `LIVE_CONTRACT_EXECUTION_ENABLED` is a code constant set to `false`.
- `liveExecutionEnabled` ultimately derives from contract readiness and that hard-coded false constant, so no environment-only combination can enable actual live execution.
- UI and API both use Phase 5 gates to keep strategy activation disabled.
- RLS hardening protects against direct public-client bypass of the disabled execution boundary.

### 12. Current Monitoring, Alerting, And Operational-Readiness Systems

Implemented:

- Monitoring no-op boundary with client/server config.
- Alerting no-op boundary with sanitizer.
- Alert helpers wired into selected API/wallet/watcher/readiness failure paths.
- Operational audit panel summarizes strategy activity, watcher simulation attempts, wallet link visibility, readiness flags, and data-load failures.
- Deployment, production env, incident response, monitoring, and alerting docs exist.

Missing:

- No Sentry/Datadog/OTel/vendor transport.
- No persistent application log store.
- No alert destination.
- No uptime checks.
- No background-worker health checks.
- No execution-specific dashboards.
- No onchain event indexer.
- No reconciliation alerting because live execution does not exist yet.

### 13. Current Deployment Readiness

Ready for a non-execution authenticated beta if configured carefully:

- Next build/lint scripts exist.
- Environment variable checklist exists.
- Supabase migration set exists.
- Vercel-style production guidance exists.
- Beta deployment readiness checklist exists.
- Incident response doc exists.
- Safe defaults keep live execution off.

Not ready for internal execution beta:

- No contracts.
- No execution gateway.
- No wallet authorization model.
- No relayer/keeper/worker.
- No reconciliation.
- No real monitoring/alert transport.
- No production-grade runbooks for token movement.

### 14. Current Security Assumptions And Boundaries

- Browser receives only public Supabase key, WalletConnect project ID, public app URL, and public readiness metadata.
- Supabase RLS is the core data isolation boundary.
- API routes re-check authenticated ownership.
- Same-origin mutation check reduces cross-origin mutation risk where `Origin` exists.
- Alert/monitoring sanitizers avoid secret-like keys and raw wallet addresses.
- Wallet linking is explicitly account context only.
- Strategy database state is not treated as permission to execute.
- Contract readiness is informational only.
- Live execution cannot be enabled through env alone because contract execution is hard-coded off.
- Internal watcher simulation is unavailable in production.

Security caveats:

- There is no CSRF token system beyond same-origin checks and SameSite cookie behavior.
- There is no rate limiting in app code.
- There is no centralized audit log for every mutation.
- There is no admin/cohort authorization model for beta users except internal watcher simulation allowlists.
- Any future service-role backend must be designed carefully because current RLS is public-client oriented.

### 15. Current Dangerous Functionality Intentionally NOT Implemented

The repo intentionally does not implement:

- token approvals
- Permit2 approvals
- wallet signature collection for execution intent
- smart-account policy setup
- onchain strategy registration
- contract writes
- live swaps
- DEX router calls
- private-key custody
- server-side signing
- relayer/keeper transaction submission
- broad token allowances
- execution retries against live funds
- onchain transaction reconciliation
- production watcher automation
- cross-chain execution
- liquidation/stop-loss trading
- public live execution controls

# INTERNAL EXECUTION BETA GAP ANALYSIS

## 1. What Is Still Missing Before KDEXIT Can Support A Tightly Controlled Internal Execution Beta

KDEXIT needs a real execution system, not just more UI gates. The minimum missing foundation is:

- audited or at least internally reviewed contracts on one testnet/mainnet target
- explicit user authorization flow
- execution gateway that refuses unsafe requests
- worker/relayer service with narrow credentials and bounded permissions
- market data source and trigger evaluation policy suitable for live decisions
- transaction submission and confirmation tracking
- onchain/offchain reconciliation
- operational monitoring and emergency controls
- cohort allowlisting and support/runbook process

## 2. Backend Systems Still Missing

- Dedicated execution service or worker runtime.
- Scheduler/queue for strategy evaluation.
- Market data ingestion with source selection, staleness rules, and fallback policy.
- Contract read layer for strategy, allowance, registry, controller, and token state.
- Execution gateway with preflight checks and idempotency.
- Relayer/keeper transaction submission service.
- Transaction status indexer/reconciler.
- Durable audit log for every authorization, evaluation, attempt, transaction, confirmation, failure, pause, revoke, and operator action.
- Admin/cohort management.
- Rate limiting and abuse controls.

## 3. API Or Repository Work Still Missing

- Server-side repositories safe for worker/service-role use.
- API endpoints for execution authorization setup and state reads.
- API endpoint or service command for arming a strategy after authorization.
- API endpoint for revocation/pause synchronization.
- Repository fields for authorization status, onchain strategy ID, contract address, authorization transaction, expiration, and revocation.
- Idempotency keys for live execution attempts.
- Strict route-level tests proving disabled defaults and authorization failures.
- Migration from dashboard activity-style `executions` to canonical execution records or a separate canonical table.

## 4. Wallet Authorization Model Still Missing

Wallet linking must be extended into separate authorization states:

- wallet ownership proof, preferably with nonce-based typed-data signature
- explicit strategy intent signature and/or onchain registry transaction
- token allowance or Permit2 permission scoped to token, amount, spender, and expiry
- execution controller authorization
- revocation detection
- connected-wallet and linked-wallet match checks before setup actions
- clear UI state for connected, linked, authorized, armed, revoked, expired, and paused

## 5. Approval/Permission Flow Still Missing

Before real token movement:

- User must review exactly what KDEXIT can do.
- User must approve only a narrow spender/controller.
- Approval amount must be bounded by strategy amount or a tight internal-beta cap.
- Approval should expire or be revocable.
- UI must verify allowance/policy after the transaction confirms.
- Backend must verify the same allowance/policy before every execution.
- Strategy should not become executable until authorization and allowance are confirmed.

## 6. Relayer Or Execution-Service Architecture Still Missing

The first internal beta needs a service with:

- no custody of user assets
- no broad private-key authority over user funds
- narrow operator key that can only call reviewed execution contracts
- chain-specific RPC configuration
- nonce management
- gas policy
- transaction replacement policy
- failure classification
- kill-switch check before every submission
- allowlist check before every submission
- full structured logs and alerting

## 7. Reconciliation Logic Still Missing

KDEXIT must reconcile:

- submitted transaction hash
- transaction receipt status
- emitted contract events
- strategy execution state
- actual token transfer/swap result where applicable
- database attempt status
- user-facing execution history
- failed/reverted/stuck/pending transactions
- duplicate or replayed submissions
- revocation/allowance changes between evaluation and execution

No dashboard record should claim success until confirmed from chain state.

## 8. Monitoring/Alerting Gaps Remaining

- Real transport for alerts and monitoring.
- On-call destination and escalation policy.
- Worker heartbeat.
- Queue depth and stuck-job alerts.
- RPC failure alerts.
- Market data stale/degraded alerts.
- Execution submission failure alerts.
- Confirmation timeout alerts.
- Reconciliation mismatch alerts.
- Kill-switch state monitoring.
- Allowance/permission drift monitoring.
- Per-beta-user impact reporting.

## 9. Operational Or Security Blockers Still Existing

- No contract system exists in this repo.
- No security review exists for execution contracts or relayer.
- No beta operator model exists.
- No production-safe service-role access model exists.
- No rate limiting exists.
- No immutable audit trail exists.
- No rollback plan for partially executed onchain actions exists.
- No user support workflow for stuck, reverted, or partially filled execution exists.
- No legal/product acceptance flow for internal users exists.
- No documented maximum loss/exposure cap exists for beta wallets.

## 10. Must Implement BEFORE Any Real Token Movement

- One-chain, one-token, one-DEX execution contract or tightly constrained integration path.
- Explicit wallet authorization and revocation flow.
- Contract read/preflight checks.
- Execution gateway with deny-by-default policy.
- Internal beta allowlist.
- Global kill switch enforced in the execution service, not only UI.
- Per-user and per-strategy notional caps.
- Simulation/staging test coverage with fork tests or testnet drills.
- Transaction submission, confirmation, and reconciliation.
- Real alerting transport and on-call process.
- Incident runbook for failed, stuck, or unintended execution.
- Tests proving public users cannot activate execution.

## 11. Can Remain Deferred Until After Internal Beta

- Public beta.
- Multi-chain execution.
- Multiple DEX venues.
- Complex route optimization.
- Cross-chain strategy support.
- Advanced portfolio analytics.
- Mobile-native wallet UX polish beyond basic support.
- Fee module.
- Sophisticated admin console.
- Fully automated public keeper network.
- Rich alert routing by customer segment.
- Advanced tax/performance reporting.

# RECOMMENDED EXECUTION-BETA ROADMAP

## Safest Minimal Internal Execution Beta Scope

The first internal execution beta should be extremely narrow:

- internal staff only
- allowlisted Supabase users only
- allowlisted wallet addresses only
- one chain
- one DEX
- one or two pre-approved tokens
- tiny maximum notional per execution
- tiny maximum daily notional per wallet
- no public marketing copy
- no automatic expansion from simulation to live

Recommended first beta objective: prove the complete authorization, trigger, execution, confirmation, reconciliation, alerting, and emergency-stop loop with minimal funds and trusted internal wallets.

## Exactly How Narrow The First Beta Should Be

- 3 to 5 internal users.
- 1 wallet per user.
- 1 strategy per wallet at a time.
- 1 active token pair at launch.
- Manual operator review before enabling each strategy.
- Start on testnet or fork rehearsal, then graduate to mainnet with trivial notional.
- Maximum first live mainnet execution: an amount the team is comfortable losing during system validation.
- No unattended overnight execution until monitoring and incident response are proven.

## Recommended Supported Chains

First beta:

- BNB Chain only, because it is already the enabled wallet chain in the app.

Defer:

- Polygon.
- Ethereum.
- Any additional EVM chain.
- Any non-EVM chain.

## Recommended Supported DEX Scope

First beta:

- One PancakeSwap-style router/integration on BNB Chain.
- Fixed, reviewed route shape.
- No route optimization.
- No aggregator.
- No multi-hop unless required for the one selected token pair and explicitly tested.

Defer:

- 1inch/0x aggregators.
- Multiple venues.
- Dynamic pathfinding.
- Cross-chain or bridge-based routes.

## Recommended Supported Token Scope

First beta:

- Start with a highly liquid, standard BEP-20 token paired against WBNB or a stablecoin.
- Exclude fee-on-transfer, rebasing, pausable, blacklistable, tax, honeypot-risk, or non-standard tokens.
- Require token allowlist in backend and contract/gateway config.
- Require exact token address, chain ID, and decimals verification.

Defer:

- Arbitrary user-entered tokens.
- Long-tail tokens.
- Illiquid tokens.
- Tokens with transfer hooks/taxes.
- NFT or LP-token exits.

## Recommended Feature Flags

Keep existing flags and add stricter server-only flags before live execution:

- Keep `NEXT_PUBLIC_KDEXIT_DASHBOARD_BETA_MODE=true` only in internal beta environment.
- Keep `NEXT_PUBLIC_KDEXIT_WALLET_LINKED_BETA_MODE=true` only for allowlisted users.
- Keep `NEXT_PUBLIC_KDEXIT_CONTRACT_READINESS_MODE=true` only after contracts are deployed and verified.
- Keep `NEXT_PUBLIC_KDEXIT_LIVE_EXECUTION_MODE=false` until the live service is ready.
- Keep `KDEXIT_LIVE_EXECUTION_KILL_SWITCH=true` until the exact beta execution window.
- Add server-only `KDEXIT_INTERNAL_EXECUTION_BETA_ENABLED`.
- Add server-only `KDEXIT_ALLOWED_EXECUTION_USER_IDS`.
- Add server-only `KDEXIT_ALLOWED_EXECUTION_WALLETS`.
- Add server-only `KDEXIT_ALLOWED_EXECUTION_CHAIN_IDS`.
- Add server-only `KDEXIT_ALLOWED_EXECUTION_TOKEN_ADDRESSES`.
- Add server-only `KDEXIT_MAX_EXECUTION_NOTIONAL_USD`.
- Add server-only `KDEXIT_MAX_DAILY_NOTIONAL_USD`.
- Add server-only `KDEXIT_REQUIRE_MANUAL_EXECUTION_APPROVAL=true` for the first beta.

## Recommended Operational Safeguards

- Deny-by-default execution gateway.
- Internal user and wallet allowlists.
- Per-strategy manual approval.
- Token allowlist.
- Chain allowlist.
- DEX/router allowlist.
- Notional caps.
- Slippage caps.
- Fresh market data requirement.
- Fresh allowance/authorization verification before each execution.
- Idempotency key per trigger/attempt.
- Duplicate execution lock per strategy.
- Confirmation requirement before marking success.
- Structured audit record for every state transition.
- Daily beta review with all attempts and outcomes.

## Recommended Emergency Controls

- Global kill switch checked in worker and execution gateway.
- Per-user execution disable.
- Per-wallet execution disable.
- Per-strategy pause.
- Per-token disable.
- Per-chain disable.
- Operator key pause/rotation runbook.
- Contract pause if the contract architecture supports it.
- RPC/provider fail-closed behavior.
- Market-data stale fail-closed behavior.
- Manual cancellation/escalation path for pending transactions.

## Recommended Deployment And Testing Stages

1. Current non-execution beta hardening
   - Keep live execution off.
   - Verify Supabase mode, RLS, auth, strategy records, wallet linking, audit UI, and simulation-only behavior.

2. Contract workspace and local tests
   - Build contracts in a sibling `kdexit-contracts` workspace.
   - Add unit, integration, invariant, and fork tests.
   - Export ABI/address artifacts for the web app.

3. Read-only contract integration
   - Web app reads deployed registry/controller state.
   - No writes yet.
   - Readiness UI reflects real contract references and bytecode/version checks.

4. Authorization setup on testnet
   - User signs setup transactions on testnet.
   - Dashboard records authorization status.
   - Revocation and pause flows are tested.

5. Worker dry run with real market data
   - Worker evaluates strategies and creates simulation attempts.
   - No transaction submission.
   - Alerts, logs, and dashboards are exercised.

6. Testnet live execution
   - Execute against testnet contracts and test tokens.
   - Reconcile receipts/events/database state.
   - Run failure drills.

7. Mainnet rehearsal with kill switch on
   - Deploy production config.
   - Verify allowlists, caps, monitoring, operator access, and emergency controls.
   - Do not submit transactions.

8. Mainnet internal execution beta window
   - Temporarily open server-only beta flag and kill switch under operator supervision.
   - Run one strategy and one tiny execution.
   - Confirm reconciliation before any second execution.

9. Post-run review
   - Compare database, logs, receipts, events, balances, and user dashboard state.
   - Fix gaps before expanding users, tokens, or notional caps.

## Final Readiness Assessment

Current `kdexit-web` is suitable for an internal non-execution beta and for rehearsing simulation/readiness workflows. It is not yet suitable for internal execution beta involving real token movement.

The safest next step is not to widen the UI. The safest next step is to build the missing execution backend, authorization model, contract boundary, relayer/worker, reconciliation, and operations layer while preserving the current disabled-by-default posture.
