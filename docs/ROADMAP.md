# Roadmap

**Status:** Planning roadmap; no milestones are complete and no dates are committed.

## Phase 0 — Foundation (current)

- Establish product scope, architecture proposals, security boundaries, contribution workflow, and project-local agent guidance.
- Validate documentation and repository conventions.

## Phase 1 — MVP design and secure vertical slice

- Resolve authentication, authorization, enrollment, revocation, audit, retention, and deployment decisions.
- Implement the smallest end-to-end path: authenticated control-plane access, node enrollment, node inventory, and read-only basic telemetry.
- Add contract tests, migrations, packaging, threat review, and operational recovery documentation.

## Phase 2 — Operator visibility

- Add historical views, health checks, alert rules, and searchable operational events based on measured retention requirements.
- Improve deployment, upgrade, backup, and restore workflows.

## Phase 3 — Controlled operations and integrations

- Evaluate narrow service operations, GitHub status integration, and agent adapters with scoped credentials and reviewable audit trails.
- Define job queue and retry semantics before distributing workloads.

## Later evaluation

Kubernetes deployment, multi-cluster federation, GPU scheduling, broad terminal access, automated remediation, and AI-driven workflows require separate evidence and security review. No feature above is promised until maintainers accept its design and implementation.
