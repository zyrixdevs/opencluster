# Node Agent and Protocol Proposal

**Status:** Design only. No agent, wire protocol, enrollment flow, or upgrade mechanism is implemented.

## Agent responsibilities

The proposed Linux agent collects a bounded allowlist of host metrics, reports its identity and supported capabilities, and maintains an authenticated connection to the control plane. Initial OS targets are Arch Linux and Debian. Hardware vendor and Lenovo-specific assumptions are prohibited; GPU metrics are optional and capability-detected.

## Transport and identity

Use TLS with server identity validation. Prefer agent-initiated outbound connections for environments where inbound node access is restricted. Authenticate each node with an individual revocable credential or certificate. Enrollment should use a short-lived, single-use token, bind the resulting identity to an administrator-approved node, and support rotation and revocation. Exact cryptographic and bootstrap choices require implementation review; do not invent a shared fleet secret.

## Message design

Messages should include protocol version, node ID, sequence/request ID where relevant, observed timestamp, and typed payload. Validate message size, metric names, units, ranges, clock anomalies, and supported version. Server records receipt time separately from observation time. Unknown optional fields can be ignored only under a documented compatibility policy; incompatible versions should fail clearly.

Initial conceptual message classes: enrollment exchange, heartbeat/capability report, telemetry batch, and server acknowledgement/configuration. No remote command message is part of the MVP protocol. If a later operation channel is proposed, it must have narrow typed operations, explicit authorization, replay protection, expiry, audit, cancellation, and user-visible confirmation; it must not accept arbitrary shell strings.

## Collection and resource isolation

Prefer read-only OS interfaces and bounded sampling. Collection interval and data volume are not set until tested on target hardware. The service should run under a dedicated unprivileged account where possible, with only documented capabilities or read permissions. Never grant blanket root access solely for optional metrics. Use systemd as a likely Linux supervision target, while documenting non-systemd alternatives if supported.

## Upgrades and failure behavior

Agent self-upgrade is deferred. Before implementing it, define signed artifact verification, rollback, staged rollout, compatibility, and recovery when connectivity fails. On disconnect, buffer only bounded data if designed; report gaps and freshness rather than replaying indefinitely. Reconnect with backoff and avoid synchronized reconnect storms.

## Open decisions

Python versus Go/Rust implementation, protocol encoding, certificate provisioning, sampling policy, exact systemd packaging, offline buffering, and minimum supported kernel/distribution versions.
