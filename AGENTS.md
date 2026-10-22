# OpenCluster agent and contributor instructions

## Mission and current scope

OpenCluster is planned as a self-hosted control plane for cluster nodes, infrastructure, AI agents, and distributed workloads: **One dashboard. Every node. Total control.** The repository is currently in Phase 0. The dashboard, API, node agent, and deployment stack are not implemented. Do not build product features until a maintainer selects an implementation milestone.

## Before changing anything

1. Read this file and the relevant project documentation before editing. Inspect the current code, callers, configuration, and tests; do not rely on prior assumptions.
2. Check `git status`, the current branch, and recent history. Preserve existing work and commits. Never force-push or overwrite unrelated changes.
3. Identify every caller, test, fixture, export, and document affected by the change. Make the smallest complete change and report any known limitation.
4. Do not remove existing behavior without an explicit migration plan. Never commit credentials, tokens, private keys, or production data.

## Repository organization

- `frontend/` — planned React and TypeScript dashboard.
- `backend/` — planned FastAPI control plane.
- `node-agent/` — planned lightweight Linux node service.
- `infrastructure/` — deployment and operations assets.
- `docs/` — product requirements, architecture, protocols, operations, and decisions.
- `scripts/` — repository maintenance utilities.
- `tests/` — automated checks; application tests will be added with application code.
- `.codex/agents/` — project-scoped Codex role definitions.

## Architecture and security rules

- Follow `docs/ARCHITECTURE.md`, `docs/SECURITY_ARCHITECTURE.md`, `docs/API_DESIGN.md`, and `docs/DATABASE_DESIGN.md`. They describe proposals until implementation exists.
- Keep module boundaries explicit. Frontend code must not access the database directly; the node agent must not trust control-plane input without authentication and authorization.
- Default to least privilege. Privileged node actions require authenticated identity, authorization, audit records, bounded operations, and explicit confirmation where destructive.
- Never expose unrestricted remote shells or arbitrary cross-node command execution. Do not add secrets to code, logs, examples, or fixtures.
- Choose libraries only when they solve an approved need. Record material architecture changes in `docs/DECISIONS.md`.

## Coding conventions

- TypeScript: strict mode, TSX for React components, explicit types at public boundaries, accessible HTML semantics, and minimal handwritten CSS.
- Python: type public interfaces, validate at trust boundaries, use structured logging, and preserve useful exception context without exposing secrets.
- Keep formatting and linting tools aligned with checked-in configuration. Use Conventional Commits and semantic versioning after the first release; no release version exists yet.
- Do not introduce dependencies, configuration, abstractions, or compatibility layers without a current requirement.

## Agent delegation

Use `.codex/agents/` roles for focused work. Delegate only independent tasks with non-overlapping file ownership; communicate scope and shared-work constraints. The reviewer reports findings and does not approve automatically. Automated review cannot be represented as independent human review.

## Tests and validation

- Run focused checks for changed behavior, then relevant broader checks when they exist. Do not claim commands passed unless they were run.
- During Phase 0, CI validates documentation links and repository configuration only. Application build workflows must wait until application manifests and build tooling exist.
- Add regression tests for non-trivial behavior, failure paths, and security-sensitive logic. Keep performance benchmarks reproducible and do not invent targets or results.

## Documentation requirements

Update documentation when behavior, interfaces, security assumptions, dependencies, or deployment requirements change. Clearly mark planned and experimental work. Verify commands and internal links; do not document unsupported installation or deployment procedures as ready to use.

## GitHub collaboration

- `imzyrix` is the designated maintainer and implementation account; `aaryaavinash` is the designated collaborator/reviewer. Verify the active account and the actual Git push identity separately.
- Use separate, accurate Git author identities. Never impersonate a reviewer, manufacture approvals, or bypass branch protections. Both accounts may participate only where GitHub permissions allow.
- Work on branches and submit pull requests to `main`; request review from an authorized reviewer. Address findings and satisfy required CI and repository protections before merging.
- See `docs/GITHUB_WORKFLOW.md` for account switching, credential checks, and review procedure.

## Definition of done

A change is done when its scope is complete, relevant checks pass (or limitations are stated), docs are current, no secrets or unrelated edits are present, and it is committed through the authorized branch and review workflow. Do not merge a pull request unless applicable checks and approvals are satisfied.
