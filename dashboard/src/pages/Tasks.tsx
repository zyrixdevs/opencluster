import { useQueryClient } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { useEffect, useState } from "react";
import * as UI from "../components/ui";
import { demoApi } from "../data/demoApi";
import type { DemoTask } from "../data/models";
import { dashboardProvider } from "../data/provider";
import { useLocalCollection } from "../data/useDashboardData";
import { useDashboardStore } from "../state/useDashboardStore";
import { TaskBadge } from "./shared";

export function TasksPage() {
  const { data: savedTasks = [] } = useLocalCollection<DemoTask>("tasks");
  const [tasks, setTasks] = useState<DemoTask[]>([]);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [toast, setToast] = useState("");
  const [assignment, setAssignment] = useState<Record<string, string>>({});
  const nodes = useDashboardStore((state) => state.nodes);
  const queryClient = useQueryClient();
  useEffect(() => setTasks(savedTasks), [savedTasks]);
  const filtered = tasks.filter(
    (task) => filter === "all" || task.status === filter,
  );
  const sortedTasks = [...filtered].sort((left, right) => {
    if (sortBy === "name") return left.name.localeCompare(right.name);
    if (sortBy === "status") return left.status.localeCompare(right.status);
    if (sortBy === "progress") return right.progress - left.progress;
    return tasks.indexOf(left) - tasks.indexOf(right);
  });
  const runDemo = () => {
    const id = `job-${Date.now()}`;
    const task = demoApi.createTask(nodes[0]?.id ?? "Unassigned", id);
    void dashboardProvider.tasks
      .create(task.id, task)
      .then(() => {
        setTasks((previous) => [task, ...previous]);
        void queryClient.invalidateQueries({
          queryKey: ["local-records", "tasks"],
        });
        setToast("Task saved to the local queue. Execution is unavailable.");
      })
      .catch(() => setToast("Task could not be saved locally."));
    window.setTimeout(() => setToast(""), 2800);
  };
  return (
    <>
      <UI.PageTitle
        eyebrow="ORCHESTRATION"
        title="Tasks"
        description="Track sample jobs across your cluster. Execution is simulated."
        actions={
          <UI.Button variant="primary" onClick={runDemo}>
            <Icons.Plus size={15} /> Queue demo task
          </UI.Button>
        }
      />
      {toast && (
        <div className="toast-demo" role="status">
          {toast}
        </div>
      )}
      <div className="stats-grid task-stats">
        <UI.Stat
          label="Queued"
          value={String(
            tasks.filter((t) => t.status === "queued").length,
          ).padStart(2, "0")}
          detail="Waiting for assignment"
          icon={<Icons.Clock3 size={16} />}
          tone="amber"
        />
        <UI.Stat
          label="Running"
          value={String(
            tasks.filter((t) => t.status === "running").length,
          ).padStart(2, "0")}
          detail="On sample nodes"
          icon={<Icons.Activity size={16} />}
          tone="blue"
        />
        <UI.Stat
          label="Completed today"
          value={String(
            tasks.filter((task) => task.status === "completed").length,
          ).padStart(2, "0")}
          detail="Completed sample records"
          icon={<Icons.Check size={16} />}
          tone="green"
        />
        <UI.Stat
          label="Failed"
          value={String(
            tasks.filter((t) => t.status === "failed").length,
          ).padStart(2, "0")}
          detail="Review demo history"
          icon={<Icons.CircleAlert size={16} />}
          tone="red"
        />
      </div>
      <UI.Card className="queue-card">
        <div className="table-toolbar">
          <div>
            <h2>Task queue</h2>
            <span>Sample execution history and assignments</span>
          </div>
          <div className="toolbar-controls">
            <select
              className="select-pill"
              value={filter}
              aria-label="Filter tasks"
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="queued">Queued</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <select
              className="select-pill"
              aria-label="Sort tasks"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="recent">Recently added</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="progress">Progress</option>
            </select>
            <UI.Button
              onClick={() => {
                const content = [
                  "id,name,status,assignedNode,progress",
                  ...sortedTasks.map((task) =>
                    [
                      task.id,
                      task.name,
                      task.status,
                      assignment[task.id] ?? task.nodeId,
                      task.progress,
                    ].join(","),
                  ),
                ].join("\n");
                const url = URL.createObjectURL(
                  new Blob([content], { type: "text/csv" }),
                );
                const link = document.createElement("a");
                link.href = url;
                link.download = "opencluster-demo-tasks.csv";
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Icons.Download size={14} /> Export demo log
            </UI.Button>
          </div>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>TASK</th>
                <th>STATUS</th>
                <th>PROGRESS</th>
                <th>ASSIGNED NODE</th>
                <th>STARTED</th>
                <th>DURATION</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <div className="task-name">
                      <b>{task.name}</b>
                      <small>
                        {task.id} · {task.type}
                      </small>
                    </div>
                  </td>
                  <td>
                    <TaskBadge status={task.status} />
                  </td>
                  <td>
                    <div className="task-progress">
                      <UI.Progress
                        value={task.progress}
                        tone={task.status === "failed" ? "red" : "green"}
                      />
                      <span>{task.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <select
                      className="assignment-select"
                      aria-label={`Assign ${task.name}`}
                      value={assignment[task.id] ?? task.nodeId}
                      onChange={(e) =>
                        (() => {
                          const assigned = demoApi.assignTask(
                            task,
                            e.target.value,
                          );
                          setAssignment((prev) => ({
                            ...prev,
                            [task.id]: assigned.nodeId,
                          }));
                          void dashboardProvider.tasks
                            .update(task.id, assigned)
                            .then(() => {
                              setTasks((previous) =>
                                previous.map((item) =>
                                  item.id === task.id ? assigned : item,
                                ),
                              );
                              void queryClient.invalidateQueries({
                                queryKey: ["local-records", "tasks"],
                              });
                            })
                            .catch(() =>
                              setToast(
                                "Assignment could not be saved locally.",
                              ),
                            );
                        })()
                      }
                    >
                      {nodes.map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="muted">{task.started}</td>
                  <td className="muted">{task.duration}</td>
                  <td>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Demo action for ${task.id}`}
                      onClick={() =>
                        setToast("Task controls are simulated in this preview.")
                      }
                    >
                      •••
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footnote">
          Task assignment is local UI state. No jobs are dispatched to nodes.
        </div>
      </UI.Card>
      <UI.Card className="execution-card">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">EXECUTION FLOW</span>
            <h2>Recent timeline</h2>
          </div>
          <span className="availability-tag">SIMULATED</span>
        </div>
        <div className="execution-timeline">
          {tasks.slice(0, 4).map((task, index) => (
            <div className="execution-step" key={task.id}>
              <span className={`execution-node ${task.status}`}>
                {index + 1}
              </span>
              <div>
                <b>{task.name}</b>
                <small>
                  {task.started} · {task.duration}
                </small>
              </div>
              <TaskBadge status={task.status} />
            </div>
          ))}
        </div>
      </UI.Card>
    </>
  );
}
