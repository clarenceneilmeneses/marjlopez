/**
 * The top bar's filter pill — Malaya's ScopePicker · DatePicker · Clear, one
 * white pill on a laptop; a filter button that opens a sheet on a phone.
 */
import {
  CalendarRange,
  Check,
  ChevronDown,
  Filter,
  SlidersHorizontal,
  X,
} from "@/components/icons";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TYPE_ORDER, TYPES } from "@/lib/inquiry";
import type { LeadType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth";
import { useStaffList } from "@/state/data";
import { manilaYmd, PRESETS, useFilters } from "@/state/filters";

const FIELD =
  "h-9 gap-2 rounded-full border-0 bg-transparent px-3 font-normal shadow-none hover:bg-secondary";

function useScopeLabel() {
  const f = useFilters();
  const { staff } = useAuth();
  const people = useStaffList(Boolean(staff));
  const type = f.type === "all" ? "All requests" : TYPES[f.type].short;
  if (f.person === "all") return type;
  const who =
    f.person === "unassigned"
      ? "Unassigned"
      : (people.data?.find((p) => p.user_id === f.person)?.name.split(" ")[0] ?? "Someone");
  return `${type} · ${who}`;
}

function ScopeOptions({ onPick }: { onPick?: () => void }) {
  const f = useFilters();
  const { staff } = useAuth();
  const people = useStaffList(Boolean(staff));
  const row = (on: boolean, label: string, pick: () => void) => (
    <button
      key={label}
      type="button"
      onClick={() => {
        pick();
        onPick?.();
      }}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-secondary"
    >
      <Check className={cn("size-4 text-primary", on ? "opacity-100" : "opacity-0")} />
      {label}
    </button>
  );
  return (
    <div className="space-y-3">
      <div>
        <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Requests
        </p>
        {row(f.type === "all", "All requests", () => f.setType("all"))}
        {TYPE_ORDER.map((t) => row(f.type === t, TYPES[t].label, () => f.setType(t as LeadType)))}
      </div>
      <div className="border-t border-border/70 pt-3">
        <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Handled by
        </p>
        {row(f.person === "all", "Anyone", () => f.setPerson("all"))}
        {(people.data ?? []).map((p) =>
          row(f.person === p.user_id, p.name, () => f.setPerson(p.user_id)),
        )}
        {row(f.person === "unassigned", "Unassigned", () => f.setPerson("unassigned"))}
      </div>
    </div>
  );
}

function DateOptions({ onPick }: { onPick?: () => void }) {
  const f = useFilters();
  const from = f.preset === "custom" ? f.custom.from : manilaYmd(f.range.from);
  const to = f.preset === "custom" ? f.custom.to : manilaYmd(f.range.to - 1);
  const setEdge = (edge: "from" | "to", value: string) => {
    if (!value) return;
    const next = { from, to, [edge]: value };
    if (next.from > next.to) [next.from, next.to] = [next.to, next.from];
    f.setCustom(next);
  };
  return (
    <div>
      <div className="grid grid-cols-2 gap-1.5">
        {PRESETS.map((p) => (
          <Button
            key={p.value}
            size="sm"
            variant={f.preset === p.value ? "default" : "ghost"}
            className="justify-start rounded-lg"
            onClick={() => {
              f.setPreset(p.value);
              onPick?.();
            }}
          >
            {p.label}
          </Button>
        ))}
      </div>
      <div className="mt-3 border-t border-border/70 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Or set the dates
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="text-xs text-muted-foreground">
            From
            <Input
              type="date"
              className="mt-1 h-9"
              value={from}
              max={to}
              onChange={(e) => setEdge("from", e.target.value)}
            />
          </label>
          <label className="text-xs text-muted-foreground">
            To
            <Input
              type="date"
              className="mt-1 h-9"
              value={to}
              min={from}
              onChange={(e) => setEdge("to", e.target.value)}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function dateText(f: ReturnType<typeof useFilters>) {
  if (f.preset === "custom" || f.preset === "all") return f.range.label;
  const name = PRESETS.find((p) => p.value === f.preset)?.label ?? "";
  return (
    <>
      {name}
      <span className="text-muted-foreground"> · {f.range.label}</span>
    </>
  );
}

/** The laptop's pill: which requests | when | clear. */
export function FilterPill({ className }: { className?: string }) {
  const f = useFilters();
  const scope = useScopeLabel();
  const [scopeOpen, setScopeOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-border/70 bg-card p-0.5 shadow-level-2",
        className,
      )}
    >
      <Popover open={scopeOpen} onOpenChange={setScopeOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn(FIELD, "max-w-[220px]")}
            aria-label="Which requests the screens show"
          >
            <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{scope}</span>
            <ChevronDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-2">
          <ScopeOptions onPick={() => setScopeOpen(false)} />
        </PopoverContent>
      </Popover>
      <span aria-hidden className="h-5 w-px bg-border" />
      <Popover open={dateOpen} onOpenChange={setDateOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className={FIELD} aria-label="Date range the screens show">
            <CalendarRange className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{dateText(f)}</span>
            <ChevronDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[min(320px,calc(100vw-2rem))] p-3">
          <DateOptions onPick={() => setDateOpen(false)} />
        </PopoverContent>
      </Popover>
      {f.active && (
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          onClick={f.clear}
          title="Back to all requests, last 30 days"
          aria-label="Clear filters"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}

/** The phone's version: one button in the top pill, a sheet with both. */
export function FilterSheet() {
  const f = useFilters();
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Filters"
          className="relative grid size-10 place-items-center rounded-full text-foreground/75 transition hover:bg-secondary"
        >
          <Filter className="size-[18px]" />
          {f.active && <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />}
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl p-5">
        <SheetTitle className="text-lg">Filters</SheetTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Showing {useScopeLabel().toLowerCase()} · {f.range.label}
        </p>
        <div className="mt-4 space-y-5">
          <ScopeOptions />
          <div className="border-t border-border/70 pt-4">
            <DateOptions />
          </div>
          <div className="flex gap-2">
            {f.active && (
              <Button variant="outline" className="flex-1 rounded-full" onClick={f.clear}>
                <X className="size-4" /> Clear
              </Button>
            )}
            <Button className="flex-1 rounded-full" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
