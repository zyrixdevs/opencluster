# Design System Direction

**Status:** Implemented dashboard direction for Phase 1; this remains a demo interface and does not indicate an operational control plane.

## Direction

OpenCluster uses a cinematic infrastructure-operations visual language: deep charcoal and navy surfaces, restrained cyan and mint accents, translucent panels, and a polished cool-neutral light theme. Keep status semantics and data density clear; do not imitate financial dashboards or imply an affiliation.

Use Sora Variable for display headings, Inter Variable for interface text, and JetBrains Mono Variable for technical identifiers and numerical data. Use expressive Home headings, readable 14–16px interface text, secondary labels generally at 12px or larger, 18–24px panel radii, 12px controls, and generous whitespace. Font files are bundled locally; page rendering does not depend on a font CDN.

Dark theme is the default for new local workspaces and uses charcoal/navy canvas, softened translucent surfaces, cyan and mint accents. Light theme uses a cool neutral canvas, white surfaces, deep ink, and dark teal accents. Existing saved theme preferences remain respected. Semantic health colors remain distinct from brand accents.

## Layout and navigation

Use the existing floating sidebar and top bar for desktop navigation, with the existing dock as the compact tablet and mobile navigation. Keep global cluster context and demo status visible. Home leads with an editorial greeting and a decorative particle core, followed by the existing operational summaries and charts. Desktop layouts prioritize multi-column comparison and information density; tablet and mobile use full-width content and touch-sized navigation.

## Component categories

- **Navigation:** sidebar, breadcrumbs, page tabs, cluster selector.
- **Status:** node state, freshness, health, capability chips, alert severity.
- **Data:** sortable/filterable tables, metric cards, charts, activity and audit timelines.
- **Actions:** labeled buttons, forms, confirmation dialogs, permission explanations.
- **Feedback:** skeleton/loading, empty, stale, partial-data, error, and success states.

Prefer reusable accessible TSX components and utility classes. Use the existing Lucide React and animation packages. React Bits-inspired components are used only where they fit a real dashboard touchpoint; decorative GPU scenes are lazy-loaded, particle counts are bounded, and reduced-motion/performance settings are honored. Avoid motion that distracts from changing operational state.

The **Component Lab** route exposes the supplied component set for hands-on use and review. Its prompt composer saves a local note and its context meter reports a rough local token estimate; it does not contact an AI service. Profile choices update the local display name, notifications use the existing browser preference, and the timezone/date tools report only local comparisons. Crystal and laser scenes remain decorative sample visuals. The Home crystal scene remains lazy-loaded, bounded to the existing particle cap, and honors reduced-motion and performance preferences.

Motion follows the same restrained sequence across pages: route container, headings and panels, then data visualization. Shared durations and easing live in `dashboard/src/animations/motion.ts`; charts animate only on first display and meaningful selection changes. The theme reveal starts at the selected control and falls back to an immediate update when reduced motion, performance mode, or browser support requires it.

## Data visualization and status

Charts must label units and time ranges and expose readable summaries. Do not imply precision unsupported by sampling. Tables should support keyboard-accessible sorting, filtering, and row navigation. Status must combine text/icon with color; distinguish offline from stale or unknown. Display sample age and gaps. Do not animate telemetry in ways that create false urgency.

## Accessibility and responsiveness

Target keyboard access, visible focus, semantic headings and controls, screen-reader names, sufficient contrast, reduced-motion preference, and usable touch targets. Color is never the sole carrier of meaning. Provide responsive alternatives for dense tables and charts. Validate actual contrast and screen-reader behavior during UI implementation.

## Visual tokens

Use the palette, type, spacing, and radius tokens documented above and in `dashboard/src/styles.css`. Keep readable tabular numerals for metrics. The shell and Home direction have been rendered and reviewed at four viewport sizes; the remaining routes are still awaiting design review before visual propagation.

Visual review captures: [1440×900 dark](visual-review/opencluster-home/home-1440x900-dark.png), [1920×1080 light](visual-review/opencluster-home/home-1920x1080-light.png), [768×1024 dark](visual-review/opencluster-home/home-768x1024-dark.png), and [390×844 light](visual-review/opencluster-home/home-390x844-light.png). Browser smoke checks also covered the circular theme reveal, canvas continuity during theme changes, and the keyboard search shortcut.
