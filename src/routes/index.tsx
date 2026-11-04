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
 *   Hero         full screen: the Vistan Villa from above, his name; pinned, it shrinks
 *   Burst        pinned: "WE HELP you START & EARN through AIRBNB" (his own
 *                Facebook cover line) huge, Vistan prints flying out round
 *                it, then the twilight pool opening to the full screen
 *   Intro        the message and his bio
 *   Essence      "where HOSPITALITY meets SYSTEMS", then a pinned slideshow,
 *                "from GUEST, to HOST, to OPERATOR" (his story)
 *   Offers       the four offers: a big photo held on the left that changes
 *                as each offer scrolls by on the right, with two more photos
 *   Founder      his quote beside his family, his accounts
 *   Gallery      Malaya's numbers, then a wall of villa photos drifting
 *   Quote        a guest's review in giant type, sliding, Malaya's mark
 *   Closing      the ask, and his name across the page
 *
 * The type voice (capitals, small words in italic) is components/site/vero.tsx;
 * the motion is components/site/motion.ts, driven by the data- attributes.
 * The words and photos marked "c." can be changed from Admin → Website; the
 * defaults are in lib/site-content.ts, and each offer's words in lib/offers.ts.
 * Big photos (hero, slideshow, the held offer photo) come from public/hd:
 * Malaya's originals at their full 2000px. The villas' 1400px copies are
 * only used small (the gallery, the pairs).
 */
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "@/components/icons";
import { useRef } from "react";

import { PublicFooter, PublicHeader } from "@/components/site/chrome";
import { IPhone, Laptop } from "@/components/site/offers/devices";
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
        <Burst />
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
          alt="The Vistan Villa, Malaya, from above"
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
          <p data-hero-rest className="mt-6 font-vero text-lg sm:mt-10 sm:text-2xl">
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

// ----------------------------------------------------------------- burst

/**
 * The Vistan Villa (PR-013, Bamban, Tarlac), Malaya's newest, photos at full
 * size from Malaya's own uploads (public/hd/vistan). These are the prints
 * that scatter round the headline; FILL is the one that opens to the screen.
 * x/y are where each lands, in % of the screen from the centre; r its tilt.
 */
const BURST = [
  { src: "/hd/vistan/13.webp", x: -33, y: -27, r: -8 },
  { src: "/hd/vistan/08.webp", x: 33, y: -25, r: 7 },
  { src: "/hd/vistan/22.webp", x: -37, y: 25, r: 5 },
  { src: "/hd/vistan/06.webp", x: 35, y: 27, r: -6 },
  { src: "/hd/vistan/25.webp", x: -9, y: -38, r: 3 },
  { src: "/hd/vistan/18.webp", x: 11, y: 37, r: -4 },
];
const BURST_FILL = "/hd/vistan/24.webp";

/** His own bio (lib/brand.ts), the sentences about how he started. */
function startedLines(bio: string) {
  const s = bio.split(/(?<=\.)\s+/);
  return [s[0], s[2], s[3]].filter(Boolean).join(" ");
}

/**
 * The section after the hero, Vero's "deserves to last forever" moment made
 * bigger: pinned, his Facebook cover line huge across the screen with a pile
 * of Vistan prints behind it; as you scroll the prints fly out round the
 * words, the words darken one by one, then the twilight pool in the middle
 * opens to the whole screen and the words turn white on it (motion.ts).
 * Without motion it is the pile under the words, still.
 */
