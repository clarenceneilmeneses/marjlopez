/**
 * The client's bell (Clarence, 2026-10-26: "add a notif too for users") — the
 * admin's NotificationBell (components/admin/notifications.tsx), pointed at
 * the one conversation a client has: replies, calls proposed or booked, and
 * the thank-you for a request. New means after they last read the chat or
 * last opened the bell, whichever is later. Something new while they're
 * elsewhere on the site pops a toast; on Messages the chat shows it already.
 */
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, CalendarCheck, MailCheck, MessageCircle } from "@/components/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { clientEvents, type ClientEvent } from "@/lib/client-events";
import { ago } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth";
import { useLiveUpdates, useMine, useThread } from "@/state/data";

const ICON = { reply: MessageCircle, call: CalendarCheck, received: MailCheck } as const;

const seenKey = (uid: string) => `marj:client-bell-seen:${uid}`;

function readSeen(uid: string): number {
  try {
    return Number(localStorage.getItem(seenKey(uid))) || 0;
  } catch {
    return 0;
  }
}

export function ClientBell({ className }: { className?: string }) {
  const { session, staff } = useAuth();
  const uid = session?.user.id;
  const client = Boolean(uid) && !staff;
  useLiveUpdates(client);
  const mine = useMine(client);
  const conv = mine.data?.conversation ?? null;
  const thread = useThread(conv?.id, 20_000);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(0);
  useEffect(() => {
    if (uid) setOpened(readSeen(uid));
  }, [uid]);

  const events = useMemo(() => (thread.data ? clientEvents(thread.data) : []), [thread.data]);
  const seen = Math.max(opened, Date.parse(conv?.client_seen_at ?? "") || 0);
  const isNew = (e: ClientEvent) => Date.parse(e.at) > seen;
  const unread = events.filter(isNew).length;

  // A toast for what lands while they browse — not the backlog the first
  // load brings in, and not on Messages, where it's right there in the chat.
  const newest = useRef<string | null>(null);
  useEffect(() => {
    const top = events[0];
    if (!top) return;
    if (
      newest.current &&
      newest.current !== top.id &&
      !pathname.startsWith("/messages") &&
      Date.parse(top.at) > Date.now() - 5 * 60_000
    ) {
      toast(top.title, {
        description: top.text,
        action: {
          label: "Open",
          onClick: () => void navigate({ to: "/messages", search: { sent: 1 } }),
        },
      });
    }
    newest.current = top.id;
  }, [events, navigate, pathname]);

  if (!client || !conv) return null;

  const onOpenChange = (o: boolean) => {
    setOpen(o);
    if (o && uid) {
      const now = Date.now();
      try {
        localStorage.setItem(seenKey(uid), String(now));
      } catch {
        /* the badge just won't remember */
      }
      // Keep the dots for this look; clear them next time.
      window.setTimeout(() => setOpened(now), 4000);
    }
  };

  const go = () => {
    setOpen(false);
    // `sent` opens the chat itself on a phone, not the list of requests.
    void navigate({ to: "/messages", search: { sent: 1 } });
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={unread ? `Notifications, ${unread} new` : "Notifications"}
          className={cn(
            "relative grid size-10 place-items-center rounded-full border-2 border-card bg-card text-foreground/75 shadow-level-2 transition hover:text-primary",
            className,
          )}
        >
          <Bell className="size-[18px]" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground ring-2 ring-card">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        collisionPadding={12}
        className="w-[calc(100vw-1.5rem)] max-w-sm p-0 sm:w-96"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && <span className="text-xs text-muted-foreground">{unread} new</span>}
        </div>
        <ul className="max-h-[70vh] overflow-y-auto p-1.5">
          {events.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              Nothing yet — the team&apos;s replies show up here.
            </li>
          )}
          {events.map((e) => {
            const Icon = ICON[e.kind];
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={go}
                  className="flex w-full gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-secondary"
                >
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full",
                      e.kind === "call"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-foreground/70",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{e.title}</span>
                    <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {e.text}
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      {ago(e.at)}
                      {e.needsAnswer && (
                        <span className="rounded-full bg-warning/15 px-2 py-0.5 font-medium text-foreground">
                          Needs your answer
                        </span>
                      )}
                    </span>
                  </span>
                  {isNew(e) && (
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                      aria-label="New"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
