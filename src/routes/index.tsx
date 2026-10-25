/**
 * The page the link in bio points to — PRD §6. Its one job is to turn "DM
 * ko po kayo" into a sorted inquiry: every button leads to the form, and
 * everything else on the page is there to make sending it feel safe.
 *
 * Credibility, in order: the villas themselves (photos, lots of them), the
 * numbers that can be checked (Instagram, the Airbnb host card, 200+ guest
 * reviews), his own words, and every account he runs — each linked, so a
 * visitor can go and look. Sources for every figure are in lib/brand.ts.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BedDouble,
  CalendarCheck,
  Globe,
  MessageCircle,
  Send,
  Star,
  Users,
} from "@/components/icons";

import { PlatformLogo, type Platform } from "@/components/site/logos";
import { PublicFooter, PublicHeader } from "@/components/site/chrome";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  AIRBNB_HOST,
  BRAND,
  GUEST_REVIEWS,
  INSTAGRAM,
  LINKS,
  REVIEW_SCORES,
  TOTAL_REVIEWS,
  type ProfileLink,
} from "@/lib/brand";
import { TYPES } from "@/lib/inquiry";
import { cn } from "@/lib/utils";
import {
  GALLERY,
  MALAYA_SITE,
  PORTFOLIO,
  VILLAS,
  villaPhoto,
  villaUrl,
  type Villa,
} from "@/lib/villas";

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
    q: "Open ka ba sa investors and partnerships?",
    a: "Yes. Pick “Something else” in the form, choose Partnership, and tell us what you have in mind.",
  },
];

const HELP_PHOTOS: Record<"start" | "build" | "system", string> = {
  start: villaPhoto("PR-HIDDEN-CABIN-A", 4),
  build: villaPhoto("PR-CASA-MARTHA", 0),
  system: villaPhoto("PR-BACOOR", 4),
};

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("brand-eyebrow text-[10px] text-muted-foreground sm:text-xs", className)}>
      {children}
    </p>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main id="content">
        <Hero />
        <ProofBar />
        <About />
        <Help />
        <Villas />
        <Gallery />
        <Reviews />
        <Everywhere />
        <How />
        <Faq />
      </main>
      <PublicFooter />
    </div>
  );
}

// ------------------------------------------------------------------ hero

function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-6 sm:px-8 md:pt-12 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:pb-20">
      <div>
        <Eyebrow>Airbnb · Build · Systems</Eyebrow>
        <h1 className="site-display mt-5 text-[2.6rem] leading-[1.05] text-brand-heading sm:text-6xl">
          Start, build and run your Airbnb
        </h1>
        <p className="font-voice mt-6 max-w-xl text-base leading-relaxed text-foreground sm:text-lg">
          {PORTFOLIO.villas} villas in Tagaytay and Cavite, {TOTAL_REVIEWS}+ guest reviews, one
          system running all of it. If you want to start, build your own rental, or run yours the
          same way — tell me what you need.
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
            <Link to="/" hash="villas">
              See the villas
            </Link>
          </Button>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <a
            href={INSTAGRAM.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:opacity-80"
          >
            <PlatformLogo platform="instagram" className="size-5" />
            <span>
              <span className="font-semibold">{INSTAGRAM.followers}</span> followers
            </span>
          </a>
          <a
            href={AIRBNB_HOST.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:opacity-80"
          >
            <PlatformLogo platform="airbnb" className="size-5" />
            <span>
              <span className="font-semibold">{AIRBNB_HOST.rating} ★</span> · {AIRBNB_HOST.reviews}{" "}
              reviews
            </span>
          </a>
          <span className="flex items-center gap-2">
            <BadgeCheck className="size-5 text-success" /> Identity-verified host
          </span>
        </div>
      </div>

      {/* A mosaic, not one photo — the villas are the argument. */}
      <div className="relative">
        <div className="grid h-[420px] grid-cols-3 grid-rows-2 gap-2.5 sm:h-[520px] sm:gap-3">
          <Photo
            src={villaPhoto("PR-MALAYA-2", 6)}
            alt="Villa 2's pool over the Tagaytay ridge"
            className="col-span-2 row-span-2"
            eager
          />
          <Photo
            src={villaPhoto("PR-CASA-MARTHA", 1)}
            alt="Casa Martha's rooftop pool at sunset"
            eager
          />
          <Photo src={villaPhoto("PR-HIDDEN-CABIN-A", 0)} alt="The A Cabin and its pool" eager />
        </div>
        <div className="absolute -bottom-5 left-3 flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3 pr-4 shadow-level-3 sm:-left-6">
          <img
            src="/brand/marj-airbnb.png"
            alt="Marj"
            className="size-12 rounded-full object-cover"
          />
          <div className="text-sm leading-tight">
            <p className="font-semibold">Marj Lopez</p>
            <p className="text-xs text-muted-foreground">Host of {PORTFOLIO.villas} villas</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Photo({
  src,
  alt,
  className,
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <div className={cn("overflow-hidden rounded-3xl bg-secondary shadow-level-2", className)}>
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        className="size-full object-cover transition duration-700 hover:scale-[1.04]"
      />
    </div>
  );
}

