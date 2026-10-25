import { Geometry, Mesh, Program, Renderer, Triangle } from "ogl";
import { type CSSProperties, useEffect, useMemo, useRef } from "react";

type Preset =
  | "plasma"
  | "aurora"
  | "nebula"
  | "ember"
  | "frost"
  | "solar"
  | "eclipse"
  | "abyss";
type Motion = "rise" | "fall" | "drift" | "orbit";
type Theme = "dark" | "light";
export interface CrystalizedBallProps {
  preset?: Preset;
  color?: string;
  theme?: Theme;
  size?: number;
  strands?: number;
  crackle?: number;
  flares?: number;
  glow?: number;
  sparks?: number;
  particleCount?: number;
  fill?: number;
  motion?: Motion;
  particleShape?: "square" | "round";
  depth?: number;
  sway?: number;
  twinkle?: number;
  haze?: number;
  speed?: number;
  dustSpeed?: number;
  interactive?: boolean;
  hoverStrength?: number;
  intro?: boolean;
  paused?: boolean;
  className?: string;
  style?: CSSProperties;
}

const presets: Record<
  Preset,
  { color: string; motion: Motion; count: number }
> = {
  plasma: { color: "#f25bd0", motion: "rise", count: 7000 },
  aurora: { color: "#5cffc8", motion: "rise", count: 7000 },
  nebula: { color: "#9478ff", motion: "rise", count: 8000 },
  ember: { color: "#ff8a2a", motion: "rise", count: 6000 },
  frost: { color: "#bfe6ff", motion: "fall", count: 7000 },
  solar: { color: "#ffd36e", motion: "orbit", count: 7000 },
  eclipse: { color: "#ffffff", motion: "drift", count: 6500 },
  abyss: { color: "#3f7bff", motion: "orbit", count: 8000 },
};

const fieldVertex = `#version 300 es
in vec2 position; void main(){gl_Position=vec4(position,0.0,1.0);}`;
const fieldFragment = `#version 300 es
precision highp float; uniform vec2 uSize; uniform float uTime,uCrackle,uGlow,uFlares,uPresence,uLight,uRadius; uniform vec3 uColor; out vec4 outColor;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec2 p=(gl_FragCoord.xy-0.5*uSize)/min(uSize.x,uSize.y); float r=length(p); float a=atan(p.y,p.x); float t=uTime;
float jitter=uCrackle*(0.010*sin(a*23.0+t*2.2)+0.006*sin(a*61.0-t*3.1)+0.003*(h(vec2(floor(a*110.0),floor(t*18.0)))-.5));
float d=abs(r-(uRadius+jitter)); float core=exp(-d*d/0.000055); float aura=exp(-d*d/0.0018);
float flare=pow(max(0.0,sin(a*3.0-t*.6)*.5+.5),8.0)*exp(-d*d/0.008)*uFlares;
float halo=exp(-pow((r-uRadius*1.07)/.055,2.0))*uGlow; float interior=exp(-pow(r/(uRadius*.9),2.0))*0.025;
vec3 hot=mix(uColor,vec3(1.0),.72); vec3 c=uColor*(aura*.28+halo*.22+flare*.5+interior)+hot*(core*.85+flare*.8);
float alpha=(aura*.24+halo*.18+flare*.5+core*.92+interior)*uPresence;
if(uLight>.5){c=mix(c,vec3(0.035),.12);alpha=clamp(alpha,0.,.86);} outColor=vec4(c*alpha,alpha);}`;

