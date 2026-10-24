import { Moon, Sun } from "lucide-react";
import { useRef } from "react";
import { transitionTheme } from "../../../animations/theme-transition";

export interface AnimatedThemeTogglerProps
  extends Omit<React.ComponentProps<"button">, "onClick"> {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
}

/** Controlled theme button; the dashboard store remains the source of truth. */
export function AnimatedThemeToggler({
  theme,
  onThemeChange,
  className = "",
  ...props
}: AnimatedThemeTogglerProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      aria-label={`Switch to ${next} theme`}
      aria-pressed={theme === "dark"}
      className={className}
      ref={ref}
      onClick={() =>
        transitionTheme(ref.current, next, () => onThemeChange(next))
      }
      {...props}
    >
      {theme === "dark" ? (
        <Sun aria-hidden="true" />
      ) : (
        <Moon aria-hidden="true" />
      )}
    </button>
  );
}
export default AnimatedThemeToggler;
