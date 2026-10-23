import { deleteDB } from "idb";
import { beforeAll, describe, expect, it } from "vitest";
import { type AgentEntity, agentSeedCatalog } from "../src/data/agents";
import {
  dashboardLocalProvider,
  localProvider,
} from "../src/data/localProvider";
import { initialClusters, initialNodes } from "../src/data/mock";

beforeAll(async () => {
  await deleteDB("opencluster-dashboard");
});

describe("local IndexedDB provider", () => {
  it("migrates a valid previous local cluster and keeps later records across initialization", async () => {
    const legacy = {
      clusters: [
        {
          id: "personal",
          name: "Personal",
          region: "Local",
          description: "Saved",
          nodeIds: [],
          createdAt: "2026-10-01",
        },
      ],
      nodes: [],
    };
    const initialized = await localProvider.initialize(legacy);
    expect(initialized.clusters.map((cluster) => cluster.id)).toEqual([
      "personal",
    ]);
    await dashboardLocalProvider.clusters.create("second", {
      ...initialized.clusters[0],
      id: "second",
      name: "Second",
    });
    const reopened = await localProvider.initialize({
      clusters: [],
      nodes: [],
    });
    expect(reopened.clusters.map((cluster) => cluster.id)).toEqual([
      "personal",
      "second",
    ]);
    const seededAgents = await localProvider.list<AgentEntity>("agents");
    expect(seededAgents.map((agent) => agent.id).sort()).toEqual(
      agentSeedCatalog.map((agent) => agent.id).sort(),
    );
    await localProvider.put("agents", "codex", {
      ...seededAgents[0],
      name: "Locally customized Codex",
    });
    await localProvider.initialize();
    expect(
      (await localProvider.get<AgentEntity>("agents", "codex"))?.name,
    ).toBe("Locally customized Codex");
  });

  it("rejects malformed cluster records at the provider boundary", async () => {
    await expect(
      localProvider.put("clusters", "bad", { id: "bad" }),
    ).rejects.toThrow();
  });

  it("supports validated CRUD, search, filtering, and sorting", async () => {
    const cluster = {
      id: "query-test",
      name: "Beta Lab",
      region: "Local",
      description: "Queryable record",
      nodeIds: [],
      createdAt: "2026-10-22",
    };
    await dashboardLocalProvider.clusters.create(cluster.id, cluster);
    expect(await dashboardLocalProvider.clusters.get(cluster.id)).toEqual(
      cluster,
    );
    expect(
      await dashboardLocalProvider.clusters.list({
        search: "BETA",
        filter: (item) => item.region === "Local",
        sort: (left, right) => left.name.localeCompare(right.name),
      }),
    ).toContainEqual(cluster);
    await dashboardLocalProvider.clusters.update(cluster.id, {
      ...cluster,
      name: "Gamma Lab",
    });
    expect((await dashboardLocalProvider.clusters.get(cluster.id))?.name).toBe(
      "Gamma Lab",
    );
    await dashboardLocalProvider.clusters.delete(cluster.id);
    expect(
      await dashboardLocalProvider.clusters.get(cluster.id),
    ).toBeUndefined();
  });

  it("resets user records to the seeded workspace", async () => {
    await localProvider.put("workflows", "user-flow", {
      version: 1,
      name: "Local workflow",
      nodes: [
        {
          id: "trigger",
          kind: "trigger",
          title: "Trigger",
          detail: "",
          x: 0,
          y: 0,
          config: {},
        },
      ],
      edges: [],
    });
    await localProvider.resetRecords();
    expect(await localProvider.get("workflows", "user-flow")).toBeUndefined();
    expect(
      (await localProvider.list<{ id: string }>("clusters")).length,
    ).toBeGreaterThan(0);
  });

  it("replaces related cluster and node records together", async () => {
    const cluster = { ...initialClusters[0], nodeIds: [initialNodes[0].id] };
    await localProvider.writeClusterNodeState([cluster], [initialNodes[0]]);
    expect(await localProvider.list("clusters")).toEqual([cluster]);
    expect(await localProvider.list("nodes")).toEqual([initialNodes[0]]);
  });

  it("preserves saved records when a replacement contains invalid data", async () => {
    const before = await localProvider.list("clusters");
    await expect(localProvider.replace("clusters", [{ id: "bad", value: {} }])).rejects.toThrow();
    expect(await localProvider.list("clusters")).toEqual(before);
  });

  it("does not reseed collections a user intentionally emptied", async () => {
    await localProvider.initialize();
    await localProvider.replace("agent-relations", []);
    await localProvider.initialize();
    expect(await localProvider.list("agent-relations")).toEqual([]);
  });
});
