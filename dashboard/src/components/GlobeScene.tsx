import { useReducedMotion } from "framer-motion";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import type { Node } from "../data/models";
import { useDashboardStore } from "../state/useDashboardStore";
import { Button, HealthBadge } from "./ui";

function nodePosition(index: number, count: number) {
  const y = 1 - ((index + 0.5) / count) * 2;
  const radius = Math.sqrt(1 - y * y);
  const theta = Math.PI * (3 - Math.sqrt(5)) * index;
  return new Vector3(
    Math.cos(theta) * radius,
    y,
    Math.sin(theta) * radius,
  ).multiplyScalar(1.12);
}

export function GlobeScene({ nodes }: { nodes: Node[] }) {
  const canvasHost = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const zoomRef = useRef(4.2);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(4.2);
  const selectedNodeId = useDashboardStore((state) => state.selectedNodeId);
  const selectNode = useDashboardStore((state) => state.selectNode);
  const demoMotion = useDashboardStore((state) => state.demoMotion);
  const performanceMode = useDashboardStore((state) => state.performanceMode);
  const visualQuality = useDashboardStore((state) => state.visualQuality);
  const reducedMotion = useReducedMotion();
  const animate = demoMotion && !performanceMode && !reducedMotion;

  useEffect(() => {
    const host = canvasHost.current;
    if (!host || nodes.length === 0) return;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
    } catch {
      setFailed(true);
      return;
    }
    const scene = new Scene();
    const camera = new PerspectiveCamera(42, 1, 0.1, 30);
    camera.position.z = zoomRef.current;
    cameraRef.current = camera;
    const globe = new Group();
    scene.add(globe);
    const sphere = new Mesh(
      new SphereGeometry(1, 32, 24),
      new MeshBasicMaterial({
        color: 0x0b2a3b,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      }),
    );
    globe.add(sphere);
    const dotPositions: number[] = [];
    const dotCount = 360;
    for (let i = 0; i < dotCount; i += 1) {
      const point = nodePosition(i, dotCount).multiplyScalar(0.995);
      dotPositions.push(point.x, point.y, point.z);
    }
    const dotGeometry = new BufferGeometry();
    dotGeometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(dotPositions), 3),
    );
    globe.add(
      new Points(
        dotGeometry,
        new PointsMaterial({
          color: 0x6bbbd0,
          size: 0.012,
          transparent: true,
          opacity: 0.62,
        }),
      ),
    );
    const nodeGeometry = new SphereGeometry(0.035, 10, 8);
    const nodeMeshes: Mesh[] = [];
    const raycaster = new Raycaster();
    const pointer = new Vector2();
    nodes.forEach((node, index) => {
      const position = nodePosition(index, nodes.length);
      const color =
        node.health === "healthy"
          ? 0x77e1d0
          : node.health === "warning"
            ? 0xf0bd72
            : 0x77858d;
      const line = new Line(
        new BufferGeometry().setFromPoints([
          new Vector3(0, 0, 0),
          position.clone().multiplyScalar(0.86),
        ]),
        new LineBasicMaterial({
          color: 0x51abc2,
          transparent: true,
          opacity: 0.24,
        }),
      );
      globe.add(line);
      const mesh = new Mesh(
        nodeGeometry,
        new MeshBasicMaterial({ color: new Color(color) }),
      );
      mesh.position.copy(position);
      mesh.userData.nodeId = node.id;
      globe.add(mesh);
      nodeMeshes.push(mesh);
    });
    setFailed(false);
    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        performanceMode ? 1 : visualQuality === "high" ? 2 : 1.5,
      ),
    );
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");
    let frame = 0;
    let resizeFrame = 0;
    let pointerFrame = 0;
    let dragging = false;
    let moved = false;
    let lastX = 0;
    let lastY = 0;
    const resize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        const { width, height } = host.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      });
    };
    const render = () => {
      if (document.hidden) return;
      if (animate) globe.rotation.y += 0.0012;
      renderer.render(scene, camera);
      if (animate) frame = requestAnimationFrame(render);
    };
    const renderAfterPointer = () => {
      if (animate || pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        renderer.render(scene, camera);
      });
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) render();
    };
    const pointerDown = (event: PointerEvent) => {
      dragging = true;
      moved = false;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const pointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
      globe.rotation.y += dx * 0.006;
      globe.rotation.x = Math.max(
        -0.7,
        Math.min(0.7, globe.rotation.x + dy * 0.004),
      );
      lastX = event.clientX;
      lastY = event.clientY;
      renderAfterPointer();
    };
    const pointerUp = (event: PointerEvent) => {
      dragging = false;
      if (moved) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(nodeMeshes)[0]?.object;
      if (typeof hit?.userData.nodeId === "string")
        selectNode(hit.userData.nodeId);
    };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      camera.position.z = Math.max(
        2.8,
        Math.min(7, camera.position.z + Math.sign(event.deltaY) * 0.25),
      );
      zoomRef.current = camera.position.z;
      setZoom(camera.position.z);
      renderAfterPointer();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", pointerMove);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("pointercancel", pointerUp);
    renderer.domElement.addEventListener("wheel", wheel, { passive: false });
    document.addEventListener("visibilitychange", visibility);
    resize();
    render();
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      cancelAnimationFrame(pointerFrame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointercancel", pointerUp);
      renderer.domElement.removeEventListener("wheel", wheel);
      nodeGeometry.dispose();
      dotGeometry.dispose();
      sphere.geometry.dispose();
      (sphere.material as MeshBasicMaterial).dispose();
      globe.children.forEach((child) => {
        if (child instanceof Line) {
          child.geometry.dispose();
          child.material.dispose();
        }
        if (child instanceof Points) child.material.dispose();
        if (child instanceof Mesh && child !== sphere)
          (child.material as MeshBasicMaterial).dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
      cameraRef.current = null;
    };
  }, [nodes, animate, performanceMode, visualQuality, selectNode]);

  const changeZoom = (delta: number) =>
    setZoom((value) => {
      const next = Math.max(2.8, Math.min(7, value + delta));
      zoomRef.current = next;
      if (cameraRef.current) cameraRef.current.position.z = next;
      return next;
    });
  const resetZoom = () => {
    zoomRef.current = 4.2;
    setZoom(4.2);
    if (cameraRef.current) cameraRef.current.position.z = 4.2;
  };
  const selected = nodes.find((node) => node.id === selectedNodeId);
  return (
    <div className="globe-layout">
      <section
        className="globe-board"
        aria-label="Interactive three-dimensional cluster globe"
      >
        {failed ? (
          <div className="globe-fallback">
            <div className="globe-fallback-orb">
              <span />
            </div>
            <p>
              3D rendering is unavailable. Select a node from the list below.
            </p>
          </div>
        ) : (
          <div ref={canvasHost} className="globe-canvas" />
        )}
        <div className="globe-overline">
          <i /> HOLOGRAPHIC CLUSTER MODEL <span>SIMULATION</span>
        </div>
        <fieldset className="globe-controls">
          <legend className="sr-only">Globe controls</legend>
          <Button
            type="button"
            aria-label="Zoom out"
            onClick={() => changeZoom(-0.3)}
          >
            <Minus size={13} />
          </Button>
          <span>{Math.round((4.2 / zoom) * 100)}%</span>
          <Button
            type="button"
            aria-label="Zoom in"
            onClick={() => changeZoom(0.3)}
          >
            <Plus size={13} />
          </Button>
          <Button
            type="button"
            aria-label="Reset globe view"
            onClick={resetZoom}
          >
            <RotateCcw size={13} />
          </Button>
        </fieldset>
        <fieldset className="globe-node-list">
          <legend className="sr-only">Select a node</legend>
          {nodes.map((node) => (
            <button
              type="button"
              key={node.id}
              aria-pressed={selectedNodeId === node.id}
              className={selectedNodeId === node.id ? "selected" : ""}
              onClick={() => selectNode(node.id)}
            >
              <i className={`health-mini ${node.health}`} />
              {node.name}
            </button>
          ))}
        </fieldset>
      </section>
      <aside className="globe-inspector">
        <span className="eyebrow">NODE INSPECTOR</span>
        {selected ? (
          <>
            <h2>{selected.name}</h2>
            <HealthBadge health={selected.health} />
            <p>
              {selected.host} · {selected.os}
            </p>
            <div className="globe-inspector-metric">
              <span>CPU</span>
              <b>{selected.cpu}%</b>
            </div>
            <div className="globe-inspector-metric">
              <span>MEMORY</span>
              <b>{selected.memory}%</b>
            </div>
            <div className="globe-inspector-metric">
              <span>ROLE</span>
              <b>{selected.role}</b>
            </div>
          </>
        ) : (
          <p>
            Choose a node in the globe or node list to inspect its demo status.
          </p>
        )}
        <small>All positions and values are sample data.</small>
      </aside>
    </div>
  );
}
