# KDEXIT Smart Contract Architecture

## Recommendation

KDEXIT should add smart contract development in a **sibling workspace**, not directly inside this Next.js app repo.

Recommended shape:

```text
kdexit/
  kdexit-web/
  kdexit-contracts/
```

If the team later wants a monorepo, the cleaner end state would be:

```text
kdexit/
  apps/
    web/
  packages/
    contracts/
    contract-sdk/
```

For the current project, the best next step is still a **sibling workspace** because it keeps the web app stable while contract development introduces a very different toolchain, testing model, and security workflow.

## Why Not Keep Contracts In This Repo

This repo is currently optimized for:

- Next.js App Router UI and route handlers
- wallet connection and dashboard UX
- browser-oriented persistence paths like `localStorage`
- API validation and mutation scaffolding

This repo is **not** yet set up for:

- Solidity or Foundry/Hardhat tooling
- contract compilation artifacts and ABI generation pipelines
- fuzzing, invariant testing, and fork tests
- deployment scripts and environment separation by chain
- audit-focused review boundaries

Keeping contracts in this repo would mix:

- frontend dependency churn with security-sensitive contract changes
- Node/web build concerns with EVM toolchain concerns
- app CI with contract CI
- product releases with protocol releases

That usually becomes noisy fast, especially once generated ABIs, deployments, and test fixtures start landing in source control.

## Why A Sibling Workspace Fits KDEXIT Best

A sibling workspace gives KDEXIT cleaner boundaries:

- `kdexit-web` owns UI, wallet UX, API surface, validation, and offchain orchestration.
- `kdexit-contracts` owns Solidity, deployment scripts, ABI generation, chain config, and security testing.

This is a good fit for the current app because the dashboard still behaves like an offchain control plane. Contracts should be introduced as a protocol layer behind that control plane, not mixed into the same codebase before the contract model is stable.

## Current Project Audit

The current web app suggests KDEXIT is still in an early integration phase:

- Wallet support exists, but only for account/session presence, not live execution.
- Strategy data is still modeled primarily for dashboard management.
- The mutation layer currently recommends a hybrid future, but uses a client repository transport today.
- API routes exist as placeholders with request validation scaffolding.
- Strategy and execution schemas are in place, but they represent application state, not onchain state.
- Chain support is intentionally narrow, with BNB Chain as the current enabled path.

That means the contract system should be added carefully as a new subsystem, not as a direct extension of the current frontend storage model.

## Proposed Responsibilities

### `kdexit-web`

The web app should own:

- strategy authoring UX
- wallet connection
- user authentication and access control
- backend-for-frontend routes and server actions
- offchain indexing, read models, and activity history
- contract write preparation and transaction prompting
- ABI consumption through a published contract package or generated SDK

### `kdexit-contracts`

The contracts workspace should own:

- Solidity source
- protocol-level access control
- strategy registry and execution permissions
- vault or custody decisions
- automation-compatible execution entrypoints
- deployment manifests by chain
- generated ABIs and typed client outputs
- security tests, fuzz tests, and invariants

## Proposed Contract Architecture

KDEXIT should avoid putting complex strategy logic directly in one monolithic contract. A cleaner architecture is:

### 1. Strategy Registry

Purpose:

- store strategy metadata that must exist onchain
- assign strategy IDs
- track ownership, status, and lifecycle

Responsibilities:

- create strategy records
- pause/resume/cancel strategies
- emit lifecycle events
- expose read methods for indexing and UI reconciliation

What should stay offchain at first:

- rich notes
- UI-only workflow state
- denormalized dashboard summaries

### 2. Execution Controller

Purpose:

- act as the protocol entrypoint for valid strategy execution

Responsibilities:

- verify strategy status and permissions
- enforce execution guards
- call downstream swap/execution adapters
- emit execution events and failure reasons when possible

This contract should be narrow. It is the place where operational risk increases fastest.

### 3. Adapter Layer

Purpose:

- isolate DEX-specific logic from core strategy state

Responsibilities:

- integrate with PancakeSwap or other supported venues
- keep router-specific and path-specific logic out of the registry
- make future protocol expansion less invasive

This matters because KDEXIT will likely need venue changes faster than it needs core storage changes.

### 4. Treasury / Fee Module

Purpose:

- separate fee policy from execution logic

Responsibilities:

