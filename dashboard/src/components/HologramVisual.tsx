import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { useDashboardStore } from "../state/useDashboardStore";

const signals = [
  [48, 16],
  [66, 24],
  [79, 42],
  [74, 65],
  [56, 80],
  [33, 73],
  [20, 53],
  [28, 31],
  [50, 28],
  [66, 51],
  [47, 67],
  [35, 46],
] as const;

export function HologramVisual() {
  const root = useRef<HTMLDivElement>(null);
  const demoMotion = useDashboardStore((state) => state.demoMotion);
  const performanceMode = useDashboardStore((state) => state.performanceMode);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!demoMotion || performanceMode || reducedMotion || !root.current)
      return;
    let timeline: gsap.core.Timeline | undefined;
    const context = gsap.context(() => {
      timeline = gsap
        .timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } })
        .to(".holo-orbit-outer", { rotation: 13, duration: 8 }, 0)
        .to(".holo-orbit-inner", { rotation: -18, duration: 7 }, 0)
        .to(".holo-core-glow", { opacity: 0.72, scale: 1.12, duration: 3 }, 0)
        .to(".holo-signal", { opacity: 0.35, stagger: 0.16, duration: 1.3 }, 0);
    }, root);
    const visibility = () =>
      document.hidden ? timeline?.pause() : timeline?.play();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      context.revert();
    };
  }, [demoMotion, performanceMode, reducedMotion]);

  return (
    <div
      ref={root}
      className="holo-visual"
      role="img"
      aria-label="Animated abstract cluster signal visualization"
    >
      <div className="holo-visual-label">
        <i /> CLUSTER SIGNAL MAP <span>DEMO</span>
      </div>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <radialGradient id="holo-core-gradient">
            <stop offset="0" stopColor="#d8ffff" stopOpacity=".92" />
            <stop offset=".22" stopColor="#73d9ff" stopOpacity=".52" />
            <stop offset="1" stopColor="#276d9b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="holo-line-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#9ff4f0" stopOpacity=".75" />
            <stop offset="1" stopColor="#5a89ff" stopOpacity=".08" />
          </linearGradient>
        </defs>
        <g className="holo-orbit-outer" transform-origin="50 50">
          <ellipse
            cx="50"
            cy="50"
            rx="39"
            ry="15"
            transform="rotate(-28 50 50)"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="39"
            ry="15"
            transform="rotate(32 50 50)"
          />
          <circle cx="50" cy="50" r="42" />
        </g>
        <g className="holo-orbit-inner" transform-origin="50 50">
          <ellipse
            cx="50"
            cy="50"
            rx="31"
            ry="10"
            transform="rotate(18 50 50)"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="28"
            ry="7"
            transform="rotate(-57 50 50)"
          />
        </g>
        {signals.map(([x, y], index) => (
          <g className="holo-signal" key={`${x}-${y}`}>
            <line x1="50" y1="50" x2={x} y2={y} />
            <circle cx={x} cy={y} r={index % 3 === 0 ? 1.1 : 0.65} />
          </g>
        ))}
        <circle className="holo-core-glow" cx="50" cy="50" r="20" />
        <circle cx="50" cy="50" r="6" className="holo-core" />
        <circle cx="50" cy="50" r="2" className="holo-core-center" />
      </svg>
      <div className="holo-visual-footer">
        <span>01 / COORDINATOR</span>
        <span>12 / SIGNAL PATHS</span>
      </div>
    </div>
  );
}
