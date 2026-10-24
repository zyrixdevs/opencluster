import { type HTMLAttributes, type RefObject, useEffect, useRef } from "react";
import * as THREE from "three";

export interface LaserFlowProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  surfaceRef?: RefObject<HTMLElement | null>;
  beamPosition?: number;
  surfaceLevel?: number;
  color?: string;
  intensity?: number;
  beamWidth?: number;
  flare?: number;
  spread?: number;
  spill?: number;
  fog?: number;
  dust?: number;
  streaks?: number;
  dots?: number;
  pulse?: number;
  speed?: number;
  seed?: number;
  mouseInteraction?: boolean;
  revealImage?: string;
  revealRadius?: number;
  revealOpacity?: number;
  intro?: boolean;
  theme?: "dark" | "light";
  paused?: boolean;
  dpr?: number;
}

const vertex = `void main(){ gl_Position = vec4(position, 1.0); }`;
const fragment = `precision highp float;
uniform vec2 uSize; uniform float uTime; uniform float uBeam; uniform float uSurface;
uniform vec3 uColor; uniform float uIntensity; uniform float uWidth; uniform float uFlare;
uniform float uSpread; uniform float uFog; uniform float uMouse; uniform vec2 uPointer;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y); }
void main(){
 vec2 uv=gl_FragCoord.xy/uSize; float x=uv.x; float y=1.0-uv.y;
 float landing=uSurface; float dx=abs(x-uBeam); float above=max(landing-y,0.0);
 float beam=exp(-dx*dx/max(0.00002,uWidth*uWidth))*smoothstep(landing+0.03,landing-0.01,y);
 float flare=exp(-dx*dx/max(0.0002,uFlare*uFlare))*exp(-pow((y-landing)/0.026,2.0));
 float wash=exp(-dx/max(0.001,uSpread*0.22))*exp(-abs(y-landing)/0.035);
 float fog=noise(vec2(x*22.0+y*3.0,uTime*0.07))*exp(-dx*7.0)*exp(-above*2.5)*uFog;
 float cursor=exp(-dot((uv-uPointer)*uSize, (uv-uPointer)*uSize)/18000.0)*uMouse;
 float energy=(beam*1.7+flare*2.4+wash*0.5+fog*0.32+cursor*flare)*uIntensity;
 vec3 col=uColor*energy; col+=vec3(0.65,0.85,1.0)*flare*0.6*uIntensity;
 gl_FragColor=vec4(col,clamp(energy,0.0,0.92));
}`;

export default function LaserFlow({
  surfaceRef,
  beamPosition = 0.6,
  surfaceLevel = 0.7,
  color = "#3847ff",
  intensity = 1.4,
  beamWidth = 0.008,
  flare = 0.07,
  spread = 1,
  fog = 0.2,
  mouseInteraction = true,
  speed = 1,
  paused = false,
  theme = "dark",
  dpr = 1.5,
  className = "",
  style,
  ...props
}: LaserFlowProps) {
  const host = useRef<HTMLDivElement>(null);
  const wake = useRef<(() => void) | null>(null);
  const live = useRef({
    beamPosition,
    surfaceLevel,
    color,
    intensity,
    beamWidth,
    flare,
    spread,
    fog,
    mouseInteraction,
    speed,
    paused,
    theme,
  });
  live.current = {
    beamPosition,
    surfaceLevel,
    color,
    intensity,
    beamWidth,
    flare,
    spread,
    fog,
    mouseInteraction,
    speed,
    paused,
    theme,
  };

  useEffect(() => {
    const root = host.current;
    if (!root) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
    } catch {
      return;
    }
    renderer.setClearColor(0, 0);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2, Math.max(1, dpr)),
    );
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uSize: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uBeam: { value: live.current.beamPosition },
      uSurface: { value: live.current.surfaceLevel },
      uColor: { value: new THREE.Color(live.current.color) },
      uIntensity: { value: live.current.intensity },
      uWidth: { value: live.current.beamWidth },
      uFlare: { value: live.current.flare },
      uSpread: { value: live.current.spread },
      uFog: { value: live.current.fog },
      uMouse: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms,
      transparent: true,
      depthWrite: false,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));
    root.appendChild(renderer.domElement);
    const resize = () => {
      const rect = root.getBoundingClientRect();
      renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
      uniforms.uSize.value.set(
        renderer.domElement.width,
        renderer.domElement.height,
      );
    };
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    resize();
    let visible = true,
      raf = 0,
      start = performance.now();
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(draw);
    });
    intersection.observe(root);
    const move = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        uniforms.uMouse.value = 0;
        return;
      }
      uniforms.uPointer.value.set(
        (event.clientX - rect.left) / rect.width,
        1 - (event.clientY - rect.top) / rect.height,
      );
      uniforms.uMouse.value = live.current.mouseInteraction ? 1 : 0;
    };
    window.addEventListener("pointermove", move, { passive: true });
    const draw = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const p = live.current;
      uniforms.uBeam.value = p.beamPosition;
      uniforms.uSurface.value = p.surfaceLevel;
      if (surfaceRef?.current) {
        const a = root.getBoundingClientRect(),
          b = surfaceRef.current.getBoundingClientRect();
        uniforms.uSurface.value = THREE.MathUtils.clamp(
          (b.top - a.top) / Math.max(1, a.height),
          0,
          1,
        );
      }
      uniforms.uColor.value.set(p.color);
      uniforms.uIntensity.value = p.intensity;
      uniforms.uWidth.value = p.beamWidth;
      uniforms.uFlare.value = p.flare * 0.07;
      uniforms.uSpread.value = p.spread;
      uniforms.uFog.value = p.fog;
      uniforms.uTime.value = (now - start) * 0.001 * p.speed;
      if (
        !p.paused &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        renderer.render(scene, camera);
      else if (p.paused) renderer.render(scene, camera);
      if (
        !p.paused &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        raf = requestAnimationFrame(draw);
    };
    const onVisibility = () => {
      if (!document.hidden && visible && !raf)
        raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVisibility);
    wake.current = () => {
      if (!raf && visible) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      wake.current = null;
      cancelAnimationFrame(raf);
      observer.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", move);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [dpr, surfaceRef]);

  useEffect(() => {
    wake.current?.();
  });

  return (
    <div
      ref={host}
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        ...style,
      }}
      {...props}
    />
  );
}
