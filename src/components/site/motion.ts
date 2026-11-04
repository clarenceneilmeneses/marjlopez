/**
 * The landing's motion (Clarence, 2026-11-04: "fancy like those portfolio
 * websites … with over the top gsap animations", then "pretty much copy
 * vero's landing page", verostudio.com). GSAP + ScrollTrigger + SplitText,
 * on Lenis smooth scrolling.
 *
 * Pages mark what moves with data attributes and call `usePageMotion` once;
 * nothing else needs GSAP:
 *
 *   data-hero          the full-screen hero, pinned while it shrinks to a
 *                      band: [data-hero-media] (clipped), [data-hero-mark]
 *                      (the name, whose letters rise after the preloader)
 *   data-burst         pinned: [data-burst-card] prints fly from a pile to
 *                      their data-x/data-y/data-r places round
 *                      [data-burst-title], whose words darken; then
 *                      [data-burst-fill] opens from [data-burst-center]'s box
 *                      to the whole screen and the title turns white
 *   data-split         a heading: lines rise out of a mask on scroll
 *   data-reveal        fades up when it scrolls in (siblings stagger)
 *   data-count         a figure ("75K", "4.47★", "202+") that counts up
 *   data-parallax="n"  drifts n% against the scroll (negative = faster)
 *   data-seq           a pinned full-screen slideshow: [data-seq-slide]s
 *                      wipe in from the right, [data-seq-word] lights the
 *                      matching word of the caption, [data-seq-dot] too
 *   data-collage       a sticky photo ([data-collage-shot]s) that changes
 *                      as each [data-collage-block] scrolls through
 *   data-gallery-col="n"  a gallery column drifting at its own speed
 *   data-marquee-row="±1" a giant line of type sliding as you scroll
 *   data-coin          spins as you scroll
 *
 * All of it sits inside `prefers-reduced-motion: no-preference`; with
 * reduced motion the page is simply still, and everything is visible.
 */
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { useEffect, type RefObject } from "react";

import { INTRO_DONE_S } from "./intro";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
}

const MOTION_OK = "(prefers-reduced-motion: no-preference)";
const EASE = "expo.out";

/**
 * Lenis smooth scrolling for as long as the page is mounted. It pauses while
 * a dialog or sheet has locked the page (Radix marks the body), so the page
 * behind a menu doesn't glide.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia(MOTION_OK).matches) return;
    const lenis = new Lenis({ anchors: { offset: -80 }, autoRaf: false, lerp: 0.09 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const body = document.body;
    const sync = () => (body.hasAttribute("data-scroll-locked") ? lenis.stop() : lenis.start());
    const watch = new MutationObserver(sync);
    watch.observe(body, { attributes: true, attributeFilter: ["data-scroll-locked"] });

    return () => {
      watch.disconnect();
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);
}

/** Seconds until the preloader (intro.tsx) has lifted; a beat when it isn't playing. */
function introDelay(): number {
  const loader = document.querySelector(".ml-loader");
  const skipped = document.documentElement.getAttribute("data-intro") === "skip";
  if (!loader || skipped) return 0.2;
  return Math.max(0.2, INTRO_DONE_S - 0.35 - performance.now() / 1000);
}

/** "75K" → 0…75 + "K"; "4.47★" keeps two decimals. Non-numbers are left alone. */
function countUp(el: HTMLElement) {
  const text = el.textContent ?? "";
  const m = text.match(/^(\D*)([\d,]*\.?\d+)(.*)$/);
  if (!m) return;
  const pre = m[1] ?? "";
  const num = m[2] ?? "0";
  const post = m[3] ?? "";
  const target = parseFloat(num.replace(/,/g, ""));
  const decimals = num.includes(".") ? (num.split(".")[1] ?? "").length : 0;
  const state = { v: 0 };
  el.textContent = `${pre}${(0).toFixed(decimals)}${post}`;
  gsap.to(state, {
    v: target,
    duration: 2,
    ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 90%", once: true },
    onUpdate: () => {
      el.textContent = `${pre}${state.v.toFixed(decimals)}${post}`;
    },
    onComplete: () => {
      el.textContent = text;
    },
  });
}

