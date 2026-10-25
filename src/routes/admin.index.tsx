/**
 * Dashboard — the team's home (Clarence, 2026-10-25: "stat cards, quick
 * features and recent cards … and charts all clean"). Everything is worked
 * out from what the Inbox already loads; nothing here is stored separately.
 *
 *   greeting + quick actions   (Copy inquiry link is the one Marj will use
 *                               most: it is what goes in his bio)
 *   four stat cards            new this week · waiting on you · first reply
 *                               · calls coming up
 *   charts                     inquiries over 30 days · pipeline · sources
 *                               · what they want
 *   recent                     latest inquiries · upcoming calls
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Copy,
  ExternalLink,
  Flame,
  MessageSquareText,
  MessagesSquare,
  Send,
  type LucideIcon,
} from "@/components/icons";
import { useMemo, type ReactNode } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/admin/app-shell";
import { BarList, ColumnChart, type Column } from "@/components/admin/charts";
import { Empty, Panel, Stat } from "@/components/admin/page";
import { meetingModeLabel } from "@/components/chat/thread";
import { InlineLoading } from "@/components/loading";
import { PlatformLogo, type Platform } from "@/components/site/logos";
import { Card, CardContent } from "@/components/ui/card";
import { ago, firstName } from "@/lib/format";
import {
  leadSummary,
  SOURCES,
  STAGES,
  stageLabel,
  stageTone,
  TYPE_ORDER,
  TYPES,
} from "@/lib/inquiry";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth";
import { useInbox, useLiveUpdates, type InboxData } from "@/state/data";
import { useFilters } from "@/state/filters";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Marj Lopez" }] }),
  component: Dashboard,
});

const DAY = 86_400_000;
const TZ = "Asia/Manila";

function greeting() {
  const h = Number(
    new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: TZ }),
  );
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/** Social sources get their platform mark; the rest a dot. */
const SOURCE_LOGO: Partial<Record<string, Platform>> = {
  facebook: "facebook",
  instagram: "instagram",
  tiktok: "tiktok",
};

