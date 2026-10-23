import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import { z } from "zod";
import {
  type AgentEntity,
  type AgentRelation,
  agentRelationSeeds,
  agentSeedCatalog,
} from "./agents";
import {
  initialActivity,
  initialClusters,
  initialNodes,
  initialTasks,
  softwareCatalog,
  telemetry,
} from "./mock";
import type {
  ActivityEvent,
  Cluster,
  DemoTask,
  Node,
  SoftwareConfig,
  TelemetryPoint,
} from "./models";
import type {
  DashboardProvider,
  QueryOptions,
  Repository,
} from "./providerContracts";
import type { Workflow } from "./workflows";

const clusterSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  region: z.string().max(100),
  description: z.string().max(500),
  nodeIds: z.array(z.string()),
  createdAt: z.string(),
});
const nodeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(["coordinator", "worker"]),
  clusterId: z.string().min(1),
  host: z.string(),
  os: z.string(),
  health: z.enum(["healthy", "warning", "offline", "unknown"]),
  cpu: z.number().finite().min(0).max(100),
  memory: z.number().finite().min(0).max(100),
  disk: z.number().finite().min(0).max(100),
  network: z.number().finite().min(0),
  gpu: z.string().optional(),
  uptime: z.string(),
  lastSeen: z.string(),
  labels: z.array(z.string()),
});
const workflowSchema = z.object({
  version: z.literal(1),
  name: z.string().trim().min(1).max(120),
  nodes: z
    .array(
      z.object({
        id: z.string().min(1).max(120),
        kind: z.enum([
          "trigger",
          "schedule",
          "agent",
          "condition",
          "delay",
          "transform",
          "notify",
          "success",
          "failure",
        ]),
        title: z.string().min(1).max(120),
        detail: z.string().max(500),
        x: z.number().finite(),
        y: z.number().finite(),
        config: z.record(
          z.string(),
          z.union([z.string(), z.number().finite(), z.boolean()]),
        ),
      }),
    )
    .max(200),
  edges: z
    .array(
      z.object({
        id: z.string().min(1).max(240),
        source: z.string().min(1).max(120),
        target: z.string().min(1).max(120),
        label: z.string().max(120).optional(),
      }),
    )
    .max(500),
});
const recordValueSchemas: Record<Bucket, z.ZodType> = {
  agents: z.object({
    id: z.string(),
    name: z.string(),
    vendor: z.string(),
    model: z.string(),
    role: z.string(),
    status: z.enum(["active", "idle", "attention", "paused"]),
    tasks: z.number().int().nonnegative(),
    latency: z.string(),
    color: z.string(),
    icon: z.enum(["codex", "claude", "hermes", "openclaw", "custom"]),
    kind: z.enum(["agent", "model", "tool", "memory", "task", "service"]),
  }),
  "agent-relations": z.object({
    source: z.string().min(1),
    target: z.string().min(1),
    label: z.string().max(120),
    strength: z.number().finite().min(0).max(1),
  }),
  workflows: workflowSchema,
  "agent-layouts": z.object({
    positions: z.object({
      network: z.record(
        z.string(),
        z.object({ x: z.number().finite(), y: z.number().finite() }),
      ),
      radial: z.record(
        z.string(),
        z.object({ x: z.number().finite(), y: z.number().finite() }),
      ),
    }),
    cameras: z.object({
      network: z.object({
        x: z.number().finite(),
        y: z.number().finite(),
        zoom: z.number().finite().min(0.1).max(10),
      }),
      radial: z.object({
        x: z.number().finite(),
        y: z.number().finite(),
        zoom: z.number().finite().min(0.1).max(10),
      }),
    }),
  }),
  "software-configs": z.object({
    id: z.string().min(1),
    softwareId: z.string().min(1),
    nodeId: z.string().min(1),
    profile: z.string().min(1).max(120),
  }),
  meta: z.object({ version: z.literal(1) }),
  clusters: clusterSchema,
  nodes: nodeSchema,
  telemetry: z.object({
    time: z.string(),
    cpu: z.number().finite(),
    memory: z.number().finite(),
    networkIn: z.number().finite(),
    networkOut: z.number().finite(),
  }),
  tasks: z.object({
    id: z.string(),
    name: z.string(),
    nodeId: z.string(),
    status: z.enum(["running", "queued", "completed", "failed"]),
    progress: z.number().finite().min(0).max(100),
    started: z.string(),
    duration: z.string(),
    type: z.string(),
  }),
  activity: z.object({
    id: z.string(),
    title: z.string(),
    detail: z.string(),
    time: z.string(),
    severity: z.enum(["info", "success", "warning", "error"]),
    source: z.string(),
  }),
  "software-catalog": z.object({
    id: z.string(),
    name: z.string(),
    vendor: z.string(),
    description: z.string(),
    category: z.string(),
    color: z.string(),
    status: z.enum(["available", "planned"]),
  }),
};
const recordSchema = z.object({
  key: z.string(),
  bucket: z.string(),
  id: z.string(),
  value: z.unknown(),
});
type Bucket =
  | "clusters"
  | "nodes"
  | "workflows"
  | "agent-layouts"
  | "agents"
  | "agent-relations"
  | "software-catalog"
  | "software-configs"
  | "telemetry"
  | "tasks"
  | "activity"
  | "meta";
