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

import { FACEBOOK, INSTAGRAM } from "./brand";
import { OFFER_ORDER, OFFERS, type Offer, type OfferSlug } from "./offers";
import { PORTFOLIO, VILLAS, villaPhoto } from "./villas";

// ------------------------------------------------------------------ landing

/**
 * The landing, cut down to the boss's framework (2026-11-03): a clear
 * message, the four offers, one line of proof (Malaya), and who Marj is.
 * The villas, the build and the reviews moved to the offer pages they prove.
 * The four offers' words (pillar, name, who it's for) come from each offer's
 * own page, so they're edited there.
 */
export interface LandingContent {
  numbers: { facebook: string; instagram: string };
  hero: {
    eyebrow: string;
    headline: [string, string];
    sub: string;
    photo: string;
  };
  offers: { heading: string; lead: string };
  proof: { heading: string; body: string; photos: { src: string }[] };
  meet: { eyebrow: string; heading: string; story: string; pitch: string[]; photo: string };
}

export const LANDING_DEFAULT: LandingContent = {
  numbers: { facebook: FACEBOOK.followers, instagram: INSTAGRAM.followers },
  hero: {
    eyebrow: "Hospitality entrepreneur · Operator · Business builder",
    headline: ["Building hospitality", "businesses that earn"],
    sub: `Marj runs ${PORTFOLIO.villas} villas under Malaya. Pick what you need below | have it managed, learn it, invest in it, or systemize it.`,
    // The full-screen hero and the preloader's photo: Casa Martha's pool at
    // sunset, at the full 2000px Malaya uploaded (public/hd). Each villa's
    // cover is only ~1450px even at the source, too soft for a full screen.
    photo: "/hd/casa-martha-sunset.webp",
  },
  offers: {
    heading: "One expertise, four ways in",
    lead: "Building and growing hospitality businesses. Pick the one that fits where you are.",
  },
  proof: {
    heading: "Malaya | the proof it works",
    body: "Real villas, actual operations, systems, and documented projects. Everything Marj offers, he runs here first.",
    // The first photos of the landing's gallery wall (more follow from the
    // villas). The old first one, a frame from a drone video, read as blurry.
    photos: [
      { src: "/villas/pr-saglit/2.webp" },
      { src: "/villas/pr-casa-martha/6.webp" },
      { src: "/villas/pr-012/2.webp" },
      { src: "/villas/pr-casa-martha/0.webp" },
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
};

// ------------------------------------------------------------------- offers

/** What the editor changes on an offer page — everything but which offer it is. */
export type OfferContent = Omit<Offer, "slug" | "type">;

export function offerDefault(slug: OfferSlug): OfferContent {
  const { slug: _s, type: _t, ...rest } = OFFERS[slug];
  return rest;
}

export const offerKey = (slug: OfferSlug) => `offer:${slug}` as const;

/** Every offer's row — the landing reads all four for its cards. */
export const OFFER_KEYS = OFFER_ORDER.map(offerKey);

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
  { src: "/hd/casa-martha-sunset.webp", label: "Casa Martha pool at sunset (full size)" },
  { src: "/hd/malaya-1-pool.webp", label: "Malaya Villa 1 pool (full size)" },
  { src: "/hd/casa-martha-garden.webp", label: "Casa Martha garden (full size)" },
  { src: "/hd/bacoor-aerial.webp", label: "Bacoor from above (full size)" },
  { src: "/hd/hidden-loft-pool.webp", label: "Hidden Villas loft pool (full size)" },
  { src: "/villas/pr-malaya-1/0.webp", label: "Malaya Villa 1 at sunset" },
  { src: "/villas/pr-malaya-2/6.webp", label: "Malaya Villa 2 pool" },
  { src: "/villas/pr-casa-martha/6.webp", label: "Casa Martha" },
  { src: "/villas/pr-012/2.webp", label: "Casa Grey" },
  { src: "/villas/pr-casa-martha/1.webp", label: "Casa Martha pool at dusk" },
  { src: "/villas/pr-saglit/2.webp", label: "Saglit" },
  { src: "/brand/marj.webp", label: "Marj | studio" },
  { src: "/brand/marj-family.webp", label: "Marj with family" },
  { src: "/brand/about-team.webp", label: "Team Malaya" },
  { src: "/brand/about-hero.webp", label: "Villa from above" },
  { src: "/brand/about-tagaytay-aerial.webp", label: "Tagaytay aerial" },
  { src: "/villas/next.webp", label: "Villa no. " + (PORTFOLIO.villas + 1) },
  { src: "/malaya/villa-exterior.webp", label: "Villa at night" },
  { src: "/malaya/villa-aerial.webp", label: "Villa, drone shot" },
  { src: "/malaya/villa-hillside-pool.webp", label: "Hillside pool" },
  { src: "/malaya/lanai-set-for-dinner.webp", label: "Lanai set for an event" },
  { src: "/system/dashboard.webp", label: "System | Dashboard" },
  { src: "/system/inbox.webp", label: "System | Inbox" },
  { src: "/system/calendar.webp", label: "System | Calendar" },
  { src: "/system/booking.webp", label: "System | Booking" },
  { src: "/system/site-desk.webp", label: "Malaya website" },
  ...[1, 2, 3, 4].map((n) => ({ src: `/builds/lian/${n}.webp`, label: `Lian build ${n}` })),
  ...VILLAS.map((v) => ({ src: villaPhoto(v.code, v.cover), label: v.title })),
];

export const MEDIA_BUCKET = "site-media";

export { OFFER_ORDER };
