/**
 * The team's side. Malaya's AppShell, cut down to this product: a floating
 * rounded sidebar — plain white (Clarence, 2026-10-25) — beside a content
 * card on a laptop, the page-coloured top bar with the bell and you, and the
 * nav pill at the bottom of a phone.
 */
import { Link, Navigate, useRouterState } from "@tanstack/react-router";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  MessagesSquare,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  type LucideIcon,
} from "@/components/icons";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { InlineLoading } from "@/components/loading";
import {
  NAV_PILL,
  NavPillBadge,
  navPillDock,
  navPillTab,
  useNavPillIsAway,
  useTyping,
} from "@/components/nav-pill";
import { Badge } from "@/components/ui/badge";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BRAND } from "@/lib/brand";
import { initial } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/state/auth";
import { useInbox } from "@/state/data";
import { NotificationBell } from "./notifications";

const SIDEBAR_KEY = "marj:sidebar-collapsed";

const TOP_PILL =
  "flex items-center gap-0.5 rounded-full border border-border/70 bg-card p-0.5 shadow-level-2";

type NavTo = "/admin" | "/admin/inbox" | "/admin/quick-replies" | "/admin/team";

const NAV: { to: NavTo; label: string; short: string; icon: LucideIcon; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", short: "Home", icon: LayoutDashboard, exact: true },
  { to: "/admin/inbox", label: "Inbox", short: "Inbox", icon: MessagesSquare },
  { to: "/admin/quick-replies", label: "Quick replies", short: "Replies", icon: MessageSquareText },
  { to: "/admin/team", label: "Team", short: "Team", icon: Users },
];

function Wordmark({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="site-display text-lg tracking-[0.12em] text-primary" aria-hidden>
        M
      </p>
    );
  }
  return (
    <div className="leading-tight">
      <p className="font-display text-[15px] tracking-[0.18em] text-primary">{BRAND.wordmark}</p>
      <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Inquiry Inbox</p>
    </div>
  );
}

function useUnreadCount() {
  const { staff } = useAuth();
  const inbox = useInbox(Boolean(staff));
  return inbox.data?.conversations.filter((c) => c.unread && !c.archived).length ?? 0;
}

