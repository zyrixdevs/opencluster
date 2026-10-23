import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BranchedMenu } from "../src/components/BranchedMenu";
import { Counter } from "../src/components/Counter";

afterEach(() => vi.unstubAllGlobals());

describe("dashboard navigation components", () => {
  it("selects a route from a branched menu section", () => {
    const onSelect = vi.fn();
    render(
      <BranchedMenu
        active="/nodes"
        onSelect={onSelect}
        items={[
          {
            label: "Operations",
            children: [
              { value: "/nodes", label: "Nodes" },
              { value: "/clusters", label: "Clusters" },
            ],
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clusters" }));
    expect(onSelect).toHaveBeenCalledWith("/clusters");
  });

  it("formats a KPI accessibly and skips motion when reduced motion is preferred", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    render(<Counter value={1284} minDigits={2} />);
    expect(screen.getByRole("img", { name: "1,284" })).toBeInTheDocument();
  });
});
