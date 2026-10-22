import * as Icons from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import * as UI from "../components/ui";
import { softwareCatalog } from "../data/mock";
import { useDemoData } from "../data/useDashboardData";
import { handleDialogKeyDown } from "./shared";

export function SoftwarePage() {
  const { nodes } = useDemoData();
  const [softwareId, setSoftwareId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState(nodes[0]?.id ?? "");
  const [configured, setConfigured] = useState<string[]>([]);
  useEffect(() => {
    if (!nodes.some((node) => node.id === selectedNode)) {
      setSelectedNode(nodes[0]?.id ?? "");
    }
  }, [nodes, selectedNode]);
  const item = softwareCatalog.find((software) => software.id === softwareId);
  return (
    <>
      <UI.PageTitle
        eyebrow="INTEGRATIONS"
        title="AI Software"
        description="Explore compatible software adapters. Install actions are demonstrations only."
        actions={
          <span className="availability-tag">
            <span /> Catalog preview
          </span>
        }
      />
      <div className="software-intro">
        <div className="software-intro-symbol">
          <Icons.Bot size={22} />
        </div>
        <div>
          <b>Agent ecosystem</b>
          <p>
            OpenCluster may support integrations where upstream tools expose
            stable interfaces. Nothing is installed or contacted in this
            preview.
          </p>
        </div>
      </div>
      <div className="software-grid">
        {softwareCatalog.map((software) => (
          <UI.Card className="software-card" key={software.id}>
            <div className="software-card-head">
              <div
                className="software-logo"
                style={{ "--software-color": software.color } as CSSProperties}
              >
                {software.name.slice(0, 1)}
              </div>
              <div>
                <span className="software-category">{software.category}</span>
                <h2>{software.name}</h2>
                <small>{software.vendor}</small>
              </div>
              <span className={`availability-pill ${software.status}`}>
                {software.status === "available" ? "Preview" : "Planned"}
              </span>
            </div>
            <p>{software.description}</p>
            <div className="software-features">
              <span>
                <Icons.Check size={12} /> Adapter overview
              </span>
              <span>
                <Icons.Check size={12} /> Demo configuration
              </span>
            </div>
            <UI.Button
              className="software-action"
              onClick={() => setSoftwareId(software.id)}
            >
              {configured.includes(software.id)
                ? "View demo configuration"
                : "Preview installation"}
              <Icons.ArrowRight size={14} />
            </UI.Button>
          </UI.Card>
        ))}
        <UI.Card className="software-future">
          <div className="future-icon">
            <Icons.Plus size={20} />
          </div>
          <h2>Bring your own adapter</h2>
          <p>
            Future integrations can be added through documented,
            permission-scoped adapters.
          </p>
          <span className="availability-pill planned">Coming later</span>
        </UI.Card>
      </div>
      {item && (
        <div className="modal-backdrop">
          {/* ORIGINAL (preserved, not deleted — disabled by comment): onMouseDown={(e) => { if (e.target === e.currentTarget) setSoftwareId(null); }} */}
          <button
            className="overlay-dismiss"
            type="button"
            aria-label="Close preview"
            onClick={() => setSoftwareId(null)}
          />
          <section
            className="modal-card software-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="software-modal-title"
            onKeyDown={(event) =>
              handleDialogKeyDown(event, () => setSoftwareId(null))
            }
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">DEMONSTRATION ONLY</span>
                <h2 id="software-modal-title">
                  {configured.includes(item.id)
                    ? "Demo configuration"
                    : "Installation preview"}
                </h2>
              </div>
              <UI.Button
                variant="ghost"
                aria-label="Close preview"
                onClick={() => setSoftwareId(null)}
              >
                <Icons.X size={16} />
              </UI.Button>
            </div>
            <div className="software-modal-product">
              <span
                className="software-logo"
                style={{ "--software-color": item.color } as CSSProperties}
              >
                {item.name.slice(0, 1)}
              </span>
              <div>
                <b>{item.name}</b>
                <small>
                  {item.vendor} · {item.category}
                </small>
              </div>
            </div>
            <p className="modal-disclaimer">
              This preview does not download, install, or launch software. It
              only stores a local demo selection.
            </p>
            <label>
              Target node
              <select
                value={selectedNode}
                onChange={(e) => setSelectedNode(e.target.value)}
              >
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Configuration profile
              <select>
                <option>Default demo profile</option>
                <option>Restricted preview</option>
                <option>Developer sandbox</option>
              </select>
            </label>
            <label className="check-label">
              <input type="checkbox" defaultChecked /> I understand this is a
              local demonstration
            </label>
            <div className="modal-actions">
              <UI.Button onClick={() => setSoftwareId(null)}>Cancel</UI.Button>
              <UI.Button
                variant="primary"
                onClick={() => {
                  setConfigured((value) =>
                    value.includes(item.id) ? value : [...value, item.id],
                  );
                  setSoftwareId(null);
                }}
              >
                Save demo configuration
              </UI.Button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
