/**
 * The four offer pages — every word on them lives here, so changing a page is
 * changing this file, not the layout (components/site/offer-page.tsx).
 *
 * The boss's brief (2026-10-28): each option gets its own page, the way a
 * masterclass sales page walks you down — who he is, what you get, proof,
 * the honest catch, what happens after you sign up — "but not like an AI
 * slop". So: his real numbers and photos only, no invented testimonials,
 * no income claims, no countdown timers. Where a fee or a date isn't decided
 * yet, the page says it's sent in the Inbox instead of making one up.
 */
import { AIRBNB_HOST, TOTAL_REVIEWS } from "./brand";
import { PORTFOLIO } from "./villas";
import type { LeadType } from "./types";

export type OfferSlug = "management" | "seminar" | "invest" | "system";

export interface Offer {
  slug: OfferSlug;
  type: LeadType;
  /** The small caps line over the headline, and the page's tab title. */
  name: string;
  headline: [string, string];
  sub: string;
  hero: { src: string; position?: string };
  cta: string;
  /** Three short lines under the hero: what, how long, for whom. */
  facts: string[];

  why: { heading: string; body: string; before: Shot; after: Shot };
  gets: { heading: string; lead: string; items: { title: string; body: string }[] };
  /** Who it is for, and who it isn't — the honest part, and how we spot the best clients. */
  fit: { yes: string[]; no: string[] };
  catchLine: { heading: string; body: string };
  steps: { title: string; body: string }[];
  faq: { q: string; a: string }[];
  closing: { heading: string; body: string };
}

interface Shot {
  src: string;
  /** The tag on the photo; "Then · " / "Now · " is added unless `plain`. */
  label: string;
  plain?: boolean;
  caption: string;
  position?: string;
}

/**
 * Shared proof — the same real numbers the landing page uses. The Facebook
 * count is the one set in the website editor (landing → numbers).
 */
export const proofWith = (facebookFollowers: string) => [
  { big: `${PORTFOLIO.villas}`, small: "villas Malaya runs today" },
  { big: `${TOTAL_REVIEWS}+`, small: "guest reviews across Airbnb, Google, Facebook" },
  {
    big: `${AIRBNB_HOST.rating}★`,
    small: `Marj's own Airbnb host rating, ${AIRBNB_HOST.reviews} reviews`,
  },
  { big: facebookFollowers, small: "follow him on Facebook" },
];

const BARE_LOT: Shot = {
  src: "/builds/lian/1.webp",
  label: "Breaking ground",
  caption: "Lian, Batangas — walls and the plunge pool's shell.",
};
const DONE: Shot = {
  src: "/builds/lian/4.webp",
  label: "Airbnb-ready",
  caption: "The same lot: two 60 sqm beach cabins, furnished.",
};

