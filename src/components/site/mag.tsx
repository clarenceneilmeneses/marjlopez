/**
 * The magazine kit: the landing and the coaching page, set like a clean
 * print magazine (Clarence, 2026-11-04: "this looks so vibecoded … make this
 * like a clean magazine"). What makes it read as print rather than an app:
 *
 *   - a serif for headlines (Instrument Serif), its second line in italic;
 *   - hairline rules in place of cards, shadows and pills;
 *   - square photos with a caption under them;
 *   - numbered sections ("No. 01"), headings set left, not centred;
 *   - small caps for every label, a drop cap where a story starts.
 *
 * Styles are in styles.css under "The magazine". Everything here uses the
 * theme's tokens, so it follows light and dark.
 */
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Small caps label: "No. 01", "Profile", "As seen on". */
export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("mag-kicker", className)}>{children}</p>;
}

/** A headline in the serif; `italic` is the second line, set in italic. */
export function Headline({
  as: Tag = "h2",
  children,
  italic,
  className,
}: {
  as?: "h1" | "h2" | "h3" | "p";
  children: ReactNode;
  italic?: ReactNode;
  className?: string;
}) {
  return (
    <Tag className={cn("mag-serif text-balance text-foreground", className)}>
      {children}
      {italic && (
        <>
          <br />
          <em className="mag-italic">{italic}</em>
        </>
      )}
    </Tag>
  );
}

/**
 * The top of a section: a rule across, the number and label on it, then the
 * headline on the left and (on a laptop) the lead set beside it on the right.
 */
export function SectionHead({
  no,
  label,
  title,
  italic,
  lead,
  aside,
  className,
}: {
  no: string;
  label: string;
  title: ReactNode;
  italic?: ReactNode;
  lead?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("border-t border-foreground pt-4", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <Kicker>
          <span className="text-foreground">No. {no}</span>
          <span className="mx-2 text-foreground/30">/</span>
          {label}
        </Kicker>
        {aside && <div className="mag-kicker hidden text-right sm:block">{aside}</div>}
      </div>
      <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-12 lg:items-end lg:gap-10">
        <Headline
          italic={italic}
          className="text-[2.6rem] leading-[0.98] sm:text-6xl lg:col-span-7 lg:text-[4.25rem]"
        >
          {title}
        </Headline>
        {lead && (
          <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground lg:col-span-4 lg:col-start-9 lg:pb-2">
            {lead}
          </p>
        )}
      </div>
    </header>
  );
}

/** A photo with its caption under it, square-cornered like a printed page. */
export function Figure({
  src,
  alt,
  caption,
  credit,
  position,
  className,
  imgClassName,
  eager = false,
}: {
  src: string;
  alt: string;
  caption?: ReactNode;
  credit?: ReactNode;
  position?: string | undefined;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}) {
  return (
    <figure className={className}>
      <div className="overflow-hidden bg-secondary">
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          style={position ? { objectPosition: position } : undefined}
          className={cn("w-full object-cover", imgClassName)}
        />
      </div>
      {(caption || credit) && (
        <figcaption className="mt-3 flex items-baseline justify-between gap-4 border-t border-border pt-2.5 text-[13px] leading-snug text-muted-foreground">
          <span>{caption}</span>
          {credit && <span className="mag-kicker shrink-0 text-[10px]">{credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}

/** The one button: a flat ink block, small caps — not a pill. */
export const magButton = (tone: "ink" | "paper" | "line" = "ink") =>
  cn(
    "mag-button group inline-flex h-12 items-center justify-center gap-3 px-6 transition",
    tone === "ink" && "bg-foreground text-background hover:bg-primary",
    tone === "paper" && "bg-background text-foreground hover:bg-primary hover:text-white",
    tone === "line" &&
      "border border-foreground text-foreground hover:bg-foreground hover:text-background",
  );

/** A pull quote: large italic serif, hung on a rule. */
export function PullQuote({
  children,
  by,
  className,
}: {
  children: ReactNode;
  by?: ReactNode;
  className?: string;
}) {
  return (
    <blockquote className={cn("border-l border-primary pl-6 sm:pl-8", className)}>
      <p className="mag-serif mag-italic text-3xl leading-[1.12] text-foreground sm:text-4xl">
        {children}
      </p>
      {by && <footer className="mag-kicker mt-4">{by}</footer>}
    </blockquote>
  );
}
