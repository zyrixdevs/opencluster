import type { ReactNode } from "react";
import { Component, lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { ErrorState, LoadingState } from "../components/ui";

const HomePage = lazy(() =>
  import("./Home").then((module) => ({ default: module.HomePage })),
);
const MissionPage = lazy(() =>
  import("./MissionControl").then((module) => ({
    default: module.MissionPage,
  })),
);
const ClustersPage = lazy(() =>
  import("./Clusters").then((module) => ({ default: module.ClustersPage })),
);
const NodesPage = lazy(() =>
  import("./Nodes").then((module) => ({ default: module.NodesPage })),
);
const AgentsPage = lazy(() =>
  import("./Agents").then((module) => ({ default: module.AgentsPage })),
);
const AutomationPage = lazy(() =>
  import("./Automation").then((module) => ({ default: module.AutomationPage })),
);
const SoftwarePage = lazy(() =>
  import("./Software").then((module) => ({ default: module.SoftwarePage })),
);
const TasksPage = lazy(() =>
  import("./Tasks").then((module) => ({ default: module.TasksPage })),
);
const MonitoringPage = lazy(() =>
  import("./Monitoring").then((module) => ({ default: module.MonitoringPage })),
);
const ActivityPage = lazy(() =>
  import("./Activity").then((module) => ({ default: module.ActivityPage })),
);
const SettingsPage = lazy(() =>
  import("./Settings").then((module) => ({ default: module.SettingsPage })),
);
const ComponentLabPage = lazy(() =>
  import("./ComponentLab").then((module) => ({
    default: module.ComponentLabPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("./NotFound").then((module) => ({ default: module.NotFoundPage })),
);

class RouteErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? (
      <ErrorState
        title="This view didn’t load"
        detail="Try loading the dashboard view again."
        onRetry={() => window.location.reload()}
      />
    ) : (
      this.props.children
    );
  }
}

export function DashboardApp() {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<LoadingState label="Loading dashboard view" />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="mission-control" element={<MissionPage />} />
            <Route path="clusters" element={<ClustersPage />} />
            <Route path="nodes" element={<NodesPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="automation" element={<AutomationPage />} />
            <Route path="software" element={<SoftwarePage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="monitoring" element={<MonitoringPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="component-lab" element={<ComponentLabPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  );
}
