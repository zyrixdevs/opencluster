# OpenCluster — Dashboard Architecture & TSX Component Map

**Document ID:** OC-DASH-ARCH-001  
**Version:** 1.0  
**Status:** Implementation blueprint  
**Repository:** `https://github.com/zyrixdevs/opencluster`  
**Scope:** create **only** the top-level `dashboard/` application and compatible documentation  
**Last updated:** 2026-10-22

> **Implementation status:** This document began as the dashboard architecture specification. Phase 1 now uses the implemented structure under `dashboard/src/`: `data/localProvider.ts` (IndexedDB and validation), `data/providerContracts.ts` (provider contracts), TanStack Query collection hooks, Zustand preferences, and feature pages. Proposals below describe intent; the shipped structure and provider behavior take precedence where the original component map differs.

## 1. Architectural decision record — summary

OpenCluster Phase 1 is the permanent client application using **Vite + strict TypeScript + React Router**. Features access records through typed repository contracts and a persistent IndexedDB provider; localStorage is reserved for lightweight preferences. Deterministic seed records initialize an empty workspace only. Future local and cloud providers implement these contracts without requiring page components to change. There is **no backend, authentication server, privileged node agent, or real-time network service in Phase 1**.

**Technology roles:**

| Area | Recommended choice | Responsibility |
|---|---|---|
| Application | React, TypeScript, Vite | UI runtime and tooling |
| Navigation | React Router | Routes, deep links, nested layouts, URL state |
| Styles | Tailwind CSS + shadcn/ui | TSX-first component styling, accessible primitives |
| Icons/fonts | Lucide React, Sora, Inter, optional JetBrains Mono | Visual system |
| Async data contract | TanStack Query | Data caching hooks; IndexedDB provider now, remote provider later |
| Local UI state | Zustand | Selected entities, inspector visibility, preferences |
| Spatial graph editors | `@xyflow/react` | Agents graph and Automation canvas interaction |
| 3D scenes | Three.js + React Three Fiber (R3F), Drei if needed | Home hologram and Mission Control globe |
| Plots | Recharts | Monitoring and lightweight metrics |
| UI motion | Motion for React (`motion/react`) | Cards, panels, route/page transitions |
| Sequenced motion | GSAP | Rare hero choreography |
| Smooth scroll | Lenis | Selected scrolling surfaces, **not flow canvas** |
| Specialty micro-effects | anime.js | Limited SVG effects when justified |
| Component inspiration | React Bits | Curated, vendored/adapted with accessible fallbacks |
| Icons/exports | Static SVG assets | Non-WebGL visual fallbacks |
| Tests | Vitest + Testing Library + Playwright + axe | Logic, accessibility and end-to-end flows |
| Quality | ESLint, Prettier, TypeScript strict | Reliable contributions |

**Do not install/initialize every heavy graphics library globally.** Feature routes own lazy imports; packages are introduced when their features are implemented. Audit compatibility and bundle output before lockfile changes.

## 2. Monorepo boundary and exact folders

Do not rename `dashboard` to `frontend`, `dsh` or `dash`; the confirmed top-level folder is **`dashboard/`**. Keep any existing root `AGENTS.md`, `.codex/`, `.github/` and repository docs intact. Add documentation or adjust references only after inspecting the repo.

