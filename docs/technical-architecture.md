# KDEXIT Technical Architecture

## Purpose

This document explains how KDEXIT should evolve from a dashboard-only strategy manager into a **non-custodial auto-sell and stop-loss product**.

It focuses on the responsibilities and boundaries of:

- frontend
- backend watcher
- database
- wallet layer
- execution contracts

It is intentionally product-specific. It describes how the current `kdexit-web` app can grow into a safer execution system without breaking the non-custodial model.

## Current State

Today, KDEXIT is primarily an offchain dashboard application.

What already exists:

- wallet connection for account presence and chain awareness
- strategy creation and editing UX
- execution and activity history views
- API route scaffolding
- shared validation schemas
- a mutation gateway that keeps future transport changes possible

What does **not** exist yet:

- trust-minimized onchain strategy execution
- a watcher or keeper system
- smart contracts for strategy registration and execution
- indexed onchain execution state
- a hardened server-side orchestration flow

That means the current app is the control surface, not yet the execution engine.

## Product Goal

KDEXIT should become a system where:

1. A user connects their wallet.
2. The user creates a take-profit or stop-loss strategy.
3. Strategy intent is persisted in offchain and onchain forms where appropriate.
4. A backend watcher monitors market conditions and strategy eligibility.
5. When a trigger condition is met, the system submits a valid execution request to an onchain execution contract.
6. Funds move through user-authorized, non-custodial paths only.
7. The dashboard reflects live strategy state, execution status, and failures clearly.

The core principle is:

**KDEXIT should orchestrate execution, not custody user funds.**

## Non-Custodial Principle

For KDEXIT, non-custodial means:

- user assets remain in a wallet or user-controlled smart account
- KDEXIT servers do not hold private keys for standard user wallets
- contract permissions should be narrow and explicit
- automation rights should be granted only to the minimum execution surface required

KDEXIT may later support relaying, operators, or smart accounts, but the initial architecture should still assume that:

- execution power must be clearly authorized
- funds must never sit in a KDEXIT-owned omnibus wallet

## High-Level System Architecture

```text
User
  |
  v
KDEXIT Frontend (Next.js)
  |
  +--> App/API Layer
  |       |
  |       +--> Database
  |       |
  |       +--> Watcher / Automation Backend
  |
  +--> Wallet Client (wagmi / viem)
              |
              +--> Execution Contracts
                        |
                        +--> DEX adapters / routers
```

## Major Components

### 1. Frontend

The frontend remains the product surface where users:

- connect wallets
- create and manage strategies
- approve permissions
- review activity and errors
- understand whether a strategy is merely configured, actively watched, armed onchain, paused, or executed

The frontend should own:

- strategy authoring UX
- wallet session state
- transaction prompting
- human-readable execution history
- risk disclosures and permission explanations
- optimistic UI only where it does not misrepresent actual execution success

The frontend should **not** own:

- market monitoring
- trusted execution decisions
- direct custody
- the durable source of truth for final execution outcomes

### 2. Backend Watcher

The backend watcher is the automation brain.

Its job is to:

- ingest active strategies
- subscribe to price or market data
- determine when a trigger condition becomes eligible
- verify the strategy is still executable
- submit execution requests or keeper actions
- record outcomes, retries, and failure reasons

The watcher should behave like a narrow, auditable service rather than a general backend monolith.

Responsibilities:

- polling or streaming market data
- evaluating strategy trigger rules
- debouncing noisy market conditions
- preventing duplicate executions
- handling retry rules
- writing durable execution state back to the database
- reconciling pending, confirmed, and failed transaction outcomes

The watcher should **not**:

- silently override user permissions
- make discretionary trading decisions
- hold user funds

### 3. Database

The database is the offchain operational record.

It should store:

- users and wallet links
- strategy records
- watcher state
- execution attempts
- transaction hashes
- status changes
- alerts, failures, and audit metadata

The database should be treated as the source of truth for:

- operational history
- monitoring state
- UI read models

The database should **not** be treated as the final source of truth for:

- actual token balances
- whether an onchain execution really finalized

Those must always be confirmed against chain state.

### 4. Wallet Layer

The wallet layer is the user authorization boundary.

Today, the project already uses `wagmi` and wallet connectors for:

- connected/disconnected state
- chain awareness
- basic wallet presence

