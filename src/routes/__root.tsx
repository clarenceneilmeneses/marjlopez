import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";
import { NewPasswordDialog } from "@/components/site/auth-panel";
import { Toaster } from "@/components/ui/sonner";
import { TopProgress } from "@/components/top-progress";
import { AuthProvider } from "@/state/auth";
import { FiltersProvider } from "@/state/filters";
import { BRAND } from "@/lib/brand";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="brand-eyebrow text-xs text-muted-foreground">{BRAND.name}</p>
        <h1 className="mt-3 font-display text-7xl text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl text-foreground">This screen didn&apos;t load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try again.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              void router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retry
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: BRAND.name },
      { name: "theme-color", content: "#f5f4f2" },
      { title: `${BRAND.name} — Start, build and run your Airbnb` },
      { name: "description", content: BRAND.description },
      { property: "og:type", content: "website" },
      { property: "og:title", content: `${BRAND.name} — Start, build and run your Airbnb` },
      { property: "og:description", content: BRAND.description },
      { property: "og:image", content: "/brand/about-hero.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        // Outfit + Karla, on both sides since 2026-10-25 (styles.css, "the
        // public side = the admin"). Barqen, Montserrat and Clash are gone.
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400..700&family=Karla:ital,wght@0,300..800;1,300..800&display=swap",
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  // `data-site="public"` marks the guest side. Since 2026-10-25 it shares the
  // admin's faces and ground (styles.css); the flag is kept for the few rules
  // that still differ, like white pills on the page tint.
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isPublic = !pathname.startsWith("/admin");

  return (
    <html lang="en" data-site={isPublic ? "public" : undefined} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FiltersProvider>
          <TopProgress />
          <Outlet />
          <Toaster />
          <NewPasswordDialog />
        </FiltersProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