```text
opencluster/
├── dashboard/
│   ├── public/
│   │   ├── icons/
│   │   ├── images/                   # Original/licensed static visual assets
│   │   └── scene-fallbacks/          # SVGs/posters for weak/no WebGL
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx
│   │   │   ├── AppProviders.tsx
│   │   │   ├── router.tsx
│   │   │   ├── routes.ts
│   │   │   ├── error-boundary.tsx
│   │   │   └── AppShell.tsx
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui and app-level primitives
│   │   │   ├── layout/                # Sidebar, Topbar, PageHeader, Drawer
│   │   │   ├── feedback/              # DemoBadge, ErrorState, EmptyState, Toast
│   │   │   ├── charts/                # ChartFrame, metric tooltip, chart legend
│   │   │   ├── data-display/          # StatusBadge, KPICard, NodePill, Table
│   │   │   ├── navigation/            # CommandPalette, ClusterSwitcher
│   │   │   └── canvas/                # Shared graph controls, inspector shell
│   │   ├── features/
│   │   │   ├── home/
│   │   │   │   ├── pages/HomePage.tsx
│   │   │   │   ├── components/WelcomeHero.tsx
│   │   │   │   ├── components/HologramStage.tsx
│   │   │   │   ├── components/ClusterSummaryGrid.tsx
│   │   │   │   └── scenes/SignalOrbScene.tsx
│   │   │   ├── mission-control/
│   │   │   │   ├── pages/MissionControlPage.tsx
│   │   │   │   ├── components/MissionToolbar.tsx
│   │   │   │   ├── components/NodeInspector.tsx
│   │   │   │   ├── topology/TopologyCanvas.tsx
│   │   │   │   ├── globe/ClusterGlobeScene.tsx
│   │   │   │   └── globe/GlobeFallback.tsx
│   │   │   ├── clusters/
│   │   │   │   ├── pages/ClustersPage.tsx
│   │   │   │   ├── pages/ClusterDetailsPage.tsx
│   │   │   │   ├── components/ClusterCard.tsx
│   │   │   │   └── components/ClusterFormDialog.tsx
│   │   │   ├── nodes/
│   │   │   │   ├── pages/NodesPage.tsx
│   │   │   │   ├── pages/NodeDetailsPage.tsx
│   │   │   │   ├── components/NodeInventory.tsx
│   │   │   │   └── components/NodeMetricsPanel.tsx
│   │   │   ├── agents/
│   │   │   │   ├── pages/AgentsPage.tsx
│   │   │   │   ├── components/AgentInspector.tsx
│   │   │   │   ├── graph/AgentGraphCanvas.tsx
│   │   │   │   ├── graph/AgentNode.tsx
│   │   │   │   ├── radial/AgentConstellation.tsx
│   │   │   │   └── lib/radial-layout.ts
│   │   │   ├── automation/
│   │   │   │   ├── pages/AutomationListPage.tsx
│   │   │   │   ├── pages/WorkflowEditorPage.tsx
│   │   │   │   ├── canvas/WorkflowCanvas.tsx
│   │   │   │   ├── canvas/nodes/TriggerNode.tsx
│   │   │   │   ├── canvas/nodes/AgentTaskNode.tsx
│   │   │   │   ├── canvas/nodes/ConditionNode.tsx
│   │   │   │   ├── components/NodePalette.tsx
│   │   │   │   ├── components/WorkflowInspector.tsx
│   │   │   │   ├── components/WorkflowToolbar.tsx
│   │   │   │   ├── lib/validate-workflow.ts
│   │   │   │   ├── lib/simulate-workflow.ts
│   │   │   │   └── lib/serialize-workflow.ts
│   │   │   ├── software/
│   │   │   │   ├── pages/SoftwarePage.tsx
│   │   │   │   ├── components/SoftwareCatalog.tsx
│   │   │   │   └── components/InstallPreviewWizard.tsx
│   │   │   ├── monitoring/
│   │   │   │   ├── pages/MonitoringPage.tsx
│   │   │   │   ├── components/MetricCharts.tsx
│   │   │   │   └── components/NodeComparison.tsx
│   │   │   ├── activity/
│   │   │   │   ├── pages/ActivityPage.tsx
│   │   │   │   └── components/EventTimeline.tsx
│   │   │   └── settings/
│   │   │       ├── pages/SettingsPage.tsx
│   │   │       └── components/VisualQualitySettings.tsx
│   │   ├── data/
│   │   │   ├── contracts/             # Typed interfaces to swap mock for API
│   │   │   │   ├── ClusterGateway.ts
│   │   │   │   ├── NodeGateway.ts
│   │   │   │   ├── AgentGateway.ts
│   │   │   │   ├── WorkflowGateway.ts
│   │   │   │   └── MonitoringGateway.ts
│   │   │   ├── mock/                  # Deterministic client-side implementations
│   │   │   │   ├── seeds/
│   │   │   │   ├── MockGateway.ts
│   │   │   │   ├── mock-telemetry.ts
│   │   │   │   └── persistence.ts
│   │   │   ├── data-provider.tsx
│   │   │   └── query-keys.ts
│   │   ├── domain/
│   │   │   ├── cluster.ts
│   │   │   ├── node.ts
│   │   │   ├── metrics.ts
│   │   │   ├── agent.ts
│   │   │   ├── workflow.ts
│   │   │   ├── software.ts
│   │   │   └── event.ts
│   │   ├── state/
│   │   │   ├── use-ui-store.ts
│   │   │   ├── use-settings-store.ts
│   │   │   └── use-graph-ui-store.ts
│   │   ├── hooks/
│   │   │   ├── use-clusters.ts
│   │   │   ├── use-nodes.ts
│   │   │   ├── use-telemetry.ts
│   │   │   ├── use-motion-preferences.ts
│   │   │   └── use-visibility.ts
│   │   ├── motion/
│   │   │   ├── motion-tokens.ts
│   │   │   ├── use-hero-timeline.ts
│   │   │   ├── effects-registry.ts
│   │   │   └── reduced-motion.ts
│   │   ├── styles/
│   │   │   ├── index.css              # Tailwind imports/base
│   │   │   ├── tokens.css             # Color/font/radius semantic tokens
│   │   │   └── fonts.css
│   │   ├── lib/
│   │   │   ├── storage.ts
│   │   │   ├── format.ts
│   │   │   ├── id.ts
│   │   │   └── errors.ts
│   │   ├── tests/
│   │   │   ├── fixtures/
│   │   │   ├── unit/
│   │   │   └── integration/
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── e2e/
│   ├── .env.example                  # No secrets required for Phase 1
│   ├── components.json               # shadcn/ui configuration
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   └── README.md
├── docs/                              # Existing docs; extend rather than overwrite
│   ├── DASHBOARD_PRD.md
│   ├── DASHBOARD_UI_UX_SPEC.md
│   └── DASHBOARD_ARCHITECTURE.md
├── AGENTS.md                          # Preserve and align existing instructions
└── .codex/                            # Existing Codex configuration
```