- define fee recipients
- calculate protocol fees if introduced
- make fee behavior auditable and upgradable only under strict governance rules

This can ship later if fees are not part of v1.

### 5. Automation Permission Model

Purpose:

- define who is allowed to execute strategies

Possible models:

- owner-only execution
- approved operator / keeper execution
- signed-intent execution with server-side relayers later

KDEXIT should start with the simplest safe model, not the most automated one.

## Data Ownership Split

The cleanest split for KDEXIT is:

### Onchain

- strategy ID
- owner
- token and chain identifiers
- execution thresholds required for trustless enforcement
- active/paused/cancelled state
- events for creation, updates, and execution

### Offchain

- notes
- UI preferences
- dashboard summaries
- enriched execution history views
- alerting and analytics
- future automation scheduling metadata

Not every current frontend field belongs onchain. The contract model should be intentionally smaller than the dashboard model.

## Suggested Workspace Contents

Inside `kdexit-contracts`:

```text
kdexit-contracts/
  src/
    StrategyRegistry.sol
    ExecutionController.sol
    adapters/
    interfaces/
    libraries/
  script/
    Deploy.s.sol
    Upgrade.s.sol
  test/
    unit/
    integration/
    invariant/
  deployments/
    bnb/
    polygon/
    ethereum/
  abi/
  generated/
  docs/
```

Recommended tooling:

- **Foundry** for Solidity development, testing, scripting, and invariants
- optional `openzepplin-contracts` for vetted primitives
- ABI/type export into either:
  - a small published package, or
  - a generated artifact sync consumed by `kdexit-web`

## Integration Between Web And Contracts

The web app should not read Solidity source directly.

Preferred integration:

1. `kdexit-contracts` builds and exports ABIs plus deployed addresses.
2. A small generated package or artifact bundle is produced.
3. `kdexit-web` consumes only:
   - ABI
   - deployed address map
   - typed helpers if generated

This keeps the web app dependent on a stable interface, not on contract internals.

## Phased Rollout

### Phase 0: Preparation

- freeze the first onchain strategy data model
- decide which fields are onchain vs offchain
- define BNB Chain as the single launch network
- choose Foundry and create `kdexit-contracts`

Deliverables:

- contract workspace
- coding standards
- deployment environment plan
- ABI publishing plan

### Phase 1: Read-Only Contract Foundation

- build `StrategyRegistry`
- emit events for strategy lifecycle
- deploy to testnet
- connect `kdexit-web` to read deployed addresses and ABIs

Deliverables:

- basic registry contract
- testnet deployment
- frontend read integration

### Phase 2: Controlled Write Path

- allow users to create and manage strategies onchain
- keep actual execution logic disabled or tightly scoped
- update dashboard flows to reconcile onchain state with offchain views

Deliverables:

- create/pause/resume/cancel flows
- event indexing plan
- wallet transaction UX for strategy lifecycle

### Phase 3: Execution Controller

- add guarded execution entrypoints
- introduce a narrow adapter for the first supported DEX
- keep risk controls explicit and heavily tested

Deliverables:

- execution controller
- adapter abstraction
- unit, integration, and fork tests

### Phase 4: Automation Layer

- add keeper/operator permissions or signed intents
- introduce server-assisted automation only after contract permissions are stable
- use the existing web/API mutation layer as orchestration, not as the trust anchor

Deliverables:

- operator model
- automation service design
- failure recovery and replay handling

### Phase 5: Hardening

- external audit
- invariant expansion
- staged mainnet rollout
- post-deploy monitoring and pause procedures

Deliverables:

- audit fixes
- runbooks
- incident response plan

## Risks To Avoid

- putting all strategy and swap logic into one contract
- forcing every dashboard field onchain
- mixing ABI generation and frontend app releases too early
- launching automation before permissions and pause controls are mature
- treating wallet connection as equivalent to secure execution architecture

## Final Recommendation

KDEXIT should:

1. Keep `kdexit-web` focused on product, UX, API, and orchestration.
2. Create a sibling `kdexit-contracts` workspace for protocol development.
3. Start with a small onchain core: registry first, execution second.
4. Share ABIs and deployment metadata back into the web app through generated artifacts, not shared source.

That gives the project the cleanest path to add contracts without overloading this frontend repo or blurring the security boundary between product code and protocol code.
