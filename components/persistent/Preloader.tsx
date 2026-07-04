"use client";

/**
 * S0 — the protagonist is born (Animation Bible §1).
 * Counter accelerates 0→100, ring charges + collapses into the orb,
 * iris reveal hands the orb off to the hero video's particle position.
 */
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/utils/dom";

export default function Preloader() {
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const counter = counterRef.current;
    const orbEl = orbRef.current;
    const ring = ringRef.current;
    if (!root || !counter || !orbEl || !ring) return;

    if (prefersReducedMotion()) {
      const t = setTimeout(() => setDone(true), 500);
      return () => clearTimeout(t);
    }

    document.documentElement.style.overflow = "hidden";
    const C = 2 * Math.PI * 44;
    ring.style.strokeDasharray = `${C}`;
    ring.style.strokeDashoffset = `${C}`;

    const state = { n: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.style.overflow = "";
        setDone(true);
      },
    });

    tl.fromTo(orbEl, { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(2)" }, 0.2)
      .to(
        state,
        {
          n: 100,
          duration: 2,
          ease: "power2.inOut",
          onUpdate: () => {
            counter.textContent = String(Math.round(state.n)).padStart(3, "0");
          },
        },
        0.2,
      )
      .to(ring, { strokeDashoffset: 0, duration: 2, ease: "power2.inOut" }, 0.2)
      .to(ring, { rotation: 270, transformOrigin: "50% 50%", duration: 2, ease: "none" }, 0.2)
      .to(ring, { scale: 0.1, opacity: 0, transformOrigin: "50% 50%", duration: 0.35, ease: "expo.in" }, 2.25)
      .to(orbEl, { scale: 1.6, duration: 0.18, ease: "power2.out" }, 2.3)
      .to(orbEl, { scale: 1, duration: 0.25, ease: "power2.inOut" }, 2.48)
      .to(
        root,
        {
          clipPath: "circle(0% at 50% 46%)",
          duration: 0.9,
          ease: "expo.inOut",
        },
        2.6,
      );

    return () => {
      tl.kill();
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 flex items-center justify-center bg-void"
      style={{ zIndex: "var(--z-preloader)", clipPath: "circle(150% at 50% 46%)" }}
      aria-label="Loading"
    >
      <div className="relative flex items-center justify-center" style={{ marginTop: "-8vh" }}>
        <svg width="120" height="120" viewBox="0 0 100 100" aria-hidden="true">
          <circle
            ref={ringRef}
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="rgba(56,219,255,0.7)"
            strokeWidth="1"
          />
        </svg>
        <div
          ref={orbRef}
          className="absolute h-3 w-3 rounded-full bg-whitehot"
          style={{ boxShadow: "0 0 22px 6px rgba(56,219,255,0.85)" }}
        />
      </div>
      <span
        ref={counterRef}
        className="type-mono absolute bottom-8 left-8 text-dust"
        aria-hidden="true"
      >
        000
      </span>
    </div>
  );
}
