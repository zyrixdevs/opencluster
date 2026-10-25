import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motionTiming } from "../animations/motion";
import type { TelemetryPoint } from "../data/models";
import { useLocalCollection } from "../data/useDashboardData";

export function ResourceChart({
  metric = "cpu",
  compact = false,
  range = "24h",
  compareMemory = false,
}: {
  metric?: "cpu" | "memory" | "network";
  compact?: boolean;
  range?: "15m" | "1h" | "24h" | "7d";
  compareMemory?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const { data: telemetry = [] } =
    useLocalCollection<TelemetryPoint>("telemetry");
  const series =
    metric === "network"
      ? [
          { key: "networkIn", name: "Inbound", color: "#6cb9ff" },
          { key: "networkOut", name: "Outbound", color: "#a78bfa" },
        ]
      : [
          {
            key: metric,
            name: metric === "cpu" ? "CPU" : "Memory",
            color: metric === "cpu" ? "#62d3a5" : "#65b9ff",
          },
        ];
  if (metric === "cpu" && compareMemory) {
    series.push({ key: "memory", name: "Memory", color: "#65b9ff" });
  }
  const visiblePoints =
    range === "15m"
      ? telemetry.slice(-4)
      : range === "1h"
        ? telemetry.slice(-6)
        : telemetry;
  const points =
    range === "7d"
      ? Array.from(
          { length: 14 },
          (_, index) => telemetry[Math.floor((index * telemetry.length) / 14)],
        )
      : visiblePoints;
  const data = points.map((point, index) => ({
    ...point,
    time:
      range === "7d"
        ? `Day ${Math.floor(index / 2) + 1}`
        : range === "1h"
          ? `${index * 10} min`
          : range === "15m"
            ? `${index * 5} min`
            : point.time,
  }));

  const animationKey = `${metric}:${range}:${compareMemory ? "compare" : "single"}`;
  const [completedKey, setCompletedKey] = useState<string | null>(null);
  const chartSnapshot = useRef<{
    key: string;
    data: typeof data;
  } | null>(null);
  if (
    chartSnapshot.current?.key !== animationKey ||
    !data.length ||
    prefersReducedMotion ||
    completedKey === animationKey
  ) {
    chartSnapshot.current = { key: animationKey, data };
  }
  const animateChart = !prefersReducedMotion && completedKey !== animationKey;
  const chartData = animateChart ? (chartSnapshot.current?.data ?? data) : data;

  useEffect(() => {
    if (!data.length) return undefined;
    if (prefersReducedMotion) {
      setCompletedKey(animationKey);
      return undefined;
    }
    if (completedKey === animationKey) return undefined;

    const timeout = window.setTimeout(() => {
      setCompletedKey(animationKey);
    }, motionTiming.chart * 1000);
    return () => window.clearTimeout(timeout);
  }, [animationKey, completedKey, data.length, prefersReducedMotion]);

  if (!data.length)
    return (
      <div className="chart-empty" role="status">
        No telemetry samples are stored locally.
      </div>
    );
  return (
    <div className={`chart-wrap ${compact ? "chart-compact" : ""}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          key={animationKey}
          data={chartData}
          margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
        >
          <defs>
            {series.map((s) => (
              <linearGradient
                key={s.key}
                id={`fill-${s.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.26} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            stroke="#22303b"
            strokeDasharray="3 5"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{ fill: "#758594", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={compact ? 7 : 3}
          />
          <YAxis
            tick={{ fill: "#758594", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            domain={[0, "dataMax + 15"]}
          />
          <Tooltip
            contentStyle={{
              background: "#101923",
              border: "1px solid #293845",
              borderRadius: 10,
              color: "#e5edf2",
              fontSize: 12,
            }}
          />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#fill-${s.key})`}
              isAnimationActive={animateChart}
              animationDuration={motionTiming.chart * 1000}
              animationEasing="ease-out"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