function NavList({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const unread = useUnreadCount();
  const item =
    "group flex items-center rounded-full text-[15px] text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:font-medium data-[status=active]:text-primary";
  return (
    <nav
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pb-6 no-scrollbar",
        collapsed ? "px-2" : "px-3",
      )}
    >
      {!collapsed && (
        <p className="px-3 pb-1.5 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground/80">
          WORK
        </p>
      )}
      {NAV.map((n) => {
        const Icon = n.icon;
        const badge = n.to === "/admin/inbox" ? unread : 0;
        const link = (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            activeOptions={{ exact: Boolean(n.exact) }}
            aria-label={collapsed ? n.label : undefined}
            className={cn(item, collapsed ? "mx-auto size-10 justify-center" : "gap-3 px-3 py-2.5")}
          >
            <span className="relative shrink-0">
              <Icon className="size-[18px] opacity-80 group-data-[status=active]:opacity-100" />
              {collapsed && badge > 0 && (
                <span className="absolute -right-1 -top-1 size-2 rounded-full bg-primary ring-2 ring-card" />
              )}
            </span>
            {!collapsed && (
              <>
                <span className="truncate">{n.label}</span>
                {badge > 0 && (
                  <span className="ml-auto shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </>
            )}
          </Link>
        );
        return collapsed ? (
          <Tooltip key={n.to}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{n.label}</TooltipContent>
          </Tooltip>
        ) : (
          link
        );
      })}
      {!collapsed && (
        <>
          <p className="mt-5 px-3 pb-1.5 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground/80">
            PUBLIC SITE
          </p>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-full px-3 py-2.5 text-[15px] text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ExternalLink className="size-[18px] opacity-80" />
            View the site
          </a>
        </>
      )}
    </nav>
  );
}

function AccountMenu({ align = "end" }: { align?: "start" | "end" }) {
  const { staff, session, signOut } = useAuth();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-11 overflow-hidden rounded-full border-2 border-card p-0 shadow-level-2 lg:size-10"
          aria-label="Account menu"
        >
          <span className="grid size-full place-items-center bg-secondary font-display text-base font-semibold text-primary">
            {initial(staff?.name ?? session?.user.email)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        collisionPadding={12}
        className="w-[calc(100vw-1.5rem)] sm:w-60"
      >
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium text-foreground">
            {staff?.name ?? "Signed in"}
          </p>
          <p className="truncate text-xs text-muted-foreground">{session?.user.email}</p>
          {staff && (
            <Badge variant="outline" className="mt-2 border-primary/30 capitalize text-primary">
              {staff.role}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => void signOut()}>
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileNavPill({ onMore }: { onMore: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const typing = useTyping();
  const away = useNavPillIsAway();
  const unread = useUnreadCount();
  const hidden = typing || away;
  const isActive = (n: (typeof NAV)[number]) =>
    n.exact ? pathname === n.to || pathname === `${n.to}/` : pathname.startsWith(n.to);
  return (
    <div aria-hidden={hidden || undefined} className={cn(navPillDock(hidden), "lg:hidden")}>
      <nav aria-label="Main sections" className={NAV_PILL}>
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = isActive(n);
          return (
            <Link
              key={n.to}
              to={n.to}
              aria-current={active ? "page" : undefined}
              className={navPillTab(active)}
            >
              <span className="relative">
                <Icon className="size-[22px]" strokeWidth={active ? 2.2 : 1.8} aria-hidden />
                <NavPillBadge count={n.to === "/admin/inbox" ? unread : 0} />
              </span>
              <span className="max-w-full truncate px-1">{n.short}</span>
            </Link>
          );
        })}
        <button type="button" onClick={onMore} className={navPillTab(false)}>
          <MoreHorizontal className="size-[22px]" strokeWidth={1.8} aria-hidden />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}

function AppShellInner({
  children,
  fullBleed,
  title,
  toolbar,
}: {
  children: ReactNode;
  fullBleed: boolean;
  title: string;
  toolbar?: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_KEY) === "1");
    } catch {
      /* private mode — keep the default */
    }
  }, []);

  const toggleSidebar = () =>
    setCollapsed((v) => {
      try {
        localStorage.setItem(SIDEBAR_KEY, v ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !v;
    });

  const sidebar = useMemo(
    () => (
      <aside
        className={cn(
          "fixed inset-y-3 left-3 z-40 hidden flex-col overflow-hidden rounded-2xl bg-card shadow-level-2 transition-[width] duration-200 lg:flex",
          collapsed ? "w-[64px]" : "w-[248px]",
        )}
      >
        <div
          className={cn(
            "flex",
            collapsed
              ? "flex-col items-center gap-1 px-0 pb-3 pt-4"
              : "items-center justify-between px-5 pb-5 pt-6",
          )}
        >
          <Wordmark compact={collapsed} />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="size-8 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>
        <NavList collapsed={collapsed} />
      </aside>
    ),
    [collapsed],
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-surface-muted [--mobile-nav-space:calc(5.75rem+env(safe-area-inset-bottom))] dark:bg-background lg:[--mobile-nav-space:0px]">
        {sidebar}
        <div
          className={cn(
            "transition-[padding] duration-200 lg:py-3 lg:pr-3",
            collapsed ? "lg:pl-[88px]" : "lg:pl-[272px]",
          )}
        >
          <div className="relative flex min-h-screen flex-col lg:h-[calc(100vh-1.5rem)] lg:min-h-0 lg:overflow-hidden lg:rounded-2xl lg:bg-card lg:shadow-level-2">
            <header className="sticky top-0 z-30 bg-surface-muted/85 backdrop-blur-xl lg:static lg:bg-card/85">
              <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:py-2">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetContent side="left" className="flex w-[272px] flex-col gap-0 bg-card p-0">
                    <SheetTitle className="sr-only">Navigation</SheetTitle>
                    <div className="shrink-0 px-5 pb-5 pt-6">
                      <Wordmark />
                    </div>
                    <NavList onNavigate={() => setMobileOpen(false)} />
                  </SheetContent>
                </Sheet>
                <div className="lg:hidden">
                  <AccountMenu align="start" />
                </div>
                <div className="hidden min-w-0 flex-1 items-center gap-4 lg:flex">
                  <p className="shrink-0 text-sm font-medium text-foreground">{title}</p>
                  {toolbar && <div className="min-w-0">{toolbar}</div>}
                </div>
                <div className="ml-auto flex items-center gap-2.5">
                  <LiveClock className="mr-1 hidden lg:block" />
                  <div className={TOP_PILL}>
                    <span className="px-3 text-xs font-medium text-foreground lg:hidden">
                      {title}
                    </span>
                    <NotificationBell />
                  </div>
                  <div className="hidden lg:block">
                    <AccountMenu />
                  </div>
                </div>
              </div>
            </header>
            <main className="relative min-h-0 flex-1 lg:overflow-y-auto">
              <div
                className={cn(
                  fullBleed
                    ? "w-full px-3 pb-[calc(var(--mobile-nav-space)+0.75rem)] pt-3 sm:px-4 lg:flex lg:h-full lg:flex-col lg:pb-3"
                    : "mx-auto w-full max-w-[1200px] px-4 pb-[calc(var(--mobile-nav-space)+1.5rem)] pt-4 sm:px-6 sm:pt-6 lg:pb-8",
                )}
              >
                {children}
              </div>
            </main>
          </div>
        </div>
        <MobileNavPill onMore={() => setMobileOpen(true)} />
      </div>
    </TooltipProvider>
  );
}

/** Manila time and date, ticking — set after mount so the server and browser agree. */
function LiveClock({ className }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(t);
  }, []);
  if (!now) return null;
  const opts = { timeZone: "Asia/Manila" } as const;
  return (
    <span className={cn("whitespace-nowrap text-xs leading-tight", className)}>
      <span className="font-semibold tabular-nums text-foreground">
        {now.toLocaleTimeString("en-PH", { ...opts, hour: "numeric", minute: "2-digit" })}
      </span>
      <span className="text-muted-foreground">
        {" · "}
        {now.toLocaleDateString("en-PH", {
          ...opts,
          weekday: "short",
          month: "short",
          day: "numeric",
        })}
      </span>
    </span>
  );
}

/** Staff only, by construction: the gate is inside the shell, so no route can forget it. */
export function AppShell({
  children,
  fullBleed = false,
  title,
  toolbar,
}: {
  children: ReactNode;
  fullBleed?: boolean;
  title: string;
  /** Page-specific bits for the top bar on a laptop, beside the title. */
  toolbar?: ReactNode;
}) {
  const { session, ready, staff, roleReady } = useAuth();
  if (!ready || (session && !roleReady)) {
    return (
      <div className="grid min-h-screen place-items-center bg-surface-muted">
        <InlineLoading />
      </div>
    );
  }
  if (!session || !staff) return <Navigate to="/admin/login" />;
  return (
    <AppShellInner fullBleed={fullBleed} title={title} toolbar={toolbar}>
      {children}
    </AppShellInner>
  );
}
