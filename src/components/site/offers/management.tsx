/**
 * Property management — for owners, so it reads like a well-run property:
 * calm, practical, a report you'd trust.
 *
 *   Hero      a villa at night behind the headline, and an iPhone lock screen
 *             where the owner's notifications slide in one by one — booked,
 *             checked in, cleaned, report ready. That's the whole pitch.
 *   Villas    the ones the team already runs, sliding past
 *   Why       the story beside a two-photo collage
 *   Gets      a ruled hand-off list beside a tall photo that stays put
 *   Proof     the real numbers on a dark band
 *   Fit       two lists, then the catch as a pull quote
 *   Steps     four cards on a sand ground
 *   FAQ       "Owners ask" on the left, the answers on the right
 *   Closing   text and photo, split
 */
import { Check, Lock, MapPin, X } from "@/components/icons";
import type { CSSProperties } from "react";

import { ParallaxImage } from "@/components/site/parallax";
import { proofWith, type Offer } from "@/lib/offers";
import { PORTFOLIO, VILLAS, villaPhoto } from "@/lib/villas";

import { Apply, Eyebrow, FaqAccordion, H2, OfferBadge, OtherOffers } from "./shared";
import type { LayoutProps } from "./shared";
import { IPhone } from "./devices";

export function ManagementLayout({ o, landing }: LayoutProps) {
  const facebook = landing.numbers.facebook;
  return (
    <>
      <Hero o={o} />
      <Villas />
      <Why o={o} />
      <Gets o={o} />
      <Proof facebook={facebook} />
      <Fit o={o} />
      <Steps o={o} />
      <Faq o={o} />
      <Closing o={o} />
    </>
  );
}

