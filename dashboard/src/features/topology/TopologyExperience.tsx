import {
  applyNodeChanges,
  Background,
  Controls,
  type Edge,
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { NodeProps } from "@xyflow/react";
import {
  Activity,
  Bot,
  Box,
  CircleHelp,
  Cpu,
  Database,
  Layers3,
  Lightbulb,
  MoreHorizontal,
  Network,
  Search,
  Send,
  Server,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import CountUp from "../../components/react-bits/text/CountUp";
import { useDashboardStore } from "../../state/useDashboardStore";
import { ZyrixCore } from "../zyrix-core/ZyrixCore";
import {
  readTopologyPositions,
  writeTopologyPositions,
} from "./topologyLayout";
import {
  buildTopologyNodes,
  type MachineNodeData,
  SAMPLE_MACHINES,
  type SampleMachine,
  type TopologyFlowNode,
  type TopologySelection,
  type WorkloadNodeData,
} from "./topologySample";
import "./TopologyExperience.css";

type InspectorTab = "Overview" | "Services" | "Containers" | "VMs" | "Logs";
const INSPECTOR_TABS: InspectorTab[] = [
  "Overview",
  "Services",
  "Containers",
  "VMs",
  "Logs",
];
const ICONS = {
  Agent: Bot,
  AI: Sparkles,
  Docker: Box,
  VM: Server,
  Service: Activity,
};

function CoreNode(_props: NodeProps<TopologyFlowNode>) {
  const qualitySetting = useDashboardStore((state) => state.visualQuality);
  const performanceMode = useDashboardStore((state) => state.performanceMode);
  const demoMotion = useDashboardStore((state) => state.demoMotion);
  const quality =
    performanceMode || qualitySetting === "performance"
      ? "performance"
      : qualitySetting === "high"
        ? "cinematic"
        : "standard";
  return (
    <div className="tx-core-node">
      <Handle type="source" position={Position.Right} className="tx-handle" />
      <ZyrixCore
        quality={quality}
        paused={performanceMode || !demoMotion}
        className="tx-core-visual"
      />
      <small>ORCHESTRATOR · SAMPLE</small>
    </div>
  );
}

function MachineNode({ data }: NodeProps<TopologyFlowNode>) {
  const { machine, selected } = data as MachineNodeData;
  return (
    <div className={`tx-machine-node${selected ? " is-selected" : ""}`}>
      <Handle type="target" position={Position.Left} className="tx-handle" />
      <div className="tx-server-glyph">
        <Server size={25} strokeWidth={1.4} />
      </div>
      <div className="tx-machine-info">
        <strong>{machine.name}</strong>
        <span className="tx-online">
          <i /> Online
        </span>
        <small>
          <Network size={12} /> {machine.services} services
        </small>
        <small>
          <Layers3 size={12} /> {machine.vmCount} VMs
        </small>
        <small>
          <Box size={12} /> {machine.containerCount} containers
        </small>
      </div>
      <div
        className="tx-cpu-ring"
        style={{ "--tx-progress": `${machine.cpu}%` } as React.CSSProperties}
      >
        <span>{machine.cpu}%</span>
        <small>CPU</small>
      </div>
      <span className="tx-machine-sr">Select {machine.name}</span>
      <Handle type="source" position={Position.Right} className="tx-handle" />
    </div>
  );
}

function WorkloadNode({ data }: NodeProps<TopologyFlowNode>) {
  const { workload, selected } = data as WorkloadNodeData;
  const Icon = ICONS[workload.kind];
  return (
    <div className={`tx-workload-node${selected ? " is-selected" : ""}`}>
      <Handle type="target" position={Position.Left} className="tx-handle" />
      <span className={`tx-workload-icon tx-${workload.kind.toLowerCase()}`}>
        <Icon size={13} />
      </span>
      <strong>{workload.name}</strong>
      <span className="tx-online tx-workload-status">
        <i /> {workload.status}
      </span>
      <span className="tx-kind-pill">{workload.kind}</span>
      <Handle type="source" position={Position.Right} className="tx-handle" />
    </div>
  );
}

const NODE_TYPES = {
  core: CoreNode,
  machine: MachineNode,
  workload: WorkloadNode,
};
const INITIAL_EDGES: Edge[] = SAMPLE_MACHINES.flatMap((machine) => [
  {
    id: `core-${machine.id}`,
    source: "zyrix-core",
    target: machine.id,
    type: "default",
    animated: false,
    className:
      machine.id === "machine-03" ? "tx-edge tx-edge-active" : "tx-edge",
    style:
      machine.id === "machine-03"
        ? { stroke: "#b19ae9", strokeWidth: 1.8, opacity: 1 }
        : { stroke: "#8a7cbd", strokeWidth: 1, opacity: 0.32 },
  },
  ...machine.workloads.map((workload) => ({
    id: `${machine.id}-${workload.id}`,
    source: machine.id,
    target: `workload-${workload.id}`,
    type: "default",
    animated: false,
    className:
      machine.id === "machine-03" ? "tx-edge tx-edge-active" : "tx-edge",
    style:
      machine.id === "machine-03"
        ? { stroke: "#b19ae9", strokeWidth: 1.8, opacity: 1 }
        : { stroke: "#8a7cbd", strokeWidth: 1, opacity: 0.32 },
  })),
]);

function Ring({
  value,
  color = "purple",
  label,
}: {
  value: number;
  color?: string;
  label: string;
}) {
  return (
    <div
      className={`tx-ring tx-ring-${color}`}
      style={{ "--tx-progress": `${value}%` } as React.CSSProperties}
    >
      <span>
        <CountUp from={0} to={value} suffix="%" duration={0.85} />
      </span>
      <small>{label}</small>
    </div>
  );
}

function Chart() {
  const cpu = [28, 40, 36, 48, 44, 58, 52, 64, 57, 69, 63, 77, 65];
  const memory = [30, 35, 33, 44, 39, 48, 44, 55, 50, 60, 54, 63, 58];
  const point = (values: number[]) =>
    values
      .map((v, i) => `${(i / (values.length - 1)) * 100},${100 - v}`)
      .join(" ");
  return (
    <div
      className="tx-chart"
      role="img"
      aria-label="Sample CPU and memory history over the last 24 hours"
    >
      <div className="tx-chart-legend">
        <span>
          <i /> CPU
        </span>
        <span>
          <i /> Memory
        </span>
        <span>
          <i /> Disk I/O
        </span>
        <span>
          <i /> Network
        </span>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {[20, 45, 70, 95].map((y) => (
          <line
            key={y}
            x1="0"
            x2="100"
            y1={y}
            y2={y}
            className="tx-chart-grid"
          />
        ))}
        <polyline
          points={point(cpu)}
          className="tx-chart-cpu"
          pathLength="1000"
        />
        <polyline
          points={point(memory)}
          className="tx-chart-memory"
          pathLength="1000"
        />
        <polyline
          points="0,89 10,86 20,90 30,82 40,87 50,83 60,85 70,77 80,84 90,79 100,81"
          className="tx-chart-disk"
          pathLength="1000"
        />
        <polyline
          points="0,94 12,90 24,93 36,91 48,95 60,89 72,92 84,88 100,91"
          className="tx-chart-network"
          pathLength="1000"
        />
      </svg>
      <div className="tx-chart-labels">
        <span>00:00</span>
        <span>04:00</span>
        <span>08:00</span>
        <span>12:00</span>
        <span>16:00</span>
        <span>20:00</span>
      </div>
    </div>
  );
}

function WorkloadRows({ machine }: { machine: SampleMachine }) {
  return (
    <div className="tx-row-list">
      {machine.workloads.map((workload) => {
        const Icon = ICONS[workload.kind];
        return (
          <div className="tx-detail-row" key={workload.id}>
            <span
              className={`tx-workload-icon tx-${workload.kind.toLowerCase()}`}
            >
              <Icon size={13} />
            </span>
            <strong>{workload.name}</strong>
            <span className="tx-online">
              <i /> Running
            </span>
            <small>{workload.version ?? workload.detail}</small>
            <small>{workload.memory ?? "—"}</small>
            <span className="tx-kind-pill">{workload.kind}</span>
          </div>
        );
      })}
    </div>
  );
}

function Inspector({
  selection,
  onClose,
  onSelect,
  tab,
  setTab,
}: {
  selection: TopologySelection;
  onClose: () => void;
  onSelect: (selection: TopologySelection) => void;
  tab: InspectorTab;
  setTab: (tab: InspectorTab) => void;
}) {
  const machine =
    SAMPLE_MACHINES.find((item) => item.id === selection.id) ??
    SAMPLE_MACHINES.find((item) =>
      item.workloads.some((workload) => workload.id === selection.id),
    ) ??
    SAMPLE_MACHINES[2];
  const workload = machine.workloads.find((item) => item.id === selection.id);
  const [prompt, setPrompt] = useState("");
  const [showUnavailable, setShowUnavailable] = useState(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  return (
    <aside className="tx-inspector" aria-label="Selected topology item details">
      <header className="tx-inspector-head">
        <div className="tx-inspector-server">
          <Server size={27} />
        </div>
        <div className="tx-inspector-title">
          <h2>
            {selection.kind === "core"
              ? "Z.Y.R.I.X"
              : (workload?.name ?? machine.name)}
          </h2>
          <span className="tx-online">
            <i /> {selection.kind === "core" ? "Local demo" : "Online · sample"}
          </span>
          <p>
            {selection.kind === "core"
              ? "OpenCluster AI Orchestrator"
              : `${machine.name === "PC-03" ? "Worker Node" : "Sample Node"} · ${machine.host} · ${machine.os}`}
          </p>
        </div>
        <button
          type="button"
          className="tx-icon-button"
          onClick={onClose}
          aria-label="Close inspector"
        >
          <X size={16} />
        </button>
      </header>
      <fieldset className="tx-tabs">
        <legend className="sr-only">Machine details</legend>
        {INSPECTOR_TABS.map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={tab === item}
            disabled={selection.kind === "core"}
            onClick={() => setTab(item)}
          >
            {item}
            {item === "Services"
              ? ` (${machine.workloads.length})`
              : item === "Containers"
                ? ` (${machine.containerCount})`
                : item === "VMs"
                  ? ` (${machine.vmCount})`
                  : ""}
          </button>
        ))}
      </fieldset>
      <div className="tx-inspector-content" key={`${selection.id}-${tab}`}>
        {selection.kind === "core" && (
          <section className="tx-panel tx-core-inspector-note">
            <Sparkles size={20} />
            <h3>Local visualization core</h3>
            <p>
              Z.Y.R.I.X is shown here as a sample particle scene. No live
              orchestration or AI service is connected.
            </p>
            <span>
              Choose a machine in the graph to inspect its illustrative sample
              details.
            </span>
          </section>
        )}
        {selection.kind !== "core" && tab === "Overview" && (
          <>
            <div className="tx-metric-grid">
              <div className="tx-metric">
                <Ring value={machine.cpu} label="CPU" />
                <span>CPU Usage</span>
              </div>
              <div className="tx-metric">
                <Ring value={machine.memory} color="cyan" label="RAM" />
                <span>Memory</span>
              </div>
              <div className="tx-metric">
                <Database size={20} />
                <strong>{machine.storage}</strong>
                <span>Storage</span>
              </div>
              <div className="tx-metric">
                <Activity size={20} />
                <strong>{machine.temperature}°C</strong>
                <span>Temperature</span>
              </div>
            </div>
            <section className="tx-panel">
              <header>
                <h3>Resource Usage</h3>
                <span className="tx-select">Last 24h</span>
              </header>
              <Chart />
            </section>
            <section className="tx-panel">
              <header>
                <h3>Active Services ({machine.workloads.length})</h3>
                <button
                  type="button"
                  className="tx-select"
                  onClick={() => setTab("Services")}
                >
                  All Services
                </button>
              </header>
              <WorkloadRows machine={machine} />
            </section>
            <div className="tx-lower-grid">
              <section className="tx-panel">
                <header>
                  <h3>Virtual Machines ({machine.vms.length})</h3>
                  <button
                    type="button"
                    className="tx-select"
                    onClick={() => setTab("VMs")}
                  >
                    View
                  </button>
                </header>
                {machine.vms.map((vm) => (
                  <p className="tx-compact-row" key={vm.name}>
                    <Server size={14} />
                    <span>
                      <b>{vm.name}</b>
                      <small>
                        {vm.cpu} · {vm.memory}
                      </small>
                    </span>
                    <i className="tx-status-dot" />
                  </p>
                ))}
              </section>
              <section className="tx-panel">
                <header>
                  <h3>Containers ({machine.containers.length})</h3>
                  <button
                    type="button"
                    className="tx-select"
                    onClick={() => setTab("Containers")}
                  >
                    View
                  </button>
                </header>
                {machine.containers.slice(0, 4).map((name) => (
                  <p className="tx-compact-row" key={name}>
                    <Box size={14} />
                    <span>
                      <b>{name}</b>
                    </span>
                    <i className="tx-status-dot" />
                  </p>
                ))}
              </section>
            </div>
            <section className="tx-recommendation">
              <Lightbulb size={17} />
              <div>
                <h3>Sample insight</h3>
                <p>{machine.recommendation}</p>
              </div>
            </section>
          </>
        )}
        {selection.kind !== "core" && tab === "Services" && (
          <section className="tx-panel">
            <header>
              <h3>Services & Workloads</h3>
              <span className="tx-sample-tag">SAMPLE</span>
            </header>
            <WorkloadRows machine={machine} />
          </section>
        )}
        {selection.kind !== "core" && tab === "Containers" && (
          <section className="tx-panel">
            <header>
              <h3>Containers ({machine.containers.length})</h3>
              <span className="tx-sample-tag">SAMPLE</span>
            </header>
            {machine.containers.map((name) => (
              <p className="tx-compact-row" key={name}>
                <Box size={15} />
                <span>
                  <b>{name}</b>
                  <small>Container inventory is illustrative</small>
                </span>
                <i className="tx-status-dot" />
              </p>
            ))}
          </section>
        )}
        {selection.kind !== "core" && tab === "VMs" && (
          <section className="tx-panel">
            <header>
              <h3>Virtual Machines ({machine.vms.length})</h3>
              <span className="tx-sample-tag">SAMPLE</span>
            </header>
            {machine.vms.map((vm) => (
              <p className="tx-compact-row" key={vm.name}>
                <Server size={15} />
                <span>
                  <b>{vm.name}</b>
                  <small>
                    {vm.cpu} · {vm.memory}
                  </small>
                </span>
                <i className="tx-status-dot" />
              </p>
            ))}
          </section>
        )}
        {selection.kind !== "core" && tab === "Logs" && (
          <section className="tx-panel">
            <header>
              <h3>Logs</h3>
              <span className="tx-sample-tag">SAMPLE</span>
            </header>
            <div className="tx-empty-log">
              <CircleHelp size={20} />
              <b>No connected log source</b>
              <span>Sample log data is not available for this machine.</span>
            </div>
          </section>
        )}
      </div>
      <form
        className="tx-assistant"
        onSubmit={(event) => {
          event.preventDefault();
          if (!prompt.trim()) return;
          setShowUnavailable(true);
          statusRef.current?.focus();
        }}
      >
        <Sparkles size={16} />
        <label className="sr-only" htmlFor="tx-prompt">
          Ask Z.Y.R.I.X
        </label>
        <input
          id="tx-prompt"
          placeholder="Ask Z.Y.R.I.X..."
          value={prompt}
          onChange={(event) => {
            setPrompt(event.target.value);
            setShowUnavailable(false);
          }}
        />
        <button type="submit" aria-label="Submit assistant request">
          <Send size={16} />
        </button>
        <p
          ref={statusRef}
          className={showUnavailable ? "is-visible" : ""}
          role="status"
          tabIndex={-1}
        >
          No AI service is connected. Your request will not be sent.
        </p>
      </form>
      <div className="tx-quick-actions">
        <button
          type="button"
          onClick={() => {
            setPrompt("Summarize this machine");
            setShowUnavailable(false);
          }}
        >
          Summarize this machine
        </button>
        <button
          type="button"
          onClick={() => {
            setPrompt("Show logs for this machine");
            setShowUnavailable(false);
            setTab("Logs");
          }}
        >
          Show logs
        </button>
        <button
          type="button"
          onClick={() => {
            setPrompt("Review services on this machine");
            setShowUnavailable(false);
            setTab("Services");
          }}
        >
          Review services
        </button>
        <button
          type="button"
          aria-label="Show machine overview"
          title="Show machine overview"
          onClick={() => onSelect({ id: machine.id, kind: "machine" })}
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
    </aside>
  );
}

function TopologyCanvas({
  onSelect,
}: {
  onSelect: (selection: TopologySelection | null) => void;
}) {
  const [initialNodes] = useState(() =>
    buildTopologyNodes(readTopologyPositions()),
  );
  const [nodes, setNodes] = useNodesState<TopologyFlowNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const { fitView, getNodes } = useReactFlow<TopologyFlowNode>();
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: TopologyFlowNode) => {
      setNodes((current) =>
        current.map((item) => ({
          ...item,
          data:
            "machine" in item.data
              ? { ...item.data, selected: item.id === node.id }
              : "workload" in item.data
                ? { ...item.data, selected: item.id === node.id }
                : item.data,
        })),
      );
      const selectedMachine =
        node.type === "core"
          ? null
          : node.type === "machine"
            ? node.id
            : SAMPLE_MACHINES.find((machine) =>
                machine.workloads.some(
                  (workload) =>
                    workload.id === (node.data as WorkloadNodeData).workload.id,
                ),
              )?.id;
      setEdges((current) =>
        current.map((edge) => {
          const active =
            node.type === "core"
              ? edge.source === "zyrix-core"
              : edge.source === selectedMachine ||
                edge.target === selectedMachine;
          return {
            ...edge,
            className: active ? "tx-edge tx-edge-active" : "tx-edge",
            style: active
              ? { stroke: "#b19ae9", strokeWidth: 1.8, opacity: 1 }
              : { stroke: "#8a7cbd", strokeWidth: 1, opacity: 0.32 },
          };
        }),
      );
      if (node.type === "core") onSelect({ id: node.id, kind: "core" });
      else if (node.type === "machine")
        onSelect({ id: node.id, kind: "machine" });
      else
        onSelect({
          id: (node.data as WorkloadNodeData).workload.id,
          kind: "workload",
        });
    },
    [onSelect, setNodes, setEdges],
  );
  const onNodeDragStop = useCallback(() => {
    writeTopologyPositions(
      Object.fromEntries(getNodes().map((node) => [node.id, node.position])),
    );
  }, [getNodes]);
  const changeNodes = useCallback(
    (changes: Parameters<typeof applyNodeChanges<TopologyFlowNode>>[0]) => {
      setNodes((current) => applyNodeChanges(changes, current));
    },
    [setNodes],
  );
  const selectedMachine = nodes.find((node) => node.id === "machine-03");
  return (
    <section
      className="tx-canvas-section"
      aria-label="Interactive sample topology"
    >
      <div className="tx-canvas-topline">
        <div>
          <span className="tx-live-mark" />
          <strong>CLUSTER SIGNAL MAP</strong>
          <small>DEMO DATA · 5 MACHINES</small>
        </div>
        <div className="tx-canvas-actions">
          <button
            type="button"
            onClick={() => void fitView({ padding: 0.14, duration: 350 })}
          >
            <Search size={14} /> Fit graph
          </button>
        </div>
      </div>
      <div className="tx-flow-wrap">
        <ReactFlow<TopologyFlowNode, Edge>
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          onNodesChange={changeNodes}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          onPaneClick={() => onSelect(null)}
          defaultViewport={{ x: 0, y: 0, zoom: 0.72 }}
          minZoom={0.35}
          maxZoom={1.3}
          nodesConnectable={false}
          elementsSelectable
          fitView
          fitViewOptions={{ padding: 0.08, minZoom: 0.35, maxZoom: 0.82 }}
          proOptions={{ hideAttribution: true }}
          aria-label="Z.Y.R.I.X and five sample machines. Drag items to rearrange."
        >
          <Background color="rgba(149, 161, 191, .14)" gap={32} size={1} />
          <Controls showInteractive={false} position="bottom-left" />
        </ReactFlow>
        <div className="tx-flow-legend">
          <span>
            <i className="tx-status-dot" /> Online
          </span>
          <span>
            <i className="tx-legend-line" /> Sample relationship
          </span>
        </div>
      </div>
      <div className="tx-graph-foot">
        <span>Drag nodes to arrange · drag canvas to pan · scroll to zoom</span>
        <button
          type="button"
          onClick={() => {
            setNodes(buildTopologyNodes());
            setEdges(INITIAL_EDGES);
            writeTopologyPositions({});
            void fitView({ padding: 0.08, duration: 350 });
          }}
        >
          Reset layout
        </button>
        <span className="sr-only">Default selected: {selectedMachine?.id}</span>
      </div>
    </section>
  );
}

