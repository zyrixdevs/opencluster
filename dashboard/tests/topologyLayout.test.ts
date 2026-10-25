import { describe, expect, it } from "vitest";
import { restoreTopologyPositions } from "../src/features/topology/topologyLayout";

describe("topology layout restore", () => {
  it("keeps only finite coordinates within the supported canvas bounds", () => {
    expect(
      restoreTopologyPositions({
        pc: { x: 20, y: -40 },
        nan: { x: Number.NaN, y: 2 },
        far: { x: 20001, y: 0 },
        malformed: null,
      }),
    ).toEqual({ pc: { x: 20, y: -40 } });
  });

  it("returns an empty layout for malformed root values", () => {
    expect(restoreTopologyPositions(null)).toEqual({});
    expect(restoreTopologyPositions("invalid")).toEqual({});
  });
});
