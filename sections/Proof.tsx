"use client";

import { useRef } from "react";
import { useSceneTrigger } from "@/hooks/useSceneTrigger";
import { createProofScene, type ProofRefs } from "@/animations/scenes/proof";
import Odometer from "@/components/ui/Odometer";
import { PROOF } from "@/constants/content";

export default function Proof() {
  const section = useRef<HTMLElement>(null);
  const line = useRef<SVGPathElement>(null);
  const labelRefs = useRef<(HTMLElement | null)[]>(Array(PROOF.stats.length).fill(null));

  useSceneTrigger<ProofRefs>((args) => createProofScene(args), {
    get section() { return section.current; },
    get line() { return line.current; },
    get labels() { return labelRefs.current; },
  });

  return (
    <section
      ref={section}
      aria-label="Proof"
      className="relative flex min-h-[80vh] items-center overflow-hidden px-6 lg:px-24"
      style={{ zIndex: "var(--z-scene)" }}
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-1/2 w-full -translate-y-1/2"
        height="120"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          ref={line}
          d="M0 80 C 200 20, 380 110, 600 60 C 820 10, 1000 100, 1200 40"
          stroke="rgba(56,219,255,0.5)"
          strokeWidth="1"
          style={{ filter: "drop-shadow(0 0 6px rgba(56,219,255,0.5))" }}
        />
      </svg>

      <div className="relative grid w-full grid-cols-1 gap-14 py-24 md:grid-cols-3">
        {PROOF.stats.map((s, i) => (
          <div key={s.label} className="flex flex-col items-center gap-3 text-center">
            <span className="type-display text-5xl text-starlight lg:text-7xl">
              <Odometer value={s.value} suffix={s.suffix} />
            </span>
            <span
              ref={(el) => { labelRefs.current[i] = el; }}
              className="type-mono text-dust"
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
