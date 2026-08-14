/**
 * S1 - the hero.
 *
 * The video is scrubbed by scroll rather than played, so the whole opening
 * shot is under the reader's thumb. Copy parallaxes up and blurs out while a
 * radial veil closes over the frame.
 *
 * The intro timeline is exported separately because the preloader owns its
 * timing - it fires once the plate has lifted, not on mount.
 */
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { HERO as HERO_MOTION, REVEAL as HERO_REVEAL } from "@/constants/motion";
import type { SceneBuildArgs } from "@/hooks/useSceneTrigger";

export interface HeroRefs {
  hero: HTMLElement | null;
  video: HTMLVideoElement | null;
}

/** Called by the preloader once the plate clears. */
export function playHeroIntro(instant = false): void {
  const q = (sel: string) => document.querySelector(sel);
  if (!q("[data-q='ht-line']")) return;

  if (instant) {
    gsap.set("[data-q='ht-line']", { yPercent: 0 });
    return;
  }

  gsap.set("[data-q='ht-line']", { yPercent: 118 });

  /*
   * Same focus pull the rest of the document uses (see interactions/reveal).
   * On the title it rides on the h1, not the masked lines, so the blur is not
   * clipped against the reveal box.
   */
  const BLUR_IN = { filter: `blur(${HERO_REVEAL.blur}px)` };

  gsap
    .timeline({
      /*
       * The scrubbed hero timeline is built on mount, before this intro runs.
       * Without a refresh it snapshots whatever mid-intro opacity the copy
       * happened to be at and pins it there forever - the sub-heading and CTA
       * end up stuck part-faded at scroll top. Re-reading start values once
       * the intro has settled fixes it.
       */
      onComplete: () => ScrollTrigger.refresh(),
    })
    .to("[data-q='ht-line']", { yPercent: 0, duration: 1.35, ease: "expo.out", stagger: 0.09 })
    .from(
      "[data-q='hero-title']",
      { ...BLUR_IN, duration: 1.5, ease: "power2.out", clearProps: "filter" },
      0,
    )
    .from(
      "[data-q='hero-eyebrow']",
      { ...BLUR_IN, opacity: 0, y: 16, duration: 0.9, ease: "power3.out", clearProps: "filter" },
      0.1,
    )
    .from(
      "[data-q='hero-sub']",
      { ...BLUR_IN, opacity: 0, y: 24, duration: 1, ease: "power3.out", clearProps: "filter" },
      0.5,
    )
    .from(
      "[data-q='hero-cta'] > *",
      {
        ...BLUR_IN,
        opacity: 0,
        y: 22,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        clearProps: "filter",
      },
      0.65,
    )
    .from("[data-q='hero-hint']", { opacity: 0, duration: 0.8 }, 0.9)
    // Opacity only. The bar's edges are welded to the viewport corners, so
    // even the entrance must not translate them.
    .from("[data-q='nav']", { opacity: 0, duration: 1, ease: "power3.out" }, 0.2)
    .from(
      "[data-q='rail'] > *",
      { opacity: 0, x: 14, duration: 0.7, stagger: 0.06, ease: "power2.out" },
      0.5,
    );
}

export function createHeroScene({ refs, reduced }: SceneBuildArgs<HeroRefs>): () => void {
  const { hero, video } = refs;
  if (!hero) return () => {};
  if (reduced) return () => {};

  const triggers: ScrollTrigger[] = [];

  if (video) {
    const attach = () => {
      const duration = video.duration || 16;
      triggers.push(
        ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "bottom bottom",
          scrub: HERO_MOTION.videoScrub,
          onUpdate: (self) => {
            if (video.readyState < 2) return;
            try {
              video.currentTime = self.progress * (duration - 0.05);
            } catch {
              /* seeking can throw mid-load - the next tick recovers */
            }
          },
        }),
      );
    };
    if (video.readyState >= 1) attach();
    else video.addEventListener("loadedmetadata", attach, { once: true });
    // Prime the decoder, then hold on frame zero so scrubbing is instant.
    video.play().then(() => video.pause()).catch(() => {});
  }

  const tl = gsap.timeline({
    scrollTrigger: { trigger: hero, start: "top top", end: "60% bottom", scrub: 0.8 },
  });
  tl.to(
    "[data-q='hero-title']",
    { y: -90, scale: 0.94, opacity: 0, filter: "blur(12px)", ease: "none" },
    0,
  )
    .to(
      "[data-q='hero-sub'], [data-q='hero-cta'], [data-q='hero-eyebrow']",
      { y: -50, opacity: 0, ease: "none" },
      0,
    )
    .to("[data-q='hero-hint']", { opacity: 0, ease: "none" }, 0)
    .to("[data-q='hero-veil']", { opacity: 1.25, ease: "none" }, 0.2);

  if (tl.scrollTrigger) triggers.push(tl.scrollTrigger);

  return () => {
    triggers.forEach((t) => t.kill());
    tl.kill();
  };
}
