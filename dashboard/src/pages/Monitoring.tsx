import { ArrowRight, CircleAlert, HardDrive } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ResourceChart } from "../components/Charts";
import { Card, HealthBadge, PageTitle, Progress } from "../components/ui";
import { useDemoData } from "../data/useDashboardData";
import { useDashboardStore } from "../state/useDashboardStore";

export function MonitoringPage() {
  const { nodes } = useDemoData();
  const storageAverage = nodes.length
    ? Math.round(nodes.reduce((sum, node) => sum + node.disk, 0) / nodes.length)
    : 0;
  const [range, setRange] = useState<"15m" | "1h" | "24h" | "7d">("24h");
  const [metric, setMetric] = useState("cpu");
  const [compare, setCompare] = useState(false);
  const selectNode = useDashboardStore((state) => state.selectNode);
  return (
    <>
      <PageTitle
        eyebrow="OBSERVABILITY"
        title="Monitoring"
        description="Sample hardware metrics stored locally until a telemetry service is connected."
        actions={
          <select
            className="select-pill"
            value={range}
            onChange={(e) => setRange(e.target.value as typeof range)}
            aria-label="Select time range"
          >
            <option value="15m">Last 15 minutes</option>
            <option value="1h">Last hour</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
          </select>
        }
      />
      <div className="monitoring-context">
        <span>
          <span className="live-dot" /> SAMPLE HISTORY
        </span>
        <span>·</span>
        <span>Fixed deterministic sample series · {range} window</span>
      </div>
      <div className="monitoring-grid">
        <Card className="monitoring-main-chart">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">AGGREGATE METRICS</span>
              <h2>
                {metric === "cpu"
                  ? "CPU utilization"
                  : metric === "memory"
                    ? "Memory utilization"
                    : "Network traffic"}
              </h2>
            </div>
            <div className="metric-tabs">
              {["cpu", "memory", "network"].map((key) => (
                <button
                  type="button"
                  key={key}
                  className={metric === key ? "active" : ""}
                  onClick={() => setMetric(key)}
                >
                  {key}
                </button>
              ))}
              {metric === "cpu" && (
                <button
                  type="button"
                  aria-pressed={compare}
                  className={compare ? "active" : ""}
                  onClick={() => setCompare((value) => !value)}
                >
                  Compare memory
                </button>
              )}
            </div>
          </div>
          <div className="monitoring-chart">
            <ResourceChart
              metric={metric as "cpu" | "memory" | "network"}
              range={range}
              compareMemory={compare}
            />
          </div>
          <div className="chart-foot">
            <span>Deterministic illustrative samples · no live telemetry</span>
            <span>Units: {metric === "network" ? "Mb/s" : "%"}</span>
          </div>
        </Card>
        <Card className="storage-card">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">STORAGE</span>
              <h2>Disk utilization</h2>
            </div>
            <HardDrive size={17} className="muted" />
          </div>
          <div className="storage-total">
            <b>
              {storageAverage}
              <small>%</small>
            </b>
            <span>average across {nodes.length} sample nodes</span>
          </div>
          <Progress value={storageAverage} tone="blue" />
          <div className="storage-legend">
            <span>
              <i className="legend-dot cpu-dot" />
              Used <b>{storageAverage}%</b>
            </span>
            <span>
              <i className="legend-dot neutral-dot" />
              Available <b>{100 - storageAverage}%</b>
            </span>
          </div>
          <div className="storage-row-list">
            {nodes.map((node) => (
              <div className="storage-row" key={node.id}>
                <span>{node.name}</span>
                <b>{node.disk}%</b>
                <Progress
                  value={node.disk}
                  tone={node.disk > 70 ? "amber" : "blue"}
                />
              </div>
            ))}
          </div>
        </Card>
        <Card className="monitor-health-card">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">HEALTH</span>
              <h2>Node health summary</h2>
            </div>
            <Link to="/nodes" className="text-link">
              Inspect nodes <ArrowRight size={13} />
            </Link>
          </div>
          <div className="health-summary-list">
            {nodes.map((node) => (
              <Link
                className="health-summary-row"
                key={node.id}
                to="/nodes"
                onClick={() => selectNode(node.id)}
              >
                <span className={`node-indicator ${node.health}`} />
                <div>
                  <b>{node.name}</b>
                  <small>{node.host}</small>
                </div>
                <HealthBadge health={node.health} />
              </Link>
            ))}
          </div>
        </Card>
        <Card className="monitoring-note">
          <CircleAlert size={16} />
          <div>
            <b>Sample monitoring</b>
            <p>
              Charts read persisted sample telemetry. No telemetry service is
              connected and freshness does not update.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