const dustVertex = `#version 300 es
precision highp float; in vec2 position; in float aSeed; uniform vec2 uSize; uniform float uTime,uSpeed,uMotion,uFill,uDepth,uTwinkle,uRadius; out float vAlpha;
float hash(float x){return fract(sin(x*127.1)*43758.5453);}
void main(){float t=uTime*uSpeed; float y=position.y; float phase=fract(aSeed+t*(uMotion<.5?.12:uMotion<1.5?-.12:.055));
if(uMotion<1.5)y=fract(y+(uMotion<.5?phase:1.-phase)) *1.7-.85;
float x=position.x+sin(t*.4+aSeed*45.)*.018; float spread=mix(.84,.42,uFill); x*=spread;
float a=atan(y,x); float radius=uRadius; float edge=length(vec2(x,y)); if(edge>radius*.94){x*=radius*.94/edge;y*=radius*.94/edge;}
float depth=1.0-uDepth*(.15+.25*sin(aSeed*29.)); float twinkle=mix(1.,.35+.65*sin(t*2.+aSeed*99.)*.5+.325,uTwinkle);
vec2 clip=vec2(x,y)*2.25; gl_Position=vec4(clip,0.,1.); gl_PointSize=clamp((1.0+depth*1.4)*uSize.y/480.,1.0,3.5); vAlpha=(.25+.65*hash(aSeed))*depth*twinkle;}`;
const dustFragment = `#version 300 es
precision highp float; uniform vec3 uColor; uniform float uLight; in float vAlpha; out vec4 outColor;
void main(){vec2 p=gl_PointCoord-.5; float a=1.-smoothstep(.15,.5,length(p)); if(a<.01)discard; vec3 c=mix(uColor,vec3(1.),.35); float alpha=a*vAlpha*(uLight>.5?.7:1.); outColor=vec4(c*alpha,alpha);}`;

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

