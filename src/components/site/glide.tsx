/**
 * One highlight that glides between the items of a row — Malaya's search pill
 * (phase-one-prototype, components/public/search-pill.tsx, "the Airbnb
 * glide"). Clarence, 2026-10-25: "implement the same pill behavior too" on the
 * hero's inquiry pill, and the landing nav is a pill now as well.
 *
 * Mark each item `data-glide`; mark the one that should hold the highlight at
 * rest `data-active="true"` (the nav's current section). The highlight follows
 * the pointer, glides from item to item, and settles back on the active item
 * — or fades out — when the pointer leaves the row. It only glides once it is
 * showing: appearing from nothing it fades in where it is, as Airbnb's does.
 *
 * Items must not paint their own hover fill (it would double the highlight)
 * and sit above it via `relative`. No dividers: the highlight is the edge.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Quick off the mark, a long soft landing — Malaya's GLIDE. */
const GLIDE = "300ms cubic-bezier(0.2, 0.8, 0.2, 1)";

type Box = { left: number; top: number; width: number; height: number };

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function GlideRow({
  className,
  highlightClassName = "bg-secondary",
  activeKey,
  children,
}: {
  className?: string;
  /** The highlight's fill and rounding. */
  highlightClassName?: string;
  /** Changes when the resting item changes, so the highlight moves to it. */
  activeKey?: string | undefined;
  children: ReactNode;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [glide, setGlide] = useState(false);
  const showing = useRef(false);

  const place = useCallback((el: Element | null) => {
    if (!(el instanceof HTMLElement)) {
      showing.current = false;
      setBox(null);
      return;
    }
    setGlide(showing.current && !reducedMotion());
    showing.current = true;
    setBox({
      left: el.offsetLeft,
      top: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
    });
  }, []);

  const rest = useCallback(() => {
    place(rowRef.current?.querySelector('[data-glide][data-active="true"]') ?? null);
  }, [place]);

  useIsomorphicLayoutEffect(() => {
    rest();
    const row = rowRef.current;
    if (!row) return;
    const observer = new ResizeObserver(rest);
    observer.observe(row);
    return () => observer.disconnect();
  }, [activeKey, rest]);

  return (
    <div
      ref={rowRef}
      className={cn("relative isolate", className)}
      onPointerOver={(e) => {
        const item = (e.target as HTMLElement).closest("[data-glide]");
        if (item && rowRef.current?.contains(item)) place(item);
      }}
      onPointerLeave={rest}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-0 top-0 -z-10 rounded-full",
          highlightClassName,
        )}
        style={{
          width: box?.width ?? 0,
          height: box?.height ?? 0,
          transform: `translate(${box?.left ?? 0}px, ${box?.top ?? 0}px)`,
          opacity: box ? 1 : 0,
          transition: glide
            ? `transform ${GLIDE}, width ${GLIDE}, height ${GLIDE}, opacity 150ms`
            : "opacity 150ms",
        }}
      />
      {children}
    </div>
  );
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
