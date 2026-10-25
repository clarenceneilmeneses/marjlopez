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
import { BRAND } from "@/lib/brand";
import { initial } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth";
import { useMine } from "@/state/data";
import { SignInDialog } from "./auth-panel";

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

          <nav className="brand-caps hidden items-center gap-10 text-[15px] text-primary md:flex">
            <Link
              to="/"
              hash="help"
              className="underline-offset-8 transition-opacity hover:opacity-70"
            >
              What I do
            </Link>
            <Link
              to="/"
              hash="how"
              className="underline-offset-8 transition-opacity hover:opacity-70"
            >
              How it works
            </Link>
            <Link
              to="/"
              hash="faq"
              className="underline-offset-8 transition-opacity hover:opacity-70"
            >
              FAQ
            </Link>
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
              { to: "/" as const, hash: "help", label: "What I do", icon: Home },
              { to: "/" as const, hash: "how", label: "How it works", icon: CircleHelp },
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

export function PublicFooter() {
  return (
    <footer className="relative border-t-2 border-primary pb-24 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Wordmark size="footer" />
          <p className="brand-caps mt-4 text-[15px] tracking-[0.14em] text-foreground">
            Start. Build. Run it right.
          </p>
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            {BRAND.description}
          </p>
        </div>
        <div>
          <p className="brand-caps text-[15px] text-primary">Work with me</p>
          <ul className="mt-4 space-y-3 text-sm font-medium">
            <li>
              <Link to="/inquire" search={{ type: "start" }} className="hover:text-primary">
                Start an Airbnb
              </Link>
            </li>
            <li>
              <Link to="/inquire" search={{ type: "build" }} className="hover:text-primary">
                Build my Airbnb
              </Link>
            </li>
            <li>
              <Link to="/inquire" search={{ type: "system" }} className="hover:text-primary">
                Get a booking system
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="brand-caps text-[15px] text-primary">Follow</p>
          <ul className="mt-4 space-y-3 text-sm font-medium">
            {BRAND.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" className="hover:text-primary">
                  {s.label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/privacy" className="hover:text-primary">
                Privacy notice
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-border/50 px-4 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
      </p>
    </footer>
  );
}
