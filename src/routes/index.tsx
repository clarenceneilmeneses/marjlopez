/**
 * The page the link in bio points to — PRD §6. Short on purpose (Clarence,
 * 2026-10-25: "so much scrolling down fatigue … just make it look like this
 * guy is credible"), and the inquiry is the first thing on it.
 *
 *   1  Hero        Malaya's "02 — Framed photo" draft: Marj in a rounded
 *                  frame, his own pitch, and the inquiry starter as the pill
 *                  that overlaps the frame's bottom edge (where Malaya has
 *                  its search). The followers sit right under it.
 *   2  Villas      Malaya's "05 — Fanned cards" draft: every villa, fanned,
 *                  spreading open as it scrolls into view.
 *   3  Meet Marj   His photo, his three lines, and every account in one
 *                  clean list — the admin's white-card look.
 *   4  Reviews     Two rows of real guest reviews, sliding past.
 *
 * Every figure's source is in lib/brand.ts.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  Globe,
  MapPin,
  Play,
  Star,
} from "@/components/icons";
import { useState, type CSSProperties } from "react";

import { PublicFooter, PublicHeader } from "@/components/site/chrome";
import { PlatformLogo, type Platform } from "@/components/site/logos";
import { ParallaxImage, useParallaxVar } from "@/components/site/parallax";
import {
  AIRBNB_HOST,
  FACEBOOK,
  GUEST_REVIEWS,
  INSTAGRAM,
  LINKS,
  REVIEW_SCORES,
  TOTAL_REVIEWS,
  type ProfileLink,
} from "@/lib/brand";
import { TYPES } from "@/lib/inquiry";
import { cn } from "@/lib/utils";
import { MALAYA_SITE, PORTFOLIO, VILLAS, villaPhoto, villaUrl } from "@/lib/villas";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("brand-eyebrow text-[10px] text-muted-foreground sm:text-xs", className)}>
      {children}
    </p>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main id="content">
        <Hero />
        <Villas />
        <Built />
        <MeetMarj />
        <Reviews />
      </main>
      <PublicFooter />
    </div>
  );
}

// ------------------------------------------------------------------ hero

const STARTERS = [
  { type: "start", label: "Start", sub: "an Airbnb business" },
  { type: "build", label: "Build", sub: "my own Airbnb" },
  { type: "system", label: "Get a system", sub: "like Malaya's" },
] as const;

function Hero() {
  return (
    <section className="px-3 sm:px-6">
      <div className="relative mx-auto max-w-[1400px]">
        {/* The frame. The photo's own backdrop is this near-black, so the frame
            and the photo read as one studio wall. */}
        <div className="relative h-[620px] overflow-hidden rounded-[2rem] bg-[#151314] shadow-level-3 sm:h-[640px] lg:h-[min(78vh,700px)]">
          <ParallaxImage
            src="/brand/marj.webp"
            alt="Marj Lopez"
            strength={6}
            frameClassName="absolute inset-0 lg:left-auto lg:aspect-square lg:h-full"
            className="object-[62%_center] lg:object-center"
            loading="eager"
          />
          {/* A bottom fade on a phone, a left fade on a laptop, so the type always sits on dark. */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#151314] via-[#151314]/55 to-transparent lg:hidden" />
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
              <span className="text-xs text-white/80">{FACEBOOK.followers} followers →</span>
            </span>
          </a>

          <div className="absolute inset-x-0 bottom-0 p-6 pb-12 sm:p-10 sm:pb-14 lg:inset-y-0 lg:right-auto lg:flex lg:w-[58%] lg:flex-col lg:justify-center lg:p-16 lg:pb-24">
            <p className="brand-eyebrow text-[10px] text-white/85 sm:text-xs">
              Airbnb · Build · Systems
            </p>
            <h1 className="site-display mt-4 text-[2.7rem] leading-[0.95] text-white sm:text-6xl xl:text-7xl">
              Start &amp; earn
              <br />
              through Airbnb
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/80 sm:text-base">
              Host of {PORTFOLIO.villas} villas in Cavite and Tagaytay. Helping aspiring hosts start
              and earn — even without owning a property.
            </p>
          </div>
        </div>

        {/* The inquiry starter — overlaps the frame's edge, like Malaya's search pill. */}
        <div className="relative z-10 mx-auto -mt-8 w-[calc(100%-1.5rem)] max-w-3xl lg:-mt-9">
          <div className="flex flex-col gap-1 rounded-3xl bg-card p-2 shadow-level-3 sm:flex-row sm:items-center sm:rounded-full">
            {STARTERS.map((s, i) => {
              const Icon = TYPES[s.type].icon;
              return (
                <Link
                  key={s.type}
                  to="/inquire"
                  search={{ type: s.type, step: 2 }}
                  className={cn(
                    "flex flex-1 items-center gap-3 rounded-2xl px-4 py-2.5 transition hover:bg-secondary sm:rounded-full",
                    i > 0 && "sm:border-l sm:border-border/70",
                  )}
                >
                  <Icon className="size-5 shrink-0 text-primary" />
                  <span className="leading-tight">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-foreground">
                      {s.label}
                    </span>
                    <span className="block text-sm text-muted-foreground">{s.sub}</span>
                  </span>
                </Link>
              );
            })}
            <Link
              to="/inquire"
              className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground transition hover:bg-primary/90 sm:rounded-full"
            >
              Inquire <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>

      <Followers />
    </section>
  );
}

