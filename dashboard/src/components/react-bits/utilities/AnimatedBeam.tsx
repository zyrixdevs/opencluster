import { motion, useReducedMotion } from "framer-motion";
import { type RefObject, useEffect, useId, useState } from "react";

export interface AnimatedBeamProps {
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  className?: string;
  duration?: number;
  curvature?: number;
  pathColor?: string;
  gradientStartColor?: string;
  gradientStopColor?: string;
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  className,
  duration = 5,
  curvature = 0,
  pathColor = "currentColor",
  gradientStartColor = "#ffaa40",
  gradientStopColor = "#9c40ff",
}: AnimatedBeamProps) {
  const [geometry, setGeometry] = useState({ width: 0, height: 0, path: "" });
  const reduced = useReducedMotion();
  const gradientId = `beam-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  useEffect(() => {
    const update = () => {
      const parent = containerRef.current?.getBoundingClientRect();
      const from = fromRef.current?.getBoundingClientRect();
      const to = toRef.current?.getBoundingClientRect();
      if (!(parent && from && to)) return;
      const x1 = from.left - parent.left + from.width / 2;
      const y1 = from.top - parent.top + from.height / 2;
      const x2 = to.left - parent.left + to.width / 2;
      const y2 = to.top - parent.top + to.height / 2;
      setGeometry({
        width: parent.width,
        height: parent.height,
        path: `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 - curvature} ${x2} ${y2}`,
      });
    };
    update();
    const observer = new ResizeObserver(update);
    [containerRef.current, fromRef.current, toRef.current].forEach(
      (element) => {
        if (element) observer.observe(element);
      },
    );
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [containerRef, fromRef, toRef, curvature]);
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={geometry.width}
      height={geometry.height}
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <path
        d={geometry.path}
        fill="none"
        stroke={pathColor}
        strokeOpacity=".24"
        strokeWidth="2"
      />
      <motion.path
        d={geometry.path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        initial={{ pathLength: 0, pathOffset: 0 }}
        animate={
          reduced
            ? { pathLength: 1, pathOffset: 0 }
            : { pathLength: [0.08, 0.35, 0.08], pathOffset: [0, 0.65, 1] }
        }
        transition={
          reduced
            ? { duration: 0 }
            : { duration, repeat: Infinity, ease: "linear" }
        }
      />
      <defs>
        <linearGradient id={gradientId}>
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset=".5" stopColor={gradientStopColor} />
          <stop offset="1" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
export default AnimatedBeam;
