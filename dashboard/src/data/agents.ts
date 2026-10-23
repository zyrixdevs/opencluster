export type AgentStatus = "active" | "idle" | "attention" | "paused";
export type AgentKind =
  | "agent"
  | "model"
  | "tool"
  | "memory"
  | "task"
  | "service";
export type AgentEntity = {
  id: string;
  name: string;
  vendor: string;
  model: string;
  role: string;
  status: AgentStatus;
  tasks: number;
  latency: string;
  color: string;
  icon: "codex" | "claude" | "hermes" | "openclaw" | "custom";
  kind: AgentKind;
};
export type AgentRelation = {
  source: string;
  target: string;
  label: string;
  strength: number;
};

export const agentSeedCatalog: AgentEntity[] = [
  {
    id: "codex",
    name: "Codex",
    vendor: "OpenAI",
    model: "Codex · demo adapter",
    role: "Workflow coordinator",
    status: "active",
    tasks: 4,
    latency: "42 ms",
    color: "mint",
    icon: "codex",
    kind: "agent",
  },
  {
    id: "claude",
    name: "Claude Code",
    vendor: "Anthropic",
    model: "Claude · demo adapter",
    role: "Code analysis",
    status: "active",
    tasks: 2,
    latency: "58 ms",
    color: "peach",
    icon: "claude",
    kind: "agent",
  },
  {
    id: "hermes",
    name: "Hermes Agent",
    vendor: "Open source",
    model: "Hermes · demo adapter",
    role: "Task automation",
    status: "idle",
    tasks: 0,
    latency: "—",
    color: "violet",
    icon: "hermes",
    kind: "agent",
  },
  {
    id: "openclaw",
    name: "OpenClaw",
    vendor: "Community",
    model: "OpenClaw · demo adapter",
    role: "Tool routing",
    status: "attention",
    tasks: 1,
    latency: "91 ms",
    color: "blue",
    icon: "openclaw",
    kind: "agent",
  },
  {
    id: "custom",
    name: "Custom adapter",
    vendor: "Local example",
    model: "Compatible endpoint · demo",
    role: "Custom integration",
    status: "paused",
    tasks: 0,
    latency: "—",
    color: "gold",
    icon: "custom",
    kind: "agent",
  },
  {
    id: "model",
    name: "Reasoning model",
    vendor: "MODEL",
    model: "Local demo model",
    role: "Language model",
    status: "active",
    tasks: 3,
    latency: "36 ms",
    color: "violet",
    icon: "custom",
    kind: "model",
  },
  {
    id: "tools",
    name: "Tool registry",
    vendor: "TOOLS",
    model: "Local demo tools",
    role: "Tool collection",
    status: "idle",
    tasks: 0,
    latency: "—",
    color: "blue",
    icon: "openclaw",
    kind: "tool",
  },
  {
    id: "memory",
    name: "Shared context",
    vendor: "MEMORY",
    model: "Session memory · demo",
    role: "Context store",
    status: "active",
    tasks: 2,
    latency: "12 ms",
    color: "gold",
    icon: "hermes",
    kind: "memory",
  },
  {
    id: "task",
    name: "Build review",
    vendor: "TASK",
    model: "Sample job · demo",
    role: "Queued task",
    status: "idle",
    tasks: 1,
    latency: "—",
    color: "peach",
    icon: "claude",
    kind: "task",
  },
  {
    id: "service",
    name: "Git provider",
    vendor: "SERVICE",
    model: "External service · illustrative",
    role: "Integration endpoint",
    status: "paused",
    tasks: 0,
    latency: "—",
    color: "blue",
    icon: "custom",
    kind: "service",
  },
];

export const agentRelationSeeds: AgentRelation[] = [
  {
    source: "codex",
    target: "claude",
    label: "delegates review",
    strength: 0.82,
  },
  { source: "codex", target: "hermes", label: "routes tasks", strength: 0.62 },
  {
    source: "codex",
    target: "openclaw",
    label: "shares context",
    strength: 0.46,
  },
  { source: "claude", target: "custom", label: "handoff", strength: 0.34 },
  { source: "hermes", target: "custom", label: "tool access", strength: 0.3 },
  {
    source: "openclaw",
    target: "hermes",
    label: "event bridge",
    strength: 0.56,
  },
  { source: "codex", target: "model", label: "uses model", strength: 0.66 },
  { source: "claude", target: "tools", label: "uses tools", strength: 0.42 },
  {
    source: "hermes",
    target: "memory",
    label: "reads context",
    strength: 0.52,
  },
  { source: "codex", target: "task", label: "runs task", strength: 0.72 },
  {
    source: "task",
    target: "service",
    label: "requests change",
    strength: 0.38,
  },
];
