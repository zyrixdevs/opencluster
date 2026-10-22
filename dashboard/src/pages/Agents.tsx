import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bot,
  BrainCircuit,
  ChevronDown,
  CircleHelp,
  Command,
  Cpu,
  GitBranch,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Waypoints,
} from "lucide-react";
import {
  // ORIGINAL (preserved, not deleted — disabled by comment): type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { PageTitle } from "../components/ui";
import "./Agents.css";

type AgentStatus = "active" | "idle" | "attention" | "paused";
type GraphMode = "network" | "radial";
type Point = { x: number; y: number };
type AgentNode = {
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
};
type AgentEdge = {
  source: string;
  target: string;
  label: string;
  strength: number;
};

const VIEW = { width: 900, height: 570 };
const INITIAL_AGENTS: AgentNode[] = [
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
  },
];
const INITIAL_EDGES: AgentEdge[] = [
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
];
// ORIGINAL (preserved, not deleted — disabled by comment): const edges = INITIAL_EDGES;
const NETWORK_POSITIONS: Record<string, Point> = {
  codex: { x: 250, y: 280 },
  claude: { x: 570, y: 145 },
  hermes: { x: 675, y: 310 },
  openclaw: { x: 515, y: 445 },
  custom: { x: 225, y: 460 },
};

function positionsFor(mode: GraphMode): Record<string, Point> {
  if (mode === "network") return NETWORK_POSITIONS;
  const center = { x: VIEW.width / 2, y: VIEW.height / 2 };
  const radiusX = 255;
  const radiusY = 190;
  return Object.fromEntries(
    INITIAL_AGENTS.map((agent) => {
      if (agent.id === "codex") return [agent.id, center];
      const spoke = INITIAL_AGENTS.filter(
        (item) => item.id !== "codex",
      ).indexOf(agent);
      const angle = -Math.PI / 2 + (spoke * (Math.PI * 2)) / 4;
      return [
        agent.id,
        {
          x: center.x + Math.cos(angle) * radiusX,
          y: center.y + Math.sin(angle) * radiusY,
        },
      ];
    }),
  );
}

function AgentGlyph({ icon }: { icon: AgentNode["icon"] }) {
  if (icon === "codex") return <Command size={18} strokeWidth={1.8} />;
  if (icon === "claude") return <Sparkles size={18} strokeWidth={1.8} />;
  if (icon === "hermes") return <Bot size={18} strokeWidth={1.8} />;
  if (icon === "openclaw") return <Waypoints size={18} strokeWidth={1.8} />;
  return <CircleHelp size={18} strokeWidth={1.8} />;
}

function edgePath(a: Point, b: Point) {
  const middleX = (a.x + b.x) / 2;
  const middleY = (a.y + b.y) / 2;
  const curve = (b.x - a.x) * 0.08;
  return `M ${a.x} ${a.y} Q ${middleX - curve} ${middleY + curve} ${b.x} ${b.y}`;
}

