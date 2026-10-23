# OpenCluster — Dashboard UI/UX Specification

**Document ID:** OC-DASH-UX-001  
**Version:** 1.0  
**Status:** Design/implementation specification  
**Scope:** `dashboard/` UI and local record workflows; sample telemetry and backend-dependent actions remain simulated  
**Last updated:** 2026-10-22

## 1. Experience statement

OpenCluster should look and behave like an elegant, futuristic **cluster operations workspace**, with the polish of an editorial glassmorphism dashboard and the interactive power of a graph-based development tool. The primary screen must still answer real questions: *Is the system healthy? Which computer is doing what? What needs attention?*

**Art direction:** dark graphite and navy foundations; large, beautiful headings; intentionally sparse glow; transparent/translucent glass panels in a few places; fine grid lines; mint/cyan signals; animated infrastructure graphics; lots of hierarchy. It must never resemble a neon-themed gaming HUD at the expense of readability.

## 2. The seven references: design mapping

| Image | Observed motifs | OpenCluster usage | Translation rule |
|---|---|---|---|
| **1** | Large editorial heading, frosted floating modular widgets, smooth rounded corners | Home layout, KPI cards, dashboard panels, navigation | Adapt modular composition to dark canvas; maintain legible text and logical hierarchy |
| **2** | Huge Earth visualization, side telemetry bars, geospatial labels | Mission Control globe mode | Use demo node anchors; avoid pretending we know actual node location |
| **3** | Blue holographic planetary mesh, glowing links, data atmosphere | Mission Control ambient scene and home visual cues | Keep effects restrained; use Three.js selectively |
| **4** | Horizontal branching relation map, detail inspector, relationship paths | Agents graph mode and inspector | Preserve functional search, labels, selectable relations, typed info |
| **5** | Concentric/radial constellation, rings and node groupings | Agents radial mode; optional Mission Control constellation preset | Provide zoom/selection/legend and text alternative; avoid tiny unreadable labels |
| **6** | n8n-style node workflow, ports, edges, groups and editor tooling | Automation canvas | Custom React Flow node/edge types, keyboard editing, validation, simulation |
| **7** | Six examples of abstract orbital/ring/wire energy geometry | Home JARVIS-inspired 3D hero | Original abstract particle/orbit graphic; not a reproduction of existing franchise assets |

References are **visual inspiration**, not bundled application media. Do not paste reference screenshots into the product. All graphic assets must be original or properly licensed.

## 3. Foundation: type, layout, color and motion

### Typography

- **Sora**: 500–700 for major headlines and section titles. Desktop hero target **clamp(2.75rem, 4vw, 5.25rem)**, with responsive line height ~1.05–1.12.
- **Inter**: 400–600 for navigation, labels, cards, tables, forms and dense technical UI. Standard body 14–16px with generous line heights.
- **JetBrains Mono** (optional): clocks, percentages, hostnames, IDs, code and terminal-style data only. Use tabular numbers for changing values.
- **Rule:** never let fonts carry status meaning by themselves; icons, text and shape should reinforce colors.

### Suggested tokens (finalize after visual comparison)

```css
/* CSS custom properties in dashboard/src/styles/tokens.css;
   Tailwind references them; avoid custom per-component styles. */
--oc-bg: #080C12;
--oc-surface: #111922;
--oc-surface-raised: #17212D;
--oc-border: #273441;
--oc-text: #F2F5F8;
--oc-text-muted: #A3B0BE;
--oc-accent: #A9F276;
--oc-cyan: #68D8D1;
--oc-warning: #F0BB68;
--oc-danger: #F17B83;
--oc-radius-card: 20px;
--oc-radius-control: 12px;
```

- Additional theme tokens: focus ring, semantic foreground on every status, grid color, shadow, glass opacity, chart series.
- Prefer dark default; future light theme can be optional but semantic tokens must be theme-ready.
- Layout: 8px spacing base, max text measure for paragraphs, 12-column desktop dashboard grid; navigation rail/sidebar ~80/248px.
- Cards: two densities, regular and compact. Glass only for hero/topbar, not every content panel.
- On desktop use consistent content gutters 24–40px; tablet 20–24px; mobile 16px.

### Motion vocabulary and ownership

