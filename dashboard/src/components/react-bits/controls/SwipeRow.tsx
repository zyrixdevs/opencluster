import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

export interface SwipeRowProps {
  children: ReactNode;
  actions: ReactNode;
  className?: string;
  label?: string;
}

/** Reveals caller-provided actions on a horizontal drag; actions stay keyboard reachable. */
export function SwipeRow({
  children,
  actions,
  className = "",
  label = "Row actions",
}: SwipeRowProps) {
  const reduced = useReducedMotion();
  const actionsRef = useRef<HTMLFieldSetElement>(null);
  const [width, setWidth] = useState(0);
  const [open, setOpen] = useState(false);
  useLayoutEffect(() => {
    const element = actionsRef.current;
    if (!element) return;
    const measure = () => setWidth(element.scrollWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div className={`rb-swipe-row ${className}`}>
      <fieldset
        aria-label={label}
        className="rb-swipe-actions"
        ref={actionsRef}
      >
        {actions}
      </fieldset>
      <motion.div
        className="rb-swipe-content"
        animate={{ x: open ? -width : 0 }}
        drag={reduced ? false : "x"}
        dragConstraints={{ left: -width, right: 0 }}
        dragElastic={0.08}
        onDragEnd={(_, info) => {
          setOpen(info.offset.x < -48);
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default SwipeRow;
