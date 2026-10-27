/**
 * Clients — everyone who has sent an inquiry, as a table (Clarence,
 * 2026-10-26: "a table view on the admin for users as well so we can check
 * and mark them along with view info"). One row per person, because there is
 * one conversation per person; the row's stage is their current request's.
 *
 *   tick rows      → a bar to mark them all at once: a stage, a star,
 *                    archive, or a CSV of just those
 *   click a row    → their details in a side sheet: contact, every request
 *                    with its own stage, who has them, the next call
 *
 * The top bar's type and person filters apply; the date range doesn't — a
 * client list that forgets people after 30 days isn't a client list.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  CalendarCheck,
  ChevronDown,
  Download,
  Flame,
  Handshake,
  Mail,
  MessagesSquare,
  Phone,
  Search,
  Star,
  Trophy,
  Users,
  X,
} from "@/components/icons";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/admin/app-shell";
import { Empty, PageHeader, Stat, TODAY_LINE } from "@/components/admin/page";
import { PaginationBar, usePagination } from "@/components/admin/paginated";
import { meetingModeLabel, RequestCard } from "@/components/chat/thread";
import { InlineLoading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dealStats, pct } from "@/lib/deals";
import { ago, initial, shortDate } from "@/lib/format";
import { LOST_REASONS, leadSummary, SOURCES, STAGES, stageLabel, stageTone } from "@/lib/inquiry";
import { isHot, leadFit, tierTone } from "@/lib/score";
import type { Lead, LeadStage, Meeting, Staff } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth";
import {
  errorText,
  useInbox,
  useLiveUpdates,
  usePatchConversation,
  usePatchLead,
  useStaffList,
  type ConversationWithPerson,
} from "@/state/data";
import { useFilters } from "@/state/filters";

export const Route = createFileRoute("/admin/clients")({
  head: () => ({ meta: [{ title: "Clients — Marj Lopez" }] }),
  component: ClientsPage,
});

interface Row {
  c: ConversationWithPerson;
  /** The current request — what the row's stage and "Wants" are about. */
  lead: Lead | undefined;
  leads: Lead[];
  name: string;
  owner: Staff | undefined;
}

type View = "all" | "open" | "won" | "lost" | "starred" | "archived";
const VIEWS: { value: View; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "starred", label: "Starred" },
  { value: "archived", label: "Archived" },
];

type SortKey = "fit" | "active" | "name" | "since";

/** The fit score, for sorting; "Something else" requests sort last. */
const fitScore = (r: Row) => (r.lead && r.lead.type !== "other" ? leadFit(r.lead).score : -1);

const sourceLabel = (v: string | null | undefined) =>
  v ? (SOURCES.find((s) => s.value === v)?.label ?? v) : "—";

function inView(r: Row, view: View) {
  if (view === "archived") return r.c.archived;
  if (r.c.archived) return false;
  const stage = r.lead?.stage;
  if (view === "open") return stage !== "won" && stage !== "lost";
  if (view === "won") return stage === "won";
  if (view === "lost") return stage === "lost";
  if (view === "starred") return r.c.starred;
  return true;
}

