# Phase 3 Watcher Module

This module is scaffolding for KDEXIT Phase 3. It defines internal boundaries for watcher-driven automation without implementing any live onchain execution.

## Location

Watcher code lives in `lib/watcher/`.

## Boundaries

### `strategy-selection.ts`

Owns:

- deciding which strategies are eligible for evaluation right now
- filtering by strategy lifecycle and schedule metadata

Does not own:

- price lookup
- trigger math
- execution creation

### `trigger-evaluator.ts`

Owns:

- pure trigger evaluation against market observations
- blocked, no-trigger, and triggered outcomes

Does not own:

- database writes
- retries
- execution dispatch

### `execution-attempts.ts`

Owns:

- attempt numbering
- simulation-attempt payload construction

Does not own:

- database persistence
- onchain submission

### `simulation.ts`

Owns:

- simulation-only orchestration
- calling repository interfaces in the expected order
- updating strategy evaluation timestamps
- creating simulation-only execution attempts
- finalizing simulation attempts as `simulated` or `failed`

Does not own:

- wallet signing
- contract calls
- real execution

### `market-data.ts`

Owns:

- static market observations for dry-run flows
- mapping manual simulation inputs to strategy lookups

Does not own:

- price polling
- external market integrations

### `repositories.ts`

Owns:

- adapting authenticated Supabase access into watcher repository contracts

Does not own:

- business rules
- trigger evaluation
- market data decisions

## Repository Contracts

The watcher module depends on repository interfaces defined in `lib/watcher/types.ts`.

Current required contracts:

- `WatcherStrategyRepository`
- `WatcherExecutionAttemptRepository`
- `WatcherMarketDataProvider`

This keeps watcher logic independent from:

- Next route handlers
- React components
- Supabase client shape
- future worker runtime details

## Safe Defaults

- simulation mode is the default path
- `/api/internal/watcher/simulate` is authenticated, non-production only, and dry-run only
- `/api/execution-attempts?mode=simulation` is the canonical read path for watcher simulation history
- there is no public `/api/watcher/simulate` execution-style route
- production requests return `404`
- all environments must explicitly enable watcher simulation with `KDEXIT_ENABLE_WATCHER_SIMULATION=true`
- `KDEXIT_ENABLE_INTERNAL_WATCHER_SIMULATION` remains a legacy fallback env name for compatibility
- staging/preview access can be narrowed further with `KDEXIT_INTERNAL_ADMIN_USER_IDS` or `KDEXIT_INTERNAL_ADMIN_EMAILS`
- simulation requires caller-supplied market observations
- triggered simulations create `execution_attempts` rows with `simulation_mode = true`
- those attempts move from `evaluating` to `simulated` or `failed`
- no module here submits a transaction
- no module here signs with a wallet
- no module here calls onchain contracts
- live execution remains disabled by default and separately guarded by centralized Phase 5 readiness flags

## Intended Next Step

When the worker process is introduced, it should compose:

1. repository adapters backed by worker-safe data access modules
2. a market data provider
3. `runWatcherSimulation()` for dry-run execution flow

That allows the team to validate watcher lifecycle behavior before any contract or wallet execution path is enabled.
