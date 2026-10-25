/**
 * The admin's universal filter — Malaya's scope + date pill (components/obs/
 * scope-bar.tsx there), for this product: WHICH requests (type, and who is
 * handling them) and WHEN. Every admin screen reads it; the choice is kept
 * per browser so it survives moving between pages.
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { LeadType } from "@/lib/types";

export type Preset =
  "today" | "yesterday" | "7d" | "30d" | "month" | "last-month" | "90d" | "all" | "custom";

export const PRESETS: { value: Exclude<Preset, "custom">; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "month", label: "This month" },
  { value: "last-month", label: "Last month" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

export const DEFAULT_PRESET: Preset = "30d";
const KEY = "marj:admin-filters";
const DAY = 86_400_000;
/** Nothing in the system is older than this. */
const SYSTEM_START = "2025-01-01";

/** "YYYY-MM-DD" for a moment, in Manila. */
export function manilaYmd(t: number): string {
  return new Date(t).toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}
const startOf = (ymd: string) => Date.parse(`${ymd}T00:00:00+08:00`);

export interface Range {
  from: number;
  /** Exclusive. */
  to: number;
  days: number;
  label: string;
}

function rangeFor(preset: Preset, custom: { from: string; to: string }, now = Date.now()): Range {
  const today = startOf(manilaYmd(now));
  const tomorrow = today + DAY;
  const ymd = manilaYmd(now);
  const [y, m] = ymd.split("-").map(Number) as [number, number];
  const monthStart = startOf(`${y}-${String(m).padStart(2, "0")}-01`);
  const prevMonth = m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 };
  const prevMonthStart = startOf(`${prevMonth.y}-${String(prevMonth.m).padStart(2, "0")}-01`);
  let from: number;
  let to = tomorrow;
  switch (preset) {
    case "today":
      from = today;
      break;
    case "yesterday":
      from = today - DAY;
      to = today;
      break;
    case "7d":
      from = tomorrow - 7 * DAY;
      break;
    case "30d":
      from = tomorrow - 30 * DAY;
      break;
    case "month":
      from = monthStart;
      break;
    case "last-month":
      from = prevMonthStart;
      to = monthStart;
      break;
    case "90d":
      from = tomorrow - 90 * DAY;
      break;
    case "all":
      from = startOf(SYSTEM_START);
      break;
    case "custom":
      from = startOf(custom.from);
      to = startOf(custom.to) + DAY;
      break;
  }
  const fmt = (t: number) =>
    new Date(t).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      timeZone: "Asia/Manila",
    });
  const label =
    preset === "all"
      ? "All time"
      : to - from <= DAY
        ? fmt(from)
        : `${fmt(from)} – ${fmt(to - DAY)}`;
  return { from, to, days: Math.round((to - from) / DAY), label };
}

interface Saved {
  preset: Preset;
  custom: { from: string; to: string };
  type: LeadType | "all";
  person: string;
}

interface FiltersState extends Saved {
  range: Range;
  setPreset: (p: Preset) => void;
  setCustom: (c: { from: string; to: string }) => void;
  setType: (t: LeadType | "all") => void;
  /** "all", "unassigned", or a staff user id. */
  setPerson: (p: string) => void;
  active: boolean;
  clear: () => void;
  /** Does an inquiry/conversation pass the WHICH part (type, person)? */
  passes: (type: LeadType | undefined | null, assignedTo: string | null) => boolean;
  inRange: (iso: string) => boolean;
}

const DEFAULTS: Saved = {
  preset: DEFAULT_PRESET,
  custom: { from: manilaYmd(Date.now() - 29 * DAY), to: manilaYmd(Date.now()) },
  type: "all",
  person: "all",
};

const Ctx = createContext<FiltersState | null>(null);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Saved>(DEFAULTS);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSaved({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<Saved>) });
    } catch {
      /* keep the defaults */
    }
  }, []);
  const update = (patch: Partial<Saved>) =>
    setSaved((s) => {
      const next = { ...s, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* the choice just won't be remembered */
      }
      return next;
    });

  const value = useMemo<FiltersState>(() => {
    const range = rangeFor(saved.preset, saved.custom);
    return {
      ...saved,
      range,
      setPreset: (preset) => update({ preset }),
      setCustom: (custom) => update({ custom, preset: "custom" }),
      setType: (type) => update({ type }),
      setPerson: (person) => update({ person }),
      active: saved.preset !== DEFAULT_PRESET || saved.type !== "all" || saved.person !== "all",
      clear: () => update({ preset: DEFAULT_PRESET, type: "all", person: "all" }),
      passes: (type, assignedTo) =>
        (saved.type === "all" || type === saved.type) &&
        (saved.person === "all" ||
          (saved.person === "unassigned" ? !assignedTo : assignedTo === saved.person)),
      inRange: (iso) => {
        const t = Date.parse(iso);
        return t >= range.from && t < range.to;
      },
    };
  }, [saved]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFilters(): FiltersState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFilters outside FiltersProvider");
  return ctx;
}