The structure above is a target, not a mandate to create empty files. Produce meaningful modules only when used. Co-locate feature tests beside components when more maintainable. No separate `frontend/` or `backend/` directories.

## 3. Runtime composition and component tree

```text
main.tsx
└─ AppProviders
   ├─ ErrorBoundary
   ├─ QueryClientProvider
   ├─ DataGatewayProvider (MockGateway instance)
   ├─ MotionConfig (respect reduced motion)
   └─ RouterProvider
      └─ AppShell
         ├─ AppSidebar
         ├─ AppTopbar
         │  ├─ ClusterSwitcher
         │  ├─ CommandPaletteTrigger
         │  ├─ DemoBadge
         │  └─ NotificationMenu
         ├─ RouteOutlet
         │  ├─ HomePage → WelcomeHero/HologramStage → SignalOrbScene (lazy)
         │  ├─ MissionControlPage → TopologyCanvas OR ClusterGlobeScene (lazy)
         │  ├─ ClustersPage / ClusterDetailsPage
         │  ├─ NodesPage / NodeDetailsPage
         │  ├─ AgentsPage → AgentGraphCanvas OR AgentConstellation
         │  ├─ AutomationListPage / WorkflowEditorPage → WorkflowCanvas
         │  ├─ SoftwarePage → InstallPreviewWizard
         │  ├─ MonitoringPage → MetricCharts
         │  ├─ ActivityPage → EventTimeline
         │  └─ SettingsPage → VisualQualitySettings
         └─ GlobalOverlays → Toasts / Dialogs / Confirmation / InspectorPortal
```

Lazy-load **all page route modules**, plus separate chunks for R3F, globe, agent graph and workflow editor. Shared shell never depends on Three.js imports. Different canvases should mount only when active.

## 4. Data flow and isolation

```text
USER ACTION  → UI component → typed hook / command
                        ↓
                TanStack Query (reads)
                Zustand (ephemeral UI state)
                        ↓
                 Domain gateway interface
                        ↓
                IndexedDB local provider (Phase 1)
                        ↓
      deterministic seed + versioned local persistence

FUTURE: MockGateway can be replaced by LocalApiGateway or CloudApiGateway
without rewriting pages or graph components.
```

