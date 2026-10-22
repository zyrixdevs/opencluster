import { useQuery } from "@tanstack/react-query";
import { useDashboardStore } from "../state/useDashboardStore";
import { demoApi } from "./demoApi";

export function useDemoData() {
  const clusterId = useDashboardStore((state) => state.selectedClusterId);
  const clusters = useDashboardStore((state) => state.clusters);
  const nodes = useDashboardStore((state) => state.nodes);
  const nodeQuery = useQuery({
    queryKey: ["nodes", clusterId],
    queryFn: () => demoApi.getNodes(clusterId),
  });
  const clusterQuery = useQuery({
    queryKey: ["clusters"],
    queryFn: () => demoApi.getClusters(),
  });
  const filteredNodes = nodes.filter((node) => node.clusterId === clusterId);
  return {
    cluster:
      clusters.find((cluster) => cluster.id === clusterId) ?? clusters[0],
    nodes:
      filteredNodes.length || nodes.some((node) => node.clusterId === clusterId)
        ? filteredNodes
        : (nodeQuery.data ?? []),
    clusters,
    isLoading: nodeQuery.isLoading || clusterQuery.isLoading,
    isError: nodeQuery.isError || clusterQuery.isError,
  };
}