function useStats(data: InboxData | undefined) {
  const f = useFilters();
  return useMemo(() => {
    if (!data) return null;
    const now = Date.now();
    const convById = new Map(data.conversations.map((c) => [c.id, c]));
    const assignee = (convId: string | null) =>
      convId ? (convById.get(convId)?.assigned_to ?? null) : null;

    // WHICH (type, person) applies to everything; WHEN to what happened in the range.
    const leads = data.leads.filter((l) => f.passes(l.type, assignee(l.conversation_id)));
    const inRange = leads.filter((l) => f.inRange(l.created_at));
    const span = f.range.to - f.range.from;
    const before = leads.filter((l) => {
      const t = Date.parse(l.created_at);
      return t >= f.range.from - span && t < f.range.from;
    }).length;

    const currentLead = new Map(data.leads.map((l) => [l.id, l]));
    const waiting = data.conversations
      .filter((c) => !c.archived && c.waiting_since)
      .map((c) => ({ c, lead: c.current_lead_id ? currentLead.get(c.current_lead_id) : undefined }))
      .filter(({ c, lead }) => f.passes(lead?.type, c.assigned_to))
      .sort((a, b) => {
        const hot = Number(Boolean(b.lead?.hot)) - Number(Boolean(a.lead?.hot));
        return hot || Date.parse(a.c.waiting_since!) - Date.parse(b.c.waiting_since!);
      });

    // First reply: from the request to the first real (not automatic) team message after it.
    const staffByConv = new Map<string, number[]>();
    for (const m of data.messages) {
      if (m.author !== "staff" || m.kind === "auto") continue;
      const list = staffByConv.get(m.conversation_id) ?? [];
      list.push(Date.parse(m.sent_at));
      staffByConv.set(m.conversation_id, list);
    }
    const replyHours: number[] = [];
    for (const l of inRange) {
      if (!l.conversation_id) continue;
      const t0 = Date.parse(l.created_at);
      const after = (staffByConv.get(l.conversation_id) ?? []).filter((t) => t > t0);
      if (after.length) replyHours.push((Math.min(...after) - t0) / 3_600_000);
    }
    replyHours.sort((a, b) => a - b);
    const median = replyHours.length ? replyHours[Math.floor(replyHours.length / 2)]! : null;

    const upcoming = data.meetings
      .filter(
        (m) =>
          (m.status === "confirmed" || m.status === "proposed") && Date.parse(m.starts_at) > now,
      )
      .filter((m) => {
        const c = convById.get(m.conversation_id);
        const lead = c?.current_lead_id ? currentLead.get(c.current_lead_id) : undefined;
        return f.passes(lead?.type, c?.assigned_to ?? null);
      })
      .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at));

    // The chart: a bar per day up to three months, a bar per week beyond.
    const end = Math.min(f.range.to, now + DAY);
    const firstLead = Math.min(...leads.map((l) => Date.parse(l.created_at)), end - 30 * DAY);
    const start = Math.max(f.range.from, f.preset === "all" ? firstLead : f.range.from);
    const step = end - start > 92 * DAY ? 7 * DAY : DAY;
    const cols: Column[] = [];
    for (let t = start; t < end; t += step) {
      const n = inRange.filter((l) => {
        const x = Date.parse(l.created_at);
        return x >= t && x < t + step;
      }).length;
      const d = new Date(t);
      const short = d.toLocaleDateString("en-PH", { month: "short", day: "numeric", timeZone: TZ });
      cols.push({
        key: String(t),
        label: short,
        hint:
          step === DAY
            ? d.toLocaleDateString("en-PH", {
                weekday: "short",
                month: "short",
                day: "numeric",
                timeZone: TZ,
              })
            : `Week of ${short}`,
        value: n,
      });
    }

    const bySource = new Map<string, number>();
    for (const l of inRange)
      bySource.set(l.source ?? "other", (bySource.get(l.source ?? "other") ?? 0) + 1);
    const byType = new Map<string, number>();
    for (const l of inRange) byType.set(l.type, (byType.get(l.type) ?? 0) + 1);

    return {
      count: inRange.length,
      before,
      waiting,
      hotWaiting: waiting.filter((w) => w.lead?.hot).length,
      median,
      replies: replyHours.length,
      upcoming,
      confirmedUpcoming: upcoming.filter((m) => m.status === "confirmed").length,
      won: inRange.filter((l) => l.stage === "won").length,
      days: cols,
      tickEvery: Math.max(1, Math.ceil(cols.length / 5)),
      latest: leads.slice(0, 6),
      stages: STAGES.map((s) => ({
        key: s.value,
        label: s.label,
        value: inRange.filter((l) => l.stage === s.value).length,
        muted: s.value === "lost",
      })),
      sources: [...bySource.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => ({ key: k, value: v })),
      types: TYPE_ORDER.map((t) => ({ key: t, value: byType.get(t) ?? 0 })),
    };
  }, [data, f]);
}

function hoursText(h: number | null) {
  if (h === null) return "—";
  if (h < 1) return `${Math.max(1, Math.round(h * 60))}m`;
  if (h < 48) return `${h < 10 ? h.toFixed(1) : Math.round(h)}h`;
  return `${Math.round(h / 24)}d`;
}

