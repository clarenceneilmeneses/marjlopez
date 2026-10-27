/**
 * The seminar — an event with Marj, so it reads like one: light, personal,
 * editorial, his face up front.
 *
 *   Hero      no dark frame: a cream page, the headline big on the left, his
 *             portrait in an arch on the right and a ticket for the next batch
 *   Proof     a quiet row of pills under the hero
 *   Band      the day's topics as one big moving line, outlined and filled
 *   Watch     his PTV feature, playable on the page
 *   Why       his story as a pull quote, two pinned photos (then / now)
 *   Gets      the day as a printed programme beside a photo of a set room
 *   Fit       two plain columns, the catch on a sand note
 *   Steps     four tickets with torn edges
 *   FAQ       every answer open, two columns — nothing to click
 *   Closing   a dark band with his portrait
 */
import { Check, Play, Star, X } from "@/components/icons";
import { useState, type CSSProperties } from "react";

import { proofWith, type Offer } from "@/lib/offers";
import { cn } from "@/lib/utils";

import { Apply, Eyebrow, H2, OfferBadge, OtherOffers } from "./shared";
import type { LayoutProps } from "./shared";

export function SeminarLayout({ o, landing }: LayoutProps) {
  const facebook = landing.numbers.facebook;
  return (
    <>
      <Hero o={o} facebook={facebook} />
      <TopicBand o={o} />
      <Why o={o} />
      <Watch />
      <Gets o={o} />
      <Fit o={o} />
      <Steps o={o} />
      <Faq o={o} />
      <Closing o={o} />
    </>
  );
}

