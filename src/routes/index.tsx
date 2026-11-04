/**
 * The page the link in bio points to. Simple on purpose (the boss,
 * 2026-11-03: "wag masyadong overwhelming sa information … clear ang
 * inoffer natin"): the message, the four offers, one line of proof, and who
 * Marj is. Everything detailed (the villas, the build, the reviews) lives
 * on the offer page it proves.
 *
 * Since 2026-11-04 it moves like a portfolio site (Clarence: "fancy like
 * those portfolio websites while still being simple", after verostudio.com).
 * Few things on screen, big type, and the motion does the rest; the motion
 * is all in components/site/motion.ts, driven by the data- attributes here.
 *
 *   Hero       the headline rises line by line as the intro lifts, his
 *              portrait opens from the bottom, his numbers count up
 *   Statement  the one message, lighting up word by word as you scroll
 *   Offers     the four offers as big names; a photo follows the cursor
 *   Proof      Malaya: a framed photo grows to the full screen, pinned,
 *              and its numbers rise onto it; three photos drift after
 *   Meet Marj  his photo drifting, his story, TV and press, his accounts
 *
 * Every figure's source is in lib/brand.ts. The words and photos can be
 * changed from Admin → Website; the defaults are in lib/site-content.ts,
 * and each offer's words in lib/offers.ts.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck, Globe, Play } from "@/components/icons";
import { useRef, type ReactNode } from "react";

import { PublicFooter, PublicHeader } from "@/components/site/chrome";
import { PlatformLogo, type Platform } from "@/components/site/logos";
import { usePageMotion, useSmoothScroll } from "@/components/site/motion";
import {
  AIRBNB_HOST,
  FACEBOOK,
  INSTAGRAM,
  LINKS,
  TOTAL_REVIEWS,
  type ProfileLink,
} from "@/lib/brand";
import { OFFER_ORDER, offerPath, proofWith, type Offer } from "@/lib/offers";
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
  // them: the landing's own, and each offer's (its row's pillar and name).
  loader: () => fetchSiteContent(["landing", ...OFFER_KEYS]),
  component: Landing,
});

type C = { c: LandingContent };

const PAGE = "mx-auto max-w-[1400px] px-4 sm:px-8";
const ROLL = "transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]";

function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("brand-eyebrow text-[10px] text-muted-foreground sm:text-xs", className)}>
      {children}
    </p>
  );
}

/**
 * The button: a dark pill whose label rolls up to a second copy on hover,
 * with a round arrow that turns.
 */
function RollButton({ href, children }: { href: string; children: string }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group inline-flex h-14 items-center gap-4 rounded-full bg-foreground py-2 pl-7 pr-2 text-[15px] font-semibold text-background transition-colors duration-500 hover:bg-primary"
    >
      <span className="relative block overflow-hidden">
        <span className={cn("block group-hover:-translate-y-full", ROLL)}>{children}</span>
        <span
          aria-hidden
          className={cn("absolute inset-0 block translate-y-full group-hover:translate-y-0", ROLL)}
        >
          {children}
        </span>
      </span>
      <span className="grid size-10 place-items-center rounded-full bg-background text-foreground transition-transform duration-500 group-hover:rotate-45">
        <ArrowUpRight className="size-4" />
      </span>
    </a>
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
    <div ref={root} className="min-h-screen overflow-x-clip bg-background">
      <PublicHeader />
      <main id="content">
        <Hero c={c} />
        <Statement c={c} />
        <Offers c={c} offers={offers} />
        <Proof c={c} />
        <MeetMarj c={c} />
      </main>
      <PublicFooter />
    </div>
  );
}

// ------------------------------------------------------------------ hero

/** Splits off a line's last word, which is set apart in the italic serif. */
function lastWordApart(line: string) {
  const t = line.trim();
  const i = t.lastIndexOf(" ");
  return i < 0 ? { head: "", last: t } : { head: t.slice(0, i + 1), last: t.slice(i + 1) };
}

