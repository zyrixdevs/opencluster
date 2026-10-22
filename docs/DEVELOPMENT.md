# Development guide

## Current status

OpenCluster is implementing Phase 1: a standalone dashboard that runs locally with mock data. No backend, authentication service, database, node agent, remote execution, or cloud service is part of this phase.

## Prerequisites

- Git
- Node.js 20.19+ (or 22.12+) and npm for the dashboard (Vite requirement)
- Python 3.12 or later for documentation checks (standard library only)
- Codex CLI only if you intend to use the project-local custom agents

PostgreSQL, Redis, Docker, Kubernetes, credentials, and cloud services are not required to run the dashboard.

## Local workflow

```sh
npm --prefix dashboard install
npm --prefix dashboard run dev
```

The dev server prints its local URL. For checks, run:

```sh
npm --prefix dashboard run typecheck
npm --prefix dashboard run lint
npm --prefix dashboard test
npm --prefix dashboard run build
python -m unittest discover -s tests -v
python scripts/check_docs.py
```

Before a pull request, inspect `git status`, review the diff, and verify that claims describe implemented behavior or are clearly labeled as planned. Do not add secrets or environment files.

## Style and dependencies

TypeScript uses strict mode and TSX for React components. Biome handles dashboard formatting and linting; Vite builds the app, and Vitest runs focused dashboard tests. Python will use type annotations at public interfaces. Avoid adding dependencies to solve checks already covered by the standard library.

Use Conventional Commits (for example `docs: clarify node enrollment proposal`). Releases will follow semantic versioning once a first release is planned; no release version has been declared.

## Dashboard architecture and motion

Each page is loaded on demand. Mock domain data remains local to the typed data layer; browser storage holds only display preferences. Agents and Automation are interactive SVG/HTML mock canvases and never invoke external services. Mission Control's optional 3D globe is lazy-loaded and has a selectable-node fallback when WebGL is unavailable. See [Dashboard Motion and Performance](DASHBOARD_PERFORMANCE.md) for the animation responsibilities, tab-visibility pause, reduced-motion handling, and current limits.

## Codex agents

Root instructions are in `AGENTS.md`; project-local agent roles are in `.codex/agents/`. The role files use Codex's supported standalone TOML format. No model, credential, or machine-specific path is pinned. See [agent orchestration](AGENT_ORCHESTRATION.md).
