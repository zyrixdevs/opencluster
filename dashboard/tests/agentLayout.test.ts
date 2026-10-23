import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type AgentGraphLayout,
  readAgentGraphLayout,
  writeAgentGraphLayout,
} from "../src/data/agentLayout";
import { localProvider } from "../src/data/localProvider";

vi.mock("../src/data/localProvider", () => ({
  localProvider: { get: vi.fn(), put: vi.fn() },
}));

const fallback: AgentGraphLayout = {
  positions: { network: { a: { x: 1, y: 2 } }, radial: { a: { x: 3, y: 4 } } },
  cameras: {
    network: { x: 0, y: 0, zoom: 1 },
    radial: { x: 0, y: 0, zoom: 1 },
  },
};

beforeEach(() => vi.resetAllMocks());

describe("agent graph layout persistence", () => {
  it("round trips the layout through the agent-layouts bucket", async () => {
    const changed: AgentGraphLayout = {
      ...fallback,
      positions: { ...fallback.positions, network: { a: { x: 42, y: 19 } } },
      cameras: { ...fallback.cameras, network: { x: 8, y: -2, zoom: 1.4 } },
    };
    vi.mocked(localProvider.get).mockResolvedValue(changed);
    await writeAgentGraphLayout(changed);
    expect(localProvider.put).toHaveBeenCalledWith(
      "agent-layouts",
      "default",
      changed,
    );
    expect(await readAgentGraphLayout(fallback)).toEqual(changed);
  });

  it("falls back for invalid records and clamps zoom", async () => {
    vi.mocked(localProvider.get).mockResolvedValue({
      positions: { network: { bad: { x: "x", y: 1 } } },
      cameras: { network: { x: 0, y: 0, zoom: 9 } },
    });
    const restored = await readAgentGraphLayout(fallback);
    expect(restored.positions.network).toEqual(fallback.positions.network);
    expect(restored.cameras.network.zoom).toBe(1.8);
  });

  it("keeps graph usable when IndexedDB reads or writes fail", async () => {
    vi.mocked(localProvider.get).mockRejectedValue(new Error("blocked"));
    vi.mocked(localProvider.put).mockRejectedValue(new Error("quota"));
    expect(await readAgentGraphLayout(fallback)).toEqual(fallback);
    await expect(writeAgentGraphLayout(fallback)).resolves.toBeUndefined();
  });
});

/* ORIGINAL (preserved, not deleted — disabled by comment):
afterEach(() => localStorage.clear());
it("round trips both layouts and camera states", () => {
  writeAgentGraphLayout(changed);
  expect(readAgentGraphLayout(fallback)).toEqual(changed);
});
it("falls back safely for malformed storage and clamps camera zoom", () => {
  localStorage.setItem("opencluster.agents.layout.v1", "{");
  expect(readAgentGraphLayout(fallback)).toEqual(fallback);
});
*/
