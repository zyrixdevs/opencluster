export type TopologyPoint = { x: number; y: number };
export type TopologyPositions = Record<string, TopologyPoint>;

export const TOPOLOGY_LAYOUT_KEY = "opencluster.topology.layout.v1";
const MAX_POSITION = 20000;

export function restoreTopologyPositions(value: unknown): TopologyPositions {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return {};
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, point]) => {
        if (typeof point !== "object" || point === null || Array.isArray(point))
          return false;
        const candidate = point as Record<string, unknown>;
        return (
          Number.isFinite(candidate.x) &&
          Number.isFinite(candidate.y) &&
          Math.abs(candidate.x as number) <= MAX_POSITION &&
          Math.abs(candidate.y as number) <= MAX_POSITION
        );
      })
      .map(([id, point]) => [
        id,
        { x: (point as TopologyPoint).x, y: (point as TopologyPoint).y },
      ]),
  );
}

export function readTopologyPositions(): TopologyPositions {
  try {
    const raw = localStorage.getItem(TOPOLOGY_LAYOUT_KEY);
    return raw ? restoreTopologyPositions(JSON.parse(raw) as unknown) : {};
  } catch {
    return {};
  }
}

export function writeTopologyPositions(value: TopologyPositions): void {
  try {
    localStorage.setItem(
      TOPOLOGY_LAYOUT_KEY,
      JSON.stringify(restoreTopologyPositions(value)),
    );
  } catch {
    // Keep dragging available if browser storage is disabled or full.
  }
}
