/**
 * How far inquiries get — the Dashboard's "Deals" row and the Clients page's
 * stat cards (Clarence, 2026-10-26: "see if the rate of much rly went
 * thru/finished/closed a deal").
 *
 * A lead keeps only its CURRENT stage; nothing records when it moved. So
 * "reached" is read from what's left behind: a lead counts as replied to if
 * it's past New or the team wrote after it came in, and as having had a call
 * if it's at Call booked or later or a call for it was confirmed. That keeps
 * a lost lead that got as far as a call in the call step, where it belongs.
 */
import { LOST_REASONS } from "./inquiry";
import type { Lead, LeadStage, Meeting, Message } from "./types";

const AT_LEAST: Record<LeadStage, number> = {
  new: 0,
  talking: 1,
  call_booked: 2,
  proposal_sent: 3,
  won: 4,
  lost: 0,
};

export interface FunnelStep {
  key: string;
  label: string;
  value: number;
}

export interface DealStats {
  total: number;
  won: number;
  lost: number;
  open: number;
  /** Won out of the decided ones (won + lost); null before anything is decided. */
  closeRate: number | null;
  /** Won out of every inquiry. */
  winRate: number | null;
  funnel: FunnelStep[];
  lostReasons: { key: string; value: number }[];
}

export function dealStats(leads: Lead[], meetings: Meeting[], messages: Message[]): DealStats {
  const staffAt = new Map<string, number[]>();
  for (const m of messages) {
    if (m.author !== "staff" || m.kind === "auto") continue;
    const arr = staffAt.get(m.conversation_id) ?? [];
    arr.push(Date.parse(m.sent_at));
    staffAt.set(m.conversation_id, arr);
  }
  const hadCall = new Set(
    meetings.filter((m) => m.status === "confirmed" && m.lead_id).map((m) => m.lead_id!),
  );

  let replied = 0;
  let called = 0;
  let proposed = 0;
  let won = 0;
  let lost = 0;
  const reasons = new Map<string, number>();
  for (const l of leads) {
    const step = AT_LEAST[l.stage];
    const t0 = Date.parse(l.created_at);
    const wrote = l.conversation_id
      ? (staffAt.get(l.conversation_id) ?? []).some((t) => t > t0)
      : false;
    if (step >= 1 || wrote) replied++;
    if (step >= 2 || hadCall.has(l.id)) called++;
    if (step >= 3) proposed++;
    if (l.stage === "won") won++;
    if (l.stage === "lost") {
      lost++;
      const r = l.lost_reason ?? "No reason given";
      reasons.set(r, (reasons.get(r) ?? 0) + 1);
    }
  }

  const total = leads.length;
  const order = [...LOST_REASONS, "No reason given"];
  return {
    total,
    won,
    lost,
    open: total - won - lost,
    closeRate: won + lost ? won / (won + lost) : null,
    winRate: total ? won / total : null,
    funnel: [
      { key: "inquired", label: "Inquired", value: total },
      { key: "replied", label: "Replied to", value: replied },
      { key: "call", label: "Had a call", value: called },
      { key: "proposal", label: "Got a proposal", value: proposed },
      { key: "won", label: "Closed a deal", value: won },
    ],
    lostReasons: [...reasons.entries()]
      .sort((a, b) => b[1] - a[1] || order.indexOf(a[0]) - order.indexOf(b[0]))
      .map(([key, value]) => ({ key, value })),
  };
}

export const pct = (x: number | null) => (x === null ? "—" : `${Math.round(x * 100)}%`);
