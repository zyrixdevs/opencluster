# Contributing to OpenCluster

OpenCluster is planned as a free, self-hosted platform for operating computing clusters and distributed workloads. The repository is in its foundation phase; application services and user-facing features are not implemented yet. Contributions should advance the documented foundation or a specifically approved implementation milestone.

## Before starting

1. Read the root [AGENTS.md](AGENTS.md), [product requirements](docs/PRD.md), [architecture proposal](docs/ARCHITECTURE.md), and relevant module documentation.
2. Search existing issues and pull requests for related work. For a substantial change, open an issue first to agree on scope.
3. Do not claim a feature is implemented when it is only planned. Update documentation when a decision or capability changes.

## Development expectations

- Keep changes focused and preserve existing work and history.
- Use TypeScript strict mode for frontend code and type annotations for Python code when those applications are introduced.
- Follow the formatters, linters, dependency managers, and test commands documented by the affected module. Do not add a tool or dependency without a clear need.
- Include tests for behavior changes and regression fixes. Record the exact validation commands and outcomes in the pull request.
- Never commit credentials, private keys, tokens, private user data, or generated secrets.
- Use Conventional Commit subjects, for example `docs: clarify node enrollment boundary` or `feat(api): add node registration`.

## Branches and pull requests

Create a short, descriptive branch from the current `main`, such as `docs/agent-enrollment`. Submit changes as a pull request against `main`; do not force-push shared branches or bypass repository protections. Maintainer and collaborator account switching, Git identity checks, and the proposed review sequence are documented in [GitHub workflow](docs/GITHUB_WORKFLOW.md).

Pull requests should explain the problem, approach, security or compatibility impact, and validation performed. Link related issues and update user-facing or architecture documentation as needed. Request review from an authorized reviewer; account names in project documentation do not by themselves establish repository permissions. Wait for required checks and reviews configured by the repository before merging.

## Review and conduct

Reviewers should focus on correctness, security boundaries, maintainability, accessibility where applicable, and whether tests cover the change. Report actionable findings with context. All participants are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

Questions and support requests belong in [GitHub Discussions or Issues](SUPPORT.md), as enabled by repository settings. Report security vulnerabilities privately using [SECURITY.md](SECURITY.md).
