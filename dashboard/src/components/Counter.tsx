import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef } from "react";
import "./Counter.css";

export type CounterProps = {
  value?: number;
  locale?: string;
  format?: Intl.NumberFormatOptions;
  decimals?: number;
  minDigits?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  duration?: number;
  fontSize?: number | string;
  fontWeight?: number | string;
  textColor?: string;
  className?: string;
  style?: CSSProperties;
};

export function Counter({
  value = 0,
  locale = "en-US",
  format,
  decimals,
  minDigits = 1,
  prefix,
  suffix,
  duration = 700,
  fontSize = "inherit",
  fontWeight = "inherit",
  textColor = "inherit",
  className = "",
  style,
}: CounterProps) {
  const number = Number.isFinite(value) ? value : 0;
  const numberRef = useRef<HTMLSpanElement>(null);
  const previousValue = useRef(number);
  const numberFormat = useMemo(() => {
    const options = { ...format };
    if (decimals !== undefined) {
      options.minimumFractionDigits = Math.max(
        0,
        Math.min(20, Math.round(decimals)),
      );
      options.maximumFractionDigits = options.minimumFractionDigits;
    }
    options.minimumIntegerDigits = Math.max(
      1,
      Math.min(21, Math.round(minDigits)),
    );
    try {
      return new Intl.NumberFormat(locale, options);
    } catch {
      return new Intl.NumberFormat("en-US", options);
    }
  }, [locale, format, decimals, minDigits]);
  const formatted = numberFormat.format(number);
  const motionDuration = Math.max(0, duration);

  useEffect(() => {
    const target = numberRef.current;
    if (!target) return;
    let frame = 0;
    let observer: IntersectionObserver | undefined;
    let started = false;
    const finish = () => {
      target.textContent = formatted;
      previousValue.current = number;
    };
    const run = () => {
      if (started) return;
      started = true;
      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        document.hidden ||
        motionDuration === 0
      ) {
        finish();
        return;
      }
      const previous = previousValue.current;
      previousValue.current = number;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / motionDuration);
        const eased = 1 - (1 - progress) ** 4;
        target.textContent = numberFormat.format(
          previous + (number - previous) * eased,
        );
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    if (typeof IntersectionObserver === "undefined") run();
    else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer?.disconnect();
            run();
          }
        },
        { threshold: 0.1 },
      );
      observer.observe(target);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [formatted, motionDuration, number, numberFormat]);

  return (
    <span
      role="img"
      className={`counter ${className}`}
      style={{
        fontSize: typeof fontSize === "number" ? `${fontSize}px` : fontSize,
        fontWeight,
        color: textColor,
        ...style,
      }}
      aria-label={`${typeof prefix === "string" ? prefix : ""}${formatted}${typeof suffix === "string" ? suffix : ""}`}
    >
      <span aria-hidden="true">{prefix}</span>
      <span ref={numberRef} aria-hidden="true">
        {formatted}
      </span>
      <span aria-hidden="true">{suffix}</span>
    </span>
  );
}
