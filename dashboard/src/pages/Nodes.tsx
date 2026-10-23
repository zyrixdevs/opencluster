import * as Icons from "lucide-react";
import { useState } from "react";
import * as UI from "../components/ui";
import { useDemoData } from "../data/useDashboardData";
import { useDashboardStore } from "../state/useDashboardStore";
import { handleDialogKeyDown, NodeRow } from "./shared";

export function NodesPage() {
  const { nodes, cluster } = useDemoData();
  const selectedId = useDashboardStore((s) => s.selectedNodeId);
  const allNodes = useDashboardStore((s) => s.nodes);
  const clusters = useDashboardStore((s) => s.clusters);
  const select = useDashboardStore((s) => s.selectNode);
  const toggleCoordinator = useDashboardStore((s) => s.toggleCoordinator);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [os, setOs] = useState("all");
  const [scope, setScope] = useState("active");
  const [sort, setSort] = useState("name");
  const visible = allNodes
    .filter(
      (node) =>
        (scope === "all" ||
          node.clusterId === (scope === "active" ? cluster?.id : scope)) &&
        (filter === "all" || node.health === filter) &&
        (role === "all" || node.role === role) &&
        (os === "all" || node.os.toLowerCase().includes(os.toLowerCase())) &&
        `${node.name} ${node.host} ${node.os}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "cpu"
        ? b.cpu - a.cpu
        : sort === "memory"
          ? b.memory - a.memory
          : a.name.localeCompare(b.name),
    );
  const selected = nodes.find((node) => node.id === selectedId);
  return (
    <>
      <UI.PageTitle
        eyebrow="INFRASTRUCTURE"
        title="Nodes"
        description="Inspect the machines in your selected demo cluster."
        actions={
          <UI.Button
            disabled
            title="Node enrollment is not implemented in demo mode"
          >
            <Icons.Plus size={15} /> Enrollment unavailable
          </UI.Button>
        }
      />
      <div className="node-summary-strip">
        <div>
          <Icons.Server size={16} />
          <span>
            <b>{nodes.length}</b> total nodes
          </span>
        </div>
        <div>
          <span className="health-mini healthy" />
          {nodes.filter((n) => n.health === "healthy").length} healthy
        </div>
        <div>
          <span className="health-mini warning" />
          {nodes.filter((n) => n.health === "warning").length} attention
        </div>
        <div>
          <span className="health-mini offline" />
          {nodes.filter((n) => n.health === "offline").length} offline
        </div>
        <span className="muted">{cluster?.name}</span>
      </div>
      <UI.Card className="table-card">
        <div className="table-toolbar">
          <div>
            <h2>Node inventory</h2>
            <span>{visible.length} nodes · sample status</span>
          </div>
          <div className="toolbar-controls">
            <label className="search-box">
              <Icons.Search size={14} />
              <input
                aria-label="Search nodes"
                placeholder="Search nodes"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <select
              className="select-pill"
              aria-label="Filter nodes by health"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="healthy">Healthy</option>
              <option value="warning">Attention</option>
              <option value="offline">Offline</option>
            </select>
            <select
              className="select-pill"
              aria-label="Filter nodes by role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="all">All roles</option>
              <option value="coordinator">Coordinator</option>
              <option value="worker">Worker</option>
            </select>
            <select
              className="select-pill"
              aria-label="Filter nodes by operating system"
              value={os}
              onChange={(e) => setOs(e.target.value)}
            >
              <option value="all">All systems</option>
              {[
                ...new Set(allNodes.map((node) => node.os.split(" · ")[0])),
              ].map((system) => (
                <option key={system} value={system}>
                  {system}
                </option>
              ))}
            </select>
            <select
              className="select-pill"
              aria-label="Filter nodes by cluster"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
            >
              <option value="active">Active cluster</option>
              <option value="all">All clusters</option>
              {clusters
                .filter((item) => item.id !== cluster?.id)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
            <select
              className="select-pill"
              aria-label="Sort nodes"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="name">Sort by name</option>
              <option value="cpu">Highest CPU</option>
              <option value="memory">Highest memory</option>
            </select>
          </div>
        </div>
        <div className="table-scroll">
          <table className="data-table nodes-table">
            <thead>
              <tr>
                <th>NODE</th>
                <th>STATUS</th>
                <th>ROLE</th>
                <th>CPU</th>
                <th>MEMORY</th>
                <th>LAST SEEN</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((node) => (
                <NodeRow
                  key={node.id}
                  node={node}
                  onSelect={() => select(node.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footnote">
          Telemetry shown is sample data generated for interface preview.
        </div>
      </UI.Card>
      {selected && (
        <div
          className="node-detail-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.name} details`}
          tabIndex={-1}
          onKeyDown={(event) => handleDialogKeyDown(event, () => select(null))}
        >
          <div className="node-detail-drawer">
            <div className="drawer-head">
              <div>
                <span className="eyebrow">NODE PROFILE</span>
                <h2>{selected.name}</h2>
              </div>
              <UI.Button
                variant="ghost"
                aria-label="Close node detail"
                onClick={() => select(null)}
                autoFocus
              >
                <Icons.X size={17} />
              </UI.Button>
            </div>
            <UI.HealthBadge health={selected.health} />
            <div className="drawer-host">
              {selected.host} <span>·</span> {selected.os}
            </div>
            <div className="drawer-metric-grid">
              <div>
                <Icons.Cpu size={16} />
                <small>CPU LOAD</small>
                <b>{selected.cpu}%</b>
                <UI.Progress value={selected.cpu} />
              </div>
              <div>
                <Icons.MemoryStick size={16} />
                <small>MEMORY</small>
                <b>{selected.memory}%</b>
                <UI.Progress value={selected.memory} tone="purple" />
              </div>
              <div>
                <Icons.HardDrive size={16} />
                <small>DISK USED</small>
                <b>{selected.disk}%</b>
                <UI.Progress value={selected.disk} tone="amber" />
              </div>
              <div>
                <Icons.Network size={16} />
                <small>NETWORK</small>
                <b>{selected.network} Mb/s</b>
                <UI.Progress value={selected.network} tone="blue" />
              </div>
            </div>
            <div className="drawer-section">
              <h3>System</h3>
              <div className="detail-row">
                Operating system <b>{selected.os}</b>
              </div>
              <div className="detail-row">
                Uptime <b>{selected.uptime}</b>
              </div>
              <div className="detail-row">
                Last sample <b>{selected.lastSeen}</b>
              </div>
              <div className="detail-row">
                GPU <b>{selected.gpu ?? "Not detected"}</b>
              </div>
            </div>
            <div className="drawer-section">
              <h3>Health history</h3>
              <p>Four illustrative samples, oldest to newest.</p>
              <fieldset className="health-history">
                <legend className="sr-only">
                  Demo health history ending {selected.health}
                </legend>
                {(
                  [
                    ["sample-1", "healthy"],
                    ["sample-2", "healthy"],
                    [
                      "sample-3",
                      selected.health === "offline" ? "warning" : "healthy",
                    ],
                    ["sample-4", selected.health],
                  ] as const
                ).map(([sample, health], index) => (
                  <span
                    /* ORIGINAL (preserved, not deleted — disabled by comment): key={`${health}-${index}`} */
                    key={sample}
                    className={`health-history-sample ${health}`}
                    title={`${health} demo sample ${index + 1}`}
                  />
                ))}
                {!visible.length && (
                  <tr>
                    <td colSpan={7} className="table-empty">
                      No nodes match these filters.
                    </td>
                  </tr>
                )}
              </fieldset>
            </div>
            <div className="drawer-section">
              <h3>Node role</h3>
              <p>
                Role changes apply only to this browser-local cluster record.
              </p>
              {selected.role === "coordinator" ? (
                <span className="selected-tag">
                  Current cluster coordinator
                </span>
              ) : (
                <UI.Button onClick={() => void toggleCoordinator(selected.id)}>
                  Designate as coordinator
                </UI.Button>
              )}
              {/* ORIGINAL (preserved, not deleted — disabled by comment): <UI.Button onClick={() => toggleCoordinator(selected.id)}>{selected.role === "coordinator" ? "Designate as worker" : "Designate as coordinator"}</UI.Button> */}
            </div>
            <div className="demo-note">
              <Icons.CircleAlert size={14} /> Demo profile. No host telemetry is
              connected.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
