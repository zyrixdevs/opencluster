import type { Node } from "@xyflow/react";

export type SampleWorkload = {
  id: string;
  name: string;
  status: "Running";
  kind: "Agent" | "AI" | "Docker" | "VM" | "Service";
  detail: string;
  version?: string;
  memory?: string;
};

export type SampleMachine = {
  id: string;
  name: string;
  host: string;
  os: string;
  cpu: number;
  memory: number;
  storage: string;
  temperature: number;
  services: number;
  vmCount: number;
  containerCount: number;
  workloads: SampleWorkload[];
  vms: { name: string; cpu: string; memory: string }[];
  containers: string[];
  recommendation: string;
};

export const SAMPLE_MACHINES: SampleMachine[] = [
  {
    id: "machine-01",
    name: "PC-01",
    host: "192.168.1.101",
    os: "Ubuntu 22.04",
    cpu: 42,
    memory: 38,
    storage: "1.4 TB",
    temperature: 39,
    services: 6,
    vmCount: 2,
    containerCount: 4,
    workloads: [
      {
        id: "hermes-01",
        name: "Hermes Agent",
        status: "Running",
        kind: "Agent",
        detail: "Orchestration agent",
      },
      {
        id: "docker-01",
        name: "Docker",
        status: "Running",
        kind: "Docker",
        detail: "4 containers",
      },
      {
        id: "vm-01",
        name: "VM-01",
        status: "Running",
        kind: "VM",
        detail: "4 vCPU · 8 GB RAM",
      },
      {
        id: "monitoring-01",
        name: "Monitoring",
        status: "Running",
        kind: "Service",
        detail: "v2.1.0",
        version: "v2.1.0",
        memory: "512 MB",
      },
    ],
    vms: [
      { name: "VM-01", cpu: "4 vCPU", memory: "8 GB RAM" },
      { name: "VM-02", cpu: "2 vCPU", memory: "4 GB RAM" },
    ],
    containers: ["hermes-agent", "monitoring", "metrics-api", "node-exporter"],
    recommendation: "Utilization is within the sample target range.",
  },
  {
    id: "machine-02",
    name: "PC-02",
    host: "192.168.1.102",
    os: "Ubuntu 22.04",
    cpu: 28,
    memory: 44,
    storage: "1.8 TB",
    temperature: 37,
    services: 4,
    vmCount: 2,
    containerCount: 3,
    workloads: [
      {
        id: "paperclip-02",
        name: "Paperclip",
        status: "Running",
        kind: "Service",
        detail: "Workflow service",
      },
      {
        id: "claude-02",
        name: "Claude Code",
        status: "Running",
        kind: "AI",
        detail: "Coding agent",
      },
      {
        id: "docker-02",
        name: "Docker",
        status: "Running",
        kind: "Docker",
        detail: "3 containers",
      },
      {
        id: "vm-02",
        name: "VM-02",
        status: "Running",
        kind: "VM",
        detail: "8 vCPU · 16 GB RAM",
      },
    ],
    vms: [
      { name: "VM-01", cpu: "4 vCPU", memory: "8 GB RAM" },
      { name: "VM-02", cpu: "8 vCPU", memory: "16 GB RAM" },
    ],
    containers: ["paperclip-api", "worker", "cache"],
    recommendation:
      "This sample node has available capacity for a small workload.",
  },
  {
    id: "machine-03",
    name: "PC-03",
    host: "192.168.1.103",
    os: "Ubuntu 22.04",
    cpu: 65,
    memory: 48,
    storage: "2.1 TB",
    temperature: 42,
    services: 5,
    vmCount: 2,
    containerCount: 4,
    workloads: [
      {
        id: "codex-03",
        name: "Codex",
        status: "Running",
        kind: "AI",
        detail: "v1.2.0 · 2.3 GB",
        version: "v1.2.0",
        memory: "2.3 GB",
      },
      {
        id: "opencode-03",
        name: "Opencode",
        status: "Running",
        kind: "Service",
        detail: "v0.9.1 · 1.1 GB",
        version: "v0.9.1",
        memory: "1.1 GB",
      },
      {
        id: "llm-03",
        name: "Local LLM",
        status: "Running",
        kind: "AI",
        detail: "v0.4.2 · 6.8 GB",
        version: "v0.4.2",
        memory: "6.8 GB",
      },
      {
        id: "docker-03",
        name: "Docker",
        status: "Running",
        kind: "Docker",
        detail: "4 containers · 1.9 GB",
        version: "4 containers",
        memory: "1.9 GB",
      },
      {
        id: "monitoring-03",
        name: "Monitoring",
        status: "Running",
        kind: "Service",
        detail: "v2.1.0 · 512 MB",
        version: "v2.1.0",
        memory: "512 MB",
      },
    ],
    vms: [
      { name: "VM-01", cpu: "4 vCPU", memory: "8 GB RAM" },
      { name: "VM-02", cpu: "8 vCPU", memory: "16 GB RAM" },
    ],
    containers: ["hermes-agent", "opencode-api", "local-llm", "monitoring"],
    recommendation:
      "Illustrative sample: CPU usage is above 60%. Consider reviewing workload placement with a connected monitoring provider.",
  },
  {
    id: "machine-04",
    name: "PC-04",
    host: "192.168.1.104",
    os: "Ubuntu 22.04",
    cpu: 33,
    memory: 51,
    storage: "1.2 TB",
    temperature: 40,
    services: 4,
    vmCount: 1,
    containerCount: 2,
    workloads: [
      {
        id: "hermes-04",
        name: "Hermes Agent",
        status: "Running",
        kind: "Agent",
        detail: "Orchestration agent",
      },
      {
        id: "docker-04",
        name: "Docker",
        status: "Running",
        kind: "Docker",
        detail: "2 containers",
      },
      {
        id: "vm-04",
        name: "VM-01",
        status: "Running",
        kind: "VM",
        detail: "4 vCPU · 8 GB RAM",
      },
      {
        id: "paperclip-04",
        name: "Paperclip",
        status: "Running",
        kind: "Service",
        detail: "Workflow service",
      },
    ],
    vms: [{ name: "VM-01", cpu: "4 vCPU", memory: "8 GB RAM" }],
    containers: ["hermes-agent", "paperclip-api"],
    recommendation: "This sample node has balanced CPU and memory usage.",
  },
  {
    id: "machine-05",
    name: "PC-05",
    host: "192.168.1.105",
    os: "Ubuntu 22.04",
    cpu: 21,
    memory: 34,
    storage: "960 GB",
    temperature: 35,
    services: 3,
    vmCount: 1,
    containerCount: 1,
    workloads: [
      {
        id: "claude-05",
        name: "Claude Code",
        status: "Running",
        kind: "AI",
        detail: "Coding agent",
      },
      {
        id: "docker-05",
        name: "Docker",
        status: "Running",
        kind: "Docker",
        detail: "1 container",
      },
      {
        id: "llm-05",
        name: "Local LLM",
        status: "Running",
        kind: "AI",
        detail: "Inference service",
      },
      {
        id: "monitoring-05",
        name: "Monitoring",
        status: "Running",
        kind: "Service",
        detail: "v2.1.0",
        version: "v2.1.0",
        memory: "512 MB",
      },
    ],
    vms: [{ name: "VM-01", cpu: "4 vCPU", memory: "8 GB RAM" }],
    containers: ["local-llm"],
    recommendation: "This sample node has room for additional workloads.",
  },
];

