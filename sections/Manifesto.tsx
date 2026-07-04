"use client";

import { useRef } from "react";
import { useSceneTrigger } from "@/hooks/useSceneTrigger";
import { createManifestoScene, type ManifestoRefs } from "@/animations/scenes/manifesto";
import { MANIFESTO } from "@/constants/content";

export default function Manifesto() {
  const section = useRef<HTMLElement>(null);
  const g0 = useRef<HTMLDivElement>(null);
  const g1 = useRef<HTMLDivElement>(null);
  const g2 = useRef<HTMLDivElement>(null);
  const filament = useRef<SVGPathElement>(null);
  const monoLine = useRef<HTMLParagraphElement>(null);

  useSceneTrigger<ManifestoRefs>((args) => createManifestoScene(args), {
    get section() { return section.current; },
    get groups() { return [g0.current, g1.current, g2.current]; },
    get filament() { return filament.current; },
    get monoLine() { return monoLine.current; },
  });

  const refsArr = [g0, g1, g2];

  return (
    <section
      ref={section}
      aria-label="Manifesto"
      className="relative flex h-screen flex-col items-center justify-center overflow-hidden px-6"
      style={{ zIndex: "var(--z-scene)", perspective: "1200px" }}
    >
      <div className="relative flex flex-col items-center gap-4 text-center">
        {MANIFESTO.lines.map((line, i) => (
          <div
            key={line}
            ref={refsArr[i]}
            className="type-display text-dust will-change-transform"
            style={{ fontSize: "clamp(2rem, 6vw, 5.2rem)", transformStyle: "preserve-3d" }}
          >
            {line}
          </div>
        ))}
        <svg
          aria-hidden="true"
          className="absolute -bottom-6 left-1/2 -translate-x-1/2"
          width="240"
          height="12"
          viewBox="0 0 240 12"
          fill="none"
        >
          <path
            ref={filament}
            d="M2 8 C 60 2, 180 12, 238 5"
            stroke="#38dbff"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 6px rgba(56,219,255,0.8))" }}
          />
        </svg>
      </div>
      <p ref={monoLine} className="type-mono absolute bottom-[18vh] text-cherenkov-300">
        {MANIFESTO.particles}
      </p>
    </section>
  );
}
