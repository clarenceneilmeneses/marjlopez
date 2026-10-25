/**
 * Who answers. Two roles only — owner and assistant (PRD §4). Adding someone
 * is done by hand in Supabase for the demo; the invite screen is v1.5.
 */
import { createFileRoute } from "@tanstack/react-router";
import { Crown, UserRound } from "@/components/icons";
import { useMemo } from "react";

import { AppShell } from "@/components/admin/app-shell";
import { InlineLoading } from "@/components/loading";
import { Card, CardContent } from "@/components/ui/card";
import { initial } from "@/lib/format";
import { useAuth } from "@/state/auth";
import { useInbox, useStaffList } from "@/state/data";

export const Route = createFileRoute("/admin/team")({
  head: () => ({ meta: [{ title: "Team — Marj Lopez" }] }),
  component: TeamPage,
});

function TeamPage() {
  const { staff } = useAuth();
  const list = useStaffList(Boolean(staff));
  const inbox = useInbox(Boolean(staff));

  const load = useMemo(() => {
    const out = new Map<string, { open: number; waiting: number }>();
    for (const c of inbox.data?.conversations ?? []) {
      if (!c.assigned_to || c.archived) continue;
      const v = out.get(c.assigned_to) ?? { open: 0, waiting: 0 };
      v.open += 1;
      if (c.waiting_since) v.waiting += 1;
      out.set(c.assigned_to, v);
    }
    return out;
  }, [inbox.data]);

  return (
    <AppShell title="Team">
      <h1 className="font-display text-3xl font-semibold">Team</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        The people who answer inquiries, and how many each is handling.
      </p>
      {list.isLoading ? (
        <InlineLoading className="mt-6" />
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(list.data ?? []).map((s) => {
            const l = load.get(s.user_id) ?? { open: 0, waiting: 0 };
            return (
              <Card key={s.user_id} className="border-border/70 bg-surface shadow-level-1">
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary font-display text-lg font-semibold text-primary">
                    {initial(s.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate font-semibold">
                      {s.name}
                      {s.role === "owner" ? (
                        <Crown className="size-3.5 text-warning" />
                      ) : (
                        <UserRound className="size-3.5 text-muted-foreground" />
                      )}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground">{s.role}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-semibold tabular-nums">{l.open} open</p>
                    <p className={l.waiting ? "text-warning" : "text-muted-foreground"}>
                      {l.waiting} waiting
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
