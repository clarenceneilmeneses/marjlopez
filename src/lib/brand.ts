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

/** His personal Facebook, verified (screenshot from Clarence, 2026-10-25). */
export const FACEBOOK = {
  url: "https://www.facebook.com/marj.lopez.264561",
  followers: "73K",
  intro: "Entrepreneur · Manila · Malaya Villa",
  email: "mrjnlpzg@gmail.com",
  /** His cover photo's line — his own pitch, word for word. */
  headline: "We help you start & earn through Airbnb",
  pitch:
    "Helping property owners lease smarter · Connecting people through Airbnb arbitrage · Helping aspiring hosts to start & earn without owning a property",
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
  // His own accounts, biggest audience first.
  {
    platform: "facebook",
    name: "Marj Lopez",
    handle: "Verified profile",
    url: FACEBOOK.url,
    stat: `${FACEBOOK.followers} followers`,
    kind: "personal",
  },
  {
    platform: "instagram",
    name: "Marj Lopez",
    handle: "@mrjnlpzg",
    url: INSTAGRAM.url,
    stat: `${INSTAGRAM.followers} followers`,
    kind: "personal",
  },
  {
    platform: "airbnb",
    name: "Marjun",
    handle: "Identity-verified host",
    url: AIRBNB_HOST.url,
    stat: `${AIRBNB_HOST.rating} ★ · ${AIRBNB_HOST.reviews} reviews`,
    kind: "personal",
  },
  // The villas' pages. Facebook hides page follower counts from fetches —
  // put a page's count in `stat` (e.g. "12K followers") and it shows.
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
    handle: "Airbnb listing",
    url: "https://www.airbnb.com/h/malayahiddenmain",
    stat: null,
    kind: "listing",
  },
  {
    platform: "airbnb",
    name: "Hidden Villas · Cabin",
    handle: "Airbnb listing",
    url: "https://www.airbnb.com/h/malayahiddenvillascabin",
    stat: null,
    kind: "listing",
  },
  {
    platform: "airbnb",
    name: "Hidden Villas · Loft House",
    handle: "Airbnb listing",
    url: "https://www.airbnb.com/h/malayahiddenlofthouse",
    stat: null,
    kind: "listing",
  },
  {
    platform: "airbnb",
    name: "Tagaytay Cabin",
    handle: "Airbnb listing",
    url: "https://www.airbnb.com/h/tagaytaycabin",
    stat: null,
    kind: "listing",
  },
  {
    platform: "web",
    name: "malayavillas.com",
    handle: "Book direct",
    url: "https://www.malayavillas.com",
    stat: null,
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
  {
    platform: "airbnb",
    name: "Kim",
    villa: "Malaya Villas",
    when: "September 2026",
    text: "We had a wonderful stay! The place was clean, cozy, and exactly as described. The host was very accommodating and easy to communicate with. We really enjoyed our time here and would definitely love to stay again. Highly recommended! ❤️",
  },
  {
    platform: "airbnb",
    name: "Kei",
    villa: "Loft House",
    when: "July 2026",
    text: "My family & I had a great time at this villa. What you see is truly what you get. I love the set up of the place, it's spacious & clean… The caretaker is very welcoming and friendly. I would love to go back to this place!😊❤️",
  },
  {
    platform: "google",
    name: "Gio",
    villa: "Main Villa",
    when: "June 2026",
    text: "Rating this main villa 5 star! For its beautiful ambiance,cleanliness,cozy feels. Highly recommended! Perfect place to relax.",
  },
  {
    platform: "facebook",
    name: "Shadelle",
    villa: "Malaya Villas",
    when: "October 2025",
    text: "Thankyou so so much Malaya Villa for being part of my 30th birthday! Super ganda ng place, comfy and super saya ng celebration namin dito🤍 laki ng place, worth more than what we paid for🤍",
  },
  {
    platform: "airbnb",
    name: "Colleen",
    villa: "Malaya Villas",
    when: "August 2026",
    text: "My family definitely enjoyed our stay here, recommended for big family like us. Rooms are clean and the helpers are very accomodating. Thank you so much, will definitely come back herr ☺️☺️",
  },
  {
    platform: "facebook",
    name: "Bernard",
    villa: "Saglit",
    when: "May 2026",
    text: "Our family celebrated my Nanay's birthday. We had a very good time. Generous space. And a lot of instagrammable corners and views. Caretakers were very helpful.",
  },
  {
    platform: "google",
    name: "Christine",
    villa: "Hidden Villas",
    when: "July 2026",
    text: "Super relaxing and peaceful ng place. Malinis, cozy, at mababait ang staff. Perfect for a quick getaway. Will definitely come back",
  },
  {
    platform: "facebook",
    name: "Danielle",
    villa: "Malaya Villas",
    when: "March 2026",
    text: "Sobrang nag enjoy yung team ko dito! Sobrang ganda nung Villa, sobrang linis, and very accommodating ung mga tao. Mabango din ung place and very spacious. Worth it ang stay namin. ☺️",
  },
];
