/**
 * Who the site is for, and everything that says he's the real thing.
 *
 * Every number here has a source, noted beside it. A count we could not read
 * (Facebook hides page followers from anything that isn't a logged-in browser)
 * is `null`, and the page simply leaves it off — fill it in and it appears.
 */
import type { Platform } from "@/components/site/logos";

export const BRAND = {
  name: "Marj Lopez",
  wordmark: "MARJ LOPEZ",
  tagline: "Founder · Malaya Villas",
  description:
    "Start an Airbnb business, build your own rental, or get a booking system like Malaya's. Tell Marj's team what you need and we'll reply in your inbox.",
  team: "Team Marj",
  base: "Tagaytay City",
} as const;

/** His Airbnb host card (airbnb.com/users/profile/1470069672972419834, 2026-10-25). */
export const AIRBNB_HOST = {
  name: "Marjun",
  reviews: 74,
  rating: 4.47,
  yearsHosting: 3,
  url: "https://www.airbnb.com/users/profile/1470069672972419834",
  bio: "I'm a single dad of 4, a content creator, and a businessman, striving to provide my kids with a better future. Growing up without a home, I dreamed of having one. I started renting and trying out various accommodations like hotels, staycations, and Airbnb, and I found joy in it. That's why I decided to start my own rental business. I love places with great views, so my units are simple as long as there's a great view from the balcony.",
};

/** Instagram @mrjnlpzg (read 2026-10-25). */
export const INSTAGRAM = {
  handle: "mrjnlpzg",
  url: "https://www.instagram.com/mrjnlpzg/",
  followers: "33K",
  bio: "Building profitable Airbnb properties. Managing multiple villas in PH. Open for investors & property partnerships.",
};

/** Malaya's guest reviews by platform (Malaya OBS v_public_review_platforms, 2026-10-25). */
export const REVIEW_SCORES = [
  { platform: "airbnb" as Platform, reviews: 72, line: "4.46 ★ average" },
  { platform: "google" as Platform, reviews: 31, line: "4.13 ★ average" },
  { platform: "facebook" as Platform, reviews: 99, line: "90 of 99 recommend" },
];
export const TOTAL_REVIEWS = REVIEW_SCORES.reduce((n, r) => n + r.reviews, 0);

export interface ProfileLink {
  platform: Platform | "web";
  name: string;
  handle: string;
  url: string;
  /** Shown big on the card when known, e.g. "33K followers". */
  stat: string | null;
  kind: "personal" | "page" | "listing" | "site";
}

export const LINKS: ProfileLink[] = [
  {
    platform: "instagram",
    name: "Marj Lopez",
    handle: "@mrjnlpzg",
    url: INSTAGRAM.url,
    stat: `${INSTAGRAM.followers} followers`,
    kind: "personal",
  },
  {
    platform: "facebook",
    name: "Marj Lopez",
    handle: "Personal profile",
    url: "https://www.facebook.com/marj.lopez.264561",
    stat: null,
    kind: "personal",
  },
  {
    platform: "airbnb",
    name: "Marjun · Host",
    handle: "Identity verified",
    url: AIRBNB_HOST.url,
    stat: `${AIRBNB_HOST.rating} ★ · ${AIRBNB_HOST.reviews} reviews`,
    kind: "personal",
  },
  {
    platform: "facebook",
    name: "Malaya Staycations",
    handle: "Tagaytay City",
    url: "https://www.facebook.com/malayastaycations",
    stat: null,
    kind: "page",
  },
  {
    platform: "facebook",
    name: "Malaya Villa",
    handle: "Tagaytay City",
    url: "https://www.facebook.com/malayavillaa",
    stat: null,
    kind: "page",
  },
  {
    platform: "facebook",
    name: "Malaya Hidden Villas",
    handle: "Tagaytay City",
    url: "https://www.facebook.com/malayahidden",
    stat: null,
    kind: "page",
  },
  {
    platform: "facebook",
    name: "Malaya Villa – Bacoor",
    handle: "Bacoor, Cavite",
    url: "https://www.facebook.com/malayavillabacoor",
    stat: null,
    kind: "page",
  },
  {
    platform: "airbnb",
    name: "Hidden Villas · Main Villa",
    handle: "airbnb.com/h/malayahiddenmain",
    url: "https://www.airbnb.com/h/malayahiddenmain",
    stat: null,
    kind: "listing",
  },
  {
    platform: "airbnb",
    name: "Hidden Villas · Cabin",
    handle: "airbnb.com/h/malayahiddenvillascabin",
    url: "https://www.airbnb.com/h/malayahiddenvillascabin",
    stat: null,
    kind: "listing",
  },
  {
    platform: "airbnb",
    name: "Hidden Villas · Loft House",
    handle: "airbnb.com/h/malayahiddenlofthouse",
    url: "https://www.airbnb.com/h/malayahiddenlofthouse",
    stat: null,
    kind: "listing",
  },
  {
    platform: "airbnb",
    name: "Tagaytay Cabin",
    handle: "airbnb.com/h/tagaytaycabin",
    url: "https://www.airbnb.com/h/tagaytaycabin",
    stat: null,
    kind: "listing",
  },
  {
    platform: "web",
    name: "Malaya Villas",
    handle: "malayavillas.com",
    url: "https://www.malayavillas.com",
    stat: "Book direct",
    kind: "site",
  },
];

