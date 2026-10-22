export type Health = "healthy" | "warning" | "offline" | "unknown";
export type Cluster = {
  id: string;
  name: string;
  region: string;
  description: string;
  nodeIds: string[];
  createdAt: string;
};
export type Node = {
  id: string;
  name: string;
  role: "coordinator" | "worker";
  clusterId: string;
  host: string;
  os: string;
  health: Health;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  gpu?: string;
  uptime: string;
  lastSeen: string;
  labels: string[];
};
export type TelemetryPoint = {
  time: string;
  cpu: number;
  memory: number;
  networkIn: number;
  networkOut: number;
};
export type Software = {
  id: string;
  name: string;
  vendor: string;
  description: string;
  category: string;
  color: string;
  status: "available" | "planned";
};
export type DemoTask = {
  id: string;
  name: string;
  nodeId: string;
  status: "running" | "queued" | "completed" | "failed";
  progress: number;
  started: string;
  duration: string;
  type: string;
};
export type ActivityEvent = {
  id: string;
  title: string;
  detail: string;
  time: string;
  severity: "info" | "success" | "warning" | "error";
  source: string;
};
