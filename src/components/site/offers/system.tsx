/**
 * A system for your resort — software, so it reads like a product page and
 * shows the real thing: Malaya's live admin (screenshots from Clarence,
 * 2026-10-28, guests' names, emails, mobiles and messages blurred — Data
 * Privacy Act) and the live malayavillas.com.
 *
 *   Hero      Malaya-brown ground, the headline centred, the admin in a
 *             browser frame and the guest site on a phone beside it
 *   Channels  the sites it works alongside, one quiet row
 *   Tour      the features as tabs, each with its own screenshot
 *   Payments  the ways guests pay
 *   Why       the team that uses it, beside the story
 *   Fit       a two-column "built for / not for" table, the catch under it
 *   Steps     four steps joined by arrows
 *   FAQ       heading left, answers right
 *   Closing   a centred brown card
 */
import { ArrowRight, Check, X } from "@/components/icons";
import { useState } from "react";

import { BrandMark } from "@/components/site/logos";
import { type Offer } from "@/lib/offers";
import { cn } from "@/lib/utils";

import { Apply, Eyebrow, FaqAccordion, H2, OfferBadge, OtherOffers } from "./shared";
import type { LayoutProps } from "./shared";
import { Browser, IPhone } from "./devices";

const BROWN = "#3a2416";

/** One screenshot per feature card, in the order of the default cards. */
const SHOTS = [
  { src: "/system/site-desk.webp", url: "malayavillas.com" },
  { src: "/system/inbox.webp", url: "admin · Inbox" },
  { src: "/system/calendar.webp", url: "admin · Calendar" },
  { src: "/system/booking.webp", url: "admin · Bookings & Guests" },
];

const PAY = [
  { src: "/system/pay/gcash.svg", name: "GCash" },
  { src: "/system/pay/maya.svg", name: "Maya" },
  { src: "/system/pay/qrph.svg", name: "QR Ph" },
  { src: "/system/pay/bpi.svg", name: "BPI" },
  { src: "/system/pay/unionbank.svg", name: "UnionBank" },
  { src: "/system/pay/grab.svg", name: "GrabPay" },
  { src: "/system/pay/xendit.svg", name: "Xendit" },
];

export function SystemLayout({ o }: LayoutProps) {
  return (
    <>
      <Hero o={o} />
      <Channels />
      <Tour o={o} />
      <Payments />
      <Why o={o} />
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
      <div
        className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[2rem] px-5 pt-14 shadow-level-3 sm:px-10 lg:pt-20"
        style={{ backgroundColor: BROWN }}
      >
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <OfferBadge o={o} dark />
          </div>
          <h1 className="site-display mt-6 text-[2.6rem] leading-[0.95] text-white sm:text-6xl xl:text-7xl">
            {o.headline[0]}
            <br />
            {o.headline[1]}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-white/75 sm:text-base">
            {o.sub}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Apply o={o} tone="light" />
            <span className="text-xs text-white/55">A 30-minute demo on a call</span>
          </div>
        </div>

        {/* The admin in a browser, the guest site on an iPhone — cut off by
            the frame's bottom edge, like a product shot. */}
        <div className="relative mx-auto mt-12 max-w-5xl translate-y-6 lg:mt-16">
          <Browser src={o.hero.src} url="admin · Malaya Villas" eager />
          <IPhone
            src="/system/site-phone.webp"
            className="absolute -right-3 -top-10 hidden w-[21%] md:block lg:-right-14 lg:-top-14"
          />
        </div>
      </div>
    </section>
  );
}

