"use client";

/**
 * Lenis drives the scroll; GSAP's ticker drives Lenis (Bible §0.1).
 * Also installs the global debounced ScrollTrigger refresh.
 */
import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { LENIS } from "@/constants/motion";
import { installDebouncedRefresh } from "@/animations/core/timelineRegistry";
import { prefersReducedMotion } from "@/utils/dom";

let lenisInstance: Lenis | null = null;
export const getLenis = (): Lenis | null => lenisInstance;

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      lerp: LENIS.lerp,
      wheelMultiplier: LENIS.wheelMultiplier,
      touchMultiplier: LENIS.touchMultiplier,
    });
    lenisInstance = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const removeResize = installDebouncedRefresh();

    return () => {
      removeResize();
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return <>{children}</>;
}