function Hero({ o }: { o: Offer }) {
  return (
    <section className="px-3 sm:px-6">
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[2rem] bg-[#0f0d0c] shadow-level-3">
        <ParallaxImage
          src={o.hero.src}
          alt=""
          strength={5}
          frameClassName="absolute inset-0"
          className="object-cover opacity-80"
          style={o.hero.position ? { objectPosition: o.hero.position } : undefined}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d0c] via-[#0f0d0c]/40 to-[#0f0d0c]/20 lg:bg-gradient-to-r lg:from-[#0f0d0c]/90 lg:via-[#0f0d0c]/45 lg:to-[#0f0d0c]/10" />

        <div className="relative grid items-center gap-12 px-6 pt-16 sm:px-10 lg:min-h-[min(82vh,740px)] lg:grid-cols-[1.15fr_0.85fr] lg:px-16 lg:py-16">
          <div>
            <OfferBadge o={o} dark />
            <h1 className="site-display mt-5 text-[2.2rem] leading-[0.95] text-white sm:text-6xl xl:text-7xl">
              {o.headline[0]}
              <br />
              {o.headline[1]}
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/80 sm:text-base">
              {o.sub}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Apply o={o} tone="light" />
              <span className="text-xs text-white/60">About 2 minutes · no payment</span>
            </div>
            <ul className="mt-8 flex flex-wrap gap-2">
              {o.facts.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md"
                >
                  <Check className="size-3.5 text-[#7ee2a8]" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          {/* On a phone the iPhone rises out of the frame's bottom edge. */}
          <div className="flex justify-center lg:justify-end">
            <OwnerPhone />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * What an owner's phone looks like with Malaya running the place: a lock
 * screen over one of the villas, the team's updates arriving one at a time.
 * An illustration of the kind of message, so no amounts and no names.
 */
const NOTES = [
  { title: "New booking", body: "2 nights, a family of 6. Check-in Friday.", when: "now" },
  { title: "Guest checked in", body: "The team met them at the gate. All good.", when: "2h ago" },
  { title: "Cleaning done", body: "Turnover finished — photos are in your report.", when: "Sun" },
  {
    title: "Your monthly report",
    body: "Nights booked, money in, money out, your payout.",
    when: "1st",
  },
];

const SF = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
};

function OwnerPhone() {
  return (
    <IPhone className="w-[250px] translate-y-10 sm:w-[280px] lg:w-[300px] lg:translate-y-0">
      <img
        src="/malaya/villa-hillside-pool.webp"
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <span className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/55" />
      <div className="absolute inset-x-0 top-[9%] text-center text-white" style={SF}>
        <Lock className="mx-auto size-3.5 opacity-90" />
        <p className="mt-1 text-[11px] font-medium opacity-90">Your villa, this week</p>
        <p className="text-[64px] font-semibold leading-none tracking-tight">9:41</p>
      </div>
      <ul className="absolute inset-x-[5%] bottom-[7%] space-y-1.5" style={SF}>
        {NOTES.map((n, i) => (
          <li
            key={n.title}
            className="animate-in fade-in slide-in-from-bottom-4 rounded-2xl bg-white/75 p-2.5 shadow-sm backdrop-blur-xl duration-500"
            style={{ animationDelay: `${600 + i * 900}ms`, animationFillMode: "both" }}
          >
            <div className="flex items-start gap-2">
              <img
                src="/brand/malaya-mark.png"
                alt=""
                className="mt-0.5 size-6 shrink-0 rounded-md bg-white object-cover"
              />
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-baseline justify-between gap-1">
                  <p className="truncate text-[11px] font-semibold text-black">{n.title}</p>
                  <p className="shrink-0 text-[9px] text-black/50">{n.when}</p>
                </div>
                <p className="text-[10px] leading-snug text-black/75">{n.body}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <span className="absolute bottom-[1.6%] left-1/2 h-[0.6%] w-[34%] -translate-x-1/2 rounded-full bg-white/80" />
    </IPhone>
  );
}

/** Every villa the team runs today, sliding past — the scale, shown. */
function Villas() {
  const fade = "linear-gradient(to right, transparent, black 6%, black 94%, transparent)";
  return (
    <section className="pt-20 lg:pt-24">
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Already run by the team · {PORTFOLIO.villas} villas
      </p>
      <div
        className="marquee mt-6 overflow-hidden"
        style={{ maskImage: fade, WebkitMaskImage: fade }}
      >
        <ul
          className="marquee-track flex w-max gap-4 py-2"
          style={{ "--marquee-speed": "60s" } as CSSProperties}
        >
          {[...VILLAS, ...VILLAS].map((v, i) => (
            <li
              key={i}
              aria-hidden={i >= VILLAS.length || undefined}
              className="relative h-44 w-64 shrink-0 overflow-hidden rounded-3xl bg-secondary shadow-level-2 sm:h-52 sm:w-80"
            >
              <img
                src={villaPhoto(v.code, v.cover)}
                alt={v.title}
                loading="lazy"
                className="absolute inset-0 size-full object-cover"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="absolute inset-x-4 bottom-3 text-white">
                <span className="block text-sm font-semibold">{v.title}</span>
                <span className="flex items-center gap-1 text-xs text-white/80">
                  <MapPin className="size-3" /> {v.location}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Why({ o }: { o: Offer }) {
  const { before, after } = o.why;
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-20 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pt-28">
      <div>
        <Eyebrow>Why Marj&rsquo;s team</Eyebrow>
        <H2 className="mt-4">{o.why.heading}</H2>
        <p className="mt-5 text-base leading-relaxed text-foreground/85">{o.why.body}</p>
      </div>
      {/* The "now" photo large, the "then" photo inset over its top corner. */}
      <div className="relative pl-10 pt-14 sm:pl-16">
        <figure className="overflow-hidden rounded-3xl bg-secondary shadow-level-3">
          <img
            src={after.src}
            alt={after.label}
            loading="lazy"
            style={after.position ? { objectPosition: after.position } : undefined}
            className="aspect-[4/3] w-full object-cover"
          />
          <figcaption className="px-4 py-3 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{after.label}.</span> {after.caption}
          </figcaption>
        </figure>
        <figure className="absolute left-0 top-0 w-[40%] overflow-hidden rounded-2xl bg-card p-1.5 shadow-level-3">
          <img
            src={before.src}
            alt={before.label}
            loading="lazy"
            style={before.position ? { objectPosition: before.position } : undefined}
            className="aspect-square w-full rounded-xl object-cover"
          />
          <figcaption className="px-1.5 pb-1 pt-2 text-[11px] font-semibold leading-tight">
            {before.label}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function Gets({ o }: { o: Offer }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 pt-24 sm:px-8 lg:grid-cols-[0.8fr_1fr] lg:gap-16 lg:pt-32">
      <div className="hidden lg:block">
        <div className="sticky top-24 overflow-hidden rounded-[2rem] shadow-level-3">
          <img
            src="/villas/pr-hidden-cabin-a/0.webp"
            alt="A Cabin at Malaya Hidden Villas"
            loading="lazy"
            className="aspect-[3/4] w-full object-cover"
          />
        </div>
      </div>
      <div>
        <Eyebrow>What you hand over</Eyebrow>
        <H2 className="mt-4">{o.gets.heading}</H2>
        <p className="mt-4 text-base text-muted-foreground">{o.gets.lead}</p>
        <ol className="mt-10">
          {o.gets.items.map((it, i) => (
            <li
              key={it.title}
              className="grid grid-cols-[3.5rem_1fr] gap-4 border-t border-border py-7 last:border-b"
            >
              <span className="site-display text-4xl leading-none text-primary/70 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="block text-xl font-semibold leading-snug">{it.title}</span>
                <span className="mt-2 block text-[15px] leading-relaxed text-muted-foreground">
                  {it.body}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Proof({ facebook }: { facebook: string }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-8 lg:pt-32">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] bg-white/10 shadow-level-3 lg:grid-cols-4">
        {proofWith(facebook).map((p) => (
          <div key={p.small} className="bg-[#151314] p-6 sm:p-8">
            <dt className="site-display text-4xl leading-none text-white tabular-nums sm:text-5xl">
              {p.big}
            </dt>
            <dd className="mt-2 text-xs leading-snug text-white/60 sm:text-sm">{p.small}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Fit({ o }: { o: Offer }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-8 lg:pt-32">
      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-[2rem] bg-card p-7 shadow-level-2 sm:p-9">
          <Eyebrow>Is your property a fit?</Eyebrow>
          <ul className="mt-6 space-y-4">
            {o.fit.yes.map((it) => (
              <li key={it} className="flex items-start gap-3 text-lg leading-snug">
                <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-success text-white">
                  <Check className="size-3.5" />
                </span>
                {it}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[2rem] border border-dashed border-border p-7 sm:p-9">
          <Eyebrow>Probably not, if</Eyebrow>
          <ul className="mt-6 space-y-4">
            {o.fit.no.map((it) => (
              <li
                key={it}
                className="flex items-start gap-3 text-[15px] leading-snug text-muted-foreground"
              >
                <X className="mt-0.5 size-4 shrink-0" />
                {it}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <blockquote className="mx-auto mt-16 max-w-3xl border-l-4 border-primary pl-6 sm:pl-10">
        <p className="site-display text-3xl leading-tight text-brand-heading sm:text-4xl">
          {o.catchLine.heading}
        </p>
        <p className="mt-4 text-base leading-relaxed text-foreground/80">{o.catchLine.body}</p>
      </blockquote>
    </section>
  );
}

function Steps({ o }: { o: Offer }) {
  return (
    <section className="mt-24 bg-secondary/60 py-16 lg:mt-32 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>From form to keys</Eyebrow>
            <H2 className="mt-4">What happens next</H2>
          </div>
          <Apply o={o} />
        </div>
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {o.steps.map((s, i) => (
            <li
              key={s.title}
              className="relative overflow-hidden rounded-3xl bg-card p-6 shadow-level-1"
            >
              <span
                aria-hidden
                className="site-display pointer-events-none absolute -bottom-6 right-3 text-[6.5rem] leading-none text-secondary/80"
              >
                {i + 1}
              </span>
              <span className="relative block text-xs font-semibold text-primary">
                Step {i + 1}
              </span>
              <span className="relative mt-3 block text-lg font-semibold leading-snug">
                {s.title}
              </span>
              <span className="relative mt-2 block text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Faq({ o }: { o: Offer }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 pt-24 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:pt-32">
      <div>
        <Eyebrow>Questions</Eyebrow>
        <H2 className="mt-4">Owners ask</H2>
        <p className="mt-4 text-[15px] text-muted-foreground">
          Something else on your mind? Ask it in the form — the team answers in your Inbox.
        </p>
      </div>
      <FaqAccordion o={o} />
    </section>
  );
}

function Closing({ o }: { o: Offer }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-8 lg:pt-32">
      <div className="grid overflow-hidden rounded-[2rem] bg-card shadow-level-3 md:grid-cols-2">
        <div className="p-8 sm:p-12">
          <H2>{o.closing.heading}</H2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{o.closing.body}</p>
          <Apply o={o} className="mt-8" />
        </div>
        <img
          src="/brand/about-hero.webp"
          alt=""
          loading="lazy"
          className="h-64 w-full object-cover md:h-full"
        />
      </div>
      <OtherOffers o={o} className="mt-10" />
    </section>
  );
}
