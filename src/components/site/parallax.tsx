/**
 * A photo that drifts more slowly than the page — the About page's hero,
 * founders photo, area cards and closing banner (Clarence, 2026-10-22: "can u
 * add parallax scroll effect here").
 *
 * The frame clips; the photo inside is taller than the frame by `strength`
 * percent above and below, and slides through that slack as the frame crosses
 * the screen. `--parallax` runs -1 (frame entering at the bottom) to 1 (leaving
 * at the top), set from the scroll position on the next frame and written
 * straight to the DOM, so scrolling never re-renders anything — the same
 * pattern as the landing page's fold and the villa map's route.
 *
 * HOW STRONG, AND WHY NOT MORE. The first cut drifted 4–12% and read as no
 * effect at all; full-width bands with the photo pinned to the screen read
 * right but changed the design ("we messed with the design... i was just
 * hoping for the scrolling effect"). So the frames stay as designed and the
 * drift is as large as each photo allows: the slack comes from cropping the
 * sides, so the hero and banner take 25%, the area cards 18%, and the
 * founders 12% — beyond that the TEAM MALAYA sign or a founder leaves frame.
 *
 * The drift uses the `translate` property, not `transform`, so a hover zoom
 * (`scale`, as on the area cards) composes with it instead of replacing it.
 * Reduced motion gets a still photo.
 */
import { useEffect, useRef, type ImgHTMLAttributes } from "react";

/** Writes --parallax (-1 entering at the bottom … 1 leaving at the top) on the element. */
export function useParallaxVar<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;
      const p = (vh / 2 - (r.top + r.height / 2)) / ((vh + r.height) / 2);
      el.style.setProperty("--parallax", Math.min(1, Math.max(-1, p)).toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return ref;
}

export function ParallaxImage({
  frameClassName = "",
  className = "",
  strength = 8,
  style,
  alt,
  ...img
}: ImgHTMLAttributes<HTMLImageElement> & {
  /** Sizing, rounding, shadow and any mask: everything the frame is. */
  frameClassName?: string;
  /** How far the photo travels, in percent of the frame's height, each way. */
  strength?: number;
}) {
  const ref = useParallaxVar<HTMLDivElement>();
  const height = 100 + 2 * strength;
  // `translate` percentages are of the photo's own height, which is `height`%
  // of the frame — so this moves it `strength`% of the frame at the ends.
  const travel = ((strength / height) * 100).toFixed(3);
  const positioned = /\b(absolute|fixed|sticky)\b/.test(frameClassName);
  return (
    <div ref={ref} className={`${positioned ? "" : "relative "}overflow-hidden ${frameClassName}`}>
      <img
        {...img}
        alt={alt}
        className={`absolute inset-x-0 w-full max-w-none object-cover ${className}`}
        style={{
          top: `-${strength}%`,
          height: `${height}%`,
          translate: `0 calc(var(--parallax, 0) * ${travel}%)`,
          ...style,
        }}
      />
    </div>
  );
}
