import { useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  CircleAlert,
  Globe2,
  Layers3,
  Orbit,
  Share2,
  // ORIGINAL (preserved, not deleted — disabled by comment): Sparkles,
  Waves,
} from "lucide-react";
import { lazy, Suspense, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LatticeLoader } from "../components/react-bits/controls";
import CountUp from "../components/react-bits/text/CountUp";
import { Topology } from "../components/Topology";
import { Button, LoadingState, PageTitle, Progress } from "../components/ui";
import type { Health } from "../data/models";
import { useDemoData } from "../data/useDashboardData";
import { useDashboardStore } from "../state/useDashboardStore";

// ORIGINAL (preserved, not deleted — disabled by comment): const CrystalizedBall = lazy(() => import("../components/react-bits/visuals/CrystalizedBall"));
const LaserFlow = lazy(
  () => import("../components/react-bits/visuals/LaserFlow"),
);
const GlobeScene = lazy(() =>
  import("../components/GlobeScene").then((module) => ({
    default: module.GlobeScene,
  })),
);

export function MissionPage() {
  const { cluster, nodes, clusters } = useDemoData();
  const [layout, setLayout] = useState<
    "topology" | "orbit" | "globe" | "laser"
  >("globe");
  const performanceMode = useDashboardStore((state) => state.performanceMode);
  const reducedMotion = useReducedMotion();
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
          {/* ORIGINAL (preserved, not deleted — disabled by comment): <Button className={layout === "crystal" ? "selected" : ""} aria-pressed={layout === "crystal"} onClick={() => setLayout("crystal")}><Sparkles size={13} /> Crystal orb</Button> */}
          <Button
            className={layout === "laser" ? "selected" : ""}
            aria-pressed={layout === "laser"}
            onClick={() => setLayout("laser")}
          >
            <Waves size={13} /> Laser flow
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
        </Suspense> /* ORIGINAL (preserved, not deleted — disabled by comment):
        : layout === "crystal" ? (
          <Suspense fallback={<div className="visual-loader"><LatticeLoader label="Loading crystal orb" /></div>}>
            <div className="mission-visual-preview" role="img" aria-label="Decorative sample crystal visualization; does not represent live node data">
              <CrystalizedBall preset="eclipse" particleCount={3500} paused={performanceMode || Boolean(reducedMotion)} />
            </div>
          </Suspense>
      */
      ) : layout === "laser" ? (
        <Suspense
          fallback={
            <div className="visual-loader">
              <LatticeLoader label="Loading laser flow" />
            </div>
          }
        >
          <div
            className="mission-visual-preview"
            role="img"
            aria-label="Decorative sample laser light visualization; does not represent live node data"
          >
            <LaserFlow
              color="#55d6f0"
              intensity={1.1}
              speed={performanceMode || reducedMotion ? 0 : 0.65}
              paused={performanceMode || Boolean(reducedMotion)}
            />
          </div>
        </Suspense>
      ) : (
        <Topology nodes={visibleNodes} layout={layout} />
      )}
      <div className="mission-analytics">
        <div className="mission-metric">
          <span>AVERAGE CPU</span>
          <b>
            <CountUp from={0} to={averageCpu} suffix="%" duration={1.2} />
          </b>
          <Progress value={averageCpu} />
        </div>
        <div className="mission-metric">
          <span>AVERAGE MEMORY</span>
          <b>
            <CountUp from={0} to={averageMemory} suffix="%" duration={1.2} />
          </b>
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
