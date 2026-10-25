/**
 * The dashboard's furniture, shared so every admin page reads the same:
 * a page heading, stat cards, white panels with a title and an aside.
 */
import type { LucideIcon } from "@/components/icons";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="text-sm text-muted-foreground">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({
  icon: Icon,
  label,
  value,
  foot,
  footTone = "quiet",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  foot: string;
  footTone?: "up" | "down" | "alert" | "quiet";
}) {
  return (
    <Card className="border-0 bg-card shadow-level-1">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <p className="mt-2 font-display text-3xl font-semibold tabular-nums tracking-tight">
          {value}
        </p>
        <p
          className={cn(
            "mt-1 text-xs",
            footTone === "up" && "text-success",
            footTone === "alert" && "text-destructive",
            (footTone === "down" || footTone === "quiet") && "text-muted-foreground",
          )}
        >
          {foot}
        </p>
      </CardContent>
    </Card>
  );
}

export function Panel({
  title,
  aside,
  className,
  children,
}: {
  title: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={cn("border-0 bg-card shadow-level-1", className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <p className="font-semibold">{title}</p>
          {aside && <span className="text-xs text-muted-foreground">{aside}</span>}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>;
}

export const TODAY_LINE = () =>
  new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Manila",
  });
