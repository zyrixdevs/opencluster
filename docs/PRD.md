# OpenCluster Product Requirements

**Status:** Phase 1 dashboard scope. The dashboard is specified here; implementation is in progress and no dashboard capability should be treated as available until it is present in the repository and verified.

## Product vision

OpenCluster aims to give self-hosters and small infrastructure teams one place to understand and eventually operate heterogeneous compute clusters. The long-term product is a self-hosted control plane. Phase 1 delivers the permanent standalone browser dashboard, currently backed by a validated persistent local provider. Seeded hardware telemetry remains sample data; the UI is not a disposable prototype.

## Users and use cases

- **Homelab operator:** explore cluster and node health, resource use, alerts, and recent activity in one interface.
- **Small platform team:** organize nodes and inspect task and agent views as a demonstrable interaction model.
- **Contributor/integrator:** develop dashboard components against typed local data contracts before a backend is selected.

These use cases describe the dashboard experience. They do not imply connectivity to real infrastructure.

## Phase 1 scope: standalone dashboard

The dashboard is a local web application built with React, TypeScript/TSX, Vite, Tailwind CSS, shadcn/ui patterns, Lucide React, TanStack Query, Zustand, Recharts, React Router, self-hosted Sora and Inter fonts, Framer Motion, GSAP, Lenis, and Three.js for a lazy-loaded Mission Control globe. React Flow powers the editable Agents and Automation canvases.

The application runs without a backend, account, cloud service, node agent, or external service. Typed repositories use IndexedDB for structured local records and localStorage for non-sensitive preferences. Seed fixtures initialize an empty workspace only; data-access contracts are the boundary for future local/cloud APIs. Hardware telemetry and connectivity health stay clearly marked as sample data until services exist.

### Required dashboard areas

- **Home:** greeting, selected-cluster summary, node status, resource utilization, recent activity, alerts, AI-agent summary, and meaningful quick actions.
- **Mission Control:** selectable coordinator and worker nodes, animated connections, node details, cluster switching, pan/zoom, and fullscreen visualization. All values and statuses are simulated.
- **Clusters:** create, rename, select, and edit demo cluster metadata; organize demo nodes and inspect cluster details.
- **Nodes:** list and detail views with CPU, memory, GPU, disk, network, operating system, uptime, and sample health history; coordinator designation updates local records.
- **Agents:** interactive local relationship canvas with draggable agent nodes, pan/zoom, network and radial modes, a selectable inspector, and persisted agent configuration.
- **Automation:** interactive demo workflow canvas with draggable steps, branches, configuration preview, and simulated run status. No automation is executed.
- **AI Software:** catalog Codex, Claude Code, Hermes Agent, OpenClaw, and future custom integrations. Provide target selection and configuration/install previews; every install action must be clearly labeled as a demonstration and must not install software.
- **Tasks:** simulated task overview, queue, assignment controls, job states, timeline, history, filters, and sorting. No job is executed on a real node.
- **Monitoring:** historical demo CPU, memory, network, storage, and node health views with selectable time ranges. Do not imply live telemetry.
- **Activity:** searchable and filterable demo event timeline and log table with severity categories and notifications.
- **Settings:** appearance, theme, motion, dashboard customization, accessibility, mock-data/demo options, and clearly identified future integration placeholders.

### Interaction and presentation requirements

- Navigation between required areas works, with responsive desktop, tablet, and mobile layouts.
- Visible controls either perform a meaningful local demo action or clearly state that the capability is unavailable.
- Provide keyboard access, visible focus, semantic controls, readable contrast, reduced-motion support, and status cues that do not rely on color alone.
- Use a dark-first, professional infrastructure command-center visual language with restrained motion and legible information density.
- Include reusable navigation, search/command palette, dialogs, tables, charts, node and cluster cards, status indicators, notifications, and loading, empty, and error states where appropriate.

## Explicit exclusions and demo boundaries

Phase 1 does **not** include a backend, authentication service, database, node agent, real cluster connection, remote command execution, live AI software installation, real task execution, cloud dependency, or production telemetry. Demo state and browser preferences are not authoritative operational records. No security, availability, real-time, or infrastructure-management guarantee should be inferred from the interface.

## Later product direction

The eventual platform may add a self-hosted control plane, secure node enrollment, authenticated and authorized telemetry, audit records, integrations, and carefully scoped operations. Those capabilities require separate design decisions and implementation phases; this Phase 1 dashboard does not establish their security or architecture as complete.

Potential future capabilities include:

- Linux node inventory and telemetry collection, initially evaluating Arch Linux and Debian without assuming specific hardware.
- User authentication, role-based authorization, secure enrollment and revocation, and audit logging.
- Historical monitoring, health checks, alerting, log search, and operator-managed retention.
- Scoped GitHub and AI-agent adapters, followed by explicitly authorized workload orchestration.
- Docker Compose local deployment; Kubernetes and cloud integrations only after separate evaluation.

Unrestricted remote shells, arbitrary cross-node command execution, autonomous remediation, GPU scheduling, and cross-cluster federation remain out of scope unless separately reviewed and approved.

## Quality and acceptance criteria

For the Phase 1 dashboard, completion requires:

1. The application runs locally using commands documented against the checked-in package manifest.
2. All required dashboard areas are reachable through working navigation, including Agents and Automation.
3. Topology selection and controls, local cluster management, catalog previews, and task records work against the persistent local provider. Hardware telemetry remains seeded sample data until a backend is available.
4. Monitoring charts render typed historical demo data with clear time ranges and no false live-connectivity claims.
5. Responsive behavior, keyboard access, visible focus, reduced-motion preferences, and performance mode are implemented.
6. Type checking, linting, tests, and a production build pass using checked-in tooling.
7. README and development documentation accurately explain setup, local record persistence, and backend integration limits.

For future control-plane phases, acceptance criteria must additionally define threat model, authorization, enrollment/revocation, data handling, recovery, performance baselines, and operational support before production claims are made.

## Risks and assumptions

- Mock data can be mistaken for real telemetry; persistent labels and clear demo-only language are required.
- UI contracts may evolve when the eventual API is designed; the local-provider boundary should remain explicit and typed.
- Browser storage is suitable only for non-sensitive demo preferences, not secrets or operational state.
- External products and APIs may change; catalog entries are informational placeholders until an integration is implemented and reviewed.
- No performance or reliability targets are asserted for the eventual infrastructure product until measurable workloads and hardware baselines exist.
