# KDEXIT Production Launch Checklist

## Purpose

This checklist is for preparing KDEXIT for a production launch.

It covers:

- frontend quality
- data persistence
- error handling
- wallet integration
- security review
- environment variables
- analytics
- domain setup
- deployment readiness

This checklist is written for the current `kdexit-web` project, where the app already includes:

- dashboard strategy management
- wallet connection scaffolding
- Supabase-ready data mode support
- API route placeholders
- shared validation schemas

## Release Decision Rule

KDEXIT should launch only when:

- all **must-have** items are complete
- open issues are documented and accepted explicitly
- launch owner, rollback owner, and on-call owner are assigned

Recommended labels:

- `[Must]`
- `[Should]`
- `[Nice]`

## 1. Frontend Quality

### UX And Product Readiness

- `[Must]` Landing page messaging clearly explains what KDEXIT does and does not do.
- `[Must]` Dashboard state is understandable for first-time users.
- `[Must]` Strategy form validation is clear, user-friendly, and prevents invalid data.
- `[Must]` Empty states are intentional and not placeholder-feeling.
- `[Must]` Loading states exist for dashboard hydration and wallet actions.
- `[Must]` Success and error feedback are visible and readable.
- `[Must]` Destructive actions like delete remain confirmed before execution.
- `[Should]` Strategy lifecycle wording is consistent across overview, strategy list, settings, and activity.
- `[Should]` Wallet connection copy makes limitations obvious when execution is not live yet.
- `[Nice]` Add first-run onboarding guidance or inline tips.

### Visual And Responsive Quality

- `[Must]` All major screens render cleanly on desktop and mobile.
- `[Must]` No broken layouts at small widths.
- `[Must]` Buttons, inputs, and cards meet consistent spacing and typography standards.
- `[Must]` Color contrast is acceptable for primary text, controls, and status indicators.
- `[Should]` Keyboard focus states are visible on interactive elements.
- `[Should]` Major flows are tested in Chrome, Safari, and at least one mobile browser.

### Frontend Code Quality

- `[Must]` `npm run build` passes cleanly.
- `[Must]` No known runtime console errors in normal dashboard use.
- `[Must]` No dev-only placeholder content remains in critical user flows unless intentionally labeled.
- `[Should]` Add linting or CI enforcement if not already wired in deployment.
- `[Should]` Add a minimal test plan for strategy create/edit/pause/resume/delete flows.

## 2. Data Persistence

### Data Mode Readiness

KDEXIT currently supports:

- `localStorage`
- `supabase`

Only one mode should be considered the production source of truth.

- `[Must]` Decide the production data mode explicitly.
- `[Must]` If launching publicly, avoid treating `localStorage` as the long-term production system.
- `[Must]` Ensure the active production mode is documented in release notes and environment config.
- `[Must]` Confirm the dashboard behaves correctly when the configured data mode falls back.
- `[Should]` Add clear operator documentation for how to inspect and verify persisted strategies and executions.

### Database Readiness

If launching with Supabase:

- `[Must]` Production Supabase project is provisioned.
- `[Must]` Schema for strategies and executions exists and matches current app expectations.
- `[Must]` Read and write permissions are reviewed.
- `[Must]` Backup and recovery expectations are documented.
- `[Must]` Seed or test data is not mixed into production tables.
- `[Should]` Add migration tracking if not already formalized.
- `[Should]` Define retention expectations for execution history.

### Data Integrity

- `[Must]` Strategy records are validated before persistence.
- `[Must]` Execution records do not silently fail without a visible error path.
- `[Must]` IDs and timestamps are consistently generated and stored.
- `[Should]` Add idempotency rules for future API mutation endpoints.
- `[Should]` Add audit fields or event logs for strategy mutations in production mode.

## 3. Error Handling

### User-Facing Error Handling

- `[Must]` Strategy create/update/delete failures show meaningful feedback.
- `[Must]` Wallet connection failures show readable messages.
- `[Must]` Missing environment configuration does not crash the visible app unexpectedly.
- `[Must]` Unavailable data mode or persistence errors degrade gracefully.
- `[Should]` Add route-level and component-level fallback boundaries where appropriate.
- `[Should]` Add a consistent error presentation pattern for API responses.

### Operational Error Handling

- `[Must]` Server-side failures are logged in a way the team can access after deployment.
- `[Must]` API route failures include stable error codes and readable messages.
- `[Should]` Add central error reporting before launch.
- `[Should]` Track build-time, runtime, and wallet-provider failures separately if possible.

## 4. Wallet Integration

### Wallet UX