function Channels() {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-14 sm:px-8">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Works alongside
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {(
            [
              ["airbnb", "Airbnb"],
              ["booking", "Booking.com"],
              ["agoda", "Agoda"],
              ["facebook", "Facebook"],
              ["instagram", "Instagram"],
            ] as const
          ).map(([m, name]) => (
            <span
              key={m}
              className="flex items-center gap-2 rounded-full bg-card px-3.5 py-2 text-sm shadow-level-1"
            >
              <BrandMark mark={m} className="size-5" />
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tour({ o }: { o: Offer }) {
  const [active, setActive] = useState(0);
  const items = o.gets.items;
  const current = items[active] ?? items[0];
  const shot = SHOTS[active % SHOTS.length]!;
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-8 lg:pt-28">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>The tour</Eyebrow>
        <H2 className="mt-4">{o.gets.heading}</H2>
        <p className="mt-4 text-base text-muted-foreground">{o.gets.lead}</p>
      </div>
      <div className="mt-10 grid items-start gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <ul className="flex gap-2 overflow-x-auto pb-1 no-scrollbar lg:flex-col lg:overflow-visible">
          {items.map((it, i) => {
            const on = i === active;
            return (
              <li key={it.title} className="shrink-0 lg:shrink">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={on}
                  className={cn(
                    "w-full rounded-2xl px-5 py-4 text-left transition",
                    on ? "bg-card shadow-level-2" : "hover:bg-card/60",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums",
                        on
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={cn(
                        "whitespace-nowrap font-semibold lg:whitespace-normal",
                        !on && "text-muted-foreground",
                      )}
                    >
                      {it.title}
                    </span>
                  </span>
                  {on && (
                    <span className="mt-2 hidden pl-10 text-sm leading-relaxed text-muted-foreground lg:block">
                      {it.body}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <div>
          <Browser
            key={shot.src}
            src={shot.src}
            url={shot.url}
            className="animate-in fade-in duration-300"
          />
          {current && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground lg:hidden">
              {current.body}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Payments() {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-20 sm:px-8">
      <div className="rounded-[2rem] bg-card p-7 text-center shadow-level-1 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Guests pay the way they already do
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
          {PAY.map((p) => (
            <li key={p.name}>
              <img
                src={p.src}
                alt={p.name}
                loading="lazy"
                className="h-7 w-auto max-w-[110px] object-contain"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Why({ o }: { o: Offer }) {
  // The villas it runs; the team that uses it is already in the footer.
  const shot = o.why.after;
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-20 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:pt-28">
      <img
        src={shot.src}
        alt={shot.label}
        loading="lazy"
        style={shot.position ? { objectPosition: shot.position } : undefined}
        className="aspect-[16/10] w-full rounded-[2rem] object-cover shadow-level-3"
      />
      <div>
        <Eyebrow>Why it exists</Eyebrow>
        <H2 className="mt-4">{o.why.heading}</H2>
        <p className="mt-5 text-base leading-relaxed text-foreground/85">{o.why.body}</p>
        <p className="mt-4 text-sm text-muted-foreground">{shot.caption}</p>
      </div>
    </section>
  );
}

function Fit({ o }: { o: Offer }) {
  const rows = Math.max(o.fit.yes.length, o.fit.no.length);
  return (
    <section className="mx-auto max-w-5xl px-4 pt-20 sm:px-8 lg:pt-28">
      <H2 className="text-center">Is it built for you?</H2>
      <div className="mt-8 overflow-hidden rounded-[2rem] bg-card shadow-level-2">
        <div className="grid grid-cols-2 border-b border-border text-[11px] font-bold uppercase tracking-[0.12em]">
          <p className="p-4 text-success sm:px-7">Built for</p>
          <p className="border-l border-border p-4 text-muted-foreground sm:px-7">Not for</p>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-2 border-b border-border/60 last:border-b-0">
            <p className="flex items-start gap-2.5 p-4 text-sm leading-snug sm:px-7 sm:text-[15px]">
              {o.fit.yes[i] && <Check className="mt-0.5 size-4 shrink-0 text-success" />}
              {o.fit.yes[i]}
            </p>
            <p className="flex items-start gap-2.5 border-l border-border p-4 text-sm leading-snug text-muted-foreground sm:px-7 sm:text-[15px]">
              {o.fit.no[i] && <X className="mt-0.5 size-4 shrink-0" />}
              {o.fit.no[i]}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl bg-secondary/70 p-6 sm:p-7">
        <p className="font-semibold">{o.catchLine.heading}</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
          {o.catchLine.body}
        </p>
      </div>
    </section>
  );
}

function Steps({ o }: { o: Offer }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-8 lg:pt-28">
      <div className="text-center">
        <Eyebrow>From demo to live</Eyebrow>
        <H2 className="mt-4">How it gets set up</H2>
      </div>
      <ol className="mt-10 flex flex-col gap-3 lg:flex-row lg:items-stretch">
        {o.steps.map((s, i) => (
          <li key={s.title} className="flex flex-1 items-center gap-3 lg:flex-row">
            <div className="h-full flex-1 rounded-2xl bg-card p-5 shadow-level-1">
              <p className="text-xs font-semibold text-primary tabular-nums">0{i + 1}</p>
              <p className="mt-2 font-semibold leading-snug">{s.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
            {i < o.steps.length - 1 && (
              <ArrowRight className="hidden size-5 shrink-0 text-muted-foreground/50 lg:block" />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function Faq({ o }: { o: Offer }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 pt-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:pt-28">
      <div>
        <Eyebrow>Questions</Eyebrow>
        <H2 className="mt-4">Resort owners ask</H2>
      </div>
      <FaqAccordion o={o} />
    </section>
  );
}

function Closing({ o }: { o: Offer }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-8 lg:pt-28">
      <div
        className="rounded-[2rem] p-8 text-center text-white shadow-level-3 sm:p-14"
        style={{ backgroundColor: BROWN }}
      >
        <h2 className="site-display mx-auto max-w-2xl text-4xl leading-none sm:text-5xl">
          {o.closing.heading}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/75">
          {o.closing.body}
        </p>
        <Apply o={o} tone="light" className="mt-8" />
      </div>
      <OtherOffers o={o} className="mt-10" />
    </section>
  );
}
