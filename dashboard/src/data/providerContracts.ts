import type { AgentEntity, AgentRelation } from "./agents";
import type {
  ActivityEvent,
  Cluster,
  DemoTask,
  Node,
  Software,
  SoftwareConfig,
  TelemetryPoint,
} from "./models";
import type { Workflow } from "./workflows";

export type QueryOptions<T> = {
  search?: string;
  sort?: (left: T, right: T) => number;
  filter?: (value: T) => boolean;
};

export interface Repository<T> {
  list(options?: QueryOptions<T>): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  create(id: string, value: T): Promise<void>;
  update(id: string, value: T): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface DashboardProvider {
  clusters: Repository<Cluster>;
  nodes: Repository<Node>;
  agents: Repository<AgentEntity>;
  agentRelations: Repository<AgentRelation>;
  workflows: Repository<Workflow>;
  softwareCatalog: Repository<Software>;
  softwareConfigurations: Repository<SoftwareConfig>;
  tasks: Repository<DemoTask>;
  activity: Repository<ActivityEvent>;
  telemetry: Repository<TelemetryPoint>;
}

export interface RemoteDashboardTransport {
  request<T>(input: {
    method: "GET" | "POST" | "PATCH" | "DELETE";
    path: string;
    body?: unknown;
  }): Promise<T>;
  close(): void;
}

export type DataProviderMode = "local" | "cloud";
