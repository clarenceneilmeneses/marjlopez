/**
 * The public site's frame — Malaya's guest chrome (components/public/chrome.tsx
 * and bottom-nav.tsx there), in the admin's type since 2026-10-25: a white bar on a laptop,
 * and on a phone the floating nav pill at the bottom with "More".
 */
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  CircleHelp,
  FileText,
  Home,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Send,
  User,
} from "@/components/icons";
import { useEffect, useState } from "react";

import { NAV_PILL, NavPillBadge, navPillDock, navPillTab, useTyping } from "@/components/nav-pill";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { BRAND, FACEBOOK, LINKS } from "@/lib/brand";
import { MALAYA_SITE } from "@/lib/villas";
import { PlatformLogo, type Platform } from "./logos";
import { GlideRow } from "./glide";
import { ParallaxImage } from "./parallax";
import { initial } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth";
import { useMine } from "@/state/data";
import { SignInDialog } from "./auth-panel";

/** The landing page's sections, for the header and the phone menu. */
const SECTIONS = [
  { hash: "villas", label: "Villas" },
  { hash: "built", label: "Builds" },
  { hash: "about", label: "Meet Marj" },
  { hash: "reviews", label: "Reviews" },
];

export function Wordmark({ size = "header" }: { size?: "header" | "footer" }) {
  const big = size === "header";
  return (
    <span className="inline-block leading-none">
      <span
        className={cn(
          "block font-display font-normal text-primary",
          big ? "text-[1.55rem] tracking-[0.2em]" : "text-[1.4rem] tracking-[0.22em]",
        )}
      >
        {BRAND.wordmark}
      </span>
      <span
        className={cn(
          "mt-1 block text-center font-medium uppercase text-primary",
          big
            ? "pl-[0.3em] text-[8px] tracking-[0.3em]"
            : "pl-[0.32em] text-[8px] tracking-[0.32em]",
        )}
      >
        {BRAND.tagline}
      </span>
    </span>
  );
}

/** Whether the team has written since the client last looked. */
export function useClientUnread(): boolean {
  const { session, staff } = useAuth();
  const mine = useMine(Boolean(session) && !staff);
  const c = mine.data?.conversation;
  if (!c) return false;
  return (
    !c.waiting_since && Date.parse(c.last_activity) > Date.parse(c.client_seen_at ?? "1970-01-01")
  );
}

function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 8) return;
      setHidden(y > last && y > 120);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return hidden;
}

/**
 * The admin's top-bar pill (components/admin/app-shell.tsx, TOP_PILL): white,
 * a hairline edge, a soft shadow, round items inside.
 */
const TOP_PILL =
  "flex items-center gap-0.5 rounded-full border border-border/70 bg-card p-0.5 shadow-level-2";

/**
 * The section in the middle of the screen, for the nav pill's resting
 * highlight. Only on the landing page, where the sections are.
 */
function useActiveSection(enabled: boolean): string | undefined {
  const [active, setActive] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!enabled) {
      setActive(undefined);
      return;
    }
    const els = SECTIONS.map((s) => document.getElementById(s.hash)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
        // Above the first section (the hero) nothing is current.
        if (window.scrollY < (els[0]?.offsetTop ?? 0) - window.innerHeight / 2) {
          setActive(undefined);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);
  return active;
}

/**
 * The header in the admin's top-bar language (Clarence, 2026-10-25: "implement
 * the admin nav topbar principles on the landing page nav as well. we'll make
 * it pill too"): the section links in one white pill with the inquiry pill's
 * glide, resting on the section in view; Sign in and Work with me in a second
 * pill on the right; the avatar a separate circle, as on the admin.
 */
