import {
  Activity,
  Bot,
  Check,
  CirclePlay,
  Clock3,
  GitBranch,
  Grip,
  Minus,
  MousePointer2,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  Webhook,
  X,
} from "lucide-react";
import type { PointerEvent as ReactPointerEvent, WheelEvent } from "react";
import { useState } from "react";
import * as UI from "../components/ui";
import "./Automation.css";

type StepKind = "trigger" | "action" | "condition" | "agent";
type StepStatus = "idle" | "running" | "complete" | "skipped";
type WorkflowStep = {
  id: string;
  title: string;
  subtitle: string;
  kind: StepKind;
  x: number;
  y: number;
  status: StepStatus;
  detail: string;
};

const starterSteps: WorkflowStep[] = [
  {
    id: "trigger",
    title: "Schedule trigger",
    subtitle: "Every 15 minutes",
    kind: "trigger",
    x: 54,
    y: 210,
    status: "idle",
    detail: "Starts a sample health check on a fixed interval.",
  },
  {
    id: "inspect",
    title: "Inspect cluster",
    subtitle: "Read node health",
    kind: "action",
    x: 300,
    y: 210,
    status: "idle",
    detail: "Collects mock health values from the selected demo cluster.",
  },
  {
    id: "threshold",
    title: "Health below 80%?",
    subtitle: "Condition · 80%",
    kind: "condition",
    x: 548,
    y: 210,
    status: "idle",
    detail: "Routes the sample run based on a configurable threshold.",
  },
  {
    id: "notify",
    title: "Notify operator",
    subtitle: "Create demo alert",
    kind: "action",
    x: 806,
    y: 102,
    status: "idle",
    detail: "Adds a preview notification to this simulated workflow run.",
  },
  {
    id: "agent",
    title: "Summarize status",
    subtitle: "OpenCluster assistant",
    kind: "agent",
    x: 806,
    y: 326,
    status: "idle",
    detail: "Creates a local sample summary. No AI service is contacted.",
  },
];

const kindIcon = {
  trigger: Webhook,
  action: Activity,
  condition: GitBranch,
  agent: Bot,
};

const edges = [
  { from: "trigger", to: "inspect", label: "on schedule" },
  { from: "inspect", to: "threshold", label: "health sample" },
  { from: "threshold", to: "notify", label: "below threshold", branch: true },
  { from: "threshold", to: "agent", label: "healthy", branch: false },
];

const cardWidth = 188;
const cardHeight = 92;
const stageWidth = 1060;
const stageHeight = 620;

function StepCard({
  step,
  selected,
  onSelect,
  onDragStart,
  onMove,
}: {
  step: WorkflowStep;
  selected: boolean;
  onSelect: () => void;
  onDragStart: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onMove: (x: number, y: number) => void;
}) {
  const Icon = kindIcon[step.kind];
  return (
    <button
      type="button"
      className={`automation-step step-${step.kind} ${selected ? "is-selected" : ""} status-${step.status}`}
      style={{
        left: step.x,
        top: step.y,
        width: cardWidth,
        height: cardHeight,
      }}
      onClick={onSelect}
      onPointerDown={onDragStart}
      onKeyDown={(event) => {
        const delta = event.shiftKey ? 20 : 8;
        const movement = {
          ArrowUp: { x: 0, y: -delta },
          ArrowDown: { x: 0, y: delta },
          ArrowLeft: { x: -delta, y: 0 },
          ArrowRight: { x: delta, y: 0 },
        }[event.key as "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight"];
        if (movement) {
          event.preventDefault();
          onMove(movement.x, movement.y);
        }
      }}
      aria-pressed={selected}
      aria-label={`${step.title}, ${step.kind} step, ${step.status}`}
    >
      <span className={`automation-step-icon step-${step.kind}`}>
        <Icon size={16} aria-hidden="true" />
      </span>
      <span className="automation-step-copy">
        <strong>{step.title}</strong>
        <small>{step.subtitle}</small>
      </span>
      <span className="automation-step-state">
        {step.status === "complete" ? (
          <Check size={13} />
        ) : step.status === "running" ? (
          <span className="automation-pulse" />
        ) : (
          <Grip size={13} />
        )}
      </span>
    </button>
  );
}

