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
import { ArrowRight, ArrowUpRight, BadgeCheck, Check, Globe, Play, Star } from "@/components/icons";
import type { CSSProperties } from "react";

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

interface FanCard {
  key: string;
  title: string;
  photo: string;
  href: string;
  soon?: boolean;
}

const FAN: FanCard[] = [
  ...VILLAS.map((v) => ({
    key: v.code,
    title: v.title,
    photo: villaPhoto(v.code, v.cover),
    href: villaUrl(v.code),
  })),
  { key: "next", title: "Coming soon", photo: villaPhoto("PR-012", 2), href: "", soon: true },
];

function Villas() {
  // --parallax runs -1 → 1 as the fan crosses the screen; it opens from a
  // quarter to full as it rises into view, and stays open.
  const ref = useParallaxVar<HTMLDivElement>();
  const mid = (FAN.length - 1) / 2;
  return (
    <section id="villas" className="scroll-mt-20 overflow-hidden pt-20 lg:pt-24">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <Eyebrow>Cavite | Tagaytay</Eyebrow>
        <h2 className="site-display mt-4 text-4xl leading-none text-brand-heading sm:text-6xl">
          {PORTFOLIO.villas} villas. One more coming.
        </h2>
        <p className="brand-eyebrow mt-5 text-[10px] text-primary sm:text-xs">
          Malaya Villas is the proof
        </p>
      </div>

      <div
        ref={ref}
        className="relative mx-auto mt-10 h-[200px] max-w-[1400px] [--fa:4deg] [--fx:20px] [--fy:2.2px] sm:h-[270px] sm:[--fx:40px] sm:[--fy:3px] md:h-[300px] md:[--fx:52px] lg:h-[380px] lg:[--fa:4.5deg] lg:[--fx:84px] lg:[--fy:4px]"
        style={
          { "--spread": "clamp(0.22, calc(1.3 + var(--parallax, 0) * 1.1), 1)" } as CSSProperties
        }
      >
        {FAN.map((c, i) => {
          const k = i - mid;
          const body = (
            <>
              <img
                src={c.photo}
                alt={c.title}
                loading="lazy"
                className={cn(
                  "size-full object-cover",
                  c.soon && "scale-110 blur-[3px] brightness-75",
                )}
              />
              {c.soon && (
                <span className="absolute inset-0 grid place-items-center p-3 text-center">
                  <span className="site-display text-[11px] leading-tight text-white sm:text-xl">
                    No. {FAN.length}
                    <br />
                    Coming soon
                  </span>
                </span>
              )}
              <span className="absolute bottom-2 left-2 hidden rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-level-1 sm:inline-block">
                {c.soon ? "Build yours →" : c.title}
              </span>
            </>
          );
          const cls =
            "absolute left-1/2 top-4 block aspect-[3/4] w-[86px] origin-bottom overflow-hidden rounded-2xl border-[3px] border-card bg-secondary shadow-level-3 transition-[translate,rotate] duration-500 ease-out hover:z-50 hover:[--lift:1] sm:w-[130px] md:w-[150px] lg:w-[190px] lg:rounded-3xl lg:border-4";
          const style = {
            // The coming-soon card sits on top of its neighbour so its words show.
            zIndex: c.soon ? 25 : 20 - Math.abs(Math.round(k)),
            translate: `calc(-50% + ${k} * var(--fx) * var(--spread)) calc(${k * k} * var(--fy) * var(--spread) - var(--lift, 0) * 26px)`,
            rotate: `calc(${k} * var(--fa) * var(--spread) * (1 - var(--lift, 0)))`,
          } as CSSProperties;
          return c.soon ? (
            <Link
              key={c.key}
              to="/inquire"
              search={{ type: "build", step: 2 }}
              className={cls}
              style={style}
              aria-label="The next villa is coming — build yours with Marj"
            >
              {body}
            </Link>
          ) : (
            <a
              key={c.key}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className={cls}
              style={style}
              aria-label={`${c.title} on malayavillas.com`}
            >
              {body}
            </a>
          );
        })}
      </div>

      <div className="mt-2 flex flex-col items-center gap-3 px-4 text-center">
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
