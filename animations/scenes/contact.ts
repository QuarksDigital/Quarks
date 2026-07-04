/**
 * S7 — Gravity Well (Animation Bible §7).
 * Particles in-fall, the triad returns and condenses into the CTA core,
 * headline words gravity-fall into place, footer rises.
 */
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { register, unregister } from "@/animations/core/timelineRegistry";
import { reportSceneRange } from "@/animations/core/sceneRanges";
import { setHudLabel } from "@/components/persistent/SectionHUD";
import { getEngine } from "@/components/webgl/engine";
import type { ParticleField } from "@/components/webgl/particleField";
import type { Triad } from "@/components/webgl/triad";
import { CONTACT } from "@/constants/content";
import { CONTACT_KEYS } from "@/constants/scenes";
import { PIN } from "@/constants/motion";
import { window01 } from "@/utils/math";
import type { SceneBuildArgs } from "@/hooks/useSceneTrigger";

export interface ContactRefs {
  section: HTMLElement | null;
  pinned: HTMLDivElement | null;
  headline: HTMLHeadingElement | null;
  rows: HTMLDivElement | null;
  footer: HTMLDivElement | null;
  cta: HTMLDivElement | null;
}

export function createContactScene({ refs, tier, reduced }: SceneBuildArgs<ContactRefs>): () => void {
  const { section, pinned, headline, rows, footer, cta } = refs;
  if (!section || !pinned || !headline || !rows || !footer || !cta) return () => {};

  if (reduced) {
    gsap.set([headline, rows, footer, cta], { opacity: 1, y: 0 });
    return () => {};
  }

  const split = new SplitText(headline, { type: "words" });
  const words = split.words as HTMLElement[];
  gsap.set(words, { y: -80, opacity: 0, rotation: () => gsap.utils.random(-6, 6) });
  gsap.set(rows, { clipPath: "inset(0 100% 0 0)" });
  gsap.set(footer, { yPercent: 60, opacity: 0 });
  gsap.set(cta, { scale: 0.7, opacity: 0 });

  const K = CONTACT_KEYS;
  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

  tl.to(
    words,
    {
      y: 0,
      opacity: 1,
      rotation: 0,
      duration: K.headline[1] - K.headline[0],
      ease: "power4.out",
      stagger: (K.headline[1] - K.headline[0]) * 0.18,
    },
    K.headline[0],
  )
    .to(cta, { scale: 1, opacity: 1, duration: 0.18, ease: "back.out(1.6)" }, K.merge[0] + 0.05)
    .to(rows, { clipPath: "inset(0 0% 0 0)", duration: 0.16, ease: "power2.out" }, K.headline[0] + 0.18)
    .to(footer, { yPercent: 0, opacity: 1, duration: K.footer[1] - K.footer[0], ease: "power2.out" }, K.footer[0]);

  const st = register(
    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${PIN.contact[tier]}vh`,
      pin: pinned,
      scrub: 1,
      onEnter: () => setHudLabel(CONTACT.hudLabel),
      onEnterBack: () => setHudLabel(CONTACT.hudLabel),
      onRefresh: (self) => reportSceneRange("contact", self),
      onUpdate: (self) => {
        const p = self.progress;
        tl.progress(p);
        const engine = getEngine();
        if (!engine) return;

        engine.setActive("particleField", true);
        const field = engine.get<ParticleField>("particleField");
        if (field) {
          field.setMode("well");
          field.setWellStrength(window01(p, K.infall[0], K.infall[1]));
        }

        const triadOn = p > K.infall[0] + 0.05 && p < K.merge[1];
        engine.setActive("triad", triadOn);
        const triad = engine.get<Triad>("triad");
        if (triad && triadOn) {
          const t = window01(p, K.infall[0], K.merge[1]);
          const spiral = (1 - t) * Math.PI * 5;
          const r = (1 - t) * 9;
          triad.setAnchor(Math.cos(spiral) * r, Math.sin(spiral) * r * 0.5, 0);
          triad.setRadius(0.9 * (1 - t) + 0.15);
        }
      },
      onLeaveBack: () => {
        const engine = getEngine();
        engine?.get<ParticleField>("particleField")?.setMode("cosmos");
        engine?.setActive("triad", false);
      },
    }),
  );

  return () => {
    unregister(st);
    st.kill();
    split.revert();
  };
}
