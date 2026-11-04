/**
 * The brand intro: the first thing a visitor sees, once per visit.
 *
 * Clarence, 2026-11-04: "add an onload animation like his brand transition
 * before the page loads so it has like a wow factor". The wordmark rises in
 * letter by letter on the hero's own espresso, a brown rule draws under it,
 * the tagline follows, then two curtains — espresso, then his brown — lift
 * away and the hero settles in behind them (`.intro-settle`, styles.css).
 *
 * It is pure CSS, rendered on the server, so it covers the page from the very
 * first paint, before any JavaScript has arrived. The inline script in the
 * head (`INTRO_SCRIPT`) runs before the body is drawn and switches it off
 * when it would get in the way:
 *   - it has already played in this tab (sessionStorage) — so moving between
 *     pages and coming back never replays it;
 *   - the page is inside Admin → Website's preview frame;
 *   - the visitor asked for reduced motion (that one is CSS, below).
 *
 * It also marks <html> with `motion` when motion is allowed, so the landing's
 * hero can stay hidden until GSAP animates it in (styles.css, motion.ts).
 */
import { BRAND } from "@/lib/brand";

const SEEN_KEY = "ml-intro-seen";

/** Runs in <head>, before the body paints. Kept tiny and dependency-free. */
export const INTRO_SCRIPT = `(function(){try{var d=document.documentElement;if(window.matchMedia("(prefers-reduced-motion: no-preference)").matches){d.classList.add("motion")}if(window.self!==window.top||sessionStorage.getItem("${SEEN_KEY}")){d.setAttribute("data-intro","skip")}else{sessionStorage.setItem("${SEEN_KEY}","1")}}catch(e){}})();`;

export function BrandIntro() {
  const letters = Array.from(BRAND.wordmark);
  return (
    <div className="brand-intro" aria-hidden="true">
      <div className="brand-intro__curtain brand-intro__curtain--brown" />
      <div className="brand-intro__curtain brand-intro__curtain--dark">
        <div className="brand-intro__mark">
          <span className="brand-intro__word">
            {letters.map((ch, i) => (
              <span
                key={i}
                className="brand-intro__letter"
                style={{ "--i": i } as React.CSSProperties}
              >
                {ch === " " ? " " : ch}
              </span>
            ))}
          </span>
          <span className="brand-intro__rule" />
          <span className="brand-intro__tagline">{BRAND.tagline}</span>
        </div>
      </div>
    </div>
  );
}
