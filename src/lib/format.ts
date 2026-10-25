/** Times read in Manila, 12-hour — Malaya's rule: never the browser's locale. */
const TZ = "Asia/Manila";

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60_000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d`;
  return shortDate(iso);
}

export function hoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3_600_000;
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    timeZone: TZ,
  });
}

export function dateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TZ,
  });
}

export function longDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-PH", {
    weekday: "short",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TZ,
  });
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TZ,
  });
}

export function firstName(name: string | null | undefined): string {
  return (name ?? "").trim().split(/\s+/)[0] ?? "";
}

export function initial(name: string | null | undefined): string {
  return (name ?? "").trim()[0]?.toUpperCase() ?? "?";
}

/** A Google Calendar "add event" link — no account or API needed. */
export function googleCalendarUrl(opts: {
  title: string;
  startsAt: string;
  minutes: number;
  details?: string;
  location?: string;
}): string {
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const start = new Date(opts.startsAt);
  const end = new Date(start.getTime() + opts.minutes * 60_000);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${fmt(start)}/${fmt(end)}`,
  });
  if (opts.details) p.set("details", opts.details);
  if (opts.location) p.set("location", opts.location);
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
