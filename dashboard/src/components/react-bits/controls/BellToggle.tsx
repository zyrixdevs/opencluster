import { Bell, BellOff } from "lucide-react";
import { useState } from "react";

export interface BellToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function BellToggle({
  checked,
  defaultChecked = false,
  onCheckedChange,
  label = "Notifications",
  className = "",
}: BellToggleProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const active = checked ?? internal;
  return (
    <button
      aria-checked={active}
      aria-label={label}
      className={`rb-bell-toggle ${className}`}
      onClick={() => {
        const next = !active;
        if (checked === undefined) setInternal(next);
        onCheckedChange?.(next);
      }}
      role="switch"
      type="button"
    >
      {active ? <Bell size={17} /> : <BellOff size={17} />}
    </button>
  );
}

export default BellToggle;
