/**
 * What Admin → Website shows for each page: its sections and their fields,
 * in plain words. The form is drawn from this, so making something editable
 * is adding a line here (its default lives in lib/site-content.ts).
 */
import {
  LANDING_DEFAULT,
  OFFER_ORDER,
  offerDefault,
  offerKey,
  type LandingContent,
  type OfferContent,
} from "./site-content";
import { OFFERS, offerPath, type OfferPath } from "./offers";

export type Field =
  | { kind: "text"; key: string; label: string; hint?: string; placeholder?: string }
  | { kind: "textarea"; key: string; label: string; hint?: string; rows?: number }
  /** A two-line headline, each line on its own row on the page. */
  | { kind: "pair"; key: string; label: string; hint?: string }
  /** A list of short lines — facts, checklist items. */
  | { kind: "lines"; key: string; label: string; hint?: string; add: string }
  | { kind: "toggle"; key: string; label: string; hint?: string }
  /** A photo path. `clears` is a sibling key reset when the photo changes (its crop). */
  | { kind: "image"; key: string; label: string; hint?: string; clears?: string }
  | { kind: "group"; key: string; label: string; hint?: string; fields: Field[] }
  /** A list of cards, each with the same fields — steps, FAQ, photos. */
  | {
      kind: "items";
      key: string;
      label: string;
      hint?: string;
      item: string;
      fields: Field[];
      min?: number;
      max?: number;
    };

export interface Section {
  title: string;
  hint?: string;
  /** Where the section's fields live; none = the page's top level. */
  key?: string;
  fields: Field[];
}

export interface EditablePage {
  key: string;
  label: string;
  path: "/" | OfferPath;
  base: LandingContent | OfferContent;
  sections: Section[];
}

const eyebrow = (label = "Small line above the heading"): Field => ({
  kind: "text",
  key: "eyebrow",
  label,
});
const heading: Field = { kind: "text", key: "heading", label: "Heading" };

const LANDING: Section[] = [
  {
    title: "Top of the page",
    key: "hero",
    fields: [
      { kind: "text", key: "eyebrow", label: "Small line above the headline" },
      { kind: "pair", key: "headline", label: "Headline" },
      { kind: "textarea", key: "sub", label: "Under the headline", rows: 3 },
      {
        kind: "image",
        key: "photo",
        label: "Photo",
        hint: "A portrait works best — it sits on the right on a laptop.",
      },
    ],
  },
  {
    title: "The four offers",
    key: "offers",
    hint: "Each card's word, name and \"for whom\" line are edited on that offer's own page.",
    fields: [heading, { kind: "textarea", key: "lead", label: "Under the heading", rows: 2 }],
  },
  {
    title: "Follower numbers",
    key: "numbers",
    hint: "Shown on the landing page and on every offer page. Update them as they grow.",
    fields: [
      { kind: "text", key: "facebook", label: "Facebook followers", placeholder: "73K" },
      { kind: "text", key: "instagram", label: "Instagram followers", placeholder: "33K" },
    ],
  },
  {
    title: "Malaya — the proof",
    key: "proof",
    hint: "The dark band under the offers. The four numbers come from the real counts.",
    fields: [
      heading,
      { kind: "textarea", key: "body", label: "Text", rows: 3 },
      {
        kind: "items",
        key: "photos",
        label: "Photos along the bottom",
        item: "Photo",
        min: 4,
        max: 4,
        fields: [{ kind: "image", key: "src", label: "Photo" }],
      },
    ],
  },
  {
    title: "Meet Marj",
    key: "meet",
    fields: [
      { kind: "image", key: "photo", label: "Photo", hint: "Shown square." },
      eyebrow(),
      heading,
      { kind: "textarea", key: "story", label: "His story", rows: 4 },
      { kind: "lines", key: "pitch", label: "Checklist", add: "Add a line" },
    ],
  },
];

const shot = (key: string, label: string): Field => ({
  kind: "group",
  key,
  label,
  fields: [
    { kind: "image", key: "src", label: "Photo", clears: "position" },
    { kind: "text", key: "label", label: "Tag on the photo" },
    { kind: "text", key: "caption", label: "Caption" },
  ],
});

