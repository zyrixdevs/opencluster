"use client";

import { type Easing, MotionConfig, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

export type BlurTextEffect = "blur" | "zoom" | "tilt" | "focus" | "drift";
export type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom" | "left" | "right";
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Array<Record<string, string | number>>;
  easing?: Easing | Easing[];
  onAnimationComplete?: () => void;
  stepDuration?: number;
  blur?: number;
  distance?: number;
  effect?: BlurTextEffect;
  staggerFrom?: "start" | "center" | "end" | "random";
  trigger?: "view" | "load" | "hover" | "click";
  loop?: boolean;
  loopDelay?: number;
  color?: string;
  fromColor?: string;
  focusOnHover?: boolean;
};

const easeOut: Easing = [0.33, 1, 0.68, 1];
const ranksFor = (
  n: number,
  origin: NonNullable<BlurTextProps["staggerFrom"]>,
) =>
  Array.from({ length: n }, (_, i) =>
    origin === "end"
      ? n - i - 1
      : origin === "center"
        ? Math.abs(i - (n - 1) / 2)
        : i,
  );

/** Word or letter reveal with view, load, hover and click triggers. */
export default function BlurText({
  text = "",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing,
  onAnimationComplete,
  stepDuration = 0.35,
  blur = 10,
  distance = 50,
  effect = "blur",
  staggerFrom = "start",
  trigger = "view",
  loop = false,
  loopDelay = 2,
  color,
  fromColor,
  focusOnHover = false,
}: BlurTextProps) {
  const root = useRef<HTMLParagraphElement>(null);
  const [active, setActive] = useState(trigger === "load");
  const [replay, setReplay] = useState(0);
  const [focus, setFocus] = useState(-1);
  const pieces = useMemo(
    () =>
      animateBy === "words"
        ? text.split(/(\s+)/).filter(Boolean)
        : Array.from(text),
    [text, animateBy],
  );
  const ranks = ranksFor(pieces.length, staggerFrom);
  useEffect(() => {
    if (trigger !== "view" || !root.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [trigger, threshold, rootMargin]);
  useEffect(() => {
    if (trigger !== "hover" && trigger !== "click") return;
    setActive(false);
  }, [trigger]);
  useEffect(() => {
    if (!loop || !active) return;
    const timer = window.setTimeout(
      () => setReplay((n) => n + 1),
      Math.max(0, loopDelay) * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [loop, loopDelay, active]);
  const offset =
    direction === "bottom"
      ? distance
      : direction === "left"
        ? -distance
        : direction === "right"
          ? distance
          : -distance;
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const from =
    animationFrom ??
    (effect === "zoom"
      ? {
          opacity: 0,
          scale: 1.35,
          filter: `blur(${blur}px)`,
          [axis]: offset * 0.35,
        }
      : effect === "tilt"
        ? { opacity: 0, rotateX: 45, filter: `blur(${blur}px)`, [axis]: offset }
        : effect === "focus"
          ? { opacity: 0.35, scale: 1.1, filter: `blur(${blur * 1.4}px)` }
          : effect === "drift"
            ? {
                opacity: 0,
                x: direction === "right" ? distance : -distance,
                skewX: 18,
                filter: `blur(${blur}px)`,
              }
            : { opacity: 0, [axis]: offset, filter: `blur(${blur}px)` });
  const final = animationTo?.at(-1) ?? {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotateX: 0,
    skewX: 0,
    filter: "blur(0px)",
  };
  return (
    <MotionConfig reducedMotion="user">
      <p
        ref={root}
        className={`flex flex-wrap ${trigger === "click" ? "cursor-pointer" : ""} ${className}`.trim()}
        style={{ color }}
        role={trigger === "click" ? "button" : undefined}
        tabIndex={trigger === "click" ? 0 : undefined}
        onPointerEnter={
          trigger === "hover"
            ? () => {
                setActive(true);
                setReplay((n) => n + 1);
              }
            : undefined
        }
        onClick={
          trigger === "click"
            ? () => {
                setActive(true);
                setReplay((n) => n + 1);
              }
            : undefined
        }
        onKeyDown={
          trigger === "click"
            ? (event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                setActive(true);
                setReplay((n) => n + 1);
              }
            : undefined
        }
      >
        <span className="sr-only">{text}</span>
        {pieces.map((piece, i) => (
          <motion.span
            aria-hidden="true"
            key={`${piece}-${pieces.slice(i + 1).filter((item) => item === piece).length}-${replay}`}
            className="inline-block whitespace-pre"
            initial={trigger === "load" ? false : from}
            animate={active ? final : from}
            transition={{
              duration: stepDuration,
              delay: (ranks[i] * Math.max(0, delay)) / 1000,
              ease: easing ?? easeOut,
            }}
            onAnimationComplete={
              i === pieces.length - 1 ? onAnimationComplete : undefined
            }
            onPointerEnter={focusOnHover ? () => setFocus(i) : undefined}
            onPointerLeave={focusOnHover ? () => setFocus(-1) : undefined}
            style={{
              color: fromColor && !active ? fromColor : undefined,
              filter:
                focusOnHover && focus !== -1 && focus !== i
                  ? `blur(${Math.max(2, blur * 0.3)}px)`
                  : undefined,
            }}
          >
            {piece}
          </motion.span>
        ))}
      </p>
    </MotionConfig>
  );
}
