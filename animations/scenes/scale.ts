/**
 * S5 — The Scale (Animation Bible §6): one continuous zoom-out through
 * six nested shells (10³× each), process steps emerging at their magnitude.
 */
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { register, unregister } from "@/animations/core/timelineRegistry";
import { reportSceneRange } from "@/animations/core/sceneRanges";
import { setHudLabel } from "@/components/persistent/SectionHUD";
import { getEngine } from "@/components/webgl/engine";
import type { ParticleField } from "@/components/webgl/particleField";
import { SCALE_HUD } from "@/constants/content";
import { SCALE_SHELL_STEP, SCALE_SHELL_WINDOW, SCALE_STEP_AT } from "@/constants/scenes";
import { PIN } from "@/constants/motion";
import type { SceneBuildArgs } from "@/hooks/useSceneTrigger";

export interface ScaleRefs {
  section: HTMLElement | null;
  shells: (HTMLDivElement | null)[];
  steps: (HTMLDivElement | null)[];
  ruler: HTMLDivElement | null;
}

export function createScaleScene({ refs, tier, reduced }: SceneBuildArgs<ScaleRefs>): () => void {
  const { section, shells, steps, ruler } = refs;
  if (!section || shells.some((s) => !s) || steps.some((s) => !s)) return () => {};
  const sh = shells as HTMLDivElement[];
  const stps = steps as HTMLDivElement[];

  if (reduced) {
    sh.forEach((s, i) => gsap.set(s, { scale: 0.4 + i * 0.12, opacity: i === sh.length - 1 ? 0.8 : 0.25 }));
    gsap.set(stps, { opacity: 1, x: 0, filter: "none" });
    return () => {};
  }

  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

  sh.forEach((shell, k) => {
    const w0 = SCALE_SHELL_STEP * k;
    const w1 = Math.min(w0 + SCALE_SHELL_WINDOW, 1);
    const dur = w1 - w0;
    const dir = k % 2 === 0 ? 1 : -1;
    gsap.set(shell, { scale: 0.02, opacity: 0, rotation: dir * -8 });
    tl.to(shell, { opacity: 1, duration: dur * 0.25, ease: "power1.out" }, w0)
      .to(shell, { scale: 40, rotation: dir * 8, duration: dur, ease: "power2.in" }, w0)
      .to(shell, { opacity: 0, duration: dur * 0.3, ease: "power1.in" }, w1 - dur * 0.3);
  });

  stps.forEach((step, i) => {
    const at = SCALE_STEP_AT[i];
    gsap.set(step, { x: 60, opacity: 0, filter: "blur(4px)" });
    tl.to(step, { x: 0, opacity: 1, filter: "blur(0px)", duration: 0.06, ease: "power2.out" }, at);
    if (i > 0) {
      tl.to(
        stps[i - 1],
        { z: -200, opacity: 0.25, filter: "blur(3px)", duration: 0.06, ease: "power2.in" },
        at,
      );
    }
  });

  if (ruler) {
    gsap.set(ruler, { yPercent: 0 });
    tl.to(ruler, { yPercent: -70, duration: 1 }, 0);
  }

  const st = register(
    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${PIN.scale[tier]}vh`,
      pin: true,
      scrub: 1,
      onEnter: () => setHudLabel(SCALE_HUD),
      onEnterBack: () => setHudLabel(SCALE_HUD),
      onRefresh: (self) => reportSceneRange("scale", self),
      onUpdate: (self) => {
        tl.progress(self.progress);
        const engine = getEngine();
        if (engine) {
          const cosmic = self.progress > 0.8;
          engine.setActive("particleField", cosmic);
          if (cosmic) engine.get<ParticleField>("particleField")?.setMode("cosmos");
        }
      },
    }),
  );

  return () => {
    unregister(st);
    st.kill();
  };
}