| Motion category | Primary tool | Typical use |
|---|---|---|
| Route/panel/dialog transitions | Motion for React (`motion/react`) | Opacity, 8–20px translate, presence |
| Complex sequenced hero reveals | GSAP | Main greeting/hero choreography |
| Long scroll storytelling sections | Lenis + GSAP only if justified | Home detail sections; not graph editor |
| 3D holographic mesh | Three.js / React Three Fiber | Hero and globe only |
| Fine path animations | anime.js **only if needed** | Short SVG path highlights |
| Reusable motion widgets | React Bits | Curated background, text, hover effects |
| Draggable data graphs | React Flow | Agent and automation canvas interactions |

**Rules:** never animate one property with two engines simultaneously; all loops clean up on unmount; pause nonessential effects on hidden tab; reduced motion uses static variants; don't run Lenis on editable flow canvases; ensure no horizontal page scrolling from 3D scenes.

### Standard easing/timing

- Micro: 120–200ms; regular interface: 200–350ms; transitions: 350–550ms.
- Heavy hero arrival: 1–1.8 seconds in cinematic mode only; ordinary navigation is quicker.
- Avoid forced blocking intro sequences, perpetual camera motion when the user is manipulating a graph, and infinite pulsing of every metric card.

## 4. Global application shell

### Desktop (1280px+)

```text
┌────────────┬────────────────────────────────────────────────────────────┐
│ OPENCLUSTER│  Cluster: Demo Lab ▾   [ Search ⌘K ]  DEMO  Alerts  Profile│
│            ├────────────────────────────────────────────────────────────┤
│ Home       │ Page breadcrumb / title                 Contextual actions│
│ Mission    │                                                            │
│ Clusters   │                      PAGE CONTENT                          │
│ Nodes      │                                                            │
│ Agents     │                                                            │
│ Automation │                                                            │
│ Software   │                                                            │
│ Monitoring │                                                            │
│ Activity   │                                                            │
│ Settings   │                                                            │
└────────────┴────────────────────────────────────────────────────────────┘
```

Top bar remains readable even with 3D scene below. Left rail collapses; menu groups: **Overview**, **Operate**, **Build**, **Insights**, **System**. Avoid overly nested navigation.

### Tablet (768–1279px)

- Compact rail + utility top bar. Cards flow 2 columns; inspectors become overlays/drawers when needed.
- Graph canvases use full main area, accessible tools float above graph and never obscure focus/selection.

### Mobile (360–767px)

- Compact topbar, menu drawer, stacked cards; lower-density labels and charts.
- Graphs support touch pan/zoom plus an **accessible list inspector**; do not require precise touch node linking for essential inspection.
- Complex workflow editing may be read-only or simplified if fully capable touch editing cannot be delivered, and this limitation must be explicitly indicated.

### Global layers and feedback

- Global command palette, context menu, toast stack, confirm dialogs, side drawers, busy indicators.
- Status labels: `ONLINE`, `DEGRADED`, `OFFLINE`, `SIMULATED`, `UNKNOWN` with text + color + icon.
- A **Sample Data** badge or banner is always discoverable where seeded hardware values are shown; preview flows repeat their unavailable status at the action point.
- Every page has helpful blank/loading/failure states, not placeholder lorem ipsum.
- Search results include category, readable entity name, cluster and destination.
- Respect system reduced motion even when visual quality is set to high.

## 5. Page-by-page UI specification

### 5.1 Home — `/`

**Purpose:** Immediate confidence and atmosphere. Reference images **1 and 7**, with limited motifs from **3**.

**Desktop composition:**

```text
┌──────────────────────────────┬─────────────────────────────────┐
│ GOOD EVENING, OPERATOR.      │ JARVIS-LIKE ORIGINAL HOLOGRAM    │
│ Your infrastructure at a     │ Particle rings / orbit visual   │
│ glance.                      │ Pause / Reduce detail control   │
│ [Explore Cluster] [New Flow] │                                 │
├───────────┬──────────┬───────┴──────┬──────────────────────────┤
│ Clusters  │ Online   │ Alerts       │ Active Agents            │
├──────────────────────────────┬───────┴──────────────────────────┤
│ Cluster summary cards        │ Utilization / alert trend        │
├──────────────────────────────┼──────────────────────────────────┤
│ Recent activity              │ Software / workflow snapshots    │
└──────────────────────────────┴──────────────────────────────────┘
```