export function PublicHeader() {
  const { session, staff, signOut } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);
  const unread = useClientUnread();
  const hidden = useHideOnScroll();
  const signedIn = Boolean(session);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = useActiveSection(pathname === "/");

  return (
    <>
      <PublicBottomNav />
      <header
        className={cn(
          "sticky top-0 z-30 bg-background/80 backdrop-blur-md transition-transform duration-300",
          hidden && "-translate-y-full",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <Link to="/" aria-label={`${BRAND.name} home`} className="shrink-0">
            <Wordmark />
          </Link>

          <nav aria-label="Sections" className="hidden md:block">
            <GlideRow activeKey={active} className={TOP_PILL}>
              {SECTIONS.map((sec) => (
                <Link
                  key={sec.hash}
                  to="/"
                  hash={sec.hash}
                  data-glide
                  data-active={active === sec.hash}
                  className="relative rounded-full px-4 py-2 text-sm text-foreground/70 transition-colors hover:text-foreground data-[active=true]:font-medium data-[active=true]:text-primary"
                >
                  {sec.label}
                </Link>
              ))}
            </GlideRow>
          </nav>

          <div className="flex shrink-0 items-center gap-2.5">
            {/* On a phone only a client's Messages button is in it. */}
            <div className={cn(TOP_PILL, !(signedIn && !staff) && "max-md:hidden")}>
              {signedIn && !staff && (
                <Link
                  to="/messages"
                  className="relative grid size-9 place-items-center rounded-full text-foreground/75 transition-colors hover:bg-secondary hover:text-primary"
                  aria-label="Messages"
                >
                  <MessageCircle className="size-[18px]" />
                  {unread && (
                    <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-card" />
                  )}
                </Link>
              )}
              {!signedIn && (
                <button
                  type="button"
                  onClick={() => setSignInOpen(true)}
                  className="h-9 rounded-full px-4 text-sm text-foreground/75 transition-colors hover:bg-secondary hover:text-foreground"
                >
                  Sign in
                </button>
              )}
              <Link
                to="/inquire"
                className="brand-caps hidden h-9 items-center rounded-full bg-primary px-5 text-sm text-primary-foreground transition hover:bg-primary/90 md:inline-flex"
              >
                Work with me
              </Link>
            </div>
            {signedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Account"
                    className="grid size-10 place-items-center rounded-full border-2 border-card bg-secondary font-display text-base text-primary shadow-level-2"
                  >
                    {initial(session?.user.email)}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
                    {session?.user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {staff ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/inbox">Open the team inbox</Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link to="/messages">My messages</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem variant="destructive" onSelect={() => void signOut()}>
                    <LogOut className="mr-2 size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // A phone has no room for the pills: one Sign in button.
              <Button
                size="sm"
                className="brand-caps h-10 rounded-full px-5 text-sm md:hidden"
                onClick={() => setSignInOpen(true)}
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      </header>
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
    </>
  );
}

function PublicBottomNav() {
  const { session, staff } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const typing = useTyping();
  const scrolledAway = useHideOnScroll();
  const unread = useClientUnread();
  const [moreOpen, setMoreOpen] = useState(false);
  const hidden = typing || scrolledAway;
  const client = Boolean(session) && !staff;

  const tabs: {
    to: "/" | "/inquire" | "/messages";
    hash?: string;
    label: string;
    icon: typeof Home;
    active: boolean;
    badge?: number;
  }[] = [
    { to: "/", label: "Home", icon: Home, active: pathname === "/" },
    {
      to: "/inquire",
      label: "Inquire",
      icon: Send,
      active: pathname.startsWith("/inquire"),
    },
    ...(client
      ? [
          {
            to: "/messages" as const,
            label: "Messages",
            icon: MessageCircle,
            active: pathname.startsWith("/messages"),
            badge: unread ? 1 : 0,
          },
        ]
      : []),
    // Clarence, 2026-10-25: one more tab before More. The villas are the
    // proof the whole page leans on, so they get the slot (and leave More).
    { to: "/", hash: "villas", label: "Villas", icon: Building2, active: false },
  ];

  return (
    <>
      <div
        inert={hidden}
        className={cn("pointer-events-none justify-center", navPillDock(hidden), "md:hidden")}
      >
        <nav aria-label="Site" className={cn(NAV_PILL, "pointer-events-auto max-w-md")}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.label}
                to={tab.to}
                {...(tab.hash ? { hash: tab.hash } : {})}
                aria-current={tab.active ? "page" : undefined}
                className={navPillTab(tab.active)}
              >
                <span className="relative">
                  <Icon className="size-[22px]" strokeWidth={tab.active ? 2.2 : 1.8} />
                  {tab.badge ? (
                    <span className="absolute -right-1 -top-0.5 size-2 rounded-full bg-destructive" />
                  ) : null}
                  <NavPillBadge count={0} />
                </span>
                <span className="max-w-full truncate px-1">{tab.label}</span>
              </Link>
            );
          })}
          <button type="button" onClick={() => setMoreOpen(true)} className={navPillTab(false)}>
            <MoreHorizontal className="size-[22px]" strokeWidth={1.8} />
            <span>More</span>
          </button>
        </nav>
      </div>
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="left" className="flex w-[272px] flex-col gap-0 bg-card p-0 md:hidden">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="px-5 pb-5 pt-6">
            <Wordmark />
          </div>
          <nav className="flex flex-col gap-1 px-3">
            {[
              { to: "/" as const, hash: "about", label: "About Marj", icon: User },
              { to: "/" as const, hash: "reviews", label: "Guest reviews", icon: CircleHelp },
              { to: "/privacy" as const, hash: undefined, label: "Privacy", icon: FileText },
            ].map((l) => (
              <Link
                key={l.label}
                to={l.to}
                {...(l.hash ? { hash: l.hash } : {})}
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-full px-3 py-2.5 text-[15px] text-foreground/80 hover:bg-secondary"
              >
                <l.icon className="size-[18px]" /> {l.label}
              </Link>
            ))}
            {staff && (
              <Link
                to="/admin/inbox"
                className="flex items-center gap-3 rounded-full px-3 py-2.5 text-[15px] text-foreground/80 hover:bg-secondary"
              >
                <User className="size-[18px]" /> Team inbox
              </Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}

/**
 * The footer opens on Marj and Team Malaya under their sign (Clarence,
 * 2026-10-25, in place of the giant MARJUN on a brown band). The photo
 * straddles the page and the white footer, the way the hero's inquiry pill
 * straddles the hero, and drifts like the other photos. On a phone it crops
 * to 4:3 from the left, so both people stay in frame and the sign gives way.
 */
export function PublicFooter() {
  const col = "text-[11px] font-bold uppercase tracking-[0.16em] text-primary";
  const link = "text-sm text-foreground/80 transition-colors hover:text-primary";
  return (
    <footer className="mt-10">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-10">
        <ParallaxImage
          src="/brand/about-team.webp"
          alt="Marj Lopez with Team Malaya"
          loading="lazy"
          strength={4}
          frameClassName="aspect-[4/3] rounded-3xl shadow-level-3 sm:aspect-[1672/772]"
          // The drift's slack crops the sides. Take it from the left on a
          // laptop, so the TEAM MALAYA sign on the right stays whole.
          className="object-[25%_center] sm:object-right"
        />
      </div>
      <div className="-mt-20 bg-card pb-28 pt-20 sm:-mt-32 sm:pt-32 md:pb-0">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
          <div>
            <p className="site-display text-3xl text-foreground">
              Start. Build.
              <br />
              Earn.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              {BRAND.name} · {FACEBOOK.intro}
            </p>
            <a
              href={`mailto:${FACEBOOK.email}`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {FACEBOOK.email}
            </a>
            <div className="mt-6">
              <Link
                to="/inquire"
                className="brand-caps inline-flex h-11 items-center rounded-full bg-primary px-6 text-[15px] text-primary-foreground transition hover:bg-primary/90"
              >
                Work with me
              </Link>
            </div>
          </div>
          <FooterCol title="Work with me" titleClass={col}>
            <Link to="/inquire" search={{ type: "start", step: 2 }} className={link}>
              Start an Airbnb
            </Link>
            <Link to="/inquire" search={{ type: "build", step: 2 }} className={link}>
              Build my Airbnb
            </Link>
            <Link to="/inquire" search={{ type: "system", step: 2 }} className={link}>
              Booking system
            </Link>
            <Link to="/inquire" search={{ type: "other", step: 2 }} className={link}>
              Partnerships
            </Link>
          </FooterCol>
          <FooterCol title="Explore" titleClass={col}>
            <Link to="/" hash="villas" className={link}>
              The villas
            </Link>
            <Link to="/" hash="about" className={link}>
              Meet Marj
            </Link>
            <Link to="/" hash="reviews" className={link}>
              Guest reviews
            </Link>
            <a href={MALAYA_SITE} target="_blank" rel="noreferrer" className={link}>
              Book a stay
            </a>
          </FooterCol>
          <FooterCol title="Help" titleClass={col}>
            <Link to="/messages" className={link}>
              My messages
            </Link>
            <Link to="/privacy" className={link}>
              Privacy notice
            </Link>
            <Link to="/admin/login" className={link}>
              Team sign in
            </Link>
          </FooterCol>
          <div>
            <p className={col}>Social</p>
            <div className="mt-4 flex gap-2">
              {LINKS.filter((l) => l.kind === "personal").map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${l.name} on ${l.platform}`}
                  className="grid size-10 place-items-center rounded-full bg-secondary text-primary transition hover:bg-primary hover:text-primary-foreground"
                >
                  <PlatformLogo platform={l.platform as Platform} mono className="size-[18px]" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-border/70 px-6 py-6 text-xs text-primary sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <a href={MALAYA_SITE} target="_blank" rel="noreferrer" className="hover:underline">
            malayavillas.com
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  titleClass,
  children,
}: {
  title: string;
  titleClass: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className={titleClass}>{title}</p>
      <div className="mt-4 flex flex-col gap-2.5">{children}</div>
    </div>
  );
}
