# OpenCluster

**One dashboard. Every node. Total control.**

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![Status: Phase 0](https://img.shields.io/badge/status-Phase%200%20%7C%20planning-lightgrey)](docs/ROADMAP.md)

OpenCluster is a planned free, open-source, self-hosted platform for monitoring and managing computing clusters, infrastructure nodes, AI agents, and distributed workloads through a unified web dashboard. It is maintained by **ZYRIX DEVS**.

> **Project status:** repository foundation and design phase. The dashboard, backend, node agent, and deployment stack are not implemented. Feature descriptions below are plans, not available functionality.

## Planned capabilities

- Cluster and node health, resource telemetry, alerts, logs, and history.
- Secure node enrollment, labels, groups, and permission-controlled operations.
- Distributed task scheduling and recovery policies.
- Extensible AI agent adapters, including Codex and Hermes where supported.
- GitHub and developer-operations visibility with auditable administrative controls.

The initial release is expected to focus on secure node enrollment, read-only cluster and node visibility, and a small operator-managed deployment. Scope remains subject to maintainer review; see the [PRD](docs/PRD.md) and [roadmap](docs/ROADMAP.md).

## Proposed architecture

The current proposal uses a React, TypeScript, and Vite frontend; a Python/FastAPI control plane; PostgreSQL for durable state; and a lightweight Linux node agent. Docker Compose is the planned local deployment path. These choices are not implemented or locked; trade-offs are recorded in [architecture](docs/ARCHITECTURE.md) and [technology stack](docs/TECH_STACK.md).

```text
frontend/       dashboard (planned)
backend/        API and control plane (planned)
node-agent/     Linux metrics and secure communication (planned)
infrastructure/ local and future deployment assets (planned)
docs/           requirements and design decisions
```

## Development status

Phase 0 work is limited to repository structure, documentation, Codex guidance, and docs validation. There are no application prerequisites or runnable app commands yet.

To work on the repository foundation:

1. Clone this repository and create a topic branch.
2. Read [AGENTS.md](AGENTS.md), [development guide](docs/DEVELOPMENT.md), and the relevant design documents.
3. Edit documentation or repository configuration and run the checks documented in `docs/DEVELOPMENT.md`.
4. Open a pull request against `main` using the [contribution guide](CONTRIBUTING.md).

## Documentation

- [Product requirements](docs/PRD.md) · [Architecture](docs/ARCHITECTURE.md) · [Roadmap](docs/ROADMAP.md)
- [Technology stack](docs/TECH_STACK.md) · [API design](docs/API_DESIGN.md) · [Database design](docs/DATABASE_DESIGN.md)
- [Node protocol](docs/NODE_PROTOCOL.md) · [Security architecture](docs/SECURITY_ARCHITECTURE.md)
- [Design system](docs/DESIGN_SYSTEM.md) · [Agent orchestration](docs/AGENT_ORCHESTRATION.md)
- [Development](docs/DEVELOPMENT.md) · [Deployment](docs/DEPLOYMENT.md) · [Testing strategy](docs/TESTING_STRATEGY.md)
- [GitHub workflow](docs/GITHUB_WORKFLOW.md) · [Decisions](docs/DECISIONS.md)

## Contributing

Contributions are welcome after reading [CONTRIBUTING.md](CONTRIBUTING.md). Please open an issue for substantial proposals before implementation. Security issues should follow [SECURITY.md](SECURITY.md), not a public issue.

## License and attribution

OpenCluster is licensed under [Apache-2.0](LICENSE). Copyright © 2026 ZYRIX DEVS.
