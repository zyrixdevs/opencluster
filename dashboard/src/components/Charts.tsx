import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { telemetry } from "../data/mock";

export function ResourceChart({
  metric = "cpu",
  compact = false,
  range = "24h",
  compareMemory = false,
}: {
  metric?: "cpu" | "memory" | "network";
  compact?: boolean;
  range?: "1h" | "6h" | "24h" | "7d";
  compareMemory?: boolean;
}) {
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
    range === "1h"
      ? telemetry.slice(-2)
      : range === "6h"
        ? telemetry.slice(-7)
        : telemetry;
  const data = visiblePoints.map((point, index) => ({
    ...point,
    time:
      range === "7d"
        ? `Day ${index + 1}`
        : range === "1h"
          ? `${index * 60} min`
          : point.time,
  }));
  return (
    <div className={`chart-wrap ${compact ? "chart-compact" : ""}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
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
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
