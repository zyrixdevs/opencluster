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
  it("adds a trimmed demo cluster and selects it", () => {
    useDashboardStore
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

  it("updates cluster metadata without changing other clusters", () => {
    useDashboardStore.getState().updateCluster("cl-main", {
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

  it("makes only the selected node's cluster coordinator", () => {
    useDashboardStore.getState().toggleCoordinator("node-02");

    const nodes = useDashboardStore.getState().nodes;
    expect(nodes.find((node) => node.id === "node-02")?.role).toBe(
      "coordinator",
    );
    expect(nodes.find((node) => node.id === "node-01")?.role).toBe("worker");
    expect(nodes.find((node) => node.id === "node-05")?.role).toBe(
      "coordinator",
    );
  });

  it("keeps selected node state out of persisted browser preferences", () => {
    useDashboardStore.getState().selectNode("node-01");
    useDashboardStore.getState().setTheme("light");

    const persisted = JSON.parse(
      localStorage.getItem("opencluster-demo-preferences") ?? "{}",
    );
    expect(persisted.state.theme).toBe("light");
    expect(persisted.state.selectedNodeId).toBeUndefined();
  });

  it("persists the non-sensitive performance preference", () => {
    useDashboardStore.getState().setPerformanceMode(true);
    const persisted = JSON.parse(
      localStorage.getItem("opencluster-demo-preferences") ?? "{}",
    );
    expect(persisted.state.performanceMode).toBe(true);
  });
});