**Separation of responsibilities:**

- **React components** render, collect input and surface statuses; they do not fetch network data directly.
- **Domain models** hold stable serializable types and transformations.
- **Gateways** expose a typed domain API and are replaceable.
- **TanStack Query** caches async-like reads, updates/query invalidation.
- **Zustand** stores selected cluster, inspector state, theme/performance preferences and per-page viewport metadata—not giant mutable node arrays updated at every drag.
- **React Flow instance/state** owns high-frequency graph editing; persistence occurs on stable events or debounced snapshots, not each pointer-move frame.
- **IndexedDB** holds structured clusters, nodes, telemetry, agents, tasks, activity, software catalog/configuration, workflows and graph layouts. Writes and schema-bound records are validated; initialize migrates valid existing cluster/node records and seeds only empty collections. `localStorage` is reserved for non-sensitive preferences. Browser storage is user-controlled and is not a secret store.

Do not put every metric series into Zustand. Do not treat localStorage as secure. No secrets/tokens are stored in Phase 1.

## 5. Type contracts (example, refine to actual code)

```ts
export type NodeStatus =
  | 'online' | 'offline' | 'degraded' | 'maintenance' | 'unknown';

export type NodeRole = 'coordinator' | 'worker' | 'standalone';

export interface Cluster {
  id: string;
  name: string;
  description?: string;
  nodeIds: string[];
  preferredCoordinatorId?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ComputeNode {
  id: string;
  clusterId: string;
  hostname: string;
  displayName: string;
  role: NodeRole;
  status: NodeStatus;
  os: { name: string; version?: string; architecture: string };
  hardware: {
    cpuModel: string;
    cpuCores: number;
    ramBytes: number;
    gpu?: { model: string; memoryBytes?: number };
    diskBytes?: number;
  };
  lastSeenAt?: string;
}

export interface MetricPoint { at: string; value: number | null }
export interface MetricSeries {
  name: 'cpu' | 'memory' | 'disk' | 'network-in' | 'network-out';
  unit: 'percent' | 'bytes' | 'bytes-per-second';
  points: MetricPoint[];
  source: 'demo';
}

export type AgentKind = 'agent' | 'model' | 'tool' | 'memory' | 'task' | 'service';
export interface AgentEntity {
  id: string;
  name: string;
  kind: AgentKind;
  status: 'idle' | 'running' | 'paused' | 'failed' | 'offline' | 'unknown';
  nodeId?: string;
}
export interface AgentRelation {
  id: string;
  sourceId: string;
  targetId: string;
  kind: 'depends-on' | 'uses' | 'delegates-to' | 'runs-on' | 'produces';
}

export interface WorkflowDocument {
  schemaVersion: 1;
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  updatedAt: string;
  mode: 'demo';
}

export interface DemoRunResult {
  runId: string;
  simulated: true;
  steps: Array<{ nodeId: string; status: 'passed' | 'failed' | 'skipped'; log: string }>;
}
```

Make workflow node types discriminated unions keyed by `type` (e.g., `manualTrigger`, `agentTask`, `condition`, `notification`) with typed config schemas and explicit handles. Use schema validation for user JSON imports. `WorkflowNode` and `WorkflowEdge` are domain types mapped to React Flow display types so future API contract isn't coupled to one visualization library.

## 6. Typed gateway interfaces

```ts
export interface ClusterGateway {
  listClusters(): Promise<Cluster[]>;
  getCluster(id: string): Promise<Cluster | null>;
  createCluster(input: { name: string; description?: string }): Promise<Cluster>;
  updateCluster(id: string, patch: Partial<Pick<Cluster, 'name' | 'description'>>): Promise<Cluster>;
  deleteCluster(id: string): Promise<void>;
}

export interface NodeGateway {
  listNodes(filter?: { clusterId?: string; status?: NodeStatus }): Promise<ComputeNode[]>;
  getNode(id: string): Promise<ComputeNode | null>;
}

export interface WorkflowGateway {
  listWorkflows(): Promise<WorkflowDocument[]>;
  getWorkflow(id: string): Promise<WorkflowDocument | null>;
  saveWorkflow(document: WorkflowDocument): Promise<WorkflowDocument>;
  deleteWorkflow(id: string): Promise<void>;
  simulateWorkflow(id: string): Promise<DemoRunResult>;
}

export interface DashboardGateway {
  clusters: ClusterGateway;
  nodes: NodeGateway;
  workflows: WorkflowGateway;
  // Later: agents, monitoring, software, events, remote control.
}
```

