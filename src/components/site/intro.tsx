/**
 * The preloader: the first thing a visitor sees, once per visit.
 *
 * Clarence, 2026-11-04, first "an onload animation … so it has like a wow
 * factor", then "pretty much copy vero's landing page" (verostudio.com):
 * so it is Vero's. The headline in capitals on the page's beige, a photo set
 * into the middle of it, a progress line counting to 100%; then the photo
 * opens to fill the screen and the page is behind it. On the landing that
 * photo is the hero's own, so it hands straight over.
 *
 * It is pure CSS, rendered on the server, so it covers the page from the very
 * first paint, before any JavaScript has arrived (the % counts with an
 * animated CSS property). The inline script in the head (`INTRO_SCRIPT`)
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

import { Vero } from "./vero";

const SEEN_KEY = "ml-intro-seen";

/** Runs in <head>, before the body paints. Kept tiny and dependency-free. */
export const INTRO_SCRIPT = `(function(){try{var d=document.documentElement;if(window.matchMedia("(prefers-reduced-motion: no-preference)").matches){d.classList.add("motion")}if(window.self!==window.top||sessionStorage.getItem("${SEEN_KEY}")){d.setAttribute("data-intro","skip")}else{sessionStorage.setItem("${SEEN_KEY}","1")}}catch(e){}})();`;

/** When the preloader has lifted, in seconds (motion.ts starts the hero then). */
export const INTRO_DONE_S = 3.2;

export function BrandIntro() {
  const [top, bottom] = LANDING_DEFAULT.hero.headline;
  const lines = (s: string) => {
    // "Building hospitality" → two lines, so the photo sits mid-sentence.
    const i = s.indexOf(" ");
    return i < 0 ? [s] : [s.slice(0, i), s.slice(i + 1)];
  };
  const above = lines(top);
  const below = lines(bottom);
  const line = (text: string, i: number) => (
    <span key={i} className="ml-loader__line">
      <span style={{ "--i": i } as React.CSSProperties}>
        <Vero text={text} />
      </span>
    </span>
  );
  return (
    <div className="ml-loader" aria-hidden="true">
      <img className="ml-loader__img" src={LANDING_DEFAULT.hero.photo} alt="" />
      <div className="ml-loader__text">
        <div className="ml-loader__top">{above.map((t, i) => line(t, i))}</div>
        <div className="ml-loader__slot" />
        <div className="ml-loader__bottom">{below.map((t, i) => line(t, above.length + i))}</div>
      </div>
      <div className="ml-loader__bar">
        <span className="ml-loader__fill" />
        <span className="ml-loader__pct" />
      </div>
    </div>
  );
}
