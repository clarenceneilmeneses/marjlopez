/**
 * The inquiry form — PRD §7. What is asked, in what order, and how every
 * answer reads back in the Inbox.
 *
 * ONE SCREEN PER SUBJECT, the rule Malaya's checkout settled on after six
 * versions (villas.$code_.book.tsx there): a screen asks about one thing, its
 * controls sit under it, Next is the only way on. Taps, not typing — cards
 * and dropdowns — so it is quick from a phone after tapping a link in bio.
 *
 * The values are short stable keys; `lib/score.ts` reads some of them
 * (`properties`, `units`, `amount`, `ready`) to rank who to answer first, so
 * rename a value there too or the ranking quietly drops it.
 */
import {
  KeyRound,
  LayoutDashboard,
  Mail,
  TrendingUp,
  Users,
  type LucideIcon,
} from "@/components/icons";
import type { Mark } from "@/components/site/logos";
import type { LeadStage, LeadType } from "./types";

export interface Option {
  value: string;
  label: string;
  hint?: string;
  /** The companies this option names, drawn as their logos (2026-10-25). */
  marks?: Mark[];
  /** A plain icon where there is no company: a website, a friend. */
  glyph?: "web" | "people";
}

export type Control = "cards" | "select" | "chips" | "text" | "textarea";

export interface Question {
  key: string;
  label: string;
  control: Control;
  options?: Option[];
  optional?: boolean;
  placeholder?: string;
}

export interface Screen {
  title: string;
  lead?: string;
  /** The heading this screen gets on the review page. */
  short: string;
  questions: Question[];
}

export const LOCATIONS: Option[] = [
  { value: "metro-manila", label: "Metro Manila" },
  { value: "cavite-tagaytay", label: "Cavite / Tagaytay" },
  { value: "batangas", label: "Batangas" },
  { value: "laguna", label: "Laguna" },
  { value: "rizal", label: "Rizal" },
  { value: "bataan-zambales", label: "Bataan / Zambales" },
  { value: "pampanga", label: "Pampanga" },
  { value: "baguio", label: "Baguio / Benguet" },
  { value: "cebu", label: "Cebu" },
  { value: "palawan", label: "Palawan" },
  { value: "siargao", label: "Siargao" },
  { value: "other", label: "Somewhere else" },
  { value: "not-sure", label: "Not sure yet" },
];

export const SOURCES: Option[] = [
  { value: "facebook", label: "Facebook", marks: ["facebook"] },
  { value: "instagram", label: "Instagram", marks: ["instagram"] },
  { value: "tiktok", label: "TikTok", marks: ["tiktok"] },
  { value: "threads", label: "Threads", marks: ["threads"] },
  { value: "youtube", label: "YouTube", marks: ["youtube"] },
  { value: "referral", label: "A friend referred me", glyph: "people" },
  { value: "malaya-guest", label: "I stayed at Malaya Villas", marks: ["malaya"] },
  { value: "other", label: "Somewhere else" },
];

/**
 * The four offers, in the boss's order of priority (2026-10-28): property
 * management, the seminar, investing, and a system for their resort. Each has
 * its own page (lib/offers.ts) and its own questions below.
 */
export const TYPES: Record<
  LeadType,
  { label: string; short: string; blurb: string; icon: LucideIcon; marks?: Mark[] }
> = {
  management: {
    label: "Manage my property",
    short: "Management",
    blurb: "Marj's team runs your rental — listing, guests, cleaning, payouts.",
    icon: KeyRound,
    marks: ["airbnb"],
  },
  seminar: {
    label: "Join the seminar",
    short: "Seminar",
    blurb: "A day with Marj on starting and running an Airbnb that earns.",
    icon: Users,
  },
  invest: {
    label: "Invest with Marj",
    short: "Investor",
    blurb: "Put capital into a villa Malaya builds and runs.",
    icon: TrendingUp,
    marks: ["malaya"],
  },
  system: {
    label: "A system for my resort",
    short: "System",
    blurb: "Website, inbox, bookings and payments — the one that runs Malaya Villas.",
    icon: LayoutDashboard,
    marks: ["malaya"],
  },
  other: {
    label: "Something else",
    short: "Other",
    blurb: "Collabs, speaking, media or a partnership.",
    icon: Mail,
  },
};

