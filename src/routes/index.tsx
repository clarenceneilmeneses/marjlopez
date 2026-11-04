/**
 * The page the link in bio points to: the message, the four offers, the
 * proof (Malaya), and who Marj is (the boss, 2026-11-03).
 *
 * Laid out after verostudio.com (Clarence, 2026-11-04: "pretty much copy
 * vero's landing page but with the contents of marjun … u literally have
 * access to the pictures"). Vero's order, Marj's words and photos:
 *
 *   (preloader)  the headline with a photo set into it, opening to the hero
 *                (components/site/intro.tsx)
 *   Hero         full screen: Malaya at sunset, his name; pinned, it shrinks
 *   Intro        his family photo, "WE HELP you START & EARN through AIRBNB"
 *                over it (his own Facebook cover line), the message, his bio
 *   Essence      "where HOSPITALITY meets SYSTEMS", then a pinned slideshow,
 *                "from GUEST, to HOST, to OPERATOR" (his story)
 *   Offers       the four offers: a big photo held on the left that changes
 *                as each offer scrolls by on the right, with two more photos
 *   Founder      his quote beside Team Malaya, his accounts
 *   Gallery      Malaya's numbers, then a wall of villa photos drifting
 *   Quote        a guest's review in giant type, sliding, Malaya's mark
 *   Closing      the ask, and his name across the page
 *
 * The type voice (capitals, small words in italic) is components/site/vero.tsx;
 * the motion is components/site/motion.ts, driven by the data- attributes.
 * The words and photos marked "c." can be changed from Admin → Website; the
 * defaults are in lib/site-content.ts, and each offer's words in lib/offers.ts.
 * Photos were picked for sharpness (2026-11-04): no drone-video frames.
 */
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "@/components/icons";
import { useRef } from "react";

import { PublicFooter, PublicHeader } from "@/components/site/chrome";
import { usePageMotion, useSmoothScroll } from "@/components/site/motion";
import { Vero, VeroButton } from "@/components/site/vero";
import { AIRBNB_HOST, FACEBOOK, GUEST_REVIEWS, INSTAGRAM } from "@/lib/brand";
import { OFFER_ORDER, offerPath, proofWith, type Offer, type OfferSlug } from "@/lib/offers";
import {
  fetchSiteContent,
  landingFrom,
  OFFER_KEYS,
  offerFrom,
  type LandingContent,
} from "@/lib/site-content";
import { cn } from "@/lib/utils";
import { MALAYA_SITE } from "@/lib/villas";
import { usePreviewDraft } from "@/state/site";

export const Route = createFileRoute("/")({
  // The saved words, read before the page renders so the first paint has
  // them: the landing's own, and each offer's.
  loader: () => fetchSiteContent(["landing", ...OFFER_KEYS]),
  component: Landing,
});

type C = { c: LandingContent };

/** Small caps line over a heading, in the serif: "the ESSENCE of MALAYA". */
function Kicker({ text, className }: { text: string; className?: string }) {
  return (
    <p className={cn("font-vero text-[13px] tracking-[0.06em] sm:text-sm", className)}>
      <Vero text={text} />
    </p>
  );
}

/** The big headline: capitals in the serif, small words in italic. */
function Big({
  text,
  as: Tag = "h2",
  className,
  split = true,
}: {
  text: string;
  as?: "h1" | "h2" | "p";
  className?: string;
  split?: boolean;
}) {
  return (
    <Tag
      {...(split ? { "data-split": "" } : {})}
      className={cn(
        "text-balance font-vero text-[13vw] leading-[0.9] tracking-[-0.01em] text-[#181615] sm:text-[9vw] lg:text-[7.4rem]",
        className,
      )}
    >
      <Vero text={text} />
    </Tag>
  );
}

function Landing() {
  const rows = Route.useLoaderData();
  // In Admin → Website's preview frame, the unsaved words instead.
  const draft = usePreviewDraft("landing");
  const c = landingFrom(draft === undefined ? rows : { ...rows, landing: draft });
  const offers = OFFER_ORDER.map((slug) => offerFrom(slug, rows));
  const root = useRef<HTMLDivElement>(null);
  useSmoothScroll();
  usePageMotion(root);
  return (
    <div ref={root} className="min-h-screen overflow-x-clip bg-[#f3f0ed] text-[#181615]">
      <PublicHeader />
      <main id="content">
        <Hero c={c} />
        <Intro c={c} />
        <Essence />
        <Offers c={c} offers={offers} />
        <Founder c={c} />
        <Gallery c={c} />
        <GuestQuote />
        <Closing />
      </main>
      <PublicFooter />
    </div>
  );
}

