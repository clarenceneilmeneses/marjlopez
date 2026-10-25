/**
 * The two shapes of "on its way", for anywhere a bare "Loading…" line used to
 * sit on an empty page and read as frozen (Clarence, 2026-10-01). The admin's
 * full-page version is `LoadingState` in obs/states.tsx; these are for the
 * guest site, dialogs and panels.
 */
import { Loader2 } from "@/components/icons";

import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

/** A spinner and what it is waiting for — for a panel or a dialog. */
export function InlineLoading({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <p
      className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}
      aria-busy="true"
      aria-live="polite"
    >
      <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
      {label}
    </p>
  );
}

/** Shimmering cards where a list of cards is about to appear. */
export function CardsLoading({
  count = 3,
  label,
  className,
}: {
  count?: number;
  /** Read out to screen readers, and shown small above the cards. */
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)} aria-busy="true" aria-live="polite">
      {label && <InlineLoading label={label} className="text-xs" />}
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 rounded-2xl border border-border/60 p-4">
          <Skeleton className="size-20 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2 py-1">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
