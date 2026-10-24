import { afterEach, describe, expect, it, vi } from "vitest";
import { transitionTheme } from "../src/animations/theme-transition";

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(document, "startViewTransition");
  Reflect.deleteProperty(document.documentElement, "animate");
  delete document.documentElement.dataset.themeTransition;
});

describe("theme transition", () => {
  it("reveals from the control and applies the theme without remounting", async () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    const animate = vi.fn();
    document.documentElement.animate = animate;
    const origin = document.createElement("button");
    origin.getBoundingClientRect = () => ({
      left: 20,
      top: 30,
      width: 40,
      height: 20,
      right: 60,
      bottom: 50,
      x: 20,
      y: 30,
      toJSON: () => ({}),
    });
    const finished = Promise.resolve();
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: (update: () => void) => {
        update();
        return { ready: Promise.resolve(), finished };
      },
    });
    const apply = vi.fn();
    transitionTheme(origin, "light", apply);
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(apply).toHaveBeenCalledOnce();
    await Promise.resolve();
    expect(animate).toHaveBeenCalledOnce();
    expect(animate.mock.calls[0]?.[0]).toMatchObject({
      clipPath: ["circle(0 at 40px 40px)", expect.stringContaining("circle(")],
    });
  });

  it("applies immediately when reduced motion is preferred", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const apply = vi.fn();
    transitionTheme(null, "dark", apply);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(apply).toHaveBeenCalledOnce();
  });

  it("falls back to an immediate theme update without View Transitions", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    const apply = vi.fn();
    transitionTheme(null, "light", apply);
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(apply).toHaveBeenCalledOnce();
  });
});