// ------------------------------------------------------------------ hero

function Hero({ c }: C) {
  return (
    <section data-hero className="relative h-[calc(100svh-4.25rem)] min-h-[520px]">
      <div data-hero-media className="absolute inset-0 overflow-hidden bg-[#181615]">
        <img
          src={c.hero.photo}
          alt="Malaya Villas at sunset, Tagaytay"
          loading="eager"
          fetchPriority="high"
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_50%,rgba(0,0,0,0.3),transparent_75%)]" />
      </div>
      <div
        data-hero-mark
        className="pointer-events-none absolute inset-0 grid place-items-center px-4 text-center text-white [text-shadow:0_2px_40px_rgba(0,0,0,0.35)]"
      >
        <div>
          <h1
            data-hero-name
            className="font-vero text-[19vw] uppercase leading-[0.86] tracking-[-0.01em] sm:text-[15vw] lg:text-[12.5rem]"
          >
            Marj Lopez
          </h1>
          <p data-hero-rest className="mt-4 font-vero text-lg sm:text-2xl">
            <Vero text={c.hero.eyebrow} />
          </p>
        </div>
      </div>
      <a
        href="#intro"
        aria-label="Scroll down"
        data-hero-rest
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 transition hover:text-white"
      >
        <ChevronDown className="size-6 animate-bounce" />
      </a>
    </section>
  );
}

// ----------------------------------------------------------------- intro

/** His own bio (lib/brand.ts), the sentences about how he started. */
function startedLines(bio: string) {
  const s = bio.split(/(?<=\.)\s+/);
  return [s[0], s[2], s[3]].filter(Boolean).join(" ");
}

function Intro({ c }: C) {
  return (
    <section id="intro" className="scroll-mt-20 px-4 pb-28 pt-24 text-center sm:pt-32 lg:pb-40">
      {/* His family on the studio's white: multiplied into the beige, so the
          backdrop melts away, and faded at the foot like Vero's dress. */}
      <div className="relative mx-auto w-[min(560px,88vw)]">
        <img
          src={c.meet.photo}
          alt="Marj with his family"
          loading="lazy"
          data-parallax="-4"
          className="w-full mix-blend-multiply [mask-image:radial-gradient(ellipse_58%_56%_at_50%_44%,#000_52%,transparent_80%)]"
        />
      </div>
      <Big
        text={FACEBOOK.headline}
        className="relative mx-auto -mt-[7vw] max-w-6xl sm:-mt-[6vw] lg:-mt-20"
      />
      <p
        data-reveal
        className="mx-auto mt-12 max-w-lg text-xl font-semibold leading-snug tracking-[-0.01em] sm:text-2xl"
      >
        {c.hero.sub}
      </p>
      <p
        data-reveal
        className="mx-auto mt-5 max-w-md font-vero text-[17px] leading-relaxed text-[#181615]/75"
      >
        {startedLines(AIRBNB_HOST.bio)}
      </p>
      <div data-reveal className="mt-9">
        <VeroButton href="#offers">Work with Marj</VeroButton>
      </div>
    </section>
  );
}

// --------------------------------------------------------------- essence

/** His story in three photos (lib/offers.ts, coaching: renting, hosting, running). */
const STORY = [
  { word: "from guest,", src: "/villas/pr-malaya-2/6.webp", position: "center" },
  { word: "to host,", src: "/villas/pr-casa-martha/4.webp", position: "center" },
  { word: "to operator.", src: "/malaya/villa-aerial.webp", position: "center" },
];

