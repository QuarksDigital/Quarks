/**
 * S1 - The Void (Animation Bible §2).
 * The 16s "Genesis" film IS the camera; scroll is the projector.
 * Ends by dissolving into the live GridWorld set - no cut, no flash.
 */
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { register, unregister } from "@/animations/core/timelineRegistry";
import { reportSceneRange } from "@/animations/core/sceneRanges";
import { createVideoScrubber } from "@/animations/interactions/videoScrub";
import { setHudLabel } from "@/components/persistent/SectionHUD";
import { getEngine } from "@/components/webgl/engine";
import { HERO } from "@/constants/content";
import { HERO_KEYS } from "@/constants/scenes";
import { PIN } from "@/constants/motion";
import { window01 } from "@/utils/math";
import type { SceneBuildArgs } from "@/hooks/useSceneTrigger";

export interface HeroRefs {
  section: HTMLElement | null;
  videoWrap: HTMLDivElement | null;
  video: HTMLVideoElement | null;
  headline: HTMLHeadingElement | null;
  subline: HTMLParagraphElement | null;
  hint: HTMLDivElement | null;
}

export function createHeroScene({ refs, tier, reduced }: SceneBuildArgs<HeroRefs>): () => void {
  const { section, video, videoWrap, headline, subline, hint } = refs;
  // subline is optional - the element may be commented out in the DOM shell.
  if (!section || !video || !headline || !hint || !videoWrap) return () => {};

  if (reduced) {
    gsap.set(subline ? [headline, subline] : headline, { opacity: 1 });
    gsap.set(hint, { opacity: 0 });
    return () => {};
  }

  const scrubber = createVideoScrubber(video);
  const prime = () => scrubber.prime();
  window.addEventListener("pointerdown", prime, { once: true });
  window.addEventListener("wheel", prime, { once: true, passive: true });
  window.addEventListener("touchstart", prime, { once: true, passive: true });
  scrubber.prime();

  scrubber.onStallDegrade = () => getEngine()?.degrade();

  const split = new SplitText(headline, { type: "chars", charsClass: "will-change-transform" });
  const chars = split.chars as HTMLElement[];
  const vectors = chars.map(() => ({
    x: gsap.utils.random(-40, 40) + "vw",
    y: gsap.utils.random(-18, 18) + "vh",
    z: gsap.utils.random(-700, -420),
    rx: gsap.utils.random(-80, 80),
  }));
  const exitVectors = chars.map((_, i) => ({
    x: gsap.utils.random(-30, 30) + "vw",
    y: gsap.utils.random(-14, 14) + "vh",
    z: 420 + (i % 5) * 60,
    rx: gsap.utils.random(-50, 50),
  }));

  gsap.set(headline, { perspective: 1000 });
  gsap.set(chars, {
    x: (i: number) => vectors[i].x,
    y: (i: number) => vectors[i].y,
    z: (i: number) => vectors[i].z,
    rotationX: (i: number) => vectors[i].rx,
    opacity: 0,
  });
  if (subline) gsap.set(subline, { clipPath: "inset(0 100% 0 0)" });

  const [tIn0, tIn1] = HERO_KEYS.taglineIn;
  const [tHold0, tHold1] = HERO_KEYS.actOne;
  const [tOut0, tOut1] = HERO_KEYS.glyphOut;
  const [tHand0] = HERO_KEYS.handoff;

  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

  tl.to(
    chars,
    {
      x: 0,
      y: 0,
      z: 0,
      rotationX: 0,
      opacity: 1,
      duration: tIn1 - tIn0,
      ease: "expo.out",
      stagger: { amount: (tIn1 - tIn0) * 0.6, from: "random" },
    },
    tIn0,
  )
    .to(headline, { y: "-6vh", z: 120, duration: tHold1 - tHold0 }, tHold0)
    .to(
      chars,
      {
        x: (i: number) => exitVectors[i].x,
        y: (i: number) => exitVectors[i].y,
        z: (i: number) => exitVectors[i].z,
        rotationX: (i: number) => exitVectors[i].rx,
        opacity: 0,
        duration: tOut1 - tOut0,
        ease: "power2.in",
        stagger: { amount: (tOut1 - tOut0) * 0.4, from: "center" },
      },
      tOut0,
    )
    .to(hint, { opacity: 0, duration: 0.06 }, 0.12)
    .to(videoWrap, { opacity: 0, duration: 1 - tHand0, ease: "power1.inOut" }, tHand0);

  const st = register(
    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${PIN.hero[tier]}vh`,
      pin: true,
      scrub: 1,
      onEnter: () => setHudLabel(HERO.hudLabel),
      onEnterBack: () => setHudLabel(HERO.hudLabel),
      onRefresh: (self) => reportSceneRange("hero", self),
      onUpdate: (self) => {
        const p = self.progress;
        scrubber.setProgress(p);
        tl.progress(p);

        const engine = getEngine();
        if (engine) {
          const on = p >= tHand0 - 0.04;
          engine.setActive("gridWorld", on);
          engine.setActive("particleField", on);
          if (on) engine.get("gridWorld")?.setProgress(window01(p, tHand0, 1) * 0.2);
        }
      },
    }),
  );

  const idle = gsap.to(videoWrap, {
    scale: 1.015,
    duration: 4,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });
  const stopIdle = ScrollTrigger.create({
    start: 10,
    onEnter: () => {
      idle.kill();
      gsap.to(videoWrap, { scale: 1, duration: 0.8, ease: "power2.out" });
    },
  });

  return () => {
    unregister(st);
    st.kill();
    stopIdle.kill();
    idle.kill();
    scrubber.destroy();
    split.revert();
    window.removeEventListener("pointerdown", prime);
    window.removeEventListener("wheel", prime);
    window.removeEventListener("touchstart", prime);
  };
}
