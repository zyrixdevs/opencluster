"use client";

import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type CountUpProps = {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
  startWhen?: boolean;
  separator?: string;
  prefix?: string;
  suffix?: string;
  mode?: "count" | "roll";
  easing?: "easeOut" | "linear" | "expo" | "spring";
  decimals?: number;
  format?: "standard" | "compact";
  trigger?: "view" | "load";
  replayOnHover?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
};
const compactUnits: Array<[number, string]> = [
  [1e12, "T"],
  [1e9, "B"],
  [1e6, "M"],
  [1e3, "K"],
];

/** Accessible count-up display; the animated value is hidden from assistive technology. */
export default function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 2,
  className = "",
  style,
  startWhen = true,
  separator = "",
  prefix = "",
  suffix = "",
  mode = "count",
  easing = "easeOut",
  decimals,
  format = "standard",
  trigger = "view",
  replayOnHover = false,
  onStart,
  onEnd,
}: CountUpProps) {
  const root = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(trigger === "load");
  const [value, setValue] = useState(direction === "down" ? to : from);
  const [run, setRun] = useState(0);
  const start = direction === "down" ? to : from;
  const end = direction === "down" ? from : to;
  useEffect(() => {
    if (trigger !== "view" || !root.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, [trigger]);
  // `run` intentionally restarts this effect for each hover replay.
  // biome-ignore lint/correctness/useExhaustiveDependencies: replay id restarts the animation.
  useEffect(() => {
    if (!visible || !startWhen) return;
    let raf = 0;
    let timeout = 0;
    let began = 0;
    let cancelled = false;
    const ms = Math.max(0, duration) * 1000;
    const ease = (t: number) =>
      easing === "linear"
        ? t
        : easing === "expo"
          ? t >= 1
            ? 1
            : 1 - 2 ** (-10 * t)
          : 1 - (1 - t) ** 3;
    timeout = window.setTimeout(() => {
      onStart?.();
      began = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const t = ms === 0 ? 1 : Math.min(1, (now - began) / ms);
        setValue(start + (end - start) * ease(t));
        if (t < 1) raf = requestAnimationFrame(tick);
        else onEnd?.();
      };
      if (
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
        ms === 0
      ) {
        setValue(end);
        onEnd?.();
      } else raf = requestAnimationFrame(tick);
    }, Math.max(0, delay) * 1000);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [
    visible,
    startWhen,
    start,
    end,
    duration,
    delay,
    easing,
    run,
    onStart,
    onEnd,
  ]);
  const display = useMemo(() => {
    const unit =
      format === "compact"
        ? compactUnits.find(([size]) => Math.abs(value) >= size * 0.9995)
        : undefined;
    const places = decimals ?? Math.max(decimalPlaces(from), decimalPlaces(to));
    const shown = unit ? value / unit[0] : value;
    const digits =
      decimals ?? (unit ? (Math.abs(shown) < 100 ? 1 : 0) : places);
    const number = Math.abs(shown).toFixed(digits);
    const [integer, fraction] = number.split(".");
    const grouped = separator
      ? integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator)
      : integer;
    return `${prefix}${value < 0 && Number(number) !== 0 ? "-" : ""}${grouped}${fraction ? `.${fraction}` : ""}${unit?.[1] ?? ""}${suffix}`;
  }, [value, format, decimals, from, to, separator, prefix, suffix]);
  return (
    <span
      ref={root}
      className={`tabular-nums ${className}`.trim()}
      style={style}
      onPointerEnter={
        replayOnHover
          ? () => {
              setValue(start);
              setRun((n) => n + 1);
            }
          : undefined
      }
    >
      <span aria-hidden="true">
        {mode === "roll"
          ? Array.from(display).map((char, index) =>
              /\d/.test(char) ? (
                <span
                  className="relative inline-block h-[1.2em] overflow-hidden align-bottom"
                  key={`${char}-${display.slice(index + 1).split(char).length}`}
                >
                  <span
                    className="flex flex-col transition-transform duration-150 ease-out"
                    style={{ transform: `translateY(-${Number(char) * 10}%)` }}
                  >
                    {"0123456789".split("").map((digit) => (
                      <span className="h-[1.2em] leading-[1.2em]" key={digit}>
                        {digit}
                      </span>
                    ))}
                  </span>
                </span>
              ) : (
                <span
                  className="whitespace-pre"
                  key={`${char}-${display.slice(index + 1).split(char).length}`}
                >
                  {char}
                </span>
              ),
            )
          : display}
      </span>
      <span className="sr-only">{display}</span>
    </span>
  );
}
function decimalPlaces(value: number) {
  const text = String(value);
  return text.includes(".") ? (text.split(".")[1]?.length ?? 0) : 0;
}