function Essence() {
  return (
    <>
      <section className="px-4 pt-10 text-center">
        <Kicker text="the essence of Malaya" />
        <Big text="where hospitality meets systems" className="mx-auto mt-6 max-w-6xl" />
        <div data-reveal className="mx-auto mt-8 w-[min(300px,62vw)] overflow-hidden">
          <img
            src="/villas/pr-saglit/0.webp"
            alt="A Malaya villa's pool"
            loading="lazy"
            className="aspect-[4/5] w-full object-cover"
          />
        </div>
      </section>

      <section data-seq className="relative mt-24 h-[100svh] overflow-hidden bg-[#181615] lg:mt-32">
        {STORY.map((s, i) => (
          <div key={s.src} data-seq-slide className="absolute inset-0 overflow-hidden">
            <img
              src={s.src}
              alt=""
              loading="lazy"
              style={{ objectPosition: s.position }}
              className="size-full object-cover"
            />
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/10",
                i === 0 && "from-black/55",
              )}
            />
          </div>
        ))}
        <ul className="absolute left-4 top-1/2 flex -translate-y-1/2 flex-col gap-3 sm:left-6">
          {STORY.map((s) => (
            <li key={s.src} data-seq-dot className="block size-1.5 rotate-45 bg-white" />
          ))}
        </ul>
        <p className="absolute inset-x-0 bottom-8 px-4 text-center font-vero text-[8.5vw] leading-none text-white sm:bottom-12 sm:text-6xl lg:text-[5.2rem]">
          {STORY.map((s, i) => (
            <span key={s.word} data-seq-word className="opacity-40">
              <Vero text={s.word} />
              {i < STORY.length - 1 && " "}
            </span>
          ))}
        </p>
      </section>
    </>
  );
}

// ---------------------------------------------------------------- offers

/**
 * Each offer's photos: the big one held on the left (on a laptop), and two
 * beside its words. All real: Malaya's villas, Marj, the Lian build, the
 * system Malaya runs on.
 */
const OFFER_SHOTS: Record<
  OfferSlug,
  { main: string; position?: string; contain?: boolean; pair: [string, string] }
> = {
  management: {
    main: "/villas/pr-malaya-2/3.webp",
    pair: ["/villas/pr-hidden-cabin-a/1.webp", "/villas/pr-bacoor/0.webp"],
  },
  seminar: {
    main: "/brand/marj.webp",
    position: "60% center",
    pair: ["/brand/ptv-feature.webp", "/malaya/lanai-set-for-dinner.webp"],
  },
  invest: {
    main: "/builds/lian/3.webp",
    pair: ["/builds/lian/1.webp", "/builds/lian/4.webp"],
  },
  system: {
    main: "/system/site-phone.webp",
    contain: true,
    pair: ["/system/dashboard.webp", "/system/calendar.webp"],
  },
};

