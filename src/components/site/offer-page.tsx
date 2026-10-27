/**
 * One offer's own page (the boss, 2026-10-28) — the long, walk-you-down shape
 * of a masterclass sales page, in this site's own look rather than the
 * reference's neon-on-black:
 *
 *   1  Hero        the landing's dark photo frame, the offer's headline, one
 *                  button, three plain facts under it
 *   2  Proof       the real numbers, one quiet row
 *   3  Why Marj    two photos, before and after, and the short story
 *   4  What you get numbered cards
 *   5  Is it you?  who it's for and who it isn't, then the honest catch
 *   6  After you apply   four steps
 *   7  FAQ
 *   8  Closing     the button again, and the other three offers
 *
 * Every word comes from lib/offers.ts, or from Admin → Website once saved there. Every button opens the inquiry form on
 * this offer's questions, so whoever comes from here arrives already sorted.
 */
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, X } from "@/components/icons";

import { PublicFooter, PublicHeader } from "@/components/site/chrome";
import { ParallaxImage } from "@/components/site/parallax";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TYPES } from "@/lib/inquiry";
import { OFFER_ORDER, OFFERS, proofWith, type Offer } from "@/lib/offers";
import { cn } from "@/lib/utils";

export function OfferPage({ offer: o, facebook }: { offer: Offer; facebook: string }) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main id="content">
        <Hero o={o} />
        <Proof facebook={facebook} />
        <Why o={o} />
        <Gets o={o} />
        <Fit o={o} />
        <Steps o={o} />
        <Faq o={o} />
        <Closing o={o} />
      </main>
      <PublicFooter />
    </div>
  );
}

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("brand-eyebrow text-[10px] text-muted-foreground sm:text-xs", className)}>
      {children}
    </p>
  );
}

function Apply({ o, className }: { o: Offer; className?: string }) {
  return (
    <Link
      to="/inquire"
      search={{ type: o.type, step: 2 }}
      className={cn(
        "brand-caps inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-[15px] text-primary-foreground shadow-level-2 transition hover:bg-primary/90",
        className,
      )}
    >
      {o.cta} <ArrowRight className="size-4" />
    </Link>
  );
}

// ------------------------------------------------------------------- hero

