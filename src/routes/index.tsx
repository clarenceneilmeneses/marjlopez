/**
 * The page the link in bio points to. Simple on purpose (the boss,
 * 2026-11-03: "wag masyadong overwhelming sa information … clear ang
 * inoffer natin"): the message, the four offers, one line of proof, and who
 * Marj is. Everything detailed — the villas, the build, the reviews — lives
 * on the offer page it proves.
 *
 *   1  Hero       Marj in a rounded frame, who he is and the one message
 *   2  Offers     the four offers from his "one ecosystem" diagram —
 *                 MANAGE · LEARN · INVEST · SYSTEMIZE — each opens its page
 *   3  Numbers    the follower and review counts, one quiet row
 *   4  Proof      Malaya, the proof of execution: four numbers, four photos
 *   5  Meet Marj  his photo, his story, TV and press, his accounts
 *
 * Every figure's source is in lib/brand.ts. The words and photos can be
 * changed from Admin → Website; the defaults are in lib/site-content.ts,
 * and each offer's card words in lib/offers.ts.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, BadgeCheck, Check, Globe, Play, Star } from "@/components/icons";

import { PublicFooter, PublicHeader } from "@/components/site/chrome";
import { PlatformLogo, type Platform } from "@/components/site/logos";
import { ParallaxImage } from "@/components/site/parallax";
import {
  AIRBNB_HOST,
  FACEBOOK,
  INSTAGRAM,
  LINKS,
  TOTAL_REVIEWS,
  type ProfileLink,
} from "@/lib/brand";
import { TYPES } from "@/lib/inquiry";
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
  // them — the landing's own, and each offer's (its card's pillar and name).
  loader: () => fetchSiteContent(["landing", ...OFFER_KEYS]),
  component: Landing,
});

type C = { c: LandingContent };

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("brand-eyebrow text-[10px] text-muted-foreground sm:text-xs", className)}>
      {children}
    </p>
  );
}

function Landing() {
  const rows = Route.useLoaderData();
  // In Admin → Website's preview frame, the unsaved words instead.
  const draft = usePreviewDraft("landing");
  const c = landingFrom(draft === undefined ? rows : { ...rows, landing: draft });
  const offers = OFFER_ORDER.map((slug) => offerFrom(slug, rows));
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main id="content">
        <Hero c={c} />
        <Offers c={c} offers={offers} />
        <Proof c={c} />
        <MeetMarj c={c} />
      </main>
      <PublicFooter />
    </div>
  );
}

// ------------------------------------------------------------------ hero

function Hero({ c }: C) {
  return (
    <section className="px-3 sm:px-6">
      <div className="relative mx-auto max-w-[1400px]">
        {/* The frame. The photo's own backdrop is this near-black, so the frame
            and the photo read as one studio wall. */}
        <div className="intro-settle relative h-[600px] overflow-hidden rounded-[2rem] bg-[#151314] shadow-level-3 sm:h-[620px] lg:h-[min(76vh,680px)]">
          <ParallaxImage
            src={c.hero.photo}
            alt="Marj Lopez"
            strength={6}
            frameClassName="absolute inset-0 lg:left-auto lg:aspect-square lg:h-full"
            className="object-[62%_center] lg:object-center"
            loading="eager"
          />
          {/* A bottom fade on a phone, a left fade on a laptop, so the type always sits on dark. */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#151314] via-[#151314]/60 to-transparent lg:hidden" />
          <div className="absolute inset-y-0 left-0 hidden w-[70%] bg-gradient-to-r from-[#151314] from-55% to-transparent lg:block" />

          {/* Top-right glass chip, like Malaya's "Casa Martha · See this villa". */}
          <a
            href={FACEBOOK.url}
            target="_blank"
            rel="noreferrer"
            className="absolute right-4 top-4 flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 p-2 pr-4 text-white backdrop-blur-md transition hover:bg-white/20 sm:right-6 sm:top-6"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-white">
              <PlatformLogo platform="facebook" className="size-5" />
            </span>
            <span className="text-left leading-tight">
              <span className="flex items-center gap-1 text-sm font-semibold">
                Marj Lopez <BadgeCheck className="size-4 text-[#4a9bff]" />
              </span>
              <span className="text-xs text-white/80">{c.numbers.facebook} followers →</span>
            </span>
          </a>

          <div className="absolute inset-x-0 bottom-0 p-6 pb-8 sm:p-10 sm:pb-10 lg:inset-y-0 lg:right-auto lg:flex lg:w-[58%] lg:flex-col lg:justify-center lg:p-16">
            <p className="brand-eyebrow text-[10px] text-white/70 sm:text-xs">{c.hero.eyebrow}</p>
            <h1 className="site-display mt-4 text-[2.5rem] leading-[0.95] text-white sm:text-6xl xl:text-7xl">
              {c.hero.headline[0]}
              <br />
              {c.hero.headline[1]}
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/80 sm:text-base">
              {c.hero.sub}
            </p>
            <a
              href="#offers"
              className="brand-caps mt-7 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-white px-7 text-[15px] text-[#2b1a10] shadow-level-2 transition hover:bg-white/90"
            >
              See how Marj can help <ArrowRight className="size-4 rotate-90" />
            </a>
          </div>
        </div>
      </div>

      <Followers c={c} />
    </section>
  );
}

