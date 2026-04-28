# Phase 6 Monitoring Readiness

KDEXIT now has a vendor-neutral monitoring boundary for future error monitoring and analytics.

## Current Behavior

Monitoring is disabled by default.

The helpers in `lib/monitoring/client.ts` and `lib/monitoring/server.ts` return no-op results unless monitoring is explicitly enabled and a transport is registered.

No vendor SDK is installed. No network calls are made by this layer today.

## Client Configuration

Only public, non-secret values may be used by client monitoring:

```text
NEXT_PUBLIC_KDEXIT_MONITORING_ENABLED=false
NEXT_PUBLIC_KDEXIT_MONITORING_ENVIRONMENT=development
NEXT_PUBLIC_KDEXIT_RELEASE=
```

Do not place API keys, DSNs, auth tokens, private keys, or webhook URLs in `NEXT_PUBLIC_*` variables unless they are intentionally public for the selected vendor.

## Server Configuration

Server monitoring may use private configuration later:

```text
KDEXIT_MONITORING_ENABLED=false
KDEXIT_MONITORING_ENVIRONMENT=development
KDEXIT_RELEASE=
```

Future vendor secrets should stay server-only.

## Integration Path

Future monitoring integrations should:

- register a transport with `setMonitoringTransport`
- keep vendor-specific code outside application features
- sanitize event context before sending it to a provider
- avoid logging raw cookies, sessions, private keys, tokens, webhook URLs, or full secrets
- keep live execution monitoring separate from this no-op foundation until live execution exists

This layer is for reporting application errors and product events. It does not enable trade execution, wallet writes, approvals, swaps, relayers, or contract calls.
