/**
 * The page the link in bio points to. Simple on purpose (the boss,
 * 2026-11-03: "wag masyadong overwhelming sa information … clear ang
 * inoffer natin"): the message, the four offers, one line of proof, and who
 * Marj is. Everything detailed (the villas, the build, the reviews) lives
 * on the offer page it proves.
 *
 * Set like a clean magazine since 2026-11-04 (components/site/mag.tsx):
 *
 *   Cover      a masthead line, the headline in the serif, his portrait
 *              with a caption, and his numbers as one ruled line
 *   No. 01     the four offers as a contents page (MANAGE · LEARN ·
 *              INVEST · SYSTEMIZE), each row opens its page
 *   No. 02     Malaya, the proof of execution, as a photo feature
 *   No. 03     Meet Marj, as a profile: his words as a pull quote, the
 *              story with a drop cap, TV and press, his accounts
 *
 * Every figure's source is in lib/brand.ts. The words and photos can be
 * changed from Admin → Website; the defaults are in lib/site-content.ts,
 * and each offer's words in lib/offers.ts.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Globe } from "@/components/icons";

import { PublicFooter, PublicHeader } from "@/components/site/chrome";
import { PlatformLogo, type Platform } from "@/components/site/logos";
import { Figure, Headline, Kicker, magButton, PullQuote, SectionHead } from "@/components/site/mag";
import {
  AIRBNB_HOST,
  FACEBOOK,
  INSTAGRAM,
  LINKS,
  TOTAL_REVIEWS,
  type ProfileLink,
} from "@/lib/brand";
import { OFFER_ORDER, offerPath, proofWith, type Offer } from "@/lib/offers";
import {
  fetchSiteContent,
  landingFrom,
  OFFER_KEYS,
  offerFrom,
  SITE_PHOTOS,
  type LandingContent,
} from "@/lib/site-content";
import { cn } from "@/lib/utils";
import { MALAYA_SITE } from "@/lib/villas";
import { usePreviewDraft } from "@/state/site";

export const Route = createFileRoute("/")({
  // The saved words, read before the page renders so the first paint has
  // them: the landing's own, and each offer's (its row's pillar and name).
  loader: () => fetchSiteContent(["landing", ...OFFER_KEYS]),
  component: Landing,
});

type C = { c: LandingContent };

/** A photo's caption: its name in the photo library, so it follows an edit. */
const captionOf = (src: string) => SITE_PHOTOS.find((p) => p.src === src)?.label;

const PAGE = "mx-auto max-w-[1320px] px-4 sm:px-8";

function Landing() {
  const rows = Route.useLoaderData();
  // In Admin → Website's preview frame, the unsaved words instead.
  const draft = usePreviewDraft("landing");
  const c = landingFrom(draft === undefined ? rows : { ...rows, landing: draft });
  const offers = OFFER_ORDER.map((slug) => offerFrom(slug, rows));
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main id="content" className="pb-10">
        <Cover c={c} offers={offers} />
        <Offers c={c} offers={offers} />
        <Proof c={c} />
        <MeetMarj c={c} />
      </main>
      <PublicFooter />
    </div>
  );
}

// ----------------------------------------------------------------- cover

