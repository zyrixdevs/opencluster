import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import "./BranchedMenu.css";

export type BranchedMenuEntry = {
  value: string;
  label: string;
  icon?: ReactNode;
};
export type BranchedMenuSection = {
  label: string;
  children?: BranchedMenuEntry[];
  value?: string;
};

export function BranchedMenu({
  items,
  active,
  onSelect,
}: {
  items: BranchedMenuSection[];
  active: string;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(
    () => new Set(items.map((_, index) => index)),
  );
  const marker = useRef<HTMLSpanElement>(null);
  const heads = useRef<Array<HTMLButtonElement | null>>([]);
  const sections = useRef<HTMLElement>(null);
  const sectionIndex = items.findIndex((section) =>
    section.children?.some((entry) => entry.value === active),
  );
  useLayoutEffect(() => {
    const place = () => {
      const selected = marker.current;
      if (!selected) return;
      const head = heads.current[sectionIndex];
      const sectionOffset = head?.parentElement?.offsetTop ?? 0;
      selected.style.transform = head
        ? `translateY(${sectionOffset + head.offsetTop + (head.offsetHeight - 16) / 2}px)`
        : "translateY(-20px)";
      selected.toggleAttribute(
        "data-on",
        Boolean(head && open.has(sectionIndex)),
      );
    };
    place();
    if (!sections.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(place);
    observer.observe(sections.current);
    return () => observer.disconnect();
  }, [sectionIndex, open]);
  const select = (value: string) => onSelect(value);

  return (
    <nav ref={sections} className="branched-menu" aria-label="Workspace">
      <span ref={marker} className="branched-menu__marker" aria-hidden="true" />
      {items.map((section, index) => {
        const children = section.children;
        const expanded = open.has(index);
        const selected = !children && section.value === active;
        const rowHeight = 35;
        const branchX = 13;
        const endX = 32;
        const radius = 8;
        const rowY = (childIndex: number) =>
          6 + childIndex * rowHeight + rowHeight / 2;
        const branchPath = (childIndex: number) => {
          const y = rowY(childIndex);
          return `M ${branchX} ${y - radius} A ${radius} ${radius} 0 0 0 ${branchX + radius} ${y} H ${endX}`;
        };
        const reachPath = (childIndex: number) => {
          const y = rowY(childIndex);
          return `M ${branchX} 0 V ${y - radius} A ${radius} ${radius} 0 0 0 ${branchX + radius} ${y} H ${endX}`;
        };
        return (
          <section
            key={section.label}
            className="branched-menu__section"
            data-open={expanded || undefined}
          >
            <button
              ref={(element) => {
                heads.current[index] = element;
              }}
              className="branched-menu__head"
              type="button"
              aria-expanded={children ? expanded : undefined}
              aria-current={selected ? "page" : undefined}
              onClick={() => {
                if (!children && section.value) select(section.value);
                else
                  setOpen((current) => {
                    const next = new Set(current);
                    if (next.has(index)) next.delete(index);
                    else next.add(index);
                    return next;
                  });
              }}
            >
              {section.label}
            </button>
            {children && (
              <div className="branched-menu__body" aria-hidden={!expanded}>
                <div className="branched-menu__fold">
                  <div
                    className="branched-menu__tree"
                    style={{ height: 12 + children.length * rowHeight }}
                  >
                    <svg
                      className="branched-menu__lines"
                      width="40"
                      height="100%"
                      aria-hidden="true"
                    >
                      <path
                        className="branched-menu__base"
                        d={`M ${branchX} 0 V ${rowY(children.length - 1) - radius}`}
                      />
                      {children.map((entry, childIndex) => (
                        <path
                          key={entry.value}
                          className="branched-menu__base"
                          d={branchPath(childIndex)}
                        />
                      ))}
                      {children.map((entry, childIndex) => (
                        <path
                          key={entry.value}
                          className="branched-menu__reach"
                          d={reachPath(childIndex)}
                          pathLength={1}
                          strokeDasharray={1}
                          strokeDashoffset={entry.value === active ? 0 : 1}
                        />
                      ))}
                    </svg>
                    {children.map((entry) => (
                      <button
                        key={entry.value}
                        type="button"
                        className="branched-menu__item"
                        aria-current={
                          entry.value === active ? "page" : undefined
                        }
                        tabIndex={expanded ? 0 : -1}
                        onClick={() => select(entry.value)}
                      >
                        <span
                          className="branched-menu__icon"
                          aria-hidden="true"
                        >
                          {entry.icon}
                        </span>
                        <span>{entry.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        );
      })}
    </nav>
  );
}
