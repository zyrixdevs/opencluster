# OpenCluster Dashboard

The dashboard is a standalone React application for exploring OpenCluster's demo workflows. It uses local sample data only; it does not connect to nodes, dispatch tasks, install software, or require a backend or cloud service.

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

The demo stores display preferences in this browser's local storage. Do not enter operational identifiers, credentials, or other sensitive information.

## Views

The Home page summarizes demo clusters, nodes, resource use, alerts, activity, and agent status. Mission Control offers topology, orbit, and an optional 3D globe view. Agents and Automation contain interactive mock graph canvases. Software installation previews and workflow runs are simulations only. See [the dashboard performance notes](../docs/DASHBOARD_PERFORMANCE.md) for animation, reduced-motion, and rendering behavior.
