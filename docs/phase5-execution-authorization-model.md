# Phase 5 Execution Authorization Model

## Purpose

This document explains the future authorization model KDEXIT will need before live execution can exist.

It is intentionally implementation-facing. The goal is to keep the current app safe while giving future Phase 5 work a clear boundary between:

- wallet linking
- offchain strategy records
- onchain authorization
- live execution

Current status: KDEXIT does not execute trades, move funds, submit swaps, request approvals, or write contracts from the dashboard.

## Wallet Linking Is Not Execution Authorization

Wallet linking proves account association. It does not grant KDEXIT the right to move assets.

Today, a linked wallet can answer product questions like:

- which wallet belongs to the authenticated user
- which address should be shown in the dashboard
- which chain context the user is viewing
- which saved strategies are associated with a wallet

It cannot answer execution questions like:

- whether KDEXIT may sell a token
- how much of a token may be sold
- which contract may spend or route assets
- which keeper, relayer, or controller may trigger execution
- whether a user has accepted current execution risks and constraints

Implementation rule: do not treat a row in `wallet_links` as permission to execute. It is identity and account context only.

## Additional Consent Needed Later

Before live execution, KDEXIT will likely need a separate, explicit consent model.

Possible consent layers:

- **Wallet signature for intent:** the user signs a typed message that describes the strategy, chain, token, limits, and expiry. This can help prove intent offchain, but it does not by itself move funds.
- **Onchain strategy activation:** the user sends a transaction to register or activate a strategy in a `StrategyRegistry` or similar contract.
- **Token allowance or permission:** the user grants a narrow approval, Permit2 permission, smart-account policy, or equivalent asset movement permission.
- **Execution controller authorization:** the user authorizes a specific contract, keeper, or relayer path to execute only within defined constraints.
- **Per-strategy confirmation:** high-risk strategies may require a separate confirmation even if the wallet is linked.

The future UI should distinguish these states:

- wallet connected
- wallet linked
- strategy saved offchain
- strategy authorized onchain
- token permission available
- watcher eligible
- execution submitted
- execution confirmed
- execution failed or revoked

Implementation rule: each state should have its own durable field or derived read model. Avoid compressing these into a single boolean like `enabled`.

## Offchain Records vs Onchain Authorization

KDEXIT can store strategy records before any onchain authorization exists.

An offchain strategy record may contain:

- token name and symbol
- token address
- chain ID
- take-profit or stop-loss thresholds
- sell percentage
- notes
- UI preferences
- dry-run watcher state
- dashboard lifecycle status

Onchain authorization should be smaller and stricter. It may contain or enforce:

- owner address
- supported chain and token
- maximum sell percentage or amount
- allowed execution controller
- allowed adapter or route constraints
- active, paused, cancelled, or expired state
- nonce, deadline, or replay protection
- emitted events for reconciliation

Important mismatch: an offchain strategy can say "active" for dashboard planning, but live execution must not be possible unless the matching onchain authorization also exists and is valid.

Implementation rule: database records are not sufficient to execute. The execution path must verify chain state before submitting a live transaction.

## Minimum Conditions For Live Execution

Live execution should remain unavailable until all of the following are true.

### Product Gates

- Internal beta flags are explicitly enabled.
- Contract readiness is configured for the target chain.
- The global live-execution kill switch is off.
- The user is in the allowed rollout cohort.
- UI copy clearly states what is authorized and what is still experimental.

### User Authorization

- The wallet is connected and linked to the authenticated account.
- The connected wallet matches the strategy owner or authorized smart account.
- The user has completed the required setup transaction or signature flow.
- Token spending or smart-account policy is constrained to the intended asset, amount, route, and expiry.
- The user can revoke or pause authorization.

### Contract Readiness

- Supported chain IDs are configured.
- Strategy registry and execution controller addresses are configured.
- ABI references are versioned and match deployed bytecode expectations.
- Contracts have been tested, reviewed, and deployed through a documented release process.
- The app can read contract state before presenting execution as available.

### Backend Readiness

- Watcher decisions use trusted market data sources.
- Duplicate execution prevention exists.
- Pending, failed, confirmed, and reverted outcomes are reconciled from chain data.
- Retry behavior is bounded and visible.
- Logs and audit records include strategy ID, wallet, chain, contract address, transaction hash, and failure reason.

### Safety Requirements

- No broad or hidden approvals.
- No execution from database state alone.
- No silent fallback from failed onchain checks to an offchain "success" state.
- No live execution from public UI until internal beta controls are deliberately opened.
- No write path should be added without tests covering disabled defaults and missing authorization.

## Suggested Implementation Shape

Keep authorization explicit in code.

Possible future data fields:

```text
strategies.authorization_status
strategies.onchain_strategy_id
strategies.authorization_chain_id
strategies.authorization_contract_address
strategies.authorization_tx_hash
strategies.authorization_expires_at
strategies.execution_paused_at
strategies.execution_revoked_at
```

Possible status values:

```text
draft
saved_offchain
authorization_pending
authorized_onchain
watching
execution_pending
executed
failed
paused
revoked
expired
```

Possible service boundaries:

- UI prepares strategy intent and explains required permissions.
- API validates the authenticated user and stores offchain records.
- Contract read layer checks registry, controller, allowance, and chain support.
- Execution gateway refuses live execution unless every gate passes.
- Watcher submits only through the execution gateway.

## Current Phase 5 Boundary

In the current `kdexit-web` app:

- wallet linking is account context only
- contract readiness is configuration state only
- internal beta gates keep execution-related UI disabled by default
- new strategies should remain safe planning records unless gates are explicitly opened
- live execution remains disabled

Any future PR that adds live execution must update this document and show exactly how user consent, onchain authorization, kill switches, and reconciliation are enforced.
