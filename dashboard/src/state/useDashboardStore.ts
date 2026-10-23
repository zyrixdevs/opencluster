import { create } from "zustand";
import type { StateStorage } from "zustand/middleware";
import { createJSONStorage, persist } from "zustand/middleware";
import { demoApi } from "../data/demoApi";
import { localProvider } from "../data/localProvider";
import { dashboardQueryClient } from "../data/queryClient";
import { initialClusters, initialNodes } from "../data/mock";
import type { Cluster, Node } from "../data/models";

let localMutationQueue: Promise<void> = Promise.resolve();
function serializeLocalMutation<T>(mutation: () => Promise<T>): Promise<T> {
  const pending = localMutationQueue.then(mutation, mutation);
  localMutationQueue = pending.then(
    () => undefined,
    () => undefined,
  );
  return pending;
}

const isCluster = (value: unknown): value is Cluster => {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.region === "string" &&
    typeof item.description === "string" &&
    typeof item.createdAt === "string" &&
    Array.isArray(item.nodeIds) &&
    item.nodeIds.every((id) => typeof id === "string")
  );
};
const isNode = (value: unknown): value is Node => {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    (item.role === "coordinator" || item.role === "worker") &&
    typeof item.clusterId === "string" &&
    typeof item.host === "string" &&
    typeof item.os === "string" &&
    ["healthy", "warning", "offline", "unknown"].includes(
      String(item.health),
    ) &&
    ["cpu", "memory", "disk", "network"].every(
      (key) => typeof item[key] === "number" && Number.isFinite(item[key]),
    ) &&
    typeof item.uptime === "string" &&
    typeof item.lastSeen === "string" &&
    Array.isArray(item.labels) &&
    item.labels.every((label) => typeof label === "string")
  );
};
const guardedStorage: StateStorage = {
  getItem(name) {
    try {
      const value = localStorage.getItem(name);
      if (!value) return null;
      const parsed: unknown = JSON.parse(value);
      return parsed && typeof parsed === "object" && "state" in parsed
        ? value
        : null;
    } catch {
      return null;
    }
  },
  setItem(name, value) {
    try {
      localStorage.setItem(name, value);
    } catch {
      /* Browser storage may be disabled or full. */
    }
  },
  removeItem(name) {
    try {
      localStorage.removeItem(name);
    } catch {
      /* Browser storage may be disabled. */
    }
  },
};