const OFFER: Section[] = [
  {
    title: "Top of the page",
    fields: [
      {
        kind: "text",
        key: "name",
        label: "Offer name",
        hint: "The badge on the photo, and the browser tab.",
      },
      {
        kind: "text",
        key: "pillar",
        label: "One word for the landing's card",
        hint: "Manage, Learn, Invest, Systemize — shown in small caps over the name.",
      },
      {
        kind: "text",
        key: "forWhom",
        label: "Who it's for",
        hint: "One line under the name on the landing's card.",
      },
      { kind: "pair", key: "headline", label: "Headline" },
      { kind: "textarea", key: "sub", label: "Under the headline", rows: 3 },
      {
        kind: "group",
        key: "hero",
        label: "Big photo",
        fields: [{ kind: "image", key: "src", label: "Photo", clears: "position" }],
      },
      { kind: "text", key: "cta", label: "Button", hint: "Used on every button on the page." },
      {
        kind: "lines",
        key: "facts",
        label: "Three short lines under the photo",
        add: "Add a line",
      },
    ],
  },
  {
    title: "Video",
    key: "video",
    hint: "Marj explaining this offer. Paste a YouTube or Facebook video link — with no link, the section is hidden.",
    fields: [
      {
        kind: "text",
        key: "url",
        label: "Video link",
        placeholder: "https://www.youtube.com/watch?v=…",
      },
      { kind: "text", key: "heading", label: "Heading over the video" },
      { kind: "text", key: "caption", label: "Line beside the heading" },
    ],
  },
  {
    title: "Price",
    key: "price",
    hint: "Only for a fixed, public price. Shown on this page and on the landing's card.",
    fields: [
      { kind: "toggle", key: "show", label: "Show the price" },
      { kind: "text", key: "amount", label: "Price", placeholder: "₱10,000" },
      { kind: "text", key: "note", label: "Line under it" },
    ],
  },
  {
    title: "Why Marj",
    key: "why",
    fields: [
      heading,
      { kind: "textarea", key: "body", label: "Text", rows: 4 },
      shot("before", "First photo"),
      shot("after", "Second photo"),
    ],
  },
  {
    title: "What you get",
    key: "gets",
    fields: [
      heading,
      { kind: "textarea", key: "lead", label: "Under the heading", rows: 2 },
      {
        kind: "items",
        key: "items",
        label: "Cards",
        item: "Card",
        min: 1,
        max: 6,
        fields: [
          { kind: "text", key: "title", label: "Title" },
          { kind: "textarea", key: "body", label: "Text", rows: 3 },
        ],
      },
    ],
  },
  {
    title: "Who it's for",
    hint: "The part that keeps the wrong people from applying.",
    fields: [
      {
        kind: "group",
        key: "fit",
        label: "The two lists",
        fields: [
          { kind: "lines", key: "yes", label: "A good fit if", add: "Add a line" },
          { kind: "lines", key: "no", label: "Probably not if", add: "Add a line" },
        ],
      },
      {
        kind: "group",
        key: "catchLine",
        label: "The honest catch (dark box)",
        fields: [heading, { kind: "textarea", key: "body", label: "Text", rows: 4 }],
      },
    ],
  },
  {
    title: "After you apply",
    fields: [
      {
        kind: "items",
        key: "steps",
        label: "Steps",
        item: "Step",
        min: 1,
        max: 6,
        fields: [
          { kind: "text", key: "title", label: "Title" },
          { kind: "textarea", key: "body", label: "Text", rows: 2 },
        ],
      },
    ],
  },
  {
    title: "Questions",
    fields: [
      {
        kind: "items",
        key: "faq",
        label: "Questions and answers",
        item: "Question",
        max: 12,
        fields: [
          { kind: "text", key: "q", label: "Question" },
          { kind: "textarea", key: "a", label: "Answer", rows: 3 },
        ],
      },
    ],
  },
  {
    title: "Closing",
    key: "closing",
    fields: [heading, { kind: "textarea", key: "body", label: "Text", rows: 3 }],
  },
];

/**
 * System and Invest show one photo in "Why": the team photo is already in the
 * footer, and Invest's build is told by the landing's build photos.
 */
const ONE_PHOTO_OFFER: Section[] = OFFER.map((sec) =>
  sec.key === "why"
    ? {
        ...sec,
        fields: sec.fields
          .filter((f) => f.key !== "before")
          .map((f) => (f.key === "after" ? { ...f, label: "Photo" } : f)),
      }
    : sec,
);

/** Build, Rent & Sell also tells the Lian build (the landing's until 2026-11-03). */
const INVEST_OFFER: Section[] = [
  ...ONE_PHOTO_OFFER.slice(0, 3),
  {
    title: "The build",
    key: "build",
    hint: "The photos the page scrolls through, from bare lot to Airbnb-ready.",
    fields: [
      heading,
      {
        kind: "lines",
        key: "facts",
        label: "Facts",
        hint: "Shown as one line, separated by dots.",
        add: "Add a fact",
      },
      {
        kind: "group",
        key: "sale",
        label: "For-sale button",
        fields: [
          { kind: "toggle", key: "show", label: "Show it" },
          { kind: "text", key: "label", label: "Label" },
          { kind: "text", key: "price", label: "Price" },
        ],
      },
      {
        kind: "items",
        key: "steps",
        label: "Photos, in order",
        item: "Photo",
        min: 1,
        max: 8,
        fields: [
          { kind: "image", key: "photo", label: "Photo" },
          { kind: "text", key: "step", label: "Name" },
          { kind: "text", key: "note", label: "Caption" },
        ],
      },
    ],
  },
  ...ONE_PHOTO_OFFER.slice(3),
];

export const EDITABLE_PAGES: EditablePage[] = [
  { key: "landing", label: "Landing page", path: "/", base: LANDING_DEFAULT, sections: LANDING },
  ...OFFER_ORDER.map((slug) => ({
    key: offerKey(slug),
    label: OFFERS[slug].name,
    path: offerPath(slug),
    base: offerDefault(slug),
    sections: slug === "invest" ? INVEST_OFFER : slug === "system" ? ONE_PHOTO_OFFER : OFFER,
  })),
];

/** A blank value for a field — what "Add" puts in a new card. */
export function blankFor(f: Field): unknown {
  switch (f.kind) {
    case "toggle":
      return false;
    case "pair":
      return ["", ""];
    case "lines":
    case "items":
      return [];
    case "group":
      return Object.fromEntries(f.fields.map((x) => [x.key, blankFor(x)]));
    default:
      return "";
  }
}
