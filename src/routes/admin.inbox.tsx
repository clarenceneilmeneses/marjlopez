/**
 * The Inbox — PRD §9. Malaya's admin Inbox with the booking taken out and the
 * LEAD put where the reservation sat.
 *
 * The same three columns (list · thread · the panel beside it), each scrolling
 * on its own on a laptop; on a phone, the list OR the thread, with a back
 * arrow, and the panel folded under the chat — exactly as Malaya does it.
 *
 * "ALL SORTED OUT" (PRD §9.2): the list puts what is waiting on us first —
 * hot and unanswered, then unanswered by how long, then everything else by
 * latest activity. Filters by type, stage, Unread, Hot, Mine, Unassigned.
 */
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  ArrowLeft,
  CalendarPlus,
  Check,
  ChevronDown,
  Flame,
  Lightbulb,
  Mail,
  MailOpen,
  MessageSquareText,
  MoreHorizontal,
  Phone,
  Search,
  Settings2,
  Star,
  Trash2,
} from "@/components/icons";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/admin/app-shell";
import { Composer } from "@/components/chat/composer";
import { groupReactions, MessageThread, type MessageActions } from "@/components/chat/thread";
import { InlineLoading } from "@/components/loading";
import { useNavPillAway } from "@/components/nav-pill";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { dateTime, firstName, hoursSince, initial, shortDate, timeAgo } from "@/lib/format";
import {
  answerLabel,
  LOST_REASONS,
  leadSummary,
  optionLabel,
  questionsFor,
  SOURCES,
  STAGES,
  stageLabel,
  stageTone,
  TYPE_ORDER,
  TYPES,
} from "@/lib/inquiry";
import type { Lead, LeadStage, LeadType, Meeting, Message, QuickReply, Staff } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth";
import {
  errorText,
  fillReply,
  uploadMedia,
  useAddNote,
  useCancelMeeting,
  useDeleteConversation,
  useEditMessage,
  useInbox,
  useLiveUpdates,
  useMarkSeen,
  useNotes,
  usePatchConversation,
  usePatchLead,
  useProposeMeeting,
  useQuickReplies,
  useReact,
  useSendMessage,
  useStaffList,
  useThread,
  useUnsendMessage,
  type ConversationWithPerson,
} from "@/state/data";

export const Route = createFileRoute("/admin/inbox")({
  // `?c=<conversation id>` opens that conversation — the bell and the dashboard link here.
  validateSearch: (s: Record<string, unknown>): { c?: string } =>
    typeof s["c"] === "string" ? { c: s["c"] } : {},
  head: () => ({ meta: [{ title: "Inbox — Marj Lopez" }] }),
  component: InboxPage,
});

// Malaya's chip strip (components/obs/chip-group.tsx).
const CHIP_STRIP =
  "inline-flex items-center gap-0.5 rounded-full border border-border/70 bg-card p-1 shadow-level-1";
const CHIP =
  "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const CHIP_ON = "bg-secondary font-medium text-primary";
const CHIP_OFF = "text-muted-foreground hover:bg-secondary/60 hover:text-foreground";

type TypeFilter = "all" | LeadType | "starred" | "archived";
type Chip = "unread" | "hot" | "mine" | "unassigned" | null;

interface Row {
  conv: ConversationWithPerson;
  name: string;
  lead: Lead | null;
  leads: Lead[];
  last: Message | undefined;
  hot: boolean;
  waitingHours: number | null;
}

