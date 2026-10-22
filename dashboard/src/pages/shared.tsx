import * as Icons from "lucide-react";
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { useState } from "react";
import * as UI from "../components/ui";
import type { ActivityEvent, DemoTask, Node } from "../data/models";
import { useDashboardStore } from "../state/useDashboardStore";

export function handleDialogKeyDown(
  event: ReactKeyboardEvent<HTMLElement>,
  close: () => void,
) {
  if (event.key === "Escape") {
    event.stopPropagation();
    close();
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}
export function NodeRow({
  node,
  onSelect,
}: {
  node: Node;
  onSelect?: () => void;
}) {
  return (
    <tr onClick={onSelect} className={onSelect ? "clickable-row" : ""}>
      <td>
        <div className="node-cell">
          <span className={`node-indicator ${node.health}`} />
          <div>
            <b>{node.name}</b>
            <small>{node.host}</small>
          </div>
        </div>
      </td>
      <td>
        <UI.HealthBadge health={node.health} />
      </td>
      <td>
        {node.role === "coordinator" ? (
          <span className="role-pill coordinator">Coordinator</span>
        ) : (
          <span className="role-pill">Worker</span>
        )}
      </td>
      <td>
        <div className="table-meter">
          <UI.Progress value={node.cpu} />
          <span>{node.cpu}%</span>
        </div>
      </td>
      <td>
        <div className="table-meter">
          <UI.Progress value={node.memory} tone="purple" />
          <span>{node.memory}%</span>
        </div>
      </td>
      <td className="muted">{node.lastSeen}</td>
      <td>
        <button
          type="button"
          className="icon-button"
          aria-label={`More about ${node.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onSelect?.();
          }}
        >
          •••
        </button>
      </td>
    </tr>
  );
}
export function ActivityLine({
  event,
  compact = false,
}: {
  event: ActivityEvent;
  compact?: boolean;
}) {
  return (
    <div className="activity-line">
      <span className={`activity-marker ${event.severity}`} />
      <div className="activity-copy">
        <b>{event.title}</b>
        <p>{event.detail}</p>
        {!compact && <span className="activity-source">{event.source}</span>}
      </div>
      <time>{event.time}</time>
    </div>
  );
}
export function ClusterModal({
  close,
  clusterId,
}: {
  close: () => void;
  clusterId?: string;
}) {
  const clusters = useDashboardStore((s) => s.clusters);
  const target = clusters.find((c) => c.id === clusterId);
  const add = useDashboardStore((s) => s.addCluster);
  const update = useDashboardStore((s) => s.updateCluster);
  const [name, setName] = useState(target?.name ?? "");
  const [region, setRegion] = useState(target?.region ?? "Local network");
  const [description, setDescription] = useState(target?.description ?? "");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (target) update(target.id, { name: name.trim(), region, description });
    else add(name, region, description);
    close();
  };
  return (
    <div className="modal-backdrop">
      {/* ORIGINAL (preserved, not deleted — disabled by comment): onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }} */}
      <button
        className="overlay-dismiss"
        type="button"
        aria-label="Close dialog"
        onClick={close}
      />
      <form
        className="modal-card"
        onSubmit={submit}
        aria-labelledby="cluster-modal-title"
        role="dialog"
        aria-modal="true"
        onKeyDown={(event) => handleDialogKeyDown(event, close)}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">DEMO CLUSTER</span>
            <h2 id="cluster-modal-title">
              {target ? "Edit cluster" : "Create cluster"}
            </h2>
          </div>
          <UI.Button
            type="button"
            variant="ghost"
            aria-label="Close dialog"
            onClick={close}
          >
            <Icons.X size={16} />
          </UI.Button>
        </div>
        <p>
          Manage local sample information. This does not register real
          infrastructure.
        </p>
        <label>
          Cluster name
          {/* ORIGINAL (preserved, not deleted — disabled by comment): autoFocus */}
          <input
            required
            maxLength={48}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Research Lab"
          />
        </label>
        <label>
          Location
          <input
            maxLength={64}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </label>
        <label>
          Description
          <textarea
            rows={3}
            maxLength={180}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div className="modal-actions">
          <UI.Button type="button" onClick={close}>
            Cancel
          </UI.Button>
          <UI.Button type="submit" variant="primary">
            {target ? "Save changes" : "Create demo cluster"}
          </UI.Button>
        </div>
      </form>
    </div>
  );
}
export function TaskBadge({ status }: { status: DemoTask["status"] }) {
  return (
    <span className={`task-status ${status}`}>
      <i />
      {status}
    </span>
  );
}
