"use client";

/**
 * Mount one scene's animation module with proper GSAP lifecycle.
 * Sections stay dumb: they pass refs + a builder from animations/scenes/*.
 */
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/utils/dom";
import type { Tier } from "@/types";

export interface SceneBuildArgs<R> {
  refs: R;
  tier: Tier;
  reduced: boolean;
}

export function useSceneTrigger<R>(
  build: (args: SceneBuildArgs<R>) => void | (() => void),
  refs: R,
  deps: unknown[] = [],
): void {
  const cleanupRef = useRef<void | (() => void)>(undefined);

  useEffect(() => {
    const tier: Tier =
      window.innerWidth >= 1024 ? "desktop" : window.innerWidth >= 640 ? "tablet" : "mobile";
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      cleanupRef.current = build({ refs, tier, reduced });
    });

    return () => {
      if (typeof cleanupRef.current === "function") cleanupRef.current();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