type RecordRow = z.infer<typeof recordSchema>;
interface OpenClusterDB extends DBSchema {
  records: { key: string; value: RecordRow; indexes: { bucket: string } };
}

let database: Promise<IDBPDatabase<OpenClusterDB>> | undefined;
const db = () =>
  (database ??= openDB<OpenClusterDB>("opencluster-dashboard", 1, {
    upgrade(database) {
      const store = database.createObjectStore("records", { keyPath: "key" });
      store.createIndex("bucket", "bucket");
    },
  }));
const keyFor = (bucket: Bucket, id: string) => `${bucket}:${id}`;
const recordFor = <T>(bucket: Bucket, id: string, value: T) => {
  recordValueSchemas[bucket].parse(value);
  return recordSchema.parse({ key: keyFor(bucket, id), bucket, id, value });
};
const valueFor = <T>(bucket: Bucket, value: unknown): T =>
  recordValueSchemas[bucket].parse(value) as T;

export const localProvider = {
  async list<T>(bucket: Bucket): Promise<T[]> {
    const rows = await (await db()).getAllFromIndex(
      "records",
      "bucket",
      bucket,
    );
    return rows.map((row) =>
      valueFor<T>(bucket, recordSchema.parse(row).value),
    );
  },
  async get<T>(bucket: Bucket, id: string): Promise<T | undefined> {
    const row = await (await db()).get("records", keyFor(bucket, id));
    return row ? valueFor<T>(bucket, recordSchema.parse(row).value) : undefined;
  },
  async put<T>(bucket: Bucket, id: string, value: T): Promise<void> {
    const row = recordFor(bucket, id, value);
    await (await db()).put("records", row);
  },
  async putMany<T>(
    bucket: Bucket,
    records: Array<{ id: string; value: T }>,
  ): Promise<void> {
    const validated = records.map((record) =>
      recordFor(bucket, record.id, record.value),
    );
    const database = await db();
    const tx = database.transaction("records", "readwrite");
    for (const record of validated) {
      // ORIGINAL (preserved, not deleted — disabled by comment):
      // tx.store.put(recordFor(bucket, record.id, record.value));
      tx.store.put(record);
    }
    await tx.done;
  },
  async replace<T>(
    bucket: Bucket,
    records: Array<{ id: string; value: T }>,
  ): Promise<void> {
    await this.replaceBuckets({ [bucket]: records });
  },
  async replaceBuckets(
    buckets: Partial<Record<Bucket, Array<{ id: string; value: unknown }>>>,
  ): Promise<void> {
    // Validate every bucket before starting a transaction that clears saved records.
    for (const [bucket, records] of Object.entries(buckets)) {
      for (const record of records ?? [])
        recordFor(bucket as Bucket, record.id, record.value);
    }
    const database = await db();
    const tx = database.transaction("records", "readwrite");
    for (const [bucket, records] of Object.entries(buckets) as Array<
      [Bucket, Array<{ id: string; value: unknown }> | undefined]
    >) {
      if (!records) continue;
      const existing = await tx.store.index("bucket").getAllKeys(bucket);
      await Promise.all(existing.map((key) => tx.store.delete(key)));
      for (const record of records)
        tx.store.put(recordFor(bucket, record.id, record.value));
    }
    await tx.done;
  },
  async writeClusterNodeState(
    clusters: Cluster[],
    nodes: Node[],
  ): Promise<void> {
    await this.replaceBuckets({
      clusters: clusters.map((value) => ({ id: value.id, value })),
      nodes: nodes.map((value) => ({ id: value.id, value })),
    });
  },
  async delete(bucket: Bucket, id: string): Promise<void> {
    await (await db()).delete("records", keyFor(bucket, id));
  },
  async initialize(
    legacy?: unknown,
  ): Promise<{ clusters: Cluster[]; nodes: Node[] }> {
    const database = await db();
    const marker = await database.get("records", keyFor("meta", "initialized"));
    const firstRun =
      !marker || !recordValueSchemas.meta.safeParse(marker.value).success;
    const existingClusters = (
      await database.getAllFromIndex("records", "bucket", "clusters")
    )
      .map((row) => clusterSchema.safeParse(row.value))
      .filter((r) => r.success)
      .map((r) => r.data);
    const existingNodes = (
      await database.getAllFromIndex("records", "bucket", "nodes")
    )
      .map((row) => nodeSchema.safeParse(row.value))
      .filter((r) => r.success)
      .map((r) => r.data);
    const old = z
      .object({
        clusters: z.array(clusterSchema).optional(),
        nodes: z.array(nodeSchema).optional(),
      })
      .safeParse(legacy);
    const clusters = existingClusters.length
      ? existingClusters
      : firstRun && old.success && old.data.clusters?.length
        ? old.data.clusters
        : firstRun
          ? structuredClone(initialClusters)
          : [];
    const nodes = existingNodes.length
      ? existingNodes
      : firstRun && old.success && old.data.nodes?.length
        ? old.data.nodes
        : firstRun
          ? structuredClone(initialNodes)
          : [];
    const validClusterIds = new Set(clusters.map((cluster) => cluster.id));
    const safeNodes = nodes.filter((node) =>
      validClusterIds.has(node.clusterId),
    );
    const consistentClusters = clusters.map((cluster) => ({
      ...cluster,
      nodeIds: safeNodes
        .filter((node) => node.clusterId === cluster.id)
        .map((node) => node.id),
    }));
    if (!existingClusters.length && consistentClusters.length)
      await this.putMany(
        "clusters",
        consistentClusters.map((value) => ({ id: value.id, value })),
      );
    if (!existingNodes.length && safeNodes.length)
      await this.putMany(
        "nodes",
        safeNodes.map((value) => ({ id: value.id, value })),
      );
    if (
      firstRun &&
      !(await database.countFromIndex("records", "bucket", "telemetry"))
    )
      await this.putMany(
        "telemetry",
        telemetry.map((value, index) => ({ id: String(index), value })),
      );
    if (
      firstRun &&
      !(await database.countFromIndex("records", "bucket", "tasks"))
    )
      await this.putMany(
        "tasks",
        initialTasks.map((value: DemoTask) => ({ id: value.id, value })),
      );
    if (
      firstRun &&
      !(await database.countFromIndex("records", "bucket", "activity"))
    )
      await this.putMany(
        "activity",
        initialActivity.map((value: ActivityEvent) => ({
          id: value.id,
          value,
        })),
      );
    if (
      firstRun &&
      !(await database.countFromIndex("records", "bucket", "software-catalog"))
    )
      await this.putMany(
        "software-catalog",
        softwareCatalog.map((value) => ({ id: value.id, value })),
      );
    if (
      firstRun &&
      !(await database.countFromIndex("records", "bucket", "agents"))
    )
      await this.putMany(
        "agents",
        agentSeedCatalog.map((value: AgentEntity) => ({ id: value.id, value })),
      );
    if (
      firstRun &&
      !(await database.countFromIndex("records", "bucket", "agent-relations"))
    )
      await this.putMany(
        "agent-relations",
        agentRelationSeeds.map((value) => ({
          id: `${value.source}:${value.target}`,
          value,
        })),
      );
    if (firstRun) await this.put("meta", "initialized", { version: 1 });
    return { clusters: consistentClusters, nodes: safeNodes };
  },
  async resetRecords(): Promise<void> {
    await this.replaceBuckets({
      clusters: initialClusters.map((value) => ({ id: value.id, value })),
      nodes: initialNodes.map((value) => ({ id: value.id, value })),
      telemetry: telemetry.map((value, index) => ({
        id: String(index),
        value,
      })),
      tasks: initialTasks.map((value) => ({ id: value.id, value })),
      activity: initialActivity.map((value) => ({ id: value.id, value })),
      "software-catalog": softwareCatalog.map((value) => ({
        id: value.id,
        value,
      })),
      workflows: [],
      "agent-layouts": [],
      agents: agentSeedCatalog.map((value) => ({ id: value.id, value })),
      meta: [{ id: "initialized", value: { version: 1 } }],
      "agent-relations": agentRelationSeeds.map((value) => ({
        id: `${value.source}:${value.target}`,
        value,
      })),
      "software-configs": [],
    });
  },
};

