/**
 * Team — who answers, and how each is doing, in the dashboard's look. Two
 * roles only (PRD §4). The top bar's filter applies: the request type narrows
 * every number, the date range decides what counts as won and how fast.
 * Clicking a person opens the Inbox filtered to their conversations.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock,
  Crown,
  MessagesSquare as InboxIcon,
  Trophy,
  UserRound,
  Users,
} from "@/components/icons";
import { useMemo } from "react";

import { AppShell } from "@/components/admin/app-shell";
import { BarList } from "@/components/admin/charts";
import { Empty, PageHeader, Panel, Stat, TODAY_LINE } from "@/components/admin/page";
import { InlineLoading } from "@/components/loading";
import { initial } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth";
import { useInbox, useLiveUpdates, useStaffList } from "@/state/data";
import { useFilters } from "@/state/filters";

export const Route = createFileRoute("/admin/team")({
  head: () => ({ meta: [{ title: "Team — Marj Lopez" }] }),
  component: TeamPage,
});

function hoursText(h: number | null) {
  if (h === null) return "—";
  if (h < 1) return `${Math.max(1, Math.round(h * 60))}m`;
  if (h < 48) return `${h < 10 ? h.toFixed(1) : Math.round(h)}h`;
  return `${Math.round(h / 24)}d`;
}

const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)]!;
};

function TeamPage() {
  const { staff } = useAuth();
  useLiveUpdates(Boolean(staff));
  const list = useStaffList(Boolean(staff));
  const inbox = useInbox(Boolean(staff));
  const f = useFilters();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const data = inbox.data;
    if (!data || !list.data) return null;
    const leadById = new Map(data.leads.map((l) => [l.id, l]));
    // Only the type part of the filter here: this page IS the per-person view.
    const typeOk = (t: string | undefined) => f.type === "all" || t === f.type;
    const convs = data.conversations.filter((c) =>
      typeOk(c.current_lead_id ? leadById.get(c.current_lead_id)?.type : undefined),
    );
    const firstReply = new Map<string, number[]>();
    const byConvStaff = new Map<string, { at: number; by: string | null }[]>();
    for (const m of data.messages) {
      if (m.author !== "staff" || m.kind === "auto") continue;
      const arr = byConvStaff.get(m.conversation_id) ?? [];
      arr.push({ at: Date.parse(m.sent_at), by: m.author_id });
      byConvStaff.set(m.conversation_id, arr);
    }
    for (const l of data.leads) {
      if (!l.conversation_id || !typeOk(l.type) || !f.inRange(l.created_at)) continue;
      const t0 = Date.parse(l.created_at);
      const first = (byConvStaff.get(l.conversation_id) ?? [])
        .filter((x) => x.at > t0)
        .sort((a, b) => a.at - b.at)[0];
      if (!first?.by) continue;
      const arr = firstReply.get(first.by) ?? [];
      arr.push((first.at - t0) / 3_600_000);
      firstReply.set(first.by, arr);
    }
    const people = list.data.map((p) => {
      const mine = convs.filter((c) => c.assigned_to === p.user_id);
      const won = data.leads.filter(
        (l) =>
          l.stage === "won" &&
          typeOk(l.type) &&
          f.inRange(l.created_at) &&
          mine.some((c) => c.id === l.conversation_id),
      ).length;
      return {
        p,
        open: mine.filter((c) => !c.archived).length,
        waiting: mine.filter((c) => !c.archived && c.waiting_since).length,
        won,
        reply: median(firstReply.get(p.user_id) ?? []),
        replies: firstReply.get(p.user_id)?.length ?? 0,
      };
    });
    const open = convs.filter((c) => !c.archived);
    return {
      people,
      open: open.length,
      unassigned: open.filter((c) => !c.assigned_to).length,
      teamReply: median([...firstReply.values()].flat()),
      wonTotal: people.reduce((n, x) => n + x.won, 0),
    };
  }, [inbox.data, list.data, f]);

  const openInboxFor = (who: string) => {
    f.setPerson(who);
    void navigate({ to: "/admin/inbox" });
  };

  return (
    <AppShell title="Team">
      <PageHeader
        eyebrow={TODAY_LINE()}
        title="Team"
        sub="The people who answer inquiries, and how each is doing."
      />

      {!stats ? (
        <InlineLoading className="mt-8" />
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              icon={Users}
              label="Team"
              value={String(stats.people.length)}
              foot={`${stats.people.filter((x) => x.p.role === "owner").length} owner · ${stats.people.filter((x) => x.p.role === "assistant").length} assistants`}
            />
            <Stat
              icon={InboxIcon}
              label="Open conversations"
              value={String(stats.open)}
              foot="Not archived"
            />
            <Stat
              icon={UserRound}
              label="Unassigned"
              value={String(stats.unassigned)}
              foot={stats.unassigned ? "Give these an owner" : "Everyone has one"}
              footTone={stats.unassigned ? "alert" : "quiet"}
            />
            <Stat
              icon={Clock}
              label="Team first reply"
              value={hoursText(stats.teamReply)}
              foot={`Median · ${f.range.label}`}
            />
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <Panel
              className="lg:col-span-2"
              title="People"
              aside={`Won and reply time · ${f.range.label}`}
            >
              <div className="-mx-2">
                <div className="hidden grid-cols-[minmax(0,1fr)_repeat(4,4.5rem)_1.25rem] gap-2 px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
                  <span>Person</span>
                  <span className="text-right">Open</span>
                  <span className="text-right">Waiting</span>
                  <span className="text-right">Won</span>
                  <span className="text-right">1st reply</span>
                  <span />
                </div>
                <ul className="space-y-0.5">
                  {stats.people.map(({ p, open, waiting, won, reply }) => (
                    <li key={p.user_id}>
                      <button
                        type="button"
                        onClick={() => openInboxFor(p.user_id)}
                        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-secondary sm:grid-cols-[minmax(0,1fr)_repeat(4,4.5rem)_1.25rem]"
                        title={`Open ${p.name.split(" ")[0]}'s conversations`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary font-display text-base font-semibold text-primary">
                            {initial(p.name)}
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5 truncate text-sm font-semibold">
                              {p.name}
                              {p.role === "owner" && (
                                <Crown className="size-3.5 shrink-0 text-warning" />
                              )}
                            </span>
                            <span className="block text-xs capitalize text-muted-foreground">
                              {p.role}
                              <span className="sm:hidden">
                                {" "}
                                · {open} open · {waiting} waiting · {won} won
                              </span>
                            </span>
                          </span>
                        </span>
                        <span className="hidden text-right text-sm font-semibold tabular-nums sm:block">
                          {open}
                        </span>
                        <span
                          className={cn(
                            "hidden text-right text-sm tabular-nums sm:block",
                            waiting ? "font-semibold text-warning" : "text-muted-foreground",
                          )}
                        >
                          {waiting}
                        </span>
                        <span className="hidden text-right text-sm tabular-nums sm:block">
                          {won}
                        </span>
                        <span className="hidden text-right text-sm tabular-nums sm:block">
                          {hoursText(reply)}
                        </span>
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>
            <Panel title="Workload" aside="Open conversations">
              <BarList
                rows={[
                  ...stats.people.map(({ p, open }) => ({
                    key: p.user_id,
                    label: p.name,
                    value: open,
                  })),
                  { key: "unassigned", label: "Unassigned", value: stats.unassigned, muted: true },
                ]}
              />
            </Panel>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            <Panel title="Won" aside={f.range.label}>
              {stats.wonTotal === 0 ? (
                <Empty>Nothing won in this range yet.</Empty>
              ) : (
                <BarList
                  rows={stats.people
                    .filter((x) => x.won > 0)
                    .map(({ p, won }) => ({
                      key: p.user_id,
                      label: p.name,
                      value: won,
                      icon: <Trophy className="size-4 text-warning" />,
                    }))}
                />
              )}
            </Panel>
            <Panel className="lg:col-span-2" title="Adding someone">
              <p className="text-sm text-muted-foreground">
                For the demo, a team member is added in Supabase: create their login, then add them
                to the <code className="rounded bg-secondary px-1">staff</code> table as{" "}
                <em>owner</em> or <em>assistant</em>. Inviting from this page comes with v1.5.
              </p>
            </Panel>
          </div>
        </>
      )}
    </AppShell>
  );
}
