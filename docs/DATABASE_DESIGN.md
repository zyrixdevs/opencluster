# Database Design Proposal

**Status:** Conceptual model only; no schema or migrations exist.

## Candidate entities

- **User / role assignment:** authenticated principal and scoped permissions. External identity references may be preferable to storing passwords.
- **Cluster:** logical administrative boundary; whether one deployment supports multiple clusters/tenants is undecided.
- **Node:** stable ID, enrollment state, display metadata, labels, reported capabilities, OS details, and last-seen timestamp.
- **Node credential metadata:** identifier, issuance/rotation/revocation state; secret material should not be stored in plaintext.
- **Metric sample:** node, metric name, numeric value, unit, collection timestamp, and schema version. Avoid arbitrary unbounded labels.
- **Audit event:** actor, action, target, outcome, timestamp, and constrained context; append-oriented and access-controlled.
- **Integration configuration:** provider, enabled state, and secret reference; secret values belong in a protected secret store or deployment secret mechanism.

## Storage principles

PostgreSQL is the proposed source of durable control-plane state. Enforce foreign keys and uniqueness for identity and enrollment invariants. Use explicit UTC timestamps and migrations. Separate high-volume metric retention from durable inventory/audit semantics. Retention, partitioning, compression, and deletion policy must be selected from representative measurements; no scale claim is made. Do not persist raw logs by default until volume, access control, and retention are specified.

## Security and lifecycle

Apply least-privilege database roles, encrypted backups, protected connection configuration, and tested restore procedures. Audit records need tamper-evident operational handling; a normal database table alone does not prove immutability. Define deletion and export behavior for user and telemetry data before release. Enrollment secrets should be one-time and expiring, stored as hashes where feasible, and revoked on use or timeout.

## Unresolved decisions

Tenant/cluster cardinality, identity provider, metric schema, retention defaults, audit retention, soft-delete versus purge semantics, and whether a separate time-series store is ever warranted.
