import { Moon, Sun } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

export interface SwitchButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  showLabel?: boolean;
}
export function SwitchButton({
  theme,
  onThemeChange,
  showLabel = true,
  className = "",
  ...props
}: SwitchButtonProps) {
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      {...props}
      aria-label={`Switch to ${next} theme`}
      className={`rb-switch-button ${className}`}
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) onThemeChange(next);
      }}
      type="button"
    >
      <span aria-hidden="true">
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </span>
      {showLabel && <span>{next === "dark" ? "Dark" : "Light"}</span>}
    </button>
  );
}
export default SwitchButton;