function InboxPage() {
  const { staff, session } = useAuth();
  const isStaff = Boolean(staff);
  useLiveUpdates(isStaff);
  const inbox = useInbox(isStaff);
  const staffList = useStaffList(isStaff);

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [stageFilter, setStageFilter] = useState<LeadStage | "all">("all");
  const [chip, setChip] = useState<Chip>(null);
  const [search, setSearch] = useState("");
  const params = Route.useSearch();
  const [selectedId, setSelectedId] = useState<string | null>(params.c ?? null);
  const [threadOnPhone, setThreadOnPhone] = useState(Boolean(params.c));
  useEffect(() => {
    if (!params.c) return;
    setSelectedId(params.c);
    setThreadOnPhone(true);
  }, [params.c]);
  useNavPillAway(threadOnPhone);

  const allRows = useMemo<Row[]>(() => {
    const data = inbox.data;
    if (!data) return [];
    const leadsByConv = new Map<string, Lead[]>();
    for (const l of data.leads) {
      if (!l.conversation_id) continue;
      const list = leadsByConv.get(l.conversation_id) ?? [];
      list.push(l);
      leadsByConv.set(l.conversation_id, list);
    }
    return data.conversations.map((conv) => {
      const leads = leadsByConv.get(conv.id) ?? [];
      const lead = leads.find((l) => l.id === conv.current_lead_id) ?? leads[0] ?? null;
      return {
        conv,
        name: conv.profile?.full_name || conv.profile?.email || "Unnamed",
        lead,
        leads,
        last: data.last.get(conv.id),
        hot: Boolean(lead?.hot),
        waitingHours: conv.waiting_since ? hoursSince(conv.waiting_since) : null,
      };
    });
  }, [inbox.data]);

  const matches = (row: Row, t: TypeFilter, c: Chip) => {
    if (t === "archived") {
      if (!row.conv.archived) return false;
    } else if (row.conv.archived) return false;
    if (t === "starred" && !row.conv.starred) return false;
    if (t !== "all" && t !== "starred" && t !== "archived" && row.lead?.type !== t) return false;
    if (stageFilter !== "all" && row.lead?.stage !== stageFilter) return false;
    if (c === "unread" && !row.conv.unread) return false;
    if (c === "hot" && !row.hot) return false;
    if (c === "mine" && row.conv.assigned_to !== session?.user.id) return false;
    if (c === "unassigned" && row.conv.assigned_to) return false;
    const q = search.trim().toLowerCase();
    if (q) {
      const hay = [
        row.name,
        row.conv.profile?.email,
        row.conv.profile?.mobile,
        row.conv.code,
        row.lead?.code,
        row.lead ? leadSummary(row.lead.type, row.lead.answers) : "",
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  };

  const rows = useMemo(() => {
    const list = allRows.filter((r) => matches(r, typeFilter, chip));
    // What is waiting on us first: hot and unanswered, then unanswered by how
    // long, then everything else by latest activity.
    const rank = (r: Row) => (r.waitingHours !== null ? (r.hot ? 0 : 1) : 2);
    return list.sort((a, b) => {
      const d = rank(a) - rank(b);
      if (d) return d;
      if (a.waitingHours !== null && b.waitingHours !== null)
        return b.waitingHours - a.waitingHours;
      return Date.parse(b.conv.last_activity) - Date.parse(a.conv.last_activity);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRows, typeFilter, chip, stageFilter, search, session?.user.id]);

  const countFor = (t: TypeFilter, c: Chip = null) =>
    allRows.filter((r) => matches(r, t, c)).length;

  const selected =
    rows.find((r) => r.conv.id === selectedId) ??
    allRows.find((r) => r.conv.id === selectedId) ??
    null;
  useEffect(() => {
    // A laptop opens on the first conversation, like a mail app.
    if (!selectedId && rows[0] && typeof window !== "undefined" && window.innerWidth >= 1024) {
      setSelectedId(rows[0].conv.id);
    }
  }, [rows, selectedId]);

  const summary = useMemo(() => {
    const open = allRows.filter((r) => !r.conv.archived);
    const waits = open.map((r) => r.waitingHours ?? 0);
    return {
      unassigned: open.filter((r) => !r.conv.assigned_to).length,
      hotWaiting: open.filter((r) => r.hot && r.waitingHours !== null).length,
      longestWaitHours: waits.length ? Math.max(...waits) : 0,
    };
  }, [allRows]);

  const staffById = useMemo(
    () => new Map((staffList.data ?? []).map((s) => [s.user_id, s])),
    [staffList.data],
  );

  const side = selected ? (
    <LeadPanel
      key={selected.conv.id}
      row={selected}
      staffList={staffList.data ?? []}
      onDeleted={() => {
        setSelectedId(null);
        setThreadOnPhone(false);
      }}
    />
  ) : null;

  const open = (row: Row) => {
    setSelectedId(row.conv.id);
    setThreadOnPhone(true);
  };

  return (
    <AppShell fullBleed title="Inbox">
      {inbox.isLoading ? (
        <InlineLoading label="Loading conversations…" className="p-4" />
      ) : inbox.error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {errorText(inbox.error, "The inbox didn't load.")}{" "}
          <button className="underline" onClick={() => void inbox.refetch()}>
            Try again
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 lg:h-full lg:min-h-0">
          <div
            className={cn(
              "flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground",
              threadOnPhone && "hidden lg:flex",
            )}
          >
            <span>
              Inquiries from the site land here, sorted:{" "}
              <span className="font-medium text-foreground">hot and waiting first</span>.
            </span>
            <span className="ml-auto flex flex-wrap items-center gap-2">
              {summary.hotWaiting > 0 && (
                <Badge variant="outline" className="gap-1 border-destructive/40 text-destructive">
                  <Flame className="size-3" /> {summary.hotWaiting} hot waiting
                </Badge>
              )}
              {summary.unassigned > 0 && (
                <Badge variant="outline" className="border-warning/50 text-warning">
                  {summary.unassigned} unassigned
                </Badge>
              )}
              {summary.longestWaitHours >= 1 && (
                <Badge
                  variant="outline"
                  className={
                    summary.longestWaitHours >= 24
                      ? "border-destructive/40 text-destructive"
                      : "text-muted-foreground"
                  }
                >
                  Longest wait {Math.floor(summary.longestWaitHours)}h
                </Badge>
              )}
            </span>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:items-stretch xl:grid-cols-[minmax(300px,380px)_minmax(0,1fr)_minmax(300px,360px)]">
            <ThreadList
              className={cn(threadOnPhone && "hidden lg:block")}
              rows={rows}
              selectedId={selected?.conv.id}
              onOpen={open}
              typeFilter={typeFilter}
              onTypeFilter={setTypeFilter}
              stageFilter={stageFilter}
              onStageFilter={setStageFilter}
              chip={chip}
              onChip={setChip}
              countFor={countFor}
              search={search}
              onSearch={setSearch}
              staffById={staffById}
              emptyMessage={
                allRows.length
                  ? "Nothing in this view. Try another filter or clear the search."
                  : "Inquiries appear here the moment someone sends the form on the site."
              }
            />
            {selected ? (
              <ThreadPane
                key={selected.conv.id}
                className={cn(!threadOnPhone && "hidden lg:flex")}
                row={selected}
                onBack={() => setThreadOnPhone(false)}
                side={side}
              />
            ) : (
              <Card className="hidden border-border/70 bg-surface shadow-level-1 lg:flex lg:items-center lg:justify-center xl:col-span-2">
                <p className="p-6 text-sm text-muted-foreground">Pick a conversation.</p>
              </Card>
            )}
            {selected && (
              <aside className="hidden min-h-0 xl:block xl:overflow-y-auto">{side}</aside>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}

// -------------------------------------------------------------------- list

function RowAvatar({ row }: { row: Row }) {
  const Icon = row.lead ? TYPES[row.lead.type].icon : Mail;
  return (
    <span className="relative size-12 shrink-0">
      <span className="grid size-12 place-items-center rounded-xl bg-secondary text-primary">
        <Icon className="size-5" />
      </span>
      <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-surface bg-card text-[10px] font-bold text-foreground shadow-sm">
        {initial(row.name)}
      </span>
    </span>
  );
}

function WaitBadge({ hours }: { hours: number }) {
  const label = hours < 1 ? `${Math.max(1, Math.round(hours * 60))}m` : `${Math.floor(hours)}h`;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[11px] leading-none",
        hours >= 24
          ? "border-destructive/40 text-destructive"
          : hours >= 4
            ? "border-warning/50 text-warning"
            : "border-border text-muted-foreground",
      )}
    >
      Waiting {label}
    </span>
  );
}

const TYPE_FILTERS: { key: TypeFilter; label: string }[] = [
  { key: "all", label: "All" },
  ...TYPE_ORDER.map((t) => ({ key: t as TypeFilter, label: TYPES[t].short })),
  { key: "starred", label: "Starred" },
  { key: "archived", label: "Archived" },
];

function ThreadList({
  className,
  rows,
  selectedId,
  onOpen,
  typeFilter,
  onTypeFilter,
  stageFilter,
  onStageFilter,
  chip,
  onChip,
  countFor,
  search,
  onSearch,
  staffById,
  emptyMessage,
}: {
  className?: string;
  rows: Row[];
  selectedId: string | undefined;
  onOpen: (row: Row) => void;
  typeFilter: TypeFilter;
  onTypeFilter: (t: TypeFilter) => void;
  stageFilter: LeadStage | "all";
  onStageFilter: (s: LeadStage | "all") => void;
  chip: Chip;
  onChip: (c: Chip) => void;
  countFor: (t: TypeFilter, c?: Chip) => number;
  search: string;
  onSearch: (v: string) => void;
  staffById: Map<string, Staff>;
  emptyMessage: string;
}) {
  const [searchOpen, setSearchOpen] = useState(Boolean(search));
  const navigate = useNavigate();
  const typeLabel = TYPE_FILTERS.find((f) => f.key === typeFilter)?.label ?? "All";
  const stageText = stageFilter === "all" ? "" : ` · ${stageLabel(stageFilter)}`;

  const chipButton = (key: Exclude<Chip, null>, label: ReactNode) => {
    const n = countFor(typeFilter, key);
    return (
      <button
        type="button"
        className={cn(CHIP, chip === key ? CHIP_ON : CHIP_OFF)}
        aria-pressed={chip === key}
        onClick={() => onChip(chip === key ? null : key)}
      >
        {label}
        {n > 0 && (key === "unread" || key === "hot") && (
          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[11px] leading-none tabular-nums">
            {n}
          </span>
        )}
      </button>
    );
  };

  return (
    <Card className={cn("border-border/70 bg-surface shadow-level-1 lg:min-h-0", className)}>
      <CardContent className="p-2 lg:h-full lg:overflow-y-auto">
        <div className="space-y-2.5 bg-surface px-2 pb-2 pt-2 lg:sticky lg:top-0 lg:z-10">
          <div className="flex items-center justify-between">
            <p className="font-display text-xl font-semibold">Messages</p>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant={searchOpen ? "secondary" : "ghost"}
                className="rounded-full"
                aria-label="Search conversations"
                aria-pressed={searchOpen}
                onClick={() => {
                  if (searchOpen) onSearch("");
                  setSearchOpen((v) => !v);
                }}
              >
                <Search className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full"
                aria-label="Manage quick replies"
                onClick={() => void navigate({ to: "/admin/quick-replies" })}
              >
                <Settings2 className="size-4" />
              </Button>
            </div>
          </div>
          {searchOpen && (
            <Input
              autoFocus
              className="h-9 rounded-full"
              placeholder="Search name, mobile, email or code"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />
          )}
          <div className={cn(CHIP_STRIP, "max-w-full overflow-x-auto no-scrollbar")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={cn(CHIP, "gap-1", CHIP_ON)}>
                  {typeLabel}
                  {stageText}
                  <ChevronDown className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-60">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Request
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={typeFilter}
                  onValueChange={(v) => onTypeFilter(v as TypeFilter)}
                >
                  {TYPE_FILTERS.map((f) => (
                    <DropdownMenuRadioItem key={f.key} value={f.key}>
                      {f.key !== "all" && f.key !== "starred" && f.key !== "archived"
                        ? TYPES[f.key].label
                        : f.label}
                      <span className="ml-auto pl-3 text-xs text-muted-foreground">
                        {countFor(f.key)}
                      </span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Stage
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={stageFilter}
                  onValueChange={(v) => onStageFilter(v as LeadStage | "all")}
                >
                  <DropdownMenuRadioItem value="all">Any stage</DropdownMenuRadioItem>
                  {STAGES.map((s) => (
                    <DropdownMenuRadioItem key={s.value} value={s.value}>
                      {s.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {chipButton("unread", "Unread")}
            {chipButton(
              "hot",
              <>
                <Flame className="size-3.5" /> Hot
              </>,
            )}
            {chipButton("mine", "Mine")}
            {chipButton("unassigned", "Unassigned")}
          </div>
        </div>
        {rows.length === 0 && (
          <p className="px-3 py-6 text-sm text-muted-foreground">{emptyMessage}</p>
        )}
        <ul className="flex flex-col gap-0.5">
          {rows.map((row) => {
            const assignee = row.conv.assigned_to ? staffById.get(row.conv.assigned_to) : undefined;
            return (
              <li
                key={row.conv.id}
                className={cn(
                  "group relative rounded-xl transition-colors",
                  row.conv.id === selectedId ? "bg-secondary" : "hover:bg-secondary/60",
                )}
              >
                <button
                  type="button"
                  onClick={() => onOpen(row)}
                  className="flex w-full gap-3 rounded-xl px-3 py-3 text-left"
                >
                  <RowAvatar row={row} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5">
                        {row.conv.unread && (
                          <span
                            className="size-2 shrink-0 rounded-full bg-primary"
                            aria-label="Unread"
                          />
                        )}
                        <span
                          className={cn(
                            "truncate text-sm",
                            row.conv.unread ? "font-bold" : "font-semibold",
                          )}
                        >
                          {row.name}
                        </span>
                        {row.hot && (
                          <Flame
                            className="size-3.5 shrink-0 text-destructive"
                            aria-label="Hot lead"
                          />
                        )}
                        {row.conv.starred && (
                          <Star
                            className="size-3.5 shrink-0 fill-warning text-warning"
                            aria-label="Starred"
                          />
                        )}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {timeAgo(row.conv.last_activity)}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block truncate text-xs",
                        row.conv.unread ? "font-semibold text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {row.last ? previewOf(row.last) : "No messages yet"}
                    </span>
                    {row.lead && (
                      <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                        <span
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            stageTone(row.lead.stage),
                          )}
                        />
                        <span className="truncate">
                          <span className="font-medium text-foreground">
                            {stageLabel(row.lead.stage)}
                          </span>
                          {" · "}
                          {leadSummary(row.lead.type, row.lead.answers)}
                        </span>
                      </span>
                    )}
                    {(row.waitingHours !== null || assignee || row.leads.length > 1) && (
                      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {row.waitingHours !== null && <WaitBadge hours={row.waitingHours} />}
                        {row.leads.length > 1 && (
                          <span className="rounded-full border border-border px-1.5 py-0.5 text-[11px] leading-none text-muted-foreground">
                            {row.leads.length} requests
                          </span>
                        )}
                        {assignee && (
                          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[11px] leading-none text-muted-foreground">
                            {firstName(assignee.name)}
                          </span>
                        )}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function previewOf(m: Message): string {
  const who = m.author === "client" ? "" : `${firstName(m.author_name)}: `;
  if (m.unsent_at) return `${who}Message unsent`;
  if (m.kind === "request") return m.body.trim() ? `New request · ${m.body}` : "Sent a new request";
  if (m.kind === "meeting") return `${who}Proposed a call`;
  if (m.body.trim()) return `${who}${m.body}`;
  return `${who}${m.media_type === "video" ? "Sent a video" : "Sent a photo"}`;
}

// ------------------------------------------------------------------ thread

function ThreadPane({
  className,
  row,
  onBack,
  side,
}: {
  className?: string;
  row: Row;
  onBack: () => void;
  /** The lead panel — under the chat below `xl`, its own column from `xl`. */
  side: ReactNode;
}) {
  const { session, staff } = useAuth();
  const thread = useThread(row.conv.id);
  const send = useSendMessage();
  const edit = useEditMessage();
  const unsend = useUnsendMessage();
  const react = useReact();
  const markSeen = useMarkSeen();
  const patch = usePatchConversation();
  const cancelMeeting = useCancelMeeting();
  const quick = useQuickReplies(true);
  const inbox = useInbox(true);

  const [draft, setDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [attaching, setAttaching] = useState(0);
  const [quickOpen, setQuickOpen] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);

  // Opening a thread clears Unread and tells them it was seen.
  const lastId = thread.data?.messages.at(-1)?.id;
  useEffect(() => {
    if (row.conv.unread || lastId) markSeen.mutate(row.conv.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.conv.id, lastId]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [row.conv.id, thread.data?.messages.length]);

  const leadsById = useMemo(
    () => new Map((inbox.data?.leads ?? []).map((l) => [l.id, l])),
    [inbox.data?.leads],
  );
  const reactions = useMemo(
    () => groupReactions(thread.data?.reactions ?? [], session?.user.id),
    [thread.data?.reactions, session?.user.id],
  );

  const actions: MessageActions = {
    canManage: (m) => m.author_id === session?.user.id,
    onEdit: async (m, body) => {
      await edit.mutateAsync({ id: m.id, body });
    },
    onUnsend: async (m) => {
      await unsend.mutateAsync(m.id);
    },
  };

  const reply = async () => {
    const body = draft.trim();
    if (!body) return;
    try {
      await send.mutateAsync({
        conversationId: row.conv.id,
        body,
        replyToId: replyingTo?.id ?? null,
      });
      setDraft("");
      setReplyingTo(null);
    } catch (e) {
      toast.error(errorText(e, "Couldn't send that."));
    }
  };

  const attach = async (files: File[]) => {
    setAttaching(files.length);
    try {
      for (const f of files) {
        const media = await uploadMedia(row.conv.id, f);
        await send.mutateAsync({ conversationId: row.conv.id, body: "", media });
        setAttaching((n) => n - 1);
      }
    } catch (e) {
      toast.error(errorText(e, "Couldn't send that file."));
    } finally {
      setAttaching(0);
    }
  };

  const first = firstName(row.name);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 lg:min-h-0 lg:overflow-y-auto xl:overflow-hidden",
        className,
      )}
    >
      <Card className="border-border/70 bg-surface shadow-level-1 xl:flex xl:min-h-0 xl:flex-1 xl:flex-col">
        <CardContent className="flex flex-col gap-4 p-4 sm:p-5 xl:min-h-0 xl:flex-1">
          <div className="-mx-4 -mt-4 flex items-center gap-3 border-b border-border/60 px-4 py-3 sm:-mx-5 sm:-mt-5 sm:px-5">
            <Button
              size="icon"
              variant="ghost"
              className="-ml-2 shrink-0 lg:hidden"
              aria-label="All conversations"
              onClick={onBack}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-sm font-semibold">
              {initial(row.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold leading-tight">{row.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {row.lead ? `${TYPES[row.lead.type].label} · ${row.lead.code}` : "No request yet"}
              </p>
            </div>
            {row.hot && (
              <Badge
                variant="outline"
                className="hidden shrink-0 gap-1 border-destructive/40 text-[11px] text-destructive sm:inline-flex"
              >
                <Flame className="size-3" /> Hot
              </Badge>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="size-8 shrink-0 rounded-full"
              aria-label={row.conv.starred ? "Unstar" : "Star"}
              aria-pressed={row.conv.starred}
              onClick={() =>
                patch.mutate({ id: row.conv.id, patch: { starred: !row.conv.starred } })
              }
            >
              <Star className={cn("size-4", row.conv.starred && "fill-warning text-warning")} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 shrink-0 rounded-full"
                  aria-label="Conversation actions"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  className="gap-2"
                  onSelect={() => {
                    patch.mutate({ id: row.conv.id, patch: { unread: true } });
                    onBack();
                  }}
                >
                  <MailOpen className="size-4" /> Mark as unread
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2"
                  onSelect={() => {
                    patch.mutate({ id: row.conv.id, patch: { archived: !row.conv.archived } });
                    toast.success(row.conv.archived ? "Moved back to the inbox" : "Archived");
                  }}
                >
                  {row.conv.archived ? (
                    <ArchiveRestore className="size-4" />
                  ) : (
                    <Archive className="size-4" />
                  )}
                  {row.conv.archived ? "Unarchive" : "Archive"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {row.lead && <StageStepper lead={row.lead} />}

          <div
            ref={scrollRef}
            className="max-h-[60vh] overflow-y-auto pr-1 lg:max-h-[55vh] xl:max-h-none xl:min-h-0 xl:flex-1"
          >
            {thread.isLoading ? (
              <InlineLoading label="Loading the conversation…" />
            ) : (
              <MessageThread
                viewer="staff"
                messages={thread.data?.messages ?? []}
                leads={leadsById}
                meetings={thread.data?.meetings ?? new Map()}
                seen={{ at: row.conv.client_seen_at, by: first || "them" }}
                actions={actions}
                reactions={reactions}
                onReact={(id, emoji) =>
                  react.mutate({
                    messageId: id,
                    emoji,
                    ...(reactions.get(id)?.find((r) => r.mine)
                      ? { current: reactions.get(id)!.find((r) => r.mine)!.emoji }
                      : {}),
                  })
                }
                onReply={setReplyingTo}
                onCancelMeeting={(id) => cancelMeeting.mutate(id)}
                meetingBusy={cancelMeeting.isPending}
              />
            )}
          </div>

          <Composer
            draft={draft}
            onDraftChange={setDraft}
            onSend={() => void reply()}
            busy={send.isPending}
            replyingTo={replyingTo}
            onClearReply={() => setReplyingTo(null)}
            onAttach={(files) => void attach(files)}
            attaching={attaching}
            placeholder={`Write to ${first || "them"}…`}
            menuItems={
              <>
                <DropdownMenuItem
                  className="gap-3 rounded-xl py-2.5"
                  onSelect={() => setQuickOpen(true)}
                >
                  <MessageSquareText className="size-4" /> Send quick reply
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-3 rounded-xl py-2.5"
                  onSelect={() => setMeetingOpen(true)}
                >
                  <CalendarPlus className="size-4" /> Schedule a call
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            }
            tools={
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-9 rounded-full"
                  aria-label="Send quick reply"
                  title="Quick replies"
                  onClick={() => setQuickOpen(true)}
                >
                  <MessageSquareText className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-9 rounded-full"
                  aria-label="Schedule a call"
                  title="Schedule a call"
                  onClick={() => setMeetingOpen(true)}
                >
                  <CalendarPlus className="size-4" />
                </Button>
              </>
            }
          />
        </CardContent>
      </Card>

      <div className="xl:hidden">{side}</div>
      <QuickRepliesDialog
        open={quickOpen}
        onOpenChange={setQuickOpen}
        replies={quick.data ?? []}
        onPick={(body) => {
          const text = fillReply(body, { firstName: first, staffName: staff?.name ?? "" });
          setDraft((d) => (d.trim() ? `${d.trimEnd()}\n\n${text}` : text));
        }}
      />
      <MeetingDialog
        open={meetingOpen}
        onOpenChange={setMeetingOpen}
        conversationId={row.conv.id}
        name={first}
      />
    </div>
  );
}

// -------------------------------------------------------------- lead panel

function LeadPanel({
  row,
  staffList,
  onDeleted,
}: {
  row: Row;
  staffList: Staff[];
  onDeleted: () => void;
}) {
  const { staff } = useAuth();
  const patchConv = usePatchConversation();
  const patchLead = usePatchLead();
  const del = useDeleteConversation();
  const [leadId, setLeadId] = useState(row.lead?.id);
  const lead = row.leads.find((l) => l.id === leadId) ?? row.lead;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const p = row.conv.profile;
  const mobileDigits = (p?.mobile ?? "").replace(/\D/g, "");
  const intl = mobileDigits.startsWith("0") ? `63${mobileDigits.slice(1)}` : mobileDigits;

  const setStage = (stage: LeadStage) => {
    if (!lead) return;
    patchLead.mutate(
      { id: lead.id, patch: { stage, ...(stage !== "lost" ? { lost_reason: null } : {}) } },
      { onSuccess: () => toast.success(`Stage: ${stageLabel(stage)}`) },
    );
  };

  return (
    <div className="space-y-3">
      <Card className="border-border/70 bg-surface shadow-level-1">
        <CardContent className="space-y-4 p-4">
          <div>
            <p className="malaya-eyebrow">
              {row.conv.code} · since {dateTime(row.conv.created_at)}
            </p>
            <p className="mt-1 font-display text-lg font-semibold">{row.name}</p>
            <div className="mt-2 space-y-1.5 text-sm">
              {p?.mobile && (
                <p className="flex flex-wrap items-center gap-2">
                  <Phone className="size-3.5 text-muted-foreground" />
                  <a className="link-action" href={`tel:+${intl}`}>
                    {p.mobile}
                  </a>
                  <a
                    className="text-xs text-muted-foreground underline underline-offset-2"
                    href={`viber://chat?number=%2B${intl}`}
                  >
                    Viber
                  </a>
                  <a
                    className="text-xs text-muted-foreground underline underline-offset-2"
                    href={`https://wa.me/${intl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp
                  </a>
                </p>
              )}
              {p?.email && (
                <p className="flex items-center gap-2">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <a className="link-action truncate" href={`mailto:${p.email}`}>
                    {p.email}
                  </a>
                </p>
              )}
              {p?.source && (
                <p className="text-xs text-muted-foreground">
                  Found Marj on {optionLabel(SOURCES, p.source)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Assigned to</span>
              <Select
                value={row.conv.assigned_to ?? "none"}
                onValueChange={(v) =>
                  patchConv.mutate(
                    { id: row.conv.id, patch: { assigned_to: v === "none" ? null : v } },
                    {
                      onSuccess: () =>
                        toast.success(
                          v === "none"
                            ? "Unassigned"
                            : `Assigned to ${staffList.find((s) => s.user_id === v)?.name}`,
                        ),
                    },
                  )
                }
              >
                <SelectTrigger className="h-9 rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nobody yet</SelectItem>
                  {staffList.map((s) => (
                    <SelectItem key={s.user_id} value={s.user_id}>
                      {s.name}
                      {s.role === "owner" ? " (owner)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>
        </CardContent>
      </Card>

      <AtAGlance row={row} />

      {lead && (
        <Card className="border-border/70 bg-surface shadow-level-1">
          <CardContent className="space-y-4 p-4">
            {row.leads.length > 1 && (
              <div className={cn(CHIP_STRIP, "max-w-full overflow-x-auto no-scrollbar")}>
                {row.leads.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className={cn(CHIP, "h-7 text-xs", l.id === lead.id ? CHIP_ON : CHIP_OFF)}
                    onClick={() => setLeadId(l.id)}
                  >
                    {TYPES[l.type].short} · {l.code}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                {(() => {
                  const Icon = TYPES[lead.type].icon;
                  return <Icon className="size-5" />;
                })()}
              </span>
              <div className="min-w-0">
                <p className="font-semibold leading-tight">{TYPES[lead.type].label}</p>
                <p className="text-xs text-muted-foreground">
                  {lead.code} · {dateTime(lead.created_at)}
                </p>
              </div>
            </div>

            <div
              className={cn(
                "rounded-xl px-3 py-2.5 text-sm",
                lead.hot ? "bg-destructive/10" : "bg-secondary/60",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={cn(
                    "flex items-center gap-1.5 font-medium",
                    lead.hot ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  <Flame className="size-4" />
                  {lead.hot ? "Hot lead" : "Not hot"}
                </span>
                <Switch
                  checked={lead.hot}
                  aria-label="Hot lead"
                  onCheckedChange={(v) =>
                    patchLead.mutate({ id: lead.id, patch: { hot_override: v } })
                  }
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {lead.hot_override !== null
                  ? `Set by hand${lead.hot_reason ? ` · rules say: ${lead.hot_reason}` : ""}`
                  : lead.hot_reason
                    ? `Why: ${lead.hot_reason}`
                    : "Doesn't meet the hot rules."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Stage</span>
                <Select value={lead.stage} onValueChange={(v) => setStage(v as LeadStage)}>
                  <SelectTrigger className="h-9 rounded-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
              {lead.stage === "lost" && (
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Why it was lost</span>
                  <Select
                    value={lead.lost_reason ?? ""}
                    onValueChange={(v) =>
                      patchLead.mutate({ id: lead.id, patch: { lost_reason: v } })
                    }
                  >
                    <SelectTrigger className="h-9 rounded-full">
                      <SelectValue placeholder="Pick a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOST_REASONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              )}
            </div>

            <dl className="space-y-2 border-t border-border/60 pt-3 text-sm">
              {questionsFor(lead.type).map((q) => {
                const v = lead.answers[q.key];
                if (v == null || v === "" || (Array.isArray(v) && !v.length)) return null;
                return (
                  <div
                    key={q.key}
                    className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3"
                  >
                    <dt className="text-muted-foreground">{q.label}</dt>
                    <dd className="font-medium [overflow-wrap:anywhere]">{answerLabel(q, v)}</dd>
                  </div>
                );
              })}
              {typeof lead.answers["note"] === "string" && (
                <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3">
                  <dt className="text-muted-foreground">Note</dt>
                  <dd className="[overflow-wrap:anywhere]">{lead.answers["note"] as string}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      <NotesCard conversationId={row.conv.id} />

      {staff?.role === "owner" && (
        <>
          <Button
            variant="destructive-outline"
            className="w-full rounded-full"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-4" /> Delete conversation
          </Button>
          <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {row.name}&rsquo;s conversation?</AlertDialogTitle>
                <AlertDialogDescription>
                  Every message and request in it goes, for good. Archive it instead if you only
                  want it out of the way.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() =>
                    del.mutate(row.conv.id, {
                      onSuccess: () => {
                        toast.success("Conversation deleted");
                        onDeleted();
                      },
                      onError: (e) => toast.error(errorText(e)),
                    })
                  }
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}

function NotesCard({ conversationId }: { conversationId: string }) {
  const notes = useNotes(conversationId);
  const add = useAddNote();
  const [body, setBody] = useState("");
  return (
    <Card className="border-border/70 bg-surface shadow-level-1">
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="text-sm font-semibold">Private notes</p>
          <p className="text-xs text-muted-foreground">Only the team sees these.</p>
        </div>
        {(notes.data ?? []).map((n) => (
          <div key={n.id} className="rounded-xl bg-warning/10 px-3 py-2 text-sm">
            <p className="whitespace-pre-wrap">{n.body}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {n.author_name} · {dateTime(n.created_at)}
            </p>
          </div>
        ))}
        <Textarea
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="e.g. Called him, sending the proposal Friday"
          className="resize-none text-sm"
        />
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          disabled={!body.trim() || add.isPending}
          onClick={() =>
            add.mutate(
              { conversationId, body: body.trim() },
              { onSuccess: () => setBody(""), onError: (e) => toast.error(errorText(e)) },
            )
          }
        >
          Add note
        </Button>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------- dialogs

function QuickRepliesDialog({
  open,
  onOpenChange,
  replies,
  onPick,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  replies: QuickReply[];
  onPick: (body: string) => void;
}) {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Quick replies</DialogTitle>
          <DialogDescription>
            Pick one to drop it in the reply box. You can change it before sending.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {replies.map((q) => (
            <li key={q.id}>
              <button
                type="button"
                className="w-full rounded-xl border border-border/70 px-3.5 py-3 text-left transition hover:border-primary/50 hover:bg-secondary/50"
                onClick={() => {
                  onPick(q.body);
                  onOpenChange(false);
                }}
              >
                <p className="text-sm font-semibold">{q.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{q.body}</p>
              </button>
            </li>
          ))}
          {!replies.length && (
            <p className="text-sm text-muted-foreground">No quick replies yet.</p>
          )}
        </ul>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => void navigate({ to: "/admin/quick-replies" })}
        >
          Manage quick replies
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function tomorrowAt10() {
  const d = new Date(Date.now() + 24 * 3_600_000);
  const manila = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${manila.getFullYear()}-${pad(manila.getMonth() + 1)}-${pad(manila.getDate())}`,
    time: "10:00",
  };
}

function MeetingDialog({
  open,
  onOpenChange,
  conversationId,
  name,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  conversationId: string;
  name: string;
}) {
  const propose = useProposeMeeting();
  const init = tomorrowAt10();
  const [date, setDate] = useState(init.date);
  const [time, setTime] = useState(init.time);
  const [duration, setDuration] = useState("30");
  const [mode, setMode] = useState<Meeting["mode"]>("google_meet");
  const [link, setLink] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");

  const submit = () => {
    // The team types Manila time; +08:00 makes it the right instant anywhere.
    const startsAt = new Date(`${date}T${time}:00+08:00`).toISOString();
    propose.mutate(
      { conversationId, startsAt, duration: Number(duration), mode, link, location, note },
      {
        onSuccess: () => {
          toast.success(`Call sent to ${name || "them"} to confirm`);
          onOpenChange(false);
          setNote("");
        },
        onError: (e) => toast.error(errorText(e)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule a call</DialogTitle>
          <DialogDescription>
            It lands in the chat as a card. {name || "They"} can confirm it or ask for another time;
            confirming moves the lead to Call booked.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Date</span>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Time (Manila)</span>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-xl"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">How</span>
            <Select value={mode} onValueChange={(v) => setMode(v as Meeting["mode"])}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google_meet">Google Meet</SelectItem>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="phone">Phone call</SelectItem>
                <SelectItem value="in_person">In person</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Length</span>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["15", "30", "45", "60", "90"].map((d) => (
                  <SelectItem key={d} value={d}>
                    {d} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          {(mode === "google_meet" || mode === "zoom") && (
            <label className="col-span-2 space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Meeting link</span>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://meet.google.com/…"
                className="rounded-xl"
              />
            </label>
          )}
          {mode === "in_person" && (
            <label className="col-span-2 space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">Where</span>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Malaya Villas, Tagaytay"
                className="rounded-xl"
              />
            </label>
          )}
          <label className="col-span-2 space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Message with it (optional)
            </span>
            <Textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Let's walk through your numbers."
              className="resize-none rounded-xl"
            />
          </label>
        </div>
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-full"
            disabled={!date || !time || propose.isPending}
            onClick={submit}
          >
            Send to {name || "them"}
          </Button>
        </div>
        {propose.isError && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertTriangle className="size-3.5" /> {errorText(propose.error)}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ------------------------------------------------------- stage and glance

const PIPELINE: LeadStage[] = ["new", "talking", "call_booked", "proposal_sent", "won"];

/** Where this lead is, as a clickable row of steps. Lost sits apart at the end. */
function StageStepper({ lead }: { lead: Lead }) {
  const patch = usePatchLead();
  const at = PIPELINE.indexOf(lead.stage);
  const set = (stage: LeadStage) =>
    patch.mutate(
      { id: lead.id, patch: { stage, ...(stage !== "lost" ? { lost_reason: null } : {}) } },
      { onSuccess: () => toast.success(`Stage: ${stageLabel(stage)}`) },
    );
  return (
    <div className="-mt-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
      {PIPELINE.map((st, i) => {
        const done = lead.stage !== "lost" && i <= at;
        const current = st === lead.stage;
        return (
          <button
            key={st}
            type="button"
            onClick={() => set(st)}
            disabled={patch.isPending}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors",
              current
                ? "bg-primary font-semibold text-primary-foreground"
                : done
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {done && !current && <Check className="size-3" />}
            {stageLabel(st)}
          </button>
        );
      })}
      <span className="mx-1 h-4 w-px shrink-0 bg-border" />
      <button
        type="button"
        onClick={() => set("lost")}
        disabled={patch.isPending}
        className={cn(
          "shrink-0 rounded-full px-2.5 py-1 text-xs transition-colors",
          lead.stage === "lost"
            ? "bg-muted-foreground font-semibold text-background"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        )}
      >
        Lost
      </button>
    </div>
  );
}

const NEXT_STEP: Record<LeadStage, string> = {
  new: "Reply — they haven't heard from a person yet.",
  talking: "Book a call: + → Schedule a call.",
  call_booked: "After the call, send the proposal and move it to Proposal sent.",
  proposal_sent: "Follow up in a few days if they go quiet.",
  won: "Won. Keep the chat for the work ahead.",
  lost: "Closed. It reopens if they write again.",
};

/** The conversation in numbers, and the obvious next move. */
function AtAGlance({ row }: { row: Row }) {
  const inbox = useInbox(true);
  const msgs = (inbox.data?.messages ?? []).filter((m) => m.conversation_id === row.conv.id);
  const fromThem = msgs.filter((m) => m.author === "client" && m.kind === "message").length;
  const fromUs = msgs.filter((m) => m.author === "staff" && m.kind !== "auto").length;
  const stats = [
    { label: "First contact", value: shortDate(row.conv.created_at) },
    { label: "Requests", value: String(row.leads.length) },
    { label: "Their messages", value: String(fromThem) },
    { label: "Our replies", value: String(fromUs) },
  ];
  return (
    <Card className="border-border/70 bg-surface shadow-level-1">
      <CardContent className="space-y-3 p-4">
        <div className="grid grid-cols-4 gap-2 text-center">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-secondary/60 px-1 py-2">
              <p className="text-sm font-semibold tabular-nums">{s.value}</p>
              <p className="text-[10px] leading-tight text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        {row.lead && (
          <p className="flex items-start gap-2 rounded-xl bg-primary/5 px-3 py-2.5 text-sm">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              <span className="font-semibold">Next: </span>
              {row.waitingHours !== null
                ? `Reply — they've been waiting ${Math.max(1, Math.floor(row.waitingHours))}h.`
                : NEXT_STEP[row.lead.stage]}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
