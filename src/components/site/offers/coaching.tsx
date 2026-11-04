/**
 * 1-on-1 Coaching (the seminar until 2026-11-03, when the boss made it
 * mentorship at ₱10k): time with Marj, so it reads like a magazine profile
 * of him, not a sales page (Clarence, 2026-11-04: "make this like a clean
 * magazine"). The kit is components/site/mag.tsx.
 *
 *   Cover    a masthead line, the headline in the serif, his portrait, the
 *            session's details and fee, then the proof as a ruled line
 *   No. 01   his story: the quote pulled out, a drop cap, then and now
 *   No. 02   watch: Marj on what coaching covers (once a link is set), and
 *            his PTV feature, both playable on the page
 *   No. 03   guests, in their own words, set as printed quotes
 *   No. 04   the programme: four numbered parts, the fee beside them
 *   No. 05   who it's for and who it isn't, the catch as a pull quote
 *   No. 06   what happens after you apply
 *   No. 07   questions, every answer open
 *   Closing  the last word, and the other three offers as a contents list
 */
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Play } from "@/components/icons";
import { useState } from "react";

import { PlatformLogo } from "@/components/site/logos";
import { Figure, Headline, Kicker, magButton, PullQuote, SectionHead } from "@/components/site/mag";
import { GUEST_REVIEWS, REVIEW_SCORES } from "@/lib/brand";
import { OFFER_ORDER, OFFERS, offerPath, proofWith, videoEmbed, type Offer } from "@/lib/offers";
import { cn } from "@/lib/utils";

import type { LayoutProps } from "./shared";

const PAGE = "mx-auto max-w-[1320px] px-4 sm:px-8";
const SECTION = cn(PAGE, "pt-24 lg:pt-36");

export function CoachingLayout({ o, landing }: LayoutProps) {
  return (
    <>
      <Cover o={o} facebook={landing.numbers.facebook} />
      <Story o={o} />
      <Watch o={o} />
      <Guests />
      <Programme o={o} />
      <Fit o={o} />
      <Steps o={o} />
      <Questions o={o} />
      <Closing o={o} />
    </>
  );
}

/** The one button: opens the form on this offer's questions. */
function ApplyLink({
  o,
  tone = "ink",
  className,
}: {
  o: Offer;
  tone?: "ink" | "line";
  className?: string;
}) {
  return (
    <Link
      to="/inquire"
      search={{ type: o.type, step: 2 }}
      className={cn(magButton(tone), className)}
    >
      {o.cta} <ArrowRight className="size-4 transition group-hover:translate-x-1" />
    </Link>
  );
}

// ----------------------------------------------------------------- cover

