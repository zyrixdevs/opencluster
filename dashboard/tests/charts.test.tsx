import { act, cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResourceChart } from "../src/components/Charts";

const state = vi.hoisted(() => ({
  telemetry: [
    { time: "00:00", cpu: 12, memory: 30, networkIn: 8, networkOut: 4 },
    { time: "01:00", cpu: 18, memory: 34, networkIn: 10, networkOut: 5 },
  ],
  reducedMotion: false,
}));

vi.mock("framer-motion", () => ({
  useReducedMotion: () => state.reducedMotion,
}));

vi.mock("../src/data/useDashboardData", () => ({
  useLocalCollection: () => ({ data: state.telemetry }),
}));

vi.mock("recharts", () => ({
  Area: ({
    dataKey,
    isAnimationActive,
  }: {
    dataKey: string;
    isAnimationActive: boolean;
  }) => (
    <span
      data-animated={String(isAnimationActive)}
      data-testid={`area-${dataKey}`}
    />
  ),
  AreaChart: ({ data, children }: { data: unknown[]; children: ReactNode }) => (
    <div data-point-count={data.length} data-testid="area-chart">
      {children}
    </div>
  ),
  CartesianGrid: () => null,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  state.reducedMotion = false;
  state.telemetry = [
    { time: "00:00", cpu: 12, memory: 30, networkIn: 8, networkOut: 4 },
    { time: "01:00", cpu: 18, memory: 34, networkIn: 10, networkOut: 5 },
  ];
});

describe("ResourceChart animation", () => {
  it("skips chart animation when reduced motion is preferred", () => {
    state.reducedMotion = true;
    render(<ResourceChart />);

    expect(screen.getByTestId("area-cpu")).toHaveAttribute(
      "data-animated",
      "false",
    );
  });

  it("animates selection changes once and holds its data through telemetry refreshes", () => {
    vi.useFakeTimers();
    const { rerender } = render(<ResourceChart range="1h" />);
    expect(screen.getByTestId("area-cpu")).toHaveAttribute(
      "data-animated",
      "true",
    );

    state.telemetry = [
      ...state.telemetry,
      { time: "02:00", cpu: 22, memory: 38, networkIn: 12, networkOut: 6 },
    ];
    rerender(<ResourceChart range="1h" />);
    expect(screen.getByTestId("area-chart")).toHaveAttribute(
      "data-point-count",
      "2",
    );
    expect(screen.getByTestId("area-cpu")).toHaveAttribute(
      "data-animated",
      "true",
    );

    act(() => vi.advanceTimersByTime(760));
    expect(screen.getByTestId("area-chart")).toHaveAttribute(
      "data-point-count",
      "3",
    );
    expect(screen.getByTestId("area-cpu")).toHaveAttribute(
      "data-animated",
      "false",
    );

    rerender(<ResourceChart metric="memory" range="1h" />);
    expect(screen.getByTestId("area-memory")).toHaveAttribute(
      "data-animated",
      "true",
    );
  });
});
