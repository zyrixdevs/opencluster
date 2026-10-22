# API Design Proposal

**Status:** No API is implemented. Paths and schemas below are conceptual and may change before the first contract is published.

## Conventions

- Version public contracts under `/api/v1` once implementation begins.
- Use JSON for request/response payloads, ISO 8601 UTC timestamps, explicit units, stable opaque identifiers, and structured error responses.
- Validate authorization, schema, payload size, and state transitions server-side. Never trust a client-supplied role or node identity.
- Use pagination and bounded time ranges for collection/history queries. Document limits when chosen.
- Mutations should be idempotent where practical; use request identifiers for operations that could be retried.

## Candidate resource surface

| Purpose | Candidate endpoint | Notes |
|---|---|---|
| Current user/session | `GET /api/v1/me` | Identity and effective capabilities only. |
| Nodes | `GET /api/v1/nodes`, `GET /api/v1/nodes/{id}` | Filterable, paginated inventory; hide revoked credentials. |
| Enrollment | `POST /api/v1/enrollments`, agent enrollment exchange | One-time, expiring enrollment material; exact flow undecided. |
| Node revocation | `POST /api/v1/nodes/{id}/revoke` | Privileged, auditable, idempotent transition. |
| Telemetry | agent ingest endpoint; `GET /api/v1/nodes/{id}/metrics` | Bounded schema and time window; capabilities may be absent. |
| Audit | `GET /api/v1/audit-events` | Permission-gated, append-oriented records. |
| Live updates | WebSocket under `/api/v1/events` | Authenticated, authorization-scoped subscriptions; no privileged command channel assumed. |

These are design examples, not available routes. Job, service-control, shell, and agent-execution endpoints are intentionally not specified until their authorization and threat models are approved.

## Errors and compatibility

Use a consistent error envelope with a machine-readable code, safe human-readable message, and optional request ID. Do not leak secrets, stack traces, or authorization internals. Breaking contract changes require a versioning and migration policy before release. Authentication mechanism, CSRF protections, rate limits, and exact error schema remain open decisions.