function Hero({ o }: { o: Offer }) {
  const Icon = TYPES[o.type].icon;
  return (
    <section className="px-3 sm:px-6">
      <div className="relative mx-auto max-w-[1400px]">
        <div className="relative h-[600px] overflow-hidden rounded-[2rem] bg-[#151314] shadow-level-3 sm:h-[620px] lg:h-[min(76vh,660px)]">
          <ParallaxImage
            src={o.hero.src}
            alt=""
            strength={6}
            frameClassName="absolute inset-0 lg:left-auto lg:w-[62%]"
            className="object-cover"
            style={o.hero.position ? { objectPosition: o.hero.position } : undefined}
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151314] via-[#151314]/65 to-[#151314]/10 lg:hidden" />
          <div className="absolute inset-y-0 left-0 hidden w-[72%] bg-gradient-to-r from-[#151314] from-55% to-transparent lg:block" />

          <div className="absolute inset-x-0 bottom-0 p-6 pb-10 sm:p-10 lg:inset-y-0 lg:right-auto lg:flex lg:w-[58%] lg:flex-col lg:justify-center lg:p-16">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1.5 pl-2 pr-3.5 text-xs font-semibold text-white backdrop-blur-md">
              <span className="grid size-6 place-items-center rounded-full bg-white text-primary">
                <Icon className="size-3.5" />
              </span>
              {o.name}
            </span>
            <h1 className="site-display mt-5 text-[2.6rem] leading-[0.95] text-white sm:text-6xl xl:text-7xl">
              {o.headline[0]}
              <br />
              {o.headline[1]}
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/80 sm:text-base">
              {o.sub}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Apply o={o} />
              <span className="text-xs text-white/60">About 2 minutes · no payment</span>
            </div>
          </div>
        </div>

        {/* Three plain facts on a white strip that overlaps the frame, like the
            landing's inquiry pill. */}
        <ul className="relative z-10 mx-auto -mt-7 grid w-[calc(100%-1.5rem)] max-w-4xl gap-1 rounded-3xl bg-card p-2 shadow-level-3 sm:grid-cols-3 sm:rounded-full">
          {o.facts.map((f) => (
            <li
              key={f}
              className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm sm:justify-center sm:rounded-full"
            >
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                <Check className="size-3" />
              </span>
              <span className="font-medium leading-tight">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ proof

function Proof({ facebook }: { facebook: string }) {
  return (
    <section className="mx-auto mt-14 max-w-5xl px-4 sm:px-8">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-y border-border/70 py-6 lg:grid-cols-4">
        {proofWith(facebook).map((p) => (
          <div key={p.small} className="text-center lg:text-left">
            <dt className="site-display text-4xl leading-none text-brand-heading tabular-nums">
              {p.big}
            </dt>
            <dd className="mt-1.5 text-xs leading-snug text-muted-foreground sm:text-sm">
              {p.small}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// -------------------------------------------------------------------- why

function Why({ o }: { o: Offer }) {
  const shots = [o.why.before, o.why.after];
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-8 lg:pt-24">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Why Marj</Eyebrow>
        <h2 className="site-display mt-4 text-4xl leading-none text-brand-heading sm:text-5xl">
          {o.why.heading}
        </h2>
        <p className="mt-5 text-base leading-relaxed text-foreground/85">{o.why.body}</p>
      </div>
      <div className="mt-10 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        {shots.map((s, i) => (
          <figure key={s.src} className={cn(i === 1 && "sm:order-3")}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-secondary shadow-level-2">
              <img
                src={s.src}
                alt={s.label}
                loading="lazy"
                style={s.position ? { objectPosition: s.position } : undefined}
                className="absolute inset-0 size-full object-cover"
              />
              <span className="absolute left-3 top-3 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-semibold shadow-level-1">
                {s.plain ? s.label : `${i === 0 ? "Then" : "Now"} · ${s.label}`}
              </span>
            </div>
            <figcaption className="mt-2.5 px-1 text-sm text-muted-foreground">
              {s.caption}
            </figcaption>
          </figure>
        ))}
        <span
          aria-hidden
          className="hidden size-11 place-items-center self-center rounded-full bg-card text-primary shadow-level-2 sm:order-2 sm:-mt-8 sm:grid"
        >
          <ArrowRight className="size-5" />
        </span>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------- gets

function Gets({ o }: { o: Offer }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-8 lg:pt-24">
      <div className="max-w-2xl">
        <Eyebrow>What you get</Eyebrow>
        <h2 className="site-display mt-4 text-4xl leading-none text-brand-heading sm:text-5xl">
          {o.gets.heading}
        </h2>
        <p className="mt-4 text-base text-muted-foreground">{o.gets.lead}</p>
      </div>
      <ol
        className={cn(
          "mt-8 grid gap-3 sm:grid-cols-2",
          o.gets.items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4",
        )}
      >
        {o.gets.items.map((it, i) => (
          <li key={it.title} className="rounded-3xl bg-card p-6 shadow-level-1">
            <span className="text-xs font-semibold tabular-nums text-primary">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-lg font-semibold leading-snug">{it.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

// -------------------------------------------------------------------- fit

/**
 * Who it's for and who it isn't, then the catch said plainly — the
 * reference's "ano'ng catch ko?", and the part that keeps the wrong people
 * from applying so the Inbox fills with the right ones.
 */
function Fit({ o }: { o: Offer }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-8 lg:pt-24">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Is this you?</Eyebrow>
        <h2 className="site-display mt-4 text-4xl leading-none text-brand-heading sm:text-5xl">
          Who this is for
        </h2>
      </div>
      <div className="mt-8 grid gap-3 lg:grid-cols-2">
        <FitList tone="yes" title="A good fit if" items={o.fit.yes} />
        <FitList tone="no" title="Probably not if" items={o.fit.no} />
      </div>
      <div className="mt-3 rounded-3xl bg-[#151314] p-6 text-white shadow-level-3 sm:p-8">
        <h3 className="site-display text-3xl leading-none sm:text-4xl">{o.catchLine.heading}</h3>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-white/80">
          {o.catchLine.body}
        </p>
      </div>
    </section>
  );
}

function FitList({ tone, title, items }: { tone: "yes" | "no"; title: string; items: string[] }) {
  const yes = tone === "yes";
  return (
    <div className="rounded-3xl bg-card p-6 shadow-level-1">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </p>
      <ul className="mt-4 space-y-3">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-3 text-[15px] leading-snug">
            <span
              className={cn(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                yes ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground",
              )}
            >
              {yes ? <Check className="size-3" /> : <X className="size-3" />}
            </span>
            <span className={yes ? "text-foreground" : "text-muted-foreground"}>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ------------------------------------------------------------------ steps

function Steps({ o }: { o: Offer }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-8 lg:pt-24">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>After you apply</Eyebrow>
        <h2 className="site-display mt-4 text-4xl leading-none text-brand-heading sm:text-5xl">
          What happens next
        </h2>
      </div>
      <ol className="relative mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {/* The line the four steps sit on, on a laptop. */}
        <span
          aria-hidden
          className="absolute inset-x-[12.5%] top-5 hidden h-px bg-border lg:block"
        />
        {o.steps.map((s, i) => (
          <li
            key={s.title}
            className="relative flex gap-4 lg:flex-col lg:items-center lg:text-center"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-sm font-semibold tabular-nums text-primary shadow-level-2 ring-4 ring-background">
              {i + 1}
            </span>
            <span>
              <span className="block font-semibold leading-snug">{s.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex justify-center">
        <Apply o={o} />
      </div>
    </section>
  );
}

// -------------------------------------------------------------------- faq

function Faq({ o }: { o: Offer }) {
  return (
    <section className="mx-auto max-w-3xl px-4 pt-20 sm:px-8 lg:pt-24">
      <div className="text-center">
        <Eyebrow>Questions</Eyebrow>
        <h2 className="site-display mt-4 text-4xl leading-none text-brand-heading sm:text-5xl">
          Asked a lot
        </h2>
      </div>
      <Accordion type="single" collapsible className="mt-8 rounded-3xl bg-card px-6 shadow-level-1">
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
    </section>
  );
}

// ---------------------------------------------------------------- closing

function Closing({ o }: { o: Offer }) {
  const others = OFFER_ORDER.filter((s) => s !== o.slug).map((s) => OFFERS[s]);
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-8 lg:pt-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#151314] shadow-level-3">
        <img
          src="/brand/marj.webp"
          alt=""
          loading="lazy"
          className="absolute inset-y-0 right-0 hidden h-full w-auto object-cover opacity-90 md:block"
        />
        <div className="absolute inset-y-0 right-0 hidden w-[70%] bg-gradient-to-r from-[#151314] from-35% to-transparent md:block" />
        <div className="relative p-7 sm:p-10 md:max-w-[60%] lg:p-14">
          <h2 className="site-display text-4xl leading-none text-white sm:text-5xl">
            {o.closing.heading}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/80">{o.closing.body}</p>
          <Apply o={o} className="mt-7" />
        </div>
      </div>

      <div className="mt-8 text-center">
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
    </section>
  );
}
