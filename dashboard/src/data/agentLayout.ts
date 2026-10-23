import { localProvider } from "./localProvider";

export type AgentGraphMode = "network" | "radial";
export type AgentGraphPoint = { x: number; y: number };
export type AgentGraphCamera = { x: number; y: number; zoom: number };
export type AgentGraphLayout = {
  positions: Record<AgentGraphMode, Record<string, AgentGraphPoint>>;
  cameras: Record<AgentGraphMode, AgentGraphCamera>;
};

function restoreLayout(
  value: unknown,
  fallback: AgentGraphLayout,
): AgentGraphLayout {
  if (typeof value !== "object" || value === null) return fallback;
  const data = value as Partial<AgentGraphLayout>;
  const positions = { ...fallback.positions };
  const cameras = { ...fallback.cameras };
  for (const mode of ["network", "radial"] as const) {
    const candidate = data.positions?.[mode];
    if (candidate && typeof candidate === "object") {
      positions[mode] = {
        ...fallback.positions[mode],
        ...Object.fromEntries(
          Object.entries(candidate).filter(
            (entry): entry is [string, AgentGraphPoint] =>
              typeof entry[1] === "object" &&
              entry[1] !== null &&
              Number.isFinite((entry[1] as AgentGraphPoint).x) &&
              Number.isFinite((entry[1] as AgentGraphPoint).y),
          ),
        ),
      };
    }
    const camera = data.cameras?.[mode];
    if (
      camera &&
      Number.isFinite(camera.x) &&
      Number.isFinite(camera.y) &&
      Number.isFinite(camera.zoom)
    ) {
      cameras[mode] = {
        x: camera.x,
        y: camera.y,
        zoom: Math.max(0.65, Math.min(1.8, camera.zoom)),
      };
    }
  }
  return { positions, cameras };
}

export async function readAgentGraphLayout(
  fallback: AgentGraphLayout,
): Promise<AgentGraphLayout> {
  try {
    return restoreLayout(
      await localProvider.get<unknown>("agent-layouts", "default"),
      fallback,
    );
  } catch {
    return fallback;
  }
}

export async function writeAgentGraphLayout(
  layout: AgentGraphLayout,
): Promise<void> {
  try {
    await localProvider.put("agent-layouts", "default", layout);
  } catch {
    // Layout persistence is best effort; graph editing remains available if IndexedDB is unavailable.
  }
}

/* ORIGINAL (preserved, not deleted — disabled by comment):
const STORAGE_KEY = "opencluster.agents.layout.v1";
export function readAgentGraphLayoutFromLocalStorage(fallback: AgentGraphLayout): AgentGraphLayout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    return restoreLayout(JSON.parse(raw), fallback);
  } catch {
    return fallback;
  }
}
export function writeAgentGraphLayoutToLocalStorage(layout: AgentGraphLayout): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch {
    // Layout persistence is best effort; graph editing remains available if storage is blocked or full.
  }
}
*/
