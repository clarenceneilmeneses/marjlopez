/**
 * The client's side of the bell: what the team did in their conversation,
 * newest first. Built from the thread the Messages page already loads, like
 * admin-events.ts is from the Inbox; nothing extra is stored.
 */
import { BRAND } from "./brand";
import { firstName } from "./format";
import type { ThreadData } from "@/state/data";

export type ClientEventKind = "reply" | "call" | "received";

export interface ClientEvent {
  id: string;
  at: string;
  kind: ClientEventKind;
  title: string;
  text: string;
  /** A proposed call that's still the client's to answer. */
  needsAnswer?: boolean;
}

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  });

export function clientEvents(thread: ThreadData, limit = 30): ClientEvent[] {
  const out: ClientEvent[] = [];
  for (const m of thread.messages) {
    if (m.unsent_at) continue;
    const who = firstName(m.author_name) || BRAND.team;

    if (m.kind === "auto") {
      out.push({
        id: `auto-${m.id}`,
        at: m.sent_at,
        kind: "received",
        title: `${BRAND.team} got your request`,
        text: m.body.trim(),
      });
    } else if (m.kind === "meeting" && m.meeting_id) {
      const mt = thread.meetings.get(m.meeting_id);
      if (!mt) continue;
      out.push({
        id: `call-${mt.id}`,
        at: m.sent_at,
        kind: "call",
        title:
          mt.status === "cancelled"
            ? "A call was cancelled"
            : mt.status === "confirmed"
              ? "Your call is booked"
              : `${who} proposed a call`,
        text: when(mt.starts_at),
        needsAnswer: mt.status === "proposed" && Date.parse(mt.starts_at) > Date.now(),
      });
    } else if (m.author === "staff" && m.kind === "message") {
      out.push({
        id: `msg-${m.id}`,
        at: m.sent_at,
        kind: "reply",
        title: `${who} replied`,
        text: m.body.trim() || (m.media_type === "video" ? "Sent a video" : "Sent a photo"),
      });
    }
  }
  return out.sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, limit);
}
