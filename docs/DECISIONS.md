# Architecture Decisions

This is a lightweight decision log. Proposals below are not implementation commitments until accepted by maintainers; revise entries when evidence changes.

## Proposed starting decisions

### D-010 — Reuse dashboard motion stack for premium transitions

- **Status:** Accepted, 2026-10-25.
- **Decision:** Keep Framer Motion for route/component transitions, Recharts for analytics, and the existing reduced-motion/performance preferences. Centralize shared timing/easing in `dashboard/src/animations/motion.ts`; use the View Transitions API for a 520ms circular theme reveal with an immediate fallback.
- **Reason:** Apply the supplied dashboard motion references while preserving local state, canvas editors, routing, and accessibility.
- **Limits:** The View Transitions API is browser-dependent; fallback changes theme instantly. WebGL/canvas performance was not profiled on physical hardware.

### D-009 — Wise-inspired dashboard visual system

- **Status:** Accepted, 2026-10-23.
- **Decision:** Adapt the supplied Wise design reference into a light sage canvas, white rounded cards, warm near-black type, lime-green primary actions, and a matching dark theme. Use bundled Inter Variable rather than the proprietary Wise Sans font. Preserve OpenCluster's navigation, data hierarchy, status semantics, and local-only scope.
- **Reason:** Apply the requested visual direction without borrowing Wise product copy or making the infrastructure dashboard resemble a money-transfer flow.
- **Limits:** This is an inspired visual adaptation, not a Wise brand asset or affiliation. Contrast and browser visual review remain to be completed.

### D-007 — Permanent dashboard with browser-local provider

- **Status:** Accepted, 2026-10-22; supersedes the prototype wording in D-005.
- **Decision:** Phase 1 is the permanent frontend application. Structured local records use IndexedDB with validation and seed only an empty workspace; localStorage is limited to non-sensitive preferences. Sample hardware telemetry is explicitly labeled.
- **Reason:** Cluster, node, graph, workflow, and configuration editing should work before backend services exist and survive reloads.
- **Limits:** No backend, authentication, node agent, live telemetry, remote command, installation, or workflow execution is implemented.

### D-008 — React Flow for editable canvases

- **Status:** Accepted, 2026-10-22; supersedes the SVG/HTML canvas preference in D-006 for Agents and Automation.
- **Decision:** Use `@xyflow/react` for both editors, with separate domain schemas and persistence. Keep the optional Three.js globe route-lazy.
- **Reason:** Both canvases require genuine graph editing, keyboard access, validation, and shared pan/zoom behavior.

### D-005 — Dashboard-first Phase 1

- **Status:** Superseded by D-007.
- **Decision:** Build a standalone React/TypeScript dashboard in `dashboard/`, backed by a typed local mock-data interface. The dashboard demonstrates navigation and workflows only; its install, task, and cluster actions do not control real systems.
- **Reason:** Establish the operator experience and data contracts without adding backend or infrastructure scope.
- **Boundaries:** No backend, authentication service, node agent, remote execution, live installation, or cloud service. Persist only non-sensitive demo preferences in browser storage.
- **Revisit when:** a maintainer approves the next backend/node-agent milestone and its security design.

### D-006 — Page-split visualizations for Phase 1

- **Status:** Superseded by D-008 for editable canvases; retained for lazy page/scene loading and the globe boundary.
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
