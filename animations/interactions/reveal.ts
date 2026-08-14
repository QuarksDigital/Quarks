/**
 * Shared entrance choreography.
 *
 * Three families, one pass:
 *   [data-split]  headings whose words rise out of their masks
 *   [data-fact] / [data-step] / [data-scard]  cards that lift and fade in
 *   [data-count]  numerals that roll up to their target
 *
 * Everything fires once, on the way down, and is skipped entirely under
 * reduced motion (the elements are simply left in their resting state).
 */
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { splitWords } from "@/animations/core/splitWords";
import { REVEAL } from "@/constants/motion";

export function installReveals(scope: ParentNode = document, reduced = false): () => void {
  splitWords(scope);

  if (reduced) return () => {};

  const triggers: ScrollTrigger[] = [];

  scope.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
    // The hero runs its own intro timeline; don't double-animate it.
    if (el.closest("[data-q='hero']")) return;
    const tween = gsap.fromTo(
      el.querySelectorAll(".q-word"),
      { yPercent: REVEAL.yPercent },
      {
        yPercent: 0,
        duration: REVEAL.duration,
        ease: "expo.out",
        stagger: REVEAL.stagger,
        immediateRender: false,
        scrollTrigger: { trigger: el, start: REVEAL.start, once: true },
      },
    );
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  });

  (["[data-fact]", "[data-step]", "[data-scard]"] as const).forEach((sel) => {
    scope.querySelectorAll<HTMLElement>(sel).forEach((el) => {
      const tween = gsap.fromTo(
        el,
        { opacity: 0, y: 42 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        },
      );
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });
  });

  scope.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count || "0") || 0;
    const run = () => {
      if (el.dataset.counted === "1") return;
      el.dataset.counted = "1";
      const o = { v: 0 };
      gsap.to(o, {
        v: target,
        duration: 2.1,
        ease: "expo.out",
        onUpdate: () => {
          el.textContent = Math.round(o.v).toLocaleString("en-US");
        },
      });
    };
    // Already on screen at mount (deep link, refresh mid-page): run immediately.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.88) {
      run();
      return;
    }
    triggers.push(ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: run }));
  });

  return () => triggers.forEach((t) => t.kill());
}
