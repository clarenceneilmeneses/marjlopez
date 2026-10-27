/**
 * Invest — money, so it reads like a prospectus: sober, ruled, the risk said
 * before the pitch.
 *
 *   Hero      split down the middle: a dark panel with the headline and an
 *             "at a glance" table, the drone shot filling the other half
 *   Proof     the numbers as a ruled table row
 *   Story     the track record told by scrolling: the photo pinned, the
 *             build moving from bare lot to Airbnb-ready, then the villa
 *             bought for next, and a dashed "Next: yours" to finish
 *   Notice    the catch, boxed, BEFORE the ways in
 *   Gets      the ways to come in as tall columns, each its own button
 *   Fit       two short columns
 *   Steps     a ruled process down the side of a tall photo
 *   FAQ       accordion, centred
 *   Closing   one plain card
 */
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Plus, ShieldCheck, X } from "@/components/icons";
import { useEffect, useRef, useState } from "react";

import { proofWith, type Offer } from "@/lib/offers";
import type { LandingContent } from "@/lib/site-content";
import { cn } from "@/lib/utils";

import { Apply, Eyebrow, FaqAccordion, H2, OfferBadge, OtherOffers } from "./shared";
import type { LayoutProps } from "./shared";

export function InvestLayout({ o, landing }: LayoutProps) {
  const facebook = landing.numbers.facebook;
  return (
    <>
      <Hero o={o} steps={landing.built.steps} />
      <Proof facebook={facebook} />
      <BuildStory o={o} steps={landing.built.steps} />
      <Notice o={o} />
      <Gets o={o} />
      <Fit o={o} />
      <Steps o={o} />
      <Faq o={o} />
      <Closing o={o} />
    </>
  );
}

