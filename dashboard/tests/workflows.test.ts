import { beforeEach, describe, expect, it, vi } from "vitest";
import { dashboardProvider } from "../src/data/provider";
import {
  assertWorkflowImportSize,
  isConnectionValid,
  loadWorkflow,
  parseWorkflowImport,
  recordWorkflowChange,
  redoWorkflow,
  saveWorkflow,
  starterWorkflow,
  undoWorkflow,
  validateWorkflow,
  workflowIssues,
} from "../src/data/workflows";

const records = new Map<string, unknown>();
vi.mock("../src/data/provider", () => ({
  dashboardProvider: {
    workflows: {
      get: vi.fn(async (id: string) => records.get(id)),
      update: vi.fn(async (id: string, value: unknown) => {
        records.set(id, structuredClone(value));
      }),
    },
  },
}));

beforeEach(() => {
  records.clear();
  vi.clearAllMocks();
});

describe("demo workflows", () => {
  it("rejects oversized files before reading or parsing their contents", () => {
    expect(() => assertWorkflowImportSize(100_000)).not.toThrow();
    expect(() => assertWorkflowImportSize(100_001)).toThrow(
      "Workflow file exceeds the 100 KB demo limit.",
    );
  });

  it("round trips a workflow through JSON import validation", () => {
    expect(parseWorkflowImport(JSON.stringify(starterWorkflow))).toEqual(
      starterWorkflow,
    );
  });

  it("rejects dangling connections and duplicate node identifiers", () => {
    const invalid = {
      ...starterWorkflow,
      edges: [{ id: "broken", source: "missing", target: "inspect" }],
    };
    expect(validateWorkflow(invalid)).toBe(false);
    const duplicate = {
      ...starterWorkflow,
      nodes: [...starterWorkflow.nodes, starterWorkflow.nodes[0]],
    };
    expect(validateWorkflow(duplicate)).toBe(false);
  });

  it("rejects imported cycles and invalid saves", async () => {
    const cyclic = {
      ...starterWorkflow,
      edges: [
        { id: "cycle-a", source: "trigger", target: "inspect" },
        { id: "cycle-b", source: "inspect", target: "trigger" },
      ],
    };
    expect(validateWorkflow(cyclic)).toBe(false);
    await expect(saveWorkflow(cyclic)).rejects.toThrow("could not be saved");
  });

  it("rejects nested workflow config that the provider cannot persist", () => {
    const invalid = structuredClone(starterWorkflow);
    invalid.nodes[0].config = { nested: { value: "unsupported" } } as never;
    expect(validateWorkflow(invalid)).toBe(false);
  });

  it("requires a connected trigger path for runnable flows", () => {
    expect(workflowIssues(starterWorkflow)).toEqual([]);
    expect(workflowIssues({ ...starterWorkflow, edges: [] })).not.toHaveLength(
      0,
    );
  });

  it("supports undo and redo while new edits clear redo history", () => {
    const changed = { ...starterWorkflow, name: "Renamed flow" };
    const recorded = recordWorkflowChange(
      { past: [], future: [] },
      starterWorkflow,
    );
    const undone = undoWorkflow(recorded, changed);
    expect(undone?.workflow.name).toBe(starterWorkflow.name);
    const redone = redoWorkflow(undone!.history, undone!.workflow);
    expect(redone?.workflow.name).toBe(changed.name);
    expect(recordWorkflowChange(redone!.history, changed).future).toEqual([]);
  });

  it("rejects self, duplicate, and cyclic connections", () => {
    expect(isConnectionValid(starterWorkflow, "trigger", "trigger")).toBe(
      false,
    );
    expect(isConnectionValid(starterWorkflow, "trigger", "inspect")).toBe(
      false,
    );
    expect(isConnectionValid(starterWorkflow, "threshold", "trigger")).toBe(
      false,
    );
    expect(isConnectionValid(starterWorkflow, "trigger", "missing")).toBe(
      false,
    );
  });

  it("round trips the active flow through the IndexedDB provider contract", async () => {
    await saveWorkflow(starterWorkflow);
    expect(dashboardProvider.workflows.update).toHaveBeenCalledWith(
      "active",
      starterWorkflow,
    );
    await expect(loadWorkflow()).resolves.toEqual(starterWorkflow);
    expect(dashboardProvider.workflows.get).toHaveBeenCalledWith("active");
  });
});
