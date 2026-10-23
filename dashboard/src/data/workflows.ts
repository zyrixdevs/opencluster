import { dashboardProvider } from "./provider";

export type WorkflowKind =
  | "trigger"
  | "schedule"
  | "agent"
  | "condition"
  | "delay"
  | "transform"
  | "notify"
  | "success"
  | "failure";

export type WorkflowNode = {
  id: string;
  kind: WorkflowKind;
  title: string;
  detail: string;
  x: number;
  y: number;
  config: Record<string, string | number | boolean>;
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
};
export type Workflow = {
  version: 1;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export type WorkflowHistory = { past: Workflow[]; future: Workflow[] };

export function recordWorkflowChange(
  history: WorkflowHistory,
  current: Workflow,
): WorkflowHistory {
  return {
    past: [...history.past.slice(-19), structuredClone(current)],
    future: [],
  };
}

export function undoWorkflow(
  history: WorkflowHistory,
  current: Workflow,
): { history: WorkflowHistory; workflow: Workflow } | undefined {
  const previous = history.past.at(-1);
  if (!previous) return undefined;
  return {
    history: {
      past: history.past.slice(0, -1),
      future: [structuredClone(current), ...history.future],
    },
    workflow: structuredClone(previous),
  };
}

export function redoWorkflow(
  history: WorkflowHistory,
  current: Workflow,
): { history: WorkflowHistory; workflow: Workflow } | undefined {
  const next = history.future[0];
  if (!next) return undefined;
  return {
    history: {
      past: [...history.past, structuredClone(current)].slice(-20),
      future: history.future.slice(1),
    },
    workflow: structuredClone(next),
  };
}

export function isConnectionValid(
  flow: Workflow,
  source: string,
  target: string,
): boolean {
  if (!source || !target || source === target) return false;
  if (
    !flow.nodes.some((node) => node.id === source) ||
    !flow.nodes.some((node) => node.id === target)
  )
    return false;
  if (
    flow.edges.some((edge) => edge.source === source && edge.target === target)
  )
    return false;
  const reachable = new Set<string>();
  const pending = [target];
  while (pending.length) {
    const id = pending.pop();
    if (!id || reachable.has(id)) continue;
    if (id === source) return false;
    reachable.add(id);
    pending.push(
      ...flow.edges
        .filter((edge) => edge.source === id)
        .map((edge) => edge.target),
    );
  }
  return true;
}

const workflowRecordId = "active";
const maxImportBytes = 100_000;
const kinds: WorkflowKind[] = [
  "trigger",
  "schedule",
  "agent",
  "condition",
  "delay",
  "transform",
  "notify",
  "success",
  "failure",
];

export const starterWorkflow: Workflow = {
  version: 1,
  name: "Cluster health check",
  nodes: [
    {
      id: "trigger",
      kind: "schedule",
      title: "Schedule trigger",
      detail: "Starts a sample health check on a fixed interval.",
      x: 54,
      y: 210,
      config: { intervalMinutes: 15 },
    },
    {
      id: "inspect",
      kind: "transform",
      title: "Inspect cluster",
      detail: "Collects mock health values from the selected demo cluster.",
      x: 300,
      y: 210,
      config: { scope: "active cluster" },
    },
    {
      id: "threshold",
      kind: "condition",
      title: "Health below 80%?",
      detail: "Routes the sample run based on a configurable threshold.",
      x: 548,
      y: 210,
      config: { threshold: 80 },
    },
    {
      id: "notify",
      kind: "notify",
      title: "Notify operator",
      detail: "Adds a preview notification to this simulated workflow run.",
      x: 806,
      y: 102,
      config: { channel: "dashboard" },
    },
    {
      id: "agent",
      kind: "agent",
      title: "Summarize status",
      detail: "Creates a local sample summary. No AI service is contacted.",
      x: 806,
      y: 326,
      config: { agent: "OpenCluster assistant" },
    },
  ],
  edges: [
    { id: "e1", source: "trigger", target: "inspect", label: "on schedule" },
    {
      id: "e2",
      source: "inspect",
      target: "threshold",
      label: "health sample",
    },
    {
      id: "e3",
      source: "threshold",
      target: "notify",
      label: "below threshold",
    },
    { id: "e4", source: "threshold", target: "agent", label: "healthy" },
  ],
};

export function validateWorkflow(value: unknown): value is Workflow {
  if (!value || typeof value !== "object") return false;
  const flow = value as Partial<Workflow>;
  if (
    flow.version !== 1 ||
    typeof flow.name !== "string" ||
    !flow.name.trim() ||
    flow.name.length > 120 ||
    !Array.isArray(flow.nodes) ||
    !Array.isArray(flow.edges) ||
    flow.nodes.length > 200 ||
    flow.edges.length > 500
  )
    return false;
  const ids = new Set<string>();
  for (const node of flow.nodes) {
    if (
      !node ||
      typeof node.id !== "string" ||
      !node.id ||
      ids.has(node.id) ||
      !kinds.includes(node.kind) ||
      typeof node.title !== "string" ||
      !node.title ||
      node.title.length > 120 ||
      typeof node.detail !== "string" ||
      node.detail.length > 500 ||
      !Number.isFinite(node.x) ||
      !Number.isFinite(node.y) ||
      !node.config ||
      typeof node.config !== "object" ||
      Object.entries(node.config).length > 50 ||
      Object.entries(node.config).some(
        ([key, value]) =>
          !key ||
          key.length > 120 ||
          !(
            typeof value === "string" ||
            typeof value === "boolean" ||
            (typeof value === "number" && Number.isFinite(value))
          ),
      )
    )
      return false;
    ids.add(node.id);
  }
  const edgeIds = new Set<string>();
  for (const edge of flow.edges) {
    if (
      !edge ||
      typeof edge.id !== "string" ||
      !edge.id ||
      edgeIds.has(edge.id) ||
      !ids.has(edge.source) ||
      !ids.has(edge.target) ||
      edge.source === edge.target
    )
      return false;
    edgeIds.add(edge.id);
  }
  const outgoing = new Map([...ids].map((id) => [id, [] as string[]]));
  for (const edge of flow.edges) outgoing.get(edge.source)?.push(edge.target);
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const hasCycle = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    if (outgoing.get(id)?.some(hasCycle)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  return ![...ids].some(hasCycle);
}

export function workflowIssues(flow: Workflow): string[] {
  const issues: string[] = [];
  if (
    !flow.nodes.some(
      (node) => node.kind === "trigger" || node.kind === "schedule",
    )
  )
    issues.push("Add a trigger or schedule node.");
  for (const node of flow.nodes)
    if (
      !flow.edges.some((edge) => edge.source === node.id) &&
      !["success", "failure", "notify", "agent"].includes(node.kind)
    )
      issues.push(`${node.title} has no outgoing connection.`);
  for (const edge of flow.edges)
    if (
      !flow.edges.some((next) => next.target === edge.source) &&
      !flow.nodes.some(
        (node) =>
          node.id === edge.source &&
          (node.kind === "trigger" || node.kind === "schedule"),
      )
    )
      issues.push(`${edge.source} is disconnected from the trigger.`);
  return [...new Set(issues)];
}

export async function loadWorkflow(): Promise<Workflow> {
  try {
    const parsed: unknown =
      await dashboardProvider.workflows.get(workflowRecordId);
    return validateWorkflow(parsed) ? parsed : structuredClone(starterWorkflow);
  } catch {
    return structuredClone(starterWorkflow);
  }
}

export async function saveWorkflow(flow: Workflow): Promise<void> {
  if (!validateWorkflow(flow))
    throw new Error("This workflow is not valid and could not be saved.");
  await dashboardProvider.workflows.update(workflowRecordId, flow);
}

export function parseWorkflowImport(text: string): Workflow {
  assertWorkflowImportSize(new Blob([text]).size);
  const value: unknown = JSON.parse(text);
  if (!validateWorkflow(value))
    throw new Error("This file is not a valid OpenCluster workflow.");
  return value;
}

export function assertWorkflowImportSize(size: number): void {
  if (size > maxImportBytes)
    throw new Error("Workflow file exceeds the 100 KB demo limit.");
}