export const TYPE_ORDER: LeadType[] = ["management", "seminar", "invest", "system", "other"];

/**
 * How many properties, and how soon — asked the same way on every offer so
 * the Inbox can rank everyone on one scale (lib/score.ts reads these keys).
 */
export const PROPERTIES: Option[] = [
  { value: "0", label: "None yet" },
  { value: "1", label: "1 property" },
  { value: "2-3", label: "2 – 3" },
  { value: "4-10", label: "4 – 10" },
  { value: "11+", label: "11 or more" },
];

export const READY: Option[] = [
  { value: "asap", label: "Ready now", hint: "This month" },
  { value: "1-3m", label: "In 1 – 3 months" },
  { value: "3-6m", label: "In 3 – 6 months" },
  { value: "exploring", label: "Just exploring" },
];

export const SCREENS: Record<LeadType, Screen[]> = {
  management: [
    {
      title: "Tell us about your property",
      lead: "So we know what we'd be taking care of.",
      short: "Your property",
      questions: [
        {
          key: "properties",
          label: "How many properties would we manage?",
          control: "cards",
          options: PROPERTIES.filter((o) => o.value !== "0"),
        },
        {
          key: "status",
          label: "Where is it at?",
          control: "cards",
          options: [
            { value: "running", label: "Already renting out", hint: "Airbnb or direct" },
            { value: "ready", label: "Ready, not listed yet" },
            { value: "building", label: "Still being built", hint: "Or renovated" },
          ],
        },
      ],
    },
    {
      title: "Where is it, and who runs it now?",
      short: "Location",
      questions: [
        { key: "location", label: "Where is it?", control: "select", options: LOCATIONS },
        {
          key: "run_by",
          label: "Who runs it today?",
          control: "cards",
          options: [
            { value: "self", label: "I do it myself" },
            { value: "family", label: "Family or a caretaker" },
            { value: "manager", label: "Another manager" },
            { value: "nobody", label: "Nobody yet" },
          ],
        },
      ],
    },
    {
      title: "When would you hand it over?",
      short: "Timing",
      questions: [
        { key: "ready", label: "When would you hand it over?", control: "cards", options: READY },
        {
          key: "property_note",
          label: "What is it?",
          control: "text",
          optional: true,
          placeholder: "e.g. 2-bedroom villa with a pool",
        },
      ],
    },
  ],
  seminar: [
    {
      title: "Where are you right now?",
      lead: "So the seminar meets you where you are.",
      short: "Where you are",
      questions: [
        {
          key: "stage_now",
          label: "Where are you right now?",
          control: "cards",
          options: [
            { value: "exploring", label: "Just exploring", hint: "Curious how it works" },
            { value: "has-property", label: "I have a property", hint: "Not listed yet" },
            { value: "hosting", label: "Already hosting", hint: "I want to grow" },
            { value: "arbitrage", label: "No property", hint: "Interested in rental arbitrage" },
          ],
        },
        {
          key: "properties",
          label: "How many properties do you have?",
          control: "cards",
          options: PROPERTIES,
        },
      ],
    },
    {
      title: "How would you like to join?",
      short: "Joining",
      questions: [
        {
          key: "format",
          label: "In person or online?",
          control: "cards",
          options: [
            { value: "in-person", label: "In person", hint: "Tagaytay" },
            { value: "online", label: "Online" },
            { value: "either", label: "Either is fine" },
          ],
        },
        {
          key: "capital",
          label: "How much capital is ready to start?",
          control: "select",
          options: [
            { value: "lt100k", label: "Under ₱100k" },
            { value: "100-300k", label: "₱100k – ₱300k" },
            { value: "300k-1m", label: "₱300k – ₱1M" },
            { value: "1m+", label: "₱1M and up" },
            { value: "na", label: "Prefer not to say" },
          ],
        },
      ],
    },
    {
      title: "When do you want to start?",
      short: "Timing",
      questions: [
        { key: "ready", label: "When do you want to start?", control: "cards", options: READY },
      ],
    },
  ],
  invest: [
    {
      title: "How much are you looking to put in?",
      lead: "A range is fine. Nothing is committed here.",
      short: "The amount",
      questions: [
        {
          key: "amount",
          label: "How much would you invest?",
          control: "select",
          options: [
            { value: "500k-1m", label: "₱500k – ₱1M" },
            { value: "1-3m", label: "₱1M – ₱3M" },
            { value: "3-10m", label: "₱3M – ₱10M" },
            { value: "10m+", label: "₱10M and up" },
            { value: "discuss", label: "I'd rather discuss on a call" },
          ],
        },
        {
          key: "interest",
          label: "What interests you?",
          control: "cards",
          options: [
            { value: "co-own", label: "Co-own a villa", hint: "With Malaya running it" },
            { value: "next-villa", label: "Fund the next Malaya villa" },
            { value: "my-land", label: "Build on my own land", hint: "Marj builds and runs it" },
            { value: "open", label: "Open to suggestions" },
          ],
        },
      ],
    },
    {
      title: "Do you own property already?",
      short: "Property",
      questions: [
        {
          key: "properties",
          label: "How many properties do you own?",
          control: "cards",
          options: PROPERTIES,
        },
        {
          key: "location",
          label: "Any place you prefer?",
          control: "select",
          options: LOCATIONS,
        },
      ],
    },
    {
      title: "When are the funds ready?",
      short: "Timing",
      questions: [
        { key: "ready", label: "When are the funds ready?", control: "cards", options: READY },
      ],
    },
  ],
  system: [
    {
      title: "Tell us about your resort",
      short: "Your resort",
      questions: [
        {
          key: "kind",
          label: "What do you run?",
          control: "cards",
          options: [
            { value: "resort", label: "A resort" },
            { value: "villas", label: "Villas or staycations" },
            { value: "hotel", label: "A hotel or inn" },
            { value: "glamping", label: "Glamping or a campsite" },
          ],
        },
        {
          key: "units",
          label: "How many rooms or units?",
          control: "cards",
          options: [
            { value: "1", label: "1" },
            { value: "2-5", label: "2 – 5" },
            { value: "6-15", label: "6 – 15" },
            { value: "16+", label: "16 or more" },
            { value: "none", label: "Not operating yet" },
          ],
        },
      ],
    },
    {
      title: "Where are you listed, and what hurts?",
      lead: "Pick as many as you like.",
      short: "Today",
      questions: [
        {
          key: "channels",
          label: "Where are you listed?",
          control: "chips",
          options: [
            { value: "airbnb", label: "Airbnb", marks: ["airbnb"] },
            { value: "booking", label: "Booking.com", marks: ["booking"] },
            { value: "agoda", label: "Agoda", marks: ["agoda"] },
            { value: "social", label: "FB / IG direct", marks: ["facebook", "instagram"] },
            { value: "website", label: "Own website", glyph: "web" },
            { value: "none", label: "None yet" },
          ],
        },
        {
          key: "pains",
          label: "What's the biggest headache?",
          control: "chips",
          options: [
            { value: "messages", label: "Too many messages" },
            { value: "double-bookings", label: "Double bookings" },
            { value: "payments", label: "Payments" },
            { value: "staff", label: "Staff / CSRs" },
            { value: "finance", label: "Finance and reports" },
            { value: "website", label: "No website" },
          ],
        },
      ],
    },
    {
      title: "When do you need it?",
      short: "Timing",
      questions: [
        { key: "ready", label: "When do you need it?", control: "cards", options: READY },
        {
          key: "website",
          label: "Your current website or page",
          control: "text",
          optional: true,
          placeholder: "https://",
        },
      ],
    },
  ],
  other: [
    {
      title: "What is it about?",
      short: "About",
      questions: [
        {
          key: "topic",
          label: "Topic",
          control: "select",
          options: [
            { value: "collab", label: "Brand collaboration" },
            { value: "speaking", label: "Speaking or an event" },
            { value: "media", label: "Media or an interview" },
            { value: "partnership", label: "Partnership" },
            { value: "other", label: "Something else" },
          ],
        },
        {
          key: "details",
          label: "Tell us more",
          control: "textarea",
          placeholder: "A few lines is enough.",
        },
      ],
    },
  ],
};

