# Architecture Proposal

**Status:** Proposed for discussion; no application components are implemented.

## Goals and boundaries

OpenCluster is planned as a self-hosted control plane with a browser UI, API/service layer, durable store, and separately supervised Linux node agents. The UI is not trusted to enforce authorization: the backend must authorize every request. Agents should expose a narrow, versioned protocol and must not become general-purpose remote shells.

## Logical components

1. **Web client:** React/TypeScript single-page interface; calls the API and subscribes to authorized live updates.
2. **Control server:** FastAPI application for identity, authorization, node registry, policy, telemetry ingestion, queries, audit, and later job orchestration.
3. **PostgreSQL:** durable configuration, identities, node metadata, audit records, and selected time-series data.
4. **Node agent:** Linux service that collects an allowlisted set of host metrics and communicates over authenticated TLS. It acts only on explicitly supported operations.
5. **Optional integrations:** adapters for GitHub or agent products, each with scoped credentials and explicit enablement.
6. **Deployment boundary:** Docker Compose for local/self-hosted installation is proposed; reverse proxy/TLS and backups are operator responsibilities until deployment tooling exists.

## Data flow

The browser authenticates to the control server. The server validates user permissions before reads or mutations. An enrolled agent authenticates with a revocable node credential, submits bounded telemetry, and receives only authorized protocol responses. The server validates identity, schema, size, and freshness before persistence. WebSocket updates are a delivery mechanism, not a source of authority; subscriptions must be scoped to the authenticated user and tenant/cluster.

## Module boundaries

- Identity and authorization own principals, roles, sessions/tokens, and policy checks.
- Registry owns node identity, enrollment state, labels, and capabilities.
- Telemetry owns validation, ingestion, retention, and query semantics.
- Audit owns append-oriented records of security-relevant actions.
- Integrations translate external APIs into internal contracts and cannot bypass core authorization.
- UI modules consume API contracts and do not access database or agent credentials.

## Decisions and trade-offs

- **Modular monolith first:** one backend deployment keeps transactions and operations simple; separate services can be considered only when scaling or isolation evidence warrants it.
- **HTTP APIs plus WebSockets:** HTTP is straightforward for commands and queries; WebSockets support live updates but require reconnect, authorization refresh, and backpressure handling.
- **PostgreSQL first:** mature relational constraints and transactions suit registry and audit data. A dedicated time-series system is deferred until retention and query load are understood.
- **No Redis by default:** avoids operational burden; introduce it only for demonstrated queue/fanout/cache requirements, with durable semantics specified.
- **Agent initiated connections preferred:** outbound TLS connections simplify many firewall/NAT configurations; exact reconnect and command delivery behavior remains to be validated.
- **Compose before Kubernetes:** lowers initial operational complexity; Kubernetes manifests are a later deployment target.

## Reliability and operations

Each layer should expose health and readiness separately. The server must track sample timestamps and distinguish current, delayed, and missing telemetry. Database backups, restore testing, key rotation, logs, and upgrade compatibility require documented procedures before production claims. No availability target has been established.

## Open architecture questions

Select authentication/session model, cluster/tenant isolation model, telemetry retention and partitioning, agent identity rotation, WebSocket fanout strategy, and upgrade compatibility policy before implementation. Record decisions in `DECISIONS.md`.
