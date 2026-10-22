# OpenCluster

**One dashboard. Every node. Total control.**

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![Status: Phase 1](https://img.shields.io/badge/status-Phase%201%20%7C%20dashboard%20development-blue)](docs/ROADMAP.md)

OpenCluster is an open-source project by **ZYRIX DEVS**. Its long-term goal is a self-hosted platform for understanding and managing clusters, infrastructure nodes, AI agents, and distributed workloads.

## Current project status

Phase 0 repository foundation is complete. Phase 1 is focused on a standalone web dashboard in `dashboard/`, using local mock data to demonstrate cluster operations and monitoring views. The application is still under development; the required pages and interactions are not claimed as complete until implemented and verified.

The Phase 1 dashboard is a **demo interface only**. It does not connect to real clusters, run tasks, install software, or provide live telemetry. It has no backend, authentication service, database, or node agent, and does not require a cloud service.

## Dashboard scope

The dashboard includes Home, Mission Control, Clusters, Nodes, Agents, Automation, AI Software, Tasks, Monitoring, Activity, and Settings views. Its cluster topology, metrics, agent/workflow canvases, task activity, and software installation previews use simulated data and actions. See the [Phase 1 product requirements](docs/PRD.md) for acceptance criteria and explicit limits.

## Future direction

Backend services, secure node enrollment, real telemetry, authentication and authorization, audit logging, AI-agent integrations, and workload orchestration belong to later phases. They are not current capabilities. The [roadmap](docs/ROADMAP.md) and [architecture proposal](docs/ARCHITECTURE.md) distinguish future designs from implemented software.

## Development

The dashboard requires Node.js 20.19+ or 22.12+ and npm (Vite's supported Node versions). From the repository root, install dependencies and start the local development server:

```sh
npm --prefix dashboard install
npm --prefix dashboard run dev
```

Vite prints the local URL when the server starts. The dashboard uses mock data only; no backend or cloud service is needed. Run the available checks and production build with:

```sh
npm --prefix dashboard run typecheck
npm --prefix dashboard run lint
npm --prefix dashboard test
npm --prefix dashboard run build
```

For repository contribution setup, read [AGENTS.md](AGENTS.md), the [development guide](docs/DEVELOPMENT.md), and [CONTRIBUTING.md](CONTRIBUTING.md). Review the [testing strategy](docs/TESTING_STRATEGY.md) for current repository checks. Open a pull request against `main` following the [GitHub workflow](docs/GITHUB_WORKFLOW.md).

## Documentation

- [Product requirements](docs/PRD.md) · [Roadmap](docs/ROADMAP.md) · [Architecture proposal](docs/ARCHITECTURE.md)
- [Technology stack](docs/TECH_STACK.md) · [Design system](docs/DESIGN_SYSTEM.md)
- [Dashboard motion and performance](docs/DASHBOARD_PERFORMANCE.md)
- [API design proposal](docs/API_DESIGN.md) · [Database design proposal](docs/DATABASE_DESIGN.md) · [Node protocol proposal](docs/NODE_PROTOCOL.md)
- [Security architecture proposal](docs/SECURITY_ARCHITECTURE.md) · [Development](docs/DEVELOPMENT.md) · [Testing strategy](docs/TESTING_STRATEGY.md)
- [Deployment proposal](docs/DEPLOYMENT.md) · [GitHub workflow](docs/GITHUB_WORKFLOW.md) · [Decisions](docs/DECISIONS.md)

## Contributing and security

Contributions are welcome under [CONTRIBUTING.md](CONTRIBUTING.md). Please report security concerns through [SECURITY.md](SECURITY.md), not a public issue. Security proposals in the design documents do not mean corresponding protections are implemented in this demo dashboard.

## License and attribution

OpenCluster is licensed under [Apache-2.0](LICENSE). Copyright © 2026 ZYRIX DEVS.