In the future system, the wallet layer must expand to support:

- strategy authorization
- contract approval flows
- execution permission explanation
- transaction signing for setup actions

KDEXIT should support one of these models:

1. User wallet signs setup transactions, then approved contracts/keepers can execute within constrained permissions.
2. User smart account model, where automation executes through policy-controlled account logic.

The first model is likely the safest and simplest starting point.

### 5. Execution Contracts

Execution contracts are the onchain enforcement layer.

They should own:

- strategy registration or activation state that must be enforced onchain
- execution permissions
- trigger-execution entrypoints
- safe interaction with DEX adapters
- event emission for monitoring and reconciliation

They should not attempt to replace the dashboard, watcher, analytics, or product UX.

## Responsibility Split

### Frontend Responsibilities

- create/edit/pause/delete strategy forms
- wallet connect and chain mismatch UX
- permission setup prompts
- display strategy lifecycle and execution history
- show execution readiness, errors, and required user actions
- call app APIs or server actions for offchain management operations

### Backend Watcher Responsibilities

- read active strategies from the database
- subscribe to market data and onchain state where needed
- determine trigger eligibility
- verify chain, token, and permission preconditions
- call the execution pathway when eligible
- track pending transactions and confirmations
- update database state after every attempt

### Database Responsibilities

- persist user-owned strategy configurations
- persist watcher job state
- persist execution attempt records
- support operational dashboards and audit trails
- support idempotency and replay protection metadata

### Wallet Responsibilities

- identify the user wallet
- verify connected chain
- authorize approvals or strategy activation flows
- display transaction prompts
- remain the user-controlled asset boundary

### Execution Contract Responsibilities

- enforce allowed execution conditions
- accept execution requests from valid actors
- apply swap/exit rules through adapters
- emit canonical onchain events
- prevent unauthorized or duplicate execution paths

## Data Model Evolution

The current frontend strategy model already includes useful fields such as:

- token name and symbol
- token address
- chain and chain ID
- sell percentage
- take-profit and stop-loss levels
- trigger enablement
- slippage
- notes

That model should evolve into two distinct layers.

### Product Strategy Model

This remains richer and dashboard-oriented.

Fields include:

- notes
- UI preferences
- watcher metadata
- display labels
- retry state
- alerting metadata

### Execution Strategy Model

This is the narrower model that matters for automation and contracts.

Fields include:

- owner wallet
- token address
- chain ID
- trigger thresholds
- sell percentage
- slippage bounds
- active or paused state
- execution authorization state

Not all frontend fields should become onchain fields.

## Lifecycle Of A Strategy

### Stage 1: Draft

The user creates a strategy in the dashboard.

Stored:

- frontend form data
- validation state
- draft/offchain strategy record

### Stage 2: Armed

The strategy becomes eligible for automation.

Possible requirements:

- wallet connected
- correct chain selected
- token address verified
- execution permissions granted
- strategy active in the database
- optional onchain registration completed

### Stage 3: Watching

The backend watcher actively monitors:

- market price
- liquidity conditions
- strategy state
- duplicate execution protection

### Stage 4: Triggered

A watcher determines that the trigger condition has been met.

It then:

- records a pending execution attempt
- submits the execution transaction
- tracks the transaction hash

### Stage 5: Settled

After confirmation:

- the watcher updates the final execution status
- the UI reflects success or failure
- the strategy is moved to the next logical state

## Proposed Backend Flow

```text
Frontend creates strategy
  ->
App/API validates and stores strategy
  ->
Watcher picks up active strategy
  ->
Watcher monitors price conditions
  ->
Trigger condition met
  ->
Watcher verifies permissions and chain state
  ->
Watcher submits execution to contract
  ->
Transaction confirmed or fails
  ->
Database updated
  ->
Frontend displays final state
```

## Frontend Architecture In The Future State

The frontend should likely separate concerns into:

### Dashboard UI

- strategy forms
- summary metrics
- activity feeds
- wallet status

### Strategy State Layer

- server actions or API routes for product mutations
- cached strategy queries
- optimistic state only for reversible operations

### Execution Readiness Layer

- permission state
- token approval state
- chain compatibility checks
- watcher eligibility state

### Activity Layer

- strategy lifecycle events
- execution attempts
- transaction links
- failure explanations

