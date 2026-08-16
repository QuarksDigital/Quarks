/**
 * S5b - the threshold loader.
 *
 * Reaching the bottom of the footer doesn't end the document: the contact
 * section pins there and a line loader draws across it as you keep scrolling.
 * Only once that line completes does the gate hand over to /services.
 *
 * Keeping the loader on the footer (rather than on a blank plate after it)
 * means the reader never loses their place - the page they were reading stays
 * under them while the next one spins up.
 */
import { gsap } from "@/lib/gsap";
import { GATE } from "@/constants/services";
import { SCRUB } from "@/constants/motion";
import type { SceneBuildArgs } from "@/hooks/useSceneTrigger";

export interface ThresholdRefs {
  section: HTMLElement | null;
  /**
   * Inner wrapper holding every bit of footer content. We pin this rather
   * than the section itself, because the section carries the route-cap
   * negative margin and a pin-spacer around it would fight that.
   */
  inner: HTMLElement | null;
  /** the wrapper that fades in as the loader engages */
  panel: HTMLElement | null;
  /** the filling bar */
  fill: HTMLElement | null;
  label: HTMLElement | null;
  percent: HTMLElement | null;
}

export function createThresholdScene({ refs, reduced }: SceneBuildArgs<ThresholdRefs>): () => void {
  const { section, inner, panel, fill, label, percent } = refs;
  if (!section || !inner || !panel || !fill) return () => {};

  if (reduced) {
    gsap.set(panel, { autoAlpha: 0 });
    return () => {};
  }

  gsap.set(fill, { scaleX: 0 });
  gsap.set(panel, { autoAlpha: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      // Pin the moment the footer has fully arrived, then hold for a screen.
      start: "bottom bottom",
      end: "+=100%",
      pin: inner,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      scrub: SCRUB,
      onUpdate: (self) => {
        const p = self.progress;
        /*
         * The bar fills across the first 80% of the runway and then holds full
         * for the last 20%. That trailing hold is deliberate: the next section
         * (the gate) begins lifting its plate as the reader crosses out of this
         * pin, and with smooth-scroll the scrubbed fill visually trails the
         * scroll position. Finishing early guarantees the loader reads as 100%
         * complete before the black plate starts to raise, instead of the plate
         * sliding up over a bar that still looks half-full.
         */
        const charge = Math.min(p / 0.8, 1);
        if (percent) percent.textContent = String(Math.round(charge * 100)).padStart(3, "0");
        if (label)
          label.textContent =
            charge < 0.5 ? GATE.prompt : charge < 1 ? GATE.charging : GATE.release;
      },
    },
  });

  // Map the fill tween onto the first 80% of the timeline; the remaining 20%
  // is an intentional hold at full (see onUpdate).
  tl.to(panel, { autoAlpha: 1, duration: 0.12, ease: "none" }, 0)
    .to(fill, { scaleX: 1, duration: 0.8, ease: "none" }, 0)
    .to({}, { duration: 0.2 }, 0.8);

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
  };
}
