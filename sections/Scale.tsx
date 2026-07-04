"use client";

import { useRef } from "react";
import { useSceneTrigger } from "@/hooks/useSceneTrigger";
import { createScaleScene, type ScaleRefs } from "@/animations/scenes/scale";
import { SCALE_STEPS } from "@/constants/content";
import { SCALE_SHELLS } from "@/constants/scenes";

const SHELL_RINGS: Record<string, number[]> = {
  quark: [6],
  nucleus: [10, 16],
  atom: [12, 26, 40],
  lattice: [18, 30, 44],
  network: [22, 36, 48],
  cosmos: [26, 40, 49],
};

export default function Scale() {
  const section = useRef<HTMLElement>(null);
  const shellRefs = useRef<(HTMLDivElement | null)[]>(Array(6).fill(null));
  const stepRefs = useRef<(HTMLDivElement | null)[]>(Array(5).fill(null));
  const ruler = useRef<HTMLDivElement>(null);

  useSceneTrigger<ScaleRefs>((args) => createScaleScene(args), {
    get section() { return section.current; },
    get shells() { return shellRefs.current; },
    get steps() { return stepRefs.current; },
    get ruler() { return ruler.current; },
  });

  return (
    <section
      ref={section}
      id="scale"
      aria-label="Process — from quark to cosmos"
      className="relative h-screen overflow-hidden"
      style={{ zIndex: "var(--z-scene)" }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {SCALE_SHELLS.map((name, k) => (
          <div
            key={name}
            ref={(el) => { shellRefs.current[k] = el; }}
            className="absolute h-[70vmin] w-[70vmin] will-change-transform"
            aria-hidden="true"
          >
            <svg viewBox="0 0 100 100" className="h-full w-full" fill="none">
              {SHELL_RINGS[name].map((r, i) => (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r={r}
                  stroke={i === 0 ? "rgba(159,241,255,0.7)" : "rgba(56,219,255,0.35)"}
                  strokeWidth={i === 0 ? 0.5 : 0.3}
                  strokeDasharray={k > 2 ? "1.5 2.5" : undefined}
                />
              ))}
              {name === "cosmos" &&
                Array.from({ length: 40 }, (_, i) => (
                  <circle
                    key={`s${i}`}
                    cx={(i * 37) % 100}
                    cy={(i * 61) % 100}
                    r="0.35"
                    fill="rgba(232,252,255,0.8)"
                  />
                ))}
            </svg>
            <span
              className="type-mono absolute left-1/2 top-2 -translate-x-1/2 text-dust"
              style={{ fontSize: "0.55rem", letterSpacing: "0.3em" }}
            >
              {name.toUpperCase()}
            </span>
          </div>
        ))}

        <div
          aria-hidden="true"
          className="absolute h-2 w-2 rounded-full bg-whitehot"
          style={{ boxShadow: "0 0 18px 5px rgba(56,219,255,0.9)" }}
        />
      </div>

      <div className="absolute left-6 top-1/2 flex max-w-md -translate-y-1/2 flex-col gap-6 lg:left-24">
        <p className="type-mono text-cherenkov-300">HOW MATTER GETS MADE</p>
        {SCALE_STEPS.map((s, i) => (
          <div
            key={s.name}
            ref={(el) => { stepRefs.current[i] = el; }}
            className="will-change-transform"
          >
            <p className="type-mono text-dust" style={{ fontSize: "0.6rem" }}>
              {s.index}
            </p>
            <h3 className="type-display text-2xl text-starlight lg:text-4xl">{s.name}</h3>
            <p className="mt-1 max-w-sm text-sm text-dust">{s.line}</p>
          </div>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="absolute right-8 top-0 hidden h-full overflow-hidden lg:block"
      >
        <div ref={ruler} className="flex flex-col gap-10 pt-[20vh]">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="block h-px w-6 bg-white/20" />
              <span className="type-mono text-dust" style={{ fontSize: "0.5rem" }}>
                10^{-18 + i * 2}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