function Burst() {
  // One size for every print, as CSS variables, so the opening photo starts
  // exactly the size of a print.
  const card =
    "absolute left-[calc(50%-var(--bw)/2)] top-[calc(50%-var(--bh)/2)] h-[var(--bh)] w-[var(--bw)] overflow-hidden";
  return (
    <section
      id="intro"
      data-burst
      className="relative h-[100svh] overflow-hidden bg-[#f3f0ed] [--bh:46vw] [--bw:36vw] sm:[--bh:26vw] sm:[--bw:20.8vw] lg:[--bh:20vw] lg:[--bw:16vw]"
    >
      {BURST.map((b, i) => (
        <div
          key={b.src}
          data-burst-card
          data-x={b.x}
          data-y={b.y}
          data-r={b.r}
          className={cn(card, "shadow-[0_24px_60px_rgba(24,22,21,0.18)]")}
          style={{ zIndex: i + 1 }}
        >
          <img src={b.src} alt="" loading="lazy" className="size-full object-cover" />
        </div>
      ))}
      <div data-burst-center aria-hidden className={cn(card, "invisible")} />
      <div
        data-burst-fill
        className="absolute inset-0 z-10 overflow-hidden"
        style={{
          clipPath:
            "inset(calc(50% - var(--bh) / 2) calc(50% - var(--bw) / 2) calc(50% - var(--bh) / 2) calc(50% - var(--bw) / 2))",
        }}
      >
        <img
          src={BURST_FILL}
          alt="The Vistan Villa's pool at twilight"
          loading="lazy"
          className="size-full object-cover"
        />
        <div data-burst-shade className="absolute inset-0 bg-black/35 opacity-0" />
      </div>
      <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center px-4">
        <h2
          data-burst-title
          className="text-balance text-center font-vero text-[13.5vw] leading-[0.9] tracking-[-0.01em] text-[#181615] sm:text-[9.5vw] lg:text-[8.6rem]"
        >
          <Vero text={FACEBOOK.headline} />
        </h2>
      </div>
      <p
        data-burst-after
        className="absolute inset-x-0 bottom-8 z-20 px-4 text-center font-vero text-[15px] tracking-[0.04em] text-white opacity-0 sm:bottom-12"
      >
        <Vero text="The Vistan Villa, Bamban, Tarlac | Malaya's newest" />
      </p>
    </section>
  );
}

