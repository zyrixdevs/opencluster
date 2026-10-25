# Mission Control topology visualization

Mission Control opens to a local, illustrative topology at `/mission-control`. The existing application shell still owns global navigation, theme switching, search, and preferences. Orbit, 3D globe, and laser-flow modes remain available.

## Graph and sample data

`dashboard/src/features/topology/TopologyExperience.tsx` renders the graph with the already-installed `@xyflow/react` package. React Flow owns node movement, edge routing, pan/zoom, selection, and reset. `topologySample.ts` supplies five typed example machines and their workloads. The selected node drives the inspector tabs. Node positions are stored under `opencluster.topology.layout.v1` in localStorage; invalid or unavailable stored values fall back to the default arrangement.

The sample is not connected to a node provider. Status, resource values, services, virtual machines, containers, and insights are presentation data. The assistant does not send a request, create a VM, or claim an operation succeeded. Logs identify the missing source instead of fabricating entries.

## Z.Y.R.I.X renderer

`dashboard/src/features/zyrix-core/ZyrixCore.tsx` draws a deterministic spherical `THREE.Points` nucleus and outer shell, three low-opacity orbital loops, and accessible DOM labels. Three local quality presets use 1,200, 4,800, and 10,000 particles. The component observes size and visibility, pauses its animation when hidden/offscreen or reduced motion/performance preference disables it, handles WebGL initialization/context failure, and disposes GPU resources on unmount. React Flow remains the sole owner of graph coordinates and relationships; the renderer does not draw or move graph edges.

The Casberry simulator was reviewed for its public particle-function inputs and export formats. Its generated source and redistribution license were not available in the inspected page, so no Casberry source or preset is included. The local particle layout is independently authored and has no runtime connection to Casberry. See [Casberry Particle Simulator](https://particles.casberry.in/).

## Visual review

Browser captures of the topology are stored in [`docs/visual-review/opencluster-topology/`](visual-review/opencluster-topology/): [1920×1080](visual-review/opencluster-topology/1920x1080.jpg), [1440×900](visual-review/opencluster-topology/1440x900.jpg), [1366×768](visual-review/opencluster-topology/1366x768.jpg), [768×1024](visual-review/opencluster-topology/768x1024.jpg), and [390×844](visual-review/opencluster-topology/390x844.jpg). Responsive layouts had no horizontal document overflow in those runs. These screenshots are browser-rendered visual evidence, not hardware performance benchmarks.
