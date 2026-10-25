import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initialClusters, initialNodes } from "../src/data/mock";
import { useDashboardStore } from "../src/state/useDashboardStore";

function resetStore() {
  useDashboardStore.setState({
    clusters: initialClusters,
    nodes: initialNodes,
    selectedClusterId: initialClusters[0].id,
    selectedNodeId: null,
    sidebarCollapsed: false,
    demoMotion: true,
    performanceMode: false,
    theme: "dark",
  });
}

beforeEach(() => {
  localStorage.clear();
  resetStore();
});

afterEach(() => {
  localStorage.clear();
});

describe("useDashboardStore", () => {
  it("adds a trimmed demo cluster and selects it", async () => {
    await useDashboardStore
      .getState()
      .addCluster("  Research Lab  ", "Local network", "Demo only");

    const state = useDashboardStore.getState();
    const added = state.clusters.at(-1);
    expect(added).toMatchObject({
      name: "Research Lab",
      region: "Local network",
      description: "Demo only",
      nodeIds: [],
    });
    expect(added?.id).toMatch(/^demo-\d+$/);
    expect(state.selectedClusterId).toBe(added?.id);
  });

  it("serializes concurrent local cluster additions without losing records", async () => {
    const store = useDashboardStore.getState();
    await Promise.all([
      store.addCluster("First concurrent", "Local", ""),
      store.addCluster("Second concurrent", "Local", ""),
    ]);
    expect(
      useDashboardStore.getState().clusters.map((item) => item.name),
    ).toEqual(
      expect.arrayContaining(["First concurrent", "Second concurrent"]),
    );
  });

  it("updates cluster metadata without changing other clusters", async () => {
    await useDashboardStore.getState().updateCluster("cl-main", {
      name: "Updated Core",
      description: "Updated",
    });

    const { clusters } = useDashboardStore.getState();
    expect(clusters[0]).toMatchObject({
      name: "Updated Core",
      description: "Updated",
    });
    expect(clusters[1]).toEqual(initialClusters[1]);
  });

  it("clears the selected node when switching clusters", () => {
    useDashboardStore.getState().selectNode("node-01");
    useDashboardStore.getState().selectCluster("cl-edge");

    expect(useDashboardStore.getState()).toMatchObject({
      selectedClusterId: "cl-edge",
      selectedNodeId: null,
    });
  });

  it("makes only the selected node's cluster coordinator", async () => {
    await useDashboardStore.getState().toggleCoordinator("node-02");

    const nodes = useDashboardStore.getState().nodes;
    expect(nodes.find((node) => node.id === "node-02")?.role).toBe(
      "coordinator",
    );
    expect(nodes.find((node) => node.id === "node-01")?.role).toBe("worker");
    expect(nodes.find((node) => node.id === "node-05")?.role).toBe(
      "coordinator",
    );
  });

  it("moves a coordinator atomically and preserves one coordinator per nonempty cluster", async () => {
    await useDashboardStore.getState().moveNode("node-01", "cl-edge");
    const { clusters, nodes } = useDashboardStore.getState();
    expect(nodes.find((node) => node.id === "node-01")).toMatchObject({
      clusterId: "cl-edge",
      role: "worker",
    });
    expect(nodes.find((node) => node.id === "node-02")?.role).toBe(
      "coordinator",
    );
    expect(
      nodes.filter(
        (node) => node.clusterId === "cl-edge" && node.role === "coordinator",
      ),
    ).toHaveLength(1);
    expect(
      clusters.find((cluster) => cluster.id === "cl-main")?.nodeIds,
    ).not.toContain("node-01");
  });

  it("removes a cluster atomically and preserves the fallback coordinator", async () => {
    await expect(
      useDashboardStore.getState().removeCluster("cl-main"),
    ).resolves.toBe(true);
    const { clusters, nodes } = useDashboardStore.getState();
    expect(clusters.some((cluster) => cluster.id === "cl-main")).toBe(false);
    expect(
      nodes.filter(
        (node) => node.clusterId === "cl-edge" && node.role === "coordinator",
      ),
    ).toHaveLength(1);
    expect(nodes.find((node) => node.id === "node-01")).toMatchObject({
      clusterId: "cl-edge",
      role: "worker",
    });
  });

  it("keeps selected node state out of persisted browser preferences", () => {
    useDashboardStore.getState().selectNode("node-01");
    useDashboardStore.getState().setTheme("light");

    const persisted = JSON.parse(
      localStorage.getItem("opencluster-demo-preferences") ?? "{}",
    );
    expect(persisted.state.theme).toBe("light");
    expect(persisted.state.selectedNodeId).toBeUndefined();

    useDashboardStore.getState().setTheme("dark");
    const darkPreferences = JSON.parse(
      localStorage.getItem("opencluster-demo-preferences") ?? "{}",
    );
    expect(darkPreferences.state.theme).toBe("dark");
  });

  it("persists the non-sensitive performance preference", () => {
    useDashboardStore.getState().setPerformanceMode(true);
    const persisted = JSON.parse(
      localStorage.getItem("opencluster-demo-preferences") ?? "{}",
    );
    expect(persisted.state.performanceMode).toBe(true);
  });
});
