/* ORIGINAL (preserved, not deleted — disabled by comment):
import { useMemo } from "react";
import { Cpu, Server, X } from "lucide-react";
import type { Node } from "../data/models";
import { useDashboardStore } from "../state/useDashboardStore";
import { Button, HealthBadge, Progress } from "./ui";

export function Topology({ nodes, layout = "topology" }: { nodes: Node[]; layout?: "topology" | "orbit" }) {
  const selectedNodeId = useDashboardStore((state) => state.selectedNodeId); const selectNode = useDashboardStore((state) => state.selectNode);
  const coordinator = nodes.find((node) => node.role === "coordinator") ?? nodes[0]; const workers = nodes.filter((node) => node.id !== coordinator?.id);
  const positions = useMemo(() => workers.map((node, index) => ({ node, x: 25 + index * (50 / Math.max(workers.length - 1, 1)), y: index % 2 === 0 ? 73 : 82 })), [workers]);
  const selected = nodes.find((node) => node.id === selectedNodeId);
  return <div className="topology-layout"><div className="topology-board" role="group" aria-label="Interactive demo cluster topology"><div className="topology-grid" />{coordinator && <><svg className="topology-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{positions.map(({ node, x, y }) => <line key={node.id} x1="50" y1="35" x2={x} y2={y} className={`link-line ${node.health}`} />)}</svg><button className={`topology-node coordinator-node ${selectedNodeId === coordinator.id ? "selected" : ""}`} onClick={() => selectNode(coordinator.id)} aria-label={`Select coordinator ${coordinator.name}`}><span className="node-pulse" /><span className="node-avatar"><Cpu size={20} /></span><span className="node-name">{coordinator.name}</span><span className="node-role">COORDINATOR</span></button>{positions.map(({ node, x, y }) => <button key={node.id} className={`topology-node worker-node ${node.health} ${selectedNodeId === node.id ? "selected" : ""}`} style={{ left: `${x}%`, top: `${y}%` }} onClick={() => selectNode(node.id)} aria-label={`Select worker ${node.name}`}><span className="worker-dot" /><span className="node-name">{node.name}</span><span className="node-role">{node.health === "offline" ? "OFFLINE" : "WORKER"}</span></button>)}</>}
    <div className="topology-caption"><span className="live-dot" /> DEMO TOPOLOGY <span>·</span> {nodes.length} SAMPLE NODES</div></div>{selected ? <aside className="topology-detail"><div className="detail-head"><div><span className="eyebrow">NODE DETAIL</span><h3>{selected.name}</h3></div><Button variant="ghost" aria-label="Close node details" onClick={() => selectNode(null)}><X size={15} /></Button></div><HealthBadge health={selected.health} /><p className="muted">{selected.host} · {selected.os}</p><div className="detail-metrics"><div><span>CPU</span><b>{selected.cpu}%</b><Progress value={selected.cpu} /></div><div><span>Memory</span><b>{selected.memory}%</b><Progress value={selected.memory} tone="purple" /></div></div><div className="detail-row"><Server size={14} />{selected.role === "coordinator" ? "Coordinator" : "Worker node"}</div><div className="detail-row">Uptime <b>{selected.uptime}</b></div><div className="detail-row">Last sample <b>{selected.lastSeen}</b></div><p className="demo-note">Sample values only. No node is connected.</p></aside> : <aside className="topology-hint"><div className="hint-icon"><Server size={20} /></div><strong>Select a node</strong><p>Choose a node in the topology to inspect its sample status and resources.</p></aside>}</div>;
}
*/

import {
  Cpu,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RotateCcw,
  Server,
  X,
} from "lucide-react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Node } from "../data/models";
import { useDashboardStore } from "../state/useDashboardStore";
import { Button, HealthBadge, Progress } from "./ui";

type PanPosition = { x: number; y: number };

