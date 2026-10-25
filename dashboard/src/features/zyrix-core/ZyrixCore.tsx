import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Group,
  LineBasicMaterial,
  LineLoop,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from "three";
import "./zyrix-core.css";

export type ZyrixQuality = "performance" | "standard" | "cinematic";

const QUALITY = {
  performance: { particles: 1200, dpr: 1, size: 0.025 },
  standard: { particles: 4800, dpr: 1.5, size: 0.018 },
  cinematic: { particles: 10000, dpr: 1.75, size: 0.014 },
} satisfies Record<
  ZyrixQuality,
  { particles: number; dpr: number; size: number }
>;

function makeCloud(count: number, inner: boolean) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const a = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = golden * i;
    const radius = inner
      ? 0.18 + 0.48 * Math.cbrt(((i * 37) % count) / count)
      : 0.77 + 0.055 * Math.sin(i * 0.31);
    const offset = i * 3;
    positions[offset] = Math.cos(angle) * ring * radius;
    positions[offset + 1] = y * radius;
    positions[offset + 2] = Math.sin(angle) * ring * radius;
    const tint = (i % 7) / 7;
    colors[offset] = 0.46 + tint * 0.19;
    colors[offset + 1] = 0.39 + tint * 0.12;
    colors[offset + 2] = 0.7 + tint * 0.22;
    a[i] = (i % 11) / 10;
  }
  return { positions, colors, seeds: a };
}

function makeOrbit(tilt: number, flatten: number) {
  const points: number[] = [];
  for (let i = 0; i < 128; i += 1) {
    const angle = (i / 128) * Math.PI * 2;
    const x = Math.cos(angle) * 1.02;
    const z = Math.sin(angle) * 1.02 * flatten;
    points.push(x, z * Math.sin(tilt), z * Math.cos(tilt));
  }
  return new BufferGeometry().setAttribute(
    "position",
    new BufferAttribute(new Float32Array(points), 3),
  );
}

export function ZyrixCore({
  quality = "standard",
  paused = false,
  className = "",
}: {
  quality?: ZyrixQuality;
  paused?: boolean;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const shouldAnimate = !paused && !reducedMotion;
  const animateRef = useRef(shouldAnimate);
  const wakeRef = useRef<(() => void) | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    animateRef.current = shouldAnimate;
    wakeRef.current?.();
  }, [shouldAnimate]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    setWebglFailed(false);
    const config = QUALITY[quality];
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, config.dpr));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    element.appendChild(renderer.domElement);
    const scene = new Scene();
    const camera = new PerspectiveCamera(34, 1, 0.1, 20);
    camera.position.z = 3.6;
    const root = new Group();
    scene.add(root);

    const geometry: BufferGeometry[] = [];
    const materials: PointsMaterial[] = [];
    const layers = [
      {
        count: Math.round(config.particles * 0.62),
        inner: true,
        opacity: 0.5,
        size: config.size,
      },
      {
        count: config.particles - Math.round(config.particles * 0.62),
        inner: false,
        opacity: 0.74,
        size: config.size * 0.8,
      },
    ];
    for (const layer of layers) {
      const cloud = makeCloud(layer.count, layer.inner);
      const pointsGeometry = new BufferGeometry();
      pointsGeometry.setAttribute(
        "position",
        new BufferAttribute(cloud.positions, 3),
      );
      pointsGeometry.setAttribute(
        "color",
        new BufferAttribute(cloud.colors, 3),
      );
      geometry.push(pointsGeometry);
      const material = new PointsMaterial({
        size: layer.size,
        vertexColors: true,
        transparent: true,
        opacity: layer.opacity,
        depthWrite: false,
        sizeAttenuation: true,
      });
      materials.push(material);
      root.add(new Points(pointsGeometry, material));
    }

    const orbitMaterials: LineBasicMaterial[] = [];
    const orbitGeometries: BufferGeometry[] = [];
    const orbits = new Group();
    root.add(orbits);
    [
      { tilt: 0.34, flatten: 0.64, color: 0x9b8bbd, opacity: 0.28 },
      { tilt: 1.05, flatten: 0.72, color: 0x7180a8, opacity: 0.2 },
      { tilt: -0.72, flatten: 0.55, color: 0xb1a0d2, opacity: 0.18 },
    ].forEach((orbit) => {
      const orbitGeometry = makeOrbit(orbit.tilt, orbit.flatten);
      const orbitMaterial = new LineBasicMaterial({
        color: orbit.color,
        transparent: true,
        opacity: orbit.opacity,
        depthWrite: false,
      });
      orbitGeometries.push(orbitGeometry);
      orbitMaterials.push(orbitMaterial);
      orbits.add(new LineLoop(orbitGeometry, orbitMaterial));
    });

    const resize = () => {
      const width = Math.max(1, element.clientWidth);
      const height = Math.max(1, element.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(element);
    resize();

    let visible = true;
    let raf = 0;
    let time = 0;
    let last = 0;
    const render = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const delta = last ? Math.min((now - last) / 1000, 0.04) : 0;
      last = now;
      if (animateRef.current) {
        time += delta;
        root.rotation.y = time * 0.075;
        root.rotation.x = Math.sin(time * 0.22) * 0.035;
        orbits.rotation.y = -time * 0.055;
        orbits.rotation.z = Math.sin(time * 0.18) * 0.025;
      }
      renderer.render(scene, camera);
      if (animateRef.current) raf = requestAnimationFrame(render);
    };
    const start = () => {
      if (!raf && visible && !document.hidden && animateRef.current)
        raf = requestAnimationFrame(render);
      if (!animateRef.current && !document.hidden && visible)
        render(performance.now());
    };
    wakeRef.current = start;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else start();
    });
    observer.observe(element);
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else start();
    };
    document.addEventListener("visibilitychange", visibility);
    const lost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(raf);
      raf = 0;
      setWebglFailed(true);
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    start();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      geometry.forEach((item) => {
        item.dispose();
      });
      orbitGeometries.forEach((item) => {
        item.dispose();
      });
      materials.forEach((item) => {
        item.dispose();
      });
      orbitMaterials.forEach((item) => {
        item.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
      wakeRef.current = null;
    };
  }, [quality]);

  /* ORIGINAL (preserved, not deleted — disabled by comment):
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    wakeRef.current?.();
  }, [shouldAnimate]);
  */

  return (
    <div
      className={`zyrix-core ${className}`}
      role="img"
      aria-label="Z.Y.R.I.X, OpenCluster AI Orchestrator"
    >
      <div
        className={`zyrix-core-scene${webglFailed ? " is-fallback" : ""}`}
        ref={host}
      >
        <div className="zyrix-core-aura" aria-hidden="true" />
      </div>
      <div className="zyrix-core-label">
        <strong>Z.Y.R.I.X</strong>
        <span>OpenCluster AI</span>
        <small>Orchestrator</small>
        {webglFailed && (
          <small className="zyrix-core-status">
            WebGL unavailable · static view
          </small>
        )}
      </div>
    </div>
  );
}

export default ZyrixCore;
