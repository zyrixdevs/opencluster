# Codex and Agent Orchestration

**Status:** Workflow guidance for repository contributors. OpenCluster runtime AI-agent management is a planned product capability and is not implemented.

## Project-local Codex agents

The repository may define focused project-local roles for architecture, frontend, backend, infrastructure, security, testing, review, and documentation. Roles provide scoped expertise; they do not grant credentials, repository permissions, or authority to deploy. Follow the installed Codex configuration format and root `AGENTS.md`.

## Delegation

Delegate only independent, bounded tasks with explicit file ownership and acceptance criteria. Avoid concurrent edits to shared files. The coordinating maintainer integrates changes, inspects the diff, resolves conflicts, and remains responsible for the result. Security-sensitive work requires security review; an agent's report is not a human approval or a substitute for required GitHub review.

## Review and tool safety

Agents must inspect existing code and docs before editing, preserve unrelated work, avoid secrets, and report commands/tests actually run. Do not ask an agent to impersonate an account, create credentials, bypass branch protections, or perform unapproved destructive operations. Automated review must be labeled as automated, especially if both GitHub accounts are controlled by one person.

## Runtime AI integrations (future)

Codex, Hermes Agent, and custom adapters are planned only where supported interfaces permit. Future integrations need explicit operator enablement, narrow permissions, secret isolation, execution limits, auditability, and a clear distinction between suggested and executed actions. Registration alone must not authorize infrastructure changes.
