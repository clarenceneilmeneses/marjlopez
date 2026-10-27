/**
 * What the public pages say, editable from Admin → Website (the boss's
 * "cms on the website of marj", 2026-10-28).
 *
 * The words written here and in lib/offers.ts are the DEFAULTS. A save in the
 * editor stores the whole page in `site_content` (one row per page) and the
 * page reads that instead. Only keys the defaults know are read back, so a
 * field added in code later still shows its default on a page saved before
 * it existed, and a field removed from code is simply ignored.
 *
 * Kept out of the editor on purpose: the villa list (it mirrors Malaya OBS's
 * listings), the guest reviews (real reviews, not copy), and the form's
 * questions (lib/score.ts ranks people by their answers).
 */
import { supabase } from "@/integrations/supabase/client";

import { FACEBOOK, INSTAGRAM, TOTAL_REVIEWS } from "./brand";
import { OFFER_ORDER, OFFERS, type Offer, type OfferSlug } from "./offers";
import { PORTFOLIO, VILLAS, villaPhoto } from "./villas";

// ------------------------------------------------------------------ landing

export interface LandingContent {
  numbers: { facebook: string; instagram: string };
  hero: {
    headline: [string, string];
    sub: string;
    photo: string;
    starters: Record<OfferSlug, { label: string; sub: string }>;
  };
  villas: { eyebrow: string; heading: string; tagline: string };
  built: {
    eyebrow: string;
    heading: string;
    facts: string[];
    sale: { show: boolean; label: string; price: string };
    cta: string;
    steps: { photo: string; step: string; note: string }[];
  };
  meet: { eyebrow: string; heading: string; story: string; pitch: string[]; photo: string };
  reviews: { eyebrow: string; heading: string };
}

export const LANDING_DEFAULT: LandingContent = {
  numbers: { facebook: FACEBOOK.followers, instagram: INSTAGRAM.followers },
  hero: {
    headline: ["Start & earn", "through Airbnb"],
    sub: `Host of ${PORTFOLIO.villas} villas in Cavite and Tagaytay. Helping aspiring hosts start and earn — even without owning a property.`,
    photo: "/brand/marj.webp",
    starters: {
      management: { label: "Manage", sub: "my property" },
      seminar: { label: "Seminar", sub: "learn from Marj" },
      invest: { label: "Invest", sub: "in a villa" },
      system: { label: "System", sub: "for my resort" },
    },
  },
  villas: {
    eyebrow: "Cavite | Tagaytay | Tarlac",
    heading: `${PORTFOLIO.villas} villas. One more coming.`,
    tagline: "Malaya Villas is the proof",
  },
  built: {
    eyebrow: "Built from the ground up · Lian, Batangas",
    heading: "From bare lot to beach cabins",
    facts: [
      "2 cabins",
      "60 sqm each",
      "High ceilings",
      "Private plunge pools",
      "5-min walk to the beach",
    ],
    sale: { show: true, label: "Now for sale", price: "₱8.8M for both" },
    cta: "Build yours",
    steps: [
      {
        photo: "/builds/lian/1.webp",
        step: "Breaking ground",
        note: "Walls, arches and the plunge pool's shell",
      },
      { photo: "/builds/lian/2.webp", step: "Shell up", note: "Glass gables in, tiles going on" },
      {
        photo: "/builds/lian/3.webp",
        step: "Finishing",
        note: "Pools tiled, lights and planters in",
      },
      {
        photo: "/builds/lian/4.webp",
        step: "Airbnb-ready",
        note: "Fully furnished, ready for guests",
      },
    ],
  },
  meet: {
    eyebrow: "Meet Marj",
    heading: `Family first. Host of ${PORTFOLIO.villas} villas.`,
    story:
      "“Growing up without a home, I dreamed of having one.” He started out renting staycations, found joy in it, and built Malaya Villas from there.",
    pitch: FACEBOOK.pitch.split(" · "),
    photo: "/brand/marj-family.webp",
  },
  reviews: { eyebrow: "Guest reviews", heading: `${TOTAL_REVIEWS}+ guests said it` },
};

// ------------------------------------------------------------------- offers

/** What the editor changes on an offer page — everything but which offer it is. */
export type OfferContent = Omit<Offer, "slug" | "type">;

export function offerDefault(slug: OfferSlug): OfferContent {
  const { slug: _s, type: _t, ...rest } = OFFERS[slug];
  return rest;
}

export const offerKey = (slug: OfferSlug) => `offer:${slug}` as const;

// -------------------------------------------------------------------- merge

const isPlain = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * The saved page laid over the defaults: objects key by key, lists and plain
 * values whole, and only where the saved value is the same kind of thing.
 */
export function mergeContent<T>(base: T, saved: unknown): T {
  if (saved === undefined || saved === null) return base;
  if (Array.isArray(base)) return (Array.isArray(saved) ? saved : base) as T;
  if (isPlain(base)) {
    if (!isPlain(saved)) return base;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(base)) out[k] = mergeContent(base[k], saved[k]);
    return out as T;
  }
  return (typeof saved === typeof base ? saved : base) as T;
}

// --------------------------------------------------------------------- read

/**
 * The saved rows for some pages, for a route's loader — so the first paint
 * (server-rendered) already has the edited words. Any failure, including the
 * table not existing yet, just means "use the defaults".
 */
export async function fetchSiteContent(keys: string[]): Promise<Record<string, unknown>> {
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("key,content")
      .in("key", keys);
    if (error || !data) return {};
    return Object.fromEntries(data.map((r) => [r.key as string, r.content as unknown]));
  } catch {
    return {};
  }
}

export const landingFrom = (rows: Record<string, unknown>) =>
  mergeContent(LANDING_DEFAULT, rows["landing"]);

export const offerFrom = (slug: OfferSlug, rows: Record<string, unknown>): Offer => ({
  ...mergeContent(offerDefault(slug), rows[offerKey(slug)]),
  slug,
  type: OFFERS[slug].type,
});

// ------------------------------------------------------------------- photos

/** The photos already on the site, offered by the editor's photo picker. */
export const SITE_PHOTOS: { src: string; label: string }[] = [
  { src: "/brand/marj.webp", label: "Marj — studio" },
  { src: "/brand/marj-family.webp", label: "Marj with family" },
  { src: "/brand/about-team.webp", label: "Team Malaya" },
  { src: "/brand/about-hero.webp", label: "Villa from above" },
  { src: "/brand/about-tagaytay-aerial.webp", label: "Tagaytay aerial" },
  { src: "/villas/next.webp", label: "Villa no. " + (PORTFOLIO.villas + 1) },
  { src: "/malaya/villa-exterior.webp", label: "Villa at night" },
  { src: "/malaya/villa-aerial.webp", label: "Villa, drone shot" },
  { src: "/malaya/villa-hillside-pool.webp", label: "Hillside pool" },
  { src: "/malaya/lanai-set-for-dinner.webp", label: "Lanai set for an event" },
  { src: "/system/dashboard.webp", label: "System — Dashboard" },
  { src: "/system/inbox.webp", label: "System — Inbox" },
  { src: "/system/calendar.webp", label: "System — Calendar" },
  { src: "/system/booking.webp", label: "System — Booking" },
  { src: "/system/site-desk.webp", label: "Malaya website" },
  ...[1, 2, 3, 4].map((n) => ({ src: `/builds/lian/${n}.webp`, label: `Lian build ${n}` })),
  ...VILLAS.map((v) => ({ src: villaPhoto(v.code, v.cover), label: v.title })),
];

export const MEDIA_BUCKET = "site-media";

export { OFFER_ORDER };
