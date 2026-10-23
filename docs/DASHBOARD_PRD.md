# OpenCluster — Dashboard Product Requirements Document

**Document ID:** OC-DASH-PRD-001  
**Version:** 1.0 — Phase 1 specification  
**Status:** Phase 1 implementation in progress
**Owner:** ZYRIX DEVS  
**Project:** `https://github.com/zyrixdevs/opencluster`  
**Implementation scope:** `dashboard/` only  
**Last updated:** 2026-10-22

> **Delivery clarification:** Phase 1 is the permanent OpenCluster frontend, not a disposable demo. It currently runs against a validated, persistent browser-local provider. Seed records and hardware telemetry are labeled as sample data. Until backend services exist, the frontend must not connect to real nodes, perform software installation, remote execution, cloud account management or AI inference.

## 1. Executive summary

OpenCluster is an open-source interface for managing computer clusters, individual Linux/other compute nodes, AI agents, automation flows and infrastructure health. Its product model supports **local/self-hosted** and **cloud-connected** installations using the same dashboard UI. Phase 1 builds the permanent standalone dashboard with a local data provider first; its provider contracts are the integration boundary for future local and cloud services.

**Product promise:** A powerful, approachable *mission control* for systems that would otherwise require many terminals, tabs, scripts and monitoring tools. The experience must communicate truthfully which actions are real and which are simulated.

**One-line vision:** *One dashboard. Every node. Total control.* “Control” is a future product aspiration, not a Phase 1 claim.

## 2. Problem, audience and jobs to be done

### Problems

- Home lab operators have limited at-a-glance visibility across multiple computers.
- AI tool and agent operators switch among disjoint consoles with no unified visual overview.
- Existing infrastructure interfaces can be overly complex for small, mixed-OS clusters.
- Workflow builders, agent relationship maps and hardware monitoring are typically separate products.
- Attractive monitoring dashboards often lack usable deep interactions; technical tools often lack readable hierarchy.

### Primary user personas

1. **Solo developer / home lab owner:** 2–10 computers, mixed Arch Linux/Debian, wants health, tasks and software overview in one place.
2. **AI agent builder:** wants a visual relationship map connecting agents, models, tools, memory and jobs; wants an editable workflow canvas.
3. **Small-team operator:** tracks multiple clusters, compares hardware capacity, and inspects warnings.
4. **Open-source contributor:** needs clear code separation, typed mock APIs, docs, tests and manageable components.

### Top user jobs

- Understand cluster health within five seconds of arriving.
- Identify *which* node or agent requires attention and why.
- Explore topology visually without sacrificing precise tabular detail.
- Create a demo automation with conditional branches, save it and restore it.
- Explore relationships among AI agents in graph and radial views.
- Preview an installation or task without mistaking it for a real remote action.

## 3. Scope and non-goals

### In scope: Phase 1

- `dashboard/` Vite + React + TypeScript app, independent of any server.
- Complete application shell and ten navigable pages.
- Design system, polished motion, responsive layouts and accessibility.
- Demo cluster and node models, deterministic telemetry, mock activity streams.
- Editable demo clusters, node groups, and preferences with persistence.
- **Mission Control** interactive topology with node selection, inspector and optional globe presentation.
- **Agents** draggable graph with dual **network** and **radial/constellation** visualization modes; inspect agent relations.
- **Automation** n8n-inspired visual editor with working drag/connect/configure/save/load/undo/redo and a **simulated** run preview.
- AI Software catalog with reviewable **preview-only** deployment wizard.
- Search/command palette, keyboard navigation, coherent loading/empty/error states.
- Local docs, examples, tests, production build, extensible data service layer.

### Explicitly out of scope: Phase 1

- Backend servers, PostgreSQL, real-time network ingestion, authentication and real user accounts.
- Node enrollment agents, remote shell, system configuration, OS package installs, container deployment, real task execution.
- Actual Codex/Claude Code/Hermes/OpenClaw adapters and integrations.
- Actual n8n execution engine or n8n-compatible workflow format.
- Real geographic geolocation/IP tracking, cloud resource billing, production security enforcement.
- Billing, organization management, server-side collaboration and multi-user sync.

