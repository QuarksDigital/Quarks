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

    /*
     * The heading resolves purely out of focus - no vertical travel. The blur
     * sits on the [data-split] element (not on .q-word) because .q-word-wrap
     * clips its child, so a blur inside the mask would have its soft edge sliced
     * off against the box and read as a smear. On the parent the whole resolved
     * block is what comes into focus.
     *
     * The words are held at their resting position (yPercent 0) rather than
     * animated up out of the mask - the entrance is the blur alone.
     */
    gsap.set(el.querySelectorAll(".q-word"), { yPercent: 0 });

    /*
     * The block starts fully blurred (immediateRender pins the blur before it
     * ever enters, so it is never shown sharp first) and comes into focus as it
     * scrolls up through the lower half of the viewport. Scrubbing the focus
     * pull to scroll position - rather than firing a fixed-duration tween once
     * the block appears - is what makes the blur resolve *as the scroll
     * proceeds*, which is the intended reading.
     */
    const tween = gsap.fromTo(
      el,
      { filter: `blur(${REVEAL.blur}px)` },
      {
        filter: "blur(0px)",
        ease: "none",
        immediateRender: true,
        scrollTrigger: {
          trigger: el,
          start: "top 92%",
          end: "top 45%",
          scrub: true,
        },
      },
    );

    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  });

  // Cards rise and fade in. The blur-in is reserved for the [data-split]
  // headings above, so these lift cleanly without a second focus-pull - one
  // blur per screen keeps the entrance calm rather than busy.
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
