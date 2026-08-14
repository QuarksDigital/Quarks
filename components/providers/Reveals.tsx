"use client";

/**
 * Installs the shared entrance choreography and the magnetic hover pass once
 * the tree is on the page, and refreshes after fonts land (metrics shift, so
 * trigger positions do too).
 *
 * Magnetic binding lives here rather than in the nav: it is a document-wide
 * sweep over [data-magnetic], and it has to run after the sections mount.
 */
import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { installReveals } from "@/animations/interactions/reveal";
import { attachMagnetic } from "@/animations/interactions/magnetic";
import { prefersReducedMotion } from "@/utils/dom";

export default function Reveals() {
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const teardownReveals = installReveals(document, reduced);
    const detachMagnetic = attachMagnetic(document);

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      teardownReveals();
      detachMagnetic();
    };
  }, []);

  return null;
}
