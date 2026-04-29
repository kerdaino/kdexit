# KDEXIT Alerting Plan

Alerting is centralized in `lib/alerts`. The public interface is `reportAlert`
plus scenario helpers such as `reportApiMutationFailureAlert` and
`reportWatcherSimulationFailureAlert`.

Alerting is no-op by default. Set `KDEXIT_ALERTS_ENABLED=true` and register an
`AlertTransport` with `setAlertTransport` before any alert can be delivered.
No external providers are called by the current implementation.

## Alert Scenarios

### Failed API Mutation

Fire when a create, update, or delete API route fails after validation and
authorization have passed. This covers strategy, execution, and wallet-link
mutations. Do not include request bodies, wallet addresses, user IDs, session
data, auth tokens, or raw database error details in alert context.

### Failed Watcher Simulation

Fire when the watcher simulation route throws, or when a completed simulation
result includes one or more failed attempts. Include counts and route/scope
metadata only.

### Suspicious Repeated Failures

Fire when a known scope crosses a repeated-failure threshold. The default
placeholder threshold is three failures. Today this is wired to watcher
simulation failed-attempt counts; future API or background-worker integrations
can pass their own scope and threshold.

### Wallet-Linking Errors

Fire when wallet-link create, update, primary-switch, or delete operations fail
in the API or client UI. Do not include wallet addresses, connector secrets,
session identifiers, or account identifiers. Current alerts include only the
operation, source, and stable error code.

### Readiness Gate Misconfiguration

Fire when execution-readiness flags appear contradictory, such as live execution
mode being requested while the kill switch is on, wallet-linked beta being on
without dashboard beta, or contract-readiness mode being enabled while required
contract references are missing.

## Future Integration Notes

API routes can call the scenario helpers before returning error responses.
Watcher logic can call the watcher and repeated-failure helpers after each run.
Future transports should live outside the alert decision logic and must use the
already-sanitized alert context.
