# Internal Execution Worker Scaffold

Status: scaffold only. Live execution remains disabled.

This document describes the Phase 8 Step 5 backend execution-worker foundation added to `kdexit-web`. It prepares the app to move from watcher simulation toward a controlled internal execution beta, but it does not sign transactions, hold private keys, submit contract writes, approve tokens, or enable public execution.

## What Exists

Server-only worker code lives in `lib/execution-worker/`.

The scaffold includes:

- disabled-by-default worker config
- dry-run-only execution pipeline
- Supabase repository adapter for worker reads/writes
- static market-observation provider for manual dry runs
- prepared contract execution payload shape
- deterministic payload hash generation
- blocked/pending/simulated execution-attempt metadata
- internal API route for dry-run invocation
- dashboard visibility for blocked reasons, dry-run mode, payload hash, and reconciliation status

Internal route:

```text
POST /api/internal/execution-worker/dry-run
```

The route is unavailable in production, requires an authenticated user, requires the user to be allowlisted outside development, and requires dry-run mode to be explicitly enabled.

## Worker Lifecycle

The dry-run worker pipeline is:

1. Read server-only worker config.
2. Refuse to run unless dry-run is enabled and live/write modes are disabled.
3. Select eligible strategies for the authenticated user.
4. Check readiness gates and keep the global kill-switch posture intact.
5. Validate that a primary linked wallet exists for the strategy chain.
6. Validate strategy authorization metadata exists and is marked `authorized`.
7. Evaluate trigger conditions using caller-supplied market observations.
8. Create an `execution_attempts` row for triggered strategies.
9. Prepare a future contract execution payload.
10. Store only the payload hash, not a transaction.
11. Mark the attempt as `simulated` or `blocked`.
12. Leave reconciliation as `not_required` because no chain transaction exists.

## Dry-Run Mode

Dry-run mode is intentionally conservative:

- `KDEXIT_EXECUTION_WORKER_DRY_RUN_ENABLED` defaults to `false`.
- `KDEXIT_EXECUTION_WORKER_CONTRACT_WRITE_MODE` must remain `false`.
- `KDEXIT_EXECUTION_WORKER_LIVE_EXECUTION_MODE` must remain `false`.
- `KDEXIT_LIVE_EXECUTION_KILL_SWITCH` must remain on.
- No private key env vars exist.
- No relayer config exists.
- No `writeContract`, `sendTransaction`, wallet client, or signer is imported.

Dry-run attempts use:

- `execution_mode = dry_run`
- `simulation_mode = true`
- `transaction_hash = null`
- `reconciliation_status = not_required`

## Database Additions

The scaffold adds strategy metadata:

- `authorization_status`
- `authorization_reference`
- `execution_mode`

The scaffold adds execution-attempt metadata:

- `execution_mode`
- `prepared_payload_hash`
- `blocked_reason`
- `reconciliation_status`
- `reconciliation_detail`

The execution-attempt status enum now includes:

- `pending`
- `blocked`

RLS hardening keeps browser-visible writes in simulation mode and prevents public-client activation of authorized/dry-run strategy records.

## Internal API Payload

Example dry-run payload:

```json
{
  "strategyIds": ["strategy-id"],
  "observations": [
    {
      "strategyId": "strategy-id",
      "chainId": 56,
      "tokenAddress": "0x0000000000000000000000000000000000000000",
      "observedPrice": 650,
      "source": "manual_internal_dry_run",
      "isStale": false
    }
  ]
}
```

## What Remains Missing Before Live Execution

Before any real token movement, KDEXIT still needs:

- service/worker runtime outside a user-triggered internal route
- service-role access model and scoped repository policies
- private-key or relayer key management design
- operator key custody and rotation runbook
- contract read layer for registry/controller/adapter/allowance checks
- typed EIP-712 authorization verification
- token allowance or Permit2 verification
- execution gateway with strict preflight checks
- chain RPC configuration
- nonce and gas management
- `writeContract` or transaction submission implementation
- transaction receipt/event reconciliation
- monitoring transport and alert destination
- emergency controls tested against live infrastructure
- fork/testnet drills
- security review of contracts and worker

## Why No Private Keys Or Transactions Exist Yet

The current contracts workspace may now have EIP-712 authorization, controller restrictions, allowlists, mocks, and adapter scaffolding, but the web app still must prove the backend execution lifecycle safely before it can touch funds.

Private keys and transaction submission are deliberately excluded because:

- the worker access model is not finalized
- reconciliation is not implemented
- monitoring is still no-op without a transport
- operator emergency procedures are not proven
- public-client RLS must remain unable to create live execution state
- the first internal beta should fail closed at every step

Any future PR that adds signing or transaction submission must update this document, add tests for disabled defaults, and prove that live execution cannot be reached from public UI or browser-owned persistence.