function Cover({ c, offers }: C & { offers: Offer[] }) {
  return (
    <section className={cn(PAGE, "pt-2 sm:pt-4")}>
      <div className="intro-settle">
        {/* The masthead line, like the strip under a magazine's title. */}
        <div className="mag-kicker flex items-center justify-between gap-4 border-y border-foreground py-2.5 text-foreground">
          <span className="truncate">{c.hero.eyebrow}</span>
          <span className="hidden shrink-0 md:inline">Tagaytay City · Philippines</span>
        </div>

        <div className="grid gap-10 pt-8 lg:grid-cols-12 lg:gap-10 lg:pt-12">
          <div className="flex flex-col lg:col-span-7">
            <Headline
              as="h1"
              italic={c.hero.headline[1]}
              className="text-[3.1rem] leading-[0.94] sm:text-7xl lg:text-[4.9rem] xl:text-[5.5rem]"
            >
              {c.hero.headline[0]}
            </Headline>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-foreground/80">{c.hero.sub}</p>
            <a href="#offers" className={cn(magButton(), "mt-8 w-fit")}>
              See how Marj can help
              <ArrowRight className="size-4 rotate-90 transition group-hover:translate-y-0.5" />
            </a>

            {/* Cover lines: the four offers, the way a cover lists what's inside. */}
            <ul className="mt-12 hidden grid-cols-2 gap-px border-t border-foreground bg-border lg:mt-auto lg:grid">
              {offers.map((o, i) => (
                <li key={o.slug} className="bg-background">
                  <Link
                    to={offerPath(o.slug)}
                    className={cn("group block py-4 pr-4", i % 2 === 1 && "pl-4 sm:pl-6")}
                  >
                    <span className="mag-kicker block text-[10px] text-primary">
                      {String(i + 1).padStart(2, "0")} · {o.pillar}
                    </span>
                    <span className="mag-serif mt-1 block text-xl leading-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                      {o.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Figure
            className="lg:col-span-5"
            src={c.hero.photo}
            alt="Marj Lopez"
            eager
            imgClassName="aspect-[4/5] bg-[#151314] object-[62%_center]"
            caption="Marj Lopez, founder of Malaya Villas."
            credit={
              <a
                href={FACEBOOK.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                {c.numbers.facebook} on Facebook
              </a>
            }
          />
        </div>
      </div>

      <Numbers c={c} />
    </section>
  );
}

/** Every audience number, as one ruled line of figures under the cover. */
function Numbers({ c }: C) {
  const cells: { logo?: Platform; big: string; small: string; href: string }[] = [
    { logo: "facebook", big: c.numbers.facebook, small: "Facebook", href: FACEBOOK.url },
    { logo: "instagram", big: c.numbers.instagram, small: "Instagram", href: INSTAGRAM.url },
    {
      logo: "airbnb",
      big: `${AIRBNB_HOST.rating}★`,
      small: `${AIRBNB_HOST.reviews} Airbnb reviews`,
      href: AIRBNB_HOST.url,
    },
    { big: `${TOTAL_REVIEWS}+`, small: "Guest reviews", href: "/management#reviews" },
    { big: "PTV", small: "As seen on TV", href: "https://www.youtube.com/watch?v=Uq1KitcVAwQ" },
  ];
  return (
    <div className="mt-12 grid grid-cols-2 gap-px border-y border-foreground bg-border sm:grid-cols-5">
      {cells.map((p, i) => (
        <a
          key={p.small}
          href={p.href}
          {...(p.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
          className={cn(
            "group bg-background py-5 pr-4 transition-colors sm:px-5",
            i % 2 === 1 && "pl-4",
            i === 4 && "col-span-2 sm:col-span-1",
            i === 0 && "sm:pl-0",
          )}
        >
          <span className="mag-figure block text-4xl leading-none text-foreground transition-colors group-hover:text-primary sm:text-[2.6rem]">
            {p.big}
          </span>
          <span className="mag-kicker mt-2 flex items-center gap-1.5 text-[10px]">
            {p.logo && <PlatformLogo platform={p.logo} mono className="size-3" />}
            {p.small}
          </span>
        </a>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- offers

/**
 * The four offers, laid out as a contents page: the number, the verb from
 * the boss's diagram (MANAGE · LEARN · INVEST · SYSTEMIZE), the offer in
 * the serif, who it's for, and its photo. The words are each offer page's
 * own (Admin → Website → that offer).
 */
function Offers({ c, offers }: C & { offers: Offer[] }) {
  return (
    <section id="offers" className={cn(PAGE, "scroll-mt-20 pt-24 lg:pt-36")}>
      <SectionHead
        no="01"
        label="Work with Marj"
        title={c.offers.heading}
        lead={c.offers.lead}
        aside="In this issue"
      />

      <ol className="mt-12 border-t border-border lg:mt-16">
        {offers.map((o, i) => {
          const no = String(i + 1).padStart(2, "0");
          return (
            <li key={o.slug} className="border-b border-border">
              <Link
                to={offerPath(o.slug)}
                className="group grid grid-cols-[minmax(0,1fr)_6.5rem] items-center gap-5 py-6 sm:grid-cols-[minmax(0,1fr)_10rem] lg:grid-cols-[4.5rem_minmax(0,1fr)_15rem_10rem_1.5rem] lg:gap-8 lg:py-7"
              >
                <span className="mag-figure hidden text-3xl text-muted-foreground lg:block">
                  {no}
                </span>
                <span className="min-w-0">
                  <span className="mag-kicker block text-primary">
                    <span className="lg:hidden">{no} · </span>
                    {o.pillar}
                  </span>
                  <span className="mag-serif mt-2 block text-[2rem] leading-none text-foreground transition-colors group-hover:text-primary sm:text-5xl">
                    {o.name}
                  </span>
                  <span className="mt-2 block text-sm text-muted-foreground lg:hidden">
                    {o.forWhom}
                    {o.price.show && o.price.amount && ` · ${o.price.amount}`}
                  </span>
                </span>
                <span className="hidden text-[15px] leading-snug text-muted-foreground lg:block">
                  {o.forWhom}
                  {o.price.show && o.price.amount && (
                    <span className="mag-figure mt-1 block text-xl text-foreground">
                      {o.price.amount}
                    </span>
                  )}
                </span>
                <span className="block aspect-[4/3] overflow-hidden bg-secondary">
                  <img
                    src={o.hero.src}
                    alt=""
                    loading="lazy"
                    style={o.hero.position ? { objectPosition: o.hero.position } : undefined}
                    className="size-full object-cover grayscale-[40%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  />
                </span>
                <ArrowUpRight className="hidden size-5 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary lg:block" />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// ----------------------------------------------------------------- proof

/**
 * Malaya, the proof of execution: the bottom box of the boss's diagram,
 * "real villas, actual operations, systems, and documented projects", as a
 * photo feature. One big photo, the words and four figures beside it, then
 * the other three photos in a row.
 */
function Proof({ c }: C) {
  const [lead, ...rest] = c.proof.photos.slice(0, 4);
  return (
    <section id="proof" className={cn(PAGE, "scroll-mt-20 pt-24 lg:pt-36")}>
      <SectionHead
        no="02"
        label="Proof of execution"
        title={c.proof.heading}
        aside={
          <a href={MALAYA_SITE} target="_blank" rel="noreferrer" className="hover:text-foreground">
            malayavillas.com ↗
          </a>
        }
      />

      <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12">
        {lead && (
          <Figure
            className="lg:col-span-8"
            src={lead.src}
            alt=""
            imgClassName="aspect-[16/10]"
            caption={captionOf(lead.src) ?? "Malaya Villas"}
            credit="Malaya Villas"
          />
        )}
        <div className="flex flex-col lg:col-span-4">
          <p className="mag-dropcap text-[17px] leading-relaxed text-foreground/85">
            {c.proof.body}
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-px border-y border-foreground bg-border lg:mt-auto">
            {proofWith(c.numbers.facebook).map((p, i) => (
              <div key={p.small} className={cn("bg-background py-5", i % 2 === 1 && "pl-5")}>
                <dt className="mag-figure text-[2.75rem] leading-none text-foreground">{p.big}</dt>
                <dd className="mt-2 pr-3 text-xs leading-snug text-muted-foreground">{p.small}</dd>
              </div>
            ))}
          </dl>
          <a
            href={MALAYA_SITE}
            target="_blank"
            rel="noreferrer"
            className={cn(magButton("line"), "mt-6 w-full")}
          >
            See Malaya Villas <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>

      {rest.length > 0 && (
        <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-6">
          {rest.map(({ src }, i) => (
            <Figure
              key={src + i}
              src={src}
              alt=""
              imgClassName="aspect-[4/3]"
              caption={<span className="line-clamp-1">{captionOf(src) ?? ""}</span>}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// -------------------------------------------------------------- meet marj

/** Where he's been featured. Labels are ours, not the outlets' headlines. */
const FEATURES = [
  {
    kind: "TV",
    outlet: "PTV",
    title: "Rise and Shine Pilipinas",
    meta: "Father's Day Special",
    image: "/brand/ptv-feature.webp",
    url: "https://www.youtube.com/watch?v=Uq1KitcVAwQ",
  },
  {
    kind: "Press",
    outlet: "Latest Chika",
    title: "The Philippine STAR",
    meta: "Feature · June 24, 2024",
    image: null,
    url: "https://latestchika.com/just-in/2024/06/24/107133/single-father-shares-life-with-3-kids-stresses-importance-of-co-parenting/",
  },
];

/**
 * His story, split for print: when it opens with a quote ("“Growing up
 * without a home…”"), the quote becomes the pull quote and the rest the
 * paragraph under it. Any other story is one paragraph.
 */
function splitStory(story: string): { quote: string | null; rest: string } {
  const m = story.match(/^\s*[“"]([^”"]+)[”"]\s*([\s\S]*)$/);
  return m ? { quote: m[1]!.trim(), rest: m[2]!.trim() } : { quote: null, rest: story };
}

function MeetMarj({ c }: C) {
  // His follower counts as set in the editor, on his own two accounts.
  const followers = (l: ProfileLink) =>
    l.url === FACEBOOK.url
      ? { ...l, stat: `${c.numbers.facebook} followers` }
      : l.url === INSTAGRAM.url
        ? { ...l, stat: `${c.numbers.instagram} followers` }
        : l;
  // His own accounts and Malaya's site (2026-11-03): the villas' Facebook
  // pages and listings live on Malaya's own site.
  const accounts = [
    ...LINKS.filter((l) => l.kind === "personal").map(followers),
    ...LINKS.filter((l) => l.kind === "site"),
  ];
  const { quote, rest } = splitStory(c.meet.story);
  return (
    <section id="about" className={cn(PAGE, "scroll-mt-20 pt-24 lg:pt-36")}>
      <SectionHead no="03" label={c.meet.eyebrow} title={c.meet.heading} aside="Profile" />

      <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Figure
            src={c.meet.photo}
            alt="Marj with his family"
            imgClassName="aspect-[4/5] object-center"
            caption={captionOf(c.meet.photo) ?? "Marj Lopez"}
            credit="Family first"
            className="lg:sticky lg:top-24"
          />
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          {quote && <PullQuote by="Marj Lopez">“{quote}”</PullQuote>}
          {rest && (
            <p
              className={cn(
                "mag-dropcap whitespace-pre-line text-lg leading-relaxed text-foreground/85",
                quote && "mt-10",
              )}
            >
              {rest}
            </p>
          )}

          {/* What he does, from his own Facebook cover, as a numbered list. */}
          <ol className="mt-10 border-t border-foreground">
            {c.meet.pitch.map((line, i) => (
              <li
                key={line}
                className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-baseline border-b border-border py-4"
              >
                <span className="mag-figure text-xl text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[15px] leading-snug text-foreground">{line}</span>
              </li>
            ))}
          </ol>

          <Kicker className="mt-14">As seen on</Kicker>
          <ul className="mt-3 border-t border-foreground">
            {FEATURES.map((f) => (
              <li key={f.url} className="border-b border-border">
                <a
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group grid grid-cols-[6.5rem_minmax(0,1fr)_auto] items-center gap-4 py-4"
                >
                  <span className="block aspect-video overflow-hidden bg-[#3a2314]">
                    {f.image ? (
                      <img src={f.image} alt="" loading="lazy" className="size-full object-cover" />
                    ) : (
                      <span className="mag-serif grid size-full place-items-center px-2 text-center text-base leading-tight text-white">
                        {f.outlet}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="mag-kicker block text-[10px]">
                      {f.kind} · {f.outlet}
                    </span>
                    <span className="mag-serif mt-1 block text-2xl leading-tight text-foreground transition-colors group-hover:text-primary">
                      {f.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">{f.meta}</span>
                  </span>
                  <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-primary" />
                </a>
              </li>
            ))}
          </ul>

          <Kicker className="mt-14">Find Marj</Kicker>
          <ul className="mt-3 border-t border-foreground">
            {accounts.map((l) => (
              <li key={l.url} className="border-b border-border">
                <AccountRow link={l} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function AccountRow({ link }: { link: ProfileLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-4 py-3.5"
    >
      {link.platform === "web" ? (
        <Globe className="size-5 text-foreground/70" />
      ) : (
        <PlatformLogo platform={link.platform} mono className="size-5 text-foreground/70" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-tight transition-colors group-hover:text-primary">
          {link.name}
        </span>
        <span className="block text-xs text-muted-foreground">{link.handle}</span>
      </span>
      {link.stat && (
        <span className="mag-figure text-xl leading-none text-foreground">{link.stat}</span>
      )}
      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:text-primary" />
    </a>
  );
}