function Cover({ o, facebook }: { o: Offer; facebook: string }) {
  const priced = o.price.show && o.price.amount;
  return (
    <section className={cn(PAGE, "pt-2 sm:pt-4")}>
      <div className="mag-kicker flex items-center justify-between gap-4 border-y border-foreground py-2.5 text-foreground">
        <span className="truncate">
          The {o.pillar} issue <span className="mx-1.5 text-foreground/30">/</span> {o.name}
        </span>
        <span className="hidden shrink-0 md:inline">Applying is free · no commitment</span>
      </div>

      <div className="grid gap-10 pt-8 lg:grid-cols-12 lg:gap-10 lg:pt-12">
        <div className="flex flex-col lg:col-span-7">
          <Headline
            as="h1"
            italic={o.headline[1]}
            className="text-[3.1rem] leading-[0.94] sm:text-7xl lg:text-[4.9rem] xl:text-[5.5rem]"
          >
            {o.headline[0]}
          </Headline>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-foreground/80">{o.sub}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ApplyLink o={o} />
            <span className="text-sm text-muted-foreground md:hidden">
              Applying is free · no commitment
            </span>
          </div>

          {/* The session at a glance: its details, and the fee. */}
          <div className="mt-12 grid border-t border-foreground sm:grid-cols-[minmax(0,1fr)_14rem] lg:mt-auto">
            <ul className="divide-y divide-border sm:border-r sm:border-border sm:pr-6">
              {o.facts.map((f) => (
                <li key={f} className="py-3 text-[15px] text-foreground">
                  {f}
                </li>
              ))}
            </ul>
            <div className="border-t border-border pt-4 sm:border-t-0 sm:pl-6 sm:pt-3">
              <Kicker className="text-[10px]">The fee</Kicker>
              {priced ? (
                <>
                  <p className="mag-figure mt-1 text-5xl leading-none text-foreground">
                    {o.price.amount}
                  </p>
                  {o.price.note && (
                    <p className="mt-2 text-xs leading-snug text-muted-foreground">
                      {o.price.note}
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Sent to your Inbox</p>
              )}
            </div>
          </div>
        </div>

        <Figure
          className="lg:col-span-5"
          src={o.hero.src}
          alt="Marj Lopez"
          position={o.hero.position}
          eager
          imgClassName="aspect-[4/5] bg-[#151314]"
          caption="Your mentor: Marj Lopez, founder of Malaya Villas."
          credit="1-on-1"
        />
      </div>

      {/* The proof, as one ruled line of figures. */}
      <dl className="mt-12 grid grid-cols-2 gap-px border-y border-foreground bg-border lg:grid-cols-4">
        {proofWith(facebook).map((p, i) => (
          <div
            key={p.small}
            className={cn("bg-background py-5 pr-4", i % 2 === 1 && "pl-4", i > 0 && "lg:pl-5")}
          >
            <dt className="mag-figure text-4xl leading-none text-foreground sm:text-[2.6rem]">
              {p.big}
            </dt>
            <dd className="mt-2 text-xs leading-snug text-muted-foreground">{p.small}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ----------------------------------------------------------------- story

/** "“A quote.” The rest" → the quote for the pull quote, and the rest. */
function splitQuote(text: string): { quote: string | null; rest: string } {
  const m = text.match(/^\s*[“"]([^”"]+)[”"]\s*([\s\S]*)$/);
  return m ? { quote: m[1]!.trim(), rest: m[2]!.trim() } : { quote: null, rest: text };
}

function Story({ o }: { o: Offer }) {
  const { quote, rest } = splitQuote(o.why.body);
  const shots = [
    { ...o.why.before, when: "Then" },
    { ...o.why.after, when: "Now" },
  ];
  return (
    <section className={SECTION}>
      <SectionHead no="01" label="The short version of his story" title={o.why.heading} />
      <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          {quote && <PullQuote by="Marj Lopez">“{quote}”</PullQuote>}
          <p
            className={cn(
              "mag-dropcap text-lg leading-relaxed text-foreground/85",
              quote && "mt-10",
            )}
          >
            {rest}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
          {shots.map((s, i) => (
            <Figure
              key={s.src}
              src={s.src}
              alt={s.label}
              position={s.position}
              imgClassName="aspect-[4/5]"
              className={cn(i === 1 && "sm:mt-16")}
              caption={
                <>
                  <span className="font-semibold text-foreground">
                    {s.plain ? s.label : `${s.when} | ${s.label}.`}
                  </span>{" "}
                  {s.caption}
                </>
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------- watch

/** A video that loads only when tapped: its thumbnail until then. */
function Player({
  src,
  thumb,
  title,
  label,
}: {
  src: string;
  thumb: string | null;
  title: string;
  label: string;
}) {
  const [playing, setPlaying] = useState(thumb === null);
  return (
    <div className="relative aspect-video overflow-hidden bg-black">
      {playing ? (
        <iframe
          src={src}
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
          <img
            src={thumb ?? ""}
            alt=""
            loading="lazy"
            className="size-full object-cover transition duration-700 group-hover:scale-[1.02]"
          />
          <span className="absolute inset-0 bg-black/15 transition group-hover:bg-black/5" />
          <span className="mag-button absolute bottom-0 left-0 flex h-14 items-center gap-3 bg-background px-5 text-foreground transition group-hover:bg-primary group-hover:text-white sm:h-16 sm:px-7">
            <Play className="size-4 fill-current" /> {label}
          </span>
        </button>
      )}
    </div>
  );
}

const PTV = {
  src: "https://www.youtube-nocookie.com/embed/Uq1KitcVAwQ?autoplay=1&rel=0",
  thumb: "/brand/ptv-feature.webp",
  title: "PTV · Rise and Shine Pilipinas",
  meta: "Father's Day Special",
};

function Watch({ o }: { o: Offer }) {
  // Marj on the offer itself, once a link is pasted in Admin → Website.
  const own = videoEmbed(o.video.url);
  const ownTitle = o.video.heading || `${o.name}, explained by Marj`;
  return (
    <section className={SECTION}>
      <SectionHead
        no="02"
        label="Before you meet him"
        title={own ? ownTitle : "Watch Marj on PTV"}
        lead={own ? o.video.caption || undefined : `${PTV.title}. ${PTV.meta}.`}
      />
      <div className="mt-10 lg:mt-14">
        {own ? (
          <>
            <Player
              src={own.src}
              thumb={own.kind === "youtube" ? own.thumb : null}
              title={ownTitle}
              label="Watch"
            />
            <div className="mt-10 grid gap-6 border-t border-foreground pt-6 sm:grid-cols-[18rem_minmax(0,1fr)] sm:items-center">
              <Player src={PTV.src} thumb={PTV.thumb} title={PTV.title} label="PTV" />
              <div>
                <Kicker>As seen on TV</Kicker>
                <p className="mag-serif mt-2 text-3xl leading-tight">{PTV.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{PTV.meta}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <Player src={PTV.src} thumb={PTV.thumb} title={PTV.title} label="Play the feature" />
            <p className="mt-3 flex items-baseline justify-between gap-4 border-t border-border pt-2.5 text-[13px] text-muted-foreground">
              <span>
                As seen on TV: {PTV.title}, {PTV.meta}.
              </span>
              <span className="mag-kicker shrink-0 text-[10px]">PTV</span>
            </p>
          </>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- guests

/**
 * Real guest reviews, word for word (lib/brand.ts), set as printed quotes:
 * the six that read best at quote size, short enough to print whole.
 */
const QUOTES = GUEST_REVIEWS.filter((r) => r.text.length <= 230 && !r.text.endsWith("…")).slice(
  0,
  6,
);

function Guests() {
  return (
    <section className={SECTION}>
      <SectionHead
        no="03"
        label="Proof his way works"
        title="What guests say"
        italic="about Marj's villas"
        lead="Word for word, from guests who stayed at Malaya. Their reviews, not ours."
      />

      <dl className="mt-10 grid grid-cols-3 gap-px border-y border-foreground bg-border lg:mt-14">
        {REVIEW_SCORES.map((r, i) => (
          <div key={r.platform} className={cn("bg-background py-5 pr-3", i > 0 && "pl-4 sm:pl-5")}>
            <dt className="mag-figure text-3xl leading-none text-foreground sm:text-[2.6rem]">
              {r.line.split(" ")[0]}
              {r.line.includes("★") && "★"}
            </dt>
            <dd className="mag-kicker mt-2 flex items-center gap-1.5 text-[10px]">
              <PlatformLogo platform={r.platform} mono className="size-3" />
              {r.reviews} reviews
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {QUOTES.map((r) => (
          <figure key={r.name + r.when} className="flex flex-col border-t border-border pt-5">
            <blockquote className="mag-serif flex-1 text-[1.6rem] leading-[1.18] text-foreground">
              “{r.text}”
            </blockquote>
            <figcaption className="mag-kicker mt-5 flex items-center gap-2 text-[10px]">
              <PlatformLogo platform={r.platform} mono className="size-3 shrink-0" />
              <span className="text-foreground">{r.name}</span>
              <span className="text-foreground/30">/</span>
              {r.villa} · {r.when}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

// ------------------------------------------------------------- programme

function Programme({ o }: { o: Offer }) {
  const priced = o.price.show && o.price.amount;
  return (
    <section className={SECTION}>
      <SectionHead no="04" label="In your session" title={o.gets.heading} lead={o.gets.lead} />
      <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-10">
        <ol className="border-t border-foreground lg:col-span-7">
          {o.gets.items.map((it, i) => (
            <li
              key={it.title}
              className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-2 border-b border-border py-7 sm:grid-cols-[5rem_minmax(0,1fr)]"
            >
              <span className="mag-figure text-4xl leading-none text-primary sm:text-5xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="mag-serif block text-3xl leading-tight text-foreground">
                  {it.title}
                </span>
                <span className="mt-2 block max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                  {it.body}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <Figure
              src="/malaya/lanai-set-for-dinner.webp"
              alt="A Malaya lanai set for a gathering"
              imgClassName="aspect-[4/3]"
              caption="A Malaya lanai, set for a gathering."
              credit="Malaya Villas"
            />
            <div className="mt-8 border-t border-foreground pt-6">
              <Headline as="p" italic="Bring your numbers." className="text-4xl leading-[1.02]">
                No slides.
              </Headline>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                The session is built around what you bring: your area, your budget, your property.
              </p>
              {priced && (
                <p className="mt-6 flex items-baseline gap-3 border-t border-border pt-4">
                  <span className="mag-figure text-4xl leading-none text-foreground">
                    {o.price.amount}
                  </span>
                  <span className="text-sm leading-snug text-muted-foreground">{o.price.note}</span>
                </p>
              )}
              <ApplyLink o={o} className="mt-6 w-full" />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------- fit

function Fit({ o }: { o: Offer }) {
  return (
    <section className={SECTION}>
      <SectionHead no="05" label="Before you apply" title="Is this for you?" />
      <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <Kicker className="text-foreground">Yes, if</Kicker>
          <ul className="mt-3 border-t border-foreground">
            {o.fit.yes.map((it) => (
              <li key={it} className="border-b border-border py-4 text-[17px] leading-snug">
                {it}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-4">
          <Kicker>Not yet, if</Kicker>
          <ul className="mt-3 border-t border-border">
            {o.fit.no.map((it) => (
              <li
                key={it}
                className="border-b border-border py-4 text-[17px] leading-snug text-muted-foreground"
              >
                {it}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-4">
          <PullQuote>{o.catchLine.heading}</PullQuote>
          <p className="mt-5 pl-6 text-[15px] leading-relaxed text-muted-foreground sm:pl-8">
            {o.catchLine.body}
          </p>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------- steps

function Steps({ o }: { o: Offer }) {
  return (
    <section className={SECTION}>
      <SectionHead no="06" label="After you apply" title="Four steps" italic="to your session" />
      <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
        {o.steps.map((s, i) => (
          <li key={s.title} className="border-t border-foreground pt-5">
            <span className="mag-figure block text-6xl leading-none text-primary">{i + 1}</span>
            <span className="mt-6 block text-lg font-semibold leading-snug">{s.title}</span>
            <span className="mt-2 block text-[15px] leading-relaxed text-muted-foreground">
              {s.body}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ------------------------------------------------------------- questions

function Questions({ o }: { o: Offer }) {
  return (
    <section className={SECTION}>
      <SectionHead no="07" label="Questions" title="Asked a lot" />
      <dl className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:mt-14">
        {o.faq.map((f) => (
          <div key={f.q} className="border-t border-border py-6">
            <dt className="mag-serif text-2xl leading-snug text-foreground">{f.q}</dt>
            <dd className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// --------------------------------------------------------------- closing

function Closing({ o }: { o: Offer }) {
  const others = OFFER_ORDER.filter((s) => s !== o.slug).map((s) => OFFERS[s]);
  return (
    <section className={SECTION}>
      <div className="border-t-2 border-foreground pt-10 lg:pt-14">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Kicker>The last word</Kicker>
            <Headline className="mt-6 text-5xl leading-[0.96] sm:text-7xl lg:text-[5.25rem]">
              {o.closing.heading}
            </Headline>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-foreground/80">
              {o.closing.body}
            </p>
            <ApplyLink o={o} className="mt-8" />
          </div>

          <nav className="lg:col-span-4 lg:col-start-9" aria-label="Marj's other offers">
            <Kicker>Not quite you? Also from Marj</Kicker>
            <ul className="mt-3 border-t border-foreground">
              {others.map((x) => (
                <li key={x.slug} className="border-b border-border">
                  <Link
                    to={offerPath(x.slug)}
                    className="group flex items-center justify-between gap-4 py-4"
                  >
                    <span>
                      <span className="mag-kicker block text-[10px] text-primary">{x.pillar}</span>
                      <span className="mag-serif mt-1 block text-2xl leading-tight transition-colors group-hover:text-primary">
                        {x.name}
                      </span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
