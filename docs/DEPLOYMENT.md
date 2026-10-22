# Deployment proposal

No deployment is currently supported because the application does not exist. This document records the intended operational boundary, not installation steps.

## Planned local deployment

Docker Compose is the proposed development and small self-hosted deployment path after the services are implemented. A future supported topology is expected to include the API, PostgreSQL, a reverse proxy, and optionally a frontend container. Redis will be included only if measured queue, fan-out, or cache needs justify it. No Compose file, image, port map, or environment variable set exists yet.

## Network and TLS

- Operators will need a stable route from browser to control plane and from enrolled nodes to the control plane.
- Production traffic must use TLS. The proxy should be the only public ingress; database and internal service ports must not be exposed publicly.
- Node egress and control-plane ingress requirements, certificate renewal, reverse-proxy headers, and firewall rules must be documented before the first supported release.
- Avoid relying on inbound connections to individual nodes where an authenticated outbound agent channel can meet the requirements.

## Operations

The implementation must define database backup and restore, upgrade and rollback procedures, data retention, log rotation, health checks, and recovery behavior before production readiness. Kubernetes is a possible later deployment target, not an MVP requirement. Arch Linux and Debian are initial node targets; the control-plane deployment must remain independent of Lenovo hardware.

## Secure boundary

Run services as non-root where possible. Separate secrets from images and source control. Restrict the control server's access to nodes and require authorization and audit records for privileged actions. Never expose an unrestricted terminal endpoint.

## Future acceptance gate

Deployment is supportable only when configuration examples, networking requirements, tested backup/restore, upgrade behavior, health checks, and security defaults are verified on a documented environment. No performance or availability target is asserted here.
