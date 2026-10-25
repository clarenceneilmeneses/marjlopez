/**
 * The public site's frame — Malaya's guest chrome (components/public/chrome.tsx
 * and bottom-nav.tsx there): Barqen caps in brown, a white bar on a laptop,
 * and on a phone the floating nav pill at the bottom with "More".
 */
import { Link, useRouterState } from "@tanstack/react-router";
import {
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
import { BRAND, INSTAGRAM, LINKS } from "@/lib/brand";
import { MALAYA_SITE } from "@/lib/villas";
import { PlatformLogo, type Platform } from "./logos";
import { initial } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth";
import { useMine } from "@/state/data";
import { SignInDialog } from "./auth-panel";

/** The landing page's sections, for the header and the phone menu. */
const SECTIONS = [
  { hash: "about", label: "About" },
  { hash: "villas", label: "Villas" },
  { hash: "reviews", label: "Reviews" },
  { hash: "faq", label: "FAQ" },
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

export function PublicHeader() {
  const { session, staff, signOut } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);
  const unread = useClientUnread();
  const hidden = useHideOnScroll();
  const signedIn = Boolean(session);

  return (
    <>
      <PublicBottomNav />
      <header
        className={cn(
          "sticky top-0 z-30 transition-transform duration-300 md:border-b md:border-border/40 md:bg-card/95 md:backdrop-blur",
          hidden && "-translate-y-full",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-8 md:py-4">
          <Link to="/" aria-label={`${BRAND.name} home`}>
            <Wordmark />
          </Link>

          <nav className="brand-caps hidden items-center gap-8 text-[15px] text-primary lg:gap-10 md:flex">
            {SECTIONS.map((sec) => (
              <Link
                key={sec.hash}
                to="/"
                hash={sec.hash}
                className="underline-offset-8 transition-opacity hover:opacity-70"
              >
                {sec.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {signedIn && !staff && (
              <Link
                to="/messages"
                className="relative hidden size-10 place-items-center rounded-full border border-border/70 bg-card text-foreground/75 shadow-level-2 transition hover:text-primary md:grid"
                aria-label="Messages"
              >
                <MessageCircle className="size-[18px]" />
                {unread && (
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
                )}
              </Link>
            )}
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
              <button
                type="button"
                onClick={() => setSignInOpen(true)}
                className="brand-caps hidden text-[15px] text-primary hover:opacity-70 md:inline"
              >
                Sign in
              </button>
            )}
            <Button
              asChild
              size="sm"
              className="brand-caps hidden h-10 rounded-full px-6 text-[15px] md:inline-flex"
            >
              <Link to="/inquire">Work with me</Link>
            </Button>
            {!signedIn && (
              <Button
                size="sm"
                className="brand-caps h-10 rounded-full px-5 text-[15px] md:hidden"
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

  const tabs = [
    { to: "/" as const, label: "Home", icon: Home, active: pathname === "/" },
    {
      to: "/inquire" as const,
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
                key={tab.to}
                to={tab.to}
                aria-current={tab.active ? "page" : undefined}
                className={navPillTab(tab.active)}
              >
                <span className="relative">
                  <Icon className="size-[22px]" strokeWidth={tab.active ? 2.2 : 1.8} />
                  {"badge" in tab && tab.badge ? (
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
              { to: "/" as const, hash: "villas", label: "The villas", icon: Home },
              { to: "/" as const, hash: "reviews", label: "Guest reviews", icon: CircleHelp },
              { to: "/" as const, hash: "faq", label: "FAQ", icon: CircleHelp },
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
 * The hero footer — Malaya's footer draft "01 — Hero": one dark, rounded
 * photo card at the foot of every page, the wordmark and a last call to act
 * above the columns, so the page ends on a villa rather than on a list of links.
 */
export function PublicFooter() {
  const col = "text-[11px] font-bold uppercase tracking-[0.16em] text-white/90";
  const link = "text-sm text-white/75 transition-colors hover:text-white";
  return (
    <footer className="px-3 pb-28 pt-6 sm:px-6 md:pb-6">
      <div
        className="relative overflow-hidden rounded-[2rem] bg-[#2a1a0e] bg-cover bg-center text-white shadow-level-3"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgb(32 20 10 / 0.72) 0%, rgb(32 20 10 / 0.86) 55%, rgb(32 20 10 / 0.96) 100%), url(/villas/pr-casa-martha/4.webp)",
        }}
      >
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-16 text-center sm:px-10 md:pt-20">
          <span className="inline-block leading-none">
            <span className="block font-display text-4xl tracking-[0.12em] text-white sm:text-5xl">
              {BRAND.wordmark}
            </span>
            <span className="mt-1.5 block text-[10px] font-medium uppercase tracking-[0.3em] text-white/80">
              {BRAND.tagline}
            </span>
          </span>
          <h2 className="site-display mx-auto mt-8 max-w-3xl text-4xl leading-[1.05] text-white sm:text-6xl">
            Your Airbnb starts here.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] text-white/80 sm:text-base">
            Start one, build one, or run yours on the system behind Malaya Villas. Tell us what you
            need — it takes about a minute.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/inquire"
              className="brand-caps inline-flex h-12 items-center rounded-full bg-[#f6efe4] px-7 text-[15px] text-[#3c2411] transition hover:bg-white"
            >
              Work with me
            </Link>
            <Link
              to="/"
              hash="villas"
              className="brand-caps inline-flex h-12 items-center rounded-full border border-white/50 px-7 text-[15px] text-white transition hover:bg-white/10"
            >
              See the villas
            </Link>
          </div>
        </div>

        <div className="mx-6 border-t border-white/15 sm:mx-10" />

        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 text-left sm:grid-cols-2 sm:px-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="space-y-1.5">
            <p className={col}>{BRAND.name}</p>
            <p className="text-sm text-white/75">{BRAND.tagline}</p>
            <p className="text-sm text-white/75">{BRAND.base}</p>
            <a href={INSTAGRAM.url} target="_blank" rel="noreferrer" className={cn(link, "block")}>
              @{INSTAGRAM.handle} · {INSTAGRAM.followers} followers
            </a>
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
              Collabs & media
            </Link>
          </FooterCol>
          <FooterCol title="Explore" titleClass={col}>
            <Link to="/" hash="villas" className={link}>
              The villas
            </Link>
            <Link to="/" hash="about" className={link}>
              About Marj
            </Link>
            <Link to="/" hash="reviews" className={link}>
              Guest reviews
            </Link>
            <Link to="/" hash="faq" className={link}>
              FAQ
            </Link>
          </FooterCol>
          <FooterCol title="Help" titleClass={col}>
            <Link to="/messages" className={link}>
              My messages
            </Link>
            <a href={MALAYA_SITE} target="_blank" rel="noreferrer" className={link}>
              Book a stay
            </a>
            <Link to="/privacy" className={link}>
              Privacy notice
            </Link>
          </FooterCol>
          <div>
            <p className={col}>Social</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {LINKS.filter((l) => l.kind === "personal" && l.platform !== "web").map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${l.name} on ${l.platform}`}
                  className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <PlatformLogo platform={l.platform as Platform} mono className="size-[18px]" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/15 px-6 py-5 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <p>Start. Build. Run it right.</p>
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
