export interface ContextSegment {
  id: string;
  label: string;
  tokens: number;
  color?: string;
}
export interface AIContextMeterProps {
  segments: ContextSegment[];
  limit: number;
  modelLabel?: string;
  compactAt?: number;
  className?: string;
}

/** Displays caller-supplied local estimates; no model or service is contacted. */
export function AIContextMeter({
  segments,
  limit,
  modelLabel = "Local estimate",
  compactAt = 0.8,
  className = "",
}: AIContextMeterProps) {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 1;
  const used = segments.reduce(
    (sum, item) => sum + Math.max(0, item.tokens),
    0,
  );
  const percent = Math.min(100, (used / safeLimit) * 100);
  return (
    <section className={className} aria-label="Prompt size estimate">
      <div>
        <strong>{modelLabel}</strong>
        <span>
          {Math.round(percent)}% · {Math.round(used).toLocaleString()} /{" "}
          {Math.round(safeLimit).toLocaleString()}
        </span>
      </div>
      <meter
        aria-label="Estimated context used"
        min={0}
        max={100}
        value={Math.round(percent)}
        style={{
          display: "flex",
          height: 8,
          overflow: "hidden",
          borderRadius: 99,
          background: "#8883",
        }}
      >
        {segments.map((item) => (
          <span
            key={item.id}
            title={`${item.label}: ${item.tokens.toLocaleString()} tokens`}
            style={{
              width: `${(Math.max(0, item.tokens) / safeLimit) * 100}%`,
              background: item.color ?? "currentColor",
            }}
          />
        ))}
      </meter>
      <ul>
        {segments.map((item) => (
          <li key={item.id}>
            {item.label}: {Math.round(item.tokens).toLocaleString()}
          </li>
        ))}
      </ul>
      <small>
        {percent >= compactAt * 100
          ? "Near the configured estimate threshold"
          : "Estimated from local input only"}
      </small>
    </section>
  );
}
export default AIContextMeter;