function Intro({ c }: C) {
  return (
    <section className="px-4 pb-28 pt-24 text-center sm:pt-32 lg:pb-40">
      <p
        data-reveal
        className="mx-auto max-w-2xl text-2xl font-semibold leading-snug tracking-[-0.015em] sm:text-3xl"
      >
        {c.hero.sub}
      </p>
      <p
        data-reveal
        className="mx-auto mt-6 max-w-md font-vero text-[17px] leading-relaxed text-[#181615]/75"
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

/**
 * His story in three photos (lib/offers.ts, coaching: renting, hosting,
 * running). The first is also the small photo under the heading that grows
 * to the full screen. No Casa Martha here (Clarence, 2026-11-04).
 */
const STORY = [
  { word: "from guest,", src: "/hd/malaya-1-pool.webp", position: "center" },
  { word: "to host,", src: "/hd/vistan/23.webp", position: "center" },
  { word: "to operator.", src: "/hd/bacoor-aerial.webp", position: "center" },
];

/**
 * Vero's "where INNOVATION meets CRAFTSMANSHIP": one pinned stage. The
 * heading on the beige with a small photo under it; as you scroll the photo
 * grows over the heading to the whole screen and becomes the first slide;
 * then the next photos wipe in from the right and their words light up
 * (motion.ts, data-seq). The small photo's box is [data-seq-start].
 */
function Essence() {
  return (
    <section
      data-seq
      className="relative h-[100svh] overflow-hidden bg-[#f3f0ed] [--sw:46vw] sm:[--sw:26vw] lg:[--sw:min(19vw,300px)]"
    >
      <div className="absolute inset-x-0 top-[9vh] px-4 text-center sm:top-[11vh]">
        <Kicker text="the essence of Malaya" />
        <Big
          text="where hospitality meets systems"
          className="mx-auto mt-6 max-w-6xl"
          split={false}
        />
      </div>
      {/* Where the first photo starts: under the heading, a little over it. */}
      <div
        data-seq-start
        aria-hidden
        className="invisible absolute left-[calc(50%-var(--sw)/2)] top-[52%] aspect-[4/5] w-[var(--sw)] sm:top-[50%]"
      />
      {STORY.map((s, i) => (
        <div
          key={s.src}
          data-seq-slide
          className="absolute inset-0 overflow-hidden bg-[#181615]"
          style={i === 0 ? undefined : { clipPath: "inset(0% 0% 0% 100%)" }}
        >
          <img
            src={s.src}
            alt=""
            loading="lazy"
            style={{ objectPosition: s.position }}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/10" />
        </div>
      ))}
      <ul
        data-seq-ui
        className="absolute left-4 top-1/2 flex -translate-y-1/2 flex-col gap-3 sm:left-6"
      >
        {STORY.map((s) => (
          <li key={s.src} data-seq-dot className="block size-1.5 rotate-45 bg-white" />
        ))}
      </ul>
      <p
        data-seq-ui
        className="absolute inset-x-0 bottom-8 px-4 text-center font-vero text-[8.5vw] leading-none text-white sm:bottom-12 sm:text-6xl lg:text-[5.2rem]"
      >
        {STORY.map((s, i) => (
          <span key={s.word} data-seq-word className="opacity-40">
            <Vero text={s.word} />
            {i < STORY.length - 1 && " "}
          </span>
        ))}
      </p>
    </section>
  );
}

// ---------------------------------------------------------------- offers

/**
 * Each offer's photos: the big one held on the left (on a laptop), and two
 * beside its words. All real: Malaya's villas, Marj, the Lian build, the
 * system Malaya runs on. `devices` sets Malaya's site on a laptop and a
 * phone over the photo, and `laptop` replaces the pair with one laptop, so
 * the system reads as product shots among the villa photos, not bare
 * screenshots.
 */
const OFFER_SHOTS: Record<
  OfferSlug,
  {
    main: string;
    position?: string;
    devices?: { laptop: string; phone: string };
    laptop?: string;
    pair: [string, string];
  }
> = {
  management: {
    main: "/hd/hidden-loft-pool.webp",
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
    main: "/hd/vistan/21.webp",
    devices: { laptop: "/system/site-desk.webp", phone: "/system/site-phone.webp" },
    laptop: "/system/dashboard.webp",
    pair: ["/system/dashboard.webp", "/system/calendar.webp"],
  },
};

/** An offer's big photo; with `devices`, Malaya's site on a laptop and a phone over it. */
function OfferShot({ slug, className }: { slug: OfferSlug; className?: string }) {
  const s = OFFER_SHOTS[slug];
  return (
    <div className={cn("overflow-hidden bg-[#181615]", className)}>
      <img
        src={s.main}
        alt=""
        loading="lazy"
        style={s.position ? { objectPosition: s.position } : undefined}
        className="absolute inset-0 size-full object-cover"
      />
      {s.devices && (
        <>
          <div className="absolute inset-0 bg-black/35" />
          <Laptop
            src={s.devices.laptop}
            className="absolute left-[4%] top-1/2 w-[88%] -translate-y-[58%]"
          />
          <IPhone
            src={s.devices.phone}
            className="absolute bottom-[9%] right-[6%] w-[24%] max-w-[170px]"
          />
        </>
      )}
    </div>
  );
}

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
            {offers.map((o) => (
              <div key={o.slug} data-collage-shot className="absolute inset-0">
                <OfferShot slug={o.slug} className="absolute inset-0" />
              </div>
            ))}
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
                <OfferShot slug={o.slug} className="relative mb-8 aspect-[4/5] lg:hidden" />
                {s.laptop && (
                  <div data-reveal className="hidden px-[6%] lg:block">
                    <Laptop src={s.laptop} />
                  </div>
                )}
                <div className={cn("hidden grid-cols-2 gap-4", !s.laptop && "lg:grid")}>
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
            src={c.meet.photo}
            alt="Marj with his family"
            loading="lazy"
            data-parallax="-4"
            className="aspect-square w-full scale-110 object-cover object-top"
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
  "/villas/pr-hidden-loft/2.webp",
  "/villas/pr-012/1.webp",
  "/villas/pr-012/0.webp",
  "/villas/pr-hidden/0.webp",
  "/villas/pr-hidden-cabin-b/0.webp",
  "/villas/pr-hidden-cabin-b/4.webp",
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