/** Every audience number, in one quiet row of pills — the admin's chip strip. */
function Followers() {
  const pills: { logo?: Platform; big: string; small: string; href: string; tv?: boolean }[] = [
    { logo: "facebook", big: FACEBOOK.followers, small: "Facebook", href: FACEBOOK.url },
    { logo: "instagram", big: INSTAGRAM.followers, small: "Instagram", href: INSTAGRAM.url },
    {
      logo: "airbnb",
      big: `${AIRBNB_HOST.rating}★`,
      small: `${AIRBNB_HOST.reviews} reviews`,
      href: AIRBNB_HOST.url,
    },
    { big: `${TOTAL_REVIEWS}+`, small: "guest reviews", href: "#reviews" },
    {
      big: "As seen on",
      small: "PTV",
      href: "https://www.youtube.com/watch?v=Uq1KitcVAwQ",
      tv: true,
    },
  ];
  return (
    <div className="mx-auto mt-6 flex max-w-5xl flex-wrap justify-center gap-2 px-1">
      {pills.map((p) => (
        <a
          key={p.small}
          href={p.href}
          {...(p.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
          className="flex items-center gap-2 rounded-full bg-card px-3.5 py-2 text-sm shadow-level-1 transition hover:shadow-level-2"
        >
          {p.logo ? (
            <PlatformLogo platform={p.logo} className="size-[18px]" />
          ) : p.tv ? (
            <Play className="size-[18px] fill-[#FF0000] text-[#FF0000]" />
          ) : (
            <Star className="size-[18px] fill-warning text-warning" />
          )}
          <span className="font-semibold tabular-nums">{p.big}</span>
          <span className="text-muted-foreground">{p.small}</span>
        </a>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- villas

interface Panel {
  key: string;
  title: string;
  group: string;
  location: string;
  highlight: string;
  summary: string;
  stats: string[];
  cover: string;
  coverPosition?: string;
  more: string[];
  href: string;
  soon?: boolean;
}

const PANELS: Panel[] = [
  ...VILLAS.map((v) => ({
    key: v.code,
    title: v.title,
    group: v.group,
    location: v.location,
    highlight: v.highlight,
    summary: v.summary,
    stats: [`${v.bedrooms} bedrooms`, `${v.bathrooms} baths`, `Up to ${v.maxPax} guests`],
    cover: villaPhoto(v.code, v.cover),
    more: v.more.map((n) => villaPhoto(v.code, n)),
    href: villaUrl(v.code),
  })),
  {
    key: "next",
    title: "Coming soon",
    group: `Villa no. ${VILLAS.length + 1}`,
    location: "Being built now",
    highlight: "Private pool · Event lawn",
    summary: "The next Malaya villa is on its way. Want the one after it to be yours?",
    stats: [],
    cover: "/villas/next.webp",
    coverPosition: "46% 62%",
    more: [],
    href: "",
    soon: true,
  },
];

/**
 * Every villa as a tall photo panel. The one you point at (or tap, on a
 * phone) opens up and shows what it is; the rest stay narrow strips with
 * their names. Clicking an open panel goes to the villa on malayavillas.com.
 * A row from `md`, a stack below it.
 */
function Villas() {
  const [active, setActive] = useState(0);
  return (
    <section id="villas" className="scroll-mt-20 pt-20 lg:pt-24">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <Eyebrow>Cavite | Tagaytay</Eyebrow>
        <h2 className="site-display mt-4 text-4xl leading-none text-brand-heading sm:text-6xl">
          {PORTFOLIO.villas} villas. One more coming.
        </h2>
        <p className="brand-eyebrow mt-5 text-[10px] text-primary sm:text-xs">
          Malaya Villas is the proof
        </p>
      </div>

      <div className="mx-auto mt-10 flex max-w-[1400px] flex-col gap-2 px-3 sm:px-6 md:h-[520px] md:flex-row">
        {PANELS.map((p, i) => {
          const open = i === active;
          const body = (
            <>
              <img
                src={p.cover}
                alt={p.title}
                loading="lazy"
                style={p.coverPosition ? { objectPosition: p.coverPosition } : undefined}
                className={cn(
                  "absolute inset-0 size-full object-cover transition duration-700",
                  open ? "scale-100" : "scale-110",
                )}
              />
              <span
                className={cn(
                  "absolute inset-0 transition-opacity duration-500",
                  open
                    ? "bg-gradient-to-t from-black/85 via-black/25 to-transparent"
                    : "bg-black/45 group-hover:bg-black/30",
                )}
              />

              {/* Closed: the name, sideways on a laptop, across on a phone. */}
              <span
                className={cn(
                  "absolute inset-0 flex items-center gap-3 px-4 text-white transition-opacity duration-300 md:flex-col md:justify-end md:px-0 md:pb-5",
                  open ? "pointer-events-none opacity-0" : "opacity-100",
                )}
              >
                <span className="text-[11px] font-semibold tabular-nums text-white/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="site-display whitespace-nowrap text-base md:rotate-180 md:[writing-mode:vertical-rl]">
                  {p.soon ? "Coming soon" : p.title}
                </span>
              </span>

              {/* Open: everything about it. */}
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 p-5 text-white transition-all duration-500 sm:p-7",
                  open
                    ? "translate-y-0 opacity-100 delay-200"
                    : "pointer-events-none translate-y-4 opacity-0",
                )}
              >
                <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
                  <span className="rounded-full bg-white/15 px-2 py-0.5 tabular-nums backdrop-blur">
                    No. {i + 1}
                  </span>
                  {p.group}
                </span>
                <span className="site-display mt-2 block text-3xl leading-none sm:text-4xl">
                  {p.title}
                </span>
                <span className="mt-1.5 flex items-center gap-1.5 text-sm text-white/85">
                  <MapPin className="size-3.5 shrink-0" /> {p.location} · {p.highlight}
                </span>
                <span className="mt-3 line-clamp-2 block max-w-md text-sm leading-relaxed text-white/80">
                  {p.summary}
                </span>
                {p.stats.length > 0 && (
                  <span className="mt-4 flex flex-wrap gap-1.5">
                    {p.stats.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-white/15 px-2.5 py-1 text-xs backdrop-blur"
                      >
                        {s}
                      </span>
                    ))}
                  </span>
                )}
                <span className="mt-5 flex items-end justify-between gap-4">
                  <span className="hidden gap-1.5 sm:flex">
                    {p.more.map((m) => (
                      <img
                        key={m}
                        src={m}
                        alt=""
                        loading="lazy"
                        className="h-14 w-20 rounded-lg object-cover ring-2 ring-white/70"
                      />
                    ))}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#3c2411]">
                    {p.soon ? "Build yours" : "View villa"}
                    {p.soon ? (
                      <ArrowRight className="size-4" />
                    ) : (
                      <ArrowUpRight className="size-4" />
                    )}
                  </span>
                </span>
              </span>
            </>
          );
          const cls = cn(
            "group relative block overflow-hidden rounded-3xl bg-secondary shadow-level-2 outline-none transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:ring-primary",
            open ? "h-[440px] md:h-auto md:flex-[7]" : "h-14 md:h-auto md:flex-1",
          );
          // A tap on a closed panel opens it; only an open panel navigates.
          const onClick = (e: React.MouseEvent) => {
            if (!open) {
              e.preventDefault();
              setActive(i);
            }
          };
          const handlers = {
            onMouseEnter: () => setActive(i),
            onFocus: () => setActive(i),
            onClick,
          };
          return p.soon ? (
            <Link
              key={p.key}
              to="/inquire"
              search={{ type: "build", step: 2 }}
              className={cls}
              {...handlers}
            >
              {body}
            </Link>
          ) : (
            <a
              key={p.key}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className={cls}
              {...handlers}
            >
              {body}
            </a>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 px-4 text-center">
        <p className="text-sm text-muted-foreground">
          {PORTFOLIO.bedrooms} bedrooms · room for {PORTFOLIO.guests} guests a night · one system
          running all of it
        </p>
        <a
          href={MALAYA_SITE}
          target="_blank"
          rel="noreferrer"
          className="brand-caps inline-flex h-11 items-center gap-1.5 rounded-full bg-card px-6 text-[15px] text-primary shadow-level-2 transition hover:shadow-level-3"
        >
          See them on malayavillas.com <ArrowUpRight className="size-4" />
        </a>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ built

/** His beach cabins in Lian, Batangas — built from scratch (his FB post, 2026-10). */
const BUILD_STEPS = [
  {
    photo: "/builds/lian/1.webp",
    step: "Breaking ground",
    note: "Walls, arches and the plunge pool's shell",
  },
  { photo: "/builds/lian/2.webp", step: "Shell up", note: "Glass gables in, tiles going on" },
  { photo: "/builds/lian/3.webp", step: "Finishing", note: "Pools tiled, lights and planters in" },
  { photo: "/builds/lian/4.webp", step: "Airbnb-ready", note: "Fully furnished, ready for guests" },
];

const BUILD_FACTS = [
  "2 cabins",
  "60 sqm each",
  "High ceilings",
  "Private plunge pools",
  "5-min walk to the beach",
];

function Built() {
  // The line under the steps fills as the section crosses the screen.
  const ref = useParallaxVar<HTMLDivElement>();
  return (
    <section id="built" className="scroll-mt-20 pt-24 lg:pt-28">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <Eyebrow>Built from the ground up · Lian, Batangas</Eyebrow>
        <h2 className="site-display mt-4 text-4xl leading-none text-brand-heading sm:text-6xl">
          From bare lot to beach cabins
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {BUILD_FACTS.map((f) => (
            <span key={f} className="rounded-full bg-card px-3.5 py-1.5 text-sm shadow-level-1">
              {f}
            </span>
          ))}
        </div>
      </div>

      <div ref={ref} className="mx-auto mt-10 max-w-6xl px-4 sm:px-8">
        {/* The progress line, desktop only — the phone swipes instead. */}
        <div className="relative mb-6 hidden h-1 rounded-full bg-border md:block">
          <div
            className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-primary"
            style={{ scale: "clamp(0, calc((var(--parallax, 0) + 0.85) * 1.05), 1) 1" }}
          />
          <div className="absolute inset-x-0 -top-1.5 grid grid-cols-4">
            {BUILD_STEPS.map((s) => (
              <span key={s.step} className="flex justify-center">
                <span className="size-4 rounded-full border-[3px] border-primary bg-card" />
              </span>
            ))}
          </div>
        </div>

        <ol className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 no-scrollbar md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0">
          {BUILD_STEPS.map((s, i) => (
            <li
              key={s.step}
              className="group w-[70vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-3xl bg-card shadow-level-2 md:w-auto md:max-w-none"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={s.photo}
                  alt={s.step}
                  loading="lazy"
                  className="size-full object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-semibold tabular-nums shadow-level-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {i === BUILD_STEPS.length - 1 && (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-[11px] font-semibold text-success-foreground shadow-level-1">
                    <Check className="size-3" /> Done
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="brand-caps text-base text-primary">{s.step}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{s.note}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/inquire"
            search={{ type: "build", step: 2 }}
            className="brand-caps inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-[15px] text-primary-foreground shadow-level-2 transition hover:bg-primary/90"
          >
            Build yours <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/inquire"
            search={{ type: "other", step: 2 }}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-card px-5 text-sm shadow-level-1 transition hover:shadow-level-2"
          >
            <span className="size-2 rounded-full bg-success" />
            <span className="font-semibold">Now for sale</span>
            <span className="text-muted-foreground">· ₱8.8M for both</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------- meet marj

const PITCH = FACEBOOK.pitch.split(" · ");

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

function MeetMarj() {
  const mine = LINKS.filter((l) => l.kind === "personal");
  const more = LINKS.filter((l) => l.kind !== "personal");
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24 sm:px-8 lg:pt-28">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
        <div className="space-y-3">
          <ParallaxImage
            src="/brand/marj-family.webp"
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
          <Eyebrow>Meet Marj</Eyebrow>
          <h2 className="site-display mt-4 text-4xl leading-none text-brand-heading sm:text-5xl">
            Family first. Host of {PORTFOLIO.villas} villas.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-foreground">
            &ldquo;Growing up without a home, I dreamed of having one.&rdquo; He started out renting
            staycations, found joy in it, and built Malaya Villas from there.
          </p>
          <ul className="mt-5 space-y-2">
            {PITCH.map((line) => (
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
            <div className="flex flex-wrap gap-1.5 border-t border-border/60 p-3">
              {more.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-primary/10 hover:text-primary"
                >
                  {l.platform === "web" ? (
                    <Globe className="size-3.5 text-primary" />
                  ) : (
                    <PlatformLogo platform={l.platform} className="size-3.5" />
                  )}
                  {l.name}
                  {l.stat && <span className="text-muted-foreground">· {l.stat}</span>}
                </a>
              ))}
            </div>
          </div>
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
      className="group flex items-center gap-3 border-b border-border/60 px-4 py-3 transition hover:bg-secondary/60"
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

// ---------------------------------------------------------------- reviews

function Reviews() {
  const half = Math.ceil(GUEST_REVIEWS.length / 2);
  const rows = [GUEST_REVIEWS.slice(0, half), GUEST_REVIEWS.slice(half)];
  const fade = "linear-gradient(to right, transparent, black 6%, black 94%, transparent)";
  return (
    <section id="reviews" className="scroll-mt-20 pt-24 lg:pt-28">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <Eyebrow>Guest reviews</Eyebrow>
        <h2 className="site-display mt-4 text-4xl leading-none text-brand-heading sm:text-6xl">
          {TOTAL_REVIEWS}+ guests said it
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {REVIEW_SCORES.map((r) => (
            <span
              key={r.platform}
              className="flex items-center gap-2 rounded-full bg-card px-3.5 py-2 text-sm shadow-level-1"
            >
              <PlatformLogo platform={r.platform} className="size-[18px]" />
              <span className="font-semibold">{r.line}</span>
              <span className="text-muted-foreground">· {r.reviews}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10 space-y-4">
        {rows.map((row, ri) => (
          <div
            key={ri}
            className="marquee overflow-hidden"
            style={{ maskImage: fade, WebkitMaskImage: fade }}
          >
            <div
              className="marquee-track flex w-max gap-4 py-2"
              {...(ri === 1 ? { "data-reverse": "" } : {})}
              style={{ "--marquee-speed": ri === 0 ? "80s" : "95s" } as CSSProperties}
            >
              {[...row, ...row].map((r, i) => (
                <figure
                  key={i}
                  aria-hidden={i >= row.length || undefined}
                  className="flex w-[290px] shrink-0 flex-col rounded-2xl bg-card p-5 shadow-level-1 sm:w-[340px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex gap-0.5 text-warning">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="size-3.5 fill-current" />
                      ))}
                    </span>
                    <PlatformLogo platform={r.platform} className="size-4" />
                  </div>
                  <blockquote className="mt-3 line-clamp-4 flex-1 text-sm leading-relaxed text-foreground">
                    &ldquo;{r.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-2.5 text-sm">
                    <span className="grid size-8 place-items-center rounded-full bg-secondary font-semibold text-primary">
                      {r.name[0]}
                    </span>
                    <span>
                      <span className="block font-semibold leading-tight">{r.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {r.villa} · {r.when}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