function Hero({ o, facebook }: { o: Offer; facebook: string }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-8 lg:pt-10">
      <div className="grid items-center gap-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div className="order-2 lg:order-1">
          <OfferBadge o={o} />
          <h1 className="site-display mt-6 text-[2.9rem] leading-[0.92] text-brand-heading sm:text-6xl xl:text-7xl">
            {o.headline[0]}
            <br />
            <span className="text-primary">{o.headline[1]}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/80 sm:text-lg">
            {o.sub}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Apply o={o} />
            <span className="text-xs text-muted-foreground">
              Registering is free · no commitment
            </span>
          </div>
          {/* The proof, as small pills — this page is about him, not numbers. */}
          <ul className="mt-10 flex flex-wrap gap-2">
            {proofWith(facebook).map((p) => (
              <li
                key={p.small}
                className="flex items-center gap-2 rounded-full bg-card px-3.5 py-2 text-sm shadow-level-1"
              >
                <span className="font-semibold tabular-nums">{p.big}</span>
                <span className="text-xs text-muted-foreground">{p.small}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-[420px] lg:order-2">
          {/* His portrait in an arch, the studio wall's own near-black. */}
          <div className="overflow-hidden rounded-t-full rounded-b-[2rem] bg-[#151314] shadow-level-3">
            <img
              src={o.hero.src}
              alt="Marj Lopez"
              style={o.hero.position ? { objectPosition: o.hero.position } : undefined}
              className="aspect-[4/5] w-full object-cover"
              loading="eager"
            />
          </div>
          {/* The ticket: the batch's facts, with a perforated edge. */}
          <div className="absolute -bottom-8 -left-3 w-[78%] rounded-2xl bg-card shadow-level-3 sm:-left-10">
            <div className="flex items-center justify-between gap-2 px-5 pt-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                Next batch
              </span>
              <Star className="size-4 fill-warning text-warning" />
            </div>
            <ul className="space-y-1.5 px-5 pb-4 pt-2">
              {o.facts.map((f) => (
                <li key={f} className="text-sm font-semibold leading-snug">
                  {f}
                </li>
              ))}
            </ul>
            <div className="relative border-t-2 border-dashed border-border px-5 py-3 text-xs text-muted-foreground">
              <span className="absolute -left-2.5 -top-2.5 size-5 rounded-full bg-background" />
              <span className="absolute -right-2.5 -top-2.5 size-5 rounded-full bg-background" />
              Date, venue and fee are sent to your Inbox
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The day's topics as one big moving line on a brown band, outlined and
 * filled in turn — the "seminar poster" moment, read off the programme.
 */
function TopicBand({ o }: { o: Offer }) {
  const words = o.gets.items.map((it) => it.title);
  const row = [...words, ...words];
  return (
    <section className="mt-24 overflow-hidden bg-[#3a2416] py-7 sm:py-9 lg:mt-32">
      <ul
        className="marquee-track flex w-max items-center gap-8 sm:gap-12"
        style={{ "--marquee-speed": "40s" } as CSSProperties}
      >
        {row.map((w, i) => (
          <li
            key={i}
            aria-hidden={i >= words.length || undefined}
            className="flex shrink-0 items-center gap-8 sm:gap-12"
          >
            <span
              className="site-display whitespace-nowrap text-5xl leading-none sm:text-7xl"
              style={
                i % 2
                  ? { color: "transparent", WebkitTextStroke: "1.5px rgba(255,255,255,0.75)" }
                  : { color: "#fff" }
              }
            >
              {w}
            </span>
            <Star className="size-6 shrink-0 fill-[#e9b872] text-[#e9b872] sm:size-8" />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Marj on national TV, playable right here — tap and it loads the video. */
const PTV = {
  id: "Uq1KitcVAwQ",
  title: "PTV · Rise and Shine Pilipinas",
  meta: "Father's Day Special",
  image: "/brand/ptv-feature.webp",
};

function Watch() {
  const [playing, setPlaying] = useState(false);
  return (
    <section className="mx-auto max-w-5xl px-4 pt-28 sm:px-8 lg:pt-36">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Before you meet him</Eyebrow>
          <H2 className="mt-4">Watch Marj on PTV</H2>
        </div>
        <p className="text-sm text-muted-foreground">
          {PTV.title} · {PTV.meta}
        </p>
      </div>
      <div className="relative mt-8 aspect-video overflow-hidden rounded-[2rem] bg-black shadow-level-3">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${PTV.id}?autoplay=1&rel=0`}
            title={PTV.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play: ${PTV.title}`}
            className="group absolute inset-0"
          >
            <img src={PTV.image} alt="" loading="lazy" className="size-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
            <span className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#FF0000] shadow-level-3 transition group-hover:scale-110 sm:size-24">
              <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
              <Play className="relative size-8 fill-current sm:size-10" />
            </span>
            <span className="absolute bottom-5 left-5 text-left text-white sm:bottom-7 sm:left-7">
              <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
                As seen on TV
              </span>
              <span className="mt-1 block text-lg font-semibold sm:text-xl">{PTV.title}</span>
            </span>
          </button>
        )}
      </div>
    </section>
  );
}

function Why({ o }: { o: Offer }) {
  const shots = [o.why.before, o.why.after];
  return (
    <section className="mx-auto max-w-5xl px-4 pt-24 text-center sm:px-8 lg:pt-28">
      <Eyebrow>The short version of his story</Eyebrow>
      <H2 className="mx-auto mt-4 max-w-3xl">{o.why.heading}</H2>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-foreground/85">
        {o.why.body}
      </p>
      {/* Two prints pinned to the page, a little off-square. */}
      <div className="mt-12 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-6">
        {shots.map((s, i) => (
          <figure
            key={s.src}
            className={cn(
              "w-full max-w-[340px] bg-white p-3 pb-4 shadow-level-3 transition hover:rotate-0",
              i === 0 ? "-rotate-2" : "rotate-2 sm:mt-10",
            )}
          >
            <img
              src={s.src}
              alt={s.label}
              loading="lazy"
              style={s.position ? { objectPosition: s.position } : undefined}
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="mt-3 text-left">
              <span className="block font-display text-lg text-[#2b1a10]">
                {i === 0 ? "Then" : "Now"} — {s.label}
              </span>
              <span className="block text-xs text-neutral-500">{s.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Gets({ o }: { o: Offer }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-28 sm:px-8 lg:pt-36">
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_0.85fr]">
        {/* The programme: a printed card, parts down the left margin. */}
        <div className="rounded-[2rem] bg-card p-7 shadow-level-2 sm:p-10">
          <Eyebrow>The programme</Eyebrow>
          <H2 className="mt-4">{o.gets.heading}</H2>
          <p className="mt-3 text-[15px] text-muted-foreground">{o.gets.lead}</p>
          <ol className="mt-8 divide-y divide-dashed divide-border">
            {o.gets.items.map((it, i) => (
              <li key={it.title} className="grid gap-1 py-5 sm:grid-cols-[6rem_1fr] sm:gap-6">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary sm:pt-1">
                  Part {i + 1}
                </span>
                <span>
                  <span className="block text-lg font-semibold leading-snug">{it.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    {it.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-4 lg:sticky lg:top-24">
          <img
            src="/malaya/lanai-set-for-dinner.webp"
            alt="A Malaya lanai set for a gathering"
            loading="lazy"
            className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-level-3"
          />
          <div className="rounded-[2rem] bg-[#151314] p-7 text-white shadow-level-3">
            <p className="site-display text-3xl leading-tight">Bring your numbers.</p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              The day is built around the questions people bring — your area, your budget, your
              property.
            </p>
            <Apply o={o} tone="light" className="mt-5" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Fit({ o }: { o: Offer }) {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-28 sm:px-8 lg:pt-36">
      <div className="text-center">
        <Eyebrow>Before you register</Eyebrow>
        <H2 className="mt-4">Is this for you?</H2>
      </div>
      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        <div>
          <p className="font-display text-2xl text-brand-heading">Yes, if…</p>
          <ul className="mt-4 space-y-3">
            {o.fit.yes.map((it) => (
              <li key={it} className="flex items-start gap-3 text-[15px] leading-snug">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                {it}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-display text-2xl text-muted-foreground">Not yet, if…</p>
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
      </div>
      <div className="mx-auto mt-12 max-w-3xl -rotate-1 rounded-2xl bg-[#f3e6cf] p-7 text-[#3b2416] shadow-level-2 sm:p-9 dark:bg-[#3b2c1c] dark:text-[#f3e6cf]">
        <p className="site-display text-3xl leading-tight">{o.catchLine.heading}</p>
        <p className="mt-3 text-[15px] leading-relaxed opacity-80">{o.catchLine.body}</p>
      </div>
    </section>
  );
}

function Steps({ o }: { o: Offer }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-28 sm:px-8 lg:pt-36">
      <div className="text-center">
        <Eyebrow>After you register</Eyebrow>
        <H2 className="mt-4">Four steps to your seat</H2>
      </div>
      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {o.steps.map((s, i) => (
          <li key={s.title} className="relative flex rounded-2xl bg-card shadow-level-1">
            <span className="grid w-14 shrink-0 place-items-center border-r-2 border-dashed border-border">
              <span className="site-display text-3xl text-primary">{i + 1}</span>
            </span>
            <span className="p-5">
              <span className="block font-semibold leading-snug">{s.title}</span>
              <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Faq({ o }: { o: Offer }) {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-28 sm:px-8 lg:pt-36">
      <H2 className="text-center">Asked a lot</H2>
      <dl className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">
        {o.faq.map((f) => (
          <div key={f.q} className="border-t border-border pt-5">
            <dt className="text-[15px] font-semibold">{f.q}</dt>
            <dd className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Closing({ o }: { o: Offer }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-28 sm:px-8 lg:pt-36">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#151314] shadow-level-3">
        <img
          src="/brand/marj.webp"
          alt=""
          loading="lazy"
          className="absolute inset-y-0 right-0 hidden h-full w-auto object-cover opacity-90 md:block"
        />
        <div className="absolute inset-y-0 right-0 hidden w-[70%] bg-gradient-to-r from-[#151314] from-35% to-transparent md:block" />
        <div className="relative p-8 sm:p-12 md:max-w-[60%] lg:p-14">
          <h2 className="site-display text-4xl leading-none text-white sm:text-5xl">
            {o.closing.heading}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/80">{o.closing.body}</p>
          <Apply o={o} tone="light" className="mt-7" />
        </div>
      </div>
      <OtherOffers o={o} className="mt-10" />
    </section>
  );
}
