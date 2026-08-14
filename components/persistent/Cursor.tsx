"use client";

/**
 * Two-part cursor: a difference-blended dot that tracks tightly, and a ring
 * that lags and swells over anything interactive. Suppressed on coarse
 * pointers and when the user asks for reduced motion.
 */
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { COLORS } from "@/constants/tokens";
import { CURSOR } from "@/constants/motion";
import { isTouchDevice, prefersReducedMotion } from "@/utils/dom";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    if (isTouchDevice() || prefersReducedMotion()) return;

    document.body.dataset.customCursor = "true";
    gsap.set([dot, ring], { opacity: 1 });

    const dx = gsap.quickTo(dot, "x", { duration: CURSOR.dotLerp, ease: "power3" });
    const dy = gsap.quickTo(dot, "y", { duration: CURSOR.dotLerp, ease: "power3" });
    const rx = gsap.quickTo(ring, "x", { duration: CURSOR.ringLerp, ease: "power3" });
    const ry = gsap.quickTo(ring, "y", { duration: CURSOR.ringLerp, ease: "power3" });

    const onMove = (e: MouseEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-cursor="hidden"]')) return;
      const hot = !!target?.closest("[data-cursor],a,button");
      gsap.to(ring, {
        scale: hot ? 1.7 : 1,
        borderColor: hot ? COLORS.accent : "rgba(241,240,236,.35)",
        duration: 0.4,
        ease: "power3.out",
      });
      gsap.to(dot, { scale: hot ? 0.4 : 1, duration: 0.4, ease: "power3.out" });
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    return () => {
      delete document.body.dataset.customCursor;
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        data-q="cursor"
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
        style={{ background: COLORS.bone, mixBlendMode: "difference", zIndex: "var(--z-cursor)" }}
      />
      <div
        ref={ringRef}
        data-q="cursor-ring"
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
        style={{ border: "1px solid rgba(241,240,236,.35)", zIndex: "calc(var(--z-cursor) - 1)" }}
      />
    </>
  );
}
