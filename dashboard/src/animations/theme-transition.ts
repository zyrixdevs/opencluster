import { flushSync } from "react-dom";

export function transitionTheme(
  origin: HTMLElement | null,
  next: "light" | "dark",
  apply: () => void,
) {
  const root = document.documentElement;
  const reduced =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    root.dataset.motion === "reduced" ||
    root.dataset.performance === "on";
  const start = () => {
    root.dataset.theme = next;
    root.style.colorScheme = next;
    apply();
  };

  if (reduced || typeof document.startViewTransition !== "function") {
    flushSync(start);
    return;
  }

  const rect = origin?.getBoundingClientRect();
  const x = rect ? rect.left + rect.width / 2 : innerWidth / 2;
  const y = rect ? rect.top + rect.height / 2 : innerHeight / 2;
  const radius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y),
  );
  root.dataset.themeTransition = "active";
  let transition: ViewTransition;
  try {
    transition = document.startViewTransition(() => flushSync(start));
  } catch {
    delete root.dataset.themeTransition;
    flushSync(start);
    return;
  }
  transition.finished
    .finally(() => {
      delete root.dataset.themeTransition;
    })
    .catch(() => undefined);
  transition.ready
    .then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0 at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 520,
          easing: "cubic-bezier(0.23, 1, 0.32, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => undefined);
}