- `[Must]` Wallet connected, connecting, disconnected, and unavailable states are all tested.
- `[Must]` Wrong-network messaging is clear if chain-specific behavior matters.
- `[Must]` Disabled wallet mode is intentional when `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is missing.
- `[Must]` The app never implies that real trade execution is live if it is not.
- `[Should]` Disconnect behavior is tested across injected and WalletConnect flows.

### Wallet Technical Readiness

- `[Must]` WalletConnect project ID is configured in production if wallet connection is expected to work.
- `[Must]` `NEXT_PUBLIC_APP_URL` matches the real deployed domain.
- `[Must]` Metadata shown to wallets is correct and production-safe.
- `[Should]` Wallet connection behavior is tested after a hard refresh and across sessions.
- `[Should]` Document which wallets and chains are officially supported at launch.

## 5. Security Review

### Application Security

- `[Must]` Review all environment variables and ensure secrets are not exposed unintentionally.
- `[Must]` Confirm only intended `NEXT_PUBLIC_*` values are client-visible.
- `[Must]` Review API routes for validation, response consistency, and future auth assumptions.
- `[Must]` Ensure no placeholder route is accidentally treated as a live execution endpoint.
- `[Should]` Review dependency updates and known vulnerabilities before launch.
- `[Should]` Remove or document any mock-only or test-only behavior still reachable in production builds.

### Data And Access Security

- `[Must]` If using Supabase, review row-level security strategy before public launch.
- `[Must]` Determine how user ownership will be enforced for production strategy records.
- `[Must]` Review whether anonymous clients can mutate records they should not control.
- `[Should]` Add explicit authentication and authorization checks before multi-user production launch.

### Web3 Security

- `[Must]` Do not market KDEXIT as automated execution until the execution path is audited and real.
- `[Must]` Wallet permissions and approval language are specific and honest.
- `[Must]` No broad or hidden approval assumptions exist in the product copy.
- `[Should]` Prepare a contract/security review checklist before introducing live execution.

## 6. Environment Variables

### Current Known Variables

From the current codebase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_STRATEGY_DATA_MODE`

### Launch Checks

- `[Must]` Production environment variable values are documented.
- `[Must]` `.env.example` is current and matches the codebase.
- `[Must]` Production deployment platform has all required variables configured.
- `[Must]` Local, preview, and production environments are separated clearly.
- `[Must]` `NEXT_PUBLIC_APP_URL` uses the final production domain.
- `[Must]` `NEXT_PUBLIC_STRATEGY_DATA_MODE` matches the intended production persistence mode.
- `[Should]` Add a startup validation checklist for preview and production environments.

## 7. Analytics And Monitoring

### Product Analytics

- `[Must]` Decide whether analytics are required for launch.
- `[Must]` If analytics are enabled, define the minimum events to track.

Suggested initial events:

- landing page CTA clicks
- wallet connect success/failure
- strategy create success/failure
- strategy update success/failure
- strategy pause/resume/delete actions
- settings panel visits

- `[Should]` Document event naming conventions before instrumenting.
- `[Should]` Avoid capturing wallet addresses or sensitive user information unnecessarily.

### Operational Monitoring

- `[Must]` Monitor deployment health and uptime.
- `[Must]` Monitor server errors and API route failures.
- `[Should]` Add alerts for repeated wallet integration failures or database failures.
- `[Should]` Add simple metrics for strategy creation volume and mutation error rate.

## 8. Domain Setup

- `[Must]` Final production domain is chosen.
- `[Must]` DNS records are configured correctly.
- `[Must]` HTTPS is active and verified.
- `[Must]` `NEXT_PUBLIC_APP_URL` uses the same canonical domain.
- `[Must]` Redirect rules between `www` and apex domain are defined.
- `[Should]` Set the canonical site URL in app metadata.
- `[Should]` Add branded favicon, metadata, and social preview settings if they are still placeholder-level.
- `[Nice]` Configure status page or support contact location under the production domain.

## 9. Deployment Readiness

### Build And Release

- `[Must]` Production build succeeds from a clean environment.
- `[Must]` No manual local-only steps are required for deployment.
- `[Must]` Preview deployment works before production promotion.
- `[Must]` Rollback path is documented.
- `[Must]` Team knows who can deploy and who approves release.
- `[Should]` Add CI checks for build and lint before production release.

### Runtime Readiness

- `[Must]` API routes resolve correctly in production.
- `[Must]` Supabase/browser client setup works in the deployed environment.
- `[Must]` Wallet connection works against the deployed origin.
- `[Should]` Smoke test the full deployed app after release.

Suggested smoke test flow:

- open landing page
- open dashboard
- connect wallet
- create strategy
- edit strategy
- pause strategy
- resume strategy
- delete strategy

## 10. Content And Messaging

- `[Must]` Product copy does not overstate live automation capability.
- `[Must]` Risk language is honest about what is currently manual, watched, simulated, or not yet enabled.
- `[Must]` Settings and wallet sections clearly state current limitations.
- `[Should]` Add a short launch FAQ for users.
- `[Should]` Add support or contact guidance in the footer or help surface.

## 11. Documentation Readiness

- `[Must]` README reflects real setup instructions.
- `[Must]` Architecture docs remain aligned with the implementation.
- `[Must]` Launch owners know where the production checklist lives.
- `[Should]` Document data mode behavior and fallback behavior.
- `[Should]` Document known limitations for the first launch.

Related docs:

- [technical-architecture.md](/Users/oluwatobiadekunle/Projects/kdexit-web/docs/technical-architecture.md:1)
- [contract-architecture.md](/Users/oluwatobiadekunle/Projects/kdexit-web/docs/contract-architecture.md:1)

## 12. Final Go / No-Go Checklist

Before launch, answer these with an explicit yes:

- `[Must]` Is the production persistence mode chosen and validated?
- `[Must]` Are required environment variables configured in production?
- `[Must]` Does wallet connection work on the real domain?
- `[Must]` Are frontend errors and empty states polished enough for first users?
- `[Must]` Are all critical strategy mutation flows working end-to-end?
- `[Must]` Is the app honest about what it can and cannot execute today?
- `[Must]` Is rollback ownership clear?
- `[Must]` Are monitoring and support responsibilities assigned?

If any answer is no, KDEXIT should not be considered production-ready yet.