### Future operating modes (architect for, do not build)

- **Standalone local:** user hosts dashboard plus eventual control plane locally.
- **Managed cloud:** user accesses cloud dashboard; securely enrolled agents initiate outbound connections to backend.
- Shared application features, different data adapters and authentication contexts. Do not tightly couple components to either mode.

## 4. Product principles

1. **Truthful states:** seeded sample data and simulated execution must be unmistakably labeled; local record management is real and persistent.
2. **Command center, not wallpaper:** visuals lead to information and action.
3. **Spatial + tabular:** every important visual graph has a textual/list alternative.
4. **Progressive disclosure:** summary first, details on inspection.
5. **Performance-aware spectacle:** cinematic effects only where meaningful; degrade gracefully.
6. **Accessible by default:** keyboard, contrast, screen readers, reduced motion and touch support.
7. **Local-first Phase 1:** local records work without login or network; backend-dependent services stay disconnected.
8. **Open-source maintainability:** clear components, tests, explainable choices, no proprietary dependencies required to run demo.

## 5. Navigation and application routes

| Area | Route | Main purpose |
|---|---|---|
| Home | `/` | Greeting, holographic hero, at-a-glance cluster intelligence |
| Mission Control | `/mission-control` | Interactive topology, globe/network modes, health inspector |
| Clusters | `/clusters`, `/clusters/:clusterId` | Create demo clusters and inspect hierarchy |
| Nodes | `/nodes`, `/nodes/:nodeId` | Inventory, health and hardware details |
| Agents | `/agents` | Agent relationship graph + radial constellation |
| Automation | `/automation`, `/automation/:workflowId` | Visual workflow editor and saved demo flows |
| AI Software | `/software` | Supported software catalog and install previews |
| Monitoring | `/monitoring` | Comparative telemetry, charts and thresholds |
| Activity | `/activity` | Logs, event timeline and simulated notifications |
| Settings | `/settings` | Theme, visual quality, motion, mock data and preferences |

Routes should preserve meaningful UI state with URL search params where practical (e.g. `cluster`, `node`, `view`, `timeRange`), so refresh and browser back work.

## 6. Functional requirements (P0/P1/P2)

**Priority:** P0 must ship in Phase 1; P1 desirable during polish; P2 is explicitly deferred.

### FR-001 Application shell (P0)

- Persistent collapsible sidebar or navigation rail; top bar with cluster selector, search, notifications, visual quality control.
- Deep links, active-route indicator, breadcrumbs on detail pages, responsive mobile navigation.
- Accessible command palette (`Ctrl/⌘ + K`) that navigates to pages and filters demo entities.
- Demo-mode indicator visible globally.
- Every visible button either performs a usable action or shows a clear, nondeceptive explanation.

**Acceptance:** Keyboard-only user can reach every page and use the main menus; refresh on a deep link succeeds.

### FR-002 Home (P0)

- Personalized-looking but local-only greeting (`Operator` default; editable display name).
- Hero includes 3D/simulated JARVIS signal-orb from reference 7, with graphic fallback.
- Summary KPIs for clusters, online nodes, alerts, average CPU and agents.
- Cluster cards; quick route actions; recent event list; AI automation overview.
- Scope selector for all clusters vs one selected cluster.

**Acceptance:** Selecting a cluster updates appropriate cards; pausing animation does not hide content; hero loads without blocking text.

### FR-003 Mission Control (P0)

- Interactive node topology graph with visible coordinator/worker roles (not a mandatory master model).
- Select, focus, pan, zoom, fit-to-view; inspector panel showing OS, telemetry, health, connections and jobs.
- Toggle between **Topology** and **Globe** view. In Phase 1 globe uses fabricated/demo placement and explicitly says so; never imply geolocation detection.
- Status legend, filters, offline state and connection-failure indication.

