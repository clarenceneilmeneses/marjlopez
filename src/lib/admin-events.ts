/**
 * What happened, newest first — the bell's list and the dashboard's "Recent".
 * Built from data the Inbox already loads; nothing extra is stored.
 */
import { leadSummary } from "./inquiry";
import { isHot } from "./score";
import type { LeadType } from "./types";
import type { InboxData } from "@/state/data";

export type AdminEventKind = "inquiry" | "message" | "call";

export interface AdminEvent {
  id: string;
  at: string;
  kind: AdminEventKind;
  name: string;
  text: string;
  conversationId: string;
  hot?: boolean;
  type?: LeadType;
}

export function adminEvents(data: InboxData, limit = 40): AdminEvent[] {
  const byConv = new Map(data.conversations.map((c) => [c.id, c]));
  const nameOf = (convId: string | null | undefined) =>
    (convId && byConv.get(convId)?.profile?.full_name) || "Someone";
  const out: AdminEvent[] = [];

  for (const l of data.leads) {
    if (!l.conversation_id) continue;
    out.push({
      id: `lead-${l.id}`,
      at: l.created_at,
      kind: "inquiry",
      name: nameOf(l.conversation_id),
      text: leadSummary(l.type, l.answers),
      conversationId: l.conversation_id,
      hot: isHot(l),
      type: l.type,
    });
  }

  for (const m of data.messages) {
    if (m.author !== "client" || m.kind !== "message" || m.unsent_at) continue;
    // A meeting answer is its own event below; skip the line it writes.
    if (/^(Confirmed the call|Can we find another time)/.test(m.body)) continue;
    out.push({
      id: `msg-${m.id}`,
      at: m.sent_at,
      kind: "message",
      name: m.author_name,
      text: m.body.trim() || (m.media_type === "video" ? "Sent a video" : "Sent a photo"),
      conversationId: m.conversation_id,
    });
  }

  for (const mt of data.meetings) {
    if (!mt.responded_at || (mt.status !== "confirmed" && mt.status !== "declined")) continue;
    out.push({
      id: `call-${mt.id}-${mt.status}`,
      at: mt.responded_at,
      kind: "call",
      name: nameOf(mt.conversation_id),
      text:
        mt.status === "confirmed"
          ? `Confirmed the call · ${new Date(mt.starts_at).toLocaleString("en-PH", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZone: "Asia/Manila",
            })}`
          : "Asked for another time for the call",
      conversationId: mt.conversation_id,
    });
  }

  return out.sort((a, b) => Date.parse(b.at) - Date.parse(a.at)).slice(0, limit);
}
