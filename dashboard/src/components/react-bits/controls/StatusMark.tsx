import {
  Check,
  Circle,
  CircleAlert,
  CircleOff,
  LoaderCircle,
} from "lucide-react";

export type StatusMarkStatus =
  | "success"
  | "warning"
  | "error"
  | "pending"
  | "idle";
const icons = {
  success: Check,
  warning: CircleAlert,
  error: CircleOff,
  pending: LoaderCircle,
  idle: Circle,
};
const labels: Record<StatusMarkStatus, string> = {
  success: "Complete",
  warning: "Needs attention",
  error: "Failed",
  pending: "In progress",
  idle: "Not started",
};

export function StatusMark({
  status,
  label,
  className = "",
}: {
  status: StatusMarkStatus;
  label?: string;
  className?: string;
}) {
  const Icon = icons[status];
  return (
    <span
      className={`rb-status-mark rb-status-${status} ${className}`}
      role="status"
    >
      <Icon aria-hidden="true" size={15} />
      {label ?? labels[status]}
    </span>
  );
}

export default StatusMark;