**Interactions:** clicking KPI navigates to filtered area; cluster selector adjusts summaries; control toggles hologram animated/static; quick actions open demo create cluster / workflow; display name from settings; keyboard focus never enters purely decorative canvas.

**Visual constraints:** hero height bounded; Sora statement strong and readable; orb never overlays text. Mobile hides/degrades 3D before metrics; static SVG is valid fallback. Data status “Demo”.

**Acceptance:** information is complete without WebGL; greeting and KPIs readable at 360px; intro skips with reduced motion.

### 5.2 Mission Control — `/mission-control`

**Purpose:** Spatial overview and precise node inspection. References **2 and 3**.

**Desktop composition:** top section with cluster selection and `Topology | Globe` segmented control; central large canvas; floating legend/filter/zoom controls; right inspector (320–380px); bottom or overlay node list and alerts strip.

**Topology view:** stable force/radial layout around optional coordinator; connection lines and status rings; hover tooltip shows hostname, role, CPU and status; click selects; double click focuses; drag pans empty area; pinch/wheel zoom, explicit +/- buttons and fit-to-view.

**Globe view:** floating holographic sphere representing **illustrative**, not geolocated, clusters; clickable glowing anchors correspond to seeded nodes; right inspector is identical to topology inspector. Position locations should be clearly labeled “Illustrative placement”. A 2D map/topology fallback is essential.

**Empty/error:** zero nodes prompts adding a demo node; unsupported WebGL falls back to topology with notice. `Globe` is not prerequisite for functional node management.

**Acceptance:** inspector updates immediately; selection preserved between modes; keyboard-only user can select through synchronized node list.

### 5.3 Clusters — `/clusters` and `/clusters/:clusterId`

**Purpose:** Organize clusters and understand their composition. Reference **1**.

**List:** large title, `Create demo cluster`, search and status filters; cluster cards display name, OS mix, online count, total nodes, optional coordinator, last event and a compact status mini-chart.

**Details:** breadcrumbs; hero overview; nodes grouped by role/status; recent events; small topology preview; editable metadata drawer.

**Dialogs:** create/rename/archive/delete; validation, accessible errors, confirm destructive actions and explain local persistence.

**Acceptance:** create, rename, switch and refresh survive; delete updates all related demo views safely.

### 5.4 Nodes — `/nodes` and `/nodes/:nodeId`

**Purpose:** Precise hardware and status inspection. Reference **1** for cards, **4** for detail layout.

**Inventory:** table/grid toggle; sticky search/filter header; columns Hostname, Cluster, Role, Status, OS, CPU, RAM, GPU, Last seen; sortable headers; density toggle. Mobile displays condensed cards.

**Details:** node identity hero, “Coordinator” badge when selected, hardware specifications, telemetry small multiples, processes/jobs **demo** placeholder data, latest events. No fake `SSH` or `Install` button pretending to work.

**Interaction:** select node from list, navigate deep link; “View in Mission Control” focuses matching node. Missing GPU is `Not reported`, not 0%. Offline state visibly modifies metrics.

**Acceptance:** sorting/filtering correct, units meaningful, no contradictory status labels.

### 5.5 Agents — `/agents`

**Purpose:** Relationship intelligence and agent orchestration visualization. References **4 and 5**.

**Canvas priority:** Full-height central workspace with a left catalog/search, floating graph tools, inspector on right. Modes: `Network` (branching graph) and `Constellation` (radial hierarchy). Both access the same typed agent-and-relation data.

**Graph node types:** Agent, Model, Tool, Memory, Task, External Service (visual category only). Each has shape/icon/status/connection port; colors are not the sole differentiator.

**Behaviors:** drag node; pan; zoom; selection; filter by category; group/ungroup where viable; fit; reset graph; open inspector; highlight incoming/outgoing relations; save layout. Radial mode arranges the same entities by relationship depth, not by random particle distribution. On switching modes, preserve selection and inspector, and remember last camera position per mode.

**Inspector:** title, kind, status, node host if linked, dependencies, inputs/outputs, associated mock tasks, graph actions. Text search/list alternative gives complete access to every entity.

**Safety and clarity:** “Relationship visualization — demo graph; no real agent execution.” Avoid implying visualization shows private model reasoning.

