# Testing Strategy

**Status:** Strategy for future implementation. The repository currently has no application code, so application test suites are not claimed.

## Test layers

- **Documentation/repository checks:** verify required documents, Markdown structure/links where tooling exists, and safe workflow configuration.
- **Unit tests:** metric parsing, validation, authorization decisions, state transitions, and serialization.
- **Contract tests:** frontend/API schemas and control-server/agent protocol compatibility.
- **Integration tests:** database migrations, enrollment/revocation, telemetry ingest, and WebSocket authorization using isolated test services.
- **End-to-end tests:** authenticated operator flows across supported deployment targets.
- **Security tests:** authorization boundary cases, secret redaction, malformed/oversized input, replay/expiry, dependency scanning, and threat-model regression cases.
- **Performance/reliability tests:** representative telemetry volume, bounded query behavior, reconnect/backoff, and failure recovery. Set budgets from documented test hardware and workload rather than inventing numbers.

## Quality gates

Require formatting, linting, type checks, tests relevant to changed areas, migration validation, and security-sensitive review before merge. CI should run only tools and artifacts present in the repository. Do not add a frontend/backend build job until those applications and their package configuration exist. Publish reproducible commands in `DEVELOPMENT.md` when tooling is selected.

## Test data and environments

Use synthetic, non-sensitive fixtures. Never commit live node inventories, tokens, private keys, or production telemetry. Integration tests should use disposable databases and avoid modifying operator systems. Document supported OS and version matrix as it becomes real and tested.

## Release confidence

Before a supported release, test installation and upgrade from a clean environment, backup/restore, credential revocation, and failure behavior. Report skipped checks and environment limitations in release notes. A passing test suite does not establish security or availability guarantees by itself.
