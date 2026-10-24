import { Bell, BellOff } from "lucide-react";
import { useState } from "react";

export interface BellButtonProps {
  subscribed?: boolean;
  defaultSubscribed?: boolean;
  onSubscribedChange?: (subscribed: boolean) => void;
  count?: number;
  label?: string;
  subscribedLabel?: string;
  className?: string;
}
/** Local notification preference control; it does not request browser permissions. */
export function BellButton({
  subscribed: controlled,
  defaultSubscribed = false,
  onSubscribedChange,
  count = 0,
  label = "Notify me",
  subscribedLabel = "Notifications on",
  className = "",
}: BellButtonProps) {
  const [internal, setInternal] = useState(defaultSubscribed);
  const active = controlled ?? internal;
  return (
    <button
      aria-label={`${active ? subscribedLabel : label}${count ? `, ${count} notifications` : ""}`}
      aria-pressed={active}
      className={`rb-bell-button ${className}`}
      onClick={() => {
        const next = !active;
        if (controlled === undefined) setInternal(next);
        onSubscribedChange?.(next);
      }}
      type="button"
    >
      <span aria-hidden="true">
        {active ? <Bell size={17} /> : <BellOff size={17} />}
      </span>
      <span>{active ? subscribedLabel : label}</span>
      {count > 0 && <span className="rb-bell-count">{count}</span>}
    </button>
  );
}
export default BellButton;
