/**
 * The seminar — an event with Marj, so it reads like one: light, personal,
 * editorial, his face up front.
 *
 *   Hero      no dark frame: a cream page, the headline big on the left, his
 *             portrait in an arch on the right and a ticket for the next batch
 *   Proof     a quiet row of pills under the hero
 *   Why       his story as a pull quote, two pinned photos (then / now)
 *   Gets      the day as a printed programme beside a photo of a set room
 *   Fit       two plain columns, the catch on a sand note
 *   Steps     four tickets with torn edges
 *   FAQ       every answer open, two columns — nothing to click
 *   Closing   a dark band with his portrait
 */
import { Check, Star, X } from "@/components/icons";

import { proofWith, type Offer } from "@/lib/offers";
import { cn } from "@/lib/utils";

import { Apply, Eyebrow, H2, OfferBadge, OtherOffers } from "./shared";

export function SeminarLayout({ o, facebook }: { o: Offer; facebook: string }) {
  return (
    <>
      <Hero o={o} facebook={facebook} />
      <Why o={o} />
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

function Why({ o }: { o: Offer }) {
  const shots = [o.why.before, o.why.after];
  return (
    <section className="mx-auto max-w-5xl px-4 pt-28 text-center sm:px-8 lg:pt-36">
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
