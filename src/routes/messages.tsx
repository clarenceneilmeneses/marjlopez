/**
 * The client's Messages — PRD §8. Malaya's guest Messages, with requests where
 * the stays were.
 *
 * ONE conversation per person (the database enforces it), so this is not a
 * list of threads: the left column is the person's REQUESTS, and picking one
 * changes what sits beside the chat, never which chat it is.
 *
 * A real messaging app: exactly the window tall, only the panes scroll. On a
 * phone, the list first, and the chat opens full screen over it with a back
 * arrow — no site header, no nav pill, only the chat.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarCheck, MessageCircle, Plus } from "@/components/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Composer } from "@/components/chat/composer";
import {
  groupReactions,
  MeetingCard,
  MessageThread,
  RequestCard,
  type MessageActions,
} from "@/components/chat/thread";
import { InlineLoading } from "@/components/loading";
import { AuthPanel } from "@/components/site/auth-panel";
import { PublicHeader } from "@/components/site/chrome";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { firstName, shortDate } from "@/lib/format";
import { leadSummary, stageLabel, stageTone, TYPES } from "@/lib/inquiry";
import type { Lead, Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth";
import {
  errorText,
  uploadMedia,
  useEditMessage,
  useLiveUpdates,
  useMarkSeen,
  useMine,
  useReact,
  useRespondMeeting,
  useSendMessage,
  useThread,
  useUnsendMessage,
} from "@/state/data";

export const Route = createFileRoute("/messages")({
  validateSearch: (s: Record<string, unknown>): { sent?: number } => (s["sent"] ? { sent: 1 } : {}),
  head: () => ({ meta: [{ title: `Messages — ${BRAND.name}` }] }),
  component: MessagesPage,
});

function MessagesPage() {
  const { session, staff, ready } = useAuth();
  const client = Boolean(session) && !staff;
  useLiveUpdates(client);
  const mine = useMine(client);

  if (!ready || (client && mine.isLoading)) {
    return (
      <Frame>
        <InlineLoading className="p-8" />
      </Frame>
    );
  }

  if (!session) {
    return (
      <Frame>
        <div className="mx-auto max-w-sm px-4 py-12">
          <h1 className="site-display text-3xl text-brand-heading">Your messages</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to see your conversation with {BRAND.team}.
          </p>
          <AuthPanel className="mt-6 rounded-3xl bg-card p-5 shadow-level-1" defaultMode="signin" />
          <p className="mt-6 text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/inquire" className="font-semibold text-primary underline underline-offset-2">
              Tell us what you need
            </Link>
          </p>
        </div>
      </Frame>
    );
  }

  if (staff) {
    return (
      <Frame>
        <div className="mx-auto max-w-md px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">You&apos;re signed in as the team.</p>
          <Button asChild className="mt-4 rounded-full">
            <Link to="/admin/inbox">Open the team inbox</Link>
          </Button>
        </div>
      </Frame>
    );
  }

  const conv = mine.data?.conversation;
  if (!conv) {
    return (
      <Frame>
        <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-secondary text-primary">
            <MessageCircle className="size-7" />
          </span>
          <h1 className="brand-caps mt-5 text-2xl text-primary">No messages yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us what you need — starting, building or running an Airbnb — and {BRAND.team}{" "}
            replies right here.
          </p>
          <Button asChild className="brand-caps mt-6 h-11 rounded-full px-6 text-[15px]">
            <Link to="/inquire">Work with me</Link>
          </Button>
        </div>
      </Frame>
    );
  }

  return (
    <Inbox
      conversationId={conv.id}
      leads={mine.data?.leads ?? []}
      currentLeadId={conv.current_lead_id}
    />
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      {children}
    </div>
  );
}

function Inbox({
  conversationId,
  leads,
  currentLeadId,
}: {
  conversationId: string;
  leads: Lead[];
  currentLeadId: string | null;
}) {
  const { session, profile } = useAuth();
  const search = Route.useSearch();
  const thread = useThread(conversationId, 20_000);
  const send = useSendMessage();
  const edit = useEditMessage();
  const unsend = useUnsendMessage();
  const react = useReact();
  const respond = useRespondMeeting();
  const markSeen = useMarkSeen();

  const [leadId, setLeadId] = useState<string | null>(currentLeadId ?? leads[0]?.id ?? null);
  const lead = leads.find((l) => l.id === leadId) ?? leads[0] ?? null;
  // On a phone: the list, or the chat. A fresh inquiry lands in the chat.
  const [chatOnPhone, setChatOnPhone] = useState(Boolean(search.sent));
  const [draft, setDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [attaching, setAttaching] = useState(0);

  const lastId = thread.data?.messages.at(-1)?.id;
  useEffect(() => {
    if (lastId) markSeen.mutate(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, lastId]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread.data?.messages.length, chatOnPhone]);

  const leadsById = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads]);
  const reactions = useMemo(
    () => groupReactions(thread.data?.reactions ?? [], session?.user.id),
    [thread.data?.reactions, session?.user.id],
  );
  const meetings = thread.data?.meetings ?? new Map();
  const nextCall = [...meetings.values()]
    .filter((m) => m.status === "confirmed" && Date.parse(m.starts_at) > Date.now())
    .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at))[0];
  const lastStaff = [...(thread.data?.messages ?? [])]
    .reverse()
    .find((m) => m.author === "staff" && m.kind !== "auto");

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
      await send.mutateAsync({ conversationId, body, replyToId: replyingTo?.id ?? null });
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
        const media = await uploadMedia(conversationId, f);
        await send.mutateAsync({ conversationId, body: "", media });
        setAttaching((n) => n - 1);
      }
    } catch (e) {
      toast.error(errorText(e, "Couldn't send that file."));
    } finally {
      setAttaching(0);
    }
  };

  const list = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <p className="brand-caps text-xl text-primary">Your requests</p>
        <Button asChild size="sm" variant="outline" className="rounded-full">
          <Link to="/inquire">
            <Plus className="size-4" /> New request
          </Link>
        </Button>
      </div>
      <ul className="flex flex-col gap-1 overflow-y-auto px-2 pb-4">
        {leads.map((l) => {
          const Icon = TYPES[l.type].icon;
          const on = l.id === lead?.id;
          return (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => {
                  setLeadId(l.id);
                  setChatOnPhone(true);
                }}
                className={cn(
                  "flex w-full gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                  on ? "bg-secondary" : "hover:bg-secondary/60",
                )}
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{TYPES[l.type].label}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {shortDate(l.created_at)}
                    </span>
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={cn("size-1.5 rounded-full", stageTone(l.stage))} />
                    <span className="truncate">
                      <span className="font-medium text-foreground">
                        {stageLabel(l.stage, "client")}
                      </span>{" "}
                      · {leadSummary(l.type, l.answers)}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {nextCall && (
        <div className="mx-3 mb-4 rounded-2xl bg-success/10 px-4 py-3 text-sm">
          <p className="flex items-center gap-1.5 font-semibold text-success">
            <CalendarCheck className="size-4" /> Your call is booked
          </p>
          <p className="mt-0.5 text-foreground">
            {new Date(nextCall.starts_at).toLocaleString("en-PH", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
              timeZone: "Asia/Manila",
            })}
          </p>
        </div>
      )}
    </div>
  );

  const detail = lead ? (
    <div className="space-y-3 p-4">
      <p className="brand-caps text-lg text-primary">The request</p>
      <RequestCard lead={lead} viewer="client" />
      {nextCall && <MeetingCard meeting={nextCall} viewer="client" />}
      <p className="px-1 text-xs text-muted-foreground">
        Want to add something? Just write it in the chat — it&apos;s the same conversation for
        everything you ask.
      </p>
    </div>
  ) : null;

  return (
    <div className="flex h-dvh flex-col bg-background">
      <div className={cn(chatOnPhone && "hidden md:block")}>
        <PublicHeader />
      </div>
      <div className="mx-auto grid min-h-0 w-full max-w-[1500px] flex-1 grid-cols-1 gap-3 px-0 md:grid-cols-[300px_minmax(0,1fr)] md:px-4 md:pb-4 md:pt-3 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
        <section
          className={cn(
            "min-h-0 overflow-hidden pb-24 md:rounded-2xl md:border md:border-border/70 md:bg-card md:pb-0 md:shadow-level-1",
            chatOnPhone && "hidden md:block",
          )}
        >
          {list}
        </section>

        <section
          className={cn(
            "flex min-h-0 flex-col bg-card md:rounded-2xl md:border md:border-border/70 md:shadow-level-1",
            chatOnPhone ? "fixed inset-0 z-50 md:static" : "hidden md:flex",
          )}
        >
          <div className="flex items-center gap-3 border-b border-border/60 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-5 md:pt-3">
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 md:hidden"
              aria-label="Back"
              onClick={() => setChatOnPhone(false)}
            >
              <ArrowLeft className="size-5" />
            </Button>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary font-display text-sm text-primary-foreground">
              M
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold leading-tight">{BRAND.team}</p>
              <p className="truncate text-xs text-muted-foreground">
                {lastStaff
                  ? `${firstName(lastStaff.author_name)} replied ${shortDate(lastStaff.sent_at)}`
                  : "Usually replies within a day"}
              </p>
            </div>
          </div>
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-4 md:px-5">
            {thread.isLoading ? (
              <InlineLoading />
            ) : (
              <MessageThread
                viewer="client"
                messages={thread.data?.messages ?? []}
                leads={leadsById}
                meetings={meetings}
                actions={actions}
                reactions={reactions}
                onReact={(id, emoji) => {
                  const current = reactions.get(id)?.find((r) => r.mine)?.emoji;
                  react.mutate({ messageId: id, emoji, ...(current ? { current } : {}) });
                }}
                onReply={setReplyingTo}
                onRespondMeeting={(id, accept) =>
                  respond.mutate(
                    { id, accept },
                    {
                      onSuccess: () =>
                        toast.success(
                          accept ? "Call confirmed — see you then!" : "We'll suggest another time.",
                        ),
                      onError: (e) => toast.error(errorText(e)),
                    },
                  )
                }
                meetingBusy={respond.isPending}
              />
            )}
          </div>
          <div className="border-t border-border/60 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:border-0 md:p-4">
            <Composer
              draft={draft}
              onDraftChange={setDraft}
              onSend={() => void reply()}
              busy={send.isPending}
              replyingTo={replyingTo}
              onClearReply={() => setReplyingTo(null)}
              onAttach={(files) => void attach(files)}
              attaching={attaching}
              rows={2}
              placeholder={`Write to ${BRAND.team}…`}
            />
            {profile?.full_name && (
              <p className="mt-2 hidden px-1 text-[11px] text-muted-foreground md:block">
                Ctrl + Enter to send
              </p>
            )}
          </div>
        </section>

        <aside className="hidden min-h-0 overflow-y-auto rounded-2xl border border-border/70 bg-card shadow-level-1 xl:block">
          {detail}
        </aside>
      </div>
    </div>
  );
}
