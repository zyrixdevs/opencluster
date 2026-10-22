import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { demoApi } from "../data/demoApi";
import { initialClusters, initialNodes } from "../data/mock";
import type { Cluster, Node } from "../data/models";

type DashboardState = {
  clusters: Cluster[];
  nodes: Node[];
  selectedClusterId: string;
  selectedNodeId: string | null;
  sidebarCollapsed: boolean;
  compactDashboard: boolean;
  demoMotion: boolean;
  performanceMode: boolean;
  theme: "dark" | "light" | "system";
  addCluster: (name: string, region: string, description: string) => void;
  updateCluster: (
    id: string,
    changes: Partial<Pick<Cluster, "name" | "region" | "description">>,
  ) => void;
  selectCluster: (id: string) => void;
  selectNode: (id: string | null) => void;
  toggleSidebar: () => void;
  setCompactDashboard: (enabled: boolean) => void;
  setMotion: (enabled: boolean) => void;
  setPerformanceMode: (enabled: boolean) => void;
  setTheme: (theme: "dark" | "light" | "system") => void;
  toggleCoordinator: (id: string) => void;
  moveNode: (nodeId: string, clusterId: string) => void;
};
export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      clusters: initialClusters,
      nodes: initialNodes,
      selectedClusterId: initialClusters[0].id,
      selectedNodeId: null,
      sidebarCollapsed: false,
      compactDashboard: false,
      demoMotion: true,
      performanceMode: false,
      theme: "dark",
      addCluster: (name, region, description) =>
        set((state) => {
          const cluster = demoApi.createCluster(name, region, description);
          return {
            clusters: [...state.clusters, cluster],
            selectedClusterId: cluster.id,
          };
        }),
      updateCluster: (id, changes) =>
        set((state) => ({
          clusters: state.clusters.map((cluster) =>
            cluster.id === id
              ? demoApi.updateCluster(cluster, changes)
              : cluster,
          ),
        })),
      selectCluster: (id) =>
        set({ selectedClusterId: id, selectedNodeId: null }),
      selectNode: (id) => set({ selectedNodeId: id }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setCompactDashboard: (compactDashboard) => set({ compactDashboard }),
      setMotion: (demoMotion) => set({ demoMotion }),
      setPerformanceMode: (performanceMode) => set({ performanceMode }),
      setTheme: (theme) => set({ theme }),
      toggleCoordinator: (id) =>
        set((state) => {
          return { nodes: demoApi.designateCoordinator(state.nodes, id) };
        }),
      moveNode: (nodeId, clusterId) =>
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId ? demoApi.moveNode(node, clusterId) : node,
          ),
          clusters: state.clusters.map((cluster) => ({
            ...cluster,
            nodeIds: state.nodes
              .filter(
                (node) =>
                  (node.id === nodeId ? clusterId : node.clusterId) ===
                  cluster.id,
              )
              .map((node) => node.id),
          })),
        })),
    }),
    {
      name: "opencluster-demo-preferences",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: () => ({
        sidebarCollapsed: false,
        compactDashboard: false,
        demoMotion: true,
        performanceMode: false,
        theme: "dark" as const,
      }),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        compactDashboard: state.compactDashboard,
        demoMotion: state.demoMotion,
        performanceMode: state.performanceMode,
        theme: state.theme,
      }),
    },
  ),
);
