import { useQuery } from "@tanstack/react-query";
import { useDashboardStore } from "../state/useDashboardStore";
import type { Bucket } from "./localProvider";
import { dashboardProvider } from "./provider";

type CollectionBucket = Exclude<Bucket, "agent-layouts">;

function listCollection<T>(bucket: CollectionBucket): Promise<T[]> {
  switch (bucket) {
    case "clusters":
      return dashboardProvider.clusters.list() as Promise<T[]>;
    case "nodes":
      return dashboardProvider.nodes.list() as Promise<T[]>;
    case "agents":
      return dashboardProvider.agents.list() as Promise<T[]>;
    case "agent-relations":
      return dashboardProvider.agentRelations.list() as Promise<T[]>;
    case "workflows":
      return dashboardProvider.workflows.list() as Promise<T[]>;
    case "software-catalog":
      return dashboardProvider.softwareCatalog.list() as Promise<T[]>;
    case "software-configs":
      return dashboardProvider.softwareConfigurations.list() as Promise<T[]>;
    case "tasks":
      return dashboardProvider.tasks.list() as Promise<T[]>;
    case "activity":
      return dashboardProvider.activity.list() as Promise<T[]>;
    case "telemetry":
      return dashboardProvider.telemetry.list() as Promise<T[]>;
    default:
      throw new Error(`Unsupported dashboard collection: ${bucket}`);
  }
}

export function useDemoData() {
  const clusterId = useDashboardStore((state) => state.selectedClusterId);
  const clusters = useDashboardStore((state) => state.clusters);
  const nodes = useDashboardStore((state) => state.nodes);
  const nodeQuery = useQuery({
    queryKey: ["nodes", clusterId],
    queryFn: async () =>
      (await dashboardProvider.nodes.list()).filter(
        (node) => node.clusterId === clusterId,
      ),
  });
  const clusterQuery = useQuery({
    queryKey: ["clusters"],
    queryFn: () => dashboardProvider.clusters.list(),
  });
  const filteredNodes =
    nodeQuery.data ?? nodes.filter((node) => node.clusterId === clusterId);
  const availableClusters = clusterQuery.data ?? clusters;
  return {
    cluster: availableClusters.find((cluster) => cluster.id === clusterId),
    nodes: filteredNodes,
    clusters: availableClusters,
    isLoading: nodeQuery.isLoading || clusterQuery.isLoading,
    isError: nodeQuery.isError || clusterQuery.isError,
  };
}

export function useLocalCollection<T>(bucket: CollectionBucket) {
  return useQuery({
    queryKey: ["local-records", bucket],
    queryFn: () => listCollection<T>(bucket),
  });
}
