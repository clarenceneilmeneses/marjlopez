/**
 * The inquiry form — PRD §7. What is asked, in what order, and how every
 * answer reads back in the Inbox.
 *
 * ONE SCREEN PER SUBJECT, the rule Malaya's checkout settled on after six
 * versions (villas.$code_.book.tsx there): a screen asks about one thing, its
 * controls sit under it, Next is the only way on. Taps, not typing — cards
 * and dropdowns — so it is quick from a phone after tapping a link in bio.
 *
 * The values are short stable keys; `supabase/schema.sql` reads some of them
 * (`capital`, `start_when`, `budget`, `lot`, `timeline`, `units`, `when`) to
 * decide Hot, so rename a value there too or Hot quietly stops firing.
 */
import { Building2, Home, LayoutDashboard, Mail, type LucideIcon } from "@/components/icons";
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

export const TYPES: Record<
  LeadType,
  { label: string; short: string; blurb: string; icon: LucideIcon; marks?: Mark[] }
> = {
  start: {
    label: "Start an Airbnb business",
    short: "Start",
    blurb: "Coaching on where to begin — the numbers, the location, the first listing.",
    icon: Home,
    marks: ["airbnb"],
  },
  build: {
    label: "Build my own Airbnb",
    short: "Build",
    blurb: "Design and construction of a rental that books — villa, cabin or glamping.",
    icon: Building2,
    marks: ["airbnb"],
  },
  system: {
    label: "Get a booking system",
    short: "System",
    blurb: "A website, inbox and back office like the one that runs Malaya Villas.",
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

export const TYPE_ORDER: LeadType[] = ["start", "build", "system", "other"];

export const SCREENS: Record<LeadType, Screen[]> = {
  start: [
    {
      title: "Where are you right now?",
      lead: "So we know where to start the conversation.",
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
      ],
    },
    {
      title: "Where, and how much?",
      lead: "A rough idea is fine. It helps us give you real numbers.",
      short: "Location and capital",
      questions: [
        {
          key: "location",
          label: "Where do you want to operate?",
          control: "select",
          options: LOCATIONS,
        },
        {
          key: "capital",
          label: "How much capital is ready?",
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
      title: "When, and how would you like help?",
      short: "Timing",
      questions: [
        {
          key: "start_when",
          label: "When do you want to start?",
          control: "cards",
          options: [
            { value: "asap", label: "As soon as possible" },
            { value: "1-3m", label: "In 1 – 3 months" },
            { value: "3-6m", label: "In 3 – 6 months" },
            { value: "research", label: "Just researching" },
          ],
        },
        {
          key: "help_format",
          label: "How would you like help?",
          control: "cards",
          options: [
            { value: "one-on-one", label: "1-on-1 call" },
            { value: "workshop", label: "Group workshop" },
            { value: "course", label: "A course" },
            { value: "not-sure", label: "Not sure" },
          ],
        },
      ],
    },
  ],
  build: [
    {
      title: "Do you have a lot?",
      lead: "Where the build would go.",
      short: "The lot",
      questions: [
        {
          key: "lot",
          label: "Do you have a lot?",
          control: "cards",
          options: [
            { value: "own", label: "Yes, I own one" },
            { value: "buying", label: "I'm buying one" },
            { value: "find", label: "Help me find one" },
            { value: "convert", label: "I have a house to convert" },
          ],
        },
        {
          key: "location",
          label: "Where is it, or where do you want it?",
          control: "select",
          options: LOCATIONS,
        },
      ],
    },
    {
      title: "What do you have in mind?",
      short: "The build",
      questions: [
        {
          key: "kind",
          label: "What do you want to build?",
          control: "cards",
          options: [
            { value: "villa", label: "Private villa" },
            { value: "cabin", label: "Cabin or A-frame" },
            { value: "glamping", label: "Glamping" },
            { value: "condo", label: "Condo unit fit-out" },
            { value: "not-sure", label: "Not sure yet" },
          ],
        },
        {
          key: "budget",
          label: "Budget",
          control: "select",
          options: [
            { value: "1-3m", label: "₱1M – ₱3M" },
            { value: "3-5m", label: "₱3M – ₱5M" },
            { value: "5-10m", label: "₱5M – ₱10M" },
            { value: "10m+", label: "₱10M and up" },
            { value: "unsure", label: "Not sure yet" },
          ],
        },
      ],
    },
    {
      title: "When would you build?",
      short: "Timing",
      questions: [
        {
          key: "timeline",
          label: "Timeline",
          control: "cards",
          options: [
            { value: "3m", label: "Within 3 months" },
            { value: "3-6m", label: "In 3 – 6 months" },
            { value: "6-12m", label: "In 6 – 12 months" },
            { value: "planning", label: "Just planning" },
          ],
        },
        {
          key: "lot_size",
          label: "Lot size",
          control: "text",
          optional: true,
          placeholder: "e.g. 500 sqm",
        },
      ],
    },
  ],
  system: [
    {
      title: "Tell us about your rentals",
      short: "Your rentals",
      questions: [
        {
          key: "units",
          label: "How many units do you run?",
          control: "cards",
          options: [
            { value: "1", label: "1" },
            { value: "2-5", label: "2 – 5" },
            { value: "6-15", label: "6 – 15" },
            { value: "16+", label: "16 or more" },
            { value: "none", label: "Not operating yet" },
          ],
        },
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
      ],
    },
    {
      title: "What's the biggest headache?",
      lead: "Pick as many as you like.",
      short: "Headaches",
      questions: [
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
        {
          key: "when",
          label: "When do you need it?",
          control: "cards",
          options: [
            { value: "asap", label: "As soon as possible" },
            { value: "1-3m", label: "In 1 – 3 months" },
            { value: "looking", label: "Just looking" },
          ],
        },
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

/** "Build · Tagaytay · ₱5M – ₱10M" — the status line in a list row. */
export function leadSummary(type: LeadType, answers: Record<string, unknown>): string {
  const parts: string[] = [TYPES[type].short];
  const loc = optionLabel(LOCATIONS, answers["location"]);
  if (loc && answers["location"] !== "not-sure") parts.push(loc);
  const qs = questionsFor(type);
  const money = qs.find((q) => q.key === "budget" || q.key === "capital");
  if (money) {
    const v = answers[money.key];
    if (typeof v === "string" && v !== "na" && v !== "unsure") parts.push(answerLabel(money, v));
  }
  if (type === "system") {
    const units = qs.find((q) => q.key === "units");
    if (units && typeof answers["units"] === "string" && answers["units"] !== "none")
      parts.push(`${answerLabel(units, answers["units"])} units`);
  }
  if (type === "other") {
    const topic = qs.find((q) => q.key === "topic");
    if (topic) parts.push(answerLabel(topic, answers["topic"]));
  }
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
