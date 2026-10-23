# OpenCluster Dashboard

The dashboard is OpenCluster's permanent standalone frontend, currently operating in local mode. Cluster, node, workflow, and canvas records persist in IndexedDB; lightweight preferences use localStorage. Seeded telemetry is sample data. The app does not connect to physical nodes, dispatch tasks, install software, or require a cloud service while backend services are unavailable.

## Run locally

From the repository root:

```sh
npm --prefix dashboard install
npm --prefix dashboard run dev
```

Vite prints the local development URL. Node.js 20.19+ or 22.12+ is required.

## Checks

```sh
npm --prefix dashboard run typecheck
npm --prefix dashboard run lint
npm --prefix dashboard test
npm --prefix dashboard run build
```

The local provider stores clusters, nodes, canvas layouts, workflows, and non-sensitive preferences in this browser. Structured records use IndexedDB. Do not enter credentials or secrets.

## Views

The Home page summarizes local clusters, nodes, resource use, alerts, activity, and agent records. Mission Control offers topology, orbit, and an optional 3D globe view. Agents and Automation provide editable React Flow canvases with saved local state. Software configuration is saved locally; installation and workflow execution remain unavailable until secure backend services exist. Read the [dashboard PRD](../docs/DASHBOARD_PRD.md), [UI/UX specification](../docs/DASHBOARD_UI_UX_SPEC.md), and [architecture and component map](../docs/DASHBOARD_ARCHITECTURE_AND_COMPONENT_MAP.md) for requirements. See [the dashboard performance notes](../docs/DASHBOARD_PERFORMANCE.md) for animation, reduced-motion, and rendering behavior.
