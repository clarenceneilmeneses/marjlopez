/**
 * The bell. New inquiries, client messages and answers to calls, newest
 * first; the count is what arrived since you last opened it (kept per
 * browser). Something new while you're in the admin also pops a toast.
 */
import { useNavigate } from "@tanstack/react-router";
import { Bell, CalendarCheck, Flame, MessageCircle, Send } from "@/components/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { adminEvents, type AdminEvent } from "@/lib/admin-events";
import { ago, firstName } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth";
import { useInbox } from "@/state/data";

const SEEN_KEY = "marj:bell-seen";

const ICON = { inquiry: Send, message: MessageCircle, call: CalendarCheck } as const;
const VERB = {
  inquiry: "sent a new request",
  message: "wrote",
  call: "answered your call",
} as const;

function readSeen(): number {
  try {
    return Number(localStorage.getItem(SEEN_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function NotificationBell({ className }: { className?: string }) {
  const { staff } = useAuth();
  const inbox = useInbox(Boolean(staff));
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(0);
  useEffect(() => setSeen(readSeen()), []);

  const events = useMemo(() => (inbox.data ? adminEvents(inbox.data) : []), [inbox.data]);
  const unread = events.filter((e) => Date.parse(e.at) > seen).length;

  // A toast for anything that lands while the admin is open — not for the
  // backlog the first load brings in.
  const newest = useRef<string | null>(null);
  useEffect(() => {
    const top = events[0];
    if (!top) return;
    if (
      newest.current &&
      newest.current !== top.id &&
      Date.parse(top.at) > Date.now() - 5 * 60_000
    ) {
      toast(`${firstName(top.name)} ${VERB[top.kind]}`, {
        description: top.text,
        action: {
          label: "Open",
          onClick: () => void navigate({ to: "/admin/inbox", search: { c: top.conversationId } }),
        },
      });
    }
    newest.current = top.id;
  }, [events, navigate]);

  const onOpenChange = (o: boolean) => {
    setOpen(o);
    if (o) {
      const now = Date.now();
      try {
        localStorage.setItem(SEEN_KEY, String(now));
      } catch {
        /* the badge just won't remember */
      }
      // Keep the dots for this look; clear them next time.
      window.setTimeout(() => setSeen(now), 4000);
    }
  };

  const go = (e: AdminEvent) => {
    setOpen(false);
    void navigate({ to: "/admin/inbox", search: { c: e.conversationId } });
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={unread ? `Notifications, ${unread} new` : "Notifications"}
          className={cn(
            "relative grid size-10 place-items-center rounded-full text-foreground/75 transition hover:bg-secondary hover:text-foreground",
            className,
          )}
        >
          <Bell className="size-[18px]" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
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
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">Nothing yet.</li>
          )}
          {events.map((e) => {
            const Icon = ICON[e.kind];
            const isNew = Date.parse(e.at) > seen;
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => go(e)}
                  className="flex w-full gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-secondary"
                >
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full",
                      e.kind === "inquiry"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-foreground/70",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm">
                      <span className="truncate">
                        <span className="font-semibold">{e.name}</span>{" "}
                        <span className="text-muted-foreground">{VERB[e.kind]}</span>
                      </span>
                      {e.hot && (
                        <Flame className="size-3.5 shrink-0 text-destructive" aria-label="Hot" />
                      )}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                      {e.text}
                    </span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {ago(e.at)}
                    </span>
                  </span>
                  {isNew && (
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
