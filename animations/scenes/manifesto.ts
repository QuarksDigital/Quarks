/**
 * S2 - Manifesto inside the film's inner dimension (Animation Bible §3).
 * Camera-dolly kinetic type: words illuminate crossing the focus plane.
 */
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { register, unregister } from "@/animations/core/timelineRegistry";
import { reportSceneRange } from "@/animations/core/sceneRanges";
import { setHudLabel } from "@/components/persistent/SectionHUD";
import { getEngine } from "@/components/webgl/engine";
import type { Triad } from "@/components/webgl/triad";
import { MANIFESTO } from "@/constants/content";
import { MANIFESTO_KEYS } from "@/constants/scenes";
import { PIN } from "@/constants/motion";
import type { SceneBuildArgs } from "@/hooks/useSceneTrigger";

export interface ManifestoRefs {
  section: HTMLElement | null;
  groups: (HTMLDivElement | null)[];
  filament: SVGPathElement | null;
  monoLine: HTMLParagraphElement | null;
}

export function createManifestoScene({
  refs,
  tier,
  reduced,
}: SceneBuildArgs<ManifestoRefs>): () => void {
  const { section, groups, filament, monoLine } = refs;
  if (!section || !filament || !monoLine || groups.some((g) => !g)) return () => {};
  const g = groups as HTMLDivElement[];

  if (reduced) {
    gsap.set(g, { opacity: 1, filter: "none" });
    gsap.set(monoLine, { opacity: 1 });
    return () => {};
  }

  const depthScale = tier === "desktop" ? 1 : 0.5;
  const splits = g.map((el) => new SplitText(el, { type: "words" }));

  const len = filament.getTotalLength();
  filament.style.strokeDasharray = `${len}`;
  filament.style.strokeDashoffset = `${len}`;

  gsap.set(monoLine, { clipPath: "inset(0 100% 0 0)" });

  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  const windows = [MANIFESTO_KEYS.groupA, MANIFESTO_KEYS.groupB, MANIFESTO_KEYS.groupC];

  windows.forEach((w, i) => {
    const words = splits[i].words as HTMLElement[];
    const dur = w[1] - w[0];
    gsap.set(g[i], { z: -300 * depthScale, opacity: 0.12, filter: "blur(6px)" });
    tl.to(
      g[i],
      { z: 0, opacity: 1, filter: "blur(0px)", duration: dur * 0.15 },
      w[0],
    )
      .to(
        words,
        { color: "#f2f5fa", duration: dur * 0.12, stagger: dur * 0.015 },
        w[0] + dur * 0.04,
      )
      .to(
        g[i],
        { z: 200 * depthScale, opacity: 0.25, filter: "blur(2px)", duration: dur * 0.15 },
        w[0] + dur * 0.85,
      );
  });

  tl.to(
    filament,
    { strokeDashoffset: 0, duration: 0.14, ease: "power1.inOut" },
    MANIFESTO_KEYS.groupC[0] + 0.12,
  )
    .to(
      monoLine,
      { clipPath: "inset(0 0% 0 0)", duration: MANIFESTO_KEYS.particlesLine[1] - MANIFESTO_KEYS.particlesLine[0], ease: "steps(14)" },
      MANIFESTO_KEYS.particlesLine[0],
    )
    .to(
      [...g, monoLine],
      { z: 500 * depthScale, opacity: 0, filter: "blur(4px)", duration: 0.08, ease: "power2.in" },
      MANIFESTO_KEYS.exit[0],
    );

  const st = register(
    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${PIN.manifesto[tier]}vh`,
      pin: true,
      scrub: 1,
      onEnter: () => setHudLabel(MANIFESTO.hudLabel),
      onEnterBack: () => setHudLabel(MANIFESTO.hudLabel),
      onRefresh: (self) => {
        reportSceneRange("manifesto", self);
        // On (re)load / resize, if the manifesto isn't the section in view,
        // make sure its grid + triad background isn't left switched on behind
        // later sections. Deferred a frame so it runs after refresh's onUpdate.
        if (!self.isActive) {
          requestAnimationFrame(() => {
            if (self.isActive) return;
            const e = getEngine();
            e?.setActive("gridWorld", false);
            e?.setActive("triad", false);
          });
        }
      },
      onUpdate: (self) => {
        const p = self.progress;
        tl.progress(p);
        const engine = getEngine();
        if (engine) {
          engine.setActive("gridWorld", true);
          engine.setActive("particleField", true);
          engine.setActive("triad", p > 0.05 && p < 0.96);
          engine.get("gridWorld")?.setProgress(0.2 + p * 0.5);
          const triad = engine.get<Triad>("triad");
          if (triad) {
            triad.setProgress(p);
            triad.setAnchor(3.2 - p * 1.2, 0.6 - p * 0.4, 0);
          }
        }
      },
      onLeaveBack: () => {
        getEngine()?.setActive("triad", false);
      },
    }),
  );

  return () => {
    unregister(st);
    st.kill();
    splits.forEach((s) => s.revert());
  };
}
