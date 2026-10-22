import { ArrowRight, CircleAlert, HardDrive } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ResourceChart } from "../components/Charts";
import { Card, HealthBadge, PageTitle, Progress } from "../components/ui";
import { useDemoData } from "../data/useDashboardData";

export function MonitoringPage() {
  const { nodes } = useDemoData();
  const [range, setRange] = useState("24h");
  const [metric, setMetric] = useState("cpu");
  return (
    <>
      <PageTitle
        eyebrow="OBSERVABILITY"
        title="Monitoring"
        description="Historical demo metrics from a fixed sample data set."
        actions={
          <select
            className="select-pill"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            aria-label="Select time range"
          >
            <option value="1h">Last hour</option>
            <option value="6h">Last 6 hours</option>
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
        <span>Range selection changes the displayed label only.</span>
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
            </div>
          </div>
          <div className="monitoring-chart">
            <ResourceChart
              metric={metric as "cpu" | "memory" | "network"}
              range={range as "1h" | "6h" | "24h" | "7d"}
            />
          </div>
          <div className="chart-foot">
            <span>
              Fixed illustrative pattern · reindexed for the selected range
            </span>
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
              2.8 <small>TB</small>
            </b>
            <span>of 6.4 TB allocated</span>
          </div>
          <Progress value={44} tone="blue" />
          <div className="storage-legend">
            <span>
              <i className="legend-dot cpu-dot" />
              Used <b>44%</b>
            </span>
            <span>
              <i className="legend-dot neutral-dot" />
              Available <b>56%</b>
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
              <div className="health-summary-row" key={node.id}>
                <span className={`node-indicator ${node.health}`} />
                <div>
                  <b>{node.name}</b>
                  <small>{node.host}</small>
                </div>
                <HealthBadge health={node.health} />
              </div>
            ))}
          </div>
        </Card>
        <Card className="monitoring-note">
          <CircleAlert size={16} />
          <div>
            <b>Demo monitoring</b>
            <p>
              Charts use static values created for interface preview. No
              telemetry service is connected and freshness does not update.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
