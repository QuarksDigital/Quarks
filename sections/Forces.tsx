"use client";

import { useEffect, useRef } from "react";
import { useSceneTrigger } from "@/hooks/useSceneTrigger";
import { createForcesScene, type ForcesRefs } from "@/animations/scenes/forces";
import { attachPanelLighting } from "@/animations/interactions/panelLighting";
import { FORCES } from "@/constants/content";

const SYMBOL_PATHS: Record<string, string[]> = {
  strong: [
    "M50 16 L82 72 L18 72 Z",
    "M50 40 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0",
    "M50 16 L50 40 M82 72 L62 52 M18 72 L38 52",
  ],
  electromagnetic: [
    "M8 50 C 34 8, 66 8, 92 50",
    "M8 50 C 34 92, 66 92, 92 50",
    "M8 50 C 40 26, 60 26, 92 50",
    "M8 50 C 40 74, 60 74, 92 50",
    "M8 50 L 92 50",
  ],
  weak: [
    "M50 42 A 8 8 0 1 1 42 50",
    "M50 28 A 22 22 0 1 1 28 50",
    "M50 12 A 38 38 0 1 1 12 50",
  ],
  gravity: [
    "M50 50 m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0",
    "M50 50 m-24 0 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0",
    "M50 50 m-38 0 a38 38 0 1 0 76 0 a38 38 0 1 0 -76 0",
    "M88 50 a2.5 2.5 0 1 0 0.1 0",
  ],
};

export default function Forces() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const demoCanvas = useRef<HTMLCanvasElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);

  useSceneTrigger<ForcesRefs>((args) => createForcesScene(args), {
    get section() { return section.current; },
    get track() { return track.current; },
    get intro() { return intro.current; },
    get chapters() { return chapterRefs.current; },
    get demoCanvas() { return demoCanvas.current; },
  });

  useEffect(() => {
    if (!section.current) return;
    return attachPanelLighting(section.current);
  }, []);

  return (
    <section
      ref={section}
      id="forces"
      aria-label="Services — the four fundamental forces"
      className="relative h-screen overflow-hidden"
      style={{ zIndex: "var(--z-scene)" }}
    >
      <canvas
        ref={demoCanvas}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
      />
      <div ref={track} className="relative h-full w-full" style={{ perspective: "1400px" }}>
        <div
          ref={intro}
          className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center"
        >
          <p className="type-mono text-cherenkov-300">PHYSICS HAS EXACTLY FOUR FUNDAMENTAL FORCES</p>
          <h2 className="type-display text-starlight" style={{ fontSize: "clamp(2.4rem, 6vw, 5.5rem)" }}>
            So do we<span className="text-cherenkov-500">.</span>
          </h2>
          <div data-intro-line className="h-px w-64 bg-cherenkov-700" />
        </div>

        {FORCES.map((force, k) => (
          <div
            key={force.id}
            ref={(el) => { chapterRefs.current[k] = el; }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 lg:flex-row lg:gap-20"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div data-symbol className="relative h-40 w-40 shrink-0 lg:h-64 lg:w-64">
              <svg viewBox="0 0 100 100" className="h-full w-full" fill="none" aria-hidden="true">
                {SYMBOL_PATHS[force.symbol].map((d, i) => (
                  <path
                    key={i}
                    data-symbol-path
                    d={d}
                    stroke={i === 0 ? "#9ff1ff" : "#38dbff"}
                    strokeWidth={i === 0 ? 1.6 : 1}
                    strokeLinecap="round"
                    style={{ filter: "drop-shadow(0 0 6px rgba(56,219,255,0.55))" }}
                  />
                ))}
              </svg>
            </div>

            <div className="flex max-w-xl flex-col items-center gap-5 text-center lg:items-start lg:text-left">
              <p className="type-mono text-dust">{force.index}</p>
              <h3
                data-force-name
                className="type-display text-starlight"
                style={{ fontSize: "clamp(2.2rem, 5.5vw, 5rem)", perspective: "800px" }}
              >
                {force.name}
              </h3>
              <div data-force-panel className="glass glass-lit w-full rounded-2xl p-6 text-left">
                <p className="type-mono mb-2 text-cherenkov-300">{force.service}</p>
                <p className="text-base leading-relaxed text-starlight/90">{force.line}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {force.tags.map((t) => (
                    <span
                      key={t}
                      className="type-mono rounded-full border border-white/10 px-3 py-1 text-dust"
                      style={{ fontSize: "0.6rem" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
