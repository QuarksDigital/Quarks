/**
 * Magnetic physics for [data-magnetic] elements (Bible §8).
 * Element translates toward cursor within a proximity radius; label counter-translates.
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

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < CURSOR.magneticRadius + Math.max(r.width, r.height) / 2) {
        xTo(dx * CURSOR.magneticPull);
        yTo(dy * CURSOR.magneticPull);
        if (inner) {
          gsap.to(inner, {
            x: dx * CURSOR.magneticPull * 0.5,
            y: dy * CURSOR.magneticPull * 0.5,
            duration: 0.4,
            ease: "power3.out",
          });
        }
      }
    };

    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1,0.4)" });
      if (inner)
        gsap.to(inner, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1,0.4)" });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    });
  });

  return () => cleanups.forEach((c) => c());
}