// --------------------------------------------------------------- proof bar

function ProofBar() {
  const items: { big: string; small: string; logo?: Platform; href?: string }[] = [
    {
      big: INSTAGRAM.followers,
      small: "Instagram followers",
      logo: "instagram",
      href: INSTAGRAM.url,
    },
    { big: String(PORTFOLIO.villas), small: "villas, and one coming" },
    { big: `${TOTAL_REVIEWS}+`, small: "guest reviews" },
    {
      big: `${AIRBNB_HOST.rating} ★`,
      small: "Airbnb host rating",
      logo: "airbnb",
      href: AIRBNB_HOST.url,
    },
    { big: String(AIRBNB_HOST.yearsHosting), small: "years hosting" },
  ];
  return (
    <section className="border-y border-border/50 bg-card/70">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 sm:px-8 md:grid-cols-5">
        {items.map((it) => {
          const body = (
            <>
              <span className="flex items-center gap-2 font-display text-3xl text-primary sm:text-4xl">
                {it.logo && <PlatformLogo platform={it.logo} className="size-6" />}
                {it.big}
              </span>
              <span className="mt-1 block text-xs uppercase tracking-wide text-muted-foreground">
                {it.small}
              </span>
            </>
          );
          return it.href ? (
            <a
              key={it.small}
              href={it.href}
              target="_blank"
              rel="noreferrer"
              className="px-2 py-6 transition hover:opacity-80 sm:px-4"
            >
              {body}
            </a>
          ) : (
            <div key={it.small} className="px-2 py-6 sm:px-4">
              {body}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ about

function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-8 lg:py-24">
      <div className="grid items-start gap-10 lg:grid-cols-[22rem_1fr] lg:gap-16">
        {/* His Airbnb host card, as Airbnb shows it. */}
        <a
          href={AIRBNB_HOST.url}
          target="_blank"
          rel="noreferrer"
          className="grid grid-cols-[1fr_auto] items-center gap-6 rounded-3xl bg-card p-7 shadow-level-3 transition hover:-translate-y-0.5"
        >
          <div className="flex flex-col items-center text-center">
            <img
              src="/brand/marj-airbnb.png"
              alt="Marj on Airbnb"
              className="size-28 object-contain"
            />
            <p className="mt-2 text-3xl font-bold text-foreground">{AIRBNB_HOST.name}</p>
            <p className="text-xs text-muted-foreground">Host</p>
          </div>
          <dl className="divide-y divide-border/70 text-left">
            <div className="pb-3">
              <dt className="text-xl font-bold">{AIRBNB_HOST.reviews}</dt>
              <dd className="text-[11px] text-muted-foreground">Reviews</dd>
            </div>
            <div className="py-3">
              <dt className="flex items-center gap-1 text-xl font-bold">
                {AIRBNB_HOST.rating} <Star className="size-4 fill-foreground" />
              </dt>
              <dd className="text-[11px] text-muted-foreground">Rating</dd>
            </div>
            <div className="pt-3">
              <dt className="text-xl font-bold">{AIRBNB_HOST.yearsHosting}</dt>
              <dd className="text-[11px] text-muted-foreground">Years hosting</dd>
            </div>
          </dl>
          <p className="col-span-2 flex items-center justify-center gap-1.5 border-t border-border/60 pt-4 text-xs text-muted-foreground">
            <PlatformLogo platform="airbnb" className="size-4" /> Identity verified on Airbnb
            <ArrowUpRight className="size-3.5" />
          </p>
        </a>

        <div>
          <Eyebrow>About Marj</Eyebrow>
          <h2 className="site-display mt-4 text-3xl text-brand-heading sm:text-5xl">
            From renter to host of {PORTFOLIO.villas}
          </h2>
          <blockquote className="mt-6 border-l-4 border-primary/60 pl-5 text-lg leading-relaxed text-foreground">
            &ldquo;{AIRBNB_HOST.bio}&rdquo;
          </blockquote>
          <p className="mt-3 pl-6 text-sm text-muted-foreground">— Marjun, on his Airbnb profile</p>
          <div className="mt-8 rounded-2xl border border-border/70 bg-card p-5 shadow-level-1">
            <a
              href={INSTAGRAM.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3"
            >
              <PlatformLogo platform="instagram" className="size-8" />
              <span className="min-w-0">
                <span className="block font-semibold">
                  @{INSTAGRAM.handle}{" "}
                  <span className="font-normal text-muted-foreground">
                    · {INSTAGRAM.followers} followers
                  </span>
                </span>
                <span className="block text-sm text-muted-foreground">{INSTAGRAM.bio}</span>
              </span>
              <ArrowUpRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------- help

function Help() {
  return (
    <section id="help" className="scroll-mt-24 border-t border-border/50 bg-surface/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:py-24">
        <Eyebrow>What I can help with</Eyebrow>
        <h2 className="site-display mt-4 text-3xl text-brand-heading sm:text-5xl">
          Pick what fits
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {(["start", "build", "system"] as const).map((t) => {
            const meta = TYPES[t];
            const Icon = meta.icon;
            return (
              <Link
                key={t}
                to="/inquire"
                search={{ type: t, step: 2 }}
                className="group flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-level-1 transition hover:-translate-y-0.5 hover:shadow-level-3"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={HELP_PHOTOS[t]}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 grid size-11 place-items-center rounded-2xl bg-card/95 text-primary shadow-level-2">
                    <Icon className="size-5" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="brand-caps text-lg text-primary">{meta.label}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {meta.blurb}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Start here{" "}
                    <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Investors, collabs, events or media?{" "}
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
  );
}

// ----------------------------------------------------------------- villas

function Villas() {
  return (
    <section id="villas" className="scroll-mt-24 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Why listen to me</Eyebrow>
            <h2 className="site-display mt-4 text-3xl text-brand-heading sm:text-5xl">
              Malaya Villas is the proof
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              {PORTFOLIO.villas} villas live today — {PORTFOLIO.bedrooms} bedrooms, room for{" "}
              {PORTFOLIO.guests.toLocaleString()} guests a night — and one more on the way. Every
              one runs on the same system.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="brand-caps h-11 rounded-full px-6 text-[15px]"
          >
            <a href={MALAYA_SITE} target="_blank" rel="noreferrer">
              malayavillas.com <ArrowUpRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* A swipeable row on a phone, a grid from md. */}
      <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 no-scrollbar sm:px-8 md:mx-auto md:grid md:max-w-7xl md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3">
        {VILLAS.map((v, i) => (
          <VillaCard key={v.code} villa={v} n={i + 1} />
        ))}
        <ComingSoonCard n={VILLAS.length + 1} />
      </div>
    </section>
  );
}

function VillaCard({ villa, n }: { villa: Villa; n: number }) {
  return (
    <a
      href={villaUrl(villa.code)}
      target="_blank"
      rel="noreferrer"
      className="group flex w-[82vw] max-w-sm shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-level-1 transition hover:-translate-y-0.5 hover:shadow-level-3 md:w-auto md:max-w-none"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img
          src={villaPhoto(villa.code, villa.cover)}
          alt={`${villa.title}, ${villa.location}`}
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition duration-700 group-hover:opacity-0"
        />
        <img
          src={villaPhoto(villa.code, villa.more[0] ?? villa.cover)}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full scale-105 object-cover opacity-0 transition duration-700 group-hover:scale-100 group-hover:opacity-100"
        />
        <span className="absolute left-3 top-3 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-level-1">
          No. {n}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1 px-1 pt-1">
        {villa.more.map((p) => (
          <img
            key={p}
            src={villaPhoto(villa.code, p)}
            alt=""
            loading="lazy"
            className="aspect-[4/3] w-full rounded-lg object-cover"
          />
        ))}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {villa.group}
        </p>
        <p className="brand-caps mt-1 text-xl text-primary">{villa.title}</p>
        <p className="text-sm text-muted-foreground">{villa.location}</p>
        <p className="mt-3 text-sm leading-relaxed text-foreground">{villa.summary}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
          <span className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1">
              <BedDouble className="size-4" /> {villa.bedrooms}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-4" /> up to {villa.maxPax}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-primary">
            View <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </a>
  );
}

function ComingSoonCard({ n }: { n: number }) {
  return (
    <Link
      to="/inquire"
      search={{ type: "build", step: 2 }}
      className="group relative flex min-h-[420px] w-[82vw] max-w-sm shrink-0 snap-start flex-col justify-end overflow-hidden rounded-3xl text-white shadow-level-2 md:w-auto md:max-w-none"
    >
      <img
        src={villaPhoto("PR-012", 2)}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full scale-110 object-cover blur-md brightness-75 transition duration-700 group-hover:blur-sm"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2a1a0e]/95 via-[#2a1a0e]/50 to-transparent" />
      <div className="relative p-6">
        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#3c2411]">
          No. {n} · Coming soon
        </span>
        <p className="site-display mt-4 text-3xl leading-tight">One more on the way</p>
        <p className="mt-2 text-sm text-white/85">
          The next Malaya villa is being built now. Want the one after it to be yours?
        </p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">
          Build with me <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------- gallery

function Gallery() {
  return (
    <section className="border-y border-border/50 bg-surface/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:py-24">
        <Eyebrow>Inside the villas</Eyebrow>
        <h2 className="site-display mt-4 text-3xl text-brand-heading sm:text-5xl">
          What guests come back for
        </h2>
        <div className="mt-10 columns-2 gap-3 md:columns-3 lg:columns-4">
          {GALLERY.map(([code, n]) => {
            const v = VILLAS.find((x) => x.code === code);
            return (
              <a
                key={`${code}-${n}`}
                href={villaUrl(code)}
                target="_blank"
                rel="noreferrer"
                className="group relative mb-3 block break-inside-avoid overflow-hidden rounded-2xl bg-secondary"
              >
                <img
                  src={villaPhoto(code, n)}
                  alt={v ? `${v.title}, ${v.location}` : ""}
                  loading="lazy"
                  className="w-full transition duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2.5 pt-8 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                  {v?.title} · {v?.location}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- reviews

function Reviews() {
  return (
    <section id="reviews" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-8 lg:py-24">
      <Eyebrow>Guest reviews</Eyebrow>
      <h2 className="site-display mt-4 text-3xl text-brand-heading sm:text-5xl">
        {TOTAL_REVIEWS}+ guests have said it
      </h2>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {REVIEW_SCORES.map((r) => (
          <div
            key={r.platform}
            className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-level-1"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-secondary">
              <PlatformLogo platform={r.platform} className="size-6" />
            </span>
            <div>
              <p className="font-display text-2xl text-primary">{r.line}</p>
              <p className="text-xs text-muted-foreground">
                {r.reviews} reviews on{" "}
                {r.platform === "airbnb"
                  ? "Airbnb"
                  : r.platform === "google"
                    ? "Google"
                    : "Facebook"}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:-mx-8 sm:px-8 md:mx-0 md:block md:columns-2 md:overflow-visible md:px-0 md:pb-0 lg:columns-3">
        {GUEST_REVIEWS.map((r) => (
          <figure
            key={r.name + r.when}
            className="w-[82vw] max-w-sm shrink-0 snap-start break-inside-avoid rounded-2xl md:mb-4 md:w-auto md:max-w-none border border-border/70 bg-card p-5 shadow-level-1"
          >
            <div className="flex items-center gap-0.5 text-warning">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-current" />
              ))}
            </div>
            <blockquote className="mt-3 text-[15px] leading-relaxed text-foreground">
              &ldquo;{r.text}&rdquo;
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-2.5 text-sm">
              <span className="grid size-8 place-items-center rounded-full bg-secondary font-semibold text-primary">
                {r.name[0]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{r.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {r.villa} · {r.when}
                </span>
              </span>
              <PlatformLogo platform={r.platform} className="size-4" />
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

// ------------------------------------------------------- find me everywhere

const LINK_GROUPS: { title: string; kind: ProfileLink["kind"] }[] = [
  { title: "Marj", kind: "personal" },
  { title: "Facebook pages", kind: "page" },
  { title: "On Airbnb", kind: "listing" },
  { title: "Book direct", kind: "site" },
];

function Everywhere() {
  return (
    <section id="links" className="scroll-mt-24 border-y border-border/50 bg-surface/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:py-24">
        <Eyebrow>Find me everywhere</Eyebrow>
        <h2 className="site-display mt-4 text-3xl text-brand-heading sm:text-5xl">
          Every account, linked
        </h2>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Go and look — the villas, the reviews and the people behind them are all public.
        </p>
        <div className="mt-10 space-y-8">
          {LINK_GROUPS.map((g) => (
            <div key={g.kind}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {g.title}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {LINKS.filter((l) => l.kind === g.kind).map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-level-1 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-level-2"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary">
                      {l.platform === "web" ? (
                        <Globe className="size-5 text-primary" />
                      ) : (
                        <PlatformLogo platform={l.platform} className="size-6" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{l.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {l.handle}
                      </span>
                      {l.stat && (
                        <span className="mt-0.5 block text-xs font-semibold text-primary">
                          {l.stat}
                        </span>
                      )}
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------- how it works

function How() {
  const steps = [
    {
      icon: Send,
      title: "Tell us what you need",
      body: "A few taps — what you want, where, your budget and timing.",
      photo: villaPhoto("PR-HIDDEN-LOFT", 3),
    },
    {
      icon: MessageCircle,
      title: "We reply in your inbox",
      body: "The right person on the team picks it up, usually within a day.",
      photo: villaPhoto("PR-SAGLIT", 6),
    },
    {
      icon: CalendarCheck,
      title: "Book a call",
      body: "We set a time, you confirm in one tap, and we take it from there.",
      photo: villaPhoto("PR-MALAYA-1", 1),
    },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-8 lg:py-24">
      <Eyebrow>How it works</Eyebrow>
      <h2 className="site-display mt-4 text-3xl text-brand-heading sm:text-5xl">Three steps</h2>
      <ol className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-level-1"
          >
            <img
              src={s.photo}
              alt=""
              loading="lazy"
              className="aspect-[16/9] w-full object-cover"
            />
            <div className="p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-primary font-display text-primary-foreground">
                  {i + 1}
                </span>
                <s.icon className="size-5 text-primary" />
              </div>
              <p className="brand-caps mt-5 text-lg text-primary">{s.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

// -------------------------------------------------------------------- FAQ

function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 pb-16 sm:px-8 lg:pb-24">
      <Eyebrow className="text-center">FAQ</Eyebrow>
      <h2 className="site-display mt-4 text-center text-3xl text-brand-heading sm:text-5xl">
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
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Still have a question?{" "}
        <Link to="/inquire" className="font-semibold text-primary underline underline-offset-2">
          Ask the team
        </Link>{" "}
        — {BRAND.team} replies in your inbox.
      </p>
    </section>
  );
}
