"use client";

/**
 * QUARKS - S6, the threshold reveal.
 *
 * Follows the footer's line loader. The QUARKS mark lifts out of the nav
 * corner, centres, and scales through the frame. The mark is an SVG mask
 * hole, so /services is genuinely read *through* the letterforms rather than
 * cross-faded behind them.
 *
 * The whole move is scrubbed, so scrolling back runs it in reverse exactly.
 */
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useSceneTrigger } from "@/hooks/useSceneTrigger";
import { createGateScene, type GateRefs } from "@/animations/scenes/gate";
import ServicesExperience from "@/components/services/ServicesExperience";
import { SITE } from "@/constants/content";
import { COLORS } from "@/constants/tokens";

export default function ScrollGate() {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const plate = useRef<SVGSVGElement>(null);
  const mark = useRef<SVGTextElement>(null);
  const services = useRef<HTMLDivElement>(null);

  useSceneTrigger<GateRefs>((args) => createGateScene(args), {
    get section() {
      return section.current;
    },
    get pin() {
      return pin.current;
    },
    get plate() {
      return plate.current;
    },
    get mark() {
      return mark.current;
    },
    get services() {
      return services.current;
    },
  });

  // The mask geometry is measured from a rendered glyph, so wait for the face.
  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      ref={section}
      id="threshold"
      aria-label="Continue to services"
      className="relative"
      /*
       * Pulled up by exactly the threshold pin's spacer. Contact pins its
       * inner wrapper for one screen while the loader fills, and pinSpacing
       * reserves that screen at the foot of the section - which otherwise
       * reads as a blank void between the footer and the reveal. Starting the
       * gate underneath it means the pinned services stage occupies that
       * space instead, and the hand-off is seamless.
       */
      style={{ height: "240vh", marginTop: "-100vh", zIndex: "var(--z-scene)" }}
    >
      <div ref={pin} className="relative h-screen w-full overflow-hidden">
        {/* The destination, live underneath from the first pixel of scroll. */}
        <div ref={services} className="absolute inset-0">
          <ServicesExperience />
        </div>

        {/* The void plate. Its only holes are the letters of the mark. */}
        <svg
          ref={plate}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ zIndex: 2 }}
        >
          <defs>
            <mask id="quarks-gate-mask" maskUnits="userSpaceOnUse">
              <rect x="-100%" y="-100%" width="300%" height="300%" fill="#ffffff" />
              <text
                ref={mark}
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="central"
                fill="#000000"
                style={{
                  fontFamily: '"Switzer", sans-serif',
                  fontWeight: 600,
                  fontSize: "120px",
                  letterSpacing: "-0.04em",
                }}
              >
                {SITE.name}
              </text>
            </mask>
          </defs>
          <rect
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
            fill={COLORS.void}
            mask="url(#quarks-gate-mask)"
          />
        </svg>
      </div>
    </section>
  );
}
