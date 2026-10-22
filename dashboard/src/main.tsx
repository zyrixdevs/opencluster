import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/sora/wght.css";
import { DashboardApp } from "./pages";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: false } },
});

const root = document.getElementById("root");
if (!root) throw new Error("Missing dashboard root element.");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DashboardApp />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