**Acceptance:** Selecting node A updates details for node A; topology remains usable with 50 demo nodes; the 3D globe has a non-WebGL fallback.

### FR-004 Clusters (P0)

- Create, rename, archive/delete **demo** cluster, inspect members, set optional preferred coordinator for demonstration.
- Create form validates title, prevents duplicate identifiers, explains deletion.
- Clusters persisted locally; new cluster visible in selector and summary.

**Acceptance:** Create → navigate → rename → reload → change retained; undo or confirmation before destructive local deletion.

### FR-005 Nodes (P0)

- Inventory grid and table; sorting and filters (cluster, OS, online status, node role).
- Node detail displays CPU, RAM, GPU when available, storage, network, uptime and heartbeat timestamp.
- Show `N/A` when GPU/metric unavailable instead of `0`.
- Metrics are simulated/deterministic and visibly labelled.

**Acceptance:** Node filtering works without visual graph; units, times and percentages display correctly.

### FR-006 AI Agent Canvas (P0)

- Graph mode: draggable agents, tools, LLMs, memory and jobs with labeled edges, connection directions and inspector.
- Radial mode: concentric structure or orbit layout inspired by reference 5, preserving selection/context across mode switch.
- Zoom/pan/fit, selection, filters, grouped nodes, minimap as useful.
- Graph layouts persist locally per example workspace.
- Graph represents **relationships**, not live agent reasoning or execution.

**Acceptance:** Dragging maintains edge attachment; changing mode retains node selection and selected inspector; keyboard-accessible entity list is supplied.

### FR-007 Automation Canvas (P0)

- React Flow-based editor with node palette; add via click or drag/drop; connect handles.
- Node types: Manual Trigger, Schedule Trigger (demo), Agent Task, Condition, Delay (demo), Data Transform, Notify (demo), Success, Failure.
- Inspector edits labels and typed config; validation catches disconnected required inputs, missing required settings and incompatible connection types.
- Auto-save or explicit save (choose and communicate clearly), rename, duplicate, import/export **OpenCluster demo JSON**, undo/redo, delete, pan/zoom, mini-map.
- Simulated run highlights nodes and shows synthetic logs without invoking real services.

**Acceptance:** A branching example can be built, saved, reloaded and exported/imported; graph syntax validated; simulator clearly identifies itself as simulated.

### FR-008 AI Software (P0)

- Catalog for Codex, Claude Code, Hermes Agent, OpenClaw, plus generic placeholders, with categories and compatibility notes where verified.
- Installation preview wizard: select tool → select demo nodes → review requested configuration → show *Simulation only / Nothing installed* result.
- No user-provided API keys, credentials or arbitrary shell commands in Phase 1 forms.

**Acceptance:** Preview never performs a network or OS action; result is explicitly labeled preview.

### FR-009 Monitoring (P0)

- Aggregated cluster/node telemetry charts and cards using Recharts.
- Time range presets (15m, 1h, 24h, 7d) driven by seeded sample series rather than random spikes each render.
- Clear metric units, axes, hover tooltips, thresholds and zero-data states.
- Node comparison and cluster filters.

**Acceptance:** Chart values stable under re-render; accessibility summary available in text/table; no unsupported data is fabricated as real.

### FR-010 Activity (P0)

- Event timeline and log-style table; search, severity/source/status filters; sort and drill-down.
- Messages distinguish demo actions from seeded events. Optional “generate demo event” action is local only.
- Long lists are virtualized where necessary.

**Acceptance:** Filters and details work; dates and local timezone consistently formatted.

### FR-011 Settings (P0)

- Theme: dark default, optional light/high-contrast if feasible.
- Motion: system / reduced / cinematic.
- Visual quality: automatic / performance / high.
- Demo reset (with confirmation), sample dataset selector, display name and UI density.
- Persist non-sensitive settings in browser storage with schema version/migration.

**Acceptance:** Reduced motion disables continuous 3D movement; reset returns data/settings to defaults, explicitly warned.

### FR-012 Cross-cutting (P0)

