import { afterEach, describe, expect, it, vi } from "vitest";
import { demoApi } from "../src/data/demoApi";
import {
  initialActivity,
  initialClusters,
  initialNodes,
  initialTasks,
} from "../src/data/mock";

afterEach(() => {
  vi.useRealTimers();
});

describe("demoApi", () => {
  it("returns isolated copies of each demo collection", async () => {
    vi.useFakeTimers();
    const clustersRequest = demoApi.getClusters();
    const nodesRequest = demoApi.getNodes();
    const tasksRequest = demoApi.getTasks();
    const activityRequest = demoApi.getActivity();

    await vi.advanceTimersByTimeAsync(120);
    const [clusters, nodes, tasks, activity] = await Promise.all([
      clustersRequest,
      nodesRequest,
      tasksRequest,
      activityRequest,
    ]);

    expect(clusters).toEqual(initialClusters);
    expect(nodes).toEqual(initialNodes);
    expect(tasks).toEqual(initialTasks);
    expect(activity).toEqual(initialActivity);

    clusters[0].name = "Changed in caller";
    nodes[0].labels.push("caller-only");
    tasks[0].name = "Changed in caller";
    activity[0].title = "Changed in caller";
    expect(initialClusters[0].name).not.toBe("Changed in caller");
    expect(initialNodes[0].labels).not.toContain("caller-only");
    expect(initialTasks[0].name).not.toBe("Changed in caller");
    expect(initialActivity[0].title).not.toBe("Changed in caller");
  });

  it("filters nodes to the requested cluster and returns no nodes for an unknown cluster", async () => {
    vi.useFakeTimers();
    const edgeRequest = demoApi.getNodes("cl-edge");
    const unknownRequest = demoApi.getNodes("missing-cluster");

    await vi.advanceTimersByTimeAsync(120);
    const [edgeNodes, missingNodes] = await Promise.all([
      edgeRequest,
      unknownRequest,
    ]);

    expect(edgeNodes.map((node) => node.id)).toEqual(["node-05", "node-06"]);
    expect(edgeNodes.every((node) => node.clusterId === "cl-edge")).toBe(true);
    expect(missingNodes).toEqual([]);
  });
});
