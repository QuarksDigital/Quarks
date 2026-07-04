"use client";

/** Bottom-right mono scale readout — the whole site is one zoom-out (Bible §0.4). */
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { exponentAt } from "@/lib/scale";
import { prefersReducedMotion } from "@/utils/dom";

export default function ScaleReadout() {
  const ref = useRef<HTMLDivElement>(null);
  const expRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = expRef.current;
    if (!el) return;
    let current = -18;
    el.textContent = "-18";

    const st = ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) => {
        const n = exponentAt(self.progress);
        if (n !== current) {
          current = n;
          el.textContent = String(n);
          gsap.fromTo(
            ref.current,
            { opacity: 0.35 },
            { opacity: 1, duration: 0.25, ease: "power2.out" },
          );
        }
      },
    });
    return () => st.kill();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="type-mono fixed bottom-5 right-5 text-dust select-none"
      style={{ zIndex: "var(--z-hud)" }}
    >
      SCALE 10<sup ref={expRef} className="text-cherenkov-500">-18</sup> m
    </div>
  );
}
