/**
 * Malaya Villas — the proof on the landing page. Copied from Malaya's public
 * listings (v_public_listings) on 2026-10-25, photos in public/villas/<code>/
 * (the first seven of each villa, as Malaya orders them).
 *
 * `cover` and `more` are photo numbers in that folder, picked by eye: a
 * landscape cover that shows the villa at its best, then three that show
 * what's inside.
 */
export interface Villa {
  code: string;
  title: string;
  group: string;
  location: string;
  highlight: string;
  summary: string;
  bedrooms: number;
  bathrooms: number;
  maxPax: number;
  cover: number;
  more: number[];
}

export const MALAYA_SITE = "https://www.malayavillas.com";

export const VILLAS: Villa[] = [
  {
    code: "PR-MALAYA-1",
    title: "Villa 1",
    group: "Malaya Villa",
    location: "Splendido, Tagaytay",
    highlight: "Taal view · Beside Twin Lakes",
    summary:
      "A four-bedroom pool villa inside secured Splendido, beside Twin Lakes, with three balconies over Taal.",
    bedrooms: 4,
    bathrooms: 4,
    maxPax: 35,
    cover: 0,
    more: [1, 2, 4],
  },
  {
    code: "PR-MALAYA-2",
    title: "Villa 2",
    group: "Malaya Villa",
    location: "Splendido, Tagaytay",
    highlight: "Kiddie pool · Rooftop",
    summary:
      "Four en-suite bedrooms, a private pool with a kiddie pool and a rooftop, inside secured Splendido.",
    bedrooms: 4,
    bathrooms: 5,
    maxPax: 35,
    cover: 6,
    more: [1, 3, 2],
  },
  {
    code: "PR-CASA-MARTHA",
    title: "Casa Martha",
    group: "Malaya",
    location: "Kaybagal, Tagaytay",
    highlight: "Rooftop pool · 360° view",
    summary:
      "Four floors with a rooftop pool and a 360° view, a sauna and an entertainment floor, five minutes from Sky Ranch.",
    bedrooms: 5,
    bathrooms: 4,
    maxPax: 35,
    cover: 1,
    more: [0, 4, 2],
  },
  {
    code: "PR-SAGLIT",
    title: "Saglit",
    group: "Malaya",
    location: "San Jose, Tagaytay",
    highlight: "Heated pool · Central Tagaytay",
    summary: "A five-bedroom house with a heated pool, a rooftop and three balconies over Taal.",
    bedrooms: 5,
    bathrooms: 6,
    maxPax: 50,
    cover: 0,
    more: [1, 2, 6],
  },
  {
    code: "PR-012",
    title: "Casa Grey",
    group: "Malaya",
    location: "Garden Hills, Tagaytay",
    highlight: "Pool with jacuzzi · Event hall",
    summary:
      "A four-bedroom house in secured Garden Hills with a heated dipping pool, a garden and its own event hall.",
    bedrooms: 4,
    bathrooms: 4,
    maxPax: 40,
    cover: 0,
    more: [1, 4, 6],
  },
  {
    code: "PR-HIDDEN",
    title: "Main Villa",
    group: "Malaya Hidden Villas",
    location: "Iruhin West, Tagaytay",
    highlight: "Private pool · Rooftop",
    summary:
      "The big house on the Hidden Villas site — made for celebrations, gatherings and barkada weekends.",
    bedrooms: 4,
    bathrooms: 4,
    maxPax: 40,
    cover: 0,
    more: [1, 2, 5],
  },
  {
    code: "PR-HIDDEN-CABIN-A",
    title: "A Cabin",
    group: "Malaya Hidden Villas",
    location: "Iruhin West, Tagaytay",
    highlight: "A-frame · Private pool",
    summary: "A private, cozy A-frame escape with natural light and relaxing interiors.",
    bedrooms: 3,
    bathrooms: 2,
    maxPax: 20,
    cover: 0,
    more: [1, 4, 3],
  },
  {
    code: "PR-HIDDEN-CABIN-B",
    title: "B Cabin",
    group: "Malaya Hidden Villas",
    location: "Iruhin West, Tagaytay",
    highlight: "Bali-inspired glass cabin",
    summary: "The newest one — a Bali-inspired glass cabin with natural light and nature views.",
    bedrooms: 2,
    bathrooms: 1,
    maxPax: 15,
    cover: 0,
    more: [1, 4, 3],
  },
  {
    code: "PR-HIDDEN-LOFT",
    title: "Loft House",
    group: "Malaya Hidden Villas",
    location: "Iruhin West, Tagaytay",
    highlight: "Plunge pool · Minimalist loft",
    summary: "A minimalist three-bedroom stay with a homey feel and a relaxing private pool.",
    bedrooms: 3,
    bathrooms: 2,
    maxPax: 15,
    cover: 0,
    more: [2, 3, 4],
  },
  {
    code: "PR-BACOOR",
    title: "Bacoor",
    group: "Malaya Villa",
    location: "Vista Verde, Bacoor, Cavite",
    highlight: "Private pool · Game room",
    summary:
      "A five-bedroom pool villa in a 24/7-secured subdivision, with a kiddie pool, billiards and an arcade corner.",
    bedrooms: 5,
    bathrooms: 4,
    maxPax: 40,
    cover: 1,
    more: [0, 2, 4],
  },
];

export const villaPhoto = (code: string, n: number) => `/villas/${code.toLowerCase()}/${n}.webp`;
export const villaUrl = (code: string) => `${MALAYA_SITE}/villas/${code}`;

/** Bedrooms and guests across the portfolio — counted, not typed. */
export const PORTFOLIO = {
  villas: VILLAS.length,
  bedrooms: VILLAS.reduce((n, v) => n + v.bedrooms, 0),
  guests: VILLAS.reduce((n, v) => n + v.maxPax, 0),
};

/** A wall of photos for "Inside the villas" — [code, photo]. */
export const GALLERY: [string, number][] = [
  ["PR-CASA-MARTHA", 1],
  ["PR-HIDDEN-CABIN-A", 0],
  ["PR-BACOOR", 2],
  ["PR-SAGLIT", 1],
  ["PR-MALAYA-2", 6],
  ["PR-HIDDEN", 1],
  ["PR-HIDDEN-LOFT", 2],
  ["PR-HIDDEN-CABIN-B", 4],
  ["PR-MALAYA-1", 2],
  ["PR-012", 0],
  ["PR-CASA-MARTHA", 4],
  ["PR-HIDDEN-CABIN-A", 4],
  ["PR-BACOOR", 4],
  ["PR-SAGLIT", 6],
  ["PR-MALAYA-2", 1],
  ["PR-HIDDEN-LOFT", 6],
];
