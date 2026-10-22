import * as Icons from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import * as UI from "../components/ui";
import { useDemoData } from "../data/useDashboardData";
import { useDashboardStore } from "../state/useDashboardStore";
import { ClusterModal } from "./shared";

export function ClustersPage() {
  const { clusters, cluster, nodes } = useDemoData();
  const allNodes = useDashboardStore((state) => state.nodes);
  const moveNode = useDashboardStore((state) => state.moveNode);
  const selectedId = useDashboardStore((s) => s.selectedClusterId);
  const select = useDashboardStore((s) => s.selectCluster);
  const [modal, setModal] = useState<string | "new" | null>(null);
  return (
    <>
      <UI.PageTitle
        eyebrow="ORGANIZATION"
        title="Clusters"
        description="Organize sample nodes into separate demo environments."
        actions={
          <UI.Button variant="primary" onClick={() => setModal("new")}>
            <Icons.Plus size={15} /> New cluster
          </UI.Button>
        }
      />
      <div className="cluster-cards">
        {clusters.map((item) => {
          const count = useDashboardStore
            .getState()
            .nodes.filter((n) => n.clusterId === item.id).length;
          const isSelected = selectedId === item.id;
          return (
            <UI.Card
              key={item.id}
              className={`cluster-card ${isSelected ? "cluster-selected" : ""}`}
            >
              <div className="cluster-card-top">
                <div className="cluster-symbol">
                  <Icons.Layers3 size={19} />
                </div>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Edit ${item.name}`}
                  onClick={() => setModal(item.id)}
                >
                  •••
                </button>
              </div>
              <div className="cluster-card-name">
                <h2>{item.name}</h2>
                {isSelected && (
                  <span className="selected-tag">
                    <Icons.Check size={10} /> ACTIVE
                  </span>
                )}
              </div>
              <p>{item.description || "No description added."}</p>
              <div className="cluster-card-meta">
                <span>⌖ &nbsp;{item.region}</span>
                <span>
                  <Icons.Server size={13} /> {count} nodes
                </span>
              </div>
              <div className="cluster-card-health">
                <span>
                  <i className="health-mini healthy" />
                  {
                    useDashboardStore
                      .getState()
                      .nodes.filter(
                        (n) =>
                          n.clusterId === item.id && n.health !== "offline",
                      ).length
                  }{" "}
                  online
                </span>
                <span>{item.createdAt}</span>
              </div>
              <div className="cluster-card-actions">
                {!isSelected && (
                  <UI.Button variant="primary" onClick={() => select(item.id)}>
                    Set active cluster
                  </UI.Button>
                )}
                <UI.Button onClick={() => setModal(item.id)}>
                  Edit details
                </UI.Button>
              </div>
            </UI.Card>
          );
        })}
        <button
          type="button"
          className="new-cluster-card"
          onClick={() => setModal("new")}
        >
          <span>
            <Icons.Plus size={20} />
          </span>
          <b>Create a demo cluster</b>
          <small>Add a sample environment to organize nodes</small>
        </button>
      </div>
      {cluster && (
        <UI.Card className="cluster-detail-card">
          <span className="eyebrow">ACTIVE CLUSTER DETAILS</span>
          <div className="cluster-detail-grid">
            <div>
              <h2>{cluster.name}</h2>
              <p>{cluster.description}</p>
            </div>
            <div>
              <small>LOCATION</small>
              <b>{cluster.region}</b>
            </div>
            <div>
              <small>MEMBERS</small>
              <b>{nodes.length} nodes</b>
            </div>
            <div>
              <small>CREATED</small>
              <b>{cluster.createdAt}</b>
            </div>
          </div>
          <Link to="/nodes" className="text-link">
            Manage nodes <Icons.ArrowRight size={13} />
          </Link>
        </UI.Card>
      )}
      <UI.Card className="table-card cluster-organizer">
        <div className="table-toolbar">
          <div>
            <h2>Organize sample nodes</h2>
            <span>Move demo nodes between local clusters.</span>
          </div>
          <span className="availability-tag">LOCAL DEMO</span>
        </div>
        <div className="cluster-node-list">
          {allNodes.map((node) => (
            <div className="cluster-node-row" key={node.id}>
              <span className={`node-indicator ${node.health}`} />
              <div>
                <b>{node.name}</b>
                <small>{node.host}</small>
              </div>
              <label>
                <span className="sr-only">Cluster for {node.name}</span>
                <select
                  value={node.clusterId}
                  onChange={(event) => moveNode(node.id, event.target.value)}
                  aria-label={`Move ${node.name} to cluster`}
                >
                  {clusters.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>
      </UI.Card>
      {modal && (
        <ClusterModal
          key={modal}
          close={() => setModal(null)}
          clusterId={modal === "new" ? undefined : modal}
        />
      )}
    </>
  );
}
