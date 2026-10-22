import {
  AlertTriangle,
  Check,
  CircleHelp,
  CircleOff,
  LoaderCircle,
} from "lucide-react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import type { Health } from "../data/models";

export function Button({
  className = "",
  variant = "secondary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button className={`button button-${variant} ${className}`} {...props} />
  );
}
export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <section className={`panel ${className}`} {...props} />;
}
export function PageTitle({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="title-actions">{actions}</div>}
    </header>
  );
}
export function Stat({
  label,
  value,
  detail,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: string;
}) {
  return (
    <Card className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
    </Card>
  );
}
export function HealthBadge({ health }: { health: Health }) {
  const config: Record<Health, { icon: ReactNode; label: string }> = {
    healthy: { icon: <Check size={12} />, label: "Healthy" },
    warning: { icon: <AlertTriangle size={12} />, label: "Attention" },
    offline: { icon: <CircleOff size={12} />, label: "Offline" },
    unknown: { icon: <CircleHelp size={12} />, label: "Unknown" },
  };
  return (
    <span className={`health health-${health}`}>
      {config[health].icon}
      {config[health].label}
    </span>
  );
}
export function Progress({
  value,
  tone = "blue",
}: {
  value: number;
  tone?: string;
}) {
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label="Resource utilization"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <div
        className={`progress-fill ${tone}`}
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  );
}
export function EmptyState({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-symbol">
        <LoaderCircle size={18} />
      </div>
      <strong>{title}</strong>
      <p>{detail}</p>
    </div>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="route-state" role="status" aria-live="polite">
      <LoaderCircle
        className="route-state-spinner"
        size={22}
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  title,
  detail,
  onRetry,
}: {
  title: string;
  detail: string;
  onRetry: () => void;
}) {
  return (
    <div className="route-state route-state-error" role="alert">
      <AlertTriangle size={22} aria-hidden="true" />
      <strong>{title}</strong>
      <span>{detail}</span>
      <Button type="button" onClick={onRetry}>
        Reload view
      </Button>
    </div>
  );
}
