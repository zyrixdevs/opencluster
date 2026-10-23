import * as Icons from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as UI from "../components/ui";
import type { ActivityEvent } from "../data/models";
import { useLocalCollection } from "../data/useDashboardData";
import { ActivityLine } from "./shared";

export function ActivityPage() {
  const {
    data: initialActivity = [],
    isPending,
    isError,
  } = useLocalCollection<ActivityEvent>("activity");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [source, setSource] = useState("all");
  const [readAll, setReadAll] = useState(false);
  const events = initialActivity
    .filter((event) =>
      `${event.title} ${event.detail} ${event.source}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
    .filter((event) => severity === "all" || event.severity === severity)
    .filter((event) => source === "all" || event.source === source);
  return (
    <>
      <UI.PageTitle
        eyebrow="EVENT STREAM"
        title="Activity"
        description="Review sample system events and notifications."
        actions={
          <UI.Button onClick={() => setReadAll(true)}>
            <Icons.Check size={14} />
            {readAll ? "Sample events marked read" : "Mark all read"}
          </UI.Button>
        }
      />
      <div className="activity-filterbar">
        <label className="search-box">
          <Icons.Search size={15} />
          <input
            placeholder="Search events..."
            aria-label="Search activity"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          className="select-pill"
          aria-label="Filter by severity"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="all">All severities</option>
          {["info", "success", "warning", "error"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="select-pill"
          aria-label="Filter by source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          <option value="all">All sources</option>
          {[...new Set(initialActivity.map((e) => e.source))].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="activity-total">{events.length} events</span>
      </div>
      <UI.Card className="activity-card">
        <div className="activity-date-label">
          DEMO EVENTS <span /> FIXED SAMPLE HISTORY
        </div>
        {isPending ? (
          <UI.LoadingState label="Loading local activity records…" />
        ) : isError ? (
          <UI.ErrorState
            title="Activity could not be loaded"
            detail="The local event records are unavailable. Retry to load this view again."
            onRetry={() =>
              void queryClient.invalidateQueries({
                queryKey: ["local-records", "activity"],
              })
            }
          />
        ) : events.length ? (
          events.map((event) => <ActivityLine event={event} key={event.id} />)
        ) : (
          <div className="no-results">
            <Icons.Search size={18} />
            <b>No matching events</b>
            <span>Try another search or filter.</span>
          </div>
        )}
        {events.some((event) => event.time === "Yesterday") && (
          <div className="activity-date-label older">
            PREVIOUS <span /> SAMPLE HISTORY
          </div>
        )}
      </UI.Card>
      <div className="demo-note activity-warning">
        <Icons.CircleAlert size={14} /> This activity feed is preloaded sample
        data, not an audit log.
      </div>
    </>
  );
}