Call methods through hooks, e.g. `useClusters()` based on query key `['clusters']`, `useNode(id)` based on `['node', id]`; mutations invalidate precisely affected keys. Query hooks should not expose server URLs or assume cookies/token storage. Use mock fixtures rather than random runtime network behavior.

## 7. Canvas architecture — Agents and Automation

### 7.1 Shared primitives, not a monolithic graph

Create a shared **CanvasFrame**, **CanvasToolbar**, **GraphInspectorLayout**, **StatusLegend**, **FitViewButton**, **ZoomControls**, **CanvasEmptyState** and **KeyboardNodeList**. Share these primitives while **keeping each feature's graph model, state and behaviors distinct**. The AI Agents relationship map is not the same domain as an executable workflow graph.

### 7.2 Agents graph

- `AgentGraphCanvas` uses React Flow custom nodes/edges representing agents, models, tools, memory and tasks.
- `AgentConstellation` consumes same entities and relations, runs a deterministic radial layout function by breadth-first graph depth or grouped categories; visualize with React Flow positions or efficient SVG, whichever performs better and preserves inspector.
- Do **not** model agent cognitive internals or pretend to show hidden model reasoning.
- `useAgentGraphState` maintains layout and selection. Layout versions persist per mode.
- Edges have semantic kind and are not blindly editable unless the demo explicitly supports relationship editing.

### 7.3 Automation editor

- `WorkflowCanvas` uses React Flow with typed custom node components registered outside render.
- `NodePalette` owns available node metadata/config schemas; drag/drop and click-to-add must both work.
- `WorkflowInspector` edits typed config with schema validation.
- `validateWorkflow(doc)` is pure, synchronous and testable. It checks IDs, ports, required fields, supported connections, unreachable graph segments, cycle policy, and at least one trigger.
- `simulateWorkflow(doc, seed)` never executes arbitrary expressions or network requests. Deterministic branch choices are supplied as fixtures/controlled demo inputs.
- `serializeWorkflow` and `parseWorkflow` implement schema version validation and safe data import.
- Undo/redo tracks discrete document operations, not every intermediate pixel while dragging.
- Edge styles convey status and semantics; selection states reflected in a synchronized accessible list.

**Graph performance rules** (based on React Flow docs): memoize custom nodes/edges; memoize callbacks passed to canvas; avoid subscribing the whole page to `useNodes()` or full graph state if only a count or selected ID is needed; render inspector off discrete selection; virtualize palettes/lists if extensive.

### 7.4 Interaction event contract

| Event | Meaning | Persistence |
|---|---|---|
| `node:selected` | Open inspector and highlight relations | URL or ephemeral state |
| `node:drag-start` | Interaction begins; suspend costly ambient animations | No |
| `node:drag-end` | Commit coordinates and history step | Debounced save |
| `edge:connected` | Validate types; add edge if valid | Commit + save |
| `inspector:changed` | Change node configuration | Commit + save |
| `canvas:mode-change` | Graph vs radial | Save both per-mode layouts |
| `workflow:simulate` | Generate deterministic local run result | History optional |
| `workflow:import` | Parse, validate and preview before replacing | Save only after consent |

## 8. 3D hologram architecture and failure isolation

- Home route lazy imports `HologramStage` → `SignalOrbScene`; Mission Control lazy imports `ClusterGlobeScene` only when Globe mode selected.
- Wrap scenes with React `Suspense` and error boundary; static SVG/poster fallback handles WebGL disabled/context-loss and loading.
- Use small, reused buffers/instanced particles; avoid allocating geometry/materials in render loops.
- Use quality-dependent `[min, max]` DPR (e.g. `[1, 1.5]` on desktop, lower on weaker devices) and capped geometry/particle budgets.
- Prefer R3F `frameloop="demand"` for static or mostly interaction-driven scenes; animated scenes request frames only while active. Inactive pages unmount scene.
- Recompute only when scene props change; separate time updates from React state updates.
- Use WebGL context cleanup and detection; scene never steals pointer actions from adjacent cards.
- `prefers-reduced-motion`, performance mode, and tab visibility can all disable continuous motion.

