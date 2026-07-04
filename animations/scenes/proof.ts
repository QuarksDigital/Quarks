/** S6 — Proof strip: filament draws through the stats; labels unmask (Bible §7). */
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { register, unregister } from "@/animations/core/timelineRegistry";
import { reportSceneRange } from "@/animations/core/sceneRanges";
import { setHudLabel } from "@/components/persistent/SectionHUD";
import { PROOF } from "@/constants/content";
import type { SceneBuildArgs } from "@/hooks/useSceneTrigger";

export interface ProofRefs {
  section: HTMLElement | null;
  line: SVGPathElement | null;
  labels: (HTMLElement | null)[];
}

export function createProofScene({ refs, reduced }: SceneBuildArgs<ProofRefs>): () => void {
  const { section, line, labels } = refs;
  if (!section || !line) return () => {};

  if (reduced) {
    labels.forEach((l) => l && gsap.set(l, { clipPath: "none", opacity: 1 }));
    return () => {};
  }

  const len = line.getTotalLength();
  line.style.strokeDasharray = `${len}`;
  line.style.strokeDashoffset = `${len}`;
  labels.forEach((l) => l && gsap.set(l, { clipPath: "inset(0 100% 0 0)" }));

  const st = register(
    ScrollTrigger.create({
      trigger: section,
      start: "top 75%",
      end: "bottom 60%",
      scrub: 1,
      onEnter: () => setHudLabel(PROOF.hudLabel),
      onEnterBack: () => setHudLabel(PROOF.hudLabel),
      onRefresh: (self) => reportSceneRange("proof", self),
      onUpdate: (self) => {
        gsap.set(line, { strokeDashoffset: len * (1 - self.progress) });
        labels.forEach((l, i) => {
          if (!l) return;
          const local = gsap.utils.clamp(0, 1, (self.progress - i * 0.25) / 0.2);
          gsap.set(l, { clipPath: `inset(0 ${100 - local * 100}% 0 0)` });
        });
      },
    }),
  );

  return () => {
    unregister(st);
    st.kill();
  };
}