export type TopologySelection = {
  id: string;
  kind: "core" | "machine" | "workload";
};
export type CoreData = { label: string };
export type MachineNodeData = { machine: SampleMachine; selected: boolean };
export type WorkloadNodeData = { workload: SampleWorkload; selected: boolean };
export type TopologyNodeData = CoreData | MachineNodeData | WorkloadNodeData;
export type TopologyFlowNode = Node<
  TopologyNodeData,
  "core" | "machine" | "workload"
>;

const MACHINE_X = 470;
const WORKLOAD_X = 755;
const GROUP_STEP = 184;
const WORKLOAD_STEP = 31;

export function buildTopologyNodes(
  positions: Record<string, { x: number; y: number }> = {},
): TopologyFlowNode[] {
  const nodes: TopologyFlowNode[] = [
    {
      id: "zyrix-core",
      type: "core",
      position: positions["zyrix-core"] ?? { x: 24, y: GROUP_STEP * 2 - 31 },
      data: { label: "Z.Y.R.I.X" },
      draggable: true,
    },
  ];
  SAMPLE_MACHINES.forEach((machine, index) => {
    const y = 16 + index * GROUP_STEP;
    nodes.push({
      id: machine.id,
      type: "machine",
      position: positions[machine.id] ?? { x: MACHINE_X, y },
      data: { machine, selected: index === 2 },
      draggable: true,
    });
    machine.workloads.forEach((workload, workloadIndex) => {
      const key = `workload-${workload.id}`;
      nodes.push({
        id: key,
        type: "workload",
        position: positions[key] ?? {
          x: WORKLOAD_X,
          y: y + 14 + workloadIndex * WORKLOAD_STEP,
        },
        data: { workload, selected: false },
        draggable: true,
      });
    });
  });
  return nodes;
}