/** GPU-rendered glass orb. Particle count is capped to keep the demo responsive on integrated graphics. */
export default function CrystalizedBall({
  preset = "plasma",
  color,
  theme = "dark",
  size = 0.7,
  strands: _strands,
  crackle = 0.7,
  flares = 0.55,
  glow = 0.8,
  sparks: _sparks,
  particleCount,
  fill = 0.5,
  motion,
  particleShape: _particleShape,
  depth = 0.6,
  sway: _sway,
  twinkle = 0.5,
  haze: _haze,
  speed = 1,
  dustSpeed = 1,
  interactive = true,
  hoverStrength = 0.7,
  intro = true,
  paused = false,
  className = "",
  style,
}: CrystalizedBallProps) {
  const container = useRef<HTMLDivElement>(null);
  const wake = useRef<(() => void) | null>(null);
  const settings = useRef({
    color: color ?? presets[preset].color,
    theme,
    size,
    crackle,
    flares,
    glow,
    fill,
    motion: motion ?? presets[preset].motion,
    depth,
    twinkle,
    speed,
    dustSpeed,
    interactive,
    hoverStrength,
    intro,
    paused,
  });
  settings.current = {
    color: color ?? presets[preset].color,
    theme,
    size,
    crackle,
    flares,
    glow,
    fill,
    motion: motion ?? presets[preset].motion,
    depth,
    twinkle,
    speed,
    dustSpeed,
    interactive,
    hoverStrength,
    intro,
    paused,
  };
  const count = clamp(
    Math.round(particleCount ?? presets[preset].count),
    0,
    8000,
  );
  const points = useMemo(() => {
    let seed = 1337;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const positions = new Float32Array(count * 2),
      seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = random() * Math.PI * 2,
        r = Math.sqrt(random()) * 0.325;
      positions[i * 2] = Math.cos(a) * r;
      positions[i * 2 + 1] = Math.sin(a) * r;
      seeds[i] = random();
    }
    return { positions, seeds };
  }, [count]);

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
        powerPreference: "low-power",
      });
    } catch {
      return;
    }
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.cssText = "display:block;width:100%;height:100%";
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);
    const fieldUniforms = {
      uSize: { value: [1, 1] },
      uTime: { value: 0 },
      uCrackle: { value: 0.7 },
      uGlow: { value: 0.8 },
      uFlares: { value: 0.5 },
      uPresence: { value: 1 },
      uLight: { value: 0 },
      uRadius: { value: settings.current.size * 0.5 },
      uColor: { value: [1, 0.3, 0.8] },
    };
    const dustUniforms = {
      uSize: { value: [1, 1] },
      uTime: { value: 0 },
      uSpeed: { value: 1 },
      uMotion: { value: 0 },
      uFill: { value: 0.5 },
      uDepth: { value: 0.6 },
      uTwinkle: { value: 0.5 },
      uRadius: { value: settings.current.size * 0.5 },
      uLight: { value: 0 },
      uColor: { value: [1, 0.3, 0.8] },
    };
    const field = new Mesh(gl, {
      geometry: new Triangle(gl),
      program: new Program(gl, {
        vertex: fieldVertex,
        fragment: fieldFragment,
        uniforms: fieldUniforms,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    });
    const dustGeometry = new Geometry(gl, {
      position: { size: 2, data: points.positions },
      aSeed: { size: 1, data: points.seeds },
    });
    const dust = new Mesh(gl, {
      geometry: dustGeometry,
      mode: gl.POINTS,
      program: new Program(gl, {
        vertex: dustVertex,
        fragment: dustFragment,
        uniforms: dustUniforms,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    });
    let raf = 0,
      visible = true,
      start = performance.now(),
      pointer = false;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    const resize = () =>
      renderer.setSize(
        Math.max(1, host.clientWidth),
        Math.max(1, host.clientHeight),
      );
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(draw);
    });
    io.observe(host);
    const onMove = (event: PointerEvent) => {
      const r = host.getBoundingClientRect();
      pointer =
        event.clientX >= r.left &&
        event.clientX <= r.right &&
        event.clientY >= r.top &&
        event.clientY <= r.bottom;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const draw = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const s = settings.current;
      const t = (now - start) / 1000;
      const color = THREEColor(s.color);
      const presence = s.intro && !reducedMotion ? clamp(t / 1.1, 0, 1) : 1;
      fieldUniforms.uSize.value = [renderer.width, renderer.height];
      dustUniforms.uSize.value = [renderer.width, renderer.height];
      fieldUniforms.uTime.value = t * s.speed;
      fieldUniforms.uCrackle.value = clamp(
        s.crackle + (pointer && s.interactive ? s.hoverStrength * 0.16 : 0),
        0,
        1.5,
      );
      fieldUniforms.uGlow.value = s.glow;
      fieldUniforms.uFlares.value = s.flares;
      fieldUniforms.uPresence.value = presence;
      fieldUniforms.uLight.value = s.theme === "light" ? 1 : 0;
      fieldUniforms.uColor.value = color;
      fieldUniforms.uRadius.value = clamp(s.size, 0.1, 1.5) * 0.5;
      dustUniforms.uTime.value = t;
      dustUniforms.uSpeed.value = s.dustSpeed;
      dustUniforms.uMotion.value =
        s.motion === "rise"
          ? 0
          : s.motion === "fall"
            ? 1
            : s.motion === "drift"
              ? 2
              : 3;
      dustUniforms.uFill.value = s.fill;
      dustUniforms.uDepth.value = s.depth;
      dustUniforms.uTwinkle.value = s.twinkle;
      dustUniforms.uRadius.value = clamp(s.size, 0.1, 1.5) * 0.5;
      dustUniforms.uLight.value = s.theme === "light" ? 1 : 0;
      dustUniforms.uColor.value = color;
      renderer.render({ scene: field });
      renderer.render({ scene: dust });
      if (!s.paused && !reducedMotion) raf = requestAnimationFrame(draw);
    };
    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      if (!event.matches && visible && !raf) raf = requestAnimationFrame(draw);
    };
    motionQuery.addEventListener("change", onMotionChange);
    const onVisibility = () => {
      if (!document.hidden && visible && !raf)
        raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVisibility);
    wake.current = () => {
      if (!raf && visible) raf = requestAnimationFrame(draw);
    };
    wake.current();
    return () => {
      wake.current = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", onMotionChange);
      field.geometry.remove();
      dust.geometry.remove();
      (field.program as Program).remove();
      (dust.program as Program).remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [points]);

  useEffect(() => {
    // ORIGINAL (preserved, not deleted — disabled by comment): if (!paused) wake.current?.();
    wake.current?.();
  });

  return (
    <div
      ref={container}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...style,
      }}
      role="img"
      aria-label="Animated particle orb"
    />
  );
}

function THREEColor(value: string): [number, number, number] {
  const color = value.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!color) return [0.95, 0.36, 0.82];
  return [
    Number.parseInt(color[1], 16) / 255,
    Number.parseInt(color[2], 16) / 255,
    Number.parseInt(color[3], 16) / 255,
  ];
}
