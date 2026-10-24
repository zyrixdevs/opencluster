"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import { type CSSProperties, useEffect, useRef, useState } from "react";

export type SplitTextEffect =
  | "rise"
  | "fade"
  | "blur"
  | "flip"
  | "pop"
  | "skew"
  | "wave";
export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string | ((t: number) => number);
  splitType?: "chars" | "words" | "lines" | "words, chars";
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  textAlign?: CSSProperties["textAlign"];
  staggerFrom?: "start" | "center" | "end" | "edges" | "random";
  mask?: boolean;
  effect?: SplitTextEffect;
  trigger?: "view" | "load" | "hover" | "click";
  loop?: boolean;
  loopDelay?: number;
  hoverEffect?: "none" | "lift" | "wave";
  color?: string;
  accentColor?: string;
  onLetterAnimationComplete?: () => void;
}

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

/** Animate text pieces with GSAP. Reverts its split and timelines on unmount. */
export default function SplitText({
  text,
  className = "",
  delay = 50,
  duration = 1.25,
  ease,
  splitType = "chars",
  from,
  to,
  threshold = 0.1,
  rootMargin = "-100px",
  tag = "p",
  textAlign = "center",
  staggerFrom = "start",
  mask = false,
  effect = "rise",
  trigger = "view",
  loop = false,
  loopDelay = 1.5,
  hoverEffect = "none",
  color,
  accentColor,
  onLetterAnimationComplete,
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const loopTimer = useRef<gsap.core.Tween | null>(null);
  const completed = useRef<string | null>(null);
  const callback = useRef(onLetterAnimationComplete);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    callback.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !text) return;
      const reduced = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduced) {
        setReady(true);
        if (completed.current !== text) {
          completed.current = text;
          callback.current?.();
        }
        return;
      }
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const margin = marginMatch ? Number(marginMatch[1]) : 0;
      const marginUnit = marginMatch?.[2] || "px";
      const marginOffset =
        margin < 0
          ? `-=${Math.abs(margin)}${marginUnit}`
          : margin > 0
            ? `+=${margin}${marginUnit}`
            : "";
      const context = gsap.context(() => {
        const split = new GSAPSplitText(el, {
          type: splitType,
          smartWrap: true,
          autoSplit: splitType === "lines",
          mask: mask
            ? splitType.includes("chars")
              ? "chars"
              : splitType.includes("words")
                ? "words"
                : "lines"
            : undefined,
          charsClass: "split-char",
          wordsClass: "split-word",
          linesClass: "split-line",
          reduceWhiteSpace: false,
          onSplit(self) {
            const unit = splitType.includes("chars")
              ? self.chars
              : splitType.includes("words")
                ? self.words
                : self.lines;
            const start: gsap.TweenVars =
              from ??
              (effect === "fade"
                ? { opacity: 0 }
                : effect === "blur"
                  ? { opacity: 0, y: 24, filter: "blur(8px)" }
                  : effect === "flip"
                    ? { opacity: 0, rotationX: -80, transformPerspective: 500 }
                    : effect === "pop"
                      ? { opacity: 0, scale: 0.6 }
                      : effect === "skew"
                        ? { opacity: 0, x: -18, skewX: -15 }
                        : effect === "wave"
                          ? { opacity: 0, y: 18 }
                          : { opacity: 0, y: 40 });
            const end: gsap.TweenVars =
              to ??
              (effect === "fade"
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    y: 0,
                    x: 0,
                    scale: 1,
                    rotationX: 0,
                    skewX: 0,
                    filter: "blur(0px)",
                  });
            const tl = gsap.timeline({
              paused: trigger === "hover" || trigger === "click",
              scrollTrigger:
                trigger === "view"
                  ? {
                      trigger: el,
                      start: `top ${Math.round((1 - threshold) * 100)}%${marginOffset}`,
                      once: true,
                      fastScrollEnd: true,
                    }
                  : undefined,
              onComplete: () => {
                if (completed.current !== text) {
                  completed.current = text;
                  callback.current?.();
                }
                if (loop)
                  loopTimer.current = gsap.delayedCall(
                    Math.max(0, loopDelay),
                    () => tl.restart(),
                  );
              },
            });
            tl.fromTo(
              unit,
              { ...start, willChange: "transform,opacity,filter" },
              {
                ...end,
                color: accentColor ? getComputedStyle(el).color : undefined,
                duration,
                ease:
                  ease ?? (effect === "pop" ? "back.out(1.5)" : "power3.out"),
                stagger: { each: Math.max(0, delay) / 1000, from: staggerFrom },
                clearProps: "willChange",
              },
            );
            if (trigger === "load") tl.play();
            timeline.current = tl;
            setReady(true);
            return tl;
          },
        });
        return () => split.revert();
      }, ref);
      return () => {
        loopTimer.current?.kill();
        timeline.current = null;
        context.revert();
      };
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        from,
        to,
        threshold,
        rootMargin,
        tag,
        staggerFrom,
        mask,
        effect,
        trigger,
        accentColor,
        loop,
        loopDelay,
      ],
      scope: ref,
      revertOnUpdate: true,
    },
  );

  const Tag = tag;
  const clip =
    mask ||
    (hoverEffect === "none" && (effect === "rise" || effect === "fade"));
  return (
    <Tag
      ref={ref as never}
      onPointerEnter={
        trigger === "hover" ? () => timeline.current?.restart() : undefined
      }
      onClick={
        trigger === "click" ? () => timeline.current?.restart() : undefined
      }
      className={`inline-block whitespace-normal ${clip ? "overflow-hidden" : "overflow-visible"} ${trigger === "click" ? "cursor-pointer" : ""} ${className}`.trim()}
      style={{ textAlign, color, visibility: ready ? undefined : "hidden" }}
    >
      {text}
    </Tag>
  );
}
