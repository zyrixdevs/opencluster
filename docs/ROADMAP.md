# Roadmap

**Status:** Phase 0 foundation is complete. Phase 1 dashboard development is the current milestone. No dates or release versions are committed.

## Phase 0 — Repository foundation (complete)

- Establish the repository structure, community policies, project-local Codex guidance, and product/architecture proposals.
- Add documentation validation and contribution workflows.

## Phase 1 — Standalone dashboard (current)

Build a responsive React, TypeScript, and Vite dashboard in `dashboard/`, backed only by typed mock data and local demo preferences.

- Deliver Home, Mission Control, Clusters, Nodes, Agents, Automation, AI Software, Tasks, Monitoring, Activity, and Settings views.
- Support useful demo interactions for cluster metadata, node selection, topology navigation, agent graph and workflow canvases, catalog previews, task controls, filters, and preferences.
- Keep heavy scenes route-split and lazy-loaded; respect reduced-motion, performance, and tab visibility preferences.
- Clearly label simulated data, task execution, and software installation previews.
- Validate with the checked-in type checker, linter, tests, and production build; document local setup using actual package scripts.

**Phase 1 exclusions:** backend, authentication services, database, node agent, real telemetry, remote commands, real software installation, real workload execution, and required cloud services. A completed dashboard is a demo interface, not a functioning infrastructure control plane.

## Phase 2 — Control-plane design and foundation (future)

- Revisit API, database, identity, authorization, enrollment, revocation, audit, telemetry freshness, retention, deployment, and recovery decisions using the dashboard contracts as input.
- Implement a self-hosted control plane only after the security and operational boundaries are reviewed.

## Phase 3 — Linux node agent and read-only telemetry (future)

- Evaluate and implement secure node enrollment and a lightweight Linux service for capability-based host metrics.
- Add authenticated, bounded telemetry transport and operator-visible freshness/failure states.
- Validate on explicitly supported environments before making support claims.

## Later evaluation

Historical monitoring, alerts, log search, scoped GitHub and AI-agent integrations, controlled service operations, job scheduling, Docker Compose packaging, Kubernetes, multi-cluster federation, GPU scheduling, terminal access, automated remediation, and AI-driven workflows require separate design, implementation, and security review. None is promised by the current dashboard milestone.
