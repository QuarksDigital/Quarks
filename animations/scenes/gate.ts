/**
 * S6 - the threshold reveal (home -> /services).
 *
 * The charge phase lives on the footer (see scenes/threshold.ts). By the time
 * this runs the line has already filled, so the gate is purely the opening:
 * the QUARKS mark lifts out of the nav corner, centres, and scales through
 * the frame.
 *
 * The mark is a hole in an SVG mask rather than a filled glyph, so /services
 * is genuinely read *through* the letterforms instead of cross-faded behind
 * them. The whole move is scrubbed, so scrolling back runs it in reverse.
 *
 * Progress map
 *   0.00 -> 0.30  the mark travels from the nav corner to centre
 *   0.30 -> 0.92  it scales through the viewport, opening the letterforms
 *   0.92 -> 1.00  the last of the void dissolves
 */
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { EASE, SCRUB } from "@/constants/motion";
import { register, unregister } from "@/animations/core/timelineRegistry";
import { routeStore } from "@/lib/route";
import type { SceneBuildArgs } from "@/hooks/useSceneTrigger";

export interface GateRefs {
  section: HTMLElement | null;
  pin: HTMLElement | null;
  /** full-screen void plate, masked by the wordmark */
  plate: SVGSVGElement | null;
  /** the masking <text> - the hole we travel through */
  mark: SVGTextElement | null;
  services: HTMLElement | null;
}

/** How far the mark grows. Paired with the tail fade, this clears the viewport. */
const MAX_SCALE = 140;

export function createGateScene({ refs, reduced }: SceneBuildArgs<GateRefs>): (() => void) | void {
  const { section, pin, plate, mark, services } = refs;
  if (!section || !pin || !plate || !mark || !services) return;

  if (reduced) {
    // No travel, no scale-through - just hand the section over.
    gsap.set(plate, { autoAlpha: 0 });
    gsap.set(services, { autoAlpha: 1 });
    return;
  }

  gsap.set(mark, { transformOrigin: "50% 50%" });

  /**
   * The glyph is authored at 120px, which is comfortably inside a desktop
   * frame but far wider than a phone: at 390px the word ran off both edges,
   * so the cut-out opened on nothing but the middle two letters.
   *
   * Rather than a media query on a magic font size, measure the rendered word
   * and step it down until it occupies a fixed share of the viewport. Only
   * ever shrinks, so wide screens keep the authored size untouched.
   */
  const BASE_FONT = 120;
  const FIT_RATIO = 0.82;
  const fitFont = (): void => {
    mark.style.fontSize = `${BASE_FONT}px`;
    const natural = mark.getBBox().width;
    if (!natural) return;
    const target = window.innerWidth * FIT_RATIO;
    if (natural > target) {
      mark.style.fontSize = `${Math.max(18, BASE_FONT * (target / natural))}px`;
    }
  };

  /**
   * The mark's rest pose is the nav wordmark. Measured rather than hard-coded
   * so it stays welded to the nav across breakpoints.
   */
  const startPose = { x: 0, y: 0, scale: 1 };
  const measure = (): void => {
    fitFont();
    // The wordmark is hidden on narrow viewports, so fall back to the logo
    // glyph - either way the mark launches from the real nav corner.
    const anchor =
      document.querySelector<HTMLElement>("[data-gate-anchor]") ??
      document.querySelector<HTMLElement>("[data-q='nav-mark']");
    const box = mark.getBBox();
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const r = anchor?.getBoundingClientRect();

    if (r && r.width > 0 && box.width > 0) {
      startPose.scale = Math.max(r.width / box.width, 0.02);
      startPose.x = r.left + r.width / 2 - cx;
      startPose.y = r.top + r.height / 2 - cy;
    } else {
      startPose.scale = 0.09;
      startPose.x = -cx + 96;
      startPose.y = -cy + 40;
    }
    gsap.set(mark, startPose);
  };
  measure();

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: SCRUB,
      pin,
      pinSpacing: false,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: measure,
      onUpdate: (self) => {
        const p = self.progress;
        // Once the mark is travelling, the chrome should already read as /services.
        if (p > 0.25) routeStore.set("/services", "dark");

        // Keep the address bar honest without unmounting anything.
        const path = p > 0.85 ? "/services" : "/";
        if (window.location.pathname !== path) {
          window.history.replaceState(null, "", path);
        }
      },
    },
  });
  register(tl.scrollTrigger as ScrollTrigger);

  tl
    // travel to centre
    .to(mark, { x: 0, y: 0, scale: 1, duration: 0.3, ease: EASE.orbital }, 0)
    // scale through - power2.in so it accelerates as it swallows the frame
    .to(mark, { scale: MAX_SCALE, duration: 0.62, ease: "power2.in" }, 0.3)
    // dissolve the remaining void
    .to(plate, { autoAlpha: 0, duration: 0.08, ease: "none" }, 0.92);

  // The stage behind should already be alive before the mark opens up.
  const behind = gsap.fromTo(
    services,
    { scale: 1.12, autoAlpha: 0.35 },
    {
      scale: 1,
      autoAlpha: 1,
      ease: "none",
      scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: SCRUB },
    },
  );

  return () => {
    unregister(tl.scrollTrigger as ScrollTrigger);
    tl.scrollTrigger?.kill();
    tl.kill();
    behind.scrollTrigger?.kill();
    behind.kill();
  };
}