function Dashboard() {
  const { staff } = useAuth();
  useLiveUpdates(Boolean(staff));
  const inbox = useInbox(Boolean(staff));
  const f = useFilters();
  const s = useStats(inbox.data);
  const byConv = useMemo(
    () => new Map((inbox.data?.conversations ?? []).map((c) => [c.id, c])),
    [inbox.data?.conversations],
  );
  const unread = inbox.data?.conversations.filter((c) => c.unread && !c.archived).length ?? 0;

  const copyLink = () => {
    const url = `${window.location.origin}/inquire`;
    void navigator.clipboard?.writeText(url).then(
      () => toast.success("Inquiry link copied", { description: url }),
      () => toast.error("Couldn't copy — the link is " + url),
    );
  };

  return (
    <AppShell title="Dashboard">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-PH", {
              weekday: "long",
              month: "long",
              day: "numeric",
              timeZone: TZ,
            })}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {greeting()}, {firstName(staff?.name)}
          </h1>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <QuickAction
          to="/admin/inbox"
          icon={MessagesSquare}
          title="Open the inbox"
          sub={unread ? `${unread} unread` : "All caught up"}
        />
        <QuickAction
          onClick={copyLink}
          icon={Copy}
          title="Copy inquiry link"
          sub="For the bio and posts"
        />
        <QuickAction
          to="/admin/quick-replies"
          icon={MessageSquareText}
          title="Quick replies"
          sub="Saved answers"
        />
        <QuickAction href="/" icon={ExternalLink} title="View the site" sub="What visitors see" />
      </div>

      {!s ? (
        <InlineLoading className="mt-8" label="Loading the numbers…" />
      ) : (
        <>
          {/* Stat cards */}
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              icon={Send}
              label="New inquiries"
              value={String(s.count)}
              foot={
                s.before === s.count
                  ? "Same as the period before"
                  : `${s.count > s.before ? "+" : "−"}${Math.abs(s.count - s.before)} vs the period before`
              }
              footTone={s.count >= s.before ? "up" : "down"}
            />
            <Stat
              icon={Flame}
              label="Waiting on you"
              value={String(s.waiting.length)}
              foot={s.hotWaiting ? `${s.hotWaiting} hot` : "None hot"}
              footTone={s.hotWaiting ? "alert" : "quiet"}
            />
            <Stat
              icon={Clock}
              label="First reply"
              value={hoursText(s.median)}
              foot={s.replies ? `Median of ${s.replies} in range` : "No replies in range"}
              footTone="quiet"
            />
            <Stat
              icon={CalendarCheck}
              label="Calls coming up"
              value={String(s.upcoming.length)}
              foot={`${s.confirmedUpcoming} confirmed · ${s.won} won in range`}
              footTone="quiet"
            />
          </div>

          {/* Inquiries over time + waiting */}
          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            <Panel
              className="lg:col-span-2"
              title="Inquiries"
              aside={`${s.count} · ${f.range.label}`}
            >
              <ColumnChart data={s.days} tickEvery={s.tickEvery} />
            </Panel>
            <Panel title="Waiting on you" aside="Hot first">
              {s.waiting.length === 0 ? (
                <Empty>Nobody is waiting. Nice.</Empty>
              ) : (
                <ul className="-mx-2 space-y-0.5">
                  {s.waiting.slice(0, 5).map(({ c, lead }) => (
                    <li key={c.id}>
                      <Link
                        to="/admin/inbox"
                        search={{ c: c.id }}
                        className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-secondary"
                      >
                        <TypeAvatar type={lead?.type} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 text-sm font-semibold">
                            <span className="truncate">{c.profile?.full_name}</span>
                            {lead?.hot && <Flame className="size-3.5 shrink-0 text-destructive" />}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {lead ? leadSummary(lead.type, lead.answers) : "—"}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-warning">
                          {ago(c.waiting_since!)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          {/* Pipeline · sources · types */}
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <Panel title="Pipeline" aside={f.range.label}>
              <BarList rows={s.stages} />
            </Panel>
            <Panel title="Where they found Marj" aside={f.range.label}>
              {s.sources.length === 0 ? (
                <Empty>No inquiries yet.</Empty>
              ) : (
                <BarList
                  rows={s.sources.map((r) => {
                    const logo = SOURCE_LOGO[r.key];
                    return {
                      key: r.key,
                      value: r.value,
                      label: SOURCES.find((x) => x.value === r.key)?.label ?? r.key,
                      icon: logo ? (
                        <PlatformLogo platform={logo} className="size-4" />
                      ) : (
                        <span className="size-2 rounded-full bg-muted-foreground/50" />
                      ),
                    };
                  })}
                />
              )}
            </Panel>
            <Panel title="What they want" aside={f.range.label}>
              <BarList
                rows={s.types.map((r) => {
                  const Icon = TYPES[r.key].icon;
                  return {
                    key: r.key,
                    value: r.value,
                    label: TYPES[r.key].label,
                    icon: <Icon className="size-4 text-primary" />,
                  };
                })}
              />
            </Panel>
          </div>

          {/* Recent */}
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <Panel
              className="lg:col-span-2"
              title="Latest inquiries"
              aside={
                <Link
                  to="/admin/inbox"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Inbox <ArrowRight className="size-3.5" />
                </Link>
              }
            >
              <ul className="-mx-2 space-y-0.5">
                {s.latest.map((l) => {
                  const c = l.conversation_id ? byConv.get(l.conversation_id) : undefined;
                  return (
                    <li key={l.id}>
                      <Link
                        to="/admin/inbox"
                        search={l.conversation_id ? { c: l.conversation_id } : {}}
                        className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-secondary"
                      >
                        <TypeAvatar type={l.type} />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 text-sm">
                            <span className="truncate font-semibold">
                              {c?.profile?.full_name ?? "—"}
                            </span>
                            {l.hot && <Flame className="size-3.5 shrink-0 text-destructive" />}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {leadSummary(l.type, l.answers)}
                          </span>
                        </span>
                        <span className="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                          <span className={cn("size-1.5 rounded-full", stageTone(l.stage))} />
                          {stageLabel(l.stage)}
                        </span>
                        <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
                          {ago(l.created_at)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Panel>
            <Panel title="Upcoming calls" aside={`${s.upcoming.length}`}>
              {s.upcoming.length === 0 ? (
                <Empty>No calls lined up. Schedule one from a conversation.</Empty>
              ) : (
                <ul className="-mx-2 space-y-0.5">
                  {s.upcoming.slice(0, 5).map((m) => {
                    const c = byConv.get(m.conversation_id);
                    const d = new Date(m.starts_at);
                    return (
                      <li key={m.id}>
                        <Link
                          to="/admin/inbox"
                          search={{ c: m.conversation_id }}
                          className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-secondary"
                        >
                          <span className="grid w-11 shrink-0 place-items-center rounded-xl bg-secondary py-1.5 text-center leading-none">
                            <span className="text-[10px] font-semibold uppercase text-primary">
                              {d.toLocaleDateString("en-PH", { month: "short", timeZone: TZ })}
                            </span>
                            <span className="mt-0.5 text-lg font-semibold tabular-nums">
                              {d.toLocaleDateString("en-PH", { day: "numeric", timeZone: TZ })}
                            </span>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">
                              {c?.profile?.full_name}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {d.toLocaleTimeString("en-PH", {
                                hour: "numeric",
                                minute: "2-digit",
                                timeZone: TZ,
                              })}{" "}
                              · {meetingModeLabel(m.mode)}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              m.status === "confirmed"
                                ? "bg-success/15 text-success"
                                : "bg-primary/10 text-primary",
                            )}
                          >
                            {m.status === "confirmed" ? "Confirmed" : "Waiting"}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </div>
        </>
      )}
    </AppShell>
  );
}

// ----------------------------------------------------------------- pieces

function QuickAction({
  icon: Icon,
  title,
  sub,
  to,
  href,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  sub: string;
  to?: "/admin/inbox" | "/admin/quick-replies";
  href?: string;
  onClick?: () => void;
}) {
  const body = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-[18px]" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold sm:truncate">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{sub}</span>
      </span>
    </>
  );
  const cls =
    "group flex flex-col items-start gap-2.5 rounded-2xl bg-card p-3.5 text-left shadow-level-1 sm:flex-row sm:items-center sm:gap-3 transition hover:-translate-y-0.5 hover:shadow-level-2";
  if (to)
    return (
      <Link to={to} className={cls}>
        {body}
      </Link>
    );
  if (href)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {body}
      </a>
    );
  return (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  );
}

function TypeAvatar({ type }: { type: keyof typeof TYPES | undefined }) {
  const Icon = type ? TYPES[type].icon : Send;
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
      <Icon className="size-4" />
    </span>
  );
}
