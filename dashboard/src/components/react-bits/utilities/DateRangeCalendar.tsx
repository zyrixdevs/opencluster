import type { ChangeEvent } from "react";

export interface DateRangeCalendarProps {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
  className?: string;
}

/** Native date controls keep this range picker dependency-free and keyboard accessible. */
export function DateRangeCalendar({
  from,
  to,
  onChange,
  className = "",
}: DateRangeCalendarProps) {
  const update =
    (key: "from" | "to") => (event: ChangeEvent<HTMLInputElement>) => {
      const next = { from, to, [key]: event.currentTarget.value };
      if (next.from && next.to && next.from > next.to) return;
      onChange(next);
    };
  return (
    <fieldset className={className}>
      <legend>Date range</legend>
      <label>
        From{" "}
        <input
          aria-label="Start date"
          type="date"
          value={from}
          max={to || undefined}
          onChange={update("from")}
        />
      </label>
      <label>
        To{" "}
        <input
          aria-label="End date"
          type="date"
          value={to}
          min={from || undefined}
          onChange={update("to")}
        />
      </label>
    </fieldset>
  );
}

export default DateRangeCalendar;