## Backend Watcher Architecture

The watcher should be an isolated service or worker process, not just another route handler.

Suggested internal modules:

### Strategy Intake

- fetch active strategies
- validate ready-for-watch state

### Price Feed Module

- DEX quote sources
- oracle sources where appropriate
- fallback feeds and staleness checks

### Trigger Evaluator

- compare observed conditions against strategy thresholds
- enforce cooldown windows
- avoid repeated triggers

### Execution Dispatcher

- build execution request
- submit transaction or keeper call
- store idempotency keys

### Confirmation Tracker

- watch transaction receipts
- update final status
- capture revert reasons where available

### Alerting And Ops

- failed execution notifications
- retry queue visibility
- dead-letter handling for unrecoverable states

## Database Architecture

The database should evolve beyond basic strategy storage into operational tables such as:

### `strategies`

- product strategy record
- user ownership
- current lifecycle state

### `strategy_execution_config`

- execution-facing parameters
- authorization state
- watcher readiness flags

### `execution_attempts`

- strategy ID
- trigger type
- transaction hash
- status
- failure reason
- timestamps

### `watcher_jobs`

- active/inactive watcher assignment
- next evaluation time
- retry count
- last observed price

### `strategy_events`

- strategy created
- strategy updated
- strategy paused
- strategy resumed
- execution submitted
- execution confirmed
- execution failed

This split keeps operational state queryable without forcing the UI to infer everything from raw executions.

## Wallet And Permission Model

KDEXIT should not jump straight from dashboard storage to fully autonomous execution without a clear permission model.

Recommended progression:

### Phase 1

- wallet connection only
- no real execution

### Phase 2

- explicit setup transaction to enable a strategy
- contract or smart account receives narrow execution authority

### Phase 3

- watcher can trigger execution only for strategies already authorized

This is safer than relying on broad approvals with vague backend assumptions.

## Execution Contract Model

The execution contract layer should probably separate:

### Strategy Registry

- strategy ownership
- active/paused/cancelled state
- event emission

### Execution Controller

- validate callable execution conditions
- route to swap adapters
- enforce slippage and permission checks

### Adapter Contracts

- PancakeSwap or other DEX-specific integration
- isolated router logic

This keeps KDEXIT adaptable as execution venues change.

## Security Principles

KDEXIT should optimize for constrained automation, not maximum convenience.

Important rules:

- no user fund custody by KDEXIT
- no hidden server-side signing for regular wallets
- no broad operator rights without explicit policy
- no execution without durable audit logs
- no UI state implying execution success before onchain confirmation

## Phased Rollout

### Phase 0: Dashboard Foundation

Current state:

- strategy dashboard
- wallet presence
- validation
- API scaffolding

### Phase 1: Durable Offchain Strategy Service

Add:

- proper server-owned strategy persistence
- user ownership model
- watcher-ready database tables

### Phase 2: Watcher Prototype

Add:

- market monitoring worker
- trigger evaluation
- execution attempt recording

No real trading yet. This phase proves operational flow.

### Phase 3: Contract Integration

Add:

- strategy registry contract
- execution controller
- ABI integration in web app

### Phase 4: Guarded Auto-Sell

Add:

- limited live execution on one chain and one venue
- strong monitoring and pause controls

### Phase 5: Full Stop-Loss Product

Add:

- hardened watcher and retry logic
- richer failure handling
- multi-venue or multi-chain expansion

## Recommended Ownership Boundaries

### `kdexit-web`

- frontend
- product APIs
- user authentication
- database-backed dashboard
- watcher control plane

### watcher service

- price monitoring
- trigger evaluation
- transaction dispatch
- confirmation tracking

### contracts workspace

- registry
- execution controller
- adapters
- deployments
- ABI outputs

## Final View

KDEXIT should evolve in layers:

1. Dashboard and UX first.
2. Durable backend and watcher second.
3. Contract enforcement third.
4. Live non-custodial automation last.

That sequence fits the current codebase well. The present app already has the beginnings of:

- a strong strategy model
- wallet awareness
- API structure
- validation infrastructure

The next step is not to cram execution directly into the frontend. The next step is to introduce a backend watcher and a narrower execution contract model so KDEXIT becomes an automation system with clear operational and security boundaries.
