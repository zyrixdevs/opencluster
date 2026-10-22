# Security Policy

OpenCluster is in its foundation phase. There is no released application or supported production deployment yet, and the security architecture describes requirements rather than implemented guarantees.

## Reporting a vulnerability

Please do not publish exploitable vulnerability details in a public issue. Use GitHub's **Report a vulnerability** feature for this repository if private vulnerability reporting is enabled. Otherwise, contact a repository maintainer through a verified private channel listed in the repository or organization profile. Do not send secrets or sensitive system data in an initial report.

Include the affected commit or component, impact, reproduction steps, and any suggested mitigation. The project will acknowledge reports when a private contact route is available, assess severity and affected versions, coordinate a fix and disclosure, and credit reporters with their consent. Response times and supported-version commitments have not yet been established.

## Scope and safe testing

Until a release and support policy are published, there are no formally supported release branches. Do not test against systems, clusters, or accounts you do not own or have explicit authorization to assess. Avoid destructive testing and minimize access to real data.

## Security design goals

Planned controls include least-privilege authorization, authenticated and encrypted node communication, protected enrollment, auditable privileged actions, and safe secret handling. These are design goals only; do not treat them as present in an unimplemented component. Never expose unrestricted remote shells or commit credentials.
