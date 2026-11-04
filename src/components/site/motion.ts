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
 *   data-split         a heading: lines rise out of a mask on scroll
 *   data-reveal        fades up when it scrolls in (siblings stagger)
 *   data-count         a figure ("73K", "4.47★", "202+") that counts up
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

/** "73K" → 0…73 + "K"; "4.47★" keeps two decimals. Non-numbers are left alone. */
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

        // ---- the slideshow: pinned; each next photo wipes in from the right
        // and its word in the caption lights up.
        q<HTMLElement>("[data-seq]").forEach((seq) => {
          const slides = seq.querySelectorAll<HTMLElement>("[data-seq-slide]");
          const words = seq.querySelectorAll<HTMLElement>("[data-seq-word]");
          const dots = seq.querySelectorAll<HTMLElement>("[data-seq-dot]");
          const light = (i: number) => {
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
              end: () => `+=${(slides.length - 1) * 100}%`,
              pin: true,
              scrub: 0.7,
              onUpdate: (self) =>
                light(Math.min(slides.length - 1, Math.round(self.progress * (slides.length - 1)))),
            },
          });
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
          blocks.forEach((b, i) =>
            ScrollTrigger.create({
              trigger: b,
              start: "top 55%",
              end: "bottom 55%",
              onToggle: (self) => self.isActive && show(i),
            }),
          );
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
