# Phase 3 Prototype Boundaries

This repo now treats Phase 3 as a simulation-first automation prototype.

## Confirmed Live-Safety Boundaries

- No module sends wallet transactions.
- No module signs transactions for users.
- No module writes contracts or submits keeper calls.
- No module moves funds on behalf of a user.
- Watcher automation persists dry-run state only.

## Canonical Automation Data Paths

- Internal simulation trigger: `app/api/internal/watcher/simulate/route.ts`
- Simulation orchestration: `lib/watcher/manual-simulation.ts` -> `lib/watcher/simulation.ts`
- Simulation repositories: `lib/watcher/repositories.ts`
- Simulation history API: `app/api/execution-attempts/route.ts?mode=simulation`
- Dashboard simulation reader: `lib/dashboard/api-client.ts` and `lib/dashboard/repository.ts`

All current watcher attempt reads and writes are scoped to `simulation_mode = true`.

Phase 5 now adds centralized execution-readiness flags, but the safe default remains unchanged:

- dashboard beta mode is off by default
- wallet-linked beta mode is off by default
- contract readiness mode is off by default
- live execution mode is off by default
- watcher simulation is off unless explicitly enabled
- the live execution kill switch is on by default

## What Is Still Prototype-Only

- Watcher runs depend on caller-supplied observations instead of live market feeds.
- `execution_attempts` records are dry-run automation records, not transaction settlement records.
- `executions` records are still dashboard activity/history records and can include strategy lifecycle events such as create, pause, resume, and delete.
- Wallet connectivity is present for account and chain awareness, not trade execution.
- There is no worker process, no onchain permission model, no execution contract integration, and no reconciliation against live transaction receipts.
- Future live execution mode does not have an implementation path in this repo yet.
- Centralized readiness flags do not change those boundaries by themselves.