export type Answers = Record<string, string | string[]>;

export function isAnswered(q: Question, answers: Answers): boolean {
  if (q.optional) return true;
  const v = answers[q.key];
  return Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim() !== "";
}

export function screenDone(screen: Screen, answers: Answers): boolean {
  return screen.questions.every((q) => isAnswered(q, answers));
}

/** Every question of a type, flattened — for read-backs. */
export function questionsFor(type: LeadType): Question[] {
  return SCREENS[type].flatMap((s) => s.questions);
}

/** An answer as words: "₱5M – ₱10M", "Airbnb, Booking.com". */
export function answerLabel(q: Question, value: unknown): string {
  if (value == null || value === "") return "—";
  const lookup = (v: string) => q.options?.find((o) => o.value === v)?.label ?? v;
  if (Array.isArray(value)) return value.map((v) => lookup(String(v))).join(", ") || "—";
  return lookup(String(value));
}

export function optionLabel(options: Option[], value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  return options.find((o) => o.value === value)?.label ?? value;
}

/** "Management · Tagaytay · 2 – 3 properties" — the status line in a list row. */
export function leadSummary(type: LeadType, answers: Record<string, unknown>): string {
  const parts: string[] = [TYPES[type].short];
  const loc = optionLabel(LOCATIONS, answers["location"]);
  if (loc && answers["location"] !== "not-sure") parts.push(loc);
  const qs = questionsFor(type);
  const pick = (key: string, skip: string[] = []) => {
    const q = qs.find((x) => x.key === key);
    const v = answers[key];
    if (q && typeof v === "string" && v && !skip.includes(v)) parts.push(answerLabel(q, v));
  };
  if (type === "invest") pick("amount", ["discuss"]);
  if (type === "system") {
    const units = optionLabel(qs.find((q) => q.key === "units")?.options ?? [], answers["units"]);
    if (units && answers["units"] !== "none") parts.push(`${units} units`);
  } else if (type !== "other") {
    const n = answers["properties"];
    if (typeof n === "string" && n !== "0")
      parts.push(n === "1" ? "1 property" : `${optionLabel(PROPERTIES, n)} properties`);
  }
  if (type === "other") pick("topic");
  return parts.join(" · ");
}

export const STAGES: { value: LeadStage; label: string; client: string }[] = [
  { value: "new", label: "New", client: "Received" },
  { value: "talking", label: "Talking", client: "In conversation" },
  { value: "call_booked", label: "Call booked", client: "Call scheduled" },
  { value: "proposal_sent", label: "Proposal sent", client: "Proposal sent" },
  { value: "won", label: "Won", client: "In progress" },
  { value: "lost", label: "Lost", client: "Closed" },
];

export const LOST_REASONS = ["Budget", "Timing", "No reply", "Not a fit", "Went elsewhere"];

export function stageLabel(stage: LeadStage, viewer: "staff" | "client" = "staff"): string {
  const s = STAGES.find((x) => x.value === stage);
  return s ? (viewer === "staff" ? s.label : s.client) : stage;
}

/** The dot colour beside a stage — status, not decoration. */
export function stageTone(stage: LeadStage): string {
  switch (stage) {
    case "new":
      return "bg-primary";
    case "talking":
      return "bg-info";
    case "call_booked":
    case "proposal_sent":
      return "bg-warning";
    case "won":
      return "bg-success";
    case "lost":
      return "bg-muted-foreground";
  }
}
