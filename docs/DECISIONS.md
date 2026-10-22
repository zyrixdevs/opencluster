# Architecture Decisions

This is a lightweight decision log. Proposals below are not implementation commitments until accepted by maintainers; revise entries when evidence changes.

## Proposed starting decisions

### D-005 — Dashboard-first Phase 1

- **Status:** Accepted for Phase 1.
- **Decision:** Build a standalone React/TypeScript dashboard in `dashboard/`, backed by a typed local mock-data interface. The dashboard demonstrates navigation and workflows only; its install, task, and cluster actions do not control real systems.
- **Reason:** Establish the operator experience and data contracts without adding backend or infrastructure scope.
- **Boundaries:** No backend, authentication service, node agent, remote execution, live installation, or cloud service. Persist only non-sensitive demo preferences in browser storage.
- **Revisit when:** a maintainer approves the next backend/node-agent milestone and its security design.

### D-006 — Page-split visualizations for Phase 1

- **Status:** Accepted for Phase 1.
- **Decision:** Use lazy-loaded pages, SVG/HTML for agent and workflow canvases, and Three.js only for the optional Mission Control globe. Keep Framer Motion, GSAP, and Lenis responsibilities separate and honor reduced-motion, performance mode, and hidden tabs.
- **Reason:** Deliver the requested visual experiences while keeping the initial application route lighter and preserving static/accessibility fallbacks.
- **Revisit when:** production profiles show a need for graph virtualization, a different rendering engine, or tighter resource limits.

### D-001 — Foundation-only scope

- **Status:** Accepted for Phase 0.
- **Decision:** Establish product, architecture, security, and contributor documentation without implementing dashboard or backend features.
- **Reason:** Interfaces and threat boundaries should be reviewed before code commits to them.

### D-002 — Modular monolith as initial control plane

- **Status:** Proposed.
- **Decision:** Begin with one FastAPI control-plane application, a separate web client, PostgreSQL, and independently supervised node agents.
- **Reason:** Keeps initial operations and transactions manageable while preserving protocol boundaries.
- **Revisit when:** scale, fault isolation, or deployment evidence justifies service separation.

### D-003 — PostgreSQL for durable state; no default Redis

- **Status:** Proposed.
- **Decision:** Use PostgreSQL for registry, configuration, audit, and initially selected metrics. Add Redis only for demonstrated queue/fanout/cache needs.
- **Reason:** Avoid an unnecessary operational dependency before workload characteristics exist.
- **Revisit when:** measured volume, retention, or delivery guarantees require another store/service.

### D-004 — Read-mostly MVP; no arbitrary shell

- **Status:** Proposed.
- **Decision:** Keep initial node operations to enrollment and telemetry; exclude arbitrary remote shell and autonomous remediation.
- **Reason:** Remote execution has a large security impact and is not needed to establish visibility.
- **Revisit when:** a specific narrow operation has authorization, audit, confirmation, and threat review.

## Pending decisions

- Authentication/session mechanism and role model.
- Single-cluster versus multi-tenant data boundary.
- Agent language, protocol encoding, identity provisioning, and credential rotation.
- Metric retention, schema, and possible time-series storage.
- Supported production deployment topology and backup/restore commitments.
- API compatibility, release/versioning policy, and CI toolchain.
