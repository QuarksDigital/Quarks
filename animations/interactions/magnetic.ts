/**
 * Magnetic pull for [data-magnetic] elements.
 * The element leans toward the cursor while it is over it, then springs back.
 */
import { gsap } from "@/lib/gsap";
import { CURSOR } from "@/constants/motion";
import { isTouchDevice, prefersReducedMotion } from "@/utils/dom";

export function attachMagnetic(root: ParentNode = document): () => void {
  if (isTouchDevice() || prefersReducedMotion()) return () => {};

  const cleanups: (() => void)[] = [];

  root.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
    if (el.dataset.magneticBound) return;
    el.dataset.magneticBound = "1";

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - r.left - r.width / 2) * CURSOR.magneticPullX,
        y: (e.clientY - r.top - r.height / 2) * CURSOR.magneticPullY,
        duration: 0.5,
        ease: "power3.out",
      });
    };
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1,0.4)" });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    cleanups.push(() => {
      delete el.dataset.magneticBound;
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