function TopologyExperienceInner() {
  const [selection, setSelection] = useState<TopologySelection | null>({
    id: "machine-03",
    kind: "machine",
  });
  const [tab, setTab] = useState<InspectorTab>("Overview");
  const activeMachine = selection
    ? (SAMPLE_MACHINES.find((item) => item.id === selection.id) ??
      SAMPLE_MACHINES.find((item) =>
        item.workloads.some((workload) => workload.id === selection.id),
      ) ??
      SAMPLE_MACHINES[2])
    : SAMPLE_MACHINES[2];
  const select = useCallback((next: TopologySelection | null) => {
    setSelection(next);
    if (next) setTab("Overview");
  }, []);
  const status = useMemo(
    () =>
      `${SAMPLE_MACHINES.length} sample machines · ${SAMPLE_MACHINES.reduce((sum, machine) => sum + machine.services, 0)} service entries · ${SAMPLE_MACHINES.reduce((sum, machine) => sum + machine.vmCount, 0)} VMs · ${SAMPLE_MACHINES.reduce((sum, machine) => sum + machine.containerCount, 0)} containers`,
    [],
  );
  return (
    <div className="tx-experience">
      <div className="tx-experience-header">
        <div>
          <span className="tx-eyebrow">TOPOLOGY / ORCHESTRATION</span>
          <h1>Cluster topology</h1>
          <p>
            Explore the sample Z.Y.R.I.X orchestration map. All services and
            readings below are illustrative.
          </p>
        </div>
        <div className="tx-health-card">
          <span>Cluster status</span>
          <strong>
            <i /> Healthy · sample
          </strong>
          <small>{status}</small>
        </div>
      </div>
      <div className="tx-workspace">
        <TopologyCanvas onSelect={select} />
        {selection && (
          <Inspector
            selection={selection}
            onClose={() => setSelection(null)}
            onSelect={select}
            tab={tab}
            setTab={setTab}
          />
        )}
      </div>
      <div className="tx-footer-note">
        <Cpu size={13} /> This is an illustrative local sample topology. No live
        machines or service inventory are connected.
      </div>
      <span className="sr-only">
        {selection
          ? `Selected machine ${activeMachine.name}`
          : "Inspector closed"}
      </span>
    </div>
  );
}

export function TopologyExperience() {
  return (
    <ReactFlowProvider>
      <TopologyExperienceInner />
    </ReactFlowProvider>
  );
}
