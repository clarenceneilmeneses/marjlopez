/**
 * The landing's motion (Clarence, 2026-11-04: "fancy like those portfolio
 * websites while still being simple, with over the top gsap animations",
 * pointing at verostudio.com). GSAP + ScrollTrigger + SplitText, on Lenis
 * smooth scrolling.
 *
 * Pages mark what moves with data attributes and call `usePageMotion` once;
 * nothing else needs GSAP:
 *
 *   data-hero-title    the h1: its lines rise out of a mask, after the intro
 *   data-hero-fade     hero bits that fade up after the title
 *   data-hero-photo    the hero photo's frame: opens from the bottom
 *   data-split         a heading: lines rise out of a mask on scroll
 *   data-scrub-words   a paragraph that lights up word by word as you scroll
 *   data-reveal        fades up when it scrolls in (siblings stagger)
 *   data-count         a figure ("73K", "4.47★", "202+") that counts up
 *   data-parallax="n"  drifts n% against the scroll (negative = faster)
 *   data-expand        a pinned stage whose [data-expand-media] grows from a
 *                      framed photo to the full screen as you scroll
 *   data-offers        a list whose rows ([data-offer-row][data-index]) show
 *                      [data-offer-preview] following the cursor
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

/**
 * How long until the brand intro (components/site/intro.tsx) has lifted, so
 * the hero starts as the last curtain clears. Zero when it isn't playing.
 */
function introDelay(): number {
  const intro = document.querySelector(".brand-intro");
  const skipped = document.documentElement.getAttribute("data-intro") === "skip";
  if (!intro || skipped) return 0.15;
  const left = 2.15 - performance.now() / 1000;
  return Math.max(0.15, left);
}

/** "73K" → 0…73 + "K"; "4.47★" keeps two decimals. Non-numbers are left alone. */
function countUp(el: HTMLElement) {
  const text = el.textContent ?? "";
  const m = text.match(/^(\D*)([\d,]*\.?\d+)(.*)$/);
  if (!m) return;
  const [, pre, num, post] = m as unknown as [string, string, string, string];
  const target = parseFloat(num.replace(/,/g, ""));
  const decimals = num.includes(".") ? num.split(".")[1]!.length : 0;
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

        // ---- hero: title lines rise, the photo opens, the rest fades up.
        const title = q<HTMLElement>("[data-hero-title]")[0];
        if (title) {
          SplitText.create(title, {
            type: "lines",
            mask: "lines",
            linesClass: "sline",
            autoSplit: true,
            onSplit: (self) => {
              gsap.set(title, { autoAlpha: 1 });
              return gsap.from(self.lines, {
                yPercent: 115,
                rotate: 2,
                duration: 1.5,
                stagger: 0.12,
                ease: EASE,
                delay,
              });
            },
          });
        }
        const photo = q<HTMLElement>("[data-hero-photo]")[0];
        if (photo) {
          const img = photo.querySelector("img");
          gsap.fromTo(
            photo,
            { clipPath: "inset(100% 0% 0% 0% round 1.5rem)" },
            {
              clipPath: "inset(0% 0% 0% 0% round 1.5rem)",
              duration: 1.6,
              ease: "expo.inOut",
              delay: delay - 0.1,
            },
          );
          if (img) {
            gsap.from(img, { scale: 1.35, duration: 2.2, ease: EASE, delay: delay - 0.1 });
            // …then it drifts as the page scrolls past.
            gsap.to(img, {
              yPercent: 12,
              ease: "none",
              scrollTrigger: { trigger: photo, start: "top top", end: "bottom top", scrub: true },
            });
          }
        }
        gsap.fromTo(
          q("[data-hero-fade]"),
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.1, ease: EASE, delay: delay + 0.5 },
        );

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

        // ---- the statement: each word lights up as you scroll through it.
        q<HTMLElement>("[data-scrub-words]").forEach((el) => {
          SplitText.create(el, {
            type: "words",
            autoSplit: true,
            onSplit: (self) =>
              gsap.fromTo(
                self.words,
                { opacity: 0.14 },
                {
                  opacity: 1,
                  stagger: 0.08,
                  ease: "none",
                  scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 40%", scrub: true },
                },
              ),
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
              { autoAlpha: 0, y: 48 },
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

        // ---- the stage: a framed photo that grows to the full screen.
        q<HTMLElement>("[data-expand]").forEach((stage) => {
          const media = stage.querySelector<HTMLElement>("[data-expand-media]");
          const img = media?.querySelector("img");
          const after = stage.querySelectorAll<HTMLElement>("[data-expand-after]");
          if (!media) return;
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: stage,
              start: "top top",
              end: "+=120%",
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
            },
          });
          tl.fromTo(
            media,
            { clipPath: "inset(16% 24% 16% 24% round 1.5rem)" },
            { clipPath: "inset(0% 0% 0% 0% round 0rem)", ease: "power2.inOut", duration: 1 },
          );
          if (img)
            tl.fromTo(img, { scale: 1.3 }, { scale: 1, ease: "power2.inOut", duration: 1 }, 0);
          if (after.length)
            tl.fromTo(
              after,
              { autoAlpha: 0, y: 40 },
              { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.4, ease: "power2.out" },
              0.7,
            );
        });

        // ---- the offers: a photo that follows the cursor over the list.
        const list = q<HTMLElement>("[data-offers]")[0];
        const preview = q<HTMLElement>("[data-offer-preview]")[0];
        if (list && preview && window.matchMedia("(pointer: fine)").matches) {
          const shots = preview.querySelectorAll<HTMLElement>("[data-offer-shot]");
          gsap.set(preview, { xPercent: -50, yPercent: -50, scale: 0.6, autoAlpha: 0 });
          const x = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3" });
          const y = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3" });
          const rot = gsap.quickTo(preview, "rotation", { duration: 0.8, ease: "power3" });
          let lastX = 0;
          const move = (e: PointerEvent) => {
            x(e.clientX);
            y(e.clientY);
            rot(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
            lastX = e.clientX;
          };
          const show = (i: number) => {
            shots.forEach((s, k) =>
              gsap.to(s, {
                autoAlpha: k === i ? 1 : 0,
                scale: k === i ? 1 : 1.15,
                duration: 0.5,
                ease: "power3.out",
              }),
            );
            gsap.to(preview, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power3.out" });
          };
          const hide = () =>
            gsap.to(preview, { autoAlpha: 0, scale: 0.6, duration: 0.4, ease: "power3.in" });
          const rows = list.querySelectorAll<HTMLElement>("[data-offer-row]");
          const enters = Array.from(rows).map((row) => {
            const fn = () => show(Number(row.dataset["index"] ?? 0));
            row.addEventListener("pointerenter", fn);
            return () => row.removeEventListener("pointerenter", fn);
          });
          list.addEventListener("pointermove", move);
          list.addEventListener("pointerleave", hide);
          return () => {
            enters.forEach((off) => off());
            list.removeEventListener("pointermove", move);
            list.removeEventListener("pointerleave", hide);
          };
        }
        return undefined;
      });
      return () => mm.revert();
    },
    { scope },
  );
}
