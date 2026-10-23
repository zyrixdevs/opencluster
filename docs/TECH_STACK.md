# Proposed Technical Stack

**Status:** Dashboard choices are selected for Phase 1; backend, database, node-agent, and deployment choices remain proposals.

| Area | Starting choice | Rationale and trade-off |
|---|---|---|
| Web | React, TypeScript, Vite in `dashboard/` | Standalone local app; no backend required for Phase 1. |
| UI | Tailwind CSS, shadcn/ui component patterns, Lucide React; Sora + Inter self-hosted fonts | Utility-first styling and composable components; bundled fonts avoid runtime font CDN requests. |
| Client data | TanStack Query for the typed repository boundary and IndexedDB local provider; Zustand for lightweight cross-view state/preferences | Persistent local records now; future providers must not imply a live connection unless connected. |
| Charts | Recharts | Charts display persisted sample telemetry until a monitoring provider exists. |
| Motion and visualization | Framer Motion for route transitions, GSAP for the Home visual, Lenis for document scroll, Three.js for an optional lazy Mission Control globe; React Flow for editable agent/workflow canvases | Each tool has a narrow role; respect reduced motion, pause scenes when hidden, and keep heavy visualizations route-lazy. See [dashboard performance](DASHBOARD_PERFORMANCE.md). |
| API | Python and FastAPI | Typed schemas and async support; concurrency and blocking work must be managed explicitly. |
| Durable data | PostgreSQL | Transactions and relational integrity; time-series retention strategy remains open. |
| Live updates | WebSockets | Interactive updates; requires authorization, reconnect, and backpressure design. |
| Queue/cache | None initially; Redis only if justified | Avoid an extra service until measured workload requires it. |
| Agent | Lightweight Python/Linux service is an initial candidate | Reuse backend language and system interfaces; assess footprint, permissions, packaging, and native alternatives before committing. |
| Local deployment | Docker Compose | Accessible self-hosted setup; production hardening and persistent data/backup guidance remain necessary. |
| Later deployment | Kubernetes, optional | Deferred until real deployment requirements exist. |

## Engineering conventions proposed

The dashboard enables TypeScript strict mode and uses a committed npm lockfile, Biome, and Vitest. Use Python type annotations when backend code begins. Prefer generated or shared API schemas over duplicated assumptions. Choose semantic versioning after the project publishes releases; use Conventional Commits as a contribution convention.

## Alternatives to evaluate

Evaluate Go or Rust for the node agent if packaging size, startup, memory use, or privilege separation makes Python unsuitable. Evaluate a dedicated time-series backend only after query and retention tests. Choose authentication libraries and deployment proxy based on maintained support and threat-model review rather than convenience alone.