**Scene design:** original teal/blue orbital signal mesh with rings, arcs and sparse particles; glowing globe with optional demo markers. No copy of proprietary graphic assets, no copyrighted JARVIS marks.

## 9. Animation policy and lifecycle

1. Use Motion's `MotionConfig reducedMotion="user"`, but expose app preference that can further reduce motion; do not override the OS need for accessibility.
2. Use GSAP for a limited number of sophisticated entrance timelines. Every timeline must be scoped, revertable and killed on unmount.
3. Lenis only in scroll-driven informational surfaces. Do not initialize a second global RAF alongside GSAP ticker. If integrating, use **one** ticking strategy and unsubscribe on unmount. React Flow retains native wheel/scroll behaviors.
4. anime.js allowed for a specific SVG path/micro-effect when justified and documented; do not duplicate Motion/GSAP capabilities unnecessarily.
5. React Bits should be evaluated component-by-component: copy/adapt only components that fit accessibility/performance, verify original attribution/license, and use fallback variants.
6. Use CSS transitions for simple hover/focus where enough; TSX/Tailwind-first does not eliminate CSS.

## 10. Performance budget and engineering checks

Set **provisional** budgets, then profile and revise on target machines. Never present target numbers as measured achievements.

- Initial app shell should remain small, with WebGL libraries isolated in lazy route chunks.
- Desktop target: fluid 60 FPS for typical interactions; 30 FPS fallback acceptable on constrained devices if usable, with reduced effects.
- Graph target: smooth editing with 50 nodes/100 edges on ordinary laptop; stress-test 100+ with representative UI.
- Avoid repeated chart animation on every update; use seeded stable metrics.
- No `setState` per particle or per frame; don't rerender root app for animation frame ticks.
- Suspend ambient scenes when hidden; disable visual effects while dragging graph when they compete for GPU.
- Use source maps, bundle analyzer and performance profiler in development; examine chunk waterfalls and context-loss handling.
- List/table virtualization where 200+ events are displayed.
- Use React Profiler to identify state subscription hotspots; memoization must be measurement-driven rather than blanket.

## 11. Security and trust model for this client-only phase

- No access tokens, SSH keys, or user credentials in demo storage.
- No embedded remote execution, command injection or unreviewed installs.
- No `eval` or dynamic execution of imported workflow content.
- Sanitize/escape untrusted display strings; React output is escaped by default, avoid unsafe HTML.
- Parse imported JSON with size limit, schema validation, and safe errors; file content is **data**, not executable logic.
- Enforce no real fetches to `localhost`, private network hosts or cloud control endpoints in the demo.
- Label any screenshots/docs of the dashboard as sample/demo to avoid misleading users.
- No assumption that a browser can directly control nodes or install software.

## 12. Accessibility architecture

- Use semantic primitives from shadcn/ui / Radix where possible.
- Global focus indicators, skip-to-content, labeled inputs, useful error announcements and focus restoration after dialogs.
- Keyboard interaction for graph selection, canvas zoom/fit, node palette, flow connecting/editing through menu alternatives.
- Text/table equivalents for graphics; describe node connectivity in side inspector.
- Honor `prefers-reduced-motion`; avoid persistent flashing and rapid light effects.
- Charts have accessible summaries and tabular fallback. 3D is decorative or a supplemental selection mode, never sole source of facts.

## 13. Testing architecture

### Unit (Vitest)

- Formatter precision/unit conversion.
- Cluster validation and persistence migration.
- Workflow schema parse/serialize and invalid import handling.
- Graph connectivity, handle type checking, cycle detection and conditional validation.
- Simulated workflow traversal determinism and failure cases.
- Seeded metric series repeatability and null metric handling.

### Integration (Testing Library)

