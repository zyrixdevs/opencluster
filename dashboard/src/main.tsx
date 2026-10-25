import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/sora/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { localProvider } from "./data/localProvider";
import { dashboardQueryClient } from "./data/queryClient";
import { DashboardApp } from "./pages";
import { useDashboardStore } from "./state/useDashboardStore";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing dashboard root element.");

const appRoot = ReactDOM.createRoot(root);
appRoot.render(
  <main className="app-bootstrap" role="status">
    Loading your local OpenCluster workspace…
  </main>,
);

async function startDashboard() {
  try {
    const persisted = localStorage.getItem("opencluster-demo-preferences");
    let legacy: unknown;
    if (persisted) {
      try {
        legacy = (JSON.parse(persisted) as { state?: unknown }).state;
      } catch {
        legacy = undefined;
      }
    }
    const data = await localProvider.initialize(legacy);
    const selectedClusterId = useDashboardStore.getState().selectedClusterId;
    useDashboardStore.setState({
      ...data,
      selectedClusterId: data.clusters.some(
        (cluster) => cluster.id === selectedClusterId,
      )
        ? selectedClusterId
        : (data.clusters[0]?.id ?? ""),
    });
  } catch (error) {
    useDashboardStore.setState({
      persistenceError:
        error instanceof Error
          ? error.message
          : "Local browser storage is unavailable.",
    });
  }
  appRoot.render(
    <React.StrictMode>
      <AppErrorBoundary>
        <QueryClientProvider client={dashboardQueryClient}>
          <BrowserRouter>
            <DashboardApp />
          </BrowserRouter>
        </QueryClientProvider>
      </AppErrorBoundary>
    </React.StrictMode>,
  );
}
void startDashboard();
