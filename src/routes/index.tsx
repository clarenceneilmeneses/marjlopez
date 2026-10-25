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
  ChevronRight,
  Globe,
  MapPin,
  Play,
  Star,
} from "@/components/icons";
import { useEffect, useState, type CSSProperties } from "react";

import { PublicFooter, PublicHeader } from "@/components/site/chrome";
import { PlatformLogo, type Platform } from "@/components/site/logos";
import { ParallaxImage } from "@/components/site/parallax";
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
  photos: string[];
  coverPosition?: string;
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
    photos: [v.cover, ...v.more].map((n) => villaPhoto(v.code, n)),
    href: villaUrl(v.code),
  })),
  {
    key: "next",
    title: "Opening soon",
    group: `Villa no. ${VILLAS.length + 1} · Acquired`,
    location: "San Vicente, Bamban, Tarlac",
    highlight: "10 minutes from Clark Airport",
    summary:
      "Already acquired and opening soon — Malaya's newest, 10 minutes from Clark Airport. Want the next one to be yours?",
    stats: [],
    photos: ["/villas/next.webp"],
    coverPosition: "46% 62%",
    href: "",
    soon: true,
  },
];

/**
 * Two columns on a laptop (Clarence, 2026-10-25): the villas as a list on the
 * left — the Inbox's list look — and the picked one large on the right. On a
 * phone the preview opens under the tapped row instead.
 *
 * Picking a row only picks it. The one way off the page is the preview's own
 * View villa button, so nobody leaves by accident.
 */
