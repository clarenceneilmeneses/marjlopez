/**
 * Two small chart shapes for the dashboard, in plain HTML — no chart library.
 *
 * Every chart here is ONE series, so it wears the one accent (Malaya's admin
 * rule: charts one hue) and needs no legend; the card's title names it. Thin
 * bars with 4px rounded data-ends on the baseline, a 2px gap between bars,
 * recessive grid lines, numbers in text ink, and a tooltip on hover/focus.
 */
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface Column {
  key: string;
  label: string;
  value: number;
  /** Shown in the tooltip under the number, e.g. "Mon, Oct 20". */
  hint: string;
}

/** Vertical bars over time. Every `tickEvery`th label is printed under the axis. */
export function ColumnChart({
  data,
  height = 180,
  unit = "inquiries",
  tickEvery = 7,
}: {
  data: Column[];
  height?: number;
  unit?: string;
  tickEvery?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  // A tidy top line: the next whole step above the max.
  const top = max <= 4 ? max : Math.ceil(max / 2) * 2;
  const grid = [top, Math.round(top / 2), 0];
  return (
    <div>
      <div className="relative" style={{ height }}>
        {grid.map((g) => (
          <div
            key={g}
            className="absolute inset-x-0 flex items-center gap-2"
            style={{ bottom: `${(g / top) * 100}%` }}
          >
            <span className="w-5 shrink-0 -translate-y-1/2 text-right text-[10px] tabular-nums text-muted-foreground">
              {g}
            </span>
            <span className="h-px flex-1 -translate-y-1/2 bg-border/70" />
          </div>
        ))}
        <div className="absolute inset-y-0 left-7 right-0 flex items-end gap-[2px]">
          {data.map((d) => (
            <div key={d.key} className="group relative flex h-full flex-1 items-end" tabIndex={0}>
              <div
                className={cn(
                  "w-full rounded-t-[4px] transition-colors",
                  d.value
                    ? "bg-primary/80 group-hover:bg-primary group-focus:bg-primary"
                    : "bg-transparent",
                )}
                style={{ height: `${(d.value / top) * 100}%`, minHeight: d.value ? 3 : 0 }}
              />
              {/* A hit target taller than the bar. */}
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-center text-[11px] text-background shadow-level-2 group-hover:block group-focus:block">
                <span className="block font-semibold tabular-nums">
                  {d.value} {d.value === 1 ? unit.replace(/s$/, "") : unit}
                </span>
                <span className="block opacity-75">{d.hint}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="ml-7 mt-2 flex gap-[2px] text-[10px] text-muted-foreground">
        {data.map((d, i) => (
          <span key={d.key} className="relative h-3 flex-1">
            {((i % tickEvery === 0 && i < data.length - 3) || i === data.length - 1) && (
              <span className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap">
                {d.label}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export interface BarRow {
  key: string;
  label: string;
  value: number;
  icon?: ReactNode;
  /** Mutes the bar — e.g. "Lost" in the pipeline. */
  muted?: boolean;
}

/** Horizontal bars, labelled directly, for "how many of each". */
export function BarList({ rows, unit = "" }: { rows: BarRow[]; unit?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.key} className="group" title={`${r.label}: ${r.value}${unit ? ` ${unit}` : ""}`}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              {r.icon}
              <span className="truncate text-foreground/85">{r.label}</span>
            </span>
            <span className="font-semibold tabular-nums">{r.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-700",
                r.muted ? "bg-muted-foreground/40" : "bg-primary/80 group-hover:bg-primary",
              )}
              style={{ width: `${(r.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * How many made it to each step, as one-hue bars that narrow down the page.
 * Each row says what share of the first step got there, and the small figure
 * between rows is how many of the step above moved on to this one.
 */
export function Funnel({ steps }: { steps: { key: string; label: string; value: number }[] }) {
  const first = Math.max(1, steps[0]?.value ?? 0);
  return (
    <ol className="space-y-1">
      {steps.map((s, i) => {
        const prev = steps[i - 1];
        const share = s.value / first;
        const last = i === steps.length - 1;
        return (
          <li key={s.key}>
            {prev && (
              <p className="py-0.5 pl-1 text-[11px] tabular-nums text-muted-foreground">
                ↓ {prev.value ? Math.round((s.value / prev.value) * 100) : 0}% moved on
              </p>
            )}
            <div
              className="group grid grid-cols-[8.5rem_minmax(0,1fr)_4.5rem] items-center gap-3"
              title={`${s.label}: ${s.value} (${Math.round(share * 100)}% of inquiries)`}
            >
              <span
                className={cn("truncate text-sm", last ? "font-semibold" : "text-foreground/85")}
              >
                {s.label}
              </span>
              <span className="h-7 overflow-hidden rounded-lg bg-secondary">
                <span
                  className={cn(
                    "block h-full rounded-lg transition-[width] duration-700",
                    last ? "bg-primary" : "bg-primary/70 group-hover:bg-primary/85",
                  )}
                  style={{ width: `${Math.max(share * 100, s.value ? 2 : 0)}%` }}
                />
              </span>
              <span className="text-right text-sm tabular-nums">
                <span className="font-semibold">{s.value}</span>{" "}
                <span className="text-xs text-muted-foreground">{Math.round(share * 100)}%</span>
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Won against lost, as one split bar — the close rate at a glance. */
export function SplitBar({ won, lost }: { won: number; lost: number }) {
  const total = won + lost;
  return (
    <div className="flex h-3 overflow-hidden rounded-full bg-secondary">
      {total > 0 && (
        <>
          <span className="h-full bg-success" style={{ width: `${(won / total) * 100}%` }} />
          <span
            className="h-full bg-muted-foreground/40"
            style={{ width: `${(lost / total) * 100}%` }}
          />
        </>
      )}
    </div>
  );
}
