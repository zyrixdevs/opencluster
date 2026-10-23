import {
  // ORIGINAL (preserved, not deleted — disabled by comment): addEdge,
  Background,
  type Connection,
  Controls,
  type Edge,
  type EdgeChange,
  Handle,
  MarkerType,
  MiniMap,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Bot,
  BrainCircuit,
  ChevronDown,
  CircleHelp,
  Command,
  Cpu,
  GitBranch,
  RotateCcw,
  Sparkles,
  Waypoints,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageTitle } from "../components/ui";
import {
  type AgentGraphLayout,
  type AgentGraphMode,
  type AgentGraphPoint,
  readAgentGraphLayout,
  writeAgentGraphLayout,
} from "../data/agentLayout";
import type { AgentEntity, AgentRelation } from "../data/agents";
import { dashboardProvider } from "../data/provider";
import { useLocalCollection } from "../data/useDashboardData";
import "./Agents.css";

type AgentNodeData = { agent: AgentEntity };
type FlowNode = Node<AgentNodeData, "agent">;
const VIEW = { width: 900, height: 570 };
const NETWORK_POSITIONS: Record<string, AgentGraphPoint> = {
  codex: { x: 250, y: 280 },
  claude: { x: 570, y: 145 },
  hermes: { x: 675, y: 310 },
  openclaw: { x: 515, y: 445 },
  custom: { x: 225, y: 460 },
  model: { x: 110, y: 155 },
  tools: { x: 775, y: 165 },
  memory: { x: 800, y: 480 },
  task: { x: 345, y: 510 },
  service: { x: 110, y: 390 },
};
function positionsFor(
  mode: AgentGraphMode,
  agents: AgentEntity[],
): Record<string, AgentGraphPoint> {
  if (mode === "network") return NETWORK_POSITIONS;
  const center = { x: VIEW.width / 2, y: VIEW.height / 2 };
  const peers = agents.filter((agent) => agent.id !== "codex");
  return Object.fromEntries(
    agents.map((agent) => {
      if (agent.id === "codex") return [agent.id, center];
      const index = peers.findIndex((peer) => peer.id === agent.id);
      const angle =
        -Math.PI / 2 + (index * (Math.PI * 2)) / Math.max(1, peers.length);
      return [
        agent.id,
        {
          x: center.x + Math.cos(angle) * 255,
          y: center.y + Math.sin(angle) * 190,
        },
      ];
    }),
  );
}
function initialLayout(agents: AgentEntity[]): AgentGraphLayout {
  return {
    positions: {
      network: positionsFor("network", agents),
      radial: positionsFor("radial", agents),
    },
    cameras: {
      network: { x: 0, y: 0, zoom: 1 },
      radial: { x: 0, y: 0, zoom: 1 },
    },
  };
}
function AgentGlyph({ icon }: { icon: AgentEntity["icon"] }) {
  if (icon === "codex") return <Command size={18} strokeWidth={1.8} />;
  if (icon === "claude") return <Sparkles size={18} strokeWidth={1.8} />;
  if (icon === "hermes") return <Bot size={18} strokeWidth={1.8} />;
  if (icon === "openclaw") return <Waypoints size={18} strokeWidth={1.8} />;
  return <CircleHelp size={18} strokeWidth={1.8} />;
}
function AgentFlowCard({ data }: NodeProps<FlowNode>) {
  const agent = data.agent;
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        aria-label={"Relations into " + agent.name}
      />
      <div
        className={"agent-flow-card " + agent.color}
        role="img"
        aria-label={agent.name + ", " + agent.kind + ", " + agent.status}
      >
        <span className="agent-flow-icon">
          <AgentGlyph icon={agent.icon} />
        </span>
        <span className={"agent-flow-status " + agent.status} />
        <small>{agent.kind.toUpperCase()}</small>
        <strong>{agent.name}</strong>
        <em>{agent.status.toUpperCase()}</em>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        aria-label={"Relations from " + agent.name}
      />
    </>
  );
}
const nodeTypes = { agent: AgentFlowCard };
function asNodes(
  agents: AgentEntity[],
  positions: Record<string, AgentGraphPoint>,
): FlowNode[] {
  return agents.map((agent) => ({
    id: agent.id,
    type: "agent",
    position: positions[agent.id] ?? { x: VIEW.width / 2, y: VIEW.height / 2 },
    data: { agent },
  }));
}
function asEdges(relations: AgentRelation[], selectedId: string): Edge[] {
  return relations.map((relation) => {
    const highlighted =
      relation.source === selectedId || relation.target === selectedId;
    return {
      id: relation.source + ":" + relation.target,
      source: relation.source,
      target: relation.target,
      label: highlighted ? relation.label : undefined,
      animated: highlighted,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: highlighted ? "#75d4ae" : "#617c84",
      },
      style: {
        stroke: highlighted ? "#75d4ae" : "#617c84",
        strokeWidth: highlighted ? 1.8 : 1.2,
      },
      labelStyle: { fill: "#a1c9b9", fontSize: 9 },
      labelBgStyle: { fill: "#0d171c", fillOpacity: 0.92 },
    };
  });
}
function AgentsContent() {
  const {
    data: storedAgents = [],
    isPending,
    isError,
  } = useLocalCollection<AgentEntity>("agents");
  const { data: relations = [] } =
    useLocalCollection<AgentRelation>("agent-relations");
  const queryClient = useQueryClient();
  const [graphError, setGraphError] = useState("");
  const [agentDraft, setAgentDraft] = useState({
    name: "",
    role: "",
    model: "",
  });
  const agents = useMemo(() => storedAgents, [storedAgents]);
  const [layout, setLayout] = useState<AgentGraphLayout>(() =>
    initialLayout([]),
  );
  const layoutEdited = useRef(false);
  const [layoutLoaded, setLayoutLoaded] = useState(false);
  const [mode, setMode] = useState<AgentGraphMode>("network");
  const [selectedId, setSelectedId] = useState("codex");
  const [live, setLive] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const flow = useReactFlow();
  const selected = agents.find((agent) => agent.id === selectedId) ?? agents[0];
  const selectedEdges = relations.filter(
    (edge) => edge.source === selected?.id || edge.target === selected?.id,
  );

  useEffect(() => {
    if (selected)
      setAgentDraft({
        name: selected.name,
        role: selected.role,
        model: selected.model,
      });
  }, [selected?.id, selected?.name, selected?.role, selected?.model]);

  useEffect(() => {
    if (isPending) return;
    let active = true;
    void readAgentGraphLayout(initialLayout(storedAgents)).then((saved) => {
      if (!active) return;
      if (!layoutEdited.current) setLayout(saved);
      setLayoutLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [isPending, storedAgents]);
  useEffect(() => {
    if (!layoutLoaded) return;
    const timeout = window.setTimeout(
      () => void writeAgentGraphLayout(layout),
      250,
    );
    return () => window.clearTimeout(timeout);
  }, [layout, layoutLoaded]);
  useEffect(() => {
    if (!agents.length) return;
    setNodes(asNodes(agents, layout.positions[mode]));
    setEdges(asEdges(relations, selectedId));
  }, [
    agents,
    relations,
    layout.positions,
    mode,
    selectedId,
    setEdges,
    setNodes,
  ]);
  useEffect(() => {
    if (layoutLoaded)
      void flow.setViewport(layout.cameras[mode], { duration: 0 });
  }, [flow, layout.cameras, layoutLoaded, mode]);

  const updateCamera = useCallback(
    (
      _event: unknown,
      viewport: AgentGraphLayout["cameras"][AgentGraphMode],
    ) => {
      setLayout((value) => ({
        ...value,
        cameras: { ...value.cameras, [mode]: viewport },
      }));
    },
    [mode],
  );
  const connect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const relation: AgentRelation = {
        source: connection.source,
        target: connection.target,
        label: "local relation",
        strength: 0.5,
      };
      if (
        relation.source === relation.target ||
        relations.some(
          (edge) =>
            edge.source === relation.source && edge.target === relation.target,
        )
      )
        return;
      void dashboardProvider.agentRelations
        .create(`${relation.source}:${relation.target}`, relation)
        .then(() =>
          queryClient.invalidateQueries({
            queryKey: ["local-records", "agent-relations"],
          }),
        )
        .catch(() => setGraphError("Relationship could not be saved locally."));
    },
    [queryClient, relations],
  );
  const changeEdges = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      for (const change of changes) {
        if (change.type !== "remove") continue;
        const [source, target] = change.id.split(":");
        if (source && target)
          void dashboardProvider.agentRelations
            .delete(`${source}:${target}`)
            .then(() =>
              queryClient.invalidateQueries({
                queryKey: ["local-records", "agent-relations"],
              }),
            )
            .catch(() =>
              setGraphError("Relationship could not be removed locally."),
            );
      }
      onEdgesChange(changes);
    },
    [onEdgesChange, queryClient],
  );
  const toggleAgentStatus = () => {
    if (selected)
      void dashboardProvider.agents
        .update(selected.id, {
          ...selected,
          status: selected.status === "paused" ? "idle" : "paused",
        })
        .then(() =>
          queryClient.invalidateQueries({
            queryKey: ["local-records", "agents"],
          }),
        )
        .catch(() =>
          setGraphError("Agent configuration could not be saved locally."),
        );
  };
  const fitView = () => void flow.fitView({ padding: 0.18, duration: 250 });
  const resetGraph = () => {
    layoutEdited.current = true;
    setLayout((value) => ({
      ...value,
      positions: { ...value.positions, [mode]: positionsFor(mode, agents) },
      cameras: { ...value.cameras, [mode]: { x: 0, y: 0, zoom: 1 } },
    }));
    void flow.fitView({ padding: 0.18, duration: 0 });
  };
  const onNodeDragStop = (_event: MouseEvent | TouchEvent, node: FlowNode) => {
    layoutEdited.current = true;
    setLayout((value) => ({
      ...value,
      positions: {
        ...value.positions,
        [mode]: { ...value.positions[mode], [node.id]: node.position },
      },
    }));
  };

  if (isPending)
    return (
      <main className="agents-page">
        <PageTitle
          eyebrow="AI AGENT WORKSPACE"
          title="Agents"
          description="Loading local demo graph…"
        />
      </main>
    );
  if (isError || !selected)
    return (
      <main className="agents-page">
        <PageTitle
          eyebrow="AI AGENT WORKSPACE"
          title="Agents"
          description={
            isError
              ? "The local agent catalog could not be loaded."
              : "No agent records are available."
          }
        />
      </main>
    );

  return (
    <main className={"agents-page" + (live ? "" : " motion-off")}>
      <PageTitle
        eyebrow="AI AGENT WORKSPACE"
        title="Agents"
        description="Explore the relationships between local demo agents, models, tools, memory, tasks, and services. All connections are illustrative."
        actions={
          <span className="agents-demo-tag">
            <span /> DEMO GRAPH
          </span>
        }
      />
      <section className="agents-summary" aria-label="Demo agent summary">
        <div className="agents-summary-intro">
          <span className="agents-summary-icon">
            <BrainCircuit size={18} />
          </span>
          <div>
            <strong>Agent network</strong>
            <small>Local sample topology · no external connections</small>
          </div>
        </div>
        <div className="agents-summary-stats">
          <div>
            <span>ENTITIES</span>
            <strong>{agents.length.toString().padStart(2, "0")}</strong>
          </div>
          <div>
            <span>DEMO LINKS</span>
            <strong>{relations.length.toString().padStart(2, "0")}</strong>
          </div>
          <div>
            <span>ACTIVE TASKS</span>
            <strong>
              {agents
                .reduce((sum, agent) => sum + agent.tasks, 0)
                .toString()
                .padStart(2, "0")}
            </strong>
          </div>
        </div>
        <span className="agents-summary-indicator">
          <i /> Local demo data
        </span>
      </section>
      <div className="agents-workspace">
        <section
          className="agents-canvas-panel"
          aria-label="Agent graph canvas"
        >
          <div className="agents-canvas-toolbar">
            <div>
              <span className="agents-toolbar-title">Connection map</span>
              <span className="agents-toolbar-subtitle">
                Drag nodes or canvas to explore · select an entity for details
              </span>
            </div>
            <div className="agents-toolbar-actions">
              <div
                className="agents-view-switch"
                role="toolbar"
                aria-label="Graph layout"
              >
                <button
                  type="button"
                  aria-pressed={mode === "network"}
                  onClick={() => setMode("network")}
                >
                  <GitBranch size={14} /> Network
                </button>
                <button
                  type="button"
                  aria-pressed={mode === "radial"}
                  onClick={() => setMode("radial")}
                >
                  <CircleHelp size={14} /> Constellation
                </button>
              </div>
              <button
                className="agents-fit-button"
                type="button"
                onClick={fitView}
              >
                Fit graph
              </button>
            </div>
          </div>
          <section
            className="agents-graph-wrap agents-reactflow"
            aria-label={mode + " relationship graph"}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={changeEdges}
              onConnect={connect}
              onNodeClick={(_event, node) => setSelectedId(node.id)}
              onNodeDragStop={onNodeDragStop}
              onMoveEnd={updateCamera}
              onPaneClick={() => setSelectedId("")}
              fitView
              fitViewOptions={{ padding: 0.18 }}
              minZoom={0.55}
              maxZoom={1.8}
              nodesDraggable
              nodesConnectable
              elementsSelectable
              aria-label="Agent relationship graph"
            >
              <Background color="#3b5058" gap={24} size={1} />
              <Controls showInteractive={false} />
              <MiniMap
                pannable
                zoomable
                nodeColor={(node) =>
                  node.id === selectedId ? "#75d4ae" : "#607b85"
                }
              />
            </ReactFlow>
          </section>
          <div className="agents-legend">
            <span>
              <i className="active" /> Active
            </span>
            <span>
              <i className="idle" /> Idle
            </span>
            <span>
              <i className="attention" /> Needs attention
            </span>
            <span className="agents-legend-note">
              Lines show illustrative directed relationships
            </span>
          </div>
        </section>
        <aside className="agents-inspector" aria-label="Selected agent details">
          {graphError && (
            <p role="alert" className="form-error">
              {graphError}
            </p>
          )}
          <div className="agents-inspector-head">
            <div>
              <span className="agents-inspector-kicker">ENTITY INSPECTOR</span>
              <span className="agents-inspector-count">
                {String(
                  agents.findIndex((agent) => agent.id === selected.id) + 1,
                ).padStart(2, "0")}{" "}
                / {String(agents.length).padStart(2, "0")}
              </span>
            </div>
            <span className={"agents-status-chip " + selected.status}>
              <i />
              {selected.status}
            </span>
          </div>
          <div className={"agents-profile-mark " + selected.color}>
            <AgentGlyph icon={selected.icon} />
          </div>
          <h2>{selected.name}</h2>
          <p className="agents-profile-vendor">
            {selected.vendor} <span>·</span> {selected.kind.toUpperCase()} ·{" "}
            {selected.role}
          </p>
          <div className="agents-model-box">
            <span>MODEL / ADAPTER</span>
            <strong>{selected.model}</strong>
            <small>Configured for demonstration only</small>
          </div>
          <form
            className="agents-config-form"
            onSubmit={(event) => {
              event.preventDefault();
              const updated = {
                ...selected,
                name: agentDraft.name.trim(),
                role: agentDraft.role.trim(),
                model: agentDraft.model.trim(),
              };
              void dashboardProvider.agents
                .update(selected.id, updated)
                .then(() => {
                  setGraphError("");
                  return queryClient.invalidateQueries({
                    queryKey: ["local-records", "agents"],
                  });
                })
                .catch(() =>
                  setGraphError(
                    "Agent configuration could not be saved locally.",
                  ),
                );
            }}
          >
            <label>
              Display name
              <input
                required
                maxLength={80}
                value={agentDraft.name}
                onChange={(event) =>
                  setAgentDraft((draft) => ({
                    ...draft,
                    name: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Role
              <input
                required
                maxLength={120}
                value={agentDraft.role}
                onChange={(event) =>
                  setAgentDraft((draft) => ({
                    ...draft,
                    role: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Model / adapter label
              <input
                required
                maxLength={120}
                value={agentDraft.model}
                onChange={(event) =>
                  setAgentDraft((draft) => ({
                    ...draft,
                    model: event.target.value,
                  }))
                }
              />
            </label>
            <button type="submit" className="agents-demo-action">
              Save local configuration
            </button>
          </form>
          <div className="agents-inspector-metrics">
            <div>
              <span>DEMO TASKS</span>
              <strong>{String(selected.tasks).padStart(2, "0")}</strong>
            </div>
            <div>
              <span>LATENCY SAMPLE</span>
              <strong>{selected.latency}</strong>
            </div>
          </div>
          <div className="agents-links-section">
            <div className="agents-section-heading">
              <span>CONNECTED TO</span>
              <span>{String(selectedEdges.length).padStart(2, "0")}</span>
            </div>
            {selectedEdges.length ? (
              selectedEdges.map((edge) => {
                const otherId =
                  edge.source === selected.id ? edge.target : edge.source;
                const other = agents.find((agent) => agent.id === otherId);
                if (!other) return null;
                return (
                  <button
                    type="button"
                    key={edge.source + "-" + edge.target}
                    className="agents-connected-row"
                    onClick={() => setSelectedId(other.id)}
                  >
                    <span className={"agents-connected-dot " + other.color} />
                    <span>
                      {other.name}
                      <small>{edge.label}</small>
                    </span>
                    <ChevronDown size={14} className="agents-connected-arrow" />
                  </button>
                );
              })
            ) : (
              <p className="agents-no-links">
                No demo connections are shown for this entity.
              </p>
            )}
          </div>
          <section className="agents-directory" aria-label="All graph entities">
            <div className="agents-section-heading">
              <span>GRAPH ENTITIES</span>
              <span>{String(agents.length).padStart(2, "0")}</span>
            </div>
            {agents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                aria-pressed={agent.id === selectedId}
                onClick={() => setSelectedId(agent.id)}
              >
                <span className={"agents-connected-dot " + agent.color} />
                <span>
                  {agent.name}
                  <small>{agent.kind}</small>
                </span>
              </button>
            ))}
          </section>
          <button
            type="button"
            className="agents-demo-action"
            onClick={toggleAgentStatus}
          >
            <Activity size={14} />
            {selected.status === "paused"
              ? "Resume demo adapter"
              : "Pause demo adapter"}
          </button>
          <p className="agents-inspector-note">
            Status changes are temporary and remain in this page session only.
            No software is installed or contacted.
          </p>
        </aside>
      </div>
      <div className="agents-footer-note">
        <Cpu size={14} /> Sample graph data only <span />
        <button
          type="button"
          onClick={() => setLive((value) => !value)}
          aria-pressed={live}
        >
          Motion {live ? "on" : "off"}
        </button>
        <small>Decorative connection motion can be switched off.</small>
        <button type="button" onClick={resetGraph}>
          <RotateCcw size={12} /> Reset layout
        </button>
      </div>
    </main>
  );
}
export function AgentsPage() {
  return (
    <ReactFlowProvider>
      <AgentsContent />
    </ReactFlowProvider>
  );
}

// ORIGINAL (preserved, not deleted — disabled by comment): import {
// ORIGINAL (preserved, not deleted — disabled by comment):   Activity,
// ORIGINAL (preserved, not deleted — disabled by comment):   ArrowDown,
// ORIGINAL (preserved, not deleted — disabled by comment):   ArrowLeft,
// ORIGINAL (preserved, not deleted — disabled by comment):   ArrowRight,
// ORIGINAL (preserved, not deleted — disabled by comment):   ArrowUp,
// ORIGINAL (preserved, not deleted — disabled by comment):   Bot,
// ORIGINAL (preserved, not deleted — disabled by comment):   BrainCircuit,
// ORIGINAL (preserved, not deleted — disabled by comment):   ChevronDown,
// ORIGINAL (preserved, not deleted — disabled by comment):   CircleHelp,
// ORIGINAL (preserved, not deleted — disabled by comment):   Command,
// ORIGINAL (preserved, not deleted — disabled by comment):   Cpu,
// ORIGINAL (preserved, not deleted — disabled by comment):   GitBranch,
// ORIGINAL (preserved, not deleted — disabled by comment):   Minus,
// ORIGINAL (preserved, not deleted — disabled by comment):   Plus,
// ORIGINAL (preserved, not deleted — disabled by comment):   RotateCcw,
// ORIGINAL (preserved, not deleted — disabled by comment):   Sparkles,
// ORIGINAL (preserved, not deleted — disabled by comment):   Waypoints,
// ORIGINAL (preserved, not deleted — disabled by comment): } from "lucide-react";
// ORIGINAL (preserved, not deleted — disabled by comment): import {
// ORIGINAL (preserved, not deleted — disabled by comment):   // ORIGINAL (preserved, not deleted — disabled by comment): type KeyboardEvent as ReactKeyboardEvent,
// ORIGINAL (preserved, not deleted — disabled by comment):   type PointerEvent as ReactPointerEvent,
// ORIGINAL (preserved, not deleted — disabled by comment):   type WheelEvent as ReactWheelEvent,
// ORIGINAL (preserved, not deleted — disabled by comment):   useCallback,
// ORIGINAL (preserved, not deleted — disabled by comment):   useEffect,
// ORIGINAL (preserved, not deleted — disabled by comment):   useRef,
// ORIGINAL (preserved, not deleted — disabled by comment):   useState,
// ORIGINAL (preserved, not deleted — disabled by comment): } from "react";
// ORIGINAL (preserved, not deleted — disabled by comment): import { PageTitle } from "../components/ui";
// ORIGINAL (preserved, not deleted — disabled by comment): import {
// ORIGINAL (preserved, not deleted — disabled by comment):   type AgentGraphLayout,
// ORIGINAL (preserved, not deleted — disabled by comment):   readAgentGraphLayout,
// ORIGINAL (preserved, not deleted — disabled by comment):   writeAgentGraphLayout,
// ORIGINAL (preserved, not deleted — disabled by comment): } from "../data/agentLayout";
// ORIGINAL (preserved, not deleted — disabled by comment): import "./Agents.css";
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment): type AgentStatus = "active" | "idle" | "attention" | "paused";
// ORIGINAL (preserved, not deleted — disabled by comment): type GraphMode = "network" | "radial";
// ORIGINAL (preserved, not deleted — disabled by comment): type Point = { x: number; y: number };
// ORIGINAL (preserved, not deleted — disabled by comment): type AgentNode = {
// ORIGINAL (preserved, not deleted — disabled by comment):   id: string;
// ORIGINAL (preserved, not deleted — disabled by comment):   name: string;
// ORIGINAL (preserved, not deleted — disabled by comment):   vendor: string;
// ORIGINAL (preserved, not deleted — disabled by comment):   model: string;
// ORIGINAL (preserved, not deleted — disabled by comment):   role: string;
// ORIGINAL (preserved, not deleted — disabled by comment):   status: AgentStatus;
// ORIGINAL (preserved, not deleted — disabled by comment):   tasks: number;
// ORIGINAL (preserved, not deleted — disabled by comment):   latency: string;
// ORIGINAL (preserved, not deleted — disabled by comment):   color: string;
// ORIGINAL (preserved, not deleted — disabled by comment):   icon: "codex" | "claude" | "hermes" | "openclaw" | "custom";
// ORIGINAL (preserved, not deleted — disabled by comment):   kind: "agent" | "model" | "tool" | "memory" | "task" | "service";
// ORIGINAL (preserved, not deleted — disabled by comment): };
// ORIGINAL (preserved, not deleted — disabled by comment): type AgentEdge = {
// ORIGINAL (preserved, not deleted — disabled by comment):   source: string;
// ORIGINAL (preserved, not deleted — disabled by comment):   target: string;
// ORIGINAL (preserved, not deleted — disabled by comment):   label: string;
// ORIGINAL (preserved, not deleted — disabled by comment):   strength: number;
// ORIGINAL (preserved, not deleted — disabled by comment): };
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment): const VIEW = { width: 900, height: 570 };
// ORIGINAL (preserved, not deleted — disabled by comment): const INITIAL_AGENTS: AgentNode[] = [
// ORIGINAL (preserved, not deleted — disabled by comment):   {
// ORIGINAL (preserved, not deleted — disabled by comment):     id: "codex",
// ORIGINAL (preserved, not deleted — disabled by comment):     name: "Codex",
// ORIGINAL (preserved, not deleted — disabled by comment):     vendor: "OpenAI",
// ORIGINAL (preserved, not deleted — disabled by comment):     model: "Codex · demo adapter",
// ORIGINAL (preserved, not deleted — disabled by comment):     role: "Workflow coordinator",
// ORIGINAL (preserved, not deleted — disabled by comment):     status: "active",
// ORIGINAL (preserved, not deleted — disabled by comment):     tasks: 4,
// ORIGINAL (preserved, not deleted — disabled by comment):     latency: "42 ms",
// ORIGINAL (preserved, not deleted — disabled by comment):     color: "mint",
// ORIGINAL (preserved, not deleted — disabled by comment):     icon: "codex",
// ORIGINAL (preserved, not deleted — disabled by comment):     kind: "agent",
// ORIGINAL (preserved, not deleted — disabled by comment):   },
// ORIGINAL (preserved, not deleted — disabled by comment):   {
// ORIGINAL (preserved, not deleted — disabled by comment):     id: "claude",
// ORIGINAL (preserved, not deleted — disabled by comment):     name: "Claude Code",
// ORIGINAL (preserved, not deleted — disabled by comment):     vendor: "Anthropic",
// ORIGINAL (preserved, not deleted — disabled by comment):     model: "Claude · demo adapter",
// ORIGINAL (preserved, not deleted — disabled by comment):     role: "Code analysis",
// ORIGINAL (preserved, not deleted — disabled by comment):     status: "active",
// ORIGINAL (preserved, not deleted — disabled by comment):     tasks: 2,
// ORIGINAL (preserved, not deleted — disabled by comment):     latency: "58 ms",
// ORIGINAL (preserved, not deleted — disabled by comment):     color: "peach",
// ORIGINAL (preserved, not deleted — disabled by comment):     icon: "claude",
// ORIGINAL (preserved, not deleted — disabled by comment):     kind: "agent",
// ORIGINAL (preserved, not deleted — disabled by comment):   },
// ORIGINAL (preserved, not deleted — disabled by comment):   {
// ORIGINAL (preserved, not deleted — disabled by comment):     id: "hermes",
// ORIGINAL (preserved, not deleted — disabled by comment):     name: "Hermes Agent",
// ORIGINAL (preserved, not deleted — disabled by comment):     vendor: "Open source",
// ORIGINAL (preserved, not deleted — disabled by comment):     model: "Hermes · demo adapter",
// ORIGINAL (preserved, not deleted — disabled by comment):     role: "Task automation",
// ORIGINAL (preserved, not deleted — disabled by comment):     status: "idle",
// ORIGINAL (preserved, not deleted — disabled by comment):     tasks: 0,
// ORIGINAL (preserved, not deleted — disabled by comment):     latency: "—",
// ORIGINAL (preserved, not deleted — disabled by comment):     color: "violet",
// ORIGINAL (preserved, not deleted — disabled by comment):     icon: "hermes",
// ORIGINAL (preserved, not deleted — disabled by comment):     kind: "agent",
// ORIGINAL (preserved, not deleted — disabled by comment):   },
// ORIGINAL (preserved, not deleted — disabled by comment):   {
// ORIGINAL (preserved, not deleted — disabled by comment):     id: "openclaw",
// ORIGINAL (preserved, not deleted — disabled by comment):     name: "OpenClaw",
// ORIGINAL (preserved, not deleted — disabled by comment):     vendor: "Community",
// ORIGINAL (preserved, not deleted — disabled by comment):     model: "OpenClaw · demo adapter",
// ORIGINAL (preserved, not deleted — disabled by comment):     role: "Tool routing",
// ORIGINAL (preserved, not deleted — disabled by comment):     status: "attention",
// ORIGINAL (preserved, not deleted — disabled by comment):     tasks: 1,
// ORIGINAL (preserved, not deleted — disabled by comment):     latency: "91 ms",
// ORIGINAL (preserved, not deleted — disabled by comment):     color: "blue",
// ORIGINAL (preserved, not deleted — disabled by comment):     icon: "openclaw",
// ORIGINAL (preserved, not deleted — disabled by comment):     kind: "agent",
// ORIGINAL (preserved, not deleted — disabled by comment):   },
// ORIGINAL (preserved, not deleted — disabled by comment):   {
// ORIGINAL (preserved, not deleted — disabled by comment):     id: "custom",
// ORIGINAL (preserved, not deleted — disabled by comment):     name: "Custom adapter",
// ORIGINAL (preserved, not deleted — disabled by comment):     vendor: "Local example",
// ORIGINAL (preserved, not deleted — disabled by comment):     model: "Compatible endpoint · demo",
// ORIGINAL (preserved, not deleted — disabled by comment):     role: "Custom integration",
// ORIGINAL (preserved, not deleted — disabled by comment):     status: "paused",
// ORIGINAL (preserved, not deleted — disabled by comment):     tasks: 0,
// ORIGINAL (preserved, not deleted — disabled by comment):     latency: "—",
// ORIGINAL (preserved, not deleted — disabled by comment):     color: "gold",
// ORIGINAL (preserved, not deleted — disabled by comment):     icon: "custom",
// ORIGINAL (preserved, not deleted — disabled by comment):     kind: "agent",
// ORIGINAL (preserved, not deleted — disabled by comment):   },
// ORIGINAL (preserved, not deleted — disabled by comment):   {
// ORIGINAL (preserved, not deleted — disabled by comment):     id: "model",
// ORIGINAL (preserved, not deleted — disabled by comment):     name: "Reasoning model",
// ORIGINAL (preserved, not deleted — disabled by comment):     vendor: "MODEL",
// ORIGINAL (preserved, not deleted — disabled by comment):     model: "Local demo model",
// ORIGINAL (preserved, not deleted — disabled by comment):     role: "Language model",
// ORIGINAL (preserved, not deleted — disabled by comment):     status: "active",
// ORIGINAL (preserved, not deleted — disabled by comment):     tasks: 3,
// ORIGINAL (preserved, not deleted — disabled by comment):     latency: "36 ms",
// ORIGINAL (preserved, not deleted — disabled by comment):     color: "violet",
// ORIGINAL (preserved, not deleted — disabled by comment):     icon: "custom",
// ORIGINAL (preserved, not deleted — disabled by comment):     kind: "model",
// ORIGINAL (preserved, not deleted — disabled by comment):   },
// ORIGINAL (preserved, not deleted — disabled by comment):   {
// ORIGINAL (preserved, not deleted — disabled by comment):     id: "tools",
// ORIGINAL (preserved, not deleted — disabled by comment):     name: "Tool registry",
// ORIGINAL (preserved, not deleted — disabled by comment):     vendor: "TOOLS",
// ORIGINAL (preserved, not deleted — disabled by comment):     model: "Local demo tools",
// ORIGINAL (preserved, not deleted — disabled by comment):     role: "Tool collection",
// ORIGINAL (preserved, not deleted — disabled by comment):     status: "idle",
// ORIGINAL (preserved, not deleted — disabled by comment):     tasks: 0,
// ORIGINAL (preserved, not deleted — disabled by comment):     latency: "—",
// ORIGINAL (preserved, not deleted — disabled by comment):     color: "blue",
// ORIGINAL (preserved, not deleted — disabled by comment):     icon: "openclaw",
// ORIGINAL (preserved, not deleted — disabled by comment):     kind: "tool",
// ORIGINAL (preserved, not deleted — disabled by comment):   },
// ORIGINAL (preserved, not deleted — disabled by comment):   {
// ORIGINAL (preserved, not deleted — disabled by comment):     id: "memory",
// ORIGINAL (preserved, not deleted — disabled by comment):     name: "Shared context",
// ORIGINAL (preserved, not deleted — disabled by comment):     vendor: "MEMORY",
// ORIGINAL (preserved, not deleted — disabled by comment):     model: "Session memory · demo",
// ORIGINAL (preserved, not deleted — disabled by comment):     role: "Context store",
// ORIGINAL (preserved, not deleted — disabled by comment):     status: "active",
// ORIGINAL (preserved, not deleted — disabled by comment):     tasks: 2,
// ORIGINAL (preserved, not deleted — disabled by comment):     latency: "12 ms",
// ORIGINAL (preserved, not deleted — disabled by comment):     color: "gold",
// ORIGINAL (preserved, not deleted — disabled by comment):     icon: "hermes",
// ORIGINAL (preserved, not deleted — disabled by comment):     kind: "memory",
// ORIGINAL (preserved, not deleted — disabled by comment):   },
// ORIGINAL (preserved, not deleted — disabled by comment):   {
// ORIGINAL (preserved, not deleted — disabled by comment):     id: "task",
// ORIGINAL (preserved, not deleted — disabled by comment):     name: "Build review",
// ORIGINAL (preserved, not deleted — disabled by comment):     vendor: "TASK",
// ORIGINAL (preserved, not deleted — disabled by comment):     model: "Sample job · demo",
// ORIGINAL (preserved, not deleted — disabled by comment):     role: "Queued task",
// ORIGINAL (preserved, not deleted — disabled by comment):     status: "idle",
// ORIGINAL (preserved, not deleted — disabled by comment):     tasks: 1,
// ORIGINAL (preserved, not deleted — disabled by comment):     latency: "—",
// ORIGINAL (preserved, not deleted — disabled by comment):     color: "peach",
// ORIGINAL (preserved, not deleted — disabled by comment):     icon: "claude",
// ORIGINAL (preserved, not deleted — disabled by comment):     kind: "task",
// ORIGINAL (preserved, not deleted — disabled by comment):   },
// ORIGINAL (preserved, not deleted — disabled by comment):   {
// ORIGINAL (preserved, not deleted — disabled by comment):     id: "service",
// ORIGINAL (preserved, not deleted — disabled by comment):     name: "Git provider",
// ORIGINAL (preserved, not deleted — disabled by comment):     vendor: "SERVICE",
// ORIGINAL (preserved, not deleted — disabled by comment):     model: "External service · illustrative",
// ORIGINAL (preserved, not deleted — disabled by comment):     role: "Integration endpoint",
// ORIGINAL (preserved, not deleted — disabled by comment):     status: "paused",
// ORIGINAL (preserved, not deleted — disabled by comment):     tasks: 0,
// ORIGINAL (preserved, not deleted — disabled by comment):     latency: "—",
// ORIGINAL (preserved, not deleted — disabled by comment):     color: "blue",
// ORIGINAL (preserved, not deleted — disabled by comment):     icon: "custom",
// ORIGINAL (preserved, not deleted — disabled by comment):     kind: "service",
// ORIGINAL (preserved, not deleted — disabled by comment):   },
// ORIGINAL (preserved, not deleted — disabled by comment): ];
// ORIGINAL (preserved, not deleted — disabled by comment): const INITIAL_EDGES: AgentEdge[] = [
// ORIGINAL (preserved, not deleted — disabled by comment):   {
// ORIGINAL (preserved, not deleted — disabled by comment):     source: "codex",
// ORIGINAL (preserved, not deleted — disabled by comment):     target: "claude",
// ORIGINAL (preserved, not deleted — disabled by comment):     label: "delegates review",
// ORIGINAL (preserved, not deleted — disabled by comment):     strength: 0.82,
// ORIGINAL (preserved, not deleted — disabled by comment):   },
// ORIGINAL (preserved, not deleted — disabled by comment):   { source: "codex", target: "hermes", label: "routes tasks", strength: 0.62 },
// ORIGINAL (preserved, not deleted — disabled by comment):   {
// ORIGINAL (preserved, not deleted — disabled by comment):     source: "codex",
// ORIGINAL (preserved, not deleted — disabled by comment):     target: "openclaw",
// ORIGINAL (preserved, not deleted — disabled by comment):     label: "shares context",
// ORIGINAL (preserved, not deleted — disabled by comment):     strength: 0.46,
// ORIGINAL (preserved, not deleted — disabled by comment):   },
// ORIGINAL (preserved, not deleted — disabled by comment):   { source: "claude", target: "custom", label: "handoff", strength: 0.34 },
// ORIGINAL (preserved, not deleted — disabled by comment):   { source: "hermes", target: "custom", label: "tool access", strength: 0.3 },
// ORIGINAL (preserved, not deleted — disabled by comment):   {
// ORIGINAL (preserved, not deleted — disabled by comment):     source: "openclaw",
// ORIGINAL (preserved, not deleted — disabled by comment):     target: "hermes",
// ORIGINAL (preserved, not deleted — disabled by comment):     label: "event bridge",
// ORIGINAL (preserved, not deleted — disabled by comment):     strength: 0.56,
// ORIGINAL (preserved, not deleted — disabled by comment):   },
// ORIGINAL (preserved, not deleted — disabled by comment):   { source: "codex", target: "model", label: "uses model", strength: 0.66 },
// ORIGINAL (preserved, not deleted — disabled by comment):   { source: "claude", target: "tools", label: "uses tools", strength: 0.42 },
// ORIGINAL (preserved, not deleted — disabled by comment):   {
// ORIGINAL (preserved, not deleted — disabled by comment):     source: "hermes",
// ORIGINAL (preserved, not deleted — disabled by comment):     target: "memory",
// ORIGINAL (preserved, not deleted — disabled by comment):     label: "reads context",
// ORIGINAL (preserved, not deleted — disabled by comment):     strength: 0.52,
// ORIGINAL (preserved, not deleted — disabled by comment):   },
// ORIGINAL (preserved, not deleted — disabled by comment):   { source: "codex", target: "task", label: "runs task", strength: 0.72 },
// ORIGINAL (preserved, not deleted — disabled by comment):   {
// ORIGINAL (preserved, not deleted — disabled by comment):     source: "task",
// ORIGINAL (preserved, not deleted — disabled by comment):     target: "service",
// ORIGINAL (preserved, not deleted — disabled by comment):     label: "requests change",
// ORIGINAL (preserved, not deleted — disabled by comment):     strength: 0.38,
// ORIGINAL (preserved, not deleted — disabled by comment):   },
// ORIGINAL (preserved, not deleted — disabled by comment): ];
// ORIGINAL (preserved, not deleted — disabled by comment): // ORIGINAL (preserved, not deleted — disabled by comment): const edges = INITIAL_EDGES;
// ORIGINAL (preserved, not deleted — disabled by comment): const NETWORK_POSITIONS: Record<string, Point> = {
// ORIGINAL (preserved, not deleted — disabled by comment):   codex: { x: 250, y: 280 },
// ORIGINAL (preserved, not deleted — disabled by comment):   claude: { x: 570, y: 145 },
// ORIGINAL (preserved, not deleted — disabled by comment):   hermes: { x: 675, y: 310 },
// ORIGINAL (preserved, not deleted — disabled by comment):   openclaw: { x: 515, y: 445 },
// ORIGINAL (preserved, not deleted — disabled by comment):   custom: { x: 225, y: 460 },
// ORIGINAL (preserved, not deleted — disabled by comment):   model: { x: 110, y: 155 },
// ORIGINAL (preserved, not deleted — disabled by comment):   tools: { x: 775, y: 165 },
// ORIGINAL (preserved, not deleted — disabled by comment):   memory: { x: 800, y: 480 },
// ORIGINAL (preserved, not deleted — disabled by comment):   task: { x: 345, y: 510 },
// ORIGINAL (preserved, not deleted — disabled by comment):   service: { x: 110, y: 390 },
// ORIGINAL (preserved, not deleted — disabled by comment): };
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment): function positionsFor(mode: GraphMode): Record<string, Point> {
// ORIGINAL (preserved, not deleted — disabled by comment):   if (mode === "network") return NETWORK_POSITIONS;
// ORIGINAL (preserved, not deleted — disabled by comment):   const center = { x: VIEW.width / 2, y: VIEW.height / 2 };
// ORIGINAL (preserved, not deleted — disabled by comment):   const radiusX = 255;
// ORIGINAL (preserved, not deleted — disabled by comment):   const radiusY = 190;
// ORIGINAL (preserved, not deleted — disabled by comment):   return Object.fromEntries(
// ORIGINAL (preserved, not deleted — disabled by comment):     INITIAL_AGENTS.map((agent) => {
// ORIGINAL (preserved, not deleted — disabled by comment):       if (agent.id === "codex") return [agent.id, center];
// ORIGINAL (preserved, not deleted — disabled by comment):       const peers = INITIAL_AGENTS.filter((item) => item.id !== "codex");
// ORIGINAL (preserved, not deleted — disabled by comment):       const spoke = peers.findIndex((item) => item.id === agent.id);
// ORIGINAL (preserved, not deleted — disabled by comment):       const angle = -Math.PI / 2 + (spoke * (Math.PI * 2)) / peers.length;
// ORIGINAL (preserved, not deleted — disabled by comment):       return [
// ORIGINAL (preserved, not deleted — disabled by comment):         agent.id,
// ORIGINAL (preserved, not deleted — disabled by comment):         {
// ORIGINAL (preserved, not deleted — disabled by comment):           x: center.x + Math.cos(angle) * radiusX,
// ORIGINAL (preserved, not deleted — disabled by comment):           y: center.y + Math.sin(angle) * radiusY,
// ORIGINAL (preserved, not deleted — disabled by comment):         },
// ORIGINAL (preserved, not deleted — disabled by comment):       ];
// ORIGINAL (preserved, not deleted — disabled by comment):     }),
// ORIGINAL (preserved, not deleted — disabled by comment):   );
// ORIGINAL (preserved, not deleted — disabled by comment): }
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment): function initialLayout(): AgentGraphLayout {
// ORIGINAL (preserved, not deleted — disabled by comment):   return {
// ORIGINAL (preserved, not deleted — disabled by comment):     positions: { network: NETWORK_POSITIONS, radial: positionsFor("radial") },
// ORIGINAL (preserved, not deleted — disabled by comment):     cameras: {
// ORIGINAL (preserved, not deleted — disabled by comment):       network: { x: 0, y: 0, zoom: 1 },
// ORIGINAL (preserved, not deleted — disabled by comment):       radial: { x: 0, y: 0, zoom: 1 },
// ORIGINAL (preserved, not deleted — disabled by comment):     },
// ORIGINAL (preserved, not deleted — disabled by comment):   };
// ORIGINAL (preserved, not deleted — disabled by comment): }
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment): function AgentGlyph({ icon }: { icon: AgentNode["icon"] }) {
// ORIGINAL (preserved, not deleted — disabled by comment):   if (icon === "codex") return <Command size={18} strokeWidth={1.8} />;
// ORIGINAL (preserved, not deleted — disabled by comment):   if (icon === "claude") return <Sparkles size={18} strokeWidth={1.8} />;
// ORIGINAL (preserved, not deleted — disabled by comment):   if (icon === "hermes") return <Bot size={18} strokeWidth={1.8} />;
// ORIGINAL (preserved, not deleted — disabled by comment):   if (icon === "openclaw") return <Waypoints size={18} strokeWidth={1.8} />;
// ORIGINAL (preserved, not deleted — disabled by comment):   return <CircleHelp size={18} strokeWidth={1.8} />;
// ORIGINAL (preserved, not deleted — disabled by comment): }
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment): function edgePath(a: Point, b: Point) {
// ORIGINAL (preserved, not deleted — disabled by comment):   const middleX = (a.x + b.x) / 2;
// ORIGINAL (preserved, not deleted — disabled by comment):   const middleY = (a.y + b.y) / 2;
// ORIGINAL (preserved, not deleted — disabled by comment):   const curve = (b.x - a.x) * 0.08;
// ORIGINAL (preserved, not deleted — disabled by comment):   return `M ${a.x} ${a.y} Q ${middleX - curve} ${middleY + curve} ${b.x} ${b.y}`;
// ORIGINAL (preserved, not deleted — disabled by comment): }
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment): export function AgentsPage() {
// ORIGINAL (preserved, not deleted — disabled by comment):   const [agents, setAgents] = useState(INITIAL_AGENTS);
// ORIGINAL (preserved, not deleted — disabled by comment):   const [layout, setLayout] = useState<AgentGraphLayout>(initialLayout);
// ORIGINAL (preserved, not deleted — disabled by comment):   const layoutEdited = useRef(false);
// ORIGINAL (preserved, not deleted — disabled by comment):   const [layoutLoaded, setLayoutLoaded] = useState(false);
// ORIGINAL (preserved, not deleted — disabled by comment):   const [mode, setMode] = useState<GraphMode>("network");
// ORIGINAL (preserved, not deleted — disabled by comment):   const positions = layout.positions[mode];
// ORIGINAL (preserved, not deleted — disabled by comment):   const [selectedId, setSelectedId] = useState("codex");
// ORIGINAL (preserved, not deleted — disabled by comment):   const [zoom, setZoom] = useState(1);
// ORIGINAL (preserved, not deleted — disabled by comment):   const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
// ORIGINAL (preserved, not deleted — disabled by comment):   const [live, setLive] = useState(true);
// ORIGINAL (preserved, not deleted — disabled by comment):   const svgRef = useRef<SVGSVGElement>(null);
// ORIGINAL (preserved, not deleted — disabled by comment):   const gesture = useRef<
// ORIGINAL (preserved, not deleted — disabled by comment):     | { type: "node"; id: string; pointer: Point }
// ORIGINAL (preserved, not deleted — disabled by comment):     | { type: "pan"; pointer: Point; pan: Point }
// ORIGINAL (preserved, not deleted — disabled by comment):     | null
// ORIGINAL (preserved, not deleted — disabled by comment):   >(null);
// ORIGINAL (preserved, not deleted — disabled by comment):   const selected = agents.find((agent) => agent.id === selectedId) ?? agents[0];
// ORIGINAL (preserved, not deleted — disabled by comment):   const selectedEdges = INITIAL_EDGES.filter(
// ORIGINAL (preserved, not deleted — disabled by comment):     (edge) => edge.source === selected.id || edge.target === selected.id,
// ORIGINAL (preserved, not deleted — disabled by comment):   );
// ORIGINAL (preserved, not deleted — disabled by comment):   useEffect(() => {
// ORIGINAL (preserved, not deleted — disabled by comment):     let active = true;
// ORIGINAL (preserved, not deleted — disabled by comment):     void readAgentGraphLayout(initialLayout()).then((saved) => {
// ORIGINAL (preserved, not deleted — disabled by comment):       if (!active) return;
// ORIGINAL (preserved, not deleted — disabled by comment):       if (!layoutEdited.current) setLayout(saved);
// ORIGINAL (preserved, not deleted — disabled by comment):       setLayoutLoaded(true);
// ORIGINAL (preserved, not deleted — disabled by comment):     });
// ORIGINAL (preserved, not deleted — disabled by comment):     return () => {
// ORIGINAL (preserved, not deleted — disabled by comment):       active = false;
// ORIGINAL (preserved, not deleted — disabled by comment):     };
// ORIGINAL (preserved, not deleted — disabled by comment):   }, []);
// ORIGINAL (preserved, not deleted — disabled by comment):   useEffect(() => {
// ORIGINAL (preserved, not deleted — disabled by comment):     if (!layoutLoaded) return;
// ORIGINAL (preserved, not deleted — disabled by comment):     const timeout = window.setTimeout(
// ORIGINAL (preserved, not deleted — disabled by comment):       () => void writeAgentGraphLayout(layout),
// ORIGINAL (preserved, not deleted — disabled by comment):       250,
// ORIGINAL (preserved, not deleted — disabled by comment):     );
// ORIGINAL (preserved, not deleted — disabled by comment):     return () => window.clearTimeout(timeout);
// ORIGINAL (preserved, not deleted — disabled by comment):   }, [layout, layoutLoaded]);
// ORIGINAL (preserved, not deleted — disabled by comment):   useEffect(() => {
// ORIGINAL (preserved, not deleted — disabled by comment):     setZoom(layout.cameras[mode].zoom);
// ORIGINAL (preserved, not deleted — disabled by comment):     setPan({ x: layout.cameras[mode].x, y: layout.cameras[mode].y });
// ORIGINAL (preserved, not deleted — disabled by comment):   }, [layout.cameras, mode]);
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment):   const updateCamera = (next: Partial<Point> & { zoom?: number }) => {
// ORIGINAL (preserved, not deleted — disabled by comment):     layoutEdited.current = true;
// ORIGINAL (preserved, not deleted — disabled by comment):     setLayout((value) => ({
// ORIGINAL (preserved, not deleted — disabled by comment):       ...value,
// ORIGINAL (preserved, not deleted — disabled by comment):       cameras: {
// ORIGINAL (preserved, not deleted — disabled by comment):         ...value.cameras,
// ORIGINAL (preserved, not deleted — disabled by comment):         [mode]: { ...value.cameras[mode], ...next },
// ORIGINAL (preserved, not deleted — disabled by comment):       },
// ORIGINAL (preserved, not deleted — disabled by comment):     }));
// ORIGINAL (preserved, not deleted — disabled by comment):   };
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment):   const pointerPoint = useCallback(
// ORIGINAL (preserved, not deleted — disabled by comment):     (
// ORIGINAL (preserved, not deleted — disabled by comment):       event: ReactPointerEvent<SVGSVGElement> | ReactWheelEvent<SVGSVGElement>,
// ORIGINAL (preserved, not deleted — disabled by comment):     ) => {
// ORIGINAL (preserved, not deleted — disabled by comment):       const svg = svgRef.current;
// ORIGINAL (preserved, not deleted — disabled by comment):       if (!svg) return { x: 0, y: 0 };
// ORIGINAL (preserved, not deleted — disabled by comment):       const transform = svg.getScreenCTM()?.inverse();
// ORIGINAL (preserved, not deleted — disabled by comment):       if (!transform) return { x: 0, y: 0 };
// ORIGINAL (preserved, not deleted — disabled by comment):       const point = svg.createSVGPoint();
// ORIGINAL (preserved, not deleted — disabled by comment):       point.x = event.clientX;
// ORIGINAL (preserved, not deleted — disabled by comment):       point.y = event.clientY;
// ORIGINAL (preserved, not deleted — disabled by comment):       const local = point.matrixTransform(transform);
// ORIGINAL (preserved, not deleted — disabled by comment):       return { x: local.x, y: local.y };
// ORIGINAL (preserved, not deleted — disabled by comment):     },
// ORIGINAL (preserved, not deleted — disabled by comment):     [],
// ORIGINAL (preserved, not deleted — disabled by comment):   );
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment):   const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
// ORIGINAL (preserved, not deleted — disabled by comment):     if (event.button !== 0) return;
// ORIGINAL (preserved, not deleted — disabled by comment):     const target = (event.target as Element).closest<SVGGElement>(
// ORIGINAL (preserved, not deleted — disabled by comment):       "[data-agent-id]",
// ORIGINAL (preserved, not deleted — disabled by comment):     );
// ORIGINAL (preserved, not deleted — disabled by comment):     const pointer = pointerPoint(event);
// ORIGINAL (preserved, not deleted — disabled by comment):     if (target?.dataset.agentId) {
// ORIGINAL (preserved, not deleted — disabled by comment):       const id = target.dataset.agentId;
// ORIGINAL (preserved, not deleted — disabled by comment):       setSelectedId(id);
// ORIGINAL (preserved, not deleted — disabled by comment):       gesture.current = { type: "node", id, pointer };
// ORIGINAL (preserved, not deleted — disabled by comment):     } else {
// ORIGINAL (preserved, not deleted — disabled by comment):       gesture.current = { type: "pan", pointer, pan };
// ORIGINAL (preserved, not deleted — disabled by comment):     }
// ORIGINAL (preserved, not deleted — disabled by comment):     event.currentTarget.setPointerCapture(event.pointerId);
// ORIGINAL (preserved, not deleted — disabled by comment):   };
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment):   const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
// ORIGINAL (preserved, not deleted — disabled by comment):     const active = gesture.current;
// ORIGINAL (preserved, not deleted — disabled by comment):     if (!active) return;
// ORIGINAL (preserved, not deleted — disabled by comment):     const current = pointerPoint(event);
// ORIGINAL (preserved, not deleted — disabled by comment):     const delta = {
// ORIGINAL (preserved, not deleted — disabled by comment):       x: current.x - active.pointer.x,
// ORIGINAL (preserved, not deleted — disabled by comment):       y: current.y - active.pointer.y,
// ORIGINAL (preserved, not deleted — disabled by comment):     };
// ORIGINAL (preserved, not deleted — disabled by comment):     if (active.type === "node") {
// ORIGINAL (preserved, not deleted — disabled by comment):       layoutEdited.current = true;
// ORIGINAL (preserved, not deleted — disabled by comment):       setLayout((previous) => {
// ORIGINAL (preserved, not deleted — disabled by comment):         const original = previous.positions[mode][active.id];
// ORIGINAL (preserved, not deleted — disabled by comment):         return {
// ORIGINAL (preserved, not deleted — disabled by comment):           ...previous,
// ORIGINAL (preserved, not deleted — disabled by comment):           positions: {
// ORIGINAL (preserved, not deleted — disabled by comment):             ...previous.positions,
// ORIGINAL (preserved, not deleted — disabled by comment):             [mode]: {
// ORIGINAL (preserved, not deleted — disabled by comment):               ...previous.positions[mode],
// ORIGINAL (preserved, not deleted — disabled by comment):               [active.id]: {
// ORIGINAL (preserved, not deleted — disabled by comment):                 x: original.x + delta.x / zoom,
// ORIGINAL (preserved, not deleted — disabled by comment):                 y: original.y + delta.y / zoom,
// ORIGINAL (preserved, not deleted — disabled by comment):               },
// ORIGINAL (preserved, not deleted — disabled by comment):             },
// ORIGINAL (preserved, not deleted — disabled by comment):           },
// ORIGINAL (preserved, not deleted — disabled by comment):         };
// ORIGINAL (preserved, not deleted — disabled by comment):       });
// ORIGINAL (preserved, not deleted — disabled by comment):       active.pointer = current;
// ORIGINAL (preserved, not deleted — disabled by comment):     } else {
// ORIGINAL (preserved, not deleted — disabled by comment):       const next = { x: active.pan.x + delta.x, y: active.pan.y + delta.y };
// ORIGINAL (preserved, not deleted — disabled by comment):       setPan(next);
// ORIGINAL (preserved, not deleted — disabled by comment):       updateCamera(next);
// ORIGINAL (preserved, not deleted — disabled by comment):     }
// ORIGINAL (preserved, not deleted — disabled by comment):   };
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment):   const onWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
// ORIGINAL (preserved, not deleted — disabled by comment):     event.preventDefault();
// ORIGINAL (preserved, not deleted — disabled by comment):     setZoom((current) => {
// ORIGINAL (preserved, not deleted — disabled by comment):       const next = Math.max(
// ORIGINAL (preserved, not deleted — disabled by comment):         0.65,
// ORIGINAL (preserved, not deleted — disabled by comment):         Math.min(1.8, current * (event.deltaY < 0 ? 1.08 : 0.92)),
// ORIGINAL (preserved, not deleted — disabled by comment):       );
// ORIGINAL (preserved, not deleted — disabled by comment):       updateCamera({ zoom: next });
// ORIGINAL (preserved, not deleted — disabled by comment):       return next;
// ORIGINAL (preserved, not deleted — disabled by comment):     });
// ORIGINAL (preserved, not deleted — disabled by comment):   };
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment):   /* ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment):   const onGraphKeyDown = (event: ReactKeyboardEvent<SVGSVGElement>) => {
// ORIGINAL (preserved, not deleted — disabled by comment):     const step = event.shiftKey ? 40 : 18;
// ORIGINAL (preserved, not deleted — disabled by comment):     if (event.key === "ArrowLeft")
// ORIGINAL (preserved, not deleted — disabled by comment):       setPan((value) => ({ ...value, x: value.x + step }));
// ORIGINAL (preserved, not deleted — disabled by comment):     else if (event.key === "ArrowRight")
// ORIGINAL (preserved, not deleted — disabled by comment):       setPan((value) => ({ ...value, x: value.x - step }));
// ORIGINAL (preserved, not deleted — disabled by comment):     else if (event.key === "ArrowUp")
// ORIGINAL (preserved, not deleted — disabled by comment):       setPan((value) => ({ ...value, y: value.y + step }));
// ORIGINAL (preserved, not deleted — disabled by comment):     else if (event.key === "ArrowDown")
// ORIGINAL (preserved, not deleted — disabled by comment):       setPan((value) => ({ ...value, y: value.y - step }));
// ORIGINAL (preserved, not deleted — disabled by comment):     else if (event.key === "+" || event.key === "=")
// ORIGINAL (preserved, not deleted — disabled by comment):       setZoom((value) => Math.min(1.8, value + 0.1));
// ORIGINAL (preserved, not deleted — disabled by comment):     else if (event.key === "-") setZoom((value) => Math.max(0.65, value - 0.1));
// ORIGINAL (preserved, not deleted — disabled by comment):     else return;
// ORIGINAL (preserved, not deleted — disabled by comment):     event.preventDefault();
// ORIGINAL (preserved, not deleted — disabled by comment):   };
// ORIGINAL (preserved, not deleted — disabled by comment): */
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment):   const setModeAndLayout = (nextMode: GraphMode) => {
// ORIGINAL (preserved, not deleted — disabled by comment):     setMode(nextMode);
// ORIGINAL (preserved, not deleted — disabled by comment):     setPan({ x: 0, y: 0 });
// ORIGINAL (preserved, not deleted — disabled by comment):   };
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment):   const toggleAgentStatus = () => {
// ORIGINAL (preserved, not deleted — disabled by comment):     setAgents((current) =>
// ORIGINAL (preserved, not deleted — disabled by comment):       current.map((agent) =>
// ORIGINAL (preserved, not deleted — disabled by comment):         agent.id === selected.id
// ORIGINAL (preserved, not deleted — disabled by comment):           ? { ...agent, status: agent.status === "paused" ? "idle" : "paused" }
// ORIGINAL (preserved, not deleted — disabled by comment):           : agent,
// ORIGINAL (preserved, not deleted — disabled by comment):       ),
// ORIGINAL (preserved, not deleted — disabled by comment):     );
// ORIGINAL (preserved, not deleted — disabled by comment):   };
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment):   return (
// ORIGINAL (preserved, not deleted — disabled by comment):     <main className={`agents-page${live ? "" : " motion-off"}`}>
// ORIGINAL (preserved, not deleted — disabled by comment):       <PageTitle
// ORIGINAL (preserved, not deleted — disabled by comment):         eyebrow="AI AGENT WORKSPACE"
// ORIGINAL (preserved, not deleted — disabled by comment):         title="Agents"
// ORIGINAL (preserved, not deleted — disabled by comment):         description="Explore the relationships between sample AI adapters. All activity and connections on this page are illustrative."
// ORIGINAL (preserved, not deleted — disabled by comment):         actions={
// ORIGINAL (preserved, not deleted — disabled by comment):           <span className="agents-demo-tag">
// ORIGINAL (preserved, not deleted — disabled by comment):             <span /> DEMO GRAPH
// ORIGINAL (preserved, not deleted — disabled by comment):           </span>
// ORIGINAL (preserved, not deleted — disabled by comment):         }
// ORIGINAL (preserved, not deleted — disabled by comment):       />
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment):       <section className="agents-summary" aria-label="Demo agent summary">
// ORIGINAL (preserved, not deleted — disabled by comment):         <div className="agents-summary-intro">
// ORIGINAL (preserved, not deleted — disabled by comment):           <span className="agents-summary-icon">
// ORIGINAL (preserved, not deleted — disabled by comment):             <BrainCircuit size={18} />
// ORIGINAL (preserved, not deleted — disabled by comment):           </span>
// ORIGINAL (preserved, not deleted — disabled by comment):           <div>
// ORIGINAL (preserved, not deleted — disabled by comment):             <strong>Agent network</strong>
// ORIGINAL (preserved, not deleted — disabled by comment):             <small>Local sample topology · no external connections</small>
// ORIGINAL (preserved, not deleted — disabled by comment):           </div>
// ORIGINAL (preserved, not deleted — disabled by comment):         </div>
// ORIGINAL (preserved, not deleted — disabled by comment):         <div className="agents-summary-stats">
// ORIGINAL (preserved, not deleted — disabled by comment):           <div>
// ORIGINAL (preserved, not deleted — disabled by comment):             <span>ADAPTERS</span>
// ORIGINAL (preserved, not deleted — disabled by comment):             <strong>{agents.length.toString().padStart(2, "0")}</strong>
// ORIGINAL (preserved, not deleted — disabled by comment):           </div>
// ORIGINAL (preserved, not deleted — disabled by comment):           <div>
// ORIGINAL (preserved, not deleted — disabled by comment):             <span>DEMO LINKS</span>
// ORIGINAL (preserved, not deleted — disabled by comment):             <strong>{INITIAL_EDGES.length.toString().padStart(2, "0")}</strong>
// ORIGINAL (preserved, not deleted — disabled by comment):           </div>
// ORIGINAL (preserved, not deleted — disabled by comment):           <div>
// ORIGINAL (preserved, not deleted — disabled by comment):             <span>ACTIVE TASKS</span>
// ORIGINAL (preserved, not deleted — disabled by comment):             <strong>
// ORIGINAL (preserved, not deleted — disabled by comment):               {agents
// ORIGINAL (preserved, not deleted — disabled by comment):                 .reduce((sum, agent) => sum + agent.tasks, 0)
// ORIGINAL (preserved, not deleted — disabled by comment):                 .toString()
// ORIGINAL (preserved, not deleted — disabled by comment):                 .padStart(2, "0")}
// ORIGINAL (preserved, not deleted — disabled by comment):             </strong>
// ORIGINAL (preserved, not deleted — disabled by comment):           </div>
// ORIGINAL (preserved, not deleted — disabled by comment):         </div>
// ORIGINAL (preserved, not deleted — disabled by comment):         <span className="agents-summary-indicator">
// ORIGINAL (preserved, not deleted — disabled by comment):           <i /> Local demo data
// ORIGINAL (preserved, not deleted — disabled by comment):         </span>
// ORIGINAL (preserved, not deleted — disabled by comment):       </section>
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment):       <div className="agents-workspace">
// ORIGINAL (preserved, not deleted — disabled by comment):         <section
// ORIGINAL (preserved, not deleted — disabled by comment):           className="agents-canvas-panel"
// ORIGINAL (preserved, not deleted — disabled by comment):           aria-label="Agent graph canvas"
// ORIGINAL (preserved, not deleted — disabled by comment):         >
// ORIGINAL (preserved, not deleted — disabled by comment):           <div className="agents-canvas-toolbar">
// ORIGINAL (preserved, not deleted — disabled by comment):             <div>
// ORIGINAL (preserved, not deleted — disabled by comment):               <span className="agents-toolbar-title">Connection map</span>
// ORIGINAL (preserved, not deleted — disabled by comment):               <span className="agents-toolbar-subtitle">
// ORIGINAL (preserved, not deleted — disabled by comment):                 Drag nodes or canvas to explore
// ORIGINAL (preserved, not deleted — disabled by comment):               </span>
// ORIGINAL (preserved, not deleted — disabled by comment):             </div>
// ORIGINAL (preserved, not deleted — disabled by comment):             <div
// ORIGINAL (preserved, not deleted — disabled by comment):               className="agents-view-switch"
// ORIGINAL (preserved, not deleted — disabled by comment):               role="toolbar"
// ORIGINAL (preserved, not deleted — disabled by comment):               aria-label="Graph layout"
// ORIGINAL (preserved, not deleted — disabled by comment):             >
// ORIGINAL (preserved, not deleted — disabled by comment):               <button
// ORIGINAL (preserved, not deleted — disabled by comment):                 type="button"
// ORIGINAL (preserved, not deleted — disabled by comment):                 aria-pressed={mode === "network"}
// ORIGINAL (preserved, not deleted — disabled by comment):                 onClick={() => setModeAndLayout("network")}
// ORIGINAL (preserved, not deleted — disabled by comment):               >
// ORIGINAL (preserved, not deleted — disabled by comment):                 <GitBranch size={14} /> Network
// ORIGINAL (preserved, not deleted — disabled by comment):               </button>
// ORIGINAL (preserved, not deleted — disabled by comment):               <button
// ORIGINAL (preserved, not deleted — disabled by comment):                 type="button"
// ORIGINAL (preserved, not deleted — disabled by comment):                 aria-pressed={mode === "radial"}
// ORIGINAL (preserved, not deleted — disabled by comment):                 onClick={() => setModeAndLayout("radial")}
// ORIGINAL (preserved, not deleted — disabled by comment):               >
// ORIGINAL (preserved, not deleted — disabled by comment):                 <CircleHelp size={14} /> Radial
// ORIGINAL (preserved, not deleted — disabled by comment):               </button>
// ORIGINAL (preserved, not deleted — disabled by comment):             </div>
// ORIGINAL (preserved, not deleted — disabled by comment):           </div>
// ORIGINAL (preserved, not deleted — disabled by comment):           <section
// ORIGINAL (preserved, not deleted — disabled by comment):             className="agents-graph-wrap"
// ORIGINAL (preserved, not deleted — disabled by comment):             aria-label={`${mode} agent graph. Select a demo adapter with the keyboard or pointer.`}
// ORIGINAL (preserved, not deleted — disabled by comment):           >
// ORIGINAL (preserved, not deleted — disabled by comment):             <svg
// ORIGINAL (preserved, not deleted — disabled by comment):               ref={svgRef}
// ORIGINAL (preserved, not deleted — disabled by comment):               className="agents-graph"
// ORIGINAL (preserved, not deleted — disabled by comment):               viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
// ORIGINAL (preserved, not deleted — disabled by comment):               onPointerDown={onPointerDown}
// ORIGINAL (preserved, not deleted — disabled by comment):               onPointerMove={onPointerMove}
// ORIGINAL (preserved, not deleted — disabled by comment):               onPointerUp={() => {
// ORIGINAL (preserved, not deleted — disabled by comment):                 gesture.current = null;
// ORIGINAL (preserved, not deleted — disabled by comment):               }}
// ORIGINAL (preserved, not deleted — disabled by comment):               onPointerCancel={() => {
// ORIGINAL (preserved, not deleted — disabled by comment):                 gesture.current = null;
// ORIGINAL (preserved, not deleted — disabled by comment):               }}
// ORIGINAL (preserved, not deleted — disabled by comment):               onWheel={onWheel}
// ORIGINAL (preserved, not deleted — disabled by comment):             >
// ORIGINAL (preserved, not deleted — disabled by comment):               <title id="agents-graph-title">
// ORIGINAL (preserved, not deleted — disabled by comment):                 Demo AI agent relationship map
// ORIGINAL (preserved, not deleted — disabled by comment):               </title>
// ORIGINAL (preserved, not deleted — disabled by comment):               <defs>
// ORIGINAL (preserved, not deleted — disabled by comment):                 <pattern
// ORIGINAL (preserved, not deleted — disabled by comment):                   id="agent-grid"
// ORIGINAL (preserved, not deleted — disabled by comment):                   width="30"
// ORIGINAL (preserved, not deleted — disabled by comment):                   height="30"
// ORIGINAL (preserved, not deleted — disabled by comment):                   patternUnits="userSpaceOnUse"
// ORIGINAL (preserved, not deleted — disabled by comment):                 >
// ORIGINAL (preserved, not deleted — disabled by comment):                   <circle
// ORIGINAL (preserved, not deleted — disabled by comment):                     cx="1"
// ORIGINAL (preserved, not deleted — disabled by comment):                     cy="1"
// ORIGINAL (preserved, not deleted — disabled by comment):                     r="1"
// ORIGINAL (preserved, not deleted — disabled by comment):                     fill="currentColor"
// ORIGINAL (preserved, not deleted — disabled by comment):                     opacity=".19"
// ORIGINAL (preserved, not deleted — disabled by comment):                   />
// ORIGINAL (preserved, not deleted — disabled by comment):                 </pattern>
// ORIGINAL (preserved, not deleted — disabled by comment):                 <filter
// ORIGINAL (preserved, not deleted — disabled by comment):                   id="agent-glow"
// ORIGINAL (preserved, not deleted — disabled by comment):                   x="-80%"
// ORIGINAL (preserved, not deleted — disabled by comment):                   y="-80%"
// ORIGINAL (preserved, not deleted — disabled by comment):                   width="260%"
// ORIGINAL (preserved, not deleted — disabled by comment):                   height="260%"
// ORIGINAL (preserved, not deleted — disabled by comment):                 >
// ORIGINAL (preserved, not deleted — disabled by comment):                   <feGaussianBlur stdDeviation="10" result="blur" />
// ORIGINAL (preserved, not deleted — disabled by comment):                   <feComposite in="SourceGraphic" in2="blur" operator="over" />
// ORIGINAL (preserved, not deleted — disabled by comment):                 </filter>
// ORIGINAL (preserved, not deleted — disabled by comment):                 <marker
// ORIGINAL (preserved, not deleted — disabled by comment):                   id="agent-arrow"
// ORIGINAL (preserved, not deleted — disabled by comment):                   markerWidth="7"
// ORIGINAL (preserved, not deleted — disabled by comment):                   markerHeight="7"
// ORIGINAL (preserved, not deleted — disabled by comment):                   refX="5"
// ORIGINAL (preserved, not deleted — disabled by comment):                   refY="3.5"
// ORIGINAL (preserved, not deleted — disabled by comment):                   orient="auto"
// ORIGINAL (preserved, not deleted — disabled by comment):                 >
// ORIGINAL (preserved, not deleted — disabled by comment):                   <path d="M0 0L6 3.5L0 7Z" fill="#748895" />
// ORIGINAL (preserved, not deleted — disabled by comment):                 </marker>
// ORIGINAL (preserved, not deleted — disabled by comment):               </defs>
// ORIGINAL (preserved, not deleted — disabled by comment):               <rect
// ORIGINAL (preserved, not deleted — disabled by comment):                 width={VIEW.width}
// ORIGINAL (preserved, not deleted — disabled by comment):                 height={VIEW.height}
// ORIGINAL (preserved, not deleted — disabled by comment):                 fill="url(#agent-grid)"
// ORIGINAL (preserved, not deleted — disabled by comment):               />
// ORIGINAL (preserved, not deleted — disabled by comment):               <g
// ORIGINAL (preserved, not deleted — disabled by comment):                 transform={`translate(${pan.x} ${pan.y}) translate(${VIEW.width / 2} ${VIEW.height / 2}) scale(${zoom}) translate(${-VIEW.width / 2} ${-VIEW.height / 2})`}
// ORIGINAL (preserved, not deleted — disabled by comment):               >
// ORIGINAL (preserved, not deleted — disabled by comment):                 <g className="agents-edges">
// ORIGINAL (preserved, not deleted — disabled by comment):                   {INITIAL_EDGES.map((edge) => {
// ORIGINAL (preserved, not deleted — disabled by comment):                     const from = positions[edge.source];
// ORIGINAL (preserved, not deleted — disabled by comment):                     const to = positions[edge.target];
// ORIGINAL (preserved, not deleted — disabled by comment):                     const highlighted =
// ORIGINAL (preserved, not deleted — disabled by comment):                       edge.source === selected.id ||
// ORIGINAL (preserved, not deleted — disabled by comment):                       edge.target === selected.id;
// ORIGINAL (preserved, not deleted — disabled by comment):                     const labelX = (from.x + to.x) / 2;
// ORIGINAL (preserved, not deleted — disabled by comment):                     const labelY = (from.y + to.y) / 2;
// ORIGINAL (preserved, not deleted — disabled by comment):                     return (
// ORIGINAL (preserved, not deleted — disabled by comment):                       <g
// ORIGINAL (preserved, not deleted — disabled by comment):                         key={`${edge.source}-${edge.target}`}
// ORIGINAL (preserved, not deleted — disabled by comment):                         className={
// ORIGINAL (preserved, not deleted — disabled by comment):                           highlighted
// ORIGINAL (preserved, not deleted — disabled by comment):                             ? "agents-edge highlighted"
// ORIGINAL (preserved, not deleted — disabled by comment):                             : "agents-edge"
// ORIGINAL (preserved, not deleted — disabled by comment):                         }
// ORIGINAL (preserved, not deleted — disabled by comment):                       >
// ORIGINAL (preserved, not deleted — disabled by comment):                         <path
// ORIGINAL (preserved, not deleted — disabled by comment):                           d={edgePath(from, to)}
// ORIGINAL (preserved, not deleted — disabled by comment):                           strokeWidth={1 + edge.strength * 1.3}
// ORIGINAL (preserved, not deleted — disabled by comment):                           markerEnd="url(#agent-arrow)"
// ORIGINAL (preserved, not deleted — disabled by comment):                         />
// ORIGINAL (preserved, not deleted — disabled by comment):                         <circle className="agents-edge-pulse" r="2.5">
// ORIGINAL (preserved, not deleted — disabled by comment):                           <animateMotion
// ORIGINAL (preserved, not deleted — disabled by comment):                             dur={`${4.8 + (1 - edge.strength) * 2}s`}
// ORIGINAL (preserved, not deleted — disabled by comment):                             repeatCount="indefinite"
// ORIGINAL (preserved, not deleted — disabled by comment):                             path={edgePath(from, to)}
// ORIGINAL (preserved, not deleted — disabled by comment):                           />
// ORIGINAL (preserved, not deleted — disabled by comment):                         </circle>
// ORIGINAL (preserved, not deleted — disabled by comment):                         {highlighted && (
// ORIGINAL (preserved, not deleted — disabled by comment):                           <text x={labelX} y={labelY - 9}>
// ORIGINAL (preserved, not deleted — disabled by comment):                             {edge.label}
// ORIGINAL (preserved, not deleted — disabled by comment):                           </text>
// ORIGINAL (preserved, not deleted — disabled by comment):                         )}
// ORIGINAL (preserved, not deleted — disabled by comment):                       </g>
// ORIGINAL (preserved, not deleted — disabled by comment):                     );
// ORIGINAL (preserved, not deleted — disabled by comment):                   })}
// ORIGINAL (preserved, not deleted — disabled by comment):                 </g>
// ORIGINAL (preserved, not deleted — disabled by comment):                 {agents.map((agent) => {
// ORIGINAL (preserved, not deleted — disabled by comment):                   const point = positions[agent.id];
// ORIGINAL (preserved, not deleted — disabled by comment):                   const isSelected = agent.id === selectedId;
// ORIGINAL (preserved, not deleted — disabled by comment):                   return (
// ORIGINAL (preserved, not deleted — disabled by comment):                     /* biome-ignore lint/a11y/useSemanticElements: SVG node geometry needs a keyboard-accessible button role. */
// ORIGINAL (preserved, not deleted — disabled by comment):                     <g
// ORIGINAL (preserved, not deleted — disabled by comment):                       key={agent.id}
// ORIGINAL (preserved, not deleted — disabled by comment):                       data-agent-id={agent.id}
// ORIGINAL (preserved, not deleted — disabled by comment):                       className={`agent-node ${agent.color}${isSelected ? " selected" : ""}`}
// ORIGINAL (preserved, not deleted — disabled by comment):                       transform={`translate(${point.x} ${point.y})`}
// ORIGINAL (preserved, not deleted — disabled by comment):                       role="button"
// ORIGINAL (preserved, not deleted — disabled by comment):                       tabIndex={0}
// ORIGINAL (preserved, not deleted — disabled by comment):                       aria-label={`${agent.name}, ${agent.status}, ${agent.tasks} demo tasks`}
// ORIGINAL (preserved, not deleted — disabled by comment):                       aria-pressed={isSelected}
// ORIGINAL (preserved, not deleted — disabled by comment):                       onClick={(event) => {
// ORIGINAL (preserved, not deleted — disabled by comment):                         event.stopPropagation();
// ORIGINAL (preserved, not deleted — disabled by comment):                         setSelectedId(agent.id);
// ORIGINAL (preserved, not deleted — disabled by comment):                       }}
// ORIGINAL (preserved, not deleted — disabled by comment):                       onKeyDown={(event) => {
// ORIGINAL (preserved, not deleted — disabled by comment):                         if (event.key === "Enter" || event.key === " ") {
// ORIGINAL (preserved, not deleted — disabled by comment):                           event.preventDefault();
// ORIGINAL (preserved, not deleted — disabled by comment):                           setSelectedId(agent.id);
// ORIGINAL (preserved, not deleted — disabled by comment):                         }
// ORIGINAL (preserved, not deleted — disabled by comment):                       }}
// ORIGINAL (preserved, not deleted — disabled by comment):                     >
// ORIGINAL (preserved, not deleted — disabled by comment):                       <circle className="agent-node-glow" r="48" />
// ORIGINAL (preserved, not deleted — disabled by comment):                       <rect
// ORIGINAL (preserved, not deleted — disabled by comment):                         className="agent-node-card"
// ORIGINAL (preserved, not deleted — disabled by comment):                         x="-82"
// ORIGINAL (preserved, not deleted — disabled by comment):                         y="-45"
// ORIGINAL (preserved, not deleted — disabled by comment):                         width="164"
// ORIGINAL (preserved, not deleted — disabled by comment):                         height="90"
// ORIGINAL (preserved, not deleted — disabled by comment):                         rx="13"
// ORIGINAL (preserved, not deleted — disabled by comment):                       />
// ORIGINAL (preserved, not deleted — disabled by comment):                       <circle
// ORIGINAL (preserved, not deleted — disabled by comment):                         className="agent-node-icon-bg"
// ORIGINAL (preserved, not deleted — disabled by comment):                         cx="-54"
// ORIGINAL (preserved, not deleted — disabled by comment):                         cy="-15"
// ORIGINAL (preserved, not deleted — disabled by comment):                         r="15"
// ORIGINAL (preserved, not deleted — disabled by comment):                       />
// ORIGINAL (preserved, not deleted — disabled by comment):                       <foreignObject
// ORIGINAL (preserved, not deleted — disabled by comment):                         x="-64"
// ORIGINAL (preserved, not deleted — disabled by comment):                         y="-25"
// ORIGINAL (preserved, not deleted — disabled by comment):                         width="20"
// ORIGINAL (preserved, not deleted — disabled by comment):                         height="20"
// ORIGINAL (preserved, not deleted — disabled by comment):                         className="agent-node-icon"
// ORIGINAL (preserved, not deleted — disabled by comment):                       >
// ORIGINAL (preserved, not deleted — disabled by comment):                         <div className="agent-node-icon-inner">
// ORIGINAL (preserved, not deleted — disabled by comment):                           <AgentGlyph icon={agent.icon} />
// ORIGINAL (preserved, not deleted — disabled by comment):                         </div>
// ORIGINAL (preserved, not deleted — disabled by comment):                       </foreignObject>
// ORIGINAL (preserved, not deleted — disabled by comment):                       <circle
// ORIGINAL (preserved, not deleted — disabled by comment):                         className={`agent-node-status ${agent.status}`}
// ORIGINAL (preserved, not deleted — disabled by comment):                         cx="63"
// ORIGINAL (preserved, not deleted — disabled by comment):                         cy="-29"
// ORIGINAL (preserved, not deleted — disabled by comment):                         r="4"
// ORIGINAL (preserved, not deleted — disabled by comment):                       />
// ORIGINAL (preserved, not deleted — disabled by comment):                       <text className="agent-node-vendor" x="-31" y="-11">
// ORIGINAL (preserved, not deleted — disabled by comment):                         {agent.kind.toUpperCase()}
// ORIGINAL (preserved, not deleted — disabled by comment):                       </text>
// ORIGINAL (preserved, not deleted — disabled by comment):                       <text className="agent-node-name" x="-65" y="14">
// ORIGINAL (preserved, not deleted — disabled by comment):                         {agent.name}
// ORIGINAL (preserved, not deleted — disabled by comment):                       </text>
// ORIGINAL (preserved, not deleted — disabled by comment):                       <text className="agent-node-meta" x="-65" y="32">
// ORIGINAL (preserved, not deleted — disabled by comment):                         {agent.tasks} TASK{agent.tasks === 1 ? "" : "S"} ·{" "}
// ORIGINAL (preserved, not deleted — disabled by comment):                         {agent.status.toUpperCase()}
// ORIGINAL (preserved, not deleted — disabled by comment):                       </text>
// ORIGINAL (preserved, not deleted — disabled by comment):                     </g>
// ORIGINAL (preserved, not deleted — disabled by comment):                   );
// ORIGINAL (preserved, not deleted — disabled by comment):                 })}
// ORIGINAL (preserved, not deleted — disabled by comment):               </g>
// ORIGINAL (preserved, not deleted — disabled by comment):               <text className="agents-canvas-hint" x="22" y="548">
// ORIGINAL (preserved, not deleted — disabled by comment):                 DRAG TO REPOSITION · WHEEL TO ZOOM · SELECT A NODE FOR DETAILS
// ORIGINAL (preserved, not deleted — disabled by comment):               </text>
// ORIGINAL (preserved, not deleted — disabled by comment):             </svg>
// ORIGINAL (preserved, not deleted — disabled by comment):             <fieldset className="agents-canvas-controls">
// ORIGINAL (preserved, not deleted — disabled by comment):               <legend>Canvas controls</legend>
// ORIGINAL (preserved, not deleted — disabled by comment):               <button
// ORIGINAL (preserved, not deleted — disabled by comment):                 type="button"
// ORIGINAL (preserved, not deleted — disabled by comment):                 aria-label="Pan left"
// ORIGINAL (preserved, not deleted — disabled by comment):                 onClick={() => {
// ORIGINAL (preserved, not deleted — disabled by comment):                   const next = { ...pan, x: pan.x + 24 };
// ORIGINAL (preserved, not deleted — disabled by comment):                   setPan(next);
// ORIGINAL (preserved, not deleted — disabled by comment):                   updateCamera(next);
// ORIGINAL (preserved, not deleted — disabled by comment):                 }}
// ORIGINAL (preserved, not deleted — disabled by comment):               >
// ORIGINAL (preserved, not deleted — disabled by comment):                 <ArrowLeft size={14} />
// ORIGINAL (preserved, not deleted — disabled by comment):               </button>
// ORIGINAL (preserved, not deleted — disabled by comment):               <button
// ORIGINAL (preserved, not deleted — disabled by comment):                 type="button"
// ORIGINAL (preserved, not deleted — disabled by comment):                 aria-label="Pan right"
// ORIGINAL (preserved, not deleted — disabled by comment):                 onClick={() => {
// ORIGINAL (preserved, not deleted — disabled by comment):                   const next = { ...pan, x: pan.x - 24 };
// ORIGINAL (preserved, not deleted — disabled by comment):                   setPan(next);
// ORIGINAL (preserved, not deleted — disabled by comment):                   updateCamera(next);
// ORIGINAL (preserved, not deleted — disabled by comment):                 }}
// ORIGINAL (preserved, not deleted — disabled by comment):               >
// ORIGINAL (preserved, not deleted — disabled by comment):                 <ArrowRight size={14} />
// ORIGINAL (preserved, not deleted — disabled by comment):               </button>
// ORIGINAL (preserved, not deleted — disabled by comment):               <button
// ORIGINAL (preserved, not deleted — disabled by comment):                 type="button"
// ORIGINAL (preserved, not deleted — disabled by comment):                 aria-label="Pan up"
// ORIGINAL (preserved, not deleted — disabled by comment):                 onClick={() => {
// ORIGINAL (preserved, not deleted — disabled by comment):                   const next = { ...pan, y: pan.y + 24 };
// ORIGINAL (preserved, not deleted — disabled by comment):                   setPan(next);
// ORIGINAL (preserved, not deleted — disabled by comment):                   updateCamera(next);
// ORIGINAL (preserved, not deleted — disabled by comment):                 }}
// ORIGINAL (preserved, not deleted — disabled by comment):               >
// ORIGINAL (preserved, not deleted — disabled by comment):                 <ArrowUp size={14} />
// ORIGINAL (preserved, not deleted — disabled by comment):               </button>
// ORIGINAL (preserved, not deleted — disabled by comment):               <button
// ORIGINAL (preserved, not deleted — disabled by comment):                 type="button"
// ORIGINAL (preserved, not deleted — disabled by comment):                 aria-label="Pan down"
// ORIGINAL (preserved, not deleted — disabled by comment):                 onClick={() => {
// ORIGINAL (preserved, not deleted — disabled by comment):                   const next = { ...pan, y: pan.y - 24 };
// ORIGINAL (preserved, not deleted — disabled by comment):                   setPan(next);
// ORIGINAL (preserved, not deleted — disabled by comment):                   updateCamera(next);
// ORIGINAL (preserved, not deleted — disabled by comment):                 }}
// ORIGINAL (preserved, not deleted — disabled by comment):               >
// ORIGINAL (preserved, not deleted — disabled by comment):                 <ArrowDown size={14} />
// ORIGINAL (preserved, not deleted — disabled by comment):               </button>
// ORIGINAL (preserved, not deleted — disabled by comment):               <button
// ORIGINAL (preserved, not deleted — disabled by comment):                 type="button"
// ORIGINAL (preserved, not deleted — disabled by comment):                 aria-label="Zoom out"
// ORIGINAL (preserved, not deleted — disabled by comment):                 onClick={() =>
// ORIGINAL (preserved, not deleted — disabled by comment):                   setZoom((value) => {
// ORIGINAL (preserved, not deleted — disabled by comment):                     const next = Math.max(0.65, value - 0.1);
// ORIGINAL (preserved, not deleted — disabled by comment):                     updateCamera({ zoom: next });
// ORIGINAL (preserved, not deleted — disabled by comment):                     return next;
// ORIGINAL (preserved, not deleted — disabled by comment):                   })
// ORIGINAL (preserved, not deleted — disabled by comment):                 }
// ORIGINAL (preserved, not deleted — disabled by comment):               >
// ORIGINAL (preserved, not deleted — disabled by comment):                 <Minus size={15} />
// ORIGINAL (preserved, not deleted — disabled by comment):               </button>
// ORIGINAL (preserved, not deleted — disabled by comment):               <span aria-live="polite">{Math.round(zoom * 100)}%</span>
// ORIGINAL (preserved, not deleted — disabled by comment):               <button
// ORIGINAL (preserved, not deleted — disabled by comment):                 type="button"
// ORIGINAL (preserved, not deleted — disabled by comment):                 aria-label="Zoom in"
// ORIGINAL (preserved, not deleted — disabled by comment):                 onClick={() =>
// ORIGINAL (preserved, not deleted — disabled by comment):                   setZoom((value) => {
// ORIGINAL (preserved, not deleted — disabled by comment):                     const next = Math.min(1.8, value + 0.1);
// ORIGINAL (preserved, not deleted — disabled by comment):                     updateCamera({ zoom: next });
// ORIGINAL (preserved, not deleted — disabled by comment):                     return next;
// ORIGINAL (preserved, not deleted — disabled by comment):                   })
// ORIGINAL (preserved, not deleted — disabled by comment):                 }
// ORIGINAL (preserved, not deleted — disabled by comment):               >
// ORIGINAL (preserved, not deleted — disabled by comment):                 <Plus size={15} />
// ORIGINAL (preserved, not deleted — disabled by comment):               </button>
// ORIGINAL (preserved, not deleted — disabled by comment):               <span className="agents-control-divider" />
// ORIGINAL (preserved, not deleted — disabled by comment):               <button
// ORIGINAL (preserved, not deleted — disabled by comment):                 type="button"
// ORIGINAL (preserved, not deleted — disabled by comment):                 aria-label="Reset graph view"
// ORIGINAL (preserved, not deleted — disabled by comment):                 onClick={() => {
// ORIGINAL (preserved, not deleted — disabled by comment):                   setZoom(1);
// ORIGINAL (preserved, not deleted — disabled by comment):                   setPan({ x: 0, y: 0 });
// ORIGINAL (preserved, not deleted — disabled by comment):                   layoutEdited.current = true;
// ORIGINAL (preserved, not deleted — disabled by comment):                   setLayout((value) => ({
// ORIGINAL (preserved, not deleted — disabled by comment):                     ...value,
// ORIGINAL (preserved, not deleted — disabled by comment):                     positions: {
// ORIGINAL (preserved, not deleted — disabled by comment):                       ...value.positions,
// ORIGINAL (preserved, not deleted — disabled by comment):                       [mode]: positionsFor(mode),
// ORIGINAL (preserved, not deleted — disabled by comment):                     },
// ORIGINAL (preserved, not deleted — disabled by comment):                     cameras: {
// ORIGINAL (preserved, not deleted — disabled by comment):                       ...value.cameras,
// ORIGINAL (preserved, not deleted — disabled by comment):                       [mode]: { x: 0, y: 0, zoom: 1 },
// ORIGINAL (preserved, not deleted — disabled by comment):                     },
// ORIGINAL (preserved, not deleted — disabled by comment):                   }));
// ORIGINAL (preserved, not deleted — disabled by comment):                 }}
// ORIGINAL (preserved, not deleted — disabled by comment):               >
// ORIGINAL (preserved, not deleted — disabled by comment):                 <RotateCcw size={14} />
// ORIGINAL (preserved, not deleted — disabled by comment):               </button>
// ORIGINAL (preserved, not deleted — disabled by comment):             </fieldset>
// ORIGINAL (preserved, not deleted — disabled by comment):           </section>
// ORIGINAL (preserved, not deleted — disabled by comment):           <div className="agents-legend">
// ORIGINAL (preserved, not deleted — disabled by comment):             <span>
// ORIGINAL (preserved, not deleted — disabled by comment):               <i className="active" /> Active
// ORIGINAL (preserved, not deleted — disabled by comment):             </span>
// ORIGINAL (preserved, not deleted — disabled by comment):             <span>
// ORIGINAL (preserved, not deleted — disabled by comment):               <i className="idle" /> Idle
// ORIGINAL (preserved, not deleted — disabled by comment):             </span>
// ORIGINAL (preserved, not deleted — disabled by comment):             <span>
// ORIGINAL (preserved, not deleted — disabled by comment):               <i className="attention" /> Needs attention
// ORIGINAL (preserved, not deleted — disabled by comment):             </span>
// ORIGINAL (preserved, not deleted — disabled by comment):             <span className="agents-legend-note">
// ORIGINAL (preserved, not deleted — disabled by comment):               Lines show illustrative adapter relationships
// ORIGINAL (preserved, not deleted — disabled by comment):             </span>
// ORIGINAL (preserved, not deleted — disabled by comment):           </div>
// ORIGINAL (preserved, not deleted — disabled by comment):         </section>
// ORIGINAL (preserved, not deleted — disabled by comment):
// ORIGINAL (preserved, not deleted — disabled by comment):         <aside className="agents-inspector" aria-label="Selected agent details">
// ORIGINAL (preserved, not deleted — disabled by comment):           <div className="agents-inspector-head">
// ORIGINAL (preserved, not deleted — disabled by comment):             <div>
// ORIGINAL (preserved, not deleted — disabled by comment):               <span className="agents-inspector-kicker">ADAPTER INSPECTOR</span>
// ORIGINAL (preserved, not deleted — disabled by comment):               <span className="agents-inspector-count">
// ORIGINAL (preserved, not deleted — disabled by comment):                 {String(
// ORIGINAL (preserved, not deleted — disabled by comment):                   agents.findIndex((agent) => agent.id === selected.id) + 1,
// ORIGINAL (preserved, not deleted — disabled by comment):                 ).padStart(2, "0")}{" "}
// ORIGINAL (preserved, not deleted — disabled by comment):                 / {String(agents.length).padStart(2, "0")}
// ORIGINAL (preserved, not deleted — disabled by comment):               </span>
// ORIGINAL (preserved, not deleted — disabled by comment):             </div>
// ORIGINAL (preserved, not deleted — disabled by comment):             <span className={`agents-status-chip ${selected.status}`}>
// ORIGINAL (preserved, not deleted — disabled by comment):               <i />
// ORIGINAL (preserved, not deleted — disabled by comment):               {selected.status}
// ORIGINAL (preserved, not deleted — disabled by comment):             </span>
// ORIGINAL (preserved, not deleted — disabled by comment):           </div>
// ORIGINAL (preserved, not deleted — disabled by comment):           <div className={`agents-profile-mark ${selected.color}`}>
// ORIGINAL (preserved, not deleted — disabled by comment):             <AgentGlyph icon={selected.icon} />
// ORIGINAL (preserved, not deleted — disabled by comment):           </div>
// ORIGINAL (preserved, not deleted — disabled by comment):           <h2>{selected.name}</h2>
// ORIGINAL (preserved, not deleted — disabled by comment):           <p className="agents-profile-vendor">
// ORIGINAL (preserved, not deleted — disabled by comment):             {selected.vendor} <span>·</span> {selected.kind.toUpperCase()} ·{" "}
// ORIGINAL (preserved, not deleted — disabled by comment):             {selected.role}
// ORIGINAL (preserved, not deleted — disabled by comment):           </p>
// ORIGINAL (preserved, not deleted — disabled by comment):           <div className="agents-model-box">
// ORIGINAL (preserved, not deleted — disabled by comment):             <span>MODEL / ADAPTER</span>
// ORIGINAL (preserved, not deleted — disabled by comment):             <strong>{selected.model}</strong>
// ORIGINAL (preserved, not deleted — disabled by comment):             <small>Configured for demonstration only</small>
// ORIGINAL (preserved, not deleted — disabled by comment):           </div>
// ORIGINAL (preserved, not deleted — disabled by comment):           <div className="agents-inspector-metrics">
// ORIGINAL (preserved, not deleted — disabled by comment):             <div>
// ORIGINAL (preserved, not deleted — disabled by comment):               <span>DEMO TASKS</span>
// ORIGINAL (preserved, not deleted — disabled by comment):               <strong>{String(selected.tasks).padStart(2, "0")}</strong>
// ORIGINAL (preserved, not deleted — disabled by comment):             </div>
// ORIGINAL (preserved, not deleted — disabled by comment):             <div>
// ORIGINAL (preserved, not deleted — disabled by comment):               <span>LATENCY SAMPLE</span>
// ORIGINAL (preserved, not deleted — disabled by comment):               <strong>{selected.latency}</strong>
// ORIGINAL (preserved, not deleted — disabled by comment):             </div>
// ORIGINAL (preserved, not deleted — disabled by comment):           </div>
// ORIGINAL (preserved, not deleted — disabled by comment):           <div className="agents-links-section">
// ORIGINAL (preserved, not deleted — disabled by comment):             <div className="agents-section-heading">
// ORIGINAL (preserved, not deleted — disabled by comment):               <span>CONNECTED TO</span>
// ORIGINAL (preserved, not deleted — disabled by comment):               <span>{String(selectedEdges.length).padStart(2, "0")}</span>
// ORIGINAL (preserved, not deleted — disabled by comment):             </div>
// ORIGINAL (preserved, not deleted — disabled by comment):             {selectedEdges.length ? (
// ORIGINAL (preserved, not deleted — disabled by comment):               selectedEdges.map((edge) => {
// ORIGINAL (preserved, not deleted — disabled by comment):                 const otherId =
// ORIGINAL (preserved, not deleted — disabled by comment):                   edge.source === selected.id ? edge.target : edge.source;
// ORIGINAL (preserved, not deleted — disabled by comment):                 const other = agents.find((agent) => agent.id === otherId);
// ORIGINAL (preserved, not deleted — disabled by comment):                 if (!other) return null;
// ORIGINAL (preserved, not deleted — disabled by comment):                 return (
// ORIGINAL (preserved, not deleted — disabled by comment):                   <button
// ORIGINAL (preserved, not deleted — disabled by comment):                     type="button"
// ORIGINAL (preserved, not deleted — disabled by comment):                     key={`${edge.source}-${edge.target}`}
// ORIGINAL (preserved, not deleted — disabled by comment):                     className="agents-connected-row"
// ORIGINAL (preserved, not deleted — disabled by comment):                     onClick={() => setSelectedId(other.id)}
// ORIGINAL (preserved, not deleted — disabled by comment):                   >
// ORIGINAL (preserved, not deleted — disabled by comment):                     <span className={`agents-connected-dot ${other.color}`} />
// ORIGINAL (preserved, not deleted — disabled by comment):                     <span>
// ORIGINAL (preserved, not deleted — disabled by comment):                       {other.name}
// ORIGINAL (preserved, not deleted — disabled by comment):                       <small>{edge.label}</small>
// ORIGINAL (preserved, not deleted — disabled by comment):                     </span>
// ORIGINAL (preserved, not deleted — disabled by comment):                     <ChevronDown size={14} className="agents-connected-arrow" />
// ORIGINAL (preserved, not deleted — disabled by comment):                   </button>
// ORIGINAL (preserved, not deleted — disabled by comment):                 );
// ORIGINAL (preserved, not deleted — disabled by comment):               })
// ORIGINAL (preserved, not deleted — disabled by comment):             ) : (
// ORIGINAL (preserved, not deleted — disabled by comment):               <p className="agents-no-links">
// ORIGINAL (preserved, not deleted — disabled by comment):                 No demo connections are shown for this adapter.
// ORIGINAL (preserved, not deleted — disabled by comment):               </p>
// ORIGINAL (preserved, not deleted — disabled by comment):             )}
// ORIGINAL (preserved, not deleted — disabled by comment):           </div>
// ORIGINAL (preserved, not deleted — disabled by comment):           <section className="agents-directory" aria-label="All graph entities">
// ORIGINAL (preserved, not deleted — disabled by comment):             <div className="agents-section-heading">
// ORIGINAL (preserved, not deleted — disabled by comment):               <span>GRAPH ENTITIES</span>
// ORIGINAL (preserved, not deleted — disabled by comment):               <span>{String(agents.length).padStart(2, "0")}</span>
// ORIGINAL (preserved, not deleted — disabled by comment):             </div>
// ORIGINAL (preserved, not deleted — disabled by comment):             {agents.map((agent) => (
// ORIGINAL (preserved, not deleted — disabled by comment):               <button
// ORIGINAL (preserved, not deleted — disabled by comment):                 key={agent.id}
// ORIGINAL (preserved, not deleted — disabled by comment):                 type="button"
// ORIGINAL (preserved, not deleted — disabled by comment):                 aria-pressed={agent.id === selectedId}
// ORIGINAL (preserved, not deleted — disabled by comment):                 onClick={() => setSelectedId(agent.id)}
// ORIGINAL (preserved, not deleted — disabled by comment):               >
// ORIGINAL (preserved, not deleted — disabled by comment):                 <span className={`agents-connected-dot ${agent.color}`} />
// ORIGINAL (preserved, not deleted — disabled by comment):                 <span>
// ORIGINAL (preserved, not deleted — disabled by comment):                   {agent.name}
// ORIGINAL (preserved, not deleted — disabled by comment):                   <small>{agent.kind}</small>
// ORIGINAL (preserved, not deleted — disabled by comment):                 </span>
// ORIGINAL (preserved, not deleted — disabled by comment):               </button>
// ORIGINAL (preserved, not deleted — disabled by comment):             ))}
// ORIGINAL (preserved, not deleted — disabled by comment):           </section>
// ORIGINAL (preserved, not deleted — disabled by comment):           <button
// ORIGINAL (preserved, not deleted — disabled by comment):             type="button"
// ORIGINAL (preserved, not deleted — disabled by comment):             className="agents-demo-action"
// ORIGINAL (preserved, not deleted — disabled by comment):             onClick={toggleAgentStatus}
// ORIGINAL (preserved, not deleted — disabled by comment):           >
// ORIGINAL (preserved, not deleted — disabled by comment):             <Activity size={14} />
// ORIGINAL (preserved, not deleted — disabled by comment):             {selected.status === "paused"
// ORIGINAL (preserved, not deleted — disabled by comment):               ? "Resume demo adapter"
// ORIGINAL (preserved, not deleted — disabled by comment):               : "Pause demo adapter"}
// ORIGINAL (preserved, not deleted — disabled by comment):           </button>
// ORIGINAL (preserved, not deleted — disabled by comment):           <p className="agents-inspector-note">
// ORIGINAL (preserved, not deleted — disabled by comment):             Status changes are temporary and remain in this page session only.
// ORIGINAL (preserved, not deleted — disabled by comment):             No software is installed or contacted.
// ORIGINAL (preserved, not deleted — disabled by comment):           </p>
// ORIGINAL (preserved, not deleted — disabled by comment):         </aside>
// ORIGINAL (preserved, not deleted — disabled by comment):       </div>
// ORIGINAL (preserved, not deleted — disabled by comment):       <div className="agents-footer-note">
// ORIGINAL (preserved, not deleted — disabled by comment):         <Cpu size={14} /> Sample graph data only <span />{" "}
// ORIGINAL (preserved, not deleted — disabled by comment):         <button
// ORIGINAL (preserved, not deleted — disabled by comment):           type="button"
// ORIGINAL (preserved, not deleted — disabled by comment):           onClick={() => setLive((value) => !value)}
// ORIGINAL (preserved, not deleted — disabled by comment):           aria-pressed={live}
// ORIGINAL (preserved, not deleted — disabled by comment):         >
// ORIGINAL (preserved, not deleted — disabled by comment):           Motion {live ? "on" : "off"}
// ORIGINAL (preserved, not deleted — disabled by comment):         </button>
// ORIGINAL (preserved, not deleted — disabled by comment):         <small>Decorative connection motion can be switched off.</small>
// ORIGINAL (preserved, not deleted — disabled by comment):       </div>
// ORIGINAL (preserved, not deleted — disabled by comment):     </main>
// ORIGINAL (preserved, not deleted — disabled by comment):   );
// ORIGINAL (preserved, not deleted — disabled by comment): }