**Acceptance:** no edge detach while moving; graph not reinitialized during inspector updates; radial view still supports inspect/zoom; both modes work without WebGL.

### 5.6 Automation — `/automation` and `/automation/:workflowId`

**Purpose:** Functional **demo** agent workflow builder similar in interaction to n8n, not n8n source reuse. Reference **6**.

**Desktop composition:**

```text
┌── Palette ─┬──────────────────── Workflow canvas ───────────────────┬ Inspector ─┐
│ Trigger    │ [Manual] ─> [Agent Task] ─> [Condition] ─┐            │ Node name │
│ Agent      │                         ├─ true -> [Notify]           │ Parameters│
│ Logic      │                         └─ false -> [Failure]         │ Validation│
│ Tools      │ Zoom | Fit | Mini-map | Undo | Redo   [DEMO]            │ Help      │
└────────────┴────────────────────────────────────────────────────────┴───────────┘
Top: Back | Flow name [editable] | Saved locally | Validate | Simulate | Export
```

**Core interaction contract:**

1. Empty state offers templates or new blank flow.
2. Drag block from palette onto canvas (keyboard/click alternate required).
3. Connection handles enforce typed edges; mark invalid target without changing graph.
4. Select node; inspector edits schema-driven fields; validation errors indicate exactly which config is missing.
5. Toolbar: undo/redo, fit-to-view, zoom, minimap, save, duplicate, import/export JSON.
6. `Simulate` runs a deterministic client-side traversal and highlights nodes; logs show “SIMULATED / No external services were contacted”.
7. Branching condition demonstrates true/false ports; errors show failure path. No arbitrary JS/script execution by workflow users.

**Visual style:** neutral card nodes, bright semantic ports/edges, lightly dotted grid, dark canvas; avoid tiny text. Port labels readable. Per-step status glow is subtle.

**Persistence:** saved flows and viewport restore after reload. Schematized JSON with version and validation; invalid imports report errors safely. No automatic execution of imported scripts.

**Acceptance:** save/export/import yields same nodes/edges; undo/redo works after drag, connect and edit; no malformed dangling edges; keyboard alternative exists for connecting nodes.

### 5.7 AI Software — `/software`

**Purpose:** Discover integrations and preview installation journeys. References **1** for visual catalog and **4** for inspector.

**Catalog:** searchable cards for Codex, Claude Code, Hermes Agent and OpenClaw, with clear software name, provider, verified platform notes, intended purpose, demo status. Generic extensible catalog template.

**Preview wizard:** `Choose software → Choose sample target nodes → Review configuration → Preview plan → Simulation complete`. Do not ask for real API credentials; never show copyable installation commands under the guise of having verified them unless separately documented.

**Acceptance:** users cannot confuse preview success with installed software; dashboard data updates only as explicitly simulated.

### 5.8 Monitoring — `/monitoring`

**Purpose:** High-density but legible telemetry. References **1, 2**.

**Layout:** summary strip, trend graphs by CPU/RAM/storage/network; cluster comparison; selected node detail; offline-aware dataset labels. Range controls 15m/1h/24h/7d, hover details, series toggle and accessible numerical summary/table.

**Rules:** stable demo time series; no false precision; healthy/warning thresholds explained; no endless animating charts; chart labels and units visible when hovered or focused.

**Acceptance:** chart and source table agree, missing metrics not charted as zero.

### 5.9 Activity — `/activity`

**Purpose:** Operator history across clusters, nodes, workflows, agents and software previews.

**Layout:** timeline + table views; tabs for All/Alerts/Automation/Software; search, source/severity/time filters; drawer with event payload and cross-link to entity. Demo markers on simulated history.

**Acceptance:** all events trace to valid seeded entities; ordering/filtering deterministic; no fabricated security audit implications.

### 5.10 Settings — `/settings`

**Purpose:** User-controlled quality, accessibility and demo environment.

**Sections:** Appearance (theme + density), Motion (system/reduced/cinematic), Rendering (auto/performance/high + 3D toggle), Demo environment (seed set/reset), Accessibility (contrast hints), About/Open-source (license/docs links). Future remote connections section may show explanatory **Not available in Phase 1** copy, not fake form controls.

**Acceptance:** toggles actually affect all relevant views; preferences survive reload; reduced motion overrides cinematic preference; reset requires confirmation.