type DashboardState = {
  clusters: Cluster[];
  nodes: Node[];
  selectedClusterId: string;
  selectedNodeId: string | null;
  sidebarCollapsed: boolean;
  compactDashboard: boolean;
  demoMotion: boolean;
  performanceMode: boolean;
  displayName: string;
  cinematicMotion: boolean;
  motionMode: "system" | "reduced" | "cinematic";
  visualQuality: "auto" | "performance" | "high";
  demoDataset: "multi-cluster" | "homelab-only";
  persistenceError: string | null;
  theme: "dark" | "light" | "system";
  addCluster: (
    name: string,
    region: string,
    description: string,
  ) => Promise<void>;
  updateCluster: (
    id: string,
    changes: Partial<Pick<Cluster, "name" | "region" | "description">>,
  ) => Promise<void>;
  removeCluster: (id: string) => Promise<boolean>;
  selectCluster: (id: string) => void;
  selectNode: (id: string | null) => void;
  toggleSidebar: () => void;
  setCompactDashboard: (enabled: boolean) => void;
  setMotion: (enabled: boolean) => void;
  setPerformanceMode: (enabled: boolean) => void;
  setDisplayName: (name: string) => void;
  setCinematicMotion: (enabled: boolean) => void;
  setMotionMode: (mode: "system" | "reduced" | "cinematic") => void;
  setVisualQuality: (quality: "auto" | "performance" | "high") => void;
  setDemoDataset: (dataset: "multi-cluster" | "homelab-only") => Promise<void>;
  resetDemoData: () => Promise<void>;
  clearPersistenceError: () => void;
  setTheme: (theme: "dark" | "light" | "system") => void;
  toggleCoordinator: (id: string) => Promise<void>;
  moveNode: (nodeId: string, clusterId: string) => Promise<void>;
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
      displayName: "operator",
      cinematicMotion: false,
      motionMode: "system",
      visualQuality: "auto",
      demoDataset: "multi-cluster",
      persistenceError: null,
      theme: "dark",
      addCluster: (name, region, description) =>
        serializeLocalMutation(async () => {
        const state = useDashboardStore.getState();
        const created = demoApi.createCluster(name, region, description);
        const cluster = state.clusters.some((item) => item.id === created.id)
          ? { ...created, id: `${created.id}-${crypto.randomUUID()}` }
          : created;
        try {
          await localProvider.put("clusters", cluster.id, cluster);
          set({
            clusters: [...state.clusters, cluster],
            selectedClusterId: cluster.id,
            persistenceError: null,
          });
          void dashboardQueryClient.invalidateQueries();
        } catch (error) {
          set({
            persistenceError:
              error instanceof Error
                ? error.message
                : "Could not save cluster locally.",
          });
          throw error;
        }
        }),
      updateCluster: (id, changes) =>
        serializeLocalMutation(async () => {
        const state = useDashboardStore.getState();
        const clusters = state.clusters.map((cluster) =>
          cluster.id === id ? demoApi.updateCluster(cluster, changes) : cluster,
        );
        const updated = clusters.find((cluster) => cluster.id === id);
        if (!updated) return;
        try {
          await localProvider.put("clusters", id, updated);
          set({ clusters, persistenceError: null });
          void dashboardQueryClient.invalidateQueries();
        } catch (error) {
          set({
            persistenceError:
              error instanceof Error
                ? error.message
                : "Could not save cluster locally.",
          });
          throw error;
        }
        }),
      removeCluster: (id) =>
        serializeLocalMutation(async () => {
        const state = useDashboardStore.getState();
        if (state.clusters.length < 2) return false;
        const fallback = state.clusters.find((cluster) => cluster.id !== id);
        if (!fallback || !state.clusters.some((cluster) => cluster.id === id))
          return false;
        const movedNodes = state.nodes.map((node) =>
          node.clusterId === id ? { ...node, clusterId: fallback.id } : node,
        );
        const targetNodes = movedNodes.filter(
          (node) => node.clusterId === fallback.id,
        );
        const targetCoordinator =
          state.nodes.find(
            (node) => node.clusterId === fallback.id && node.role === "coordinator",
          ) ??
          targetNodes[0];
        const nodes = movedNodes.map((node) =>
          node.clusterId === fallback.id
            ? {
                ...node,
                role: node.id === targetCoordinator?.id ? "coordinator" as const : "worker" as const,
              }
            : node,
        );
        const clusters = state.clusters
          .filter((cluster) => cluster.id !== id)
          .map((cluster) => ({
            ...cluster,
            nodeIds: nodes
              .filter((node) => node.clusterId === cluster.id)
              .map((node) => node.id),
          }));
        try {
          await localProvider.writeClusterNodeState(clusters, nodes);
          set({
            clusters,
            nodes,
            selectedClusterId:
              state.selectedClusterId === id
                ? fallback.id
                : state.selectedClusterId,
            selectedNodeId: null,
            persistenceError: null,
          });
          void dashboardQueryClient.invalidateQueries();
          return true;
        } catch (error) {
          set({
            persistenceError:
              error instanceof Error
                ? error.message
                : "Could not remove cluster locally.",
          });
          return false;
        }
        }),
      selectCluster: (id) =>
        set({ selectedClusterId: id, selectedNodeId: null }),
      selectNode: (id) => set({ selectedNodeId: id }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setCompactDashboard: (compactDashboard) => set({ compactDashboard }),
      setMotion: (demoMotion) => set({ demoMotion }),
      setPerformanceMode: (performanceMode) => set({ performanceMode }),
      setDisplayName: (displayName) =>
        set({ displayName: displayName.trim().slice(0, 40) || "operator" }),
      setCinematicMotion: (cinematicMotion) => set({ cinematicMotion }),
      setMotionMode: (motionMode) =>
        set({
          motionMode,
          demoMotion: motionMode !== "reduced",
          cinematicMotion: motionMode === "cinematic",
        }),
      setVisualQuality: (visualQuality) =>
        set({
          visualQuality,
          performanceMode: visualQuality === "performance",
        }),
      setDemoDataset: (demoDataset) =>
        serializeLocalMutation(async () => {
        const clusters =
          demoDataset === "homelab-only"
            ? [initialClusters[0]]
            : initialClusters;
        const nodes = initialNodes.filter((node) =>
          clusters.some((cluster) => cluster.id === node.clusterId),
        );
        const nextClusters = structuredClone(clusters).map((cluster) => ({
          ...cluster,
          nodeIds: nodes
            .filter((node) => node.clusterId === cluster.id)
            .map((node) => node.id),
        }));
        try {
          await localProvider.writeClusterNodeState(nextClusters, nodes);
          set({
            demoDataset,
            clusters: nextClusters,
            nodes,
            selectedClusterId: clusters[0].id,
            selectedNodeId: null,
            persistenceError: null,
          });
          void dashboardQueryClient.invalidateQueries();
        } catch (error) {
          set({
            persistenceError:
              error instanceof Error
                ? error.message
                : "Could not change the local dataset.",
          });
          throw error;
        }
        }),
      resetDemoData: () =>
        serializeLocalMutation(async () => {
        await localProvider.resetRecords();
        set({
          clusters: initialClusters,
          nodes: initialNodes,
          selectedClusterId: initialClusters[0].id,
          selectedNodeId: null,
          displayName: "operator",
          sidebarCollapsed: false,
          compactDashboard: false,
          demoMotion: true,
          cinematicMotion: false,
          motionMode: "system",
          performanceMode: false,
          visualQuality: "auto",
          theme: "dark",
          demoDataset: "multi-cluster",
        });
        void dashboardQueryClient.invalidateQueries();
        }),
      clearPersistenceError: () => set({ persistenceError: null }),
      setTheme: (theme) => set({ theme }),
      toggleCoordinator: (id) =>
        serializeLocalMutation(async () => {
        const state = useDashboardStore.getState();
        const nodes = demoApi.designateCoordinator(state.nodes, id);
        try {
          await localProvider.putMany(
            "nodes",
            nodes.map((value) => ({ id: value.id, value })),
          );
          set({ nodes, persistenceError: null });
          void dashboardQueryClient.invalidateQueries({ queryKey: ["nodes"] });
        } catch (error) {
          set({
            persistenceError:
              error instanceof Error
                ? error.message
                : "Could not save coordinator selection.",
          });
        }
        }),
      moveNode: (nodeId, clusterId) =>
        serializeLocalMutation(async () => {
        const state = useDashboardStore.getState();
        if (!state.clusters.some((cluster) => cluster.id === clusterId)) return;
        const moving = state.nodes.find((node) => node.id === nodeId);
        if (!moving || moving.clusterId === clusterId) return;
        const sourceClusterId = moving.clusterId;
        const targetHasCoordinator = state.nodes.some(
          (node) => node.clusterId === clusterId && node.role === "coordinator",
        );
        const sourceReplacement = state.nodes.find(
          (node) => node.clusterId === sourceClusterId && node.id !== nodeId,
        );
        const nodes = state.nodes.map((node) => {
          if (node.id === nodeId) {
            const moved = demoApi.moveNode(node, clusterId);
            return {
              ...moved,
              role: targetHasCoordinator ? ("worker" as const) : ("coordinator" as const),
            };
          }
          if (
            moving.role === "coordinator" &&
            node.id === sourceReplacement?.id
          )
            return { ...node, role: "coordinator" as const };
          return node;
        });
        const clusters = state.clusters.map((cluster) => ({
          ...cluster,
          nodeIds: nodes
            .filter((node) => node.clusterId === cluster.id)
            .map((node) => node.id),
        }));
        try {
          await localProvider.writeClusterNodeState(clusters, nodes);
          set({ nodes, clusters, persistenceError: null });
          void dashboardQueryClient.invalidateQueries();
        } catch (error) {
          set({
            persistenceError:
              error instanceof Error
                ? error.message
                : "Could not move node locally.",
          });
        }
        }),
    }),
    {
      name: "opencluster-demo-preferences",
      storage: createJSONStorage(() => guardedStorage),
      version: 4,
      migrate: (persisted) => {
        const old = persisted as Partial<DashboardState> | undefined;
        return {
          ...old,
          clusters: Array.isArray(old?.clusters)
            ? old.clusters
            : initialClusters,
          nodes: Array.isArray(old?.nodes) ? old.nodes : initialNodes,
          displayName:
            typeof old?.displayName === "string" ? old.displayName : "operator",
          cinematicMotion: old?.cinematicMotion === true,
          motionMode:
            old?.motionMode === "reduced" || old?.motionMode === "cinematic"
              ? old.motionMode
              : "system",
          visualQuality:
            old?.visualQuality === "performance" ||
            old?.visualQuality === "high"
              ? old.visualQuality
              : "auto",
          demoDataset:
            old?.demoDataset === "homelab-only"
              ? "homelab-only"
              : "multi-cluster",
          sidebarCollapsed: old?.sidebarCollapsed === true,
          compactDashboard: old?.compactDashboard === true,
          demoMotion: old?.demoMotion !== false,
          performanceMode: old?.performanceMode === true,
          theme:
            old?.theme === "light" || old?.theme === "system"
              ? old.theme
              : "dark",
        };
      },
      merge: (persisted, current) => {
        const saved = persisted as Partial<DashboardState> | undefined;
        const clusters =
          Array.isArray(saved?.clusters) && saved.clusters.every(isCluster)
            ? saved.clusters
            : initialClusters;
        const nodes =
          Array.isArray(saved?.nodes) && saved.nodes.every(isNode)
            ? saved.nodes
            : initialNodes;
        const clusterIds = new Set(clusters.map((cluster) => cluster.id));
        const safeNodes = nodes.filter((node) =>
          clusterIds.has(node.clusterId),
        );
        return {
          ...current,
          ...saved,
          selectedClusterId: clusters.some(
            (cluster) => cluster.id === saved?.selectedClusterId,
          )
            ? (saved?.selectedClusterId as string)
            : (clusters[0]?.id ?? ""),
          clusters: clusters.map((cluster) => ({
            ...cluster,
            nodeIds: safeNodes
              .filter((node) => node.clusterId === cluster.id)
              .map((node) => node.id),
          })),
          nodes: safeNodes,
          displayName:
            typeof saved?.displayName === "string"
              ? saved.displayName.slice(0, 40)
              : "operator",
          theme:
            saved?.theme === "light" || saved?.theme === "system"
              ? saved.theme
              : "dark",
          motionMode:
            saved?.motionMode === "reduced" || saved?.motionMode === "cinematic"
              ? saved.motionMode
              : "system",
          visualQuality:
            saved?.visualQuality === "performance" ||
            saved?.visualQuality === "high"
              ? saved.visualQuality
              : "auto",
          demoDataset:
            saved?.demoDataset === "homelab-only"
              ? "homelab-only"
              : "multi-cluster",
        };
      },
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        compactDashboard: state.compactDashboard,
        demoMotion: state.demoMotion,
        performanceMode: state.performanceMode,
        theme: state.theme,
        selectedClusterId: state.selectedClusterId,
        displayName: state.displayName,
        cinematicMotion: state.cinematicMotion,
        motionMode: state.motionMode,
        visualQuality: state.visualQuality,
        demoDataset: state.demoDataset,
      }),
    },
  ),
);
