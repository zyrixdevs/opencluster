import { useQueryClient } from "@tanstack/react-query";
import { useReducedMotion } from "framer-motion";
import * as Icons from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
// ORIGINAL (preserved, not deleted — disabled by comment): import { ResourceChart } from "../components/Charts";
import { Counter } from "../components/Counter";
// ORIGINAL (preserved, not deleted — disabled by comment): import { HologramVisual } from "../components/HologramVisual";
import { LatticeLoader } from "../components/react-bits/controls";
import BlurText from "../components/react-bits/text/BlurText";
import SplitText from "../components/react-bits/text/SplitText";
import * as UI from "../components/ui";
import type { ActivityEvent, Software } from "../data/models";
import { useDemoData, useLocalCollection } from "../data/useDashboardData";
import { useDashboardStore } from "../state/useDashboardStore";
import { ActivityLine } from "./shared";

const CrystalizedBall = lazy(
  () => import("../components/react-bits/visuals/CrystalizedBall"),
);
const ResourceChart = lazy(() =>
  import("../components/Charts").then((module) => ({
    default: module.ResourceChart,
  })),
);

export function HomePage() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartVisible, setChartVisible] = useState(false);
  const reducedMotion = useReducedMotion();
  const performanceMode = useDashboardStore((state) => state.performanceMode);
  const demoMotion = useDashboardStore((state) => state.demoMotion);
  const { cluster, clusters, nodes } = useDemoData();
  const { data: initialActivity = [] } =
    useLocalCollection<ActivityEvent>("activity");
  const { data: softwareCatalog = [] } =
    useLocalCollection<Software>("software-catalog");
  const { data: agentEntities = [] } =
    useLocalCollection<import("../data/agents").AgentEntity>("agents");
  const localAgents = useMemo(
    () => agentEntities.filter((agent) => agent.kind === "agent"),
    [agentEntities],
  );
  const queryClient = useQueryClient();
  const displayName = useDashboardStore((state) => state.displayName);
  const online = nodes.filter(
    (n) => n.health === "healthy" || n.health === "warning",
  ).length;
  const warning = nodes.filter(
    (n) => n.health === "warning" || n.health === "offline",
  ).length;
  const avgCpu = nodes.length
    ? Math.round(nodes.reduce((sum, n) => sum + n.cpu, 0) / nodes.length)
    : 0;
  const [toast, setToast] = useState("");
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };
  const greeting = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
  const hour = new Date().getHours();
  useEffect(() => {
    const element = chartRef.current;
    if (!element || chartVisible) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setChartVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [chartVisible]);
  const salutation =
    hour < 12
      ? "Good morning,"
      : hour < 18
        ? "Good afternoon,"
        : "Good evening,";
  return (
    <>
      {/* ORIGINAL (preserved, not deleted — disabled by comment): <UI.PageTitle eyebrow="WEDNESDAY, OCTOBER 22, 2026" title="Good evening, operator" description="Here's what's happening across your infrastructure." actions={<UI.Button variant="primary" onClick={() => notify("Demo action: cluster overview refreshed")}><Icons.Activity size={15} /> Refresh overview</UI.Button>} /> */}
      <section className="home-hero">
        <div className="home-hero-copy">
          <div className="eyebrow">
            <span className="hero-eyebrow-mark" /> OPENCLUSTER / LOCAL WORKSPACE
          </div>
          {/* ORIGINAL (preserved, not deleted — disabled by comment): <h1>{salutation}<br /><em>{displayName}.</em></h1> */}
          <h1>
            <SplitText
              text={salutation}
              tag="span"
              textAlign="left"
              splitType="words"
              delay={55}
              duration={0.8}
            />
            <br />
            <em>
              <SplitText
                text={`${displayName}.`}
                tag="span"
                textAlign="left"
                splitType="words"
                delay={70}
                duration={0.9}
              />
            </em>
          </h1>
          {/* ORIGINAL (preserved, not deleted — disabled by comment): <p>Your cluster operations, agent workflows, and system signals in one place.</p> */}
          <BlurText
            text="Your cluster operations, agent workflows, and system signals in one place."
            className="home-hero-description"
            effect="focus"
            animateBy="words"
            delay={45}
            stepDuration={0.3}
            distance={12}
            trigger="view"
          />
          <div className="hero-actions">
            <Link to="/mission-control" className="button button-primary">
              <Icons.ScanEye size={15} /> Enter Mission Control
            </Link>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                void queryClient
                  .invalidateQueries()
                  .then(() => notify("Local workspace snapshot refreshed."));
              }}
            >
              <Icons.RefreshCw size={14} /> Refresh snapshot
            </button>
          </div>
          <div className="hero-footnote">
            <span className="status-pulse" /> SAMPLE ENVIRONMENT <i />{" "}
            {greeting.toUpperCase()}
          </div>
        </div>
        {/* ORIGINAL (preserved, not deleted — disabled by comment): <HologramVisual /> */}
        <div
          className="home-crystal-visual"
          role="img"
          aria-label="Decorative crystal orb, not a live cluster visualization"
        >
          <div className="home-crystal-label">
            <i /> CRYSTAL ORB <span>DEMO</span>
          </div>
          <Suspense fallback={<LatticeLoader label="Loading crystal orb" />}>
            <CrystalizedBall
              preset="eclipse"
              particleCount={3200}
              interactive={!performanceMode && !reducedMotion && demoMotion}
              paused={performanceMode || Boolean(reducedMotion) || !demoMotion}
            />
          </Suspense>
          <div className="home-crystal-footer">
            <span>LOCAL WORKSPACE</span>
            <span>DECORATIVE VISUAL</span>
          </div>
        </div>
        <div className="hero-watermark" aria-hidden="true">
          OC / 01
        </div>
      </section>
      {toast && (
        <div className="toast-demo" role="status">
          {toast}
        </div>
      )}
      <div className="demo-banner">
        <span className="demo-banner-icon">
          <Icons.Sparkles size={16} />
        </span>
        <div>
          <b>Your local OpenCluster workspace is ready</b>
          <span>
            Cluster records persist here. Hardware metrics remain sample data
            until a backend is connected.
          </span>
        </div>
        <button
          type="button"
          aria-label="Dismiss demo message"
          onClick={(e) => e.currentTarget.parentElement?.remove()}
        >
          <Icons.X size={14} />
        </button>
      </div>
      <div className="stats-grid">
        <UI.Stat
          label="Clusters"
          value={
            <Counter
              value={clusters.length}
              minDigits={2}
              fontSize="inherit"
              fontWeight={600}
            />
          }
          detail="Local cluster records"
          icon={<Icons.Layers3 size={17} />}
          tone="green"
        />
        <UI.Stat
          label="Nodes online"
          value={
            <Counter
              value={online}
              minDigits={2}
              fontSize="inherit"
              fontWeight={600}
            />
          }
          detail={`of ${nodes.length} · sample status`}
          icon={<Icons.Server size={17} />}
          tone="blue"
        />
        <UI.Stat
          label="Alerts"
          value={
            <Counter
              value={warning}
              minDigits={2}
              fontSize="inherit"
              fontWeight={600}
            />
          }
          detail="Sample health signals"
          icon={<Icons.Activity size={17} />}
          tone="purple"
        />
        <UI.Stat
          label="Average CPU"
          value={
            <Counter
              value={avgCpu}
              suffix="%"
              fontSize="inherit"
              fontWeight={600}
            />
          }
          detail={`${cluster?.name ?? "Active cluster"} · sample`}
          icon={<Icons.Cpu size={17} />}
          tone="blue"
        />
        <UI.Stat
          label="AI agents"
          value={
            <Counter
              value={localAgents.length}
              minDigits={2}
              fontSize="inherit"
              fontWeight={600}
            />
          }
          detail="Persisted local agent records"
          icon={<Icons.Bot size={17} />}
          tone="amber"
        />
      </div>
      <div className="home-pulse-grid">
        <UI.Card className="home-pulse-card">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">CLUSTER FLEET</span>
              <h2>Active clusters</h2>
            </div>
            <Link to="/clusters" className="text-link">
              Manage <Icons.ArrowRight size={13} />
            </Link>
          </div>
          <div className="home-cluster-list">
            {clusters.slice(0, 3).map((item) => (
              <Link className="home-cluster-row" to="/clusters" key={item.id}>
                <span className="cluster-pip" />
                <span>
                  <b>{item.name}</b>
                  <small>{item.region}</small>
                </span>
                <strong>
                  {nodes
                    .filter((node) => node.clusterId === item.id)
                    .length.toString()
                    .padStart(2, "0")}{" "}
                  <small>NODES</small>
                </strong>
              </Link>
            ))}
          </div>
        </UI.Card>
        <UI.Card className="home-pulse-card home-agent-summary">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">AGENT ECOSYSTEM</span>
              <h2>Orchestration layer</h2>
            </div>
            <Link to="/agents" className="text-link">
              Open graph <Icons.ArrowRight size={13} />
            </Link>
          </div>
          {localAgents.slice(0, 3).map((agent) => (
            <div className="agent-summary-row" key={agent.id}>
              <span
                className={`agent-summary-icon ${agent.color === "violet" ? "purple" : ""}`}
              >
                {agent.icon === "codex" ? (
                  <Icons.BrainCircuit size={15} />
                ) : (
                  <Icons.Bot size={15} />
                )}
              </span>
              <span>
                <b>{agent.name}</b>
                <small>{agent.role} · local record</small>
              </span>
              <i
                className={`agent-state-dot ${agent.status === "attention" || agent.status === "paused" ? "attention" : ""}`}
              />
            </div>
          ))}
          <div className="agent-summary-foot">
            <Icons.CircleAlert size={13} /> Agent records are local
            configuration; no agent is connected.
          </div>
        </UI.Card>
        <UI.Card className="home-pulse-card home-software-summary">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">SOFTWARE CATALOG</span>
              <h2>Agent runtimes</h2>
            </div>
            <Link to="/software" className="text-link">
              Browse <Icons.ArrowRight size={13} />
            </Link>
          </div>
          <div className="software-summary-list">
            {softwareCatalog.slice(0, 3).map((software) => (
              <div key={software.id}>
                <span>{software.name.slice(0, 1)}</span>
                <b>{software.name}</b>
                <small>
                  {software.status === "available" ? "PREVIEW" : "PLANNED"}
                </small>
              </div>
            ))}
          </div>
        </UI.Card>
      </div>
      <div className="home-alert-strip" role="status">
        <Icons.CircleAlert size={14} />
        <span>
          <b>
            {warning
              ? `${warning} sample node${warning === 1 ? "" : "s"} need attention`
              : "No sample alerts"}
          </b>
          <small>
            Illustrative health status only · no nodes are connected
          </small>
        </span>
        <Link to="/monitoring">
          Review health <Icons.ArrowRight size={13} />
        </Link>
      </div>
      <div className="dashboard-grid">
        <UI.Card className="overview-chart-card">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">RESOURCE OVERVIEW</span>
              <h2>Cluster utilization</h2>
            </div>
            <div className="chart-legend">
              <span>
                <i className="legend-dot cpu-dot" /> CPU
              </span>
              <span>
                <i className="legend-dot mem-dot" /> Memory
              </span>
              <button type="button" className="select-pill">
                Last 24 hours <Icons.ChevronDown size={13} />
              </button>
            </div>
          </div>
          <div className="resource-summary">
            <div>
              <span>AVG CPU</span>
              <b>{avgCpu}%</b>
              <small className="positive">
                <Icons.ArrowDownRight size={12} /> 4.2% vs yesterday
              </small>
            </div>
            <div>
              <span>AVG MEMORY</span>
              <b>
                {Math.round(
                  nodes.reduce((sum, n) => sum + n.memory, 0) /
                    Math.max(nodes.length, 1),
                )}
                %
              </b>
              <small>Across {nodes.length} sample nodes</small>
            </div>
            <div>
              <span>NETWORK I/O</span>
              <b>
                {nodes.reduce((sum, node) => sum + node.network, 0)}{" "}
                <i>Mb/s sample</i>
              </b>
              <small>Local sample nodes · no live network telemetry</small>
            </div>
          </div>
          <div className="home-chart" ref={chartRef}>
            {/* ORIGINAL (preserved, not deleted — disabled by comment): <ResourceChart metric="cpu" compareMemory /> */}
            {chartVisible && (
              <Suspense fallback={null}>
                <ResourceChart metric="cpu" compareMemory />
              </Suspense>
            )}
          </div>
        </UI.Card>
        <UI.Card className="quick-actions">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">SHORTCUTS</span>
              <h2>Quick actions</h2>
            </div>
            <Icons.Settings2 size={16} className="muted" />
          </div>
          <div className="action-list">
            <Link to="/clusters" className="action-tile">
              <span className="action-icon blue">
                <Icons.Plus size={17} />
              </span>
              <span>
                <b>Create a cluster</b>
                <small>Set up a new demo cluster</small>
              </span>
              <Icons.ArrowRight size={15} />
            </Link>
            <Link to="/nodes" className="action-tile">
              <span className="action-icon green">
                <Icons.Server size={17} />
              </span>
              <span>
                <b>Explore nodes</b>
                <small>Inspect resource details</small>
              </span>
              <Icons.ArrowRight size={15} />
            </Link>
            <Link to="/software" className="action-tile">
              <span className="action-icon purple">
                <Icons.TerminalSquare size={17} />
              </span>
              <span>
                <b>Browse AI software</b>
                <small>Preview catalog integrations</small>
              </span>
              <Icons.ArrowRight size={15} />
            </Link>
            <Link to="/automation" className="action-tile">
              <span className="action-icon amber">
                <Icons.Workflow size={17} />
              </span>
              <span>
                <b>Design an automation</b>
                <small>Preview a demo workflow</small>
              </span>
              <Icons.ArrowRight size={15} />
            </Link>
          </div>
          <div className="quick-note">
            <Icons.CircleAlert size={14} /> Actions in this demo do not affect
            real systems.
          </div>
        </UI.Card>
        <UI.Card className="node-overview">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">INFRASTRUCTURE</span>
              <h2>Node status</h2>
            </div>
            <Link to="/nodes" className="text-link">
              View all nodes <Icons.ArrowRight size={13} />
            </Link>
          </div>
          <div className="overview-node-list">
            {nodes.slice(0, 4).map((node) => (
              <div className="overview-node" key={node.id}>
                <span className={`node-indicator ${node.health}`} />
                <div className="overview-node-name">
                  <b>{node.name}</b>
                  <small>
                    {node.role === "coordinator" ? "Coordinator" : "Worker"}
                  </small>
                </div>
                <div className="overview-cpu">
                  <small>CPU</small>
                  <b>{node.cpu}%</b>
                  <UI.Progress
                    value={node.cpu}
                    tone={node.cpu > 75 ? "amber" : "blue"}
                  />
                </div>
                <UI.HealthBadge health={node.health} />
              </div>
            ))}
          </div>
        </UI.Card>
        <UI.Card className="activity-overview">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">RECENT EVENTS</span>
              <h2>Activity</h2>
            </div>
            <Link to="/activity" className="text-link">
              View activity <Icons.ArrowRight size={13} />
            </Link>
          </div>
          <div className="mini-timeline">
            {initialActivity.slice(0, 4).map((event) => (
              <ActivityLine key={event.id} event={event} compact />
            ))}
          </div>
        </UI.Card>
      </div>
    </>
  );
}
