# OpenCluster Product Requirements

**Status:** Phase 0 proposal. OpenCluster has no implemented application features yet.

## Vision and problem

OpenCluster aims to give self-hosters and small infrastructure teams one place to understand and operate heterogeneous compute clusters. Today, node health, workload state, logs, automation, and AI agents are commonly split across separate tools. OpenCluster proposes a self-hosted control plane with explicit security boundaries and replaceable integrations.

## Users and use cases

- **Homelab operator:** see which machines are reachable, compare resource use, and understand alerts without logging into each machine.
- **Small platform team:** group nodes by environment or role, review workload state, and audit privileged operations.
- **AI/automation operator:** observe compatible agents and jobs, then control approved workflows.
- **Contributor/integrator:** add an adapter or node capability without coupling it to the dashboard.

## Supported environments (planned)

The first node-agent target is Linux on Arch Linux and Debian, with architecture intended to remain distribution- and hardware-neutral. The control plane is planned for Linux-hosted containers. Other Linux distributions, Windows, macOS, Kubernetes, and managed cloud environments are future evaluation targets, not current support claims. Hardware metrics depend on operating-system interfaces and optional vendor drivers; GPU support must be capability-detected.

## Product principles

1. Self-hosted and operator-controlled; telemetry stays within the operator's deployment unless they configure an integration.
2. Least privilege and explicit consent for every administrative action.
3. Read-only visibility before remote mutation.
4. Heterogeneous nodes and integrations through documented interfaces.
5. Clear health, freshness, provenance, and failure states; never imply stale data is live.
6. Useful defaults, documented trade-offs, and deployable components that can be operated independently.

## Planned functional requirements

All requirements below describe intended behavior and are **not implemented**.

### Cluster overview

- Summarize registered nodes and distinguish online, offline, unknown, and stale telemetry.
- Show CPU, memory, storage, network, and capability-detected GPU metrics with timestamps and units.
- Provide health indicators, alerts, recent activity, and historical metrics when retention is configured.

### Node management

- Enroll, inspect, label, group, disable, and revoke nodes.
- Display node identity, operating-system information, capabilities, connectivity, and resource use.
- Keep monitoring permissions distinct from permissions to invoke node actions.
- Expose a controlled service-operation interface only after authorization and audit requirements are designed and implemented.

### Agent management and orchestration

- Represent Codex, Hermes Agent, and custom integrations through adapters where those products expose supported interfaces.
- Show agent health, execution history, and configured workflows.
- Queue and schedule distributed jobs with explicit state, dependencies, retries, cancellation, and recovery semantics.
- No arbitrary shell execution or agent autonomy is implied by this requirement.

### Monitoring and developer operations

- Receive live telemetry and health checks; provide searchable logs, charts, and configurable alerts.
- Integrate GitHub repositories and deployment/build status through scoped, revocable credentials.
- Make remote terminal access an explicitly gated later capability; it is not an MVP requirement.

### Security and administration

- Authenticate users and authorize actions with role-based permissions.
- Securely enroll and revoke nodes; protect secrets and transport.
- Record attributable audit events for privileged operations.
- Require a clear confirmation step for dangerous actions and report their target and expected effect.

## Non-functional requirements and targets

Targets below are requirements to validate during implementation, not measured performance claims.

- **Security:** deny by default; encrypted network paths; no embedded credentials; auditable privileged access; documented threat model and recovery process.
- **Reliability:** show data age and collection failures; tolerate temporary node/control-plane disconnection without representing old samples as current.
- **Performance:** design for incremental telemetry and bounded queries; establish measurable latency/resource budgets after MVP workload and hardware baselines are defined.
- **Privacy:** document collected fields, retention, and outbound integrations; provide operator-controlled retention and deletion.
- **Accessibility:** keyboard operation, semantic controls, readable contrast, and status that is not conveyed by color alone.
- **Portability:** avoid hardware-vendor assumptions; containerized local deployment is the initial deployment proposal.
- **Maintainability:** typed API contracts, migrations, supported dependency policy, automated checks, and documented interfaces.

## MVP boundary

The proposed MVP is a secure, self-hosted, read-mostly control plane: user authentication, node enrollment/revocation, node inventory and labels, basic host telemetry, current node status, simple history/health views, and audit events for administration. Exact identity provider, retention defaults, and authorization policy remain decision points. Work queues, remote commands, broad agent execution, Kubernetes deployment, and GitHub automation are outside initial scope.

## Later and experimental capabilities

- Later: job scheduling, richer alerting and log search, agent adapters, GitHub status integration, service controls, multi-user administration, Kubernetes deployment, and terminal access after security review.
- Experimental: cross-cluster federation, automated remediation, AI-assisted operations, GPU scheduling, and policy-driven workflows. These require separate threat, reliability, and operator-control review.

## Assumptions, limitations, dependencies, and risks

- Operators control the control-plane host, network, database, and backups.
- Nodes can initiate or receive an allowed encrypted connection according to the eventual deployment topology; NAT traversal is not assumed.
- Metrics availability varies by kernel, permissions, and hardware. Unsupported values must be reported as unavailable.
- PostgreSQL is the proposed durable store. Redis is optional and must be justified by measured queue, fanout, or cache needs.
- External agent APIs, GitHub access, TLS certificates, and GPU drivers may require separate setup and may change independently.
- A compromised control plane could affect enrolled nodes; isolation, narrow credentials, revocation, and recovery are critical risks.
- Remote execution, secrets handling, and autonomous remediation substantially expand the threat surface and are excluded from the MVP proposal.

## Success measures

Before release, define and measure: successful enrollment and revocation flows; telemetry freshness and completeness under representative test conditions; task completion and recovery behavior when later implemented; operator ability to identify stale/offline nodes; security findings resolved; and onboarding completion using only published documentation. No numeric target is asserted until a repeatable baseline exists.

## Acceptance criteria for MVP planning

- Architecture and interfaces distinguish control plane, node agent, and optional integrations.
- Enrollment, revocation, authorization, audit, data retention, and failure states have reviewed designs before implementation.
- Supported operating systems and metrics are explicitly capability-based.
- MVP excludes unrestricted shell execution and unreviewed automated changes.
- Documentation and CI validate only files and tools that exist.
- Each delivered feature has tests, operational guidance, and evidence-based support claims.