function Hero({ c }: C) {
  const { head, last } = lastWordApart(c.hero.headline[1]);
  return (
    <section className={cn(PAGE, "pt-6 lg:pt-10")}>
      <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7 lg:pb-4">
          <p data-hero-fade className="brand-eyebrow text-[10px] text-foreground/70 sm:text-xs">
            {c.hero.eyebrow}
          </p>
          <h1
            data-hero-title
            className="hero-title mt-6 text-balance font-display text-[3.4rem] font-light leading-[0.92] tracking-[-0.045em] text-foreground sm:text-[5.5rem] lg:text-[6.2rem] xl:text-[7.2rem]"
          >
            {c.hero.headline[0]} {head}
            <em className="accent-serif text-primary">{last}</em>
          </h1>
          <div data-hero-fade className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <RollButton href="#offers">See how Marj can help</RollButton>
            <a
              href={FACEBOOK.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2 text-sm font-semibold"
            >
              <PlatformLogo platform="facebook" className="size-5" />
              <span className="underline-offset-4 group-hover:underline">
                {c.numbers.facebook} follow Marj
              </span>
              <BadgeCheck className="size-4 text-[#0866FF]" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div
            data-hero-photo
            className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#151314]"
          >
            <img
              src={c.hero.photo}
              alt="Marj Lopez"
              loading="eager"
              className="absolute inset-x-0 -top-[8%] h-[116%] w-full object-cover object-[62%_center]"
            />
          </div>
        </div>
      </div>

      <Numbers c={c} />
    </section>
  );
}

/** Every audience number, counting up in one quiet row under the hero. */
function Numbers({ c }: C) {
  const cells: { logo?: Platform; big: string; small: string; href: string; tv?: boolean }[] = [
    { logo: "facebook", big: c.numbers.facebook, small: "on Facebook", href: FACEBOOK.url },
    { logo: "instagram", big: c.numbers.instagram, small: "on Instagram", href: INSTAGRAM.url },
    {
      logo: "airbnb",
      big: `${AIRBNB_HOST.rating}★`,
      small: `${AIRBNB_HOST.reviews} Airbnb reviews`,
      href: AIRBNB_HOST.url,
    },
    { big: `${TOTAL_REVIEWS}+`, small: "guest reviews", href: "/management#reviews" },
    {
      big: "PTV",
      small: "as seen on TV",
      href: "https://www.youtube.com/watch?v=Uq1KitcVAwQ",
      tv: true,
    },
  ];
  return (
    <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-foreground/15 pt-8 sm:grid-cols-5 lg:mt-20">
      {cells.map((p) => (
        <a
          key={p.small}
          href={p.href}
          data-reveal
          {...(p.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
          className={cn("group block", p.tv && "col-span-2 sm:col-span-1")}
        >
          <span
            {...(p.tv ? {} : { "data-count": "" })}
            className="block font-display text-4xl font-light tracking-[-0.04em] tabular-nums transition-colors group-hover:text-primary sm:text-5xl"
          >
            {p.big}
          </span>
          <span className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            {p.logo ? (
              <PlatformLogo platform={p.logo} className="size-4" />
            ) : p.tv ? (
              <Play className="size-4 fill-[#FF0000] text-[#FF0000]" />
            ) : null}
            {p.small}
          </span>
        </a>
      ))}
    </div>
  );
}

// ------------------------------------------------------------- statement

/** The one message, big, lighting up word by word as it scrolls past. */
function Statement({ c }: C) {
  return (
    <section className={cn(PAGE, "py-32 sm:py-40 lg:py-56")}>
      <Eyebrow className="mb-8 text-center">The short version</Eyebrow>
      <p
        data-scrub-words
        className="mx-auto max-w-5xl text-center font-display text-[2.1rem] font-light leading-[1.08] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-[4.1rem]"
      >
        {c.hero.sub}
      </p>
    </section>
  );
}

// ---------------------------------------------------------------- offers

/**
 * The four offers as big names, one per row, the verb from the boss's
 * diagram over each (MANAGE · LEARN · INVEST · SYSTEMIZE). On a laptop the
 * offer's photo follows the cursor over the list; on a phone it sits in the
 * row. The words are each offer page's own (Admin → Website → that offer).
 */
function Offers({ c, offers }: C & { offers: Offer[] }) {
  return (
    <section id="offers" className={cn(PAGE, "scroll-mt-24")}>
      <div className="flex flex-wrap items-end justify-between gap-6 pb-10">
        <div>
          <Eyebrow>Work with Marj</Eyebrow>
          <h2
            data-split
            className="text-balance mt-5 max-w-3xl font-display text-5xl font-light leading-[0.95] tracking-[-0.04em] sm:text-7xl"
          >
            {c.offers.heading}
          </h2>
        </div>
        <p data-reveal className="max-w-xs text-[15px] leading-relaxed text-muted-foreground">
          {c.offers.lead}
        </p>
      </div>

      <ul data-offers className="border-t border-foreground/15">
        {offers.map((o, i) => (
          <li key={o.slug} data-reveal className="border-b border-foreground/15">
            <Link
              to={offerPath(o.slug)}
              data-offer-row
              data-index={i}
              className="group flex items-center gap-4 py-7 sm:gap-8 sm:py-10"
            >
              <span className="hidden w-12 shrink-0 text-sm tabular-nums text-muted-foreground sm:block">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="block aspect-square w-20 shrink-0 overflow-hidden rounded-xl bg-secondary lg:hidden">
                <img
                  src={o.hero.src}
                  alt=""
                  loading="lazy"
                  style={o.hero.position ? { objectPosition: o.hero.position } : undefined}
                  className="size-full object-cover"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="brand-eyebrow block text-[10px] text-primary sm:text-[11px]">
                  {o.pillar}
                </span>
                <span className="mt-2 block font-display text-[1.9rem] font-light leading-none tracking-[-0.04em] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3 sm:text-6xl lg:text-[5.2rem]">
                  {o.name}
                </span>
                <span className="mt-2 block text-sm text-muted-foreground md:hidden">
                  {o.forWhom}
                  {o.price.show && o.price.amount && ` · ${o.price.amount}`}
                </span>
              </span>
              <span className="hidden w-56 shrink-0 text-right text-sm leading-snug text-muted-foreground md:block">
                {o.forWhom}
                {o.price.show && o.price.amount && (
                  <span className="mt-1 block font-semibold text-foreground tabular-nums">
                    {o.price.amount}
                  </span>
                )}
              </span>
              <span className="hidden size-14 shrink-0 place-items-center rounded-full border border-foreground/20 transition-all duration-500 group-hover:rotate-45 group-hover:border-foreground group-hover:bg-foreground group-hover:text-background sm:grid">
                <ArrowUpRight className="size-5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* The photo that follows the cursor over the list (motion.ts). */}
      <div
        data-offer-preview
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-30 hidden h-[340px] w-[270px] overflow-hidden rounded-2xl bg-[#151314] opacity-0 shadow-level-3 lg:block"
      >
        {offers.map((o) => (
          <img
            key={o.slug}
            src={o.hero.src}
            alt=""
            loading="lazy"
            data-offer-shot
            style={o.hero.position ? { objectPosition: o.hero.position } : undefined}
            className="absolute inset-0 size-full object-cover opacity-0"
          />
        ))}
      </div>
    </section>
  );
}

// ----------------------------------------------------------------- proof

/**
 * Malaya, the proof of execution: the bottom box of the boss's diagram,
 * "real villas, actual operations, systems, and documented projects". A
 * framed photo that grows to the full screen as you scroll (pinned), its
 * four numbers rising onto it; then the words and three photos drifting.
 */
function Proof({ c }: C) {
  const [lead, ...rest] = c.proof.photos.slice(0, 4);
  return (
    <section id="proof" className="scroll-mt-24 pt-32 lg:pt-48">
      <div className={cn(PAGE, "text-center")}>
        <Eyebrow>Proof of execution</Eyebrow>
        <h2
          data-split
          className="text-balance mx-auto mt-5 max-w-4xl font-display text-5xl font-light leading-[0.95] tracking-[-0.04em] sm:text-7xl lg:text-[5.5rem]"
        >
          {c.proof.heading}
        </h2>
      </div>

      {lead && (
        <div data-expand className="relative mt-12 h-[100svh] lg:mt-16">
          <div
            data-expand-media
            className="absolute inset-0 overflow-hidden bg-[#151314]"
            style={{ clipPath: "inset(16% 24% 16% 24% round 1.5rem)" }}
          >
            <img src={lead.src} alt="" loading="lazy" className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <dl className="absolute inset-x-0 bottom-0 mx-auto grid max-w-[1400px] grid-cols-2 gap-6 px-4 pb-10 text-white sm:px-8 sm:pb-14 lg:grid-cols-4">
              {proofWith(c.numbers.facebook).map((p) => (
                <div key={p.small} data-expand-after>
                  <dt className="font-display text-5xl font-light tracking-[-0.04em] tabular-nums sm:text-6xl lg:text-7xl">
                    {p.big}
                  </dt>
                  <dd className="mt-2 max-w-[16rem] text-sm leading-snug text-white/75">
                    {p.small}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      <div className={cn(PAGE, "pt-20 lg:pt-28")}>
        <div className="grid gap-10 lg:grid-cols-12">
          <p
            data-reveal
            className="font-display text-2xl font-light leading-snug tracking-[-0.02em] sm:text-3xl lg:col-span-6"
          >
            {c.proof.body}
          </p>
          <div data-reveal className="lg:col-span-4 lg:col-start-9 lg:self-end lg:justify-self-end">
            <RollButton href={MALAYA_SITE}>See Malaya Villas</RollButton>
          </div>
        </div>
        {rest.length > 0 && (
          <div className="mt-16 grid grid-cols-3 gap-3 sm:gap-6 lg:mt-24">
            {rest.map(({ src }, i) => (
              <div
                key={src + i}
                className={cn(
                  "overflow-hidden rounded-xl bg-secondary sm:rounded-2xl",
                  i === 1 && "mt-10 sm:mt-24",
                )}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  data-parallax={i === 1 ? "8" : "-6"}
                  className="aspect-[3/4] w-full scale-[1.18] object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// -------------------------------------------------------------- meet marj

/** Where he's been featured. Labels are ours, not the outlets' headlines. */
const FEATURES = [
  {
    kind: "video" as const,
    outlet: "PTV",
    title: "PTV · Rise and Shine Pilipinas",
    meta: "Father's Day Special",
    image: "/brand/ptv-feature.webp",
    url: "https://www.youtube.com/watch?v=Uq1KitcVAwQ",
  },
  {
    kind: "article" as const,
    outlet: "Latest Chika",
    title: "Latest Chika · The Philippine STAR",
    meta: "Feature · June 24, 2024",
    image: null,
    url: "https://latestchika.com/just-in/2024/06/24/107133/single-father-shares-life-with-3-kids-stresses-importance-of-co-parenting/",
  },
];

function MeetMarj({ c }: C) {
  // His follower counts as set in the editor, on his own two accounts.
  const followers = (l: ProfileLink) =>
    l.url === FACEBOOK.url
      ? { ...l, stat: `${c.numbers.facebook} followers` }
      : l.url === INSTAGRAM.url
        ? { ...l, stat: `${c.numbers.instagram} followers` }
        : l;
  // His own accounts and Malaya's site (2026-11-03): the villas' Facebook
  // pages and listings live on Malaya's own site.
  const accounts = [
    ...LINKS.filter((l) => l.kind === "personal").map(followers),
    ...LINKS.filter((l) => l.kind === "site"),
  ];
  return (
    <section id="about" className={cn(PAGE, "scroll-mt-24 pb-10 pt-32 lg:pt-48")}>
      <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:sticky lg:top-24 lg:col-span-5">
          <div className="overflow-hidden rounded-[1.5rem] bg-white">
            <img
              src={c.meet.photo}
              alt="Marj with his family"
              loading="lazy"
              data-parallax="-5"
              className="aspect-[4/5] w-full scale-[1.12] object-cover object-center"
            />
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <Eyebrow>{c.meet.eyebrow}</Eyebrow>
          <h2
            data-split
            className="text-balance mt-5 font-display text-5xl font-light leading-[0.95] tracking-[-0.04em] sm:text-7xl"
          >
            {c.meet.heading}
          </h2>
          <p
            data-reveal
            className="mt-8 whitespace-pre-line text-lg leading-relaxed text-foreground/85"
          >
            {c.meet.story}
          </p>
          <ul className="mt-8">
            {c.meet.pitch.map((line, i) => (
              <li
                key={line}
                data-reveal
                className="flex items-baseline gap-5 border-t border-foreground/15 py-4 text-[15px]"
              >
                <span className="w-6 shrink-0 text-sm tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-12 grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <a
                key={f.url}
                href={f.url}
                target="_blank"
                rel="noreferrer"
                data-reveal
                className="group block"
              >
                <span className="relative block aspect-video overflow-hidden rounded-xl bg-[#3a2314]">
                  {f.image ? (
                    <img
                      src={f.image}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <span className="grid size-full place-items-center p-3 text-center font-display text-lg text-white sm:text-2xl">
                      {f.outlet}
                    </span>
                  )}
                  {f.kind === "video" && (
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid size-11 place-items-center rounded-full bg-white/95 text-[#FF0000] transition duration-500 group-hover:scale-110">
                        <Play className="size-5 fill-current" />
                      </span>
                    </span>
                  )}
                </span>
                <span className="mt-3 block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {f.kind === "video" ? "As seen on TV" : "In the press"}
                </span>
                <span className="mt-0.5 block text-sm font-semibold leading-snug">{f.title}</span>
                <span className="block text-xs text-muted-foreground">{f.meta}</span>
              </a>
            ))}
          </div>

          <ul className="mt-12 border-b border-foreground/15">
            {accounts.map((l) => (
              <li key={l.url} data-reveal>
                <AccountRow link={l} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function AccountRow({ link }: { link: ProfileLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-4 border-t border-foreground/15 py-4"
    >
      {link.platform === "web" ? (
        <Globe className="size-6 text-primary" />
      ) : (
        <PlatformLogo platform={link.platform} className="size-6" />
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-[15px] font-semibold transition-transform duration-500 group-hover:translate-x-1">
          {link.name}
          {link.platform === "facebook" && <BadgeCheck className="size-4 text-[#0866FF]" />}
        </span>
        <span className="block text-xs text-muted-foreground">{link.handle}</span>
      </span>
      {link.stat && (
        <span className="text-sm font-semibold tabular-nums text-foreground">{link.stat}</span>
      )}
      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition duration-500 group-hover:rotate-45 group-hover:text-primary" />
    </a>
  );
}