function Offers({ c, offers }: C & { offers: Offer[] }) {
  return (
    <section id="offers" className="scroll-mt-20 px-4 pt-32 sm:px-6 lg:pt-44">
      <div className="text-center">
        <Kicker text="four ways to work with Marj" />
        <Big text={c.offers.heading} className="mx-auto mt-6 max-w-6xl" />
        <p
          data-reveal
          className="mx-auto mt-8 max-w-md text-[15px] leading-relaxed text-[#181615]/70"
        >
          {c.offers.lead}
        </p>
      </div>

      <div data-collage className="mx-auto mt-16 grid max-w-[1440px] gap-6 lg:mt-24 lg:grid-cols-2">
        {/* The big photo, held while the offers scroll past (laptop only). */}
        <div className="hidden lg:block">
          <div className="sticky top-[10vh] h-[80vh] overflow-hidden bg-[#e8e3dd]">
            {offers.map((o) => {
              const s = OFFER_SHOTS[o.slug];
              return (
                <img
                  key={o.slug}
                  data-collage-shot
                  src={s.main}
                  alt=""
                  loading="lazy"
                  style={s.position ? { objectPosition: s.position } : undefined}
                  className={cn(
                    "absolute inset-0 size-full bg-[#e8e3dd]",
                    s.contain ? "object-contain p-[6%]" : "object-cover",
                  )}
                />
              );
            })}
          </div>
        </div>

        <div>
          {offers.map((o, i) => {
            const s = OFFER_SHOTS[o.slug];
            return (
              <article
                key={o.slug}
                data-collage-block
                className="flex flex-col justify-center py-10 lg:min-h-[85vh] lg:py-16"
              >
                {/* On a phone the big photo sits here, with the words under it. */}
                <div className="mb-8 aspect-[4/5] overflow-hidden bg-[#e8e3dd] lg:hidden">
                  <img
                    src={s.main}
                    alt=""
                    loading="lazy"
                    style={s.position ? { objectPosition: s.position } : undefined}
                    className={cn(
                      "size-full",
                      s.contain ? "object-contain p-[8%]" : "object-cover",
                    )}
                  />
                </div>
                <div className="hidden grid-cols-2 gap-4 lg:grid">
                  {s.pair.map((src) => (
                    <div
                      key={src}
                      data-reveal
                      className="aspect-[4/3] overflow-hidden bg-[#e8e3dd]"
                    >
                      <img
                        src={src}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover object-top transition duration-1000 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
                <div data-reveal className="mx-auto max-w-md text-center lg:mt-14">
                  <Kicker
                    text={`${String(i + 1).padStart(2, "0")} · ${o.pillar}`}
                    className="text-primary"
                  />
                  <h3 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
                    {o.name}
                  </h3>
                  <p className="mt-2 font-vero text-xl italic text-[#181615]/80">
                    {o.forWhom}
                    {o.price.show && o.price.amount && ` · ${o.price.amount}`}
                  </p>
                  <p className="mt-5 text-[15px] leading-relaxed text-[#181615]/70">{o.sub}</p>
                  <VeroButton to={offerPath(o.slug)} className="mt-8">
                    Discover the offer
                  </VeroButton>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------- founder

/** "“A quote.” The rest" → the quote, and the rest. */
function splitQuote(text: string): { quote: string | null; rest: string } {
  const m = text.match(/^\s*[“"]([^”"]+)[”"]\s*([\s\S]*)$/);
  return m ? { quote: m[1]!.trim(), rest: m[2]!.trim() } : { quote: null, rest: text };
}

function Founder({ c }: C) {
  const { quote, rest } = splitQuote(c.meet.story);
  const links = [
    { label: `Facebook · ${c.numbers.facebook}`, href: FACEBOOK.url },
    { label: `Instagram · ${c.numbers.instagram}`, href: INSTAGRAM.url },
    { label: `Airbnb · ${AIRBNB_HOST.rating}★`, href: AIRBNB_HOST.url },
    { label: "As seen on PTV", href: "https://www.youtube.com/watch?v=Uq1KitcVAwQ" },
  ];
  return (
    <section id="about" className="scroll-mt-20 px-4 pt-32 sm:px-6 lg:pt-44">
      <div className="text-center">
        <Kicker text={c.meet.eyebrow} />
        <Big text={c.meet.heading} className="mx-auto mt-6 max-w-5xl" />
      </div>
      <div className="mx-auto mt-16 grid max-w-[1440px] items-center gap-12 lg:mt-24 lg:grid-cols-2 lg:gap-6">
        <div className="overflow-hidden bg-[#e8e3dd]">
          <img
            src="/brand/about-team.webp"
            alt="Marj Lopez with Team Malaya"
            loading="lazy"
            data-parallax="-4"
            className="aspect-[5/4] w-full scale-110 object-cover object-[30%_center]"
          />
        </div>
        <div data-reveal className="mx-auto max-w-md text-center">
          {quote && (
            <blockquote className="text-[1.7rem] font-semibold leading-[1.2] tracking-[-0.02em] sm:text-[2rem]">
              “{quote}”
            </blockquote>
          )}
          <p className="mt-5 font-vero text-[15px] tracking-[0.04em]">
            <Vero text="Marj Lopez, founder of Malaya Villas" />
          </p>
          {rest && (
            <p className="mt-8 font-vero text-[17px] leading-relaxed text-[#181615]/75">{rest}</p>
          )}
          <ul className="mt-8 space-y-1.5 text-[15px] text-[#181615]/80">
            {c.meet.pitch.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap justify-center gap-2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center bg-white px-4 text-[13px] font-semibold shadow-[0_2px_14px_rgba(24,22,21,0.06)] transition-colors hover:bg-[#181615] hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------- gallery

/**
 * Malaya's villas, picked for sharpness and range (2026-11-04). The four
 * photos set in Admin → Website (landing → proof) come first.
 */
const GALLERY = [
  "/villas/pr-malaya-2/0.webp",
  "/villas/pr-hidden/5.webp",
  "/villas/pr-malaya-2/1.webp",
  "/villas/pr-saglit/4.webp",
  "/villas/pr-hidden-loft/1.webp",
  "/villas/pr-012/1.webp",
  "/villas/pr-012/0.webp",
  "/villas/pr-hidden/0.webp",
  "/villas/pr-hidden-cabin-b/0.webp",
  "/villas/pr-malaya-1/1.webp",
  "/villas/pr-hidden-loft/4.webp",
  "/villas/pr-casa-martha/0.webp",
  "/villas/pr-hidden-loft/0.webp",
  "/villas/pr-saglit/1.webp",
  "/villas/pr-hidden-cabin-a/0.webp",
];
const COL_SPEED = [10, -6, 14, -10, 8];

function Gallery({ c }: C) {
  const photos = [...new Set([...c.proof.photos.map((p) => p.src), ...GALLERY])].slice(0, 15);
  const cols = COL_SPEED.map((_, k) => photos.filter((_, i) => i % 5 === k));
  return (
    <section id="proof" className="scroll-mt-20 pt-32 lg:pt-44">
      <div className="px-4 text-center">
        <Kicker text="proof of execution" />
        <Big text={c.proof.heading} className="mx-auto mt-6 max-w-6xl" />
        <p
          data-reveal
          className="mx-auto mt-8 max-w-md text-[15px] leading-relaxed text-[#181615]/70"
        >
          {c.proof.body}
        </p>
        <dl className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-y-10 lg:grid-cols-4">
          {proofWith(c.numbers.facebook).map((p) => (
            <div key={p.small} data-reveal>
              <dt data-count className="font-vero text-6xl leading-none sm:text-7xl">
                {p.big}
              </dt>
              <dd className="mx-auto mt-3 max-w-[13rem] text-[13px] leading-snug text-[#181615]/65">
                {p.small}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative mt-24 overflow-hidden px-4 py-16 sm:px-6 lg:mt-32 lg:py-28">
        <div className="mx-auto grid max-w-[1440px] grid-cols-3 gap-x-5 sm:grid-cols-5 sm:gap-x-10 lg:gap-x-20">
          {cols.map((col, k) => (
            <div
              key={k}
              data-gallery-col={COL_SPEED[k]}
              className={cn(
                "flex flex-col gap-8 lg:gap-16",
                k > 2 && "hidden sm:flex",
                k % 2 === 1 && "pt-16",
              )}
            >
              {col.map((src) => (
                <div key={src} className="aspect-[4/5] overflow-hidden bg-[#e8e3dd]">
                  <img src={src} alt="" loading="lazy" className="size-full object-cover" />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <VeroButton href={MALAYA_SITE} className="pointer-events-auto">
            Explore the villas
          </VeroButton>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------- quote

/** A guest's words, word for word (lib/brand.ts), in giant sliding type. */
const QUOTE = GUEST_REVIEWS.find((r) => r.name === "Jen") ?? GUEST_REVIEWS[0]!;

function quoteRows(text: string, rows = 4): string[] {
  const first = text
    .split(/(?<=[.!?])\s+/)
    .slice(0, 2)
    .join(" ");
  const words = first.split(" ");
  const per = Math.ceil(words.length / rows);
  return Array.from({ length: rows }, (_, i) => words.slice(i * per, (i + 1) * per).join(" "));
}

function GuestQuote() {
  const rows = quoteRows(QUOTE.text);
  return (
    <section className="relative overflow-hidden py-28 lg:py-40">
      <figure>
        <blockquote aria-label={QUOTE.text} className="relative">
          {rows.map((r, i) => (
            <p
              key={i}
              aria-hidden
              data-marquee-row={i % 2 ? -1 : 1}
              className={cn(
                "whitespace-nowrap font-vero text-[15vw] uppercase leading-[0.92] lg:text-[9.5rem]",
                i % 2 ? "pl-[6vw]" : "-ml-[8vw]",
              )}
            >
              {r}
              <span className="mx-[0.4em] text-primary">·</span>
              {rows[(i + 1) % rows.length]}
            </p>
          ))}
          <img
            src="/brand/malaya-mark.png"
            alt=""
            data-coin
            className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_18px_40px_rgba(24,22,21,0.25)] sm:size-32 lg:size-36"
          />
        </blockquote>
        <figcaption className="mt-10 text-center font-vero text-[15px] tracking-[0.04em]">
          <Vero text={`${QUOTE.name}, a guest at ${QUOTE.villa} · ${QUOTE.when}`} />
        </figcaption>
      </figure>
    </section>
  );
}

// --------------------------------------------------------------- closing

function Closing() {
  return (
    <section className="px-4 pb-10 pt-16 text-center lg:pt-24">
      <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">
        Start. Build. Earn.
      </h2>
      <p className="mt-3 font-vero text-xl text-[#181615]/80">
        Tell Marj&apos;s team what you need and we&apos;ll reply in your inbox.
      </p>
      <VeroButton href="#offers" className="mt-8">
        Work with Marj
      </VeroButton>
      <p
        aria-hidden
        data-split
        className="mt-24 whitespace-nowrap font-vero text-[15.5vw] uppercase leading-[0.8] tracking-[-0.02em] lg:mt-32"
      >
        Marj Lopez
      </p>
    </section>
  );
}
