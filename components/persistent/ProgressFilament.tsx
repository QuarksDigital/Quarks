"use client";

/** Left-edge filament: scaleY grows with document progress; glow dot rides the tip. */
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/utils/dom";

export default function ProgressFilament() {
  const lineRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const line = lineRef.current;
    const dot = dotRef.current;
    if (!line || !dot) return;
    gsap.set(line, { scaleY: 0, transformOrigin: "top center" });

    const st = ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) => {
        gsap.set(line, { scaleY: self.progress });
        gsap.set(dot, { y: self.progress * (window.innerHeight - 48) });
      },
    });
    return () => st.kill();
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-5 top-6 bottom-6 hidden md:block"
      style={{ zIndex: "var(--z-hud)" }}
    >
      <div
        ref={lineRef}
        className="h-full w-px"
        style={{
          background:
            "linear-gradient(to bottom, rgba(56,219,255,0.65), rgba(56,219,255,0.12))",
        }}
      />
      <div
        ref={dotRef}
        className="absolute left-1/2 top-0 h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-cherenkov-500"
        style={{ boxShadow: "0 0 10px 2px rgba(56,219,255,0.7)" }}
      />
    </div>
  );
}