- Responsive desktop/tablet/mobile designs; empty/error/skeleton states; toasts and confirmation dialogs.
- No magic numbers in component rendering; standardized data types, theme tokens and sizing.
- Tests, accessibility checks, lint, TypeScript strict validation and production build.

### P1 extras

- Guided onboarding, “demo tour,” advanced graph search, saved graph viewpoints, URL-shareable visual filters, dashboard card arrangement, contextual keyboard shortcuts, chart screenshot/export, tutorials and UI preference presets.

### P2/future integrations (NOT Phase 1)

- Real account auth, cloud control plane, node agent installation and pairing, streaming metrics, remote commands, real scheduling and task execution, agent adapters, marketplace, organizational roles and multi-user collaboration.

## 7. Seeded demo scenario

Default dataset: **Helena Lab** or **OpenCluster Demo Lab** (avoid personal identifiers): five computers, one optional coordinator and four workers. Example OS distribution: one Arch Linux, four Debian. Include another small demo cluster to demonstrate cross-cluster navigation. Sample agents, workflows, jobs, events and software availability must be internally consistent. CPU/RAM/time series should derive from seeded input and timestamps, not `Math.random()` on every render.

Statuses: `online`, `offline`, `degraded`, `maintenance`, `unknown`. Agent statuses: `idle`, `running`, `paused`, `failed`, `offline`, `unknown`. Clearly mark seeded data “DEMO”.

## 8. Product data entities

- **Cluster:** ID, name, description, tags, optional coordinator node ID, member node IDs, created/updated times.
- **Node:** ID, cluster ID, hostname, display name, role, OS/arch, capabilities, status, lastSeen, hardware, metrics.
- **MetricSeries:** metric name, unit, time range, ordered timestamp/value points, sample provenance (`demo`).
- **Agent:** ID, name, kind, model/tool/memory links, status, optional node binding, metadata.
- **Relation:** source ID, target ID, type, direction, visual metadata.
- **Workflow:** ID, name, version, graph nodes/edges, config, created/updated.
- **Run:** run ID, workflow ID, `simulated` flag, steps with timestamps/status/log messages.
- **Software:** ID, supported platforms (documented, not guessed), icon, category, descriptions, preview steps.
- **ActivityEvent:** ID, source, cluster/node/agent ID, severity, text, timestamp, `demo` flag.
- **Settings:** display name, theme, motion preference, render quality, density, schema version.

## 9. UX constraints and reference treatment

**Ref 1** is the principal UI composition: editorial typography, measured glass, rounded modules and dense KPIs. **Refs 2–3** guide global/network holograms. **Refs 4–5** guide relationship map and radial constellation. **Ref 6** specifies workflow canvas mechanics. **Ref 7** guides a JARVIS-like abstract energy structure (no copyrighted JARVIS identity, audio or exact film recreation). All images are *inspiration*, not assets to embed or designs to copy verbatim.

Visual character: near-black graphite/navy, restrained mint/cyan for healthy state, amber caution and red error, subtle light/glass where appropriate. Typography: **Sora** for hero/headings, **Inter** for UI/body, optional **JetBrains Mono** for hostnames/metrics. Accessibility takes precedence over glow and translucent overlays.

## 10. Non-functional requirements and quality targets

The following are **engineering targets to test**, not promised results:

| Area | Target / requirement | Verification |
|---|---|---|
| Browser | Current stable Chromium, Firefox, Safari | Manual smoke / Playwright |
| Responsiveness | 360px mobile through 1920px+ desktop | Visual regression at key breakpoints |
| Interactions | 60 FPS target on capable desktops, graceful lower-power fallback | Performance profiling on reference devices |
| Startup | Fast initial text/UI shell; heavy routes split into chunks | Bundle report / Web Vitals |
| Graph | Smooth dragging and zooming on representative 30–100 node dataset | Browser profiler |
| 3D | Dynamically scaled DPR, visibility pause, reduced-motion fallback | GPU / CPU trace |
| Accessibility | WCAG 2.2 AA-oriented semantic UI, focus and contrast | axe + keyboard audit |
| Offline | Dashboard and seeded demo work after initial load with cached assets where configured | Offline smoke test |
| Persistence | Browser-storage migration and corrupt-state recovery | Unit tests |
| Reliability | Graph state not lost on route changes/reloads | E2E test |
| Security | No arbitrary code execution, no tokens, no hidden privileged actions | Code review |

