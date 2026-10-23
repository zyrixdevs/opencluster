import {
  initialActivity,
  initialClusters,
  initialNodes,
  initialTasks,
} from "./mock";
import type { ActivityEvent, Cluster, DemoTask, Node } from "./models";

export interface DashboardData {
  getClusters(): Promise<Cluster[]>;
  getNodes(clusterId?: string): Promise<Node[]>;
  getTasks(): Promise<DemoTask[]>;
  getActivity(): Promise<ActivityEvent[]>;
  createCluster(name: string, region: string, description: string): Cluster;
  updateCluster(
    cluster: Cluster,
    changes: Partial<Pick<Cluster, "name" | "region" | "description">>,
  ): Cluster;
  moveNode(node: Node, clusterId: string): Node;
  designateCoordinator(nodes: Node[], nodeId: string): Node[];
  createTask(nodeId: string, id: string): DemoTask;
  assignTask(task: DemoTask, nodeId: string): DemoTask;
}
const pause = () =>
  new Promise<void>((resolve) => window.setTimeout(resolve, 120));
export const demoApi: DashboardData = {
  async getClusters() {
    await pause();
    return structuredClone(initialClusters);
  },
  async getNodes(clusterId) {
    await pause();
    return structuredClone(
      clusterId
        ? initialNodes.filter((node) => node.clusterId === clusterId)
        : initialNodes,
    );
  },
  async getTasks() {
    await pause();
    return structuredClone(initialTasks);
  },
  async getActivity() {
    await pause();
    return structuredClone(initialActivity);
  },
  createCluster(name, region, description) {
    return {
      id: `demo-${Date.now()}`,
      name: name.trim(),
      region,
      description,
      nodeIds: [],
      createdAt: new Date().toISOString().slice(0, 10),
    };
  },
  updateCluster(cluster, changes) {
    return { ...cluster, ...changes };
  },
  moveNode(node, clusterId) {
    return { ...node, clusterId };
  },
  designateCoordinator(nodes, nodeId) {
    const target = nodes.find((node) => node.id === nodeId);
    if (!target) return nodes;
    return nodes.map((node) =>
      node.clusterId === target.clusterId
        ? { ...node, role: node.id === nodeId ? "coordinator" : "worker" }
        : node,
    );
  },
  createTask(nodeId, id) {
    return {
      id,
      name: "Manual demo task",
      nodeId,
      status: "queued",
      progress: 0,
      started: "Waiting",
      duration: "—",
      type: "Manual",
    };
  },
  assignTask(task, nodeId) {
    return { ...task, nodeId };
  },
};