export type { Bucket, DashboardProvider, TelemetryPoint };

function repository<T>(bucket: Bucket): Repository<T> {
  return {
    async list(options: QueryOptions<T> = {}) {
      let values = await localProvider.list<T>(bucket);
      if (options.search) {
        const query = options.search.trim().toLocaleLowerCase();
        values = values.filter((value) =>
          JSON.stringify(value).toLocaleLowerCase().includes(query),
        );
      }
      if (options.filter) values = values.filter(options.filter);
      if (options.sort) values.sort(options.sort);
      return values;
    },
    get: (id) => localProvider.get<T>(bucket, id),
    async create(id, value) {
      if ((await localProvider.get(bucket, id)) !== undefined)
        throw new Error(`Record ${id} already exists.`);
      await localProvider.put(bucket, id, value);
    },
    update: (id, value) => localProvider.put(bucket, id, value),
    delete: (id) => localProvider.delete(bucket, id),
  };
}

export const dashboardLocalProvider: DashboardProvider = {
  clusters: repository<Cluster>("clusters"),
  nodes: repository<Node>("nodes"),
  agents: repository<AgentEntity>("agents"),
  agentRelations: repository<AgentRelation>("agent-relations"),
  workflows: repository<Workflow>("workflows"),
  softwareCatalog: repository<import("./models").Software>("software-catalog"),
  softwareConfigurations: repository<SoftwareConfig>("software-configs"),
  tasks: repository<DemoTask>("tasks"),
  activity: repository<ActivityEvent>("activity"),
  telemetry: repository<TelemetryPoint>("telemetry"),
};
