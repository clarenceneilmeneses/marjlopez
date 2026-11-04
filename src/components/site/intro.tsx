/**
 * The preloader: the first thing a visitor sees, once per visit.
 *
 * Clarence, 2026-11-04: "an onload animation … so it has like a wow
 * factor". A small frame on the beige, villa photos flicking up through it
 * while a big counter runs to 100; then the frame grows to the whole screen
 * on the last photo, the hero's own, so it hands straight over to the page.
 * (The earlier headline-with-a-photo-in-it version was "awful".)
 *
 * It is pure CSS, rendered on the server, so it covers the page from the very
 * first paint, before any JavaScript has arrived (the counter counts with
 * an animated CSS property). The inline script in the head (`INTRO_SCRIPT`)
 * runs before the body is drawn and switches it off when it would get in the
 * way:
 *   - it has already played in this tab (sessionStorage), so moving between
 *     pages and coming back never replays it;
 *   - the page is inside Admin → Website's preview frame;
 *   - the visitor asked for reduced motion (that one is CSS).
 *
 * It also marks <html> with `motion` when motion is allowed, so the landing's
 * hero can stay hidden until GSAP animates it in (styles.css, motion.ts).
 */
import { LANDING_DEFAULT } from "@/lib/site-content";

const SEEN_KEY = "ml-intro-seen";

/** Runs in <head>, before the body paints. Kept tiny and dependency-free. */
export const INTRO_SCRIPT = `(function(){try{var d=document.documentElement;if(window.matchMedia("(prefers-reduced-motion: no-preference)").matches){d.classList.add("motion")}if(window.self!==window.top||sessionStorage.getItem("${SEEN_KEY}")){d.setAttribute("data-intro","skip")}else{sessionStorage.setItem("${SEEN_KEY}","1")}}catch(e){}})();`;

/** When the preloader has lifted, in seconds (motion.ts starts the hero then). */
export const INTRO_DONE_S = 3.2;

/**
 * The photos that flick through the frame, lightest copies first; the last
 * is the hero's own photo, so the frame opens straight onto it.
 */
const FLICKS = [
  "/villas/pr-saglit/2.webp",
  "/villas/pr-hidden-loft/0.webp",
  "/villas/pr-malaya-2/6.webp",
  "/villas/pr-bacoor/1.webp",
  "/villas/pr-012/0.webp",
];

export function BrandIntro() {
  const shots = [...FLICKS, LANDING_DEFAULT.hero.photo];
  return (
    <div className="ml-loader" aria-hidden="true">
      <div className="ml-loader__frame">
        {shots.map((src, i) => (
          <img
            key={src}
            className="ml-loader__shot"
            src={src}
            alt=""
            style={{ "--i": i } as React.CSSProperties}
          />
        ))}
      </div>
      <p className="ml-loader__name">
        Marj Lopez <em>for</em> Malaya Villas
      </p>
      <p className="ml-loader__count" />
    </div>
  );
}
