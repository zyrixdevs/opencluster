# Dashboard Motion and Performance

## Rendering boundaries

- React Router lazy-loads each page so the initial shell does not include monitoring charts, the AI graph, automation canvas, or 3D dependencies.
- Mission Control loads the Three.js globe only after the operator selects the 3D globe mode. Network and orbit modes use SVG.
- Agents and Automation use SVG and HTML elements with pointer-driven transforms. Their mock graphs are small enough that table or graph virtualization is not needed.
- Font files are bundled with the dashboard. The app makes no external font request.

## Motion responsibilities

- Framer Motion handles small route entrance transitions.
- GSAP sequences the Home holographic signal visual only.
- Lenis provides document scrolling while full motion is enabled. It is not active in performance mode or when the operating system requests reduced motion.
- Three.js is limited to the optional Mission Control globe. No animation library animates telemetry values.

The decorative GSAP and Three.js loops stop when the browser tab is hidden. The controls still work without automatic motion. OS reduced-motion and the saved demo motion preference disable decorative animation. Performance mode avoids Lenis, reduces WebGL pixel ratio, and removes costly blur/glow treatments.

## Performance expectations

- Keep canvas and SVG animations scoped to the active page and use transforms/opacity for motion.
- Coalesce resize updates with `requestAnimationFrame`; dispose WebGL geometry, materials, observers, and event listeners when leaving globe mode.
- Use a static, selectable-node fallback when WebGL is unavailable. Lower the renderer pixel ratio for performance mode and weak displays.
- Inspect production chunk output when adding dependencies. Three.js must remain in the lazy globe chunk; do not increase the initial shell chunk to support optional visualizations.
- Large event histories are not present in the mock dataset. Add virtualization only when realistic data sizes show a measurable need.

## Scope limits

Performance has been checked through typechecking and the production build, not through a device lab or benchmark suite. The interface is illustrative; no real-time refresh rate, node-count ceiling, or hardware performance target is claimed.
