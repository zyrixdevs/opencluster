# OpenCluster

**One dashboard. Every node. Total control.**

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![Status: Phase 1](https://img.shields.io/badge/status-Phase%201%20%7C%20dashboard%20development-blue)](docs/ROADMAP.md)

OpenCluster is an open-source project by **ZYRIX DEVS**. Its long-term goal is a self-hosted platform for understanding and managing clusters, infrastructure nodes, AI agents, and distributed workloads.

## Current project status

Phase 0 repository foundation is complete. Phase 1 builds the permanent standalone dashboard in `dashboard/`, with validated browser-local records and a replaceable data-provider boundary. The application is still under development; the required pages and interactions are not claimed as complete until implemented and verified.

The Phase 1 dashboard is a **production frontend operating in local mode**. It supports persistent local cluster, node, graph, and workflow records. It does not connect to physical clusters, execute tasks, install software, or provide live telemetry until backend services and an authorized node agent exist. It does not require cloud services. Seeded hardware metrics are visibly identified as sample data.

## Dashboard scope

The dashboard includes Home, Mission Control, Clusters, Nodes, Agents, Automation, AI Software, Tasks, Monitoring, Activity, and Settings views. Cluster/node management and canvas editing operate on saved local records; hardware metrics are sample data, and installations or workload execution remain unavailable. The implementation requirements are in the [dashboard PRD](docs/DASHBOARD_PRD.md), [UI/UX specification](docs/DASHBOARD_UI_UX_SPEC.md), and [architecture and component map](docs/DASHBOARD_ARCHITECTURE_AND_COMPONENT_MAP.md).

## Future direction

Backend services, secure node enrollment, real telemetry, authentication and authorization, audit logging, AI-agent integrations, and workload orchestration belong to later phases. They are not current capabilities. The [roadmap](docs/ROADMAP.md) and [architecture proposal](docs/ARCHITECTURE.md) distinguish future designs from implemented software.

## Development

The dashboard requires Node.js 20.19+ or 22.12+ and npm (Vite's supported Node versions). From the repository root, install dependencies and start the local development server:

```sh
npm --prefix dashboard install
npm --prefix dashboard run dev
```

Vite prints the local URL when the server starts. The dashboard uses persistent browser-local records and sample hardware telemetry; no backend or cloud service is needed. Run the available checks and production build with:

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
- [Topology visualization and Z.Y.R.I.X particle core](docs/TOPOLOGY_VISUALIZATION.md)
- [Dashboard product requirements](docs/DASHBOARD_PRD.md) · [UI/UX specification](docs/DASHBOARD_UI_UX_SPEC.md) · [Architecture and component map](docs/DASHBOARD_ARCHITECTURE_AND_COMPONENT_MAP.md)
- [API design proposal](docs/API_DESIGN.md) · [Database design proposal](docs/DATABASE_DESIGN.md) · [Node protocol proposal](docs/NODE_PROTOCOL.md)
- [Security architecture proposal](docs/SECURITY_ARCHITECTURE.md) · [Development](docs/DEVELOPMENT.md) · [Testing strategy](docs/TESTING_STRATEGY.md)
- [Deployment proposal](docs/DEPLOYMENT.md) · [GitHub workflow](docs/GITHUB_WORKFLOW.md) · [Decisions](docs/DECISIONS.md)

## Contributing and security

Contributions are welcome under [CONTRIBUTING.md](CONTRIBUTING.md). Please report security concerns through [SECURITY.md](SECURITY.md), not a public issue. The dashboard does not yet implement backend authentication, authorization, node enrollment, or remote-action protections because those services are not in Phase 1.

## License and attribution

OpenCluster is licensed under [Apache-2.0](LICENSE). Copyright © 2026 ZYRIX DEVS.
