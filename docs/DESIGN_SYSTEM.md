# Design System Direction

**Status:** Implemented dashboard direction for Phase 1; this remains a demo interface and does not indicate an operational control plane.

## Direction

OpenCluster should read as a professional infrastructure command center: dark-first, restrained, information-dense, and calm under operational pressure. Favor clear hierarchy and consistent alignment over decorative effects. Support beginner homelab users with plain labels and useful empty states while retaining fast scanning and filters for experienced administrators.

The dashboard uses a dark graphite foundation, blue/cyan holographic accents, and subtle glass-like surfaces. Sora is used for display headings and Inter for dense UI text and labels. Font files are bundled locally; page rendering does not depend on a font CDN.

## Layout and navigation

Use a persistent primary navigation for Home, Mission Control, Clusters, Nodes, Agents, Automation, AI Software, Tasks, Monitoring, Activity, and Settings. Keep global cluster context and demo status visible. Desktop layouts prioritize multi-column comparison and information density; tablet collapses secondary navigation; mobile prioritizes status, search, and focused detail views.

## Component categories

- **Navigation:** sidebar, breadcrumbs, page tabs, cluster selector.
- **Status:** node state, freshness, health, capability chips, alert severity.
- **Data:** sortable/filterable tables, metric cards, charts, activity and audit timelines.
- **Actions:** labeled buttons, forms, confirmation dialogs, permission explanations.
- **Feedback:** skeleton/loading, empty, stale, partial-data, error, and success states.

Prefer reusable accessible TSX components and utility classes. Use shadcn/ui and Lucide React where they fit; React Bits only when motion or visual treatment improves comprehension. Minimize handwritten CSS and avoid adding motion that distracts from changing operational state.

## Data visualization and status

Charts must label units and time ranges and expose readable summaries. Do not imply precision unsupported by sampling. Tables should support keyboard-accessible sorting, filtering, and row navigation. Status must combine text/icon with color; distinguish offline from stale or unknown. Display sample age and gaps. Do not animate telemetry in ways that create false urgency.

## Accessibility and responsiveness

Target keyboard access, visible focus, semantic headings and controls, screen-reader names, sufficient contrast, reduced-motion preference, and usable touch targets. Color is never the sole carrier of meaning. Provide responsive alternatives for dense tables and charts. Validate actual contrast and screen-reader behavior during UI implementation.

## Visual tokens to define during implementation

Choose a restrained neutral dark palette with a small semantic accent set, consistent spacing and radii, readable tabular numerals for metrics, and a clear type scale. Exact color values, typefaces, and contrast ratios must be selected and checked in the implemented theme; this document does not claim they have been tested.
