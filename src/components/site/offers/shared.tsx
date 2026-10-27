/**
 * The small parts every offer page shares — the button, the eyebrow, the FAQ,
 * the "other offers" row. Everything with a shape of its own lives in that
 * offer's layout file beside this one, so the four pages don't read as one
 * template with the words swapped (Clarence, 2026-10-28).
 */
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "@/components/icons";
import type { ReactNode } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TYPES } from "@/lib/inquiry";
import { OFFER_ORDER, OFFERS, type Offer } from "@/lib/offers";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
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
              to={`/${x.slug}`}
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
