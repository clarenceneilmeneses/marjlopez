/**
 * The page the link in bio points to — PRD §6. Its one job is to turn "DM
 * ko po kayo" into a sorted inquiry: every button leads to the form.
 *
 * Copy and photos are placeholders from Malaya Villas until Marj sends his
 * own (portrait for the hero, his story for "Why listen to me").
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, MessageCircle, Send } from "@/components/icons";

import { PublicFooter, PublicHeader } from "@/components/site/chrome";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { TYPE_ORDER, TYPES } from "@/lib/inquiry";

export const Route = createFileRoute("/")({
  component: Landing,
});

const FAQ = [
  {
    q: "Magkano ang kailangan para magsimula?",
    a: "It depends on whether you own the property, rent it (arbitrage) or build from scratch. Tell us your capital range in the form and we'll answer with real numbers from Malaya's own villas.",
  },
  {
    q: "Do you only work in Cavite and Tagaytay?",
    a: "Malaya Villas is there, but coaching and systems work anywhere in the Philippines. For builds, tell us where your lot is and we'll say honestly if it's within reach.",
  },
  {
    q: "Is the booking system the same one Malaya uses?",
    a: "Yes — the same website, inbox and back office that run Malaya Villas, set up for your own rentals and your own brand.",
  },
  {
    q: "Why not just message you on Facebook?",
    a: "Because DMs get buried. Here, your request arrives with the details we need, the right person on the team picks it up, and the whole conversation stays in one place.",
  },
  {
    q: "How fast do you reply?",
    a: "Usually within a day. You get an automatic reply the moment you send, and the team picks it up from there.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main id="content">
        {/* ---------------------------------------------------------- hero */}
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-8 sm:px-8 md:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24">
          <div>
            <p className="brand-eyebrow text-[10px] text-muted-foreground sm:text-xs">
              Airbnb · Build · Systems
            </p>
            <h1 className="site-display mt-5 text-[2.6rem] leading-[1.05] text-brand-heading sm:text-6xl">
              Start, build and run your Airbnb
            </h1>
            <p className="font-voice mt-6 max-w-xl text-base leading-relaxed text-foreground sm:text-lg">
              I built Malaya Villas into a business that runs on its own system. If you want to
              start, build your own rental, or run yours the same way — tell me what you need.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild className="brand-caps h-12 rounded-full px-7 text-[15px]">
                <Link to="/inquire">
                  Work with me <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="brand-caps h-12 rounded-full px-7 text-[15px]"
              >
                <Link to="/" hash="how">
                  How it works
                </Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              About a minute. The team replies in your inbox here — not a buried DM.
            </p>
          </div>
          <div className="relative">
            <img
              src="/brand/about-hero.webp"
              alt="A Malaya villa with its pool, overlooking Taal Lake"
              className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-level-3"
            />
            <div className="absolute -bottom-6 left-4 right-4 flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-level-2 sm:left-auto sm:right-6 sm:w-80">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                <MessageCircle className="size-5" />
              </span>
              <div className="min-w-0 text-sm">
                <p className="font-semibold">Inquiries, sorted</p>
                <p className="text-muted-foreground">
                  Every request reaches the right person on the team.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------- what I help with */}
        <section id="help" className="scroll-mt-24 border-t border-border/50 bg-surface/60">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:py-24">
            <p className="brand-eyebrow text-[10px] text-muted-foreground sm:text-xs">
              What I can help with
            </p>
            <h2 className="site-display mt-4 text-3xl text-brand-heading sm:text-4xl">
              Pick what fits
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {TYPE_ORDER.filter((t) => t !== "other").map((t) => {
                const meta = TYPES[t];
                const Icon = meta.icon;
                return (
                  <Link
                    key={t}
                    to="/inquire"
                    search={{ type: t, step: 2 }}
                    className="group flex flex-col rounded-3xl border border-border/70 bg-card p-6 shadow-level-1 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-level-2"
                  >
                    <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
                      <Icon className="size-6" />
                    </span>
                    <p className="brand-caps mt-5 text-lg text-primary">{meta.label}</p>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {meta.blurb}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Start here{" "}
                      <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Collabs, events or media?{" "}
              <Link
                to="/inquire"
                search={{ type: "other", step: 2 }}
                className="font-semibold text-primary underline underline-offset-2"
              >
                Send it here
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------- proof */}
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
          <img
            src="/brand/about-team.webp"
            alt="Team Malaya"
            className="aspect-[16/9] w-full rounded-[2rem] object-cover shadow-level-2"
          />
          <div>
            <p className="brand-eyebrow text-[10px] text-muted-foreground sm:text-xs">
              Why listen to me
            </p>
            <h2 className="site-display mt-4 text-3xl text-brand-heading sm:text-4xl">
              Malaya Villas is the proof
            </h2>
            <p className="mt-5 text-base leading-relaxed text-foreground">
              Private villas in Cavite and Tagaytay, booked on Airbnb and direct, run by a small
              team on one system — the website, the inbox, the payments and the books. What I teach
              and what I build for you is what already works there.
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-4">
              {[
                ["9", "villas"],
                ["2", "cities"],
                ["1", "system"],
              ].map(([n, l]) => (
                <div
                  key={l}
                  className="rounded-2xl border border-border/70 bg-card p-4 text-center shadow-level-1"
                >
                  <dt className="font-display text-3xl text-primary">{n}</dt>
                  <dd className="text-xs uppercase tracking-wide text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ---------------------------------------------------- how it works */}
        <section id="how" className="scroll-mt-24 border-y border-border/50 bg-surface/60">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:py-24">
            <p className="brand-eyebrow text-[10px] text-muted-foreground sm:text-xs">
              How it works
            </p>
            <h2 className="site-display mt-4 text-3xl text-brand-heading sm:text-4xl">
              Three steps
            </h2>
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: Send,
                  title: "Tell us what you need",
                  body: "A few taps — what you want, where, your budget and timing.",
                },
                {
                  icon: MessageCircle,
                  title: "We reply in your inbox",
                  body: "The right person on the team picks it up, usually within a day.",
                },
                {
                  icon: CalendarCheck,
                  title: "Book a call",
                  body: "We set a time, you confirm in one tap, and we take it from there.",
                },
              ].map((s, i) => (
                <li
                  key={s.title}
                  className="rounded-3xl border border-border/70 bg-card p-6 shadow-level-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-primary font-display text-primary-foreground">
                      {i + 1}
                    </span>
                    <s.icon className="size-5 text-primary" />
                  </div>
                  <p className="brand-caps mt-5 text-lg text-primary">{s.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ------------------------------------------------------------ FAQ */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-16 sm:px-8 lg:py-24">
          <p className="brand-eyebrow text-center text-[10px] text-muted-foreground sm:text-xs">
            FAQ
          </p>
          <h2 className="site-display mt-4 text-center text-3xl text-brand-heading sm:text-4xl">
            Questions people ask
          </h2>
          <Accordion
            type="single"
            collapsible
            className="mt-8 rounded-3xl border border-border/70 bg-card px-5 shadow-level-1"
          >
            {FAQ.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left text-[15px]">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* ------------------------------------------------------------ CTA */}
        <section className="px-4 pb-16 sm:px-8">
          <div
            className="mx-auto flex max-w-7xl flex-col items-start gap-5 overflow-hidden rounded-[2rem] bg-cover bg-center px-6 py-12 text-white shadow-level-3 sm:px-12 md:flex-row md:items-center md:justify-between"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgb(40 24 12 / 0.82), rgb(40 24 12 / 0.45)), url(/brand/about-tagaytay-aerial.webp)",
            }}
          >
            <div>
              <p className="site-display text-2xl sm:text-3xl">Ready when you are</p>
              <p className="mt-2 max-w-md text-sm text-white/85">
                Tell {BRAND.team} what you need. It takes about a minute.
              </p>
            </div>
            <Button
              asChild
              className="brand-caps h-12 rounded-full bg-white px-7 text-[15px] text-primary hover:bg-white/90"
            >
              <Link to="/inquire">
                Work with me <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
