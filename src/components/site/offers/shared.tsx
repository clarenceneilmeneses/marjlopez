/**
 * The small parts every offer page shares — the button, the eyebrow, the FAQ,
 * the "other offers" row. Everything with a shape of its own lives in that
 * offer's layout file beside this one, so the four pages don't read as one
 * template with the words swapped (Clarence, 2026-10-28).
 */
import { Link } from "@tanstack/react-router";
import { ArrowRight, Play } from "@/components/icons";
import { useState, type ReactNode } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TYPES } from "@/lib/inquiry";
import { OFFER_ORDER, OFFERS, offerPath, videoEmbed, type Offer } from "@/lib/offers";
import type { LandingContent } from "@/lib/site-content";
import { cn } from "@/lib/utils";

/** What every layout gets: its offer, and the landing's content (numbers, the build). */
export interface LayoutProps {
  o: Offer;
  landing: LandingContent;
}

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <p className={cn("brand-eyebrow text-[10px] text-muted-foreground sm:text-xs", className)}>
      {children}
    </p>
  );
}

export function H2({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        "site-display text-4xl leading-[0.95] text-brand-heading sm:text-5xl",
        className,
      )}
    >
      {children}
    </h2>
  );
}

/** The one button: opens the form on this offer's questions. */
export function Apply({
  o,
  tone = "solid",
  className,
  children,
}: {
  o: Offer;
  tone?: "solid" | "light" | "ghost";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Link
      to="/inquire"
      search={{ type: o.type, step: 2 }}
      className={cn(
        "brand-caps inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-[15px] transition",
        tone === "solid" && "bg-primary text-primary-foreground shadow-level-2 hover:bg-primary/90",
        tone === "light" && "bg-white text-[#2b1a10] shadow-level-2 hover:bg-white/90",
        tone === "ghost" && "border border-current/30 hover:bg-current/5",
        className,
      )}
    >
      {children ?? o.cta} <ArrowRight className="size-4" />
    </Link>
  );
}

export function FaqAccordion({ o, className }: { o: Offer; className?: string }) {
  return (
    <Accordion
      type="single"
      collapsible
      className={cn("rounded-3xl bg-card px-6 shadow-level-1", className)}
    >
      {o.faq.map((f, i) => (
        <AccordionItem
          key={f.q}
          value={f.q}
          className={cn("border-border/60", i === o.faq.length - 1 && "border-b-0")}
        >
          <AccordionTrigger className="py-5 text-[15px] font-semibold hover:no-underline">
            {f.q}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/** The other three offers, as small pills — for whoever landed on the wrong page. */
export function OtherOffers({ o, className }: { o: Offer; className?: string }) {
  const others = OFFER_ORDER.filter((s) => s !== o.slug).map((s) => OFFERS[s]);
  return (
    <div className={cn("text-center", className)}>
      <p className="text-sm text-muted-foreground">Not quite you? Marj also helps with</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {others.map((x) => {
          const Icon = TYPES[x.type].icon;
          return (
            <Link
              key={x.slug}
              to={offerPath(x.slug)}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-card px-4 text-sm font-medium shadow-level-1 transition hover:shadow-level-2"
            >
              <Icon className="size-4 text-primary" />
              {x.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/** The offer's name as a small badge with its icon. */
export function OfferBadge({ o, dark = false }: { o: Offer; dark?: boolean }) {
  const Icon = TYPES[o.type].icon;
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-xs font-semibold",
        dark
          ? "border border-white/20 bg-white/10 text-white backdrop-blur-md"
          : "bg-card text-foreground shadow-level-1",
      )}
    >
      <span
        className={cn(
          "grid size-6 place-items-center rounded-full",
          dark ? "bg-white text-primary" : "bg-secondary text-primary",
        )}
      >
        <Icon className="size-3.5" />
      </span>
      {o.name}
    </span>
  );
}

/**
 * Marj explaining the offer himself (the boss, 2026-11-03: a video on every
 * offer "para mas clear"). Paste a YouTube or Facebook link in Admin →
 * Website → the offer → Video; with no link the section isn't shown at all.
 * YouTube shows its thumbnail and loads the player only on a tap.
 */
export function OfferVideo({
  o,
  dark = false,
  className,
}: {
  o: Offer;
  dark?: boolean;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const embed = videoEmbed(o.video.url);
  if (!embed) return null;
  const title = o.video.heading || `${o.name}, explained by Marj`;
  return (
    <section className={cn("mx-auto max-w-5xl px-4 pt-20 sm:px-8 lg:pt-28", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow className={dark ? "text-white/60" : undefined}>Watch · from Marj</Eyebrow>
          <H2 className={cn("mt-4", dark && "text-white")}>{title}</H2>
        </div>
        {o.video.caption && (
          <p className={cn("max-w-sm text-sm", dark ? "text-white/70" : "text-muted-foreground")}>
            {o.video.caption}
          </p>
        )}
      </div>
      <div className="relative mt-8 aspect-video overflow-hidden rounded-[2rem] bg-black shadow-level-3">
        {embed.kind === "facebook" || playing ? (
          <iframe
            src={embed.src}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play: ${title}`}
            className="group absolute inset-0"
          >
            <img src={embed.thumb} alt="" loading="lazy" className="size-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20" />
            <span className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-primary shadow-level-3 transition group-hover:scale-110 sm:size-24">
              <Play className="size-8 fill-current sm:size-10" />
            </span>
          </button>
        )}
      </div>
    </section>
  );
}

/** The fixed price, as a small card — shown only where the offer has one. */
export function PriceTag({ o, className }: { o: Offer; className?: string }) {
  if (!o.price.show || !o.price.amount) return null;
  return (
    <div className={cn("rounded-2xl bg-card px-5 py-4 shadow-level-1", className)}>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Investment
      </p>
      <p className="site-display mt-1 text-4xl leading-none text-brand-heading tabular-nums">
        {o.price.amount}
      </p>
      {o.price.note && (
        <p className="mt-2 text-sm leading-snug text-muted-foreground">{o.price.note}</p>
      )}
    </div>
  );
}