## 6. Canvas interaction details (shared specification)

| Interaction | Agents | Automation |
|---|---|---|
| Drag empty space | Pan | Pan |
| Scroll/pinch | Zoom with bounds | Zoom with bounds |
| Click graph item | Select + inspector | Select + inspector |
| Multi-select | Optional P1 | Required for multi-edit P1; basic selection P0 |
| Keyboard accessible list | Required | Required node palette + connect/edit alternatives |
| Mini-map | Optional | Required/strongly preferred |
| Save positions | Required | Required |
| Snap/grid | Optional | Snap grid preferred |
| Undo/redo | P1 | P0 |
| Fit view | Required | Required |
| Compact/touch mode | Select+inspect first | Readability/inspect first; communicate editing limits |

During drag, **don't show heavyweight new animations** in adjacent panels. Smoothness and pointer accuracy take priority. A right-click context menu may supplement but never replace accessible controls.

## 7. Motion/graphics quality profiles

- **Reduced:** static orb SVG; no automated camera motion, parallax or background particles; transitions limited to short fades.
- **Performance:** low DPR and geometry complexity; default 2D topology; fewer glow passes; lower particle count; no ambient scenes offscreen.
- **Auto:** device- and preference-aware, avoids mandatory hardware fingerprinting; sensible browser defaults.
- **Cinematic:** richer orb/3D details and entrance sequences only on capable devices with explicit user opt-in; never hides controls.

GL error or unavailable WebGL immediately falls back to static art/2D graph. Use `IntersectionObserver` or visibility semantics to pause hidden scenes; high frame counts in inactive tabs are unacceptable.

## 8. Responsive interaction matrix

| Element | Desktop | Tablet | Mobile |
|---|---|---|---|
| Navigation | Full sidebar | Compact rail | Drawer/menu |
| Home hero | Text + 3D side-by-side | Reduced-height split | Text first; static/light orb |
| KPI cards | 4–5 columns | 2 columns | 1–2 columns |
| Topology | Main stage + persistent inspector | Main stage + drawer | 2D compact + list |
| Agents | Graph + inspector | Graph + overlay inspector | List-first, inspect graph optionally |
| Automation | Three-panel editor | Collapsible palette/inspector | Simplified editor or transparent read-only |
| Data tables | Full sortable | Horizontally scrollable | Responsive cards / essential columns |
| Monitoring | Multi-series grid | Two-column charts | Single-column charts + summaries |

## 9. Content and microcopy guidelines

- Greeting example: **“Good evening, Operator.”** Subtitle: **“Your infrastructure, at a glance.”**
- Demo banner: **“Demo environment — no real nodes connected.”**
- Preview confirmation: **“Simulation complete. No software was installed.”**
- Empty graph: **“No agents in this view. Choose a demo workspace or add a sample agent.”**
- Disconnected state: **“No live data source configured in this release.”**
- Avoid “Installed”, “Connected”, “Running live”, or “Secured” unless the display context explicitly says simulated.

## 10. Visual QA and accessibility checklist

- [ ] Seven references interpreted correctly and originally; not directly copied.
- [ ] Every page has a unique purpose, strong title and scannable hierarchy.
- [ ] Typography usable at 200% zoom; no critical content clipped.
- [ ] Focus ring and hover do not depend on glow alone.
- [ ] Forms have labels, descriptions and inline validation.
- [ ] Side panels and modals trap/restore focus appropriately.
- [ ] Charts have text/table equivalents.
- [ ] Canvas selections have searchable/list alternatives.
- [ ] Motion/quality preferences apply consistently.
- [ ] 3D scene never blocks input; GPU disabled fallback verified.
- [ ] Light/glass elements maintain contrast over every background.
- [ ] Responsive widths 360, 390, 768, 1024, 1440, 1920 tested.
- [ ] Demo and preview labeling correct in every module.

## 11. Implementation references

- React Flow examples: https://reactflow.dev/examples/interaction/save-and-restore
- React Flow performance: https://reactflow.dev/learn/advanced-use/performance
- Motion accessible animations: https://motion.dev/docs/react-use-reduced-motion
- React Three Fiber Canvas: https://r3f.docs.pmnd.rs/api/canvas

Review the bundled seven user references in order before implementation. If image assets are not available in a Codex environment, follow this mapping document rather than inventing unseen details.