// ---------------------------------------------------------------- offers

/**
 * The four offers, laid out like the boss's diagram (2026-11-03): the verb
 * (MANAGE · LEARN · INVEST · SYSTEMIZE), the offer, and who it's for — big
 * enough to read at a glance, each a whole card that opens its page. The
 * words are each offer page's own (Admin → Website → that offer).
 */
function Offers({ c, offers }: C & { offers: Offer[] }) {
  return (
    <section id="offers" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-20 sm:px-8 lg:pt-28">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Work with Marj</Eyebrow>
        <h2 className="site-display mt-4 text-4xl leading-none text-brand-heading sm:text-6xl">
          {c.offers.heading}
        </h2>
        <p className="mt-4 text-[15px] text-muted-foreground sm:text-base">{c.offers.lead}</p>
      </div>

      <ul className="mt-10 grid gap-3 sm:gap-4 md:grid-cols-2">
        {offers.map((o) => {
          const Icon = TYPES[o.type].icon;
          return (
            <li key={o.slug}>
              <Link
                to={offerPath(o.slug)}
                className="group flex h-full items-stretch gap-4 overflow-hidden rounded-[1.75rem] bg-card p-3 shadow-level-2 transition duration-200 active:scale-[0.98] sm:gap-5 lg:hover:-translate-y-1 lg:hover:shadow-level-3"
              >
                <span className="flex min-w-0 flex-1 flex-col p-2 sm:p-4">
                  <span className="flex items-center gap-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      {o.pillar}
                    </span>
                  </span>
                  <span className="site-display mt-4 block text-[1.75rem] leading-[1.05] text-brand-heading sm:text-4xl">
                    {o.name}
                  </span>
                  <span className="mt-2 block text-sm text-muted-foreground sm:text-[15px]">
                    {o.forWhom}
                  </span>
                  <span className="mt-auto flex flex-wrap items-center gap-2 pt-5">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      See the offer
                      <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                    </span>
                    {o.price.show && o.price.amount && (
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold tabular-nums">
                        {o.price.amount}
                      </span>
                    )}
                  </span>
                </span>
                <span className="relative hidden w-[38%] shrink-0 overflow-hidden rounded-[1.25rem] bg-secondary min-[420px]:block">
                  <img
                    src={o.hero.src}
                    alt=""
                    loading="lazy"
                    style={o.hero.position ? { objectPosition: o.hero.position } : undefined}
                    className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ----------------------------------------------------------------- proof

/**
 * Malaya, the proof of execution — the bottom box of the boss's diagram:
 * "real villas, actual operations, systems, and documented projects". One
 * band, four numbers and four photos, instead of the whole villa list.
 */
function Proof({ c }: C) {
  return (
    <section id="proof" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-20 sm:px-8 lg:pt-28">
      <div className="overflow-hidden rounded-[2rem] bg-[#151314] text-white shadow-level-3">
        <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-end lg:gap-12 lg:p-14">
          <div>
            <p className="brand-eyebrow text-[10px] text-white/60 sm:text-xs">Proof of execution</p>
            <h2 className="site-display mt-4 text-4xl leading-none sm:text-5xl">
              {c.proof.heading}
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/75">
              {c.proof.body}
            </p>
            <a
              href={MALAYA_SITE}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline-offset-4 hover:underline"
            >
              See Malaya Villas <ArrowUpRight className="size-4" />
            </a>
          </div>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10">
            {proofWith(c.numbers.facebook).map((p) => (
              <div key={p.small} className="bg-[#1d1a1b] p-5">
                <dt className="site-display text-3xl leading-none tabular-nums sm:text-4xl">
                  {p.big}
                </dt>
                <dd className="mt-2 text-xs leading-snug text-white/60">{p.small}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="grid grid-cols-4 gap-1 px-1 pb-1">
          {c.proof.photos.slice(0, 4).map(({ src }, i) => (
            <img
              key={src + i}
              src={src}
              alt=""
              loading="lazy"
              className={cn(
                "aspect-[4/3] w-full object-cover",
                i === 0 && "rounded-bl-[1.8rem]",
                i === 3 && "rounded-br-[1.8rem]",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Every audience number. A quiet row of pills on a laptop. On a phone the
 * row wrapped 2 · 1 · 1 · 1, centred and ragged (Clarence, 2026-10-25: "placement
 * looks awkward"), so there it is a two-column grid of equal tiles, number
 * over label, with "As seen on PTV" across the bottom.
 */
function Followers({ c }: C) {
  const pills: { logo?: Platform; big: string; small: string; href: string; tv?: boolean }[] = [
    { logo: "facebook", big: c.numbers.facebook, small: "Facebook", href: FACEBOOK.url },
    { logo: "instagram", big: c.numbers.instagram, small: "Instagram", href: INSTAGRAM.url },
    {
      logo: "airbnb",
      big: `${AIRBNB_HOST.rating}★`,
      small: `${AIRBNB_HOST.reviews} reviews`,
      href: AIRBNB_HOST.url,
    },
    { big: `${TOTAL_REVIEWS}+`, small: "guest reviews", href: "/management#reviews" },
    {
      big: "As seen on",
      small: "PTV",
      href: "https://www.youtube.com/watch?v=Uq1KitcVAwQ",
      tv: true,
    },
  ];
  return (
    <div className="mx-auto mt-6 grid max-w-5xl grid-cols-2 gap-2 px-3 sm:flex sm:flex-wrap sm:justify-center sm:px-1">
      {pills.map((p) => (
        <a
          key={p.small}
          href={p.href}
          {...(p.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
          className={cn(
            "flex items-center gap-3 rounded-2xl bg-card px-4 py-3 text-sm shadow-level-1 transition hover:shadow-level-2 sm:gap-2 sm:rounded-full sm:px-3.5 sm:py-2",
            p.tv && "col-span-2",
          )}
        >
          {p.logo ? (
            <PlatformLogo platform={p.logo} className="size-5 shrink-0 sm:size-[18px]" />
          ) : p.tv ? (
            <Play className="size-5 shrink-0 fill-[#FF0000] text-[#FF0000] sm:size-[18px]" />
          ) : (
            <Star className="size-5 shrink-0 fill-warning text-warning sm:size-[18px]" />
          )}
          <span className="flex min-w-0 flex-col leading-tight sm:flex-row sm:items-center sm:gap-2">
            <span className="font-semibold tabular-nums">{p.big}</span>
            <span className="truncate text-xs text-muted-foreground sm:text-sm">{p.small}</span>
          </span>
        </a>
      ))}
    </div>
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
  const mine = LINKS.filter((l) => l.kind === "personal").map(followers);
  const more = LINKS.filter((l) => l.kind !== "personal");
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24 sm:px-8 lg:pt-28">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
        <div className="space-y-3">
          <ParallaxImage
            src={c.meet.photo}
            alt="Marj with his family"
            strength={6}
            frameClassName="aspect-square w-full rounded-[2rem] bg-white shadow-level-3"
            className="object-center"
          />
          {/* As featured on — TV and the press, neutral labels in our own words. */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <a
                key={f.url}
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-2xl bg-card shadow-level-2 transition hover:-translate-y-0.5 hover:shadow-level-3"
              >
                <span className="relative block aspect-video overflow-hidden bg-secondary">
                  {f.image ? (
                    <img
                      src={f.image}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="grid size-full place-items-center bg-[#3a2314] p-3 text-center">
                      <span className="site-display text-lg leading-tight text-white sm:text-2xl">
                        {f.outlet}
                      </span>
                    </span>
                  )}
                  {f.kind === "video" && (
                    <span className="absolute inset-0 grid place-items-center bg-black/15">
                      <span className="grid size-11 place-items-center rounded-full bg-white/95 text-[#FF0000] shadow-level-2 transition group-hover:scale-110">
                        <Play className="size-5 fill-current" />
                      </span>
                    </span>
                  )}
                </span>
                <span className="block p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {f.kind === "video" ? "As seen on TV" : "In the press"}
                  </span>
                  <span className="mt-0.5 block text-sm font-semibold leading-snug">{f.title}</span>
                  <span className="block text-xs text-muted-foreground">{f.meta}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
        <div>
          <Eyebrow>{c.meet.eyebrow}</Eyebrow>
          <h2 className="site-display mt-4 text-4xl leading-none text-brand-heading sm:text-5xl">
            {c.meet.heading}
          </h2>
          <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-foreground">
            {c.meet.story}
          </p>
          <ul className="mt-5 space-y-2">
            {c.meet.pitch.map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm text-foreground">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                  <Check className="size-3" />
                </span>
                {line}
              </li>
            ))}
          </ul>

          {/* Every account, one clean list — the admin's white card. */}
          <div className="mt-8 overflow-hidden rounded-2xl bg-card shadow-level-2">
            {mine.map((l) => (
              <AccountRow key={l.url} link={l} />
            ))}
            {/* Just his own accounts and Malaya's site (2026-11-03): the villas'
                Facebook pages and listings live on Malaya's own site. */}
            {more
              .filter((l) => l.kind === "site")
              .map((l) => (
                <AccountRow key={l.url} link={l} last />
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AccountRow({ link, last = false }: { link: ProfileLink; last?: boolean }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group flex items-center gap-3 px-4 py-3 transition hover:bg-secondary/60",
        !last && "border-b border-border/60",
      )}
    >
      {link.platform === "web" ? (
        <Globe className="size-6 text-primary" />
      ) : (
        <PlatformLogo platform={link.platform} className="size-6" />
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-sm font-semibold">
          {link.name}
          {link.platform === "facebook" && <BadgeCheck className="size-4 text-[#0866FF]" />}
        </span>
        <span className="block text-xs text-muted-foreground">{link.handle}</span>
      </span>
      {link.stat && (
        <span className="text-sm font-semibold tabular-nums text-foreground">{link.stat}</span>
      )}
      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
    </a>
  );
}
