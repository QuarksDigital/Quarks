/**
 * QUARKS - single GSAP import point.
 * Import gsap ONLY from this module; plugins are registered exactly once.
 * Client-only: never import from a Server Component.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

if (typeof window !== "undefined" && !(gsap as unknown as { __quarks?: boolean }).__quarks) {
  gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin);
  gsap.defaults({ ease: "expo.out", duration: 0.8 });
  ScrollTrigger.defaults({ anticipatePin: 1, fastScrollEnd: true });
  (gsap as unknown as { __quarks?: boolean }).__quarks = true;
}

export { gsap, ScrollTrigger, SplitText, MotionPathPlugin };