function ClientsPage() {
  const { staff } = useAuth();
  useLiveUpdates(Boolean(staff));
  const inbox = useInbox(Boolean(staff));
  const team = useStaffList(Boolean(staff));
  const f = useFilters();
  const patchLead = usePatchLead();
  const patchConv = usePatchConversation();

  const [view, setView] = useState<View>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "fit", desc: true });
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const rows = useMemo<Row[]>(() => {
    const data = inbox.data;
    if (!data) return [];
    const byConv = new Map<string, Lead[]>();
    for (const l of data.leads) {
      if (!l.conversation_id) continue;
      const arr = byConv.get(l.conversation_id) ?? [];
      arr.push(l);
      byConv.set(l.conversation_id, arr);
    }
    const staffById = new Map((team.data ?? []).map((s) => [s.user_id, s]));
    return data.conversations
      .map((c) => {
        const leads = byConv.get(c.id) ?? [];
        const lead = leads.find((l) => l.id === c.current_lead_id) ?? leads[0];
        return {
          c,
          lead,
          leads,
          name: c.profile?.full_name || c.profile?.email || "—",
          owner: c.assigned_to ? staffById.get(c.assigned_to) : undefined,
        };
      })
      .filter((r) => f.passes(r.lead?.type, r.c.assigned_to));
  }, [inbox.data, team.data, f]);

  const counts = useMemo(() => {
    const out = {} as Record<View, number>;
    for (const v of VIEWS) out[v.value] = rows.filter((r) => inView(r, v.value)).length;
    return out;
  }, [rows]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = rows.filter(
      (r) =>
        inView(r, view) &&
        (!needle ||
          [r.name, r.c.profile?.email, r.c.profile?.mobile, r.c.code, r.lead?.code]
            .filter(Boolean)
            .some((x) => x!.toLowerCase().includes(needle))),
    );
    const dir = sort.desc ? -1 : 1;
    return list.sort((a, b) => {
      if (sort.key === "name") return dir * a.name.localeCompare(b.name);
      if (sort.key === "fit")
        return (
          dir * (fitScore(a) - fitScore(b)) ||
          Date.parse(b.c.last_activity) - Date.parse(a.c.last_activity)
        );
      const k = sort.key === "since" ? "created_at" : "last_activity";
      return dir * (Date.parse(a.c[k]) - Date.parse(b.c[k]));
    });
  }, [rows, view, q, sort]);

  const paged = usePagination(shown, {
    initialPageSize: 10,
    resetKey: `${view}|${q}|${sort.key}|${sort.desc}`,
  });

  const deals = useMemo(() => {
    const data = inbox.data;
    if (!data) return null;
    // Archived people still count: most of them are finished deals.
    const leads = rows.flatMap((r) => r.leads);
    return dealStats(leads, data.meetings, data.messages);
  }, [rows, inbox.data]);

  const pickedRows = shown.filter((r) => picked.has(r.c.id));
  const allPicked = shown.length > 0 && pickedRows.length === shown.length;
  const toggle = (id: string) =>
    setPicked((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () => setPicked(allPicked ? new Set() : new Set(shown.map((r) => r.c.id)));

  const run = async (label: string, jobs: Promise<unknown>[]) => {
    setBusy(true);
    try {
      await Promise.all(jobs);
      toast.success(label);
      setPicked(new Set());
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const markStage = (stage: LeadStage) => {
    const targets = pickedRows.filter((r) => r.lead);
    void run(
      `${targets.length} marked ${stageLabel(stage)}`,
      targets.map((r) =>
        patchLead.mutateAsync({
          id: r.lead!.id,
          patch: { stage, ...(stage !== "lost" ? { lost_reason: null } : {}) },
        }),
      ),
    );
  };
  const setFlag = (patch: { starred?: boolean; archived?: boolean }, label: string) =>
    void run(
      label,
      pickedRows.map((r) => patchConv.mutateAsync({ id: r.c.id, patch })),
    );

  const exportCsv = (list: Row[]) => {
    const head = [
      "Name",
      "Email",
      "Mobile",
      "Wants",
      "Stage",
      "Source",
      "Assigned to",
      "Requests",
      "Client since",
      "Last active",
      "Code",
    ];
    const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = list.map((r) =>
      [
        r.name,
        r.c.profile?.email ?? "",
        r.c.profile?.mobile ?? "",
        r.lead ? leadSummary(r.lead.type, r.lead.answers) : "",
        r.lead ? stageLabel(r.lead.stage) : "",
        sourceLabel(r.c.profile?.source),
        r.owner?.name ?? "Unassigned",
        r.leads.length,
        r.c.created_at.slice(0, 10),
        r.c.last_activity.slice(0, 10),
        r.c.code,
      ]
        .map(cell)
        .join(","),
    );
    const blob = new Blob([[head.map(cell).join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `marj-clients-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const sortBy = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: key !== "name" }));

  const open = rows.find((r) => r.c.id === openId) ?? null;

  return (
    <AppShell title="Clients">
      <PageHeader
        eyebrow={TODAY_LINE()}
        title="Clients"
        sub="Everyone who has sent an inquiry. Tick people to mark them, or open one for the details."
        action={
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => exportCsv(shown)}
            disabled={!shown.length}
          >
            <Download className="size-4" /> Export CSV
          </Button>
        }
      />

      {!inbox.data || !deals ? (
        <InlineLoading className="mt-8" />
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              icon={Users}
              label="Clients"
              value={String(rows.filter((r) => !r.c.archived).length)}
              foot={`${counts.archived} archived`}
            />
            <Stat
              icon={Handshake}
              label="Open deals"
              value={String(deals.open)}
              foot="Not won or lost yet"
            />
            <Stat
              icon={Trophy}
              label="Closed deals"
              value={String(deals.won)}
              foot={`${deals.lost} lost · all time`}
              footTone="up"
            />
            <Stat
              icon={Flame}
              label="Close rate"
              value={pct(deals.closeRate)}
              foot={`Won out of decided · ${pct(deals.winRate)} of all`}
            />
          </div>

          <Card className="mt-3 overflow-clip border-0 bg-card shadow-level-1">
            <div className="flex flex-wrap items-center gap-3 p-4 sm:px-5">
              <div className="flex flex-wrap gap-1">
                {VIEWS.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => {
                      setView(v.value);
                      setPicked(new Set());
                    }}
                    className={cn(
                      "flex h-8 items-center gap-1.5 rounded-full px-3 text-sm transition-colors",
                      view === v.value
                        ? "bg-primary font-medium text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {v.label}
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        view === v.value ? "text-primary-foreground/80" : "text-muted-foreground",
                      )}
                    >
                      {counts[v.value]}
                    </span>
                  </button>
                ))}
              </div>
              <div className="relative ml-auto w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name, email, mobile, code"
                  className="h-10 rounded-full pl-10"
                />
              </div>
            </div>

            {shown.length === 0 ? (
              <Empty>{q ? "Nobody matches that search." : "Nobody here yet."}</Empty>
            ) : (
              <>
                {/* Laptop: the table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox
                            checked={allPicked ? true : pickedRows.length ? "indeterminate" : false}
                            onCheckedChange={toggleAll}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <SortHead label="Client" k="name" sort={sort} onSort={sortBy} />
                        <SortHead label="Fit" k="fit" sort={sort} onSort={sortBy} />
                        <TableHead>Wants</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead className="hidden xl:table-cell">Source</TableHead>
                        <TableHead className="hidden lg:table-cell">Assigned</TableHead>
                        <TableHead className="text-right">Requests</TableHead>
                        <SortHead
                          label="Since"
                          k="since"
                          sort={sort}
                          onSort={sortBy}
                          hideBelow2xl
                        />
                        <SortHead label="Last active" k="active" sort={sort} onSort={sortBy} />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paged.page.map((r) => (
                        <TableRow
                          key={r.c.id}
                          data-state={picked.has(r.c.id) ? "selected" : undefined}
                          onClick={() => setOpenId(r.c.id)}
                          className="cursor-pointer"
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={picked.has(r.c.id)}
                              onCheckedChange={() => toggle(r.c.id)}
                              aria-label={`Select ${r.name}`}
                            />
                          </TableCell>
                          <TableCell>
                            <span className="flex min-w-0 items-center gap-3">
                              <Avatar name={r.name} />
                              <span className="min-w-0">
                                <span className="flex items-center gap-1.5 font-semibold">
                                  <span className="truncate">{r.name}</span>
                                  {r.c.starred && (
                                    <Star className="size-3.5 shrink-0 fill-warning text-warning" />
                                  )}
                                  {isHot(r.lead) && (
                                    <Flame className="size-3.5 shrink-0 text-destructive" />
                                  )}
                                </span>
                                <span className="block truncate text-xs text-muted-foreground">
                                  {r.c.profile?.email ?? r.c.profile?.mobile ?? r.c.code}
                                </span>
                              </span>
                            </span>
                          </TableCell>
                          <TableCell>
                            {r.lead && r.lead.type !== "other" ? (
                              (() => {
                                const fit = leadFit(r.lead);
                                return (
                                  <span
                                    title={fit.reason}
                                    className={cn(
                                      "inline-flex min-w-9 justify-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                                      tierTone(fit.tier),
                                    )}
                                  >
                                    {fit.score}
                                  </span>
                                );
                              })()
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[16rem]">
                            <span className="block truncate text-foreground/85">
                              {r.lead ? leadSummary(r.lead.type, r.lead.answers) : "—"}
                            </span>
                          </TableCell>
                          <TableCell>{r.lead ? <StagePill stage={r.lead.stage} /> : "—"}</TableCell>
                          <TableCell className="hidden max-w-[9rem] truncate text-muted-foreground xl:table-cell">
                            {sourceLabel(r.c.profile?.source)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {r.owner ? (
                              r.owner.name.split(" ")[0]
                            ) : (
                              <span className="text-muted-foreground">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {r.leads.length}
                          </TableCell>
                          <TableCell className="hidden whitespace-nowrap text-muted-foreground 2xl:table-cell">
                            {shortDate(r.c.created_at)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {ago(r.c.last_activity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Phone: the same rows as cards */}
                <ul className="divide-y divide-border/50 md:hidden">
                  <li className="flex items-center gap-3 bg-secondary/60 px-4 py-2 text-xs text-muted-foreground">
                    <Checkbox
                      checked={allPicked ? true : pickedRows.length ? "indeterminate" : false}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                    Select all
                  </li>
                  {paged.page.map((r) => (
                    <li
                      key={r.c.id}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3",
                        picked.has(r.c.id) && "bg-secondary",
                      )}
                    >
                      <Checkbox
                        className="mt-1"
                        checked={picked.has(r.c.id)}
                        onCheckedChange={() => toggle(r.c.id)}
                        aria-label={`Select ${r.name}`}
                      />
                      <button
                        type="button"
                        onClick={() => setOpenId(r.c.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-1.5 font-semibold">
                            <span className="truncate">{r.name}</span>
                            {r.c.starred && (
                              <Star className="size-3.5 shrink-0 fill-warning text-warning" />
                            )}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {ago(r.c.last_activity)}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {r.lead ? leadSummary(r.lead.type, r.lead.answers) : "—"}
                        </span>
                        {r.lead && <StagePill stage={r.lead.stage} className="mt-1.5" />}
                      </button>
                    </li>
                  ))}
                </ul>
                <PaginationBar
                  pagination={paged}
                  noun="clients"
                  className="border-t border-border/50 px-4 py-3 sm:px-5"
                />
              </>
            )}
          </Card>
        </>
      )}

      {/* The bulk bar: what to do with the ticked rows */}
      {pickedRows.length > 0 && (
        <div className="fixed inset-x-0 bottom-24 z-40 flex justify-center px-3 lg:bottom-6">
          <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-foreground p-1.5 pl-4 text-background shadow-level-4 no-scrollbar">
            <span className="shrink-0 pr-2 text-sm font-semibold tabular-nums">
              {pickedRows.length} selected
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" disabled={busy} className={BAR_BUTTON}>
                  Mark as <ChevronDown className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" side="top" className="w-48">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Their current request
                </DropdownMenuLabel>
                {STAGES.map((s) => (
                  <DropdownMenuItem key={s.value} onSelect={() => markStage(s.value)}>
                    <span className={cn("mr-2 size-2 rounded-full", stageTone(s.value))} />
                    {s.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setFlag({ starred: true }, `${pickedRows.length} starred`)}
                >
                  <Star className="mr-2 size-4" /> Star
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setFlag({ starred: false }, `${pickedRows.length} unstarred`)}
                >
                  <Star className="mr-2 size-4 opacity-50" /> Remove star
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {view === "archived" ? (
              <button
                type="button"
                disabled={busy}
                className={BAR_BUTTON}
                onClick={() => setFlag({ archived: false }, `${pickedRows.length} restored`)}
              >
                <ArchiveRestore className="size-4" /> Restore
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                className={BAR_BUTTON}
                onClick={() => setFlag({ archived: true }, `${pickedRows.length} archived`)}
              >
                <Archive className="size-4" /> Archive
              </button>
            )}
            <button type="button" className={BAR_BUTTON} onClick={() => exportCsv(pickedRows)}>
              <Download className="size-4" /> CSV
            </button>
            <button
              type="button"
              aria-label="Clear selection"
              className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-background/15"
              onClick={() => setPicked(new Set())}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <ClientSheet
        row={open}
        team={team.data ?? []}
        meetings={inbox.data?.meetings ?? []}
        onClose={() => setOpenId(null)}
      />
    </AppShell>
  );
}

const BAR_BUTTON =
  "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm transition-colors hover:bg-background/15 disabled:opacity-50";

function SortHead({
  label,
  k,
  sort,
  onSort,
  hideBelow2xl = false,
}: {
  label: string;
  k: SortKey;
  sort: { key: SortKey; desc: boolean };
  onSort: (k: SortKey) => void;
  hideBelow2xl?: boolean;
}) {
  const on = sort.key === k;
  const Arrow = sort.desc ? ArrowDown : ArrowUp;
  return (
    <TableHead className={cn(hideBelow2xl && "hidden 2xl:table-cell")}>
      <button
        type="button"
        onClick={() => onSort(k)}
        className={cn(
          "inline-flex items-center gap-1 uppercase tracking-[0.08em] hover:text-foreground",
          on && "text-foreground",
        )}
      >
        {label}
        {on && <Arrow className="size-3" />}
      </button>
    </TableHead>
  );
}

function Avatar({ name, big = false }: { name: string; big?: boolean }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-secondary font-display font-semibold text-primary",
        big ? "size-14 text-xl" : "size-9 text-sm",
      )}
    >
      {initial(name)}
    </span>
  );
}

function StagePill({ stage, className }: { stage: LeadStage; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary px-2.5 py-0.5 text-xs",
        stage === "won" && "bg-success/15 font-medium text-success",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", stageTone(stage))} />
      {stageLabel(stage)}
    </span>
  );
}

// --------------------------------------------------------------- the sheet

function ClientSheet({
  row,
  team,
  meetings,
  onClose,
}: {
  row: Row | null;
  team: Staff[];
  meetings: Meeting[];
  onClose: () => void;
}) {
  const patchConv = usePatchConversation();
  const nextCall = row
    ? meetings
        .filter(
          (m) =>
            m.conversation_id === row.c.id &&
            (m.status === "confirmed" || m.status === "proposed") &&
            Date.parse(m.starts_at) > Date.now(),
        )
        .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at))[0]
    : undefined;

  const p = row?.c.profile;
  const facts: [string, ReactNode][] = row
    ? [
        [
          "Email",
          p?.email ? (
            <a href={`mailto:${p.email}`} className="text-primary hover:underline">
              {p.email}
            </a>
          ) : (
            "—"
          ),
        ],
        [
          "Mobile",
          p?.mobile ? (
            <a href={`tel:${p.mobile}`} className="text-primary hover:underline">
              {p.mobile}
            </a>
          ) : (
            "—"
          ),
        ],
        ["Found Marj on", sourceLabel(p?.source)],
        ["Client since", shortDate(row.c.created_at)],
        ["Last active", ago(row.c.last_activity)],
        ["Conversation", row.c.code],
      ]
    : [];

  return (
    <Sheet open={Boolean(row)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto bg-surface-muted p-0 sm:max-w-md">
        {row && (
          <>
            <div className="bg-card px-5 pb-5 pt-6">
              <div className="flex items-center gap-4 pr-8">
                <Avatar name={row.name} big />
                <div className="min-w-0">
                  <SheetTitle className="truncate font-display text-xl font-semibold">
                    {row.name}
                  </SheetTitle>
                  <SheetDescription className="mt-0.5">
                    {row.leads.length} request{row.leads.length === 1 ? "" : "s"}
                    {row.lead ? ` · ${stageLabel(row.lead.stage)}` : ""}
                  </SheetDescription>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" className="rounded-full">
                  <Link to="/admin/inbox" search={{ c: row.c.id }}>
                    <MessagesSquare className="size-4" /> Open conversation
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() =>
                    patchConv.mutate({ id: row.c.id, patch: { starred: !row.c.starred } })
                  }
                >
                  <Star className={cn("size-4", row.c.starred && "fill-warning text-warning")} />
                  {row.c.starred ? "Starred" : "Star"}
                </Button>
                {p?.mobile && (
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <a href={`tel:${p.mobile}`}>
                      <Phone className="size-4" /> Call
                    </a>
                  </Button>
                )}
                {p?.email && (
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <a href={`mailto:${p.email}`}>
                      <Mail className="size-4" /> Email
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3 p-4">
              <section className="rounded-2xl bg-card p-4 shadow-level-1">
                <dl className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-3 gap-y-2.5 text-sm">
                  {facts.map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="min-w-0 truncate">{v}</dd>
                    </div>
                  ))}
                  <dt className="self-center text-muted-foreground">Assigned to</dt>
                  <dd>
                    <Select
                      value={row.c.assigned_to ?? "none"}
                      onValueChange={(v) =>
                        patchConv.mutate(
                          { id: row.c.id, patch: { assigned_to: v === "none" ? null : v } },
                          { onSuccess: () => toast.success("Assigned") },
                        )
                      }
                    >
                      <SelectTrigger className="h-9 rounded-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {team.map((s) => (
                          <SelectItem key={s.user_id} value={s.user_id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </dd>
                </dl>
              </section>

              {nextCall && (
                <section className="flex items-center gap-3 rounded-2xl bg-success/10 p-4 text-sm">
                  <CalendarCheck className="size-5 shrink-0 text-success" />
                  <span>
                    <span className="block font-semibold">
                      {nextCall.status === "confirmed" ? "Call booked" : "Call proposed"}
                    </span>
                    {new Date(nextCall.starts_at).toLocaleString("en-PH", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "Asia/Manila",
                    })}{" "}
                    · {meetingModeLabel(nextCall.mode)}
                  </span>
                </section>
              )}

              <p className="px-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Requests
              </p>
              {row.leads.length === 0 ? (
                <Empty>No requests.</Empty>
              ) : (
                row.leads.map((l) => <LeadBlock key={l.id} lead={l} />)
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function LeadBlock({ lead }: { lead: Lead }) {
  const patch = usePatchLead();
  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 px-1">
        <span className="mr-auto text-xs font-medium text-muted-foreground">Mark this request</span>
        <div className="flex items-center gap-2">
          {lead.stage === "lost" && (
            <Select
              value={lead.lost_reason ?? ""}
              onValueChange={(v) => patch.mutate({ id: lead.id, patch: { lost_reason: v } })}
            >
              <SelectTrigger className="h-8 w-32 rounded-full text-xs">
                <SelectValue placeholder="Why lost?" />
              </SelectTrigger>
              <SelectContent>
                {LOST_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select
            value={lead.stage}
            onValueChange={(v) =>
              patch.mutate(
                {
                  id: lead.id,
                  patch: { stage: v as LeadStage, ...(v !== "lost" ? { lost_reason: null } : {}) },
                },
                { onSuccess: () => toast.success(`Stage: ${stageLabel(v as LeadStage)}`) },
              )
            }
          >
            <SelectTrigger className="h-8 w-36 rounded-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <span className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", stageTone(s.value))} />
                    {s.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <RequestCard lead={lead} viewer="staff" />
    </section>
  );
}
