"use client";

/** S1 - dumb DOM shell; all motion lives in animations/scenes/hero.ts */
import { useRef } from "react";
import { useSceneTrigger } from "@/hooks/useSceneTrigger";
import { createHeroScene, type HeroRefs } from "@/animations/scenes/hero";
import { HERO } from "@/constants/content";
import { MEDIA } from "@/constants/tokens";

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const videoWrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const subline = useRef<HTMLParagraphElement>(null);
  const hint = useRef<HTMLDivElement>(null);

  useSceneTrigger<HeroRefs>((args) => createHeroScene(args), {
    get section() {
      return section.current;
    },
    get videoWrap() {
      return videoWrap.current;
    },
    get video() {
      return video.current;
    },
    get headline() {
      return headline.current;
    },
    get subline() {
      return subline.current;
    },
    get hint() {
      return hint.current;
    },
  });

  return (
    <section
      ref={section}
      id="top"
      aria-label="Quarks - from invisible to inevitable"
      className="relative h-screen overflow-hidden bg-void"
      style={{ zIndex: "var(--z-scene)" }}
      data-cursor="hero"
      data-cursor-label="SCROLL"
    >
      <div ref={videoWrap} className="absolute inset-0 will-change-transform">
        <video
          ref={video}
          className="h-full w-full object-cover"
          src={MEDIA.heroVideo1080}
          poster={MEDIA.heroPoster}
          muted
          playsInline
          preload="auto"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(4,4,10,0.85) 100%)",
          }}
        />
      </div>

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <h1
          ref={headline}
          className="type-display text-starlight"
          style={{
            fontSize: "clamp(2.3rem, 7.8vw, 7.5rem)",
            textShadow: "0 0 40px rgba(4,4,10,0.6)",
          }}
        >
          From Invisible to Inevitable
          <span className="text-cherenkov-500">.</span>
        </h1>
        {/* <p ref={subline} className="type-mono mt-6 text-dust">
          {SITE.subline} - {SITE.name}
        </p> */}
      </div>

      <div
        ref={hint}
        aria-hidden="true"
        className="type-mono absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-dust"
      >
        <span>{HERO.scrollHint}</span>
        <span className="block h-8 w-px animate-pulse bg-cherenkov-700" />
      </div>
    </section>
  );
}
