import { useMemo, useState } from "react";

export interface PlannerPerson {
  id: string;
  name: string;
  city: string;
  timeZone: string;
}
export interface TimezonePlannerProps {
  people?: PlannerPerson[];
  className?: string;
}

const DEFAULT_PEOPLE: PlannerPerson[] = [
  { id: "paris", name: "Paris", city: "Paris", timeZone: "Europe/Paris" },
  {
    id: "new-york",
    name: "New York",
    city: "New York",
    timeZone: "America/New_York",
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    city: "Bengaluru",
    timeZone: "Asia/Kolkata",
  },
];

/** Lightweight local time comparison; does not claim to find working-hour overlap. */
export function TimezonePlanner({
  people = DEFAULT_PEOPLE,
  className = "",
}: TimezonePlannerProps) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const at = useMemo(() => new Date(`${date}T12:00:00`), [date]);
  return (
    <section className={className} aria-label="Timezone planner">
      <label>
        Compare date{" "}
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.currentTarget.value)}
        />
      </label>
      <ul>
        {people.map((person) => (
          <li key={person.id}>
            <span>{person.city}</span>
            <time
              dateTime={new Intl.DateTimeFormat("sv-SE", {
                timeZone: person.timeZone,
                dateStyle: "short",
                timeStyle: "short",
              }).format(at)}
            >
              {new Intl.DateTimeFormat(undefined, {
                timeZone: person.timeZone,
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              }).format(at)}
            </time>
            <small>{person.timeZone}</small>
          </li>
        ))}
      </ul>
      <p>
        Local clock comparison only. It does not calculate meeting availability.
      </p>
    </section>
  );
}
export default TimezonePlanner;