export function Topology({
  nodes,
  layout = "topology",
}: {
  nodes: Node[];
  layout?: "topology" | "orbit";
}) {
  const selectedNodeId = useDashboardStore((state) => state.selectedNodeId);
  const selectNode = useDashboardStore((state) => state.selectNode);
  const coordinator =
    nodes.find((node) => node.role === "coordinator") ?? nodes[0];
  const workers = nodes.filter((node) => node.id !== coordinator?.id);
  const positions = useMemo(
    () =>
      workers.map((node, index) => {
        const angle =
          (index / Math.max(workers.length, 1)) * Math.PI * 2 - Math.PI / 2;
        return layout === "orbit"
          ? { node, x: 50 + Math.cos(angle) * 32, y: 50 + Math.sin(angle) * 32 }
          : {
              node,
              x: 25 + index * (50 / Math.max(workers.length - 1, 1)),
              y: index % 2 === 0 ? 73 : 82,
            };
      }),
    [workers, layout],
  );
  const selected = nodes.find((node) => node.id === selectedNodeId);
  const board = useRef<HTMLFieldSetElement>(null);
  const drag = useRef<{
    pointerId: number;
    origin: PanPosition;
    start: PanPosition;
  } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<PanPosition>({ x: 0, y: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");

  useEffect(() => {
    const update = () =>
      setFullscreen(document.fullscreenElement === board.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  const changeZoom = (delta: number) =>
    setZoom((value) =>
      Math.max(0.65, Math.min(1.6, Number((value + delta).toFixed(2)))),
    );
  const startPan = (event: ReactPointerEvent<HTMLFieldSetElement>) => {
    if (event.target instanceof HTMLElement && event.target.closest("button"))
      return;
    if (event.button !== 0) return;
    drag.current = {
      pointerId: event.pointerId,
      origin: pan,
      start: { x: event.clientX, y: event.clientY },
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const movePan = (event: ReactPointerEvent<HTMLFieldSetElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    setPan({
      x: drag.current.origin.x + event.clientX - drag.current.start.x,
      y: drag.current.origin.y + event.clientY - drag.current.start.y,
    });
  };
  const stopPan = (event: ReactPointerEvent<HTMLFieldSetElement>) => {
    if (drag.current?.pointerId === event.pointerId) drag.current = null;
  };
  const toggleFullscreen = async () => {
    if (!board.current) return;
    try {
      if (document.fullscreenElement === board.current)
        await document.exitFullscreen();
      else await board.current.requestFullscreen();
      setFullscreenError("");
    } catch {
      setFullscreenError("Fullscreen is unavailable in this browser context.");
    }
  };
  const handleBoardKeyDown = (
    event: ReactKeyboardEvent<HTMLFieldSetElement>,
  ) => {
    if (event.key === "ArrowLeft")
      setPan((value) => ({ ...value, x: value.x + 24 }));
    if (event.key === "ArrowRight")
      setPan((value) => ({ ...value, x: value.x - 24 }));
    if (event.key === "ArrowUp")
      setPan((value) => ({ ...value, y: value.y + 24 }));
    if (event.key === "ArrowDown")
      setPan((value) => ({ ...value, y: value.y - 24 }));
    if (event.key === "+" || event.key === "=") changeZoom(0.1);
    if (event.key === "-") changeZoom(-0.1);
    if (event.key === "0") {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "+",
        "=",
        "-",
        "0",
      ].includes(event.key)
    )
      event.preventDefault();
  };

  return (
    <div className="topology-layout">
      <fieldset
        ref={board}
        className={`topology-board ${layout === "orbit" ? "orbit-layout" : ""}`}
        onKeyDown={handleBoardKeyDown}
        aria-describedby="topology-key-help"
        onPointerDown={startPan}
        onPointerMove={movePan}
        onPointerUp={stopPan}
        onPointerCancel={stopPan}
      >
        <legend className="sr-only">Interactive demo cluster topology</legend>
        <div className="topology-grid" />
        {layout === "orbit" && (
          <div className="orbit-rings" aria-hidden="true">
            <span />
            <span />
          </div>
        )}
        <div
          className="topology-stage"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {coordinator && (
            <>
              <svg
                className="topology-links"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {positions.map(({ node, x, y }) => (
                  <line
                    key={node.id}
                    x1="50"
                    y1={layout === "orbit" ? 50 : 35}
                    x2={x}
                    y2={y}
                    className={`link-line ${node.health}`}
                  />
                ))}
              </svg>
              <button
                type="button"
                className={`topology-node coordinator-node ${selectedNodeId === coordinator.id ? "selected" : ""}`}
                onClick={() => selectNode(coordinator.id)}
                aria-label={`Select coordinator ${coordinator.name}`}
              >
                <span className="node-pulse" />
                <span className="node-avatar">
                  <Cpu size={20} />
                </span>
                <span className="node-name">{coordinator.name}</span>
                <span className="node-role">COORDINATOR</span>
              </button>
              {positions.map(({ node, x, y }) => (
                <button
                  type="button"
                  key={node.id}
                  className={`topology-node worker-node ${node.health} ${selectedNodeId === node.id ? "selected" : ""}`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => selectNode(node.id)}
                  aria-label={`Select worker ${node.name}`}
                >
                  <span className="worker-dot" />
                  <span className="node-name">{node.name}</span>
                  <span className="node-role">
                    {node.health === "offline" ? "OFFLINE" : "WORKER"}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
        <fieldset className="topology-controls">
          <legend className="sr-only">Topology view controls</legend>
          <span className="zoom-label">{Math.round(zoom * 100)}%</span>
          <Button
            aria-label="Zoom out"
            title="Zoom out"
            onClick={() => changeZoom(-0.1)}
          >
            <Minus size={13} />
          </Button>
          <Button
            aria-label="Zoom in"
            title="Zoom in"
            onClick={() => changeZoom(0.1)}
          >
            <Plus size={13} />
          </Button>
          <Button
            aria-label="Reset zoom and pan"
            title="Reset view"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            <RotateCcw size={13} />
          </Button>
          <Button
            aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            onClick={() => void toggleFullscreen()}
          >
            {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </Button>
        </fieldset>
        <div className="topology-caption">
          <span className="live-dot" /> DEMO TOPOLOGY <span>·</span>{" "}
          {nodes.length} SAMPLE NODES <span>·</span> DRAG TO PAN
        </div>
      </fieldset>
      {fullscreenError && (
        <p className="topology-error" role="status">
          {fullscreenError}
        </p>
      )}
      <span className="sr-only" id="topology-key-help">
        Drag to pan, use arrow keys to pan, plus and minus to zoom, and zero to
        reset.
      </span>
      {selected ? (
        <aside className="topology-detail">
          <div className="detail-head">
            <div>
              <span className="eyebrow">NODE DETAIL</span>
              <h3>{selected.name}</h3>
            </div>
            <Button
              variant="ghost"
              aria-label="Close node details"
              onClick={() => selectNode(null)}
            >
              <X size={15} />
            </Button>
          </div>
          <HealthBadge health={selected.health} />
          <p className="muted">
            {selected.host} · {selected.os}
          </p>
          <div className="detail-metrics">
            <div>
              <span>CPU</span>
              <b>{selected.cpu}%</b>
              <Progress value={selected.cpu} />
            </div>
            <div>
              <span>Memory</span>
              <b>{selected.memory}%</b>
              <Progress value={selected.memory} tone="purple" />
            </div>
          </div>
          <div className="detail-row">
            <Server size={14} />
            {selected.role === "coordinator" ? "Coordinator" : "Worker node"}
          </div>
          <div className="detail-row">
            Uptime <b>{selected.uptime}</b>
          </div>
          <div className="detail-row">
            Last sample <b>{selected.lastSeen}</b>
          </div>
          <p className="demo-note">Sample values only. No node is connected.</p>
        </aside>
      ) : (
        <aside className="topology-hint">
          <div className="hint-icon">
            <Server size={20} />
          </div>
          <strong>Select a node</strong>
          <p>
            Choose a node in the topology to inspect its sample status and
            resources.
          </p>
        </aside>
      )}
    </div>
  );
}
