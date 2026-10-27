/**
 * Who to answer first (the boss, 2026-10-28: "sorted by how many properties
 * and how willing to start asap … more on those who want to invest / make a
 * system … should be able to identify the best possible clients").
 *
 * A fit score out of 100 from three plain parts, so the lead panel can always
 * say WHY someone ranks where they do — never a black box:
 *
 *   Size       up to 40   how many properties (units, for a system; the
 *                         bigger of amount and properties, for an investor)
 *   Readiness  up to 35   ready now · 1–3 months · 3–6 months · exploring
 *   Offer      up to 25   investor and system first, then management, then
 *                         the seminar
 *
 * 70 and up is a Top client — what the Inbox's Hot chip and flame mean now.
 * A person's own call (`hot_override`) still wins over the score.
 */
import { optionLabel, PROPERTIES, READY } from "./inquiry";
import type { Lead, LeadType } from "./types";

const PROPERTY_PTS: Record<string, number> = { "0": 0, "1": 15, "2-3": 25, "4-10": 35, "11+": 40 };
const UNIT_PTS: Record<string, number> = { none: 0, "1": 12, "2-5": 24, "6-15": 34, "16+": 40 };
const AMOUNT_PTS: Record<string, number> = {
  "500k-1m": 15,
  "1-3m": 25,
  "3-10m": 35,
  "10m+": 40,
  discuss: 15,
};
const AMOUNT_LABEL: Record<string, string> = {
  "500k-1m": "₱500k–1M in",
  "1-3m": "₱1–3M in",
  "3-10m": "₱3–10M in",
  "10m+": "₱10M+ in",
  discuss: "amount to discuss",
};
const READY_PTS: Record<string, number> = { asap: 35, "1-3m": 22, "3-6m": 10, exploring: 0 };
export const OFFER_PTS: Record<LeadType, number> = {
  invest: 25,
  system: 25,
  management: 15,
  seminar: 5,
  other: 0,
};

export const TOP_AT = 70;
export const GOOD_AT = 45;

export type Tier = "top" | "good" | "low";

export interface Fit {
  score: number;
  tier: Tier;
  parts: { key: "size" | "ready" | "offer"; label: string; points: number; max: number }[];
  /** "4–10 properties · ready now · investor" — the one-line why. */
  reason: string;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

export function fitOf(type: LeadType, answers: Record<string, unknown>): Fit {
  let size = 0;
  let sizeLabel = "No size given";
  const props = str(answers["properties"]);
  const propsLabel =
    props === "0"
      ? "no property yet"
      : props === "1"
        ? "1 property"
        : props
          ? `${optionLabel(PROPERTIES, props)} properties`
          : "";
  if (type === "system") {
    const u = str(answers["units"]);
    size = UNIT_PTS[u] ?? 0;
    sizeLabel = u === "none" ? "not operating yet" : u ? `${u} units` : sizeLabel;
  } else if (type === "invest") {
    const a = str(answers["amount"]);
    const byAmount = AMOUNT_PTS[a] ?? 0;
    const byProps = PROPERTY_PTS[props] ?? 0;
    size = Math.max(byAmount, byProps);
    sizeLabel = byProps > byAmount ? propsLabel : (AMOUNT_LABEL[a] ?? sizeLabel);
  } else if (type !== "other") {
    size = PROPERTY_PTS[props] ?? 0;
    sizeLabel = propsLabel || sizeLabel;
  }

  const r = str(answers["ready"]);
  const ready = READY_PTS[r] ?? 0;
  const readyLabel =
    r === "asap" ? "ready now" : (optionLabel(READY, r)?.toLowerCase() ?? "no timing");

  const offer = OFFER_PTS[type];
  const offerLabel = {
    invest: "investor",
    system: "wants a system",
    management: "management",
    seminar: "seminar",
    other: "other",
  }[type];

  const score = size + ready + offer;
  const tier: Tier = score >= TOP_AT ? "top" : score >= GOOD_AT ? "good" : "low";
  return {
    score,
    tier,
    parts: [
      { key: "size", label: sizeLabel, points: size, max: 40 },
      { key: "ready", label: readyLabel, points: ready, max: 35 },
      { key: "offer", label: offerLabel, points: offer, max: 25 },
    ],
    reason:
      type === "other" ? "Not scored — read it" : [sizeLabel, readyLabel, offerLabel].join(" · "),
  };
}

export const leadFit = (lead: Pick<Lead, "type" | "answers">) => fitOf(lead.type, lead.answers);

/** Hot = a Top client, unless someone on the team said otherwise. */
export function isHot(lead: Pick<Lead, "type" | "answers" | "hot_override"> | null | undefined) {
  if (!lead) return false;
  return lead.hot_override ?? leadFit(lead).tier === "top";
}

export const TIER_LABEL: Record<Tier, string> = {
  top: "Top client",
  good: "Good fit",
  low: "Low fit",
};

/** The score pill's colours — status, like the stage dots. */
export function tierTone(tier: Tier): string {
  switch (tier) {
    case "top":
      return "bg-destructive/10 text-destructive";
    case "good":
      return "bg-warning/15 text-warning";
    case "low":
      return "bg-secondary text-muted-foreground";
  }
}
