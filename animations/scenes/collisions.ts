/**
 * S4 - Collisions (Animation Bible §5).
 * Per case: beams accelerate → impact → circular-mask burst → held drift → collapse.
 * Case media = WebGL displacement planes (desktop) synced to DOM rects.
 */
import { gsap, ScrollTrigger, MotionPathPlugin } from "@/lib/gsap";
import { register, unregister } from "@/animations/core/timelineRegistry";
import { reportSceneRange } from "@/animations/core/sceneRanges";
import { setHudLabel } from "@/components/persistent/SectionHUD";
import { getEngine } from "@/components/webgl/engine";
import type { Displacement } from "@/components/webgl/displacement";
import { COLLISIONS_HUD } from "@/constants/content";
import { COLLISION_KEYS } from "@/constants/scenes";
import { PIN } from "@/constants/motion";
import type { SceneBuildArgs } from "@/hooks/useSceneTrigger";

void MotionPathPlugin;

export interface CollisionBlockRefs {
  block: HTMLElement | null;
  beamL: HTMLDivElement | null;
  beamR: HTMLDivElement | null;
  flash: HTMLDivElement | null;
  media: HTMLDivElement | null;
  mediaImg: HTMLImageElement | null;
  title: HTMLHeadingElement | null;
  meta: HTMLDivElement | null;
  metrics: HTMLDivElement | null;
}

export interface CollisionsRefs {
  wrapper: HTMLElement | null;
  blocks: CollisionBlockRefs[];
}

export function createCollisionsScene({
  refs,
  tier,
  reduced,
}: SceneBuildArgs<CollisionsRefs>): () => void {
  const { wrapper, blocks } = refs;
  if (!wrapper) return () => {};

  if (reduced) {
    blocks.forEach((b) => {
      if (b.media) gsap.set(b.media, { clipPath: "none", opacity: 1 });
      if (b.title) gsap.set(b.title, { opacity: 1 });
      [b.beamL, b.beamR, b.flash].forEach((el) => el && gsap.set(el, { display: "none" }));
    });
    return () => {};
  }

  const sts: ScrollTrigger[] = [];
  const displacement = tier === "desktop" ? getEngine()?.get<Displacement>("displacement") : undefined;

  blocks.forEach((b, idx) => {
    const { block, beamL, beamR, flash, media, mediaImg, title, meta, metrics } = b;
    if (!block || !beamL || !beamR || !flash || !media || !title || !meta || !metrics) return;

    if (displacement && mediaImg) {
      displacement.attach(`case-${idx}`, media, mediaImg.currentSrc || mediaImg.src);
      gsap.set(mediaImg, { opacity: 0.001 });
    }

    const K = COLLISION_KEYS;
    gsap.set(media, { x: "-100%", opacity: 0 });    
    gsap.set([beamL, beamR], { opacity: 0 });
    gsap.set(flash, { opacity: 0 });
    gsap.set(meta, { clipPath: "inset(0 100% 0 0)" });

    const titleSpans = Array.from(title.querySelectorAll<HTMLElement>("[data-line]"));
    gsap.set(titleSpans, { yPercent: 120 });

    const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

    tl.set([beamL, beamR], { opacity: 1 }, K.beams[0])
      .fromTo(
        beamL,
        { x: "-55vw", y: "8vh", rotation: -6 },
        { x: "0vw", y: "0vh", rotation: 0, duration: K.beams[1] - K.beams[0], ease: "power3.in" },
        K.beams[0],
      )
      .fromTo(
        beamR,
        { x: "55vw", y: "-8vh", rotation: -6 },
        { x: "0vw", y: "0vh", rotation: 0, duration: K.beams[1] - K.beams[0], ease: "power3.in" },
        K.beams[0],
      )
      .to([beamL, beamR], { opacity: 0, duration: 0.02 }, K.impact[0])
      .to(flash, { opacity: 0.85, duration: (K.impact[1] - K.impact[0]) / 2, ease: "power2.in" }, K.impact[0])
      .to(flash, { opacity: 0, duration: (K.impact[1] - K.impact[0]) / 2, ease: "power2.out" }, (K.impact[0] + K.impact[1]) / 2)
      .fromTo(
        block,
        { x: 0, y: 0 },
        {
          keyframes: [
            { x: 6, y: -4, duration: 0.008 },
            { x: -5, y: 3, duration: 0.008 },
            { x: 3, y: -2, duration: 0.008 },
            { x: 0, y: 0, duration: 0.008 },
          ],
        },
        K.impact[0],
      )
      .to(media, { x: "0%", opacity: 1, duration: (K.burst[1] - K.burst[0]) * 0.3, ease: "power3.out" }, K.burst[0] - 0.06)
      .to(titleSpans, { yPercent: 0, duration: 0.1, ease: "power3.out", stagger: 0.025 }, K.burst[0] + 0.02)
      .to(meta, { clipPath: "inset(0 0% 0 0)", duration: 0.08, ease: "power2.out" }, K.burst[0] + 0.05)
      .to(media, { y: "-2vh", duration: K.hold[1] - K.hold[0] }, K.hold[0])
      .to(media, { y: "-2vh", duration: K.hold[1] - K.hold[0] }, K.hold[0])
      .to(
          media,
          { x: "100%", opacity: 0, duration: K.exit[1] - K.exit[0], ease: "power2.in" },
          K.exit[0],
        )
      .to([title, meta, metrics], { opacity: 0, y: -30, duration: K.exit[1] - K.exit[0], ease: "power2.in" }, K.exit[0]);

    const st = register(
      ScrollTrigger.create({
        trigger: block,
        start: "top top",
        end: `+=${PIN.collisionEach[tier]}vh`,
        pin: true,
        scrub: 1,
        onEnter: () => setHudLabel(COLLISIONS_HUD),
        onEnterBack: () => setHudLabel(COLLISIONS_HUD),
        onToggle: (self) => {
          if (tier === "desktop") getEngine()?.setActive("displacement", self.isActive);
        },
        onRefresh: (self) => {
          if (idx === 0) reportSceneRange("collisions", self);
        },
        onUpdate: (self) => tl.progress(self.progress),
      }),
    );
    sts.push(st);
  });

  return () => {
    sts.forEach((st) => {
      unregister(st);
      st.kill();
    });
  };
}
