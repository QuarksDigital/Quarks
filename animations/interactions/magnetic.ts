/**
 * Magnetic physics for [data-magnetic] elements (Bible §8).
 * Element translates toward cursor within a proximity radius; label counter-translates.
 * Per-element overrides: data-magnetic-radius, data-magnetic-pull (falls back to CURSOR defaults).
 */
import { gsap } from "@/lib/gsap";
import { CURSOR } from "@/constants/motion";
import { isTouchDevice } from "@/utils/dom";

export function attachMagnetic(root: HTMLElement | Document = document): () => void {
  if (isTouchDevice()) return () => {};

  const els = Array.from(root.querySelectorAll<HTMLElement>("[data-magnetic]"));
  const cleanups: (() => void)[] = [];

  els.forEach((el) => {
    const inner = el.querySelector<HTMLElement>("[data-magnetic-inner]");
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
    const innerXTo = inner ? gsap.quickTo(inner, "x", { duration: 0.4, ease: "power3.out" }) : null;
    const innerYTo = inner ? gsap.quickTo(inner, "y", { duration: 0.4, ease: "power3.out" }) : null;

    // Per-element overrides so dense clusters (e.g. social links) can be weaker
    // than a standalone CTA without changing the shared defaults.
    const radius = el.dataset.magneticRadius
      ? Number(el.dataset.magneticRadius)
      : CURSOR.magneticRadius;
    const pull = el.dataset.magneticPull
      ? Number(el.dataset.magneticPull)
      : CURSOR.magneticPull;

    let isPulled = false;

    const reset = (elastic: boolean) => {
      isPulled = false;
      const dur = elastic ? 0.9 : 0.4;
      const ease = elastic ? "elastic.out(1,0.4)" : "power3.out";
      gsap.to(el, { x: 0, y: 0, duration: dur, ease });
      if (inner) gsap.to(inner, { x: 0, y: 0, duration: dur, ease });
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();

      // Don't attract an element that's scrolled/animated off-screen (e.g. the
      // nav pill hidden on downscroll) — otherwise the pull drags it back into view.
      const offscreen =
        r.bottom <= 0 ||
        r.top >= window.innerHeight ||
        r.right <= 0 ||
        r.left >= window.innerWidth;
      if (offscreen) {
        if (isPulled) reset(false);
        return;
      }

      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const threshold = radius + Math.max(r.width, r.height) / 2;

      if (dist < threshold) {
        isPulled = true;
        xTo(dx * pull);
        yTo(dy * pull);
        if (inner) {
          innerXTo?.(dx * pull * 0.5);
          innerYTo?.(dy * pull * 0.5);
        }
      } else if (isPulled) {
        reset(false);
      }
    };

    const onLeave = () => reset(true);

    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    });
  });

  return () => cleanups.forEach((c) => c());
}