"use client";

import { useEffect, useRef } from "react";
import { useSceneTrigger } from "@/hooks/useSceneTrigger";
import { createForcesScene, type ForcesRefs } from "@/animations/scenes/forces";
import { attachPanelLighting } from "@/animations/interactions/panelLighting";
import { FORCES } from "@/constants/content";

const SYMBOL_PATHS: Record<string, string[]> = {
  experience: [
    "M5 5 L95 5 L95 75 L5 75 Z",
    "M5 5 L95 5 L95 19 L5 19 Z",
    "M15 28 L85 28 L85 68 L15 68 Z",
    "M23 40 L77 40",
    "M23 51 L70 51",
    "M23 60 L62 60",
    "M60 66 L66 72 L60 78 L54 72 Z",
    "M66 72 L74 80",
  ],

  seo: [
    "M8 42 L22 42 L22 80 L8 80 Z",
    "M28 18 L42 18 L42 80 L28 80 Z",
    "M48 30 L62 30 L62 80 L48 80 Z",
    "M4 82 L90 82",
    "M35 38 m-26 0 a26 26 0 1 0 52 0 a26 26 0 1 0 -52 0",
    "M18 52 L26 32 L35 42 L48 18",
    "M55 58 L68 71",
  ],

  performance: [
    "M5 80 A45 45 0 0 1 95 80",
    "M5 80 A45 45 0 0 1 87 38",
    "M50 80 L85 44",
    "M46 42 L40 56 L48 56 L42 70 L58 48 L48 48 L54 42 Z",
  ],

  presence: [
    "M50 50 m-40 0 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0",
    "M10 50 a40 13 0 1 0 80 0 a40 13 0 1 0 -80 0",
    "M20 30 a30 9 0 1 0 60 0 a30 9 0 1 0 -60 0",
    "M20 70 a30 9 0 1 0 60 0 a30 9 0 1 0 -60 0",
    "M50 10 Q64 50 50 90 M50 10 Q36 50 50 90",
    "M50 50 m-48 0 a48 48 0 1 0 96 0 a48 48 0 1 0 -96 0",
    "M50 30 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0",
  ],
};

export default function Forces() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const demoCanvas = useRef<HTMLCanvasElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  useSceneTrigger<ForcesRefs>((args) => createForcesScene(args), {
    get section() {
      return section.current;
    },
    get track() {
      return track.current;
    },
    get intro() {
      return intro.current;
    },
    get chapters() {
      return chapterRefs.current;
    },
    get demoCanvas() {
      return demoCanvas.current;
    },
  });

  useEffect(() => {
    if (!section.current) return;
    return attachPanelLighting(section.current);
  }, []);

  return (
    <section
      ref={section}
      id="forces"
      aria-label="Services - the four fundamental forces"
      className="relative h-screen overflow-hidden"
      style={{ zIndex: "var(--z-scene)" }}
    >
      <canvas
        ref={demoCanvas}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
      />
      <div
        ref={track}
        className="relative h-full w-full"
        style={{ perspective: "1400px" }}
      >
        <div
          ref={intro}
          className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-center"
        >
          <p className="type-mono text-cherenkov-300">
            THE UNIVERSE HAS FOUR FUNDAMENTAL FORCES
          </p>
          <h2
            className="type-display text-starlight"
            style={{ fontSize: "clamp(2.4rem, 6vw, 5.5rem)" }}
          >
            So do we<span className="text-cherenkov-500">.</span>
          </h2>
          <div data-intro-line className="h-px w-64 bg-cherenkov-700" />
        </div>

        {FORCES.map((force, k) => (
          <div
            key={force.id}
            ref={(el) => {
              chapterRefs.current[k] = el;
            }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 lg:flex-row lg:gap-20"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              data-symbol
              className="relative h-40 w-40 shrink-0 lg:h-64 lg:w-64"
            >
              <svg
                viewBox="0 0 100 100"
                className="h-full w-full overflow-visible"
                fill="none"
                aria-hidden="true"
              >
                {SYMBOL_PATHS[force.symbol].map((d, i) => (
                  <path
                    key={i}
                    data-symbol-path
                    d={d}
                    stroke={i === 0 ? "#9ff1ff" : "#38dbff"}
                    strokeWidth={i === 0 ? 1.6 : 1}
                    strokeLinecap="round"
                    style={{
                      filter: "drop-shadow(0 0 6px rgba(56,219,255,0.55))",
                    }}
                  />
                ))}
              </svg>
            </div>

            <div className="flex max-w-xl flex-col items-center gap-5 text-center lg:items-start lg:text-left">
              <p className="type-mono text-dust">{force.index}</p>
              <h3
                data-force-name
                className="type-display text-starlight"
                style={{
                  fontSize: "clamp(2.2rem, 5.5vw, 5rem)",
                  perspective: "800px",
                }}
              >
                {force.name}
              </h3>
              <div
                data-force-panel
                className="glass glass-lit w-full rounded-2xl p-6 text-left"
              >
                <p className="type-mono mb-2 text-cherenkov-300">
                  {force.service}
                </p>
                <p className="text-base leading-relaxed text-starlight/90">
                  {force.line}
                </p>
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
