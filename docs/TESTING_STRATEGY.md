# Testing Strategy

**Status:** Phase 1 dashboard checks are implemented; backend, agent, and deployment test layers remain future strategy.

## Test layers

- **Dashboard checks:** strict TypeScript typecheck, Biome lint, Vitest tests for demo-data cloning and local state transitions, and a Vite production build.
- **Documentation/repository checks:** verify required documents, Markdown structure/links where tooling exists, and safe workflow configuration.
- **Unit tests:** metric parsing, validation, authorization decisions, state transitions, and serialization.
- **Contract tests:** frontend/API schemas and control-server/agent protocol compatibility.
- **Integration tests:** database migrations, enrollment/revocation, telemetry ingest, and WebSocket authorization using isolated test services.
- **End-to-end tests:** authenticated operator flows across supported deployment targets.
- **Security tests:** authorization boundary cases, secret redaction, malformed/oversized input, replay/expiry, dependency scanning, and threat-model regression cases.
- **Performance/reliability tests:** representative telemetry volume, bounded query behavior, reconnect/backoff, and failure recovery. Set budgets from documented test hardware and workload rather than inventing numbers.

## Quality gates

Require formatting, linting, type checks, tests relevant to changed areas, migration validation when applicable, and security-sensitive review before merge. CI runs the dashboard's checked-in scripts and documentation checks. Backend migrations and integration jobs wait until backend services exist. Reproducible commands are in `DEVELOPMENT.md`.

## Test data and environments

Use synthetic, non-sensitive fixtures. Never commit live node inventories, tokens, private keys, or production telemetry. Integration tests should use disposable databases and avoid modifying operator systems. Document supported OS and version matrix as it becomes real and tested.

## Release confidence

Before a supported release, test installation and upgrade from a clean environment, backup/restore, credential revocation, and failure behavior. Report skipped checks and environment limitations in release notes. A passing test suite does not establish security or availability guarantees by itself.