function Hero({ o, steps }: { o: Offer; steps: LandingContent["built"]["steps"] }) {
  const next = o.why.after;
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
        <div className="relative order-1 min-h-[360px] lg:order-2">
          <img
            src={o.hero.src}
            alt="A Malaya villa from above"
            style={o.hero.position ? { objectPosition: o.hero.position } : undefined}
            className="absolute inset-0 size-full object-cover"
            loading="eager"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
          {/* Two real projects pinned to the photo: the villa bought for next,
              and the build that went from bare lot to booked. */}
          <div className="absolute left-4 top-4 flex max-w-[78%] items-center gap-3 rounded-2xl bg-white/85 p-2 pr-4 shadow-level-3 backdrop-blur-xl sm:left-6 sm:top-6">
            <img
              src={next.src}
              alt=""
              style={next.position ? { objectPosition: next.position } : undefined}
              className="size-12 shrink-0 rounded-xl object-cover"
            />
            <span className="min-w-0 leading-tight">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-success">
                <span className="size-1.5 rounded-full bg-success" /> {next.label}
              </span>
              <span className="mt-0.5 block truncate text-xs text-neutral-700">{next.caption}</span>
            </span>
          </div>
          <div className="absolute bottom-4 right-4 w-[min(300px,calc(100%-2rem))] rounded-2xl bg-white/85 p-3 shadow-level-3 backdrop-blur-xl sm:bottom-6 sm:right-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">
              Built from scratch · Lian, Batangas
            </p>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {steps.slice(0, 4).map((st) => (
                <img
                  key={st.photo}
                  src={st.photo}
                  alt={st.step}
                  title={st.step}
                  className="aspect-square w-full rounded-lg object-cover"
                />
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-neutral-700">
              <span>{steps[0]?.step}</span>
              <span className="h-px flex-1 bg-neutral-300 mx-2" />
              <span>{steps[steps.length - 1]?.step}</span>
            </div>
          </div>
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

/**
 * The track record as a story told by scrolling: on a laptop the photo stays
 * pinned while the page scrolls and the build moves on — bare lot, shell,
 * finishing, Airbnb-ready — then the villa already bought for next. A rail on
 * the left shows where you are. On a phone, the same frames swipe sideways.
 * The build photos are the landing's (Admin → Website → The build).
 */
function BuildStory({ o, steps }: { o: Offer; steps: LandingContent["built"]["steps"] }) {
  const next = o.why.after;
  const frames = [
    ...steps.map((s) => ({
      src: s.photo,
      label: s.step,
      caption: s.note,
      tag: "Lian, Batangas",
      position: undefined as string | undefined,
    })),
    {
      src: next.src,
      label: next.label,
      caption: next.caption,
      tag: "Next",
      position: next.position,
    },
  ];
  const track = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = track.current;
      if (!el || !el.offsetParent) return;
      const r = el.getBoundingClientRect();
      const run = r.height - window.innerHeight;
      const p = run > 0 ? Math.min(1, Math.max(0, -r.top / run)) : 0;
      setAt(Math.min(frames.length - 1, Math.floor(p * frames.length)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [frames.length]);

  return (
    <section className="pt-20 lg:pt-28">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <Eyebrow>Track record</Eyebrow>
          <H2 className="mt-4">{o.why.heading}</H2>
        </div>
        <p className="text-base leading-relaxed text-foreground/85 lg:pt-10">{o.why.body}</p>
      </div>

      {/* Laptop: pinned photo, the page scrolls the build along. */}
      <div
        ref={track}
        className="relative mt-6 hidden lg:block"
        style={{ height: `${frames.length * 65}vh` }}
      >
        <div className="sticky top-16 mx-auto grid h-[calc(100vh-5rem)] max-w-6xl grid-cols-[0.75fr_1.25fr] items-center gap-12 px-8">
          <ol className="relative space-y-1 border-l-2 border-border">
            {frames.map((f, i) => {
              const on = i === at;
              const done = i < at;
              return (
                <li key={f.src + i} className="relative pl-7">
                  <span
                    className={cn(
                      "absolute -left-[9px] top-3 size-4 rounded-full border-2 transition-colors duration-500",
                      on
                        ? "border-primary bg-primary"
                        : done
                          ? "border-primary bg-background"
                          : "border-border bg-background",
                    )}
                  />
                  <p
                    className={cn(
                      "py-2 transition-all duration-500",
                      on ? "text-foreground" : "text-muted-foreground/70",
                    )}
                  >
                    <span className="block text-[11px] font-bold uppercase tracking-[0.12em]">
                      {f.tag === "Next" ? "Next" : `Stage ${i + 1}`}
                    </span>
                    <span className={cn("block font-semibold", on ? "text-2xl" : "text-base")}>
                      {f.label}
                    </span>
                    {on && (
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                        {f.caption}
                      </span>
                    )}
                  </p>
                </li>
              );
            })}
          </ol>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-secondary shadow-level-3">
            {frames.map((f, i) => (
              <img
                key={f.src + i}
                src={f.src}
                alt={f.label}
                loading="lazy"
                style={f.position ? { objectPosition: f.position } : undefined}
                className={cn(
                  "absolute inset-0 size-full object-cover transition-all duration-700",
                  i === at ? "scale-100 opacity-100" : "scale-105 opacity-0",
                )}
              />
            ))}
            <span className="absolute left-4 top-4 rounded-full bg-card/95 px-3 py-1.5 text-xs font-semibold shadow-level-1">
              {frames[at]!.tag} · {frames[at]!.label}
            </span>
            <span className="absolute inset-x-0 bottom-0 h-1.5 bg-black/20">
              <span
                className="block h-full bg-primary transition-all duration-700"
                style={{ width: `${((at + 1) / frames.length) * 100}%` }}
              />
            </span>
          </div>
        </div>
      </div>

      {/* Phone: the same frames, swiped. */}
      <ol className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 no-scrollbar sm:px-8 lg:hidden">
        {frames.map((f, i) => (
          <li
            key={f.src + i}
            className="w-[82%] shrink-0 snap-center overflow-hidden rounded-3xl bg-card shadow-level-2 sm:w-[60%]"
          >
            <img
              src={f.src}
              alt={f.label}
              loading="lazy"
              style={f.position ? { objectPosition: f.position } : undefined}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                {f.tag === "Next" ? "Next" : `Stage ${i + 1}`} · {f.label}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{f.caption}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-8">
        <Link
          to="/inquire"
          search={{ type: o.type, step: 2 }}
          className="group flex items-center justify-between gap-4 rounded-3xl border-2 border-dashed border-primary/40 p-6 transition hover:border-primary hover:bg-primary/5 sm:p-8"
        >
          <span className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <Plus className="size-5" />
            </span>
            <span>
              <span className="site-display block text-3xl text-brand-heading">Next: yours</span>
              <span className="block text-sm text-muted-foreground">
                Tell Marj what you&rsquo;re thinking
              </span>
            </span>
          </span>
          <ArrowRight className="size-5 shrink-0 text-primary transition group-hover:translate-x-1" />
        </Link>
      </div>
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