export function AgentsPage() {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [mode, setMode] = useState<GraphMode>("network");
  const [positions, setPositions] = useState<Record<string, Point>>(() =>
    positionsFor("network"),
  );
  const [selectedId, setSelectedId] = useState("codex");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [live, setLive] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const gesture = useRef<
    | { type: "node"; id: string; pointer: Point }
    | { type: "pan"; pointer: Point; pan: Point }
    | null
  >(null);
  const selected = agents.find((agent) => agent.id === selectedId) ?? agents[0];
  const selectedEdges = INITIAL_EDGES.filter(
    (edge) => edge.source === selected.id || edge.target === selected.id,
  );

  const pointerPoint = useCallback(
    (
      event: ReactPointerEvent<SVGSVGElement> | ReactWheelEvent<SVGSVGElement>,
    ) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const transform = svg.getScreenCTM()?.inverse();
      if (!transform) return { x: 0, y: 0 };
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const local = point.matrixTransform(transform);
      return { x: local.x, y: local.y };
    },
    [],
  );

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    const target = (event.target as Element).closest<SVGGElement>(
      "[data-agent-id]",
    );
    const pointer = pointerPoint(event);
    if (target?.dataset.agentId) {
      const id = target.dataset.agentId;
      setSelectedId(id);
      gesture.current = { type: "node", id, pointer };
    } else {
      gesture.current = { type: "pan", pointer, pan };
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const active = gesture.current;
    if (!active) return;
    const current = pointerPoint(event);
    const delta = {
      x: current.x - active.pointer.x,
      y: current.y - active.pointer.y,
    };
    if (active.type === "node") {
      setPositions((previous) => {
        const original = previous[active.id];
        return {
          ...previous,
          [active.id]: {
            x: original.x + delta.x / zoom,
            y: original.y + delta.y / zoom,
          },
        };
      });
      active.pointer = current;
    } else {
      setPan({ x: active.pan.x + delta.x, y: active.pan.y + delta.y });
    }
  };

  const onWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    setZoom((current) =>
      Math.max(0.65, Math.min(1.8, current * (event.deltaY < 0 ? 1.08 : 0.92))),
    );
  };

  /* ORIGINAL (preserved, not deleted — disabled by comment):
  const onGraphKeyDown = (event: ReactKeyboardEvent<SVGSVGElement>) => {
    const step = event.shiftKey ? 40 : 18;
    if (event.key === "ArrowLeft")
      setPan((value) => ({ ...value, x: value.x + step }));
    else if (event.key === "ArrowRight")
      setPan((value) => ({ ...value, x: value.x - step }));
    else if (event.key === "ArrowUp")
      setPan((value) => ({ ...value, y: value.y + step }));
    else if (event.key === "ArrowDown")
      setPan((value) => ({ ...value, y: value.y - step }));
    else if (event.key === "+" || event.key === "=")
      setZoom((value) => Math.min(1.8, value + 0.1));
    else if (event.key === "-") setZoom((value) => Math.max(0.65, value - 0.1));
    else return;
    event.preventDefault();
  };
*/

  const setModeAndLayout = (nextMode: GraphMode) => {
    setMode(nextMode);
    setPositions(positionsFor(nextMode));
    setPan({ x: 0, y: 0 });
  };

  const toggleAgentStatus = () => {
    setAgents((current) =>
      current.map((agent) =>
        agent.id === selected.id
          ? { ...agent, status: agent.status === "paused" ? "idle" : "paused" }
          : agent,
      ),
    );
  };

  return (
    <main className={`agents-page${live ? "" : " motion-off"}`}>
      <PageTitle
        eyebrow="AI AGENT WORKSPACE"
        title="Agents"
        description="Explore the relationships between sample AI adapters. All activity and connections on this page are illustrative."
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
            <span>ADAPTERS</span>
            <strong>{agents.length.toString().padStart(2, "0")}</strong>
          </div>
          <div>
            <span>DEMO LINKS</span>
            <strong>{INITIAL_EDGES.length.toString().padStart(2, "0")}</strong>
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
                Drag nodes or canvas to explore
              </span>
            </div>
            <div
              className="agents-view-switch"
              role="toolbar"
              aria-label="Graph layout"
            >
              <button
                type="button"
                aria-pressed={mode === "network"}
                onClick={() => setModeAndLayout("network")}
              >
                <GitBranch size={14} /> Network
              </button>
              <button
                type="button"
                aria-pressed={mode === "radial"}
                onClick={() => setModeAndLayout("radial")}
              >
                <CircleHelp size={14} /> Radial
              </button>
            </div>
          </div>
          <section
            className="agents-graph-wrap"
            aria-label={`${mode} agent graph. Select a demo adapter with the keyboard or pointer.`}
          >
            <svg
              ref={svgRef}
              className="agents-graph"
              viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={() => {
                gesture.current = null;
              }}
              onPointerCancel={() => {
                gesture.current = null;
              }}
              onWheel={onWheel}
            >
              <title id="agents-graph-title">
                Demo AI agent relationship map
              </title>
              <defs>
                <pattern
                  id="agent-grid"
                  width="30"
                  height="30"
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx="1"
                    cy="1"
                    r="1"
                    fill="currentColor"
                    opacity=".19"
                  />
                </pattern>
                <filter
                  id="agent-glow"
                  x="-80%"
                  y="-80%"
                  width="260%"
                  height="260%"
                >
                  <feGaussianBlur stdDeviation="10" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <marker
                  id="agent-arrow"
                  markerWidth="7"
                  markerHeight="7"
                  refX="5"
                  refY="3.5"
                  orient="auto"
                >
                  <path d="M0 0L6 3.5L0 7Z" fill="#748895" />
                </marker>
              </defs>
              <rect
                width={VIEW.width}
                height={VIEW.height}
                fill="url(#agent-grid)"
              />
              <g
                transform={`translate(${pan.x} ${pan.y}) translate(${VIEW.width / 2} ${VIEW.height / 2}) scale(${zoom}) translate(${-VIEW.width / 2} ${-VIEW.height / 2})`}
              >
                <g className="agents-edges">
                  {INITIAL_EDGES.map((edge) => {
                    const from = positions[edge.source];
                    const to = positions[edge.target];
                    const highlighted =
                      edge.source === selected.id ||
                      edge.target === selected.id;
                    const labelX = (from.x + to.x) / 2;
                    const labelY = (from.y + to.y) / 2;
                    return (
                      <g
                        key={`${edge.source}-${edge.target}`}
                        className={
                          highlighted
                            ? "agents-edge highlighted"
                            : "agents-edge"
                        }
                      >
                        <path
                          d={edgePath(from, to)}
                          strokeWidth={1 + edge.strength * 1.3}
                          markerEnd="url(#agent-arrow)"
                        />
                        <circle className="agents-edge-pulse" r="2.5">
                          <animateMotion
                            dur={`${4.8 + (1 - edge.strength) * 2}s`}
                            repeatCount="indefinite"
                            path={edgePath(from, to)}
                          />
                        </circle>
                        {highlighted && (
                          <text x={labelX} y={labelY - 9}>
                            {edge.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
                {agents.map((agent) => {
                  const point = positions[agent.id];
                  const isSelected = agent.id === selectedId;
                  return (
                    /* biome-ignore lint/a11y/useSemanticElements: SVG node geometry needs a keyboard-accessible button role. */
                    <g
                      key={agent.id}
                      data-agent-id={agent.id}
                      className={`agent-node ${agent.color}${isSelected ? " selected" : ""}`}
                      transform={`translate(${point.x} ${point.y})`}
                      role="button"
                      tabIndex={0}
                      aria-label={`${agent.name}, ${agent.status}, ${agent.tasks} demo tasks`}
                      aria-pressed={isSelected}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedId(agent.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedId(agent.id);
                        }
                      }}
                    >
                      <circle className="agent-node-glow" r="48" />
                      <rect
                        className="agent-node-card"
                        x="-82"
                        y="-45"
                        width="164"
                        height="90"
                        rx="13"
                      />
                      <circle
                        className="agent-node-icon-bg"
                        cx="-54"
                        cy="-15"
                        r="15"
                      />
                      <foreignObject
                        x="-64"
                        y="-25"
                        width="20"
                        height="20"
                        className="agent-node-icon"
                      >
                        <div className="agent-node-icon-inner">
                          <AgentGlyph icon={agent.icon} />
                        </div>
                      </foreignObject>
                      <circle
                        className={`agent-node-status ${agent.status}`}
                        cx="63"
                        cy="-29"
                        r="4"
                      />
                      <text className="agent-node-vendor" x="-31" y="-11">
                        {agent.vendor.toUpperCase()}
                      </text>
                      <text className="agent-node-name" x="-65" y="14">
                        {agent.name}
                      </text>
                      <text className="agent-node-meta" x="-65" y="32">
                        {agent.tasks} TASK{agent.tasks === 1 ? "" : "S"} ·{" "}
                        {agent.status.toUpperCase()}
                      </text>
                    </g>
                  );
                })}
              </g>
              <text className="agents-canvas-hint" x="22" y="548">
                DRAG TO REPOSITION · WHEEL TO ZOOM · SELECT A NODE FOR DETAILS
              </text>
            </svg>
            <fieldset className="agents-canvas-controls">
              <legend>Canvas controls</legend>
              <button
                type="button"
                aria-label="Pan left"
                onClick={() =>
                  setPan((value) => ({ ...value, x: value.x + 24 }))
                }
              >
                <ArrowLeft size={14} />
              </button>
              <button
                type="button"
                aria-label="Pan right"
                onClick={() =>
                  setPan((value) => ({ ...value, x: value.x - 24 }))
                }
              >
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                aria-label="Pan up"
                onClick={() =>
                  setPan((value) => ({ ...value, y: value.y + 24 }))
                }
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                aria-label="Pan down"
                onClick={() =>
                  setPan((value) => ({ ...value, y: value.y - 24 }))
                }
              >
                <ArrowDown size={14} />
              </button>
              <button
                type="button"
                aria-label="Zoom out"
                onClick={() => setZoom((value) => Math.max(0.65, value - 0.1))}
              >
                <Minus size={15} />
              </button>
              <span aria-live="polite">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                aria-label="Zoom in"
                onClick={() => setZoom((value) => Math.min(1.8, value + 0.1))}
              >
                <Plus size={15} />
              </button>
              <span className="agents-control-divider" />
              <button
                type="button"
                aria-label="Reset graph view"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                  setPositions(positionsFor(mode));
                }}
              >
                <RotateCcw size={14} />
              </button>
            </fieldset>
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
              Lines show illustrative adapter relationships
            </span>
          </div>
        </section>

        <aside className="agents-inspector" aria-label="Selected agent details">
          <div className="agents-inspector-head">
            <div>
              <span className="agents-inspector-kicker">ADAPTER INSPECTOR</span>
              <span className="agents-inspector-count">
                {String(
                  agents.findIndex((agent) => agent.id === selected.id) + 1,
                ).padStart(2, "0")}{" "}
                / {String(agents.length).padStart(2, "0")}
              </span>
            </div>
            <span className={`agents-status-chip ${selected.status}`}>
              <i />
              {selected.status}
            </span>
          </div>
          <div className={`agents-profile-mark ${selected.color}`}>
            <AgentGlyph icon={selected.icon} />
          </div>
          <h2>{selected.name}</h2>
          <p className="agents-profile-vendor">
            {selected.vendor} <span>·</span> {selected.role}
          </p>
          <div className="agents-model-box">
            <span>MODEL / ADAPTER</span>
            <strong>{selected.model}</strong>
            <small>Configured for demonstration only</small>
          </div>
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
                    key={`${edge.source}-${edge.target}`}
                    className="agents-connected-row"
                    onClick={() => setSelectedId(other.id)}
                  >
                    <span className={`agents-connected-dot ${other.color}`} />
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
                No demo connections are shown for this adapter.
              </p>
            )}
          </div>
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
        <Cpu size={14} /> Sample graph data only <span />{" "}
        <button
          type="button"
          onClick={() => setLive((value) => !value)}
          aria-pressed={live}
        >
          Motion {live ? "on" : "off"}
        </button>
        <small>Decorative connection motion can be switched off.</small>
      </div>
    </main>
  );
}