Use `prefers-reduced-motion` and quality settings to adjust visual intensity. Decorative scenes must not capture keyboard focus or obscure meaningful controls. Avoid a permanent WebGL canvas rendering in the global shell.

## 11. Testable acceptance journeys

1. **First open:** enter `/`, see readable cards, demo label, working navigation and optional 3D hero fallback.
2. **Cluster management:** create cluster “Lab B”; assign node; switch cluster; refresh; state retained.
3. **Topology inspection:** open Mission Control; select node; inspector matches; switch view; selection stays; `Fit view` works.
4. **Agent mapping:** drag tool node; see attached edge update; radial mode; inspect a linked model; refresh restores graph.
5. **Workflow authoring:** add manual trigger, agent step and condition; connect success/failure branches; edit config; validation; save; refresh; mock run highlights steps; export/import produces same graph.
6. **Software preview:** choose Hermes; select demo target; see “Simulation only”; finish without actual installation.
7. **Accessibility:** complete primary workflows by keyboard; reduced-motion mode presents stable visuals.
8. **Failure:** disable WebGL; fallback and all information remain available; corrupt browser demo state triggers safe recovery.

## 12. Milestones and release gates

- **M0 — Foundation:** app scaffold, strict TS, routes, tokens, shared UI, data gateway, docs.
- **M1 — UI shell + Home:** fully navigable product, cards, seeded data, Jarvis-style visual with fallback.
- **M2 — Clusters + Nodes + Monitoring:** state flows, detail panels, stable charts.
- **M3 — Mission Control:** graph topology, inspector, optional globe, responsive fallback.
- **M4 — Agents:** graph canvas + radial view, selection/persistence.
- **M5 — Automation:** complete demo workflow editor, validation, simulation and persistence.
- **M6 — Software + Activity + Settings:** end-to-end previews and system preferences.
- **M7 — Hardening:** accessibility, profiling, tests, docs and release polish.

**Exit gate:** no misleading “live” labels; all pages usable; no critical lint/type/build/test issues; responsive; accessible; docs match actual functionality.

## 13. Risks, mitigations and unresolved decisions

| Risk | Mitigation |
|---|---|
| Heavy visual effects overshadow usability | Progressive enhancement; preserve readable cards and inspector first |
| Library overlap causes animation conflicts | Assign one animation ownership per component; central motion policy |
| React Flow rerender performance | Memoized node types and stable callbacks; don't subscribe globally to every node change |
| 3D fails on low-end browsers | SVG/static scene, on-demand render, WebGL detection, error boundary |
| Demo actions resemble real actions | Persistent “DEMO” status and inline preview confirmation |
| Graph editor design too complex | Deliver graph baseline and save/load before radial polish |
| n8n confusion | Specify n8n-inspired interactions; no compatibility claim |
| Local vs cloud scope leaks into Phase 1 | Typed transport interfaces; mock implementation only |

**Decisions for later:** backend technology, local agent language, auth vendor/model, plugin integration execution policy, real metrics protocol, distributed execution engine, final domain, brand asset license. None blocks dashboard implementation.

## 14. References for implementers

- React Flow: https://reactflow.dev/learn/advanced-use/performance and https://reactflow.dev/examples/interaction/save-and-restore
- Motion for React: https://motion.dev/docs/react and https://motion.dev/docs/react-motion-config
- React Three Fiber scaling: https://r3f.docs.pmnd.rs/advanced/scaling-performance
- Lenis: https://github.com/darkroomengineering/lenis

External APIs/libraries should be checked against installed package versions before coding.
