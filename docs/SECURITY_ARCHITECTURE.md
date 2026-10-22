# Security Architecture

**Status:** Requirements and proposed boundaries; no application security controls are implemented yet.

## Threat model

Assets include user accounts, node credentials, integration secrets, infrastructure topology, telemetry, audit records, and the ability to affect enrolled hosts. Threat actors include an unauthenticated network client, compromised user, compromised node, malicious integration, and an attacker with control-plane or host access. The control server is high impact: compromise could expose data or enable actions on enrolled nodes.

## Trust boundaries

- Browser to API: authenticate every request; enforce authorization on the server.
- Agent to server: mutually identifiable encrypted transport, node-scoped credentials, bounded input validation, replay/expiry rules, and revocation.
- Server to database: least-privilege service account, protected credentials, constrained network access, and encrypted backups.
- Server to integrations: scoped, revocable credentials and explicit outbound access; do not forward secrets to the browser.
- Operator to deployment: reverse proxy/TLS, host hardening, backups, updates, and secret provisioning are operational responsibilities requiring documented procedures.

## Required controls before production

- Deny-by-default authorization with separate read, administration, and operational capabilities.
- Authentication/session protections and protection against CSRF where cookie authentication is used.
- Secure enrollment, per-node identity, rotation, and prompt revocation.
- TLS validation; no insecure fallback.
- Input size/schema validation, rate limits appropriate to endpoints, and safe error messages.
- Audit events for enrollment, revocation, role changes, integrations, and privileged operations.
- Secret references and redaction in logs; no secrets in source, responses, or telemetry.
- Backup encryption and restore testing; patch and dependency review process.
- Explicit confirmation and target/effect display for dangerous future actions.

## Remote operations boundary

Unrestricted remote shell and arbitrary cross-node command execution are prohibited product defaults. They are not MVP features. Any future service-management operation needs a narrow typed API, scoped permission, per-target authorization, audit record, timeout/cancellation semantics, and explicit user confirmation. Agent or AI integrations must not inherit authority from mere registration.

## Deployment guidance to be completed

Expose only required ports, isolate the database, place TLS termination at a documented trusted boundary, protect host and container secrets, restrict container capabilities, and keep the control plane off untrusted networks unless access controls are configured. The exact ports, hardening profile, and incident response procedures are undecided and must be documented before a supported deployment is claimed.
