/**
 * Invest — money, so it reads like a prospectus: sober, ruled, the risk said
 * before the pitch.
 *
 *   Hero      split down the middle: a dark panel with the headline and an
 *             "at a glance" table, the drone shot filling the other half
 *   Proof     the numbers as a ruled table row
 *   Record    the story beside a three-step project strip — bare lot, done,
 *             and an empty frame marked "yours"
 *   Notice    the catch, boxed, BEFORE the ways in
 *   Gets      the ways to come in as tall columns, each its own button
 *   Fit       two short columns
 *   Steps     a ruled process down the side of a tall photo
 *   FAQ       accordion, centred
 *   Closing   one plain card
 */
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Plus, ShieldCheck, X } from "@/components/icons";

import { proofWith, type Offer } from "@/lib/offers";

import { Apply, Eyebrow, FaqAccordion, H2, OfferBadge, OtherOffers } from "./shared";

export function InvestLayout({ o, facebook }: { o: Offer; facebook: string }) {
  return (
    <>
      <Hero o={o} />
      <Proof facebook={facebook} />
      <Record o={o} />
      <Notice o={o} />
      <Gets o={o} />
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
      <div className="mx-auto grid max-w-[1400px] overflow-hidden rounded-[2rem] bg-[#151314] shadow-level-3 lg:min-h-[min(80vh,700px)] lg:grid-cols-2">
        <div className="relative order-2 flex flex-col justify-center p-7 sm:p-10 lg:order-1 lg:p-16">
          <OfferBadge o={o} dark />
          <h1 className="site-display mt-6 text-[2.6rem] leading-[0.95] text-white sm:text-6xl">
            {o.headline[0]}
            <br />
            {o.headline[1]}
          </h1>
          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/75 sm:text-base">
            {o.sub}
          </p>
          {/* At a glance — the facts as a ruled table, the way a deck states terms. */}
          <dl className="mt-8 max-w-lg divide-y divide-white/10 border-y border-white/10">
            {o.facts.map((f, i) => (
              <div key={f} className="flex items-center justify-between gap-4 py-3 text-sm">
                <dt className="text-white/50 tabular-nums">{String(i + 1).padStart(2, "0")}</dt>
                <dd className="text-right font-medium text-white">{f}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Apply o={o} tone="light" />
            <span className="text-xs text-white/50">A range is enough · nothing is committed</span>
          </div>
        </div>
        <div className="relative order-1 min-h-[300px] lg:order-2">
          <img
            src={o.hero.src}
            alt="A Malaya villa from above"
            style={o.hero.position ? { objectPosition: o.hero.position } : undefined}
            className="absolute inset-0 size-full object-cover"
            loading="eager"
          />
          <span className="absolute bottom-4 right-4 rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
            A villa Malaya built and runs
          </span>
        </div>
      </div>
    </section>
  );
}

function Proof({ facebook }: { facebook: string }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-8">
      <dl className="grid grid-cols-2 lg:grid-cols-4">
        {proofWith(facebook).map((p) => (
          <div key={p.small} className="border-t-2 border-foreground/80 pr-4 pt-4 pb-6">
            <dt className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
              {p.big}
            </dt>
            <dd className="mt-1 text-xs leading-snug text-muted-foreground">{p.small}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Record({ o }: { o: Offer }) {
  const shots = [o.why.before, o.why.after];
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-8 lg:pt-28">
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <Eyebrow>Track record</Eyebrow>
          <H2 className="mt-4">{o.why.heading}</H2>
        </div>
        <p className="text-base leading-relaxed text-foreground/85 lg:pt-10">{o.why.body}</p>
      </div>
      <ol className="mt-12 grid gap-4 md:grid-cols-3">
        {shots.map((s, i) => (
          <li key={s.src} className="overflow-hidden rounded-3xl bg-card shadow-level-2">
            <img
              src={s.src}
              alt={s.label}
              loading="lazy"
              style={s.position ? { objectPosition: s.position } : undefined}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                Stage {i + 1} · {s.label}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.caption}</p>
            </div>
          </li>
        ))}
        <li>
          <Link
            to="/inquire"
            search={{ type: o.type, step: 2 }}
            className="group grid h-full min-h-[260px] place-items-center rounded-3xl border-2 border-dashed border-primary/40 p-6 text-center transition hover:border-primary hover:bg-primary/5"
          >
            <span>
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Plus className="size-5" />
              </span>
              <span className="site-display mt-4 block text-3xl text-brand-heading">
                Next: yours
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                Tell Marj what you&rsquo;re thinking
              </span>
            </span>
          </Link>
        </li>
      </ol>
    </section>
  );
}

function Notice({ o }: { o: Offer }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-8 lg:pt-28">
      <div className="grid gap-5 rounded-[2rem] border-2 border-foreground/80 p-7 sm:grid-cols-[auto_1fr] sm:p-10">
        <span className="grid size-12 place-items-center rounded-full bg-foreground text-background">
          <ShieldCheck className="size-6" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Read this first
          </p>
          <p className="site-display mt-2 text-3xl leading-tight text-brand-heading sm:text-4xl">
            {o.catchLine.heading}
          </p>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-foreground/80">
            {o.catchLine.body}
          </p>
        </div>
      </div>
    </section>
  );
}

function Gets({ o }: { o: Offer }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-8 lg:pt-28">
      <div className="max-w-2xl">
        <Eyebrow>Ways to come in</Eyebrow>
        <H2 className="mt-4">{o.gets.heading}</H2>
        <p className="mt-4 text-base text-muted-foreground">{o.gets.lead}</p>
      </div>
      <div className="mt-10 grid gap-px overflow-hidden rounded-[2rem] bg-border shadow-level-2 md:grid-cols-3">
        {o.gets.items.map((it, i) => (
          <div key={it.title} className="flex flex-col bg-card p-7 sm:p-8">
            <span className="text-5xl font-semibold tracking-tight text-primary/25 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-6 text-xl font-semibold leading-snug">{it.title}</h3>
            <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted-foreground">
              {it.body}
            </p>
            <Link
              to="/inquire"
              search={{ type: o.type, step: 2 }}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Talk about this <ArrowRight className="size-4" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function Fit({ o }: { o: Offer }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-4 px-4 pt-20 sm:px-8 md:grid-cols-2 lg:pt-28">
      <div className="rounded-3xl bg-card p-7 shadow-level-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Suits you if
        </p>
        <ul className="mt-4 space-y-3">
          {o.fit.yes.map((it) => (
            <li key={it} className="flex items-start gap-3 text-[15px] leading-snug">
              <Check className="mt-0.5 size-4 shrink-0 text-success" />
              {it}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-3xl bg-card p-7 shadow-level-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Not for you if
        </p>
        <ul className="mt-4 space-y-3">
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
    </section>
  );
}

function Steps({ o }: { o: Offer }) {
  return (
    <section className="mx-auto grid max-w-6xl items-start gap-10 px-4 pt-20 sm:px-8 lg:grid-cols-[1fr_0.75fr] lg:gap-16 lg:pt-28">
      <div>
        <Eyebrow>The process</Eyebrow>
        <H2 className="mt-4">From first call to signed</H2>
        <ol className="relative mt-10 space-y-8 border-l-2 border-border pl-8">
          {o.steps.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="absolute -left-[3.05rem] grid size-9 place-items-center rounded-full bg-foreground text-sm font-semibold text-background tabular-nums">
                {i + 1}
              </span>
              <p className="text-lg font-semibold leading-snug">{s.title}</p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
        <Apply o={o} className="mt-10" />
      </div>
      <img
        src="/villas/pr-saglit/0.webp"
        alt="Saglit, a Malaya villa in Tagaytay"
        loading="lazy"
        className="hidden aspect-[3/4] w-full rounded-[2rem] object-cover shadow-level-3 lg:sticky lg:top-24 lg:block"
      />
    </section>
  );
}

function Faq({ o }: { o: Offer }) {
  return (
    <section className="mx-auto max-w-3xl px-4 pt-20 sm:px-8 lg:pt-28">
      <H2 className="text-center">Investors ask</H2>
      <FaqAccordion o={o} className="mt-8" />
    </section>
  );
}

function Closing({ o }: { o: Offer }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-8 lg:pt-28">
      <div className="rounded-[2rem] bg-card p-8 text-center shadow-level-2 sm:p-14">
        <H2 className="mx-auto max-w-2xl">{o.closing.heading}</H2>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {o.closing.body}
        </p>
        <Apply o={o} className="mt-8" />
      </div>
      <OtherOffers o={o} className="mt-10" />
    </section>
  );
}