/** Real guest reviews from Malaya's site, word for word (… where cut) — first names only, as Malaya shows them. */
export const GUEST_REVIEWS: {
  platform: Platform;
  name: string;
  villa: string;
  when: string;
  text: string;
}[] = [
  {
    platform: "airbnb",
    name: "Charisma",
    villa: "Main Villa",
    when: "April 2026",
    text: "If you're looking for affordable, quick getaway, but beautiful place to stay with family or barkada. Marjun's place is recommended. :)",
  },
  {
    platform: "airbnb",
    name: "Jen",
    villa: "Malaya Villas",
    when: "July 2026",
    text: "My Tita who came home from US was stunned! I was very much complimented for booking the place. The caretaker ate Renalyn was very friendly and helpful too! Will definitely be back🫶🏻",
  },
  {
    platform: "facebook",
    name: "Lhenskiey",
    villa: "Villa 2",
    when: "May 2026",
    text: "We enjoy our stay here in Malaya Villa 2 My family enjoy the whole villa also the view of taal The ambiance we will come back again and recommend these to our friends. Ang sosyal pa ng interior ng house Sobra bait pa ng mga caretaker nila worth it ang price ❤️🥰",
  },
  {
    platform: "google",
    name: "Jon",
    villa: "Hidden Villas",
    when: "June 2026",
    text: "Malaya Hidden Villas in Tagaytay is so PERFECT for its price. The rooms are hotel like that you would like to just tuckin for the day. The pool and the dinning area was just relaxing. The caretakers Kuya Bert and the other kuya was so attending. FIVE STARS",
  },
  {
    platform: "airbnb",
    name: "Pamela",
    villa: "Bacoor",
    when: "November 2025",
    text: "Definitely worth the price. The location was perfect, just near the metro. The house itself is perfect. The pools were nice, the living and kitchen area is spacious and perfect for gathering and playing games…",
  },
  {
    platform: "facebook",
    name: "Emerlyn",
    villa: "Saglit",
    when: "June 2026",
    text: "the place is so beautiful! ang lakas maka mayaman!! hahaha!!! its good for family gathering and intimate event! babalik talaga kmi ulit dito!!🫶🏻 kudos to the owner!👏",
  },
  {
    platform: "facebook",
    name: "Motochicess",
    villa: "Casa Martha",
    when: "June 2026",
    text: "Our group had an amazing stay at Casa Martha. The villa was comfortable, private, and perfect for spending quality time with family and friends. We highly recommend this place to anyone looking for a relaxing getaway in Tagaytay.",
  },
  {
    platform: "airbnb",
    name: "Elyza",
    villa: "Villa 2",
    when: "February 2026",
    text: "We enjoyed our stay at the villa— peaceful and beautiful surroundings. Super bait din ng mga caretaker pati ng owner— they’re very much responsive. 10/10 for family reunion/bonding kasi talagang nakakawala ng stress. 💗💗💗",
  },
  {
    platform: "google",
    name: "Leazelle",
    villa: "Hidden Villas",
    when: "June 2026",
    text: "Our stay at Malaya Hidden Villa was incredibly cozy and relaxing. The peaceful atmosphere, calming ambiance, and comfortable setup made it the perfect place to unwind and recharge. It truly felt like a hidden escape away from the busy city…",
  },
];
