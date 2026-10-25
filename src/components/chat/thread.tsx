/**
 * The conversation, both sides of it. Ported from Malaya's
 * components/message-thread.tsx: the same bubbles, hold-to-react, reply to a
 * message, edit and unsend your own, "Seen by …" under your last message.
 *
 * What is new is what sits in the thread instead of a booking:
 *   - the REQUEST CARD, where a person's inquiry form lands, and
 *   - the MEETING CARD, a call the team proposes and the client confirms.
 */
import {
  CalendarCheck,
  CalendarPlus,
  Copy,
  CornerUpLeft,
  ExternalLink,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  SmilePlus,
  Undo2,
  Video,
  X,
} from "@/components/icons";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { dateTime, firstName, googleCalendarUrl, longDateTime, shortDate } from "@/lib/format";
import { answerLabel, questionsFor, stageLabel, TYPES } from "@/lib/inquiry";
import type { Lead, Meeting, Message, Reaction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import { useMediaUrl } from "@/state/data";

export type Viewer = "staff" | "client";

type HoldProps = Pick<
  React.HTMLAttributes<HTMLElement>,
  | "onPointerDown"
  | "onPointerUp"
  | "onPointerLeave"
  | "onPointerMove"
  | "onPointerCancel"
  | "onContextMenu"
>;

const HOLD_MS = 450;
export const REACTIONS = ["👍", "❤️", "😂", "😮", "🙏", "✅"] as const;

export interface ReactionGroup {
  emoji: string;
  count: number;
  mine: boolean;
}

export function groupReactions(reactions: Reaction[], uid: string | undefined) {
  const out = new Map<string, ReactionGroup[]>();
  for (const r of reactions) {
    const list = out.get(r.message_id) ?? [];
    const g = list.find((x) => x.emoji === r.emoji);
    if (g) {
      g.count += 1;
      g.mine ||= r.user_id === uid;
    } else {
      list.push({ emoji: r.emoji, count: 1, mine: r.user_id === uid });
    }
    out.set(r.message_id, list);
  }
  return out;
}

function MessageMedia({
  path,
  type,
  holdProps,
  className,
}: {
  path: string;
  type: "image" | "video";
  holdProps: HoldProps;
  className?: string;
}) {
  const url = useMediaUrl(path);
  const frame = cn(
    "block max-w-[260px] overflow-hidden rounded-2xl border border-border/70 bg-secondary",
    className,
  );
  if (url.isLoading) {
    return <div className={cn(frame, "aspect-[4/3] w-[220px] animate-pulse")} {...holdProps} />;
  }
  if (!url.data) {
    return (
      <p className={cn(frame, "px-3.5 py-2.5 text-xs text-muted-foreground")} {...holdProps}>
        {type === "video" ? "Video" : "Photo"} unavailable
      </p>
    );
  }
  if (type === "video") {
    return (
      <video
        src={url.data}
        controls
        playsInline
        preload="metadata"
        className={cn(frame, "max-h-80")}
        {...holdProps}
      />
    );
  }
  return (
    <a href={url.data} target="_blank" rel="noreferrer" className={frame} {...holdProps}>
      <img
        src={url.data}
        alt="Photo sent in the conversation"
        loading="lazy"
        className="max-h-80 w-full object-cover"
      />
    </a>
  );
}

function quoteText(m: Message): string {
  if (m.unsent_at) return "Message unsent";
  const words = m.body.trim();
  if (words) return words.length > 160 ? `${words.slice(0, 160)}…` : words;
  if (m.kind === "request") return "Their request";
  if (m.kind === "meeting") return "A call";
  if (m.media_type === "video") return "Video";
  if (m.media_path) return "Photo";
  return "Message";
}

function jumpToMessage(id: string) {
  const el = document.getElementById(`msg-${id}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.animate?.([{ opacity: 0.35 }, { opacity: 1 }], { duration: 900, easing: "ease-out" });
}

function copyText(text: string) {
  if (!navigator.clipboard) {
    toast.error("Copying isn't available in this browser.");
    return;
  }
  void navigator.clipboard.writeText(text).then(
    () => toast.success("Copied"),
    () => toast.error("Couldn't copy that message."),
  );
}

export interface MessageActions {
  canManage: (message: Message) => boolean;
  onEdit: (message: Message, body: string) => Promise<void>;
  onUnsend: (message: Message) => Promise<void>;
}

function MessageBubble({
  message,
  viewer,
  receipt,
  actions,
  reactions,
  onReact,
  replyTo,
  onReply,
  card,
}: {
  message: Message;
  viewer: Viewer;
  receipt?: string | undefined;
  actions?: MessageActions | undefined;
  reactions?: ReactionGroup[] | undefined;
  onReact?: ((emoji: string) => void) | undefined;
  replyTo?: Message | null | undefined;
  onReply?: (() => void) | undefined;
  card?: ReactNode;
}) {
  const mine = viewer === "client" ? message.author === "client" : message.author !== "client";
  const unsent = Boolean(message.unsent_at);
  const manageable = !unsent && Boolean(actions?.canManage(message));
  const editable = manageable && message.kind === "message" && !message.media_path;
  const canReact = !unsent && Boolean(onReact);
  const canCopy = !unsent && message.body.trim() !== "";
  const canReply = !unsent && Boolean(onReply);
  const hasMenu = manageable || canReact || canCopy || canReply;
  const media =
    !unsent && message.media_path && message.media_type
      ? { path: message.media_path, type: message.media_type }
      : null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.body);
  const [busy, setBusy] = useState(false);
  const [confirmUnsend, setConfirmUnsend] = useState(false);

  const hold = useRef<number | null>(null);
  const cancelHold = () => {
    if (hold.current !== null) window.clearTimeout(hold.current);
    hold.current = null;
  };
  useEffect(() => cancelHold, []);
  const holdProps: HoldProps = {
    onPointerDown: (e) => {
      if (!hasMenu || e.pointerType === "mouse") return;
      cancelHold();
      hold.current = window.setTimeout(() => {
        navigator.vibrate?.(10);
        setMenuOpen(true);
      }, HOLD_MS);
    },
    onPointerUp: cancelHold,
    onPointerLeave: cancelHold,
    onPointerMove: cancelHold,
    onPointerCancel: cancelHold,
    onContextMenu: (e) => {
      if (!hasMenu) return;
      e.preventDefault();
      setMenuOpen(true);
    },
  };

  if (unsent) {
    return (
      <div className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}>
        <p className="flex items-center gap-1.5 rounded-2xl border border-dashed border-border px-3.5 py-2 text-xs italic text-muted-foreground">
          <Undo2 className="size-3.5" />
          {mine && viewer === "staff"
            ? `${firstName(message.author_name)} unsent a message`
            : "Message unsent"}
        </p>
        {receipt && <p className="px-1 text-[11px] text-muted-foreground">{receipt}</p>}
      </div>
    );
  }

  const save = async () => {
    if (!actions || !draft.trim()) return;
    setBusy(true);
    try {
      await actions.onEdit(message, draft);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  // The team speaks as one voice to a client: "Team Marj", with the person's
  // own name only on the team's side.
  const shownName =
    viewer === "client" && message.author !== "client"
      ? message.kind === "auto"
        ? BRAND.team
        : `${firstName(message.author_name)} · ${BRAND.team}`
      : message.author_name;

  return (
    <div
      id={`msg-${message.id}`}
      className={cn("group flex flex-col gap-1", mine ? "items-end" : "items-start")}
    >
      <div className="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
        <span className="font-medium">{shownName}</span>
        <span>·</span>
        <time dateTime={message.sent_at}>{dateTime(message.sent_at)}</time>
        {message.kind === "auto" && viewer === "staff" && <span>· Automatic</span>}
        {message.edited_at && <span>· Edited</span>}
      </div>

      {card}

      {editing ? (
        <div className="w-full max-w-[85%] space-y-2">
          <Textarea
            autoFocus
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setEditing(false);
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void save();
              }
            }}
            className="resize-none text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={busy}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => void save()} disabled={busy || !draft.trim()}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        (media || (message.body.trim() && message.kind !== "request") || message.reply_to_id) && (
          <div className={cn("flex max-w-[85%] items-center gap-1", mine && "flex-row-reverse")}>
            <div className={cn("flex min-w-0 flex-col gap-1", mine ? "items-end" : "items-start")}>
              {message.reply_to_id && replyTo !== undefined && (
                <button
                  type="button"
                  onClick={() => jumpToMessage(message.reply_to_id!)}
                  className={cn(
                    "max-w-full rounded-xl border-l-2 border-primary/60 bg-secondary/60 px-2.5 py-1.5 text-left text-xs text-muted-foreground transition hover:bg-secondary",
                    mine && "text-right",
                  )}
                >
                  <span className="flex items-center gap-1 font-medium text-foreground/80">
                    <CornerUpLeft className="size-3 shrink-0" />
                    {replyTo ? replyTo.author_name : "An earlier message"}
                  </span>
                  <span className="line-clamp-2 [overflow-wrap:anywhere]">
                    {replyTo ? quoteText(replyTo) : "Not shown here"}
                  </span>
                </button>
              )}
              {media && (
                <MessageMedia
                  path={media.path}
                  type={media.type}
                  holdProps={holdProps}
                  className={cn(mine ? "rounded-br-sm" : "rounded-bl-sm")}
                />
              )}
              {message.body.trim() && message.kind !== "request" && (
                <p
                  {...holdProps}
                  className={cn(
                    "min-w-0 whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm [overflow-wrap:anywhere]",
                    mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-secondary text-secondary-foreground",
                    hasMenu && "select-none [-webkit-touch-callout:none] sm:select-auto",
                  )}
                >
                  {message.body}
                </p>
              )}
            </div>
            {hasMenu && (
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Message options"
                    className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground opacity-0 transition hover:bg-secondary focus-visible:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100"
                  >
                    {manageable || canCopy || canReply ? (
                      <MoreHorizontal className="size-4" />
                    ) : (
                      <SmilePlus className="size-4" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={mine ? "end" : "start"} className="min-w-44">
                  {canReact && (
                    <div className="flex gap-0.5" role="group" aria-label="React">
                      {REACTIONS.map((emoji) => {
                        const picked = reactions?.some((r) => r.emoji === emoji && r.mine);
                        return (
                          <DropdownMenuItem
                            key={emoji}
                            aria-label={picked ? `Remove ${emoji}` : `React ${emoji}`}
                            onSelect={() => onReact?.(emoji)}
                            className={cn(
                              "grid size-9 place-items-center rounded-full p-0 text-xl leading-none",
                              picked && "bg-primary/15",
                            )}
                          >
                            {emoji}
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                  )}
                  {canReact && (canCopy || manageable || canReply) && <DropdownMenuSeparator />}
                  {canReply && (
                    <DropdownMenuItem className="gap-2" onSelect={() => onReply?.()}>
                      <CornerUpLeft className="size-4" /> Reply
                    </DropdownMenuItem>
                  )}
                  {canCopy && (
                    <DropdownMenuItem className="gap-2" onSelect={() => copyText(message.body)}>
                      <Copy className="size-4" /> Copy
                    </DropdownMenuItem>
                  )}
                  {editable && (
                    <DropdownMenuItem
                      className="gap-2"
                      onSelect={() => {
                        setDraft(message.body);
                        setEditing(true);
                      }}
                    >
                      <Pencil className="size-4" /> Edit
                    </DropdownMenuItem>
                  )}
                  {manageable && (
                    <DropdownMenuItem
                      className="gap-2 text-destructive focus:text-destructive"
                      onSelect={() => setConfirmUnsend(true)}
                    >
                      <Undo2 className="size-4" /> Unsend
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )
      )}

      {!editing && reactions && reactions.length > 0 && (
        <div className={cn("-mt-2.5 flex flex-wrap gap-1 px-2", mine && "justify-end")}>
          {reactions.map((r) => (
            <button
              key={r.emoji}
              type="button"
              disabled={!canReact}
              onClick={() => onReact?.(r.emoji)}
              aria-label={`${r.emoji} ${r.count}${r.mine ? ", including you" : ""}`}
              className={cn(
                "relative inline-flex h-6 items-center gap-1 rounded-full border bg-background px-1.5 text-sm leading-none shadow-sm transition disabled:cursor-default",
                r.mine ? "border-primary/50 bg-primary/10" : "border-border/80",
                canReact && "hover:border-primary/60",
              )}
            >
              <span>{r.emoji}</span>
              {r.count > 1 && (
                <span className="text-[11px] tabular-nums text-muted-foreground">{r.count}</span>
              )}
            </button>
          ))}
        </div>
      )}
      {receipt && <p className="px-1 text-[11px] text-muted-foreground">{receipt}</p>}

      {manageable && (
        <AlertDialog open={confirmUnsend} onOpenChange={setConfirmUnsend}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsend this message?</AlertDialogTitle>
              <AlertDialogDescription>
                It is replaced with &ldquo;Message unsent&rdquo; for everyone. They may already have
                read it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => void actions?.onUnsend(message)}
              >
                Unsend
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

// ------------------------------------------------------------ request card

/** Where a person's inquiry form lands in the chat — the booking card's job in Malaya. */
export function RequestCard({ lead, viewer }: { lead: Lead; viewer: Viewer }) {
  const meta = TYPES[lead.type];
  const Icon = meta.icon;
  const qs = questionsFor(lead.type);
  const note = typeof lead.answers["note"] === "string" ? (lead.answers["note"] as string) : "";
  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border/70 bg-card text-left shadow-level-1">
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{meta.label}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            {stageLabel(lead.stage, viewer)} · {lead.code} · {shortDate(lead.created_at)}
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 px-4 py-3 text-sm sm:grid-cols-2">
        {qs.map((q) => {
          const v = lead.answers[q.key];
          if (v == null || v === "" || (Array.isArray(v) && !v.length)) return null;
          return (
            <div
              key={q.key}
              className={cn(
                "min-w-0",
                (q.control === "textarea" || q.control === "chips") && "sm:col-span-2",
              )}
            >
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {q.label}
              </dt>
              <dd className="font-medium text-foreground [overflow-wrap:anywhere]">
                {answerLabel(q, v)}
              </dd>
            </div>
          );
        })}
      </dl>
      {note && (
        <p className="border-t border-border/60 px-4 py-3 text-sm text-foreground">
          <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
            Note
          </span>
          {note}
        </p>
      )}
    </div>
  );
}

// ------------------------------------------------------------ meeting card

const MODE: Record<Meeting["mode"], { label: string; icon: typeof Video }> = {
  google_meet: { label: "Google Meet", icon: Video },
  zoom: { label: "Zoom", icon: Video },
  phone: { label: "Phone call", icon: Phone },
  in_person: { label: "In person", icon: MapPin },
};

export function meetingModeLabel(mode: Meeting["mode"]) {
  return MODE[mode].label;
}

export function MeetingCard({
  meeting,
  viewer,
  onRespond,
  onCancel,
  busy,
}: {
  meeting: Meeting;
  viewer: Viewer;
  onRespond?: ((accept: boolean) => void) | undefined;
  onCancel?: (() => void) | undefined;
  busy?: boolean;
}) {
  const mode = MODE[meeting.mode];
  const Icon = mode.icon;
  const past = Date.parse(meeting.starts_at) < Date.now();
  const status =
    meeting.status === "confirmed"
      ? { text: past ? "Done" : "Confirmed", tone: "bg-success/10 text-success" }
      : meeting.status === "declined"
        ? { text: "Asked for another time", tone: "bg-warning/10 text-warning" }
        : meeting.status === "cancelled"
          ? { text: "Cancelled", tone: "bg-secondary text-muted-foreground" }
          : {
              text: viewer === "client" ? "Please confirm" : "Waiting for them",
              tone: "bg-primary/10 text-primary",
            };

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border/70 bg-card text-left shadow-level-1">
      <div className="flex items-start gap-3 px-4 pb-3 pt-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
          <CalendarCheck className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            A call with {BRAND.team}
          </p>
          <p
            className={cn(
              "font-semibold text-foreground",
              meeting.status === "cancelled" && "line-through opacity-60",
            )}
          >
            {longDateTime(meeting.starts_at)}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className="size-3.5" /> {mode.label} · {meeting.duration_min} min
            {meeting.location ? ` · ${meeting.location}` : ""}
          </p>
        </div>
        <span
          className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold", status.tone)}
        >
          {status.text}
        </span>
      </div>
      {meeting.status !== "cancelled" && meeting.status !== "declined" && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 px-4 py-3">
          {meeting.status === "proposed" && viewer === "client" && onRespond && (
            <>
              <Button
                size="sm"
                variant="success"
                className="rounded-full"
                disabled={busy}
                onClick={() => onRespond(true)}
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                disabled={busy}
                onClick={() => onRespond(false)}
              >
                Another time
              </Button>
            </>
          )}
          {meeting.link && (
            <Button size="sm" variant="outline" className="rounded-full" asChild>
              <a href={meeting.link} target="_blank" rel="noreferrer">
                <ExternalLink className="size-3.5" /> Join link
              </a>
            </Button>
          )}
          {meeting.status === "confirmed" && !past && (
            <Button size="sm" variant="outline" className="rounded-full" asChild>
              <a
                href={googleCalendarUrl({
                  title: `Call with ${BRAND.team}`,
                  startsAt: meeting.starts_at,
                  minutes: meeting.duration_min,
                  ...(meeting.link ? { details: meeting.link } : {}),
                  ...(meeting.location ? { location: meeting.location } : {}),
                })}
                target="_blank"
                rel="noreferrer"
              >
                <CalendarPlus className="size-3.5" /> Add to calendar
              </a>
            </Button>
          )}
          {viewer === "staff" && meeting.status !== "confirmed" && onCancel && (
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto rounded-full text-muted-foreground"
              disabled={busy}
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ thread

export function MessageThread({
  messages,
  viewer,
  leads,
  meetings,
  seen,
  actions,
  reactions,
  onReact,
  onReply,
  onRespondMeeting,
  onCancelMeeting,
  meetingBusy,
  emptyMessage = "No messages yet.",
}: {
  messages: Message[];
  viewer: Viewer;
  leads: Map<string, Lead>;
  meetings: Map<string, Meeting>;
  seen?: { at: string | null; by: string } | undefined;
  actions?: MessageActions | undefined;
  reactions?: Map<string, ReactionGroup[]> | undefined;
  onReact?: ((messageId: string, emoji: string) => void) | undefined;
  onReply?: ((message: Message) => void) | undefined;
  onRespondMeeting?: ((meetingId: string, accept: boolean) => void) | undefined;
  onCancelMeeting?: ((meetingId: string) => void) | undefined;
  meetingBusy?: boolean;
  emptyMessage?: string;
}) {
  if (!messages.length) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const isMine = (m: Message) =>
    viewer === "client" ? m.author === "client" : m.author !== "client";
  const last = messages[messages.length - 1];
  const receiptFor =
    seen && last && isMine(last) && last.kind !== "request"
      ? {
          id: last.id,
          text:
            seen.at && Date.parse(seen.at) >= Date.parse(last.sent_at)
              ? `Seen by ${seen.by}`
              : "Sent",
        }
      : null;
  const byId = new Map(messages.map((m) => [m.id, m]));

  return (
    <div className="flex flex-col gap-4">
      {messages.map((m) => {
        const lead = m.kind === "request" && m.lead_id ? leads.get(m.lead_id) : undefined;
        const meeting =
          m.kind === "meeting" && m.meeting_id ? meetings.get(m.meeting_id) : undefined;
        const card = lead ? (
          <RequestCard lead={lead} viewer={viewer} />
        ) : meeting ? (
          <MeetingCard
            meeting={meeting}
            viewer={viewer}
            busy={meetingBusy ?? false}
            onRespond={
              onRespondMeeting ? (accept) => onRespondMeeting(meeting.id, accept) : undefined
            }
            onCancel={onCancelMeeting ? () => onCancelMeeting(meeting.id) : undefined}
          />
        ) : undefined;
        return (
          <MessageBubble
            key={m.id}
            message={m}
            viewer={viewer}
            card={card}
            receipt={receiptFor?.id === m.id ? receiptFor.text : undefined}
            actions={m.kind === "message" ? actions : undefined}
            reactions={reactions?.get(m.id)}
            onReact={onReact && m.kind === "message" ? (emoji) => onReact(m.id, emoji) : undefined}
            replyTo={m.reply_to_id ? (byId.get(m.reply_to_id) ?? null) : undefined}
            onReply={onReply && m.kind !== "request" ? () => onReply(m) : undefined}
          />
        );
      })}
    </div>
  );
}

export function ReplyingToBar({
  message,
  onClear,
  className,
}: {
  message: Message;
  onClear: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border-l-2 border-primary bg-secondary/60 px-3 py-2 text-xs",
        className,
      )}
    >
      <CornerUpLeft className="mt-0.5 size-3.5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">Replying to {message.author_name}</p>
        <p className="truncate text-muted-foreground">{quoteText(message)}</p>
      </div>
      <button
        type="button"
        onClick={onClear}
        aria-label="Cancel reply"
        className="grid size-5 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
