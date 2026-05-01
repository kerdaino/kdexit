# Execution Authorization UX

Status: internal beta scaffold. Live execution remains disabled.

KDEXIT now has an app-level flow for a user to sign bounded EIP-712
`ExecutionAuthorization` typed data for a strategy. This is consent metadata only.
It does not submit a transaction, request a token approval, call a contract write
function, or enable relayer execution.

## Wallet Linking Is Not Authorization

Wallet linking proves that an authenticated account controls or is associated with
a wallet address on a chain. It is still account context only.

Execution authorization is a separate typed-data signature with explicit bounds:

- user wallet
- strategy identifier
- token address
- adapter address
- chain ID
- sell bps
- max amount
- nonce
- deadline

A linked wallet row must not be treated as permission to move assets.

## What The Signature Does

The dashboard asks the connected, linked wallet to sign EIP-712 typed data. Wallets
should display this as a message signature, not a transaction.

The app stores the verified signature and metadata on the strategy:

- signature
- digest
- nonce
- deadline
- adapter
- max amount
- signed wallet
- signed/cancelled timestamps
- authorization status

The UI can show not authorized, authorization signed, authorization expired, and
authorization cancelled/revoked states.

## What The Signature Does Not Do

This flow does not:

- approve token spending
- send an onchain revoke or approval transaction
- call contract write functions
- create a relayer job
- activate live execution
- move funds
- make a strategy worker-eligible for live execution

The stored state is `signed`, not `authorized`, and `execution_mode` remains
`live_disabled` or `simulation`. The dry-run worker still requires stricter future
authorization before preparing anything beyond payload hashes.

## What Remains Before Live Execution

Before KDEXIT can execute trades, the app still needs contract read verification,
token allowance or Permit2 checks, relayer key management, a live execution gateway,
onchain cancellation/revocation semantics, reconciliation, monitoring transport,
operator runbooks, rollout gates, and security review.
