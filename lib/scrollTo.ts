/**
 * "Go to route section" helper - Lenis when it exists, native otherwise.
 *
 * Two special cases the naive version gets wrong:
 *
 * 1. /services on the home page lives *inside* the pinned scroll gate, so its
 *    bounding box reports the pinned position rather than a document offset.
 *    We target the end of the gate runway instead, which is exactly where the
 *    reveal completes.
 * 2. On the standalone /services route the home sections don't exist at all,
 *    so fall back to a real navigation with the hash.
 */
import { getLenis } from "@/components/providers/SmoothScrollProvider";

export function scrollToRoute(route: string): void {
  if (route === "/services") {
    const gate = document.getElementById("threshold");
    if (gate) {
      const end = gate.offsetTop + gate.offsetHeight - window.innerHeight;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(end, { duration: 2.2 });
      else window.scrollTo({ top: end, behavior: "smooth" });
      return;
    }
    // Already on the standalone route - nothing to scroll.
    if (document.getElementById("services")) return;
    window.location.href = "/services";
    return;
  }

  const sec = document.querySelector<HTMLElement>(`[data-route="${route}"]`);
  if (!sec) {
    // Different document (e.g. the standalone services page): hand off to the
    // browser and let the hash land us in the right section.
    window.location.href = route === "/" ? "/" : `/#${route.slice(1)}`;
    return;
  }

  const y = sec.getBoundingClientRect().top + window.scrollY + 2;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(y, { duration: 1.5 });
  else window.scrollTo({ top: y, behavior: "smooth" });
}
