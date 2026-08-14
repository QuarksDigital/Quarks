"use client";

/**
 * A counter and a hairline bar fill together, the mark falls away, and the
 * plate lifts off the top of the screen to hand over to the hero intro.
 * Scroll is locked until it clears.
 */
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { getLenis } from "@/components/providers/SmoothScrollProvider";
import { playHeroIntro } from "@/animations/scenes/hero";
import { PRELOADER, SITE } from "@/constants/content";
import { COLORS } from "@/constants/tokens";
import { prefersReducedMotion } from "@/utils/dom";

export default function Preloader() {
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const markRef = useRef<HTMLImageElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      // Skip the sequence, but still hand off on a frame boundary rather than
      // synchronously inside the effect (which would cascade a second render).
      playHeroIntro(true);
      const id = requestAnimationFrame(() => setDone(true));
      return () => cancelAnimationFrame(id);
    }

    const lenis = getLenis();
    lenis?.stop();

    const counter = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        lenis?.start();
        setDone(true);
      },
    });

    tl.to(barRef.current, { scaleX: 1, duration: 1.5, ease: "power2.inOut" }, 0)
      .to(
        counter,
        {
          v: 100,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            if (numRef.current) {
              numRef.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
            }
          },
        },
        0,
      )
      .to(markRef.current, { scale: 0.72, opacity: 0, duration: 0.6, ease: "power3.in" }, 1.35)
      .to(root, { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, 1.5)
      .add(() => playHeroIntro(), 1.85);

    return () => {
      tl.kill();
      lenis?.start();
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      data-q="preloader"
      className="fixed inset-0 flex flex-col items-center justify-center gap-[26px]"
      style={{ background: COLORS.void, zIndex: "var(--z-preloader)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={markRef}
        src="/logo.png"
        alt={SITE.name}
        className="h-[54px] w-[54px] object-contain opacity-90"
      />

      <div
        className="relative h-px overflow-hidden"
        style={{ width: "min(360px,58vw)", background: "rgba(241,240,236,.14)" }}
      >
        <span
          ref={barRef}
          className="absolute inset-0 block origin-left"
          style={{ background: COLORS.accent, transform: "scaleX(0)" }}
        />
      </div>

      <div className="type-mono flex items-baseline gap-[14px]" style={{ color: COLORS.slate }}>
        <span ref={numRef} style={{ color: COLORS.bone }}>
          000
        </span>
        <span>{PRELOADER.status}</span>
      </div>
    </div>
  );
}
