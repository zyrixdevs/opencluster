# Proposed Technical Stack

**Status:** Proposal; dependencies have not been selected or installed for an application.

| Area | Starting choice | Rationale and trade-off |
|---|---|---|
| Web | React, TypeScript, Vite | Familiar component ecosystem and fast local development; adds a separate frontend build. |
| UI | Tailwind CSS, shadcn/ui, Lucide React; React Bits selectively | Utility-first styling and composable components; third-party effects must not compromise clarity or accessibility. |
| Client data | TanStack Query; Zustand only for local cross-view state | Query cache handles server state; Zustand should not duplicate server data. |
| Charts | Recharts | React-oriented charts; evaluate density and accessibility with actual telemetry needs. |
| API | Python and FastAPI | Typed schemas and async support; concurrency and blocking work must be managed explicitly. |
| Durable data | PostgreSQL | Transactions and relational integrity; time-series retention strategy remains open. |
| Live updates | WebSockets | Interactive updates; requires authorization, reconnect, and backpressure design. |
| Queue/cache | None initially; Redis only if justified | Avoid an extra service until measured workload requires it. |
| Agent | Lightweight Python/Linux service is an initial candidate | Reuse backend language and system interfaces; assess footprint, permissions, packaging, and native alternatives before committing. |
| Local deployment | Docker Compose | Accessible self-hosted setup; production hardening and persistent data/backup guidance remain necessary. |
| Later deployment | Kubernetes, optional | Deferred until real deployment requirements exist. |

## Engineering conventions proposed

Enable TypeScript strict mode. Use Python type annotations and a project-selected formatter/linter once application code begins. Pin and review dependencies through lockfiles and automated dependency updates. Prefer generated or shared API schemas over duplicated assumptions. Choose semantic versioning after the project publishes releases; use Conventional Commits as a contribution convention. Exact tooling versions are intentionally not specified in this foundation document.

## Alternatives to evaluate

Evaluate Go or Rust for the node agent if packaging size, startup, memory use, or privilege separation makes Python unsuitable. Evaluate a dedicated time-series backend only after query and retention tests. Choose authentication libraries and deployment proxy based on maintained support and threat-model review rather than convenience alone.