function Villas() {
  // Opens on the acquired villa (Clarence, 2026-10-25), the newest one.
  const [active, setActive] = useState(() => Math.max(0, PANELS.findIndex((p) => p.soon)));
  const current = PANELS[active] ?? PANELS[0]!;
  return (
    <section id="villas" className="scroll-mt-20 pt-20 lg:pt-24">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <Eyebrow>Cavite | Tagaytay | Tarlac</Eyebrow>
        <h2 className="site-display mt-4 text-4xl leading-none text-brand-heading sm:text-6xl">
          {PORTFOLIO.villas} villas. One more coming.
        </h2>
        <p className="brand-eyebrow mt-5 text-[10px] text-primary sm:text-xs">
          Malaya Villas is the proof
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl gap-5 px-3 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)] lg:items-start">
        <ul className="flex flex-col gap-1 rounded-3xl bg-card p-2 shadow-level-2">
          {PANELS.map((p, i) => {
            const on = i === active;
            return (
              <li key={p.key}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors",
                    on ? "bg-secondary" : "hover:bg-secondary/60",
                  )}
                >
                  <img
                    src={p.photos[0]}
                    alt=""
                    loading="lazy"
                    style={p.coverPosition ? { objectPosition: p.coverPosition } : undefined}
                    className="size-12 shrink-0 rounded-xl object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={cn("truncate text-sm", on ? "font-bold" : "font-semibold")}>
                        {p.title}
                      </span>
                      {p.soon && (
                        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                          Acquired
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="size-3 shrink-0" /> {p.location}
                    </span>
                  </span>
                  <ChevronRight
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      on && "rotate-90 text-primary lg:rotate-0",
                    )}
                  />
                </button>
                {/* The phone's preview, right under the row it belongs to. */}
                {on && (
                  <div className="px-1 pb-2 pt-1 lg:hidden">
                    <VillaPreview panel={p} n={i + 1} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="hidden lg:sticky lg:top-24 lg:block">
          <VillaPreview key={current.key} panel={current} n={active + 1} />
        </div>
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

function VillaPreview({ panel: p, n }: { panel: Panel; n: number }) {
  const [shown, setShown] = useState(0);
  const photo = p.photos[shown] ?? p.photos[0]!;
  return (
    <div className="animate-in fade-in overflow-hidden rounded-3xl bg-card shadow-level-3 duration-300">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img
          key={photo}
          src={photo}
          alt={p.title}
          style={p.coverPosition && shown === 0 ? { objectPosition: p.coverPosition } : undefined}
          className="animate-in fade-in absolute inset-0 size-full object-cover duration-500"
        />
        <span className="absolute left-3 top-3 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-semibold tabular-nums shadow-level-1">
          No. {n}
        </span>
        {p.photos.length > 1 && (
          <span className="absolute inset-x-3 bottom-3 flex gap-1.5">
            {p.photos.map((ph, i) => (
              <button
                key={ph}
                type="button"
                onClick={() => setShown(i)}
                aria-label={`Photo ${i + 1}`}
                className={cn(
                  "h-12 w-16 overflow-hidden rounded-lg ring-2 transition sm:h-14 sm:w-20",
                  i === shown ? "ring-white" : "opacity-75 ring-white/40 hover:opacity-100",
                )}
              >
                <img src={ph} alt="" loading="lazy" className="size-full object-cover" />
              </button>
            ))}
          </span>
        )}
      </div>
      <div className="p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {p.group}
        </p>
        <p className="site-display mt-1 text-3xl leading-none text-brand-heading">{p.title}</p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" /> {p.location} · {p.highlight}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-foreground">{p.summary}</p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="flex flex-wrap gap-1.5">
            {p.stats.map((s) => (
              <span key={s} className="rounded-full bg-secondary px-2.5 py-1 text-xs">
                {s}
              </span>
            ))}
          </span>
          {p.soon ? (
            <Link
              to="/inquire"
              search={{ type: "build", step: 2 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Build yours <ArrowRight className="size-4" />
            </Link>
          ) : (
            <a
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              View villa <ArrowUpRight className="size-4" />
            </a>
          )}
        </div>
      </div>
    </div>
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

/**
 * The build as a story: the steps on the left play through on their own
 * (paused while you point at the section), the photo on the right follows,
 * and clicking a step jumps to it.
 */
function Built() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setStep((s) => (s + 1) % BUILD_STEPS.length), 3800);
    return () => window.clearTimeout(t);
  }, [step, paused]);
  const current = BUILD_STEPS[step]!;

  return (
    <section
      id="built"
      className="scroll-mt-20 pt-24 lg:pt-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="order-2 lg:order-1">
          <Eyebrow>Built from the ground up · Lian, Batangas</Eyebrow>
          <h2 className="site-display mt-4 text-4xl leading-none text-brand-heading sm:text-5xl">
            From bare lot to beach cabins
          </h2>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {BUILD_FACTS.map((f) => (
              <span
                key={f}
                className="rounded-full bg-card px-3 py-1.5 text-xs shadow-level-1 sm:text-sm"
              >
                {f}
              </span>
            ))}
          </div>

          <ol className="relative mt-7 space-y-1">
            {BUILD_STEPS.map((s, i) => {
              const on = i === step;
              const done = i < step;
              return (
                <li key={s.step}>
                  <button
                    type="button"
                    onClick={() => setStep(i)}
                    aria-current={on ? "step" : undefined}
                    className={cn(
                      "relative flex w-full items-start gap-4 overflow-hidden rounded-2xl px-3 py-3 text-left transition-colors",
                      on ? "bg-card shadow-level-2" : "hover:bg-card/60",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums transition-colors",
                        on || done
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="size-4" /> : String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "brand-caps block text-base",
                          on ? "text-primary" : "text-foreground/80",
                        )}
                      >
                        {s.step}
                      </span>
                      <span className="block text-sm text-muted-foreground">{s.note}</span>
                    </span>
                    {/* The step's own clock — fills while it plays. */}
                    {on && !paused && (
                      <span
                        key={step}
                        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary/60"
                        style={{ animation: "build-step 3.8s linear forwards" }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-7 flex flex-wrap items-center gap-3">
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

        <div className="relative order-1 aspect-[4/5] overflow-hidden rounded-[2rem] bg-secondary shadow-level-3 lg:order-2">
          {BUILD_STEPS.map((s, i) => (
            <img
              key={s.photo}
              src={s.photo}
              alt={s.step}
              loading="lazy"
              className={cn(
                "absolute inset-0 size-full object-cover transition-all duration-700",
                i === step ? "scale-100 opacity-100" : "scale-105 opacity-0",
              )}
            />
          ))}
          <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1.5 text-xs font-semibold shadow-level-1">
            {step === BUILD_STEPS.length - 1 && <Check className="size-3.5 text-success" />}
            {String(step + 1).padStart(2, "0")} · {current.step}
          </span>
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
                    {/* Their own profile photo, copied from Malaya's reviews (public/reviews). */}
                    <img
                      src={`/reviews/${r.name.toLowerCase()}.webp`}
                      alt=""
                      loading="lazy"
                      className="size-9 shrink-0 rounded-full bg-secondary object-cover ring-2 ring-card"
                    />
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