export function usePageMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(scope);
        const delay = introDelay();
        const wide = window.matchMedia("(min-width: 1024px)").matches;

        // ---- the hero: the name rises letter by letter as the preloader
        // lifts; then, pinned, the photo shrinks to a band and the name with it.
        const hero = q<HTMLElement>("[data-hero]")[0];
        if (hero) {
          const media = hero.querySelector<HTMLElement>("[data-hero-media]");
          const img = media?.querySelector("img");
          const mark = hero.querySelector<HTMLElement>("[data-hero-mark]");
          if (mark) {
            const name = mark.querySelector<HTMLElement>("[data-hero-name]");
            const rest = mark.querySelectorAll<HTMLElement>("[data-hero-rest]");
            gsap.set(mark, { autoAlpha: 1 });
            if (name) {
              // Words first, so a phone wraps between words, never inside one.
              SplitText.create(name, {
                type: "words,chars",
                mask: "chars",
                charsClass: "hchar",
                autoSplit: true,
                onSplit: (self) =>
                  gsap.from(self.chars, {
                    yPercent: 110,
                    duration: 1.4,
                    stagger: 0.045,
                    ease: EASE,
                    delay,
                  }),
              });
            }
            gsap.from(rest, { autoAlpha: 0, y: 16, duration: 1.2, ease: EASE, delay: delay + 0.6 });
          }
          if (img) gsap.from(img, { scale: 1.12, duration: 2.4, ease: EASE, delay: delay - 0.3 });
          const tl = gsap.timeline({
            scrollTrigger: { trigger: hero, start: "top top", end: "+=75%", pin: true, scrub: 0.6 },
          });
          if (media)
            tl.fromTo(
              media,
              { clipPath: "inset(0% 0% 0% 0%)" },
              { clipPath: wide ? "inset(26% 18% 26% 18%)" : "inset(28% 6% 28% 6%)", ease: "none" },
            );
          if (img) tl.fromTo(img, { yPercent: 0 }, { yPercent: 6, ease: "none" }, 0);
          if (mark) tl.to(mark, { scale: 0.62, ease: "none" }, 0);
        }

        // ---- the burst: pinned; the prints fly out from the pile to their
        // places round the headline while its words darken, then the middle
        // photo opens from the size of a print to the whole screen and the
        // words turn white on it.
        q<HTMLElement>("[data-burst]").forEach((stage) => {
          const cards = gsap.utils.toArray<HTMLElement>(
            stage.querySelectorAll("[data-burst-card]"),
          );
          const center = stage.querySelector<HTMLElement>("[data-burst-center]");
          const fill = stage.querySelector<HTMLElement>("[data-burst-fill]");
          const title = stage.querySelector<HTMLElement>("[data-burst-title]");
          const shade = stage.querySelector<HTMLElement>("[data-burst-shade]");
          const after = stage.querySelectorAll<HTMLElement>("[data-burst-after]");
          if (!center || !fill || !title) return;
          // The middle print's box, as an inset of the stage: where the fill starts.
          const startInset = () => {
            const s = stage.getBoundingClientRect();
            const r = center.getBoundingClientRect();
            return `inset(${r.top - s.top}px ${s.right - r.right}px ${s.bottom - r.bottom}px ${r.left - s.left}px)`;
          };
          const words = SplitText.create(title, { type: "words" }).words;
          const num = (el: HTMLElement, k: string) => parseFloat(el.dataset[k] ?? "0");
          gsap.set(cards, { rotate: (i) => (i % 2 ? 1 : -1) * (2 + i * 1.5) });
          gsap.set(words, { opacity: 0.16 });
          // The middle photo stays hidden until it opens: as a print-sized
          // crop of a full-screen photo it reads as a random close-up.
          gsap.set(fill, { autoAlpha: 0 });
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: stage,
              start: "top top",
              end: "+=230%",
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });
          tl.to(
            cards,
            {
              x: (_, el: HTMLElement) => (num(el, "x") / 100) * window.innerWidth,
              y: (_, el: HTMLElement) => (num(el, "y") / 100) * window.innerHeight,
              rotate: (_, el: HTMLElement) => num(el, "r"),
              ease: "power3.out",
              duration: 1,
              stagger: 0.05,
            },
            0,
          )
            .to(words, { opacity: 1, ease: "none", duration: 0.25, stagger: 0.09 }, 0.1)
            .to(cards, { y: "-=4vh", ease: "none", duration: 0.5 }, 1.1)
            .to(fill, { autoAlpha: 1, ease: "none", duration: 0.12 }, 1.42)
            .fromTo(
              fill,
              { clipPath: () => startInset() },
              { clipPath: "inset(0px 0px 0px 0px)", ease: "power2.inOut", duration: 1 },
              1.5,
            )
            .fromTo(
              fill.querySelector("img"),
              { scale: 1.3 },
              { scale: 1, ease: "power2.inOut", duration: 1 },
              1.5,
            );
          if (shade) tl.to(shade, { opacity: 1, ease: "none", duration: 0.6 }, 1.8);
          tl.to(title, { color: "#ffffff", ease: "none", duration: 0.5 }, 1.85);
          if (after.length) tl.to(after, { opacity: 1, ease: "none", duration: 0.3 }, 2.3);
          tl.to({}, { duration: 0.35 });
        });

        // ---- headings: lines rise out of a mask as they scroll in.
        q<HTMLElement>("[data-split]").forEach((el) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            linesClass: "sline",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                duration: 1.3,
                stagger: 0.1,
                ease: EASE,
                scrollTrigger: { trigger: el, start: "top 85%", once: true },
              }),
          });
        });

        // ---- reveals, staggered within whatever scrolls in together.
        gsap.set(q("[data-reveal]"), { autoAlpha: 0 });
        ScrollTrigger.batch(q("[data-reveal]"), {
          start: "top 88%",
          once: true,
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { autoAlpha: 0, y: 40 },
              { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.09, ease: EASE, overwrite: true },
            ),
        });

        q<HTMLElement>("[data-count]").forEach(countUp);

        q<HTMLElement>("[data-parallax]").forEach((el) => {
          const n = parseFloat(el.dataset["parallax"] ?? "10");
          gsap.fromTo(
            el,
            { yPercent: n },
            {
              yPercent: -n,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });

        // ---- the slideshow (Vero's essence section): pinned; the first photo
        // grows from its small box under the heading to the whole screen, then
        // each next photo wipes in from the right and its word lights up.
        q<HTMLElement>("[data-seq]").forEach((seq) => {
          const slides = gsap.utils.toArray<HTMLElement>(seq.querySelectorAll("[data-seq-slide]"));
          const words = seq.querySelectorAll<HTMLElement>("[data-seq-word]");
          const dots = seq.querySelectorAll<HTMLElement>("[data-seq-dot]");
          const ui = seq.querySelectorAll<HTMLElement>("[data-seq-ui]");
          const box = seq.querySelector<HTMLElement>("[data-seq-start]");
          const first = slides[0];
          if (!first) return;
          const grow = box ? 1.2 : 0;
          // The small box, relative to the stage. The photo itself starts at
          // that size (not a window cut out of the full-screen photo), so the
          // box shows the whole villa, like Vero's whole dress.
          const rect = () => {
            const st = seq.getBoundingClientRect();
            const r = box!.getBoundingClientRect();
            return {
              top: r.top - st.top,
              left: r.left - st.left,
              width: r.width,
              height: r.height,
            };
          };
          let lit = -1;
          const light = (i: number) => {
            if (i === lit) return;
            lit = i;
            words.forEach((w, k) => gsap.to(w, { opacity: k === i ? 1 : 0.38, duration: 0.5 }));
            dots.forEach((d, k) =>
              gsap.to(d, { opacity: k === i ? 1 : 0.4, scale: k === i ? 1.3 : 1, duration: 0.4 }),
            );
          };
          light(0);
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: seq,
              start: "top top",
              end: () => `+=${(slides.length - 1 + grow) * 100}%`,
              pin: true,
              scrub: 0.7,
              invalidateOnRefresh: true,
              onUpdate: () =>
                light(Math.min(slides.length - 1, Math.max(0, Math.round(tl.time() - grow)))),
            },
          });
          if (box) {
            gsap.set(ui, { autoAlpha: 0 });
            tl.fromTo(
              first,
              {
                top: () => rect().top,
                left: () => rect().left,
                width: () => rect().width,
                height: () => rect().height,
              },
              { top: 0, left: 0, width: "100%", height: "100%", ease: "power2.inOut", duration: 1 },
              0,
            );
            tl.to(ui, { autoAlpha: 1, ease: "none", duration: 0.2 }, 0.9);
            tl.to({}, { duration: grow - 1 });
          }
          slides.forEach((s, i) => {
            if (i === 0) return;
            const img = s.querySelector("img");
            tl.fromTo(
              s,
              { clipPath: "inset(0% 0% 0% 100%)" },
              { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut", duration: 1 },
            );
            if (img)
              tl.fromTo(
                img,
                { xPercent: 12, scale: 1.1 },
                { xPercent: 0, scale: 1, ease: "power2.inOut", duration: 1 },
                "<",
              );
          });
        });

        // ---- the collage: on a laptop the big photo on the left changes as
        // each offer on the right scrolls through the middle of the screen.
        q<HTMLElement>("[data-collage]").forEach((collage) => {
          const shots = collage.querySelectorAll<HTMLElement>("[data-collage-shot]");
          const blocks = collage.querySelectorAll<HTMLElement>("[data-collage-block]");
          if (!wide || !shots.length) return;
          const show = (i: number) =>
            shots.forEach((s, k) =>
              gsap.to(s, {
                clipPath: k <= i ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
                duration: 1,
                ease: "expo.inOut",
                overwrite: true,
              }),
            );
          shots.forEach((s, k) =>
            gsap.set(s, { clipPath: k === 0 ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }),
          );
          // Whichever offer's middle is nearest the middle of the screen owns
          // the photo. Checked on every scroll (both directions, jumps, a
          // reload halfway down), so it can't get stuck on the wrong one.
          let current = 0;
          const pick = () => {
            const mid = window.innerHeight / 2;
            let best = 0;
            let bestD = Infinity;
            blocks.forEach((b, i) => {
              const r = b.getBoundingClientRect();
              const d = Math.abs(r.top + r.height / 2 - mid);
              if (d < bestD) {
                bestD = d;
                best = i;
              }
            });
            if (best !== current) {
              current = best;
              show(best);
            }
          };
          ScrollTrigger.create({
            trigger: collage,
            start: "top bottom",
            end: "bottom top",
            onUpdate: pick,
            onRefresh: pick,
          });
        });

        // ---- the gallery wall: each column at its own speed.
        q<HTMLElement>("[data-gallery-col]").forEach((col) => {
          const n = parseFloat(col.dataset["galleryCol"] ?? "0");
          gsap.fromTo(
            col,
            { yPercent: n },
            {
              yPercent: -n,
              ease: "none",
              scrollTrigger: {
                trigger: col.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });

        // ---- the quote in giant type: rows slide against each other.
        q<HTMLElement>("[data-marquee-row]").forEach((row) => {
          const dir = parseFloat(row.dataset["marqueeRow"] ?? "1");
          gsap.fromTo(
            row,
            { xPercent: dir > 0 ? -18 : 0 },
            {
              xPercent: dir > 0 ? 0 : -18,
              ease: "none",
              scrollTrigger: {
                trigger: row.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });
        q<HTMLElement>("[data-coin]").forEach((coin) =>
          gsap.fromTo(
            coin,
            { rotate: -40 },
            {
              rotate: 320,
              ease: "none",
              scrollTrigger: {
                trigger: coin.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          ),
        );

        return undefined;
      });
      return () => mm.revert();
    },
    { scope },
  );
}