export function AutomationPage() {
  const [steps, setSteps] = useState(starterSteps);
  const [selectedId, setSelectedId] = useState("inspect");
  const [pan, setPan] = useState({ x: 22, y: 20 });
  const [zoom, setZoom] = useState(0.92);
  const [isRunning, setIsRunning] = useState(false);
  const [runMessage, setRunMessage] = useState("Ready for a simulated run");
  const [runCount, setRunCount] = useState(0);
  const [dragState, setDragState] = useState<
    | {
        type: "pan";
        pointerX: number;
        pointerY: number;
        originX: number;
        originY: number;
      }
    | {
        type: "step";
        id: string;
        pointerX: number;
        pointerY: number;
        originX: number;
        originY: number;
      }
    | null
  >(null);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const selected = steps.find((step) => step.id === selectedId) ?? steps[0];

  const resetWorkflow = () => {
    setSteps(starterSteps);
    setRunMessage("Workflow reset to its sample state");
    setIsRunning(false);
  };

  const runWorkflow = () => {
    if (isRunning) return;
    setIsRunning(true);
    setRunCount((count) => count + 1);
    const sequence = ["trigger", "inspect", "threshold", "notify", "agent"];
    setSteps((current) => current.map((step) => ({ ...step, status: "idle" })));
    setRunMessage("Simulated run started · no jobs are dispatched");
    sequence.forEach((id, index) => {
      window.setTimeout(() => {
        setSteps((current) =>
          current.map((step) => ({
            ...step,
            status:
              step.id === id
                ? "running"
                : sequence.indexOf(step.id) < index
                  ? "complete"
                  : step.status,
          })),
        );
      }, 380 * index);
    });
    window.setTimeout(() => {
      setSteps((current) =>
        current.map((step) => ({ ...step, status: "complete" })),
      );
      setIsRunning(false);
      setRunMessage("Demo run completed · sample result only");
    }, 380 * sequence.length);
  };

  const startPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest(".automation-step")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({
      type: "pan",
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: pan.x,
      originY: pan.y,
    });
  };

  const startStepDrag = (
    step: WorkflowStep,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelectedId(step.id);
    setDragState({
      type: "step",
      id: step.id,
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: step.x,
      originY: step.y,
    });
  };

  const movePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState) return;
    const dx =
      (event.clientX - dragState.pointerX) /
      (dragState.type === "pan" ? 1 : zoom);
    const dy =
      (event.clientY - dragState.pointerY) /
      (dragState.type === "pan" ? 1 : zoom);
    if (dragState.type === "pan")
      setPan({ x: dragState.originX + dx, y: dragState.originY + dy });
    else
      setSteps((current) =>
        current.map((step) =>
          step.id === dragState.id
            ? {
                ...step,
                x: Math.max(0, dragState.originX + dx),
                y: Math.max(0, dragState.originY + dy),
              }
            : step,
        ),
      );
  };

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    setZoom((value) =>
      Math.min(1.25, Math.max(0.55, value - event.deltaY * 0.001)),
    );
  };

  return (
    <>
      <UI.PageTitle
        eyebrow="AUTOMATION STUDIO"
        title="Automation"
        description="Sketch and preview cluster workflows. Every node and run on this page is local demo data."
        actions={
          <UI.Button
            variant="primary"
            onClick={runWorkflow}
            disabled={isRunning}
          >
            <CirclePlay size={15} />
            {isRunning ? "Running demo…" : "Run demo"}
          </UI.Button>
        }
      />
      <div className="automation-layout">
        <section className="automation-workspace" aria-label="Workflow editor">
          <div className="automation-toolbar">
            <div className="automation-workflow-label">
              <span className="automation-flow-icon">
                <GitBranch size={15} />
              </span>
              <span>
                <strong>Cluster health check</strong>
                <small>Draft workflow · {steps.length} steps</small>
              </span>
            </div>
            <div className="automation-toolbar-actions">
              <span className="demo-pill">
                <span /> DEMO ONLY
              </span>
              <button
                type="button"
                className="automation-tool-button"
                onClick={resetWorkflow}
                aria-label="Reset workflow"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                className="automation-tool-button"
                onClick={() => setInspectorOpen((open) => !open)}
                aria-label={
                  inspectorOpen ? "Hide step inspector" : "Show step inspector"
                }
              >
                <Settings2 size={15} />
              </button>
            </div>
          </div>
          <section
            className={`automation-stage ${dragState?.type === "pan" ? "is-panning" : ""}`}
            onPointerDown={startPan}
            onPointerMove={movePointer}
            onPointerUp={() => setDragState(null)}
            onPointerCancel={() => setDragState(null)}
            onWheel={onWheel}
            aria-label="Workflow canvas. Drag blocks to move them. Drag the background to pan. Use the zoom controls."
          >
            <div className="automation-grid" aria-hidden="true" />
            <div
              className="automation-world"
              style={{
                width: stageWidth,
                height: stageHeight,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
            >
              <svg
                className="automation-edges"
                width={stageWidth}
                height={stageHeight}
                aria-hidden="true"
              >
                <defs>
                  <marker
                    id="automation-arrow"
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="4"
                    orient="auto"
                  >
                    <path d="M0 0L8 4L0 8Z" fill="currentColor" />
                  </marker>
                </defs>
                {edges.map((edge) => {
                  const from = steps.find((step) => step.id === edge.from);
                  const to = steps.find((step) => step.id === edge.to);
                  if (!from || !to) return null;
                  const x1 = from.x + cardWidth;
                  const y1 = from.y + cardHeight / 2;
                  const x2 = to.x;
                  const y2 = to.y + cardHeight / 2;
                  const mid = (x1 + x2) / 2;
                  const d = `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2 - 7} ${y2}`;
                  return (
                    <g
                      className={`automation-edge ${edge.branch ? "is-branch" : ""}`}
                      key={`${edge.from}-${edge.to}`}
                    >
                      <path d={d} markerEnd="url(#automation-arrow)" />
                      <text x={mid} y={(y1 + y2) / 2 - 8} textAnchor="middle">
                        {edge.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
              {steps.map((step) => (
                <StepCard
                  key={step.id}
                  step={step}
                  selected={step.id === selectedId}
                  onSelect={() => setSelectedId(step.id)}
                  onDragStart={(event) => startStepDrag(step, event)}
                  onMove={(x, y) =>
                    setSteps((current) =>
                      current.map((item) =>
                        item.id === step.id
                          ? {
                              ...item,
                              x: Math.max(0, item.x + x),
                              y: Math.max(0, item.y + y),
                            }
                          : item,
                      ),
                    )
                  }
                />
              ))}
            </div>
            <div className="automation-canvas-controls">
              <button
                type="button"
                onClick={() => setZoom((value) => Math.min(1.25, value + 0.1))}
                aria-label="Zoom in"
              >
                <Plus size={15} />
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((value) => Math.max(0.55, value - 0.1))}
                aria-label="Zoom out"
              >
                <Minus size={15} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(0.92);
                  setPan({ x: 22, y: 20 });
                }}
                aria-label="Reset canvas view"
              >
                <MousePointer2 size={14} />
              </button>
            </div>
            <div className="automation-canvas-hint">
              <MousePointer2 size={12} /> Drag blocks · drag empty canvas to pan
              · Ctrl/⌘ + scroll to zoom
            </div>
          </section>
          <div className="automation-runbar" role="status" aria-live="polite">
            <span className={`run-indicator ${isRunning ? "is-running" : ""}`}>
              <span />
            </span>
            <span>{runMessage}</span>
            <small>
              {runCount
                ? `RUN #${String(runCount).padStart(2, "0")}`
                : "NO RUNS YET"}
            </small>
          </div>
        </section>

        {inspectorOpen && selected && (
          <aside
            className="automation-inspector"
            aria-label="Selected workflow step settings"
          >
            <div className="automation-inspector-head">
              <div>
                <span className="eyebrow">STEP INSPECTOR</span>
                <h2>Configure step</h2>
              </div>
              <button
                type="button"
                className="automation-tool-button inspector-close"
                onClick={() => setInspectorOpen(false)}
                aria-label="Close inspector"
              >
                <X size={15} />
              </button>
            </div>
            <div className="inspector-type">
              <span className={`inspector-icon step-${selected.kind}`}>
                {(() => {
                  const Icon = kindIcon[selected.kind];
                  return <Icon size={16} />;
                })()}
              </span>
              <div>
                <strong>{selected.kind}</strong>
                <small>Local workflow step</small>
              </div>
              <span className={`inspector-status status-${selected.status}`}>
                {selected.status}
              </span>
            </div>
            <label className="inspector-field">
              Step name
              <input
                value={selected.title}
                onChange={(event) =>
                  setSteps((current) =>
                    current.map((step) =>
                      step.id === selected.id
                        ? { ...step, title: event.target.value }
                        : step,
                    ),
                  )
                }
              />
            </label>
            <label className="inspector-field">
              Description
              <textarea
                value={selected.detail}
                rows={4}
                onChange={(event) =>
                  setSteps((current) =>
                    current.map((step) =>
                      step.id === selected.id
                        ? { ...step, detail: event.target.value }
                        : step,
                    ),
                  )
                }
              />
            </label>
            {selected.kind === "condition" && (
              <label className="inspector-field">
                Health threshold
                <div className="threshold-input">
                  <input type="number" min="1" max="100" defaultValue="80" />
                  <span>%</span>
                </div>
              </label>
            )}
            {selected.kind === "trigger" && (
              <label className="inspector-field">
                Schedule
                <select defaultValue="15">
                  <option value="5">Every 5 minutes</option>
                  <option value="15">Every 15 minutes</option>
                  <option value="60">Every hour</option>
                </select>
              </label>
            )}
            <div className="inspector-note">
              <Sparkles size={14} />
              <span>
                Settings are stored in this page only. Workflow changes are not
                saved to a server.
              </span>
            </div>
            <div className="inspector-footer">
              <span>
                <Clock3 size={13} /> Updated just now
              </span>
              <button
                type="button"
                className="text-button"
                onClick={() => setSelectedId("inspect")}
              >
                Select main step
              </button>
            </div>
          </aside>
        )}
      </div>
      <div className="automation-lower-grid">
        <UI.Card className="automation-steps-card">
          <div className="automation-section-head">
            <div>
              <span className="eyebrow">FLOW OVERVIEW</span>
              <h2>Execution path</h2>
            </div>
            <span className="availability-tag">SIMULATED</span>
          </div>
          <div className="automation-path-list">
            {steps.map((step, index) => {
              const Icon = kindIcon[step.kind];
              return (
                <button
                  type="button"
                  className="automation-path-item"
                  key={step.id}
                  onClick={() => setSelectedId(step.id)}
                >
                  <span className={`path-icon step-${step.kind}`}>
                    <Icon size={14} />
                  </span>
                  <span>
                    <strong>{step.title}</strong>
                    <small>
                      {index === 2
                        ? "Routes to alert or summary"
                        : step.subtitle}
                    </small>
                  </span>
                  <span className={`path-status status-${step.status}`}>
                    {step.status === "complete"
                      ? "Complete"
                      : step.status === "running"
                        ? "Running"
                        : "Ready"}
                  </span>
                </button>
              );
            })}
          </div>
        </UI.Card>
        <UI.Card className="automation-preview-card">
          <div className="automation-section-head">
            <div>
              <span className="eyebrow">RUN PREVIEW</span>
              <h2>Latest sample</h2>
            </div>
            <span className="preview-symbol">
              <Search size={15} />
            </span>
          </div>
          <div className="preview-result">
            <div className="preview-score">
              98<span>%</span>
            </div>
            <div>
              <strong>Cluster health sample</strong>
              <small>5 nodes checked · 0 actions dispatched</small>
            </div>
          </div>
          <div className="preview-meta">
            <span>Last run</span>
            <strong>{runCount ? "Just now" : "No execution yet"}</strong>
          </div>
          <div className="preview-meta">
            <span>Duration</span>
            <strong>{runCount ? "1.9 sec · simulated" : "—"}</strong>
          </div>
          <p className="preview-disclaimer">
            This result is illustrative mock data. It does not reflect live
            cluster health.
          </p>
        </UI.Card>
      </div>
    </>
  );
}
