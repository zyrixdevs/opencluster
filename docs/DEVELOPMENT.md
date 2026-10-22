# Development guide

## Current status

OpenCluster is in Phase 0. No application package, backend, database schema, node agent, or runnable product exists. Repository checks below validate only Markdown links and project configuration.

## Prerequisites

- Git
- Python 3.12 or later for the current documentation check (standard library only)
- Codex CLI only if you intend to use the project-local custom agents

Node.js, PostgreSQL, Redis, Docker, and Kubernetes are not required for Phase 0. They will be needed only when the corresponding application or infrastructure work is approved.

## Local workflow

```sh
git switch -c docs/your-change
python -m unittest discover -s tests -v
python scripts/check_docs.py
```

Before a pull request, inspect `git status`, review the diff, and verify that claims describe implemented behavior or are clearly labeled as planned. Do not add secrets or environment files.

## Style and dependencies

TypeScript will use strict mode and TSX for React components. Python will use type annotations at public interfaces. Formatting and linting tools will be selected with the first application milestone; no application dependency manifests exist yet. Avoid adding dependencies to solve checks already covered by the standard library.

Use Conventional Commits (for example `docs: clarify node enrollment proposal`). Releases will follow semantic versioning once a first release is planned; no release version has been declared.

## Codex agents

Root instructions are in `AGENTS.md`; project-local agent roles are in `.codex/agents/`. The role files use Codex's supported standalone TOML format. No model, credential, or machine-specific path is pinned. See [agent orchestration](AGENT_ORCHESTRATION.md).
