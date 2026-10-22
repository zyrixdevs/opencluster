import {
  ChevronDown,
  CircleAlert,
  Globe2,
  Layers3,
  Orbit,
  Share2,
} from "lucide-react";
import { lazy, Suspense, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Topology } from "../components/Topology";
import { Button, LoadingState, PageTitle, Progress } from "../components/ui";
import type { Health } from "../data/models";
import { useDemoData } from "../data/useDashboardData";

const GlobeScene = lazy(() =>
  import("../components/GlobeScene").then((module) => ({
    default: module.GlobeScene,
  })),
);

export function MissionPage() {
  const { cluster, nodes, clusters } = useDemoData();
  const [layout, setLayout] = useState<"topology" | "orbit" | "globe">("globe");
  const [healthFilter, setHealthFilter] = useState<Health | "all">("all");
  const visibleNodes = useMemo(
    () =>
      nodes.filter(
        (node) => healthFilter === "all" || node.health === healthFilter,
      ),
    [nodes, healthFilter],
  );
  const averageCpu = nodes.length
    ? Math.round(nodes.reduce((sum, node) => sum + node.cpu, 0) / nodes.length)
    : 0;
  const averageMemory = nodes.length
    ? Math.round(
        nodes.reduce((sum, node) => sum + node.memory, 0) / nodes.length,
      )
    : 0;
  const alerts = nodes.filter(
    (node) => node.health === "warning" || node.health === "offline",
  ).length;
  return (
    <>
      <PageTitle
        eyebrow="CLUSTER VISUALIZATION"
        title="Mission Control"
        description="Explore the sample node layout. Topology and status use demo data."
        actions={
          <Link to="/clusters" className="button button-secondary">
            <Layers3 size={15} /> Switch cluster <ChevronDown size={13} />
          </Link>
        }
      />
      <div className="context-strip">
        <div>
          <span className="cluster-pip" />
          <b>{cluster?.name}</b>
          <span>· {nodes.length} sample nodes</span>
          <span className="context-separator" />
          {cluster?.region}
        </div>
        <div className="context-demo">DEMO TOPOLOGY</div>
      </div>
      <div className="mission-toolbar">
        <fieldset className="mission-view-switch">
          <legend className="sr-only">Visualization mode</legend>
          <Button
            className={layout === "orbit" ? "selected" : ""}
            aria-pressed={layout === "orbit"}
            onClick={() => setLayout("orbit")}
          >
            <Orbit size={13} /> Orbit view
          </Button>
          <Button
            className={layout === "topology" ? "selected" : ""}
            aria-pressed={layout === "topology"}
            onClick={() => setLayout("topology")}
          >
            <Share2 size={13} /> Topology
          </Button>
          <Button
            className={layout === "globe" ? "selected" : ""}
            aria-pressed={layout === "globe"}
            onClick={() => setLayout("globe")}
          >
            <Globe2 size={13} /> 3D globe
          </Button>
        </fieldset>
        <fieldset className="mission-filters">
          <legend className="sr-only">Filter nodes by health</legend>
          {(["all", "healthy", "warning", "offline"] as const).map((health) => (
            <button
              key={health}
              type="button"
              aria-pressed={healthFilter === health}
              className={healthFilter === health ? "selected" : ""}
              onClick={() => setHealthFilter(health)}
            >
              {health === "all" ? "All nodes" : health}
              {health !== "all" && <i className={`health-mini ${health}`} />}
            </button>
          ))}
        </fieldset>
      </div>
      {layout === "globe" ? (
        <Suspense fallback={<LoadingState label="Loading 3D cluster globe" />}>
          <GlobeScene nodes={visibleNodes} />
        </Suspense>
      ) : (
        <Topology nodes={visibleNodes} layout={layout} />
      )}
      <div className="mission-analytics">
        <div className="mission-metric">
          <span>AVERAGE CPU</span>
          <b>{averageCpu}%</b>
          <Progress value={averageCpu} />
        </div>
        <div className="mission-metric">
          <span>AVERAGE MEMORY</span>
          <b>{averageMemory}%</b>
          <Progress value={averageMemory} tone="purple" />
        </div>
        <div className="mission-metric mission-alerts">
          <span>HEALTH ALERTS</span>
          <b>
            <CircleAlert size={15} /> {alerts}
          </b>
          <small>
            {alerts ? "Sample nodes need attention" : "No demo alerts"}
          </small>
        </div>
      </div>
      <div className="mission-footnote">
        <CircleAlert size={14} /> Node connections and status are illustrative.{" "}
        {clusters.length} local demo clusters available.
      </div>
    </>
  );
}
