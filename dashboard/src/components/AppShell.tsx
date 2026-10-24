import { motion, useReducedMotion } from "framer-motion";
import Lenis from "lenis";
import {
  Activity,
  Bell,
  BrainCircuit,
  ChevronDown,
  CircleHelp,
  Command,
  Cpu,
  Gauge,
  Grid2X2,
  Layers3,
  Menu,
  Puzzle,
  Search,
  Settings,
  Sparkles,
  TerminalSquare,
  Workflow,
  X,
} from "lucide-react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { pageTransition, pageVariants } from "../animations/motion";
import { useDashboardStore } from "../state/useDashboardStore";
import { BranchedMenu } from "./BranchedMenu";
import { Dock } from "./Dock";
import { BellToggle } from "./react-bits/controls";
import { AnimatedThemeToggler } from "./react-bits/utilities";
import { Button } from "./ui";

const navItems = [
  { label: "Home", to: "/", icon: Grid2X2 },
  { label: "Mission Control", to: "/mission-control", icon: Sparkles },
  { label: "Clusters", to: "/clusters", icon: Layers3 },
  { label: "Nodes", to: "/nodes", icon: Cpu },
  { label: "Agents", to: "/agents", icon: BrainCircuit },
  { label: "Automation", to: "/automation", icon: Workflow },
  { label: "AI Software", to: "/software", icon: TerminalSquare },
  { label: "Tasks", to: "/tasks", icon: Activity },
  { label: "Monitoring", to: "/monitoring", icon: Gauge },
  { label: "Component Lab", to: "/component-lab", icon: Puzzle },
  { label: "Activity", to: "/activity", icon: Bell },
];
const routeNames: Record<string, string> = {
  "/": "Home",
  "/mission-control": "Mission Control",
  "/clusters": "Clusters",
  "/nodes": "Nodes",
  "/agents": "Agents",
  "/automation": "Automation",
  "/software": "AI Software",
  "/tasks": "Tasks",
  "/monitoring": "Monitoring",
  "/activity": "Activity",
  "/settings": "Settings",
  "/component-lab": "Component Lab",
};
const branchedItems = [
  { label: "Overview", value: "/", icon: <Grid2X2 size={16} /> },
  {
    label: "Operations",
    children: [
      {
        value: "/mission-control",
        label: "Mission Control",
        icon: <Sparkles size={16} />,
      },
      { value: "/clusters", label: "Clusters", icon: <Layers3 size={16} /> },
      { value: "/nodes", label: "Nodes", icon: <Cpu size={16} /> },
      { value: "/monitoring", label: "Monitoring", icon: <Gauge size={16} /> },
      { value: "/activity", label: "Activity", icon: <Bell size={16} /> },
      {
        value: "/component-lab",
        label: "Component Lab",
        icon: <Puzzle size={16} />,
      },
    ],
  },
  {
    label: "Orchestration",
    children: [
      { value: "/agents", label: "Agents", icon: <BrainCircuit size={16} /> },
      {
        value: "/automation",
        label: "Automation",
        icon: <Workflow size={16} />,
      },
      {
        value: "/software",
        label: "AI Software",
        icon: <TerminalSquare size={16} />,
      },
      { value: "/tasks", label: "Tasks", icon: <Activity size={16} /> },
    ],
  },
];
function keepFocusInDialog(event: ReactKeyboardEvent<HTMLElement>) {
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

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const clusters = useDashboardStore((s) => s.clusters);
  const selectedClusterId = useDashboardStore((s) => s.selectedClusterId);
  const selectCluster = useDashboardStore((s) => s.selectCluster);
  const collapsed = useDashboardStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useDashboardStore((s) => s.toggleSidebar);
  const theme = useDashboardStore((s) => s.theme);
  const setTheme = useDashboardStore((s) => s.setTheme);
  const demoMotion = useDashboardStore((s) => s.demoMotion);
  const compactDashboard = useDashboardStore((s) => s.compactDashboard);
  const performanceMode = useDashboardStore((s) => s.performanceMode);
  const cinematicMotion = useDashboardStore((s) => s.cinematicMotion);
  const displayName = useDashboardStore((s) => s.displayName);
  const persistenceError = useDashboardStore((s) => s.persistenceError);
  const clearPersistenceError = useDashboardStore(
    (s) => s.clearPersistenceError,
  );
  const prefersReducedMotion = useReducedMotion();
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const readPreference = () =>
      setNotificationsEnabled(
        localStorage.getItem("opencluster.notifications") !== "false",
      );
    readPreference();
    window.addEventListener("opencluster:notifications-change", readPreference);
    return () =>
      window.removeEventListener(
        "opencluster:notifications-change",
        readPreference,
      );
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const updateTheme = () => {
      setSystemTheme(media.matches ? "light" : "dark");
      document.documentElement.dataset.theme =
        theme === "system" ? (media.matches ? "light" : "dark") : theme;
    };
    updateTheme();
    media.addEventListener("change", updateTheme);
    document.documentElement.dataset.motion = demoMotion ? "full" : "reduced";
    document.documentElement.dataset.performance = performanceMode
      ? "on"
      : "off";
    return () => media.removeEventListener("change", updateTheme);
  }, [theme, demoMotion, performanceMode]);
  useEffect(() => {
    if (!demoMotion || performanceMode || prefersReducedMotion) return;
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });
    const handleVisibility = () => {
      if (document.hidden) lenis.stop();
      else lenis.start();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      lenis.destroy();
    };
  }, [demoMotion, performanceMode, prefersReducedMotion]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);
  const selected =
    clusters.find((cluster) => cluster.id === selectedClusterId) ?? clusters[0];
  const commands = useMemo(
    () =>
      [
        ...navItems.map((item) => ({ label: item.label, to: item.to })),
        { label: "Settings", to: "/settings" },
      ].filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  const openSearch = () => setSearchOpen(true);
  return (
    <div
      className={`app-shell ${collapsed ? "sidebar-is-collapsed" : ""} ${compactDashboard ? "compact-dashboard" : ""} ${performanceMode ? "performance-mode" : ""} ${cinematicMotion && demoMotion && !prefersReducedMotion ? "cinematic-motion" : ""}`}
    >
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <div className="brand-mark">
            <span />
            <span />
            <span />
          </div>
          <div className="brand-word">
            <b>opencluster</b>
            <small>
              LOCAL WORKSPACE <i>ACTIVE</i>
            </small>
          </div>
        </div>
        <div className="cluster-picker-wrap">
          <label className="eyebrow" htmlFor="cluster-select">
            ACTIVE CLUSTER
          </label>
          <div className="cluster-picker">
            <span className="cluster-pip" />
            <select
              id="cluster-select"
              value={selected?.id ?? ""}
              onChange={(event) => selectCluster(event.target.value)}
              aria-label="Select active cluster"
            >
              {clusters.map((cluster) => (
                <option key={cluster.id} value={cluster.id}>
                  {cluster.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </div>
          <div className="cluster-location">
            ⌖ &nbsp;{selected?.region ?? "No cluster selected"}
          </div>
        </div>
        <div className="nav-heading">WORKSPACE</div>
        <BranchedMenu
          items={branchedItems}
          active={location.pathname}
          onSelect={(value) => navigate(value)}
        />
        {/* ORIGINAL (preserved, not deleted — disabled by comment): <nav className="main-nav">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Activity" && <span className="nav-count">2</span>}
            </NavLink>
          ))}
        </nav> */}
        <div className="sidebar-spacer" />
        <div className="sidebar-health">
          <div className="health-orb">
            <span />
          </div>
          <div>
            <b>Local workspace ready</b>
            <small>Hardware metrics use sample records</small>
          </div>
        </div>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-link settings-link ${location.pathname === "/settings" || isActive ? "active" : ""}`
          }
        >
          <Settings size={17} />
          <span>Settings</span>
        </NavLink>
        <div className="sidebar-footer">
          <div className="avatar">OC</div>
          <div className="profile-copy">
            <b>{displayName}</b>
            <small>Local profile</small>
          </div>
          <CircleHelp size={16} aria-label="Help" />
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="crumb">
            <Button
              variant="ghost"
              className="mobile-menu"
              aria-label="Toggle sidebar"
              onClick={toggleSidebar}
            >
              <Menu size={18} />
            </Button>
            <span className="crumb-parent">OpenCluster</span>
            <span className="crumb-slash">/</span>
            <strong>{routeNames[location.pathname] ?? "Dashboard"}</strong>
          </div>
          <div className="top-actions">
            <AnimatedThemeToggler
              theme={theme === "system" ? systemTheme : theme}
              onThemeChange={setTheme}
              className="top-theme-toggle"
              title="Change dashboard theme"
            />
            <Button
              variant="secondary"
              className="search-trigger"
              onClick={openSearch}
            >
              <Search size={15} />
              <span>Search anything...</span>
              <kbd>
                <Command size={10} /> K
              </kbd>
            </Button>
            <Button
              variant="ghost"
              aria-label="Activity"
              onClick={() => navigate("/activity")}
            >
              <Activity size={17} />
              {notificationsEnabled && <span className="notification-dot" />}
            </Button>
            <BellToggle
              checked={notificationsEnabled}
              onCheckedChange={(enabled) => {
                localStorage.setItem(
                  "opencluster.notifications",
                  String(enabled),
                );
                setNotificationsEnabled(enabled);
                window.dispatchEvent(
                  new Event("opencluster:notifications-change"),
                );
              }}
              label="Activity notifications"
              className="top-notification-toggle"
            />
            <span className="top-divider" />
            <div className="top-avatar" title="Demo operator">
              OC
            </div>
          </div>
        </header>
        <div className="page-scroll">
          <div className="page-scroll-content">
            {persistenceError && (
              <div className="data-storage-error" role="alert">
                <span>
                  Local changes could not be saved: {persistenceError}
                </span>
                <button
                  type="button"
                  aria-label="Dismiss storage error"
                  onClick={clearPersistenceError}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <motion.div
              key={location.pathname}
              className="page-transition"
              initial={
                demoMotion && !performanceMode && !prefersReducedMotion
                  ? "initial"
                  : false
              }
              animate="enter"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Outlet />
            </motion.div>
          </div>
        </div>
        <footer className="app-footer">
          <span>
            OpenCluster <b>LOCAL MODE</b>
          </span>
          <span>
            Hardware telemetry uses seed data <i>·</i> Backend services are not
            connected
          </span>
        </footer>
      </main>
      <Dock />
      {searchOpen && (
        <div className="command-backdrop">
          {/* ORIGINAL (preserved, not deleted — disabled by comment): onMouseDown={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }} */}
          <button
            className="overlay-dismiss"
            type="button"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          />
          <section
            className="command-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="command-title"
            onKeyDown={keepFocusInDialog}
          >
            <div className="command-input-wrap">
              <Search size={18} />
              <input
                ref={searchInput}
                id="command-title"
                placeholder="Search pages..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchOpen(false);
                  if (e.key === "Enter" && commands[0]) {
                    navigate(commands[0].to);
                    setSearchOpen(false);
                  }
                }}
              />
              <kbd>ESC</kbd>
              <Button
                variant="ghost"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                <X size={15} />
              </Button>
            </div>
            <div className="command-label">PAGES</div>
            {commands.length ? (
              commands.map((item) => (
                <button
                  type="button"
                  className="command-item"
                  key={item.to}
                  onClick={() => {
                    navigate(item.to);
                    setSearchOpen(false);
                  }}
                >
                  <span>{item.label}</span>
                  <span>↵</span>
                </button>
              ))
            ) : (
              <p className="command-empty">No pages match “{query}”</p>
            )}
            <div className="command-foot">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>ESC close</span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