export const OFFERS: Record<OfferSlug, Offer> = {
  management: {
    slug: "management",
    type: "management",
    name: "Property management",
    headline: ["Your property, run", "like a Malaya villa"],
    sub: "You own it. Marj's team lists it, prices it, talks to every guest, and sends the cleaners. You get a monthly report and your payout.",
    hero: { src: "/malaya/villa-exterior.webp", position: "center 40%" },
    cta: "Apply for management",
    facts: [
      "Listing, guests, cleaning, payouts",
      "Same system that runs Malaya",
      "For owners in Cavite, Batangas, Tagaytay",
    ],
    why: {
      heading: "We already do this every day — for ourselves",
      body: `Malaya started as one rented staycation. Today the team runs ${PORTFOLIO.villas} villas with ${PORTFOLIO.bedrooms} bedrooms between them, from one inbox. Managing your place is the same work, on one more address.`,
      before: {
        src: "/villas/pr-hidden/0.webp",
        label: "One property",
        caption: "How it starts: one villa, and the owner answering every message himself.",
      },
      after: {
        src: "/brand/about-tagaytay-aerial.webp",
        label: `${PORTFOLIO.villas} villas, one team`,
        caption: "Now: a team, a booking system, and a routine for every check-in.",
      },
    },
    gets: {
      heading: "What we take off your hands",
      lead: "Everything between a guest finding your place and the money landing in your account.",
      items: [
        {
          title: "Listing and pricing",
          body: "Photos, title, house rules, and prices that move with weekends, holidays and the season — on Airbnb and direct.",
        },
        {
          title: "Every guest message",
          body: 'Inquiries, check-in instructions, the 11pm "where\'s the key" — answered by the team, not you.',
        },
        {
          title: "Cleaning and turnover",
          body: "Cleaners booked around every stay, linens and supplies checked, damage reported with photos.",
        },
        {
          title: "A report you can read",
          body: "Each month: nights booked, what came in, what went out, what's next. Your payout follows.",
        },
      ],
    },
    fit: {
      yes: [
        "You own one or more properties — or you're finishing one",
        "It's near where Malaya already operates, or you're open to that",
        "You want it earning without it becoming your second job",
      ],
      no: [
        "You don't own or control the property yet",
        "You want a guaranteed monthly rent — this is a share of what it actually earns",
        "You'd rather keep making every call yourself",
      ],
    },
    catchLine: {
      heading: "Straight answer: we don't take every property",
      body: "A place that won't book makes both of us look bad. So before anything is signed, the team looks at where it is, what it is, and what similar places earn — and tells you honestly if it's a fit. If it isn't, you still leave with the numbers.",
    },
    steps: [
      {
        title: "Tell us about the property",
        body: "How many, where, and when you could hand it over. Two minutes.",
      },
      {
        title: "We reply in your Inbox",
        body: "Usually within a day, with a few questions and a time for a call.",
      },
      {
        title: "Walkthrough and numbers",
        body: "We see the place (in person or on video) and show you what it could earn and what we'd charge.",
      },
      {
        title: "Hand over the keys",
        body: "Sign, we set it up, and it goes live under Malaya's routine.",
      },
    ],
    faq: [
      {
        q: "How much do you charge?",
        a: "A share of booking revenue, agreed in writing before we start. It depends on the property and the work — we give you the exact figure after the walkthrough, not before we've seen it.",
      },
      {
        q: "Do I still own and control my property?",
        a: "Yes. It's your property and your listing income. We run it for you; you can block dates for your own stays.",
      },
      {
        q: "Where do you operate?",
        a: "Malaya's villas are in Tagaytay, Cavite and Batangas, with one opening in Tarlac. Close to those is easiest. Farther out, ask anyway.",
      },
      {
        q: "What if it's not finished yet?",
        a: "Apply now. Owners who talk to us before furnishing usually save money — we'll tell you what guests actually pay for.",
      },
    ],
    closing: {
      heading: "Two ways this goes",
      body: "Keep answering guests at midnight and chasing cleaners — or let the team that already does it for a living take it on. Either way, the first conversation costs nothing.",
    },
  },

  seminar: {
    slug: "seminar",
    type: "seminar",
    name: "Seminar",
    headline: ["Start an Airbnb", "the way Marj did"],
    sub: "One day with Marj on the whole thing: finding the place, the real costs, listing it so it books, and running it without living on your phone.",
    hero: { src: "/brand/marj.webp", position: "62% center" },
    cta: "Register for the next batch",
    facts: ["In person or online", "Small batches", "Beginners and new hosts"],
    why: {
      heading: "He learned it the expensive way",
      body: `"Growing up without a home, I dreamed of having one." Marj started out renting staycations, then hosting them, then building them. ${PORTFOLIO.villas} villas later, the seminar is the short version of what that took.`,
      before: BARE_LOT,
      after: DONE,
    },
    gets: {
      heading: "What you'll walk out with",
      lead: "Not motivation. The actual steps, with the numbers from Malaya's own villas.",
      items: [
        {
          title: "Where to start",
          body: "Your own property, a property you lease, or a partner's — what each needs and what each risks.",
        },
        {
          title: "The real costs",
          body: "What furnishing, permits, deposits and the first months actually cost, line by line.",
        },
        {
          title: "A listing that books",
          body: `Photos, title, pricing and reviews — what moves a listing up, from a host with ${AIRBNB_HOST.reviews} Airbnb reviews of his own.`,
        },
        {
          title: "Running it, not just starting it",
          body: "Cleaning, guest messages, payments and staff — the routine that keeps it from eating your week.",
        },
      ],
    },
    fit: {
      yes: [
        "You're serious about starting within the next few months",
        "You have a property, capital set aside, or both",
        "You're already hosting and want to grow past one unit",
      ],
      no: [
        "You're looking for a get-rich-quick scheme — there isn't one here",
        "You want someone to do it for you (see property management instead)",
      ],
    },
    catchLine: {
      heading: "Straight answer: what's the catch?",
      body: "There's a fee, and seats are limited so Marj can actually answer questions. If you're further along — you have properties and want them run, or you want to invest — the seminar may not be the right door. Tell us where you are and the team will point you to the one that is.",
    },
    steps: [
      {
        title: "Register here",
        body: "Tell us where you are and when you want to start. Two minutes.",
      },
      {
        title: "Get the details in your Inbox",
        body: "Date, venue or link, and the fee for the next batch — sent to you directly.",
      },
      { title: "Save your seat", body: "Confirm and pay to hold it. Batches are kept small." },
      {
        title: "Show up with questions",
        body: "Bring your numbers. The day is built around them.",
      },
    ],
    faq: [
      {
        q: "When is the next batch, and how much?",
        a: "Each batch's date, venue and fee are sent in your Inbox once you register — that way you get the current one, not an old post.",
      },
      {
        q: "I don't own a property. Is this for me?",
        a: "Yes — leasing and partnering are covered. You'll know by the end whether starting now makes sense for you.",
      },
      { q: "Is it in Tagalog or English?", a: "Taglish, the way Marj talks on his page." },
      {
        q: "Can I bring my partner?",
        a: "Say so when you register and the team will tell you how.",
      },
    ],
    closing: {
      heading: "Two ways this goes",
      body: "Keep watching other people's villa tours — or spend a day with someone who's built the thing, and leave knowing your next step. Registering doesn't commit you to anything.",
    },
  },

  invest: {
    slug: "invest",
    type: "invest",
    name: "Invest with Marj",
    headline: ["Own part of the", "next Malaya villa"],
    sub: "Put capital into a villa Malaya builds and runs, or build on land you already own with Marj's team doing the work. You see every number before you commit.",
    hero: { src: "/malaya/villa-aerial.webp", position: "center" },
    cta: "Talk to Marj about investing",
    facts: ["Villas Malaya builds and runs", "Every deal in writing", "You see the numbers first"],
    why: {
      heading: "From bare lot to booked — he's done it, start to finish",
      body: `Malaya doesn't just manage villas, it builds them. Lian, Batangas went from a bare lot to two furnished beach cabins. Villa no. ${PORTFOLIO.villas + 1}, near Clark, is already acquired. Investors come in on projects like these.`,
      before: BARE_LOT,
      after: {
        src: "/villas/next.webp",
        label: "Acquired · Tarlac",
        caption: `Villa no. ${PORTFOLIO.villas + 1} — 10 minutes from Clark Airport, opening soon.`,
        position: "46% 62%",
      },
    },
    gets: {
      heading: "Ways to come in",
      lead: "Every investor's situation is different, so these are starting points for the conversation — not packages.",
      items: [
        {
          title: "Co-own a villa",
          body: "A share in a villa that Malaya lists, runs and reports on, with your share of what it earns.",
        },
        {
          title: "Fund the next project",
          body: "Come in on a villa Malaya is building, with the costs, timeline and terms laid out before you decide.",
        },
        {
          title: "Build on your own land",
          body: "You have the lot. Marj's team designs, builds and then runs it, the way Lian was done.",
        },
      ],
    },
    fit: {
      yes: [
        "You have capital ready, or will within a few months",
        "You think in years, not weeks",
        "You want to see the books, not just the photos",
      ],
      no: [
        "You need a guaranteed return — rentals earn what they book, and some months are slow",
        "You can't afford for this money to be tied up for a while",
      ],
    },
    catchLine: {
      heading: "Straight answer: nothing here is guaranteed",
      body: "Anyone promising you a fixed monthly return on an Airbnb is guessing or hiding something. What you get instead is the real history of Malaya's villas, the project's actual costs, and a written agreement you can take to your own lawyer before a single peso moves.",
    },
    steps: [
      {
        title: "Tell us what you're thinking",
        body: "A range, what interests you, and when the funds are ready. Nothing is committed here.",
      },
      {
        title: "A call with Marj",
        body: "He walks you through current projects and what investors there have seen.",
      },
      {
        title: "See the numbers",
        body: "Costs, timeline, how earnings are shared and reported — on paper.",
      },
      {
        title: "Decide in your own time",
        body: "Review the agreement with your lawyer. Sign only if it makes sense.",
      },
    ],
    faq: [
      {
        q: "What's the minimum?",
        a: "It depends on the project. Tell us your range and the team will say which ones fit it.",
      },
      {
        q: "What returns can I expect?",
        a: "We'll show you what Malaya's villas have actually earned and what a project's costs are — not a promised percentage. Rentals have good months and slow ones.",
      },
      {
        q: "Is it in writing?",
        a: "Always. Every arrangement is a written agreement you review before anything is paid.",
      },
      {
        q: "Can I visit the villas?",
        a: "Yes. Seeing a working villa is the best way to judge one — ask on the call.",
      },
    ],
    closing: {
      heading: "Two ways this goes",
      body: "Keep the money where it is — or have one honest conversation about putting it into something you can visit, stay in, and read the books of. The call is free.",
    },
  },

  system: {
    slug: "system",
    type: "system",
    name: "System for your resort",
    headline: ["The system that", "runs Malaya Villas"],
    sub: "A website guests book on, one inbox for every message, a calendar that doesn't double-book, and payments and reports — built for resorts and villas, used every day by Malaya.",
    hero: { src: "/system/inbox.webp" },
    cta: "Get a demo",
    facts: [
      "Website + inbox + bookings + payments",
      "Runs Malaya's villas today",
      "Resorts, villas, inns, glamping",
    ],
    why: {
      heading: "Built because Malaya needed it",
      body: `With ${PORTFOLIO.villas} villas, several Facebook pages and listings on Airbnb, messages got lost and dates got double-booked. So Malaya built its own system. It's what the team runs on now — and what you'd get.`,
      before: {
        src: "/brand/about-team.webp",
        label: "Who uses it",
        plain: true,
        caption: "Team Malaya — the people who use it every day.",
        position: "30% center",
      },
      after: {
        src: "/villas/pr-casa-martha/0.webp",
        label: "What it runs",
        plain: true,
        caption: "Every one of them booked, messaged and paid through it.",
      },
    },
    gets: {
      heading: "What's inside",
      lead: "One login for the whole resort, on a laptop or a phone.",
      items: [
        {
          title: "Your own booking website",
          body: "Your rooms or villas, photos and rates, with guests booking and paying directly — no commission.",
        },
        {
          title: "One inbox",
          body: "Every guest conversation in one place, with saved replies, photos, and who's handling what.",
        },
        {
          title: "Calendar and bookings",
          body: "Syncs with Airbnb and the other sites, so a date sold on one is closed on the rest.",
        },
        {
          title: "Payments and reports",
          body: "Online payments, deposits, and the month's numbers without a spreadsheet.",
        },
      ],
    },
    fit: {
      yes: [
        "You run a resort, villas or an inn — or open within months",
        "You have more than one unit, or more messages than you can answer",
        "You're tired of double bookings and lost inquiries",
      ],
      no: [
        "You only want an Airbnb listing — Airbnb already does that",
        "You're not operating and not opening soon",
      ],
    },
    catchLine: {
      heading: "Straight answer: it's not a template",
      body: "It's set up for your property — your rooms, your rates, your payment methods — which takes a few weeks and has a setup cost. In exchange it does what Malaya needs it to, because Malaya uses it.",
    },
    steps: [
      {
        title: "Tell us about your resort",
        body: "How many units, where you're listed, and what's hurting. Two minutes.",
      },
      {
        title: "See it running",
        body: "A demo on a call, using a real resort's setup — not slides.",
      },
      {
        title: "Get a proposal",
        body: "What you'd get, how long setup takes, and the price — in writing.",
      },
      { title: "Go live", body: "We set it up with your rooms and rates and train your staff." },
    ],
    faq: [
      {
        q: "How much does it cost?",
        a: "It depends on how many units and what you need. You get the exact figure in the proposal after the demo.",
      },
      {
        q: "Does it work with Airbnb, Booking.com and Agoda?",
        a: "Calendars sync with them, so your dates stay closed everywhere. Guests can also book you directly.",
      },
      {
        q: "Can my staff use it?",
        a: "Yes — each person gets their own login, and you see who answered what.",
      },
      {
        q: "How long until it's live?",
        a: "Usually a few weeks, depending on how many units and how much content is ready.",
      },
    ],
    closing: {
      heading: "Two ways this goes",
      body: "Keep running the resort from five apps and a notebook — or see the one system Malaya runs everything on. A demo takes half an hour.",
    },
  },
};

export const OFFER_ORDER: OfferSlug[] = ["management", "seminar", "invest", "system"];

/** The page path for an offer — what the landing, footer and form link to. */
export const offerPath = (slug: OfferSlug) => `/${slug}` as const;
