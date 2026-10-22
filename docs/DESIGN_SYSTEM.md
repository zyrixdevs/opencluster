# Design System Direction

**Status:** Visual and interaction guidance only; no interface is implemented.

## Direction

OpenCluster should read as a professional infrastructure command center: dark-first, restrained, information-dense, and calm under operational pressure. Favor clear hierarchy and consistent alignment over decorative effects. Support beginner homelab users with plain labels and useful empty states while retaining fast scanning and filters for experienced administrators.

## Layout and navigation

Use a persistent primary navigation for Overview, Nodes, Workloads/Agents (when implemented), Alerts, and Administration. Keep global cluster context and connection state visible. Desktop layouts prioritize multi-column comparison and resizable information density; tablet collapses secondary navigation; mobile prioritizes status, search, and focused detail views. Multi-monitor use should preserve context across wide displays without relying on extreme-width layouts.

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