- Home cluster context switching.
- Create cluster flow and state update.
- Nodes filter and detail drawer.
- Agent selection synchronized with inspector.
- Workflow settings form reflects selected block and validation.
- Settings change triggers low-motion/static fallback.

### E2E (Playwright)

- Navigate all ten areas and deep-link refresh.
- Create/edit/delete demo cluster with persistence.
- Select topology node and switch modes without selection loss.
- Build workflow, branch, save, reload, export/import and simulate.
- Mobile smoke and keyboard navigation.
- WebGL unavailability fallback, reduced-motion setting, corrupt saved data recovery.

### Quality gates

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run test:e2e` (in CI with browser dependencies available)

Adjust package-manager command names after checking repository conventions. Include test fixtures; never assert pass without running.

## 14. Codex task decomposition and coordination

Before acting, Codex must inspect root `AGENTS.md`, `.codex/`, `docs/`, branch status and working tree. Avoid changing files outside scope except agreed documentation references. Development branches and PRs must follow repository permissions, without fake reviews.

| Stage | Workstream | Key files | Exit condition |
|---|---|---|---|
| 0 | Audit/architecture | Existing docs + planned dashboard | No conflicts with root project rules |
| 1 | Foundation | `dashboard/package.json`, app, styles, providers, router | App shell and blank routes compile |
| 2 | Shared UI/data | `components/*`, `data/*`, `domain/*`, `state/*` | Typed demos and design tokens working |
| 3 | Home/hero | `features/home/*` | First-class readable home and fallback |
| 4 | Clusters/nodes/monitoring | Three related features | Filters, details, charts and persistence |
| 5 | Mission Control | Topology and globe | Selection, zoom and inspector with fallback |
| 6 | Agents canvas | `features/agents/*` | Graph/radial modes + saved layout |
| 7 | Automation canvas | `features/automation/*` | Complete deterministic demo editor |
| 8 | Software/activity/settings | Respective features | Functional previews, logs, preferences |
| 9 | QA/hardening | Tests, docs, bundles | Accessible, responsive, lint/type/test/build pass |

**Parallel safe boundaries:** a UI component workstream can implement independent shared primitives while data/domain types are established; mission scene and monitoring can be parallel after contracts stabilize. Avoid concurrent modifications to `router.tsx`, shared theme tokens, `package.json` or the same graph model. Merge small, tested increments.

## 15. `dashboard/package.json` script contract

The application should expose at minimum:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

This is a **proposed script interface**, not a complete package manifest. Align TS project-reference setup with `tsc -b` as appropriate; avoid an inconsistent or broken `typecheck` command. Pin to compatible current stable package releases rather than guessing exact version strings.

## 16. Architecture validation / definition of done

- [ ] One runnable app exists in `dashboard/`, no backend installed.
- [ ] All ten functional areas navigable and route errors handled.
- [ ] Service contracts isolate persisted local records and sample telemetry from presentational UI.
- [ ] Graph inspector and canvases use stable, typed state.
- [ ] Workflow builder supports real UI editing with **simulated** execution only.
- [ ] Node view and globe share one source of truth; scene fallback works.
- [ ] Animations adhere to clear ownership; no repeated RAF loops.
- [ ] Fonts, colors and accessibility modes are consistent.
- [ ] WebGL route loading is lazy; initial shell has no unneeded Three.js chunk.
- [ ] Import/export validation, persistence migration and recovery tested.
- [ ] Open-source build/run instructions and licensing verified.
- [ ] All attempted lint/test/typecheck/build steps reported truthfully.

## 17. Sources for API verification

- React Flow home: https://reactflow.dev/
- React Flow performance: https://reactflow.dev/learn/advanced-use/performance
- React Flow save/restore: https://reactflow.dev/examples/interaction/save-and-restore
- Motion: https://motion.dev/docs/react
- Motion accessibility: https://motion.dev/docs/react-use-reduced-motion
- React Three Fiber: https://r3f.docs.pmnd.rs/
- R3F performance: https://r3f.docs.pmnd.rs/advanced/scaling-performance
- Lenis React integration: https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md

Use these as implementation references, and verify package API/version compatibility at coding time.
