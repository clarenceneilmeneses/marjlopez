/**
 * Proof that sits on the offer pages (the boss, 2026-11-03: "kapag pinili nila
 * yung gusto nilang services … nandon na yung detailed ng offer and proof").
 * Both used to be on the landing; they moved to the offers they prove.
 *
 *   VillaPicker   every villa Malaya runs, plus the one acquired next
 *   GuestReviews  two rows of real guest reviews, sliding past
 */
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, ChevronRight, MapPin, Star } from "@/components/icons";
import { useState, type CSSProperties, type ReactNode } from "react";

import { PlatformLogo } from "@/components/site/logos";
import { GUEST_REVIEWS, REVIEW_SCORES, TOTAL_REVIEWS } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { MALAYA_SITE, PORTFOLIO, VILLAS, villaPhoto, villaUrl } from "@/lib/villas";

function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("brand-eyebrow text-[10px] text-muted-foreground sm:text-xs", className)}>
      {children}
    </p>
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
 * Two columns on a laptop (Clarence, 2026-10-25): the villas as a stack of
 * pills on the left, each its own photo, and the picked one large on the
 * right. On a phone the preview opens under the tapped pill instead.
 *
 * Picking a row only picks it. The one way off the page is the preview's own
 * View villa button, so nobody leaves by accident.
 */
export function VillaPicker({
  eyebrow,
  heading,
  tagline,
}: {
  eyebrow: string;
  heading: string;
  tagline: string;
}) {
  // Opens on the acquired villa (Clarence, 2026-10-25), the newest one.
  const [active, setActive] = useState(() =>
    Math.max(
      0,
      PANELS.findIndex((p) => p.soon),
    ),
  );
  const current = PANELS[active] ?? PANELS[0]!;
  return (
    <section id="villas" className="scroll-mt-20 pt-24 lg:pt-32">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="site-display mt-4 text-4xl leading-none text-brand-heading sm:text-6xl">
          {heading}
        </h2>
        <p className="brand-eyebrow mt-5 text-[10px] text-primary sm:text-xs">{tagline}</p>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl gap-5 px-3 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)] lg:items-start">
        <ul className="flex flex-col gap-2">
          {PANELS.map((p, i) => {
            const on = i === active;
            return (
              <li key={p.key}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  className={cn(
                    "group relative flex h-16 w-full items-center gap-3 overflow-hidden rounded-2xl px-4 text-left shadow-level-1 transition duration-300",
                    on
                      ? "shadow-level-3 ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "hover:-translate-y-0.5 hover:shadow-level-2",
                  )}
                >
                  {/* The photo is the pill (Clarence, 2026-10-25), shaded
                      darkest behind the text so the white reads on any shot. */}
                  <img
                    src={p.photos[0]}
                    alt=""
                    loading="lazy"
                    style={p.coverPosition ? { objectPosition: p.coverPosition } : undefined}
                    className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20 transition-opacity",
                      on ? "opacity-90" : "opacity-100",
                    )}
                  />
                  <span className="relative mr-auto flex min-w-0 flex-col items-start text-white">
                    <span className="flex max-w-full items-center gap-2">
                      <span className="text-[11px] font-semibold tabular-nums text-white/70">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={cn("truncate text-sm", on ? "font-bold" : "font-semibold")}>
                        {p.title}
                      </span>
                      {p.soon && (
                        <span className="rounded-full bg-success px-2 py-0.5 text-[10px] font-semibold text-white">
                          Acquired
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 flex max-w-full items-center gap-1 text-xs text-white/80">
                      <MapPin className="size-3 shrink-0" />
                      <span className="truncate">{p.location}</span>
                    </span>
                  </span>
                  <ChevronRight
                    className={cn(
                      "relative size-4 shrink-0 text-white transition-transform",
                      on && "rotate-90 lg:rotate-0",
                    )}
                  />
                </button>
                {/* The phone's preview, right under the pill it belongs to. */}
                {on && (
                  <div className="pb-2 pt-3 lg:hidden">
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
              to="/invest"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Invest in it <ArrowRight className="size-4" />
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

// ---------------------------------------------------------------- reviews

export function GuestReviews({
  eyebrow = "Guest reviews",
  heading = `${TOTAL_REVIEWS}+ guests said it`,
}: {
  eyebrow?: string;
  heading?: string;
}) {
  const half = Math.ceil(GUEST_REVIEWS.length / 2);
  const rows = [GUEST_REVIEWS.slice(0, half), GUEST_REVIEWS.slice(half)];
  const fade = "linear-gradient(to right, transparent, black 6%, black 94%, transparent)";
  return (
    <section id="reviews" className="scroll-mt-20 pt-24 lg:pt-32">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="site-display mt-4 text-4xl leading-none text-brand-heading sm:text-6xl">
          {heading}
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
