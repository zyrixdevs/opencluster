import {
  Activity,
  Bot,
  Cpu,
  Gauge,
  Grid2X2,
  Layers3,
  ListTodo,
  ScanEye,
  Settings,
  TerminalSquare,
  Workflow,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import "./Dock.css";

const items = [
  { to: "/", label: "Home", icon: Grid2X2 },
  { to: "/mission-control", label: "Mission Control", icon: ScanEye },
  { to: "/clusters", label: "Clusters", icon: Layers3 },
  { to: "/nodes", label: "Nodes", icon: Cpu },
  { to: "/agents", label: "Agents", icon: Bot },
  { to: "/automation", label: "Automation", icon: Workflow },
  { to: "/monitoring", label: "Monitoring", icon: Gauge },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/software", label: "AI Software", icon: TerminalSquare },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Dock() {
  return (
    <nav className="quick-dock" aria-label="Quick navigation">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `quick-dock__item${isActive ? " is-active" : ""}`
          }
          aria-label={label}
        >
          <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
          <span className="quick-dock__label" aria-hidden="true">
            {label}
          </span>
        </NavLink>
      ))}
    </nav>
  );
}
