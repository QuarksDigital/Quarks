"use client";

import { useLayoutEffect, useRef } from "react";
import { useSceneTrigger } from "@/hooks/useSceneTrigger";
import { createHeroScene, type HeroRefs } from "@/animations/scenes/hero";
import { scrollToRoute } from "@/lib/scrollTo";
import { HERO, SITE } from "@/constants/content";
import { COLORS, MEDIA } from "@/constants/tokens";

export default function Hero() {
  const hero = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  /*
   * Pick the video resolution on the client, before the scene primes the
   * decoder. The frame is scroll-scrubbed, so every scroll tick pays a full
   * frame-decode - a 1080p all-intra frame is ~2x the decode work of 720p.
   * Desktops with room to spare get 1080; anything smaller, or a device that
   * reports a slow/save-data connection, gets the lighter 720 file. The src is
   * assigned here (not as a JSX attribute) so server and client markup match
   * and the choice can read window/navigator.
   */
  useLayoutEffect(() => {
    const el = video.current;
    if (!el || el.src) return;

    type NetInfo = { saveData?: boolean; effectiveType?: string };
    const net = (navigator as Navigator & { connection?: NetInfo }).connection;
    const thrifty =
      !!net && (net.saveData === true || /(^|-)2g$|(^|-)3g$/.test(net.effectiveType ?? ""));

    const wantHd = window.innerWidth >= 1024 && !thrifty;
    el.src = wantHd ? MEDIA.heroVideo1080 : MEDIA.heroVideo720;
    el.load();
  }, []);

  useSceneTrigger<HeroRefs>((args) => createHeroScene(args), {
    get hero() {
      return hero.current;
    },
    get video() {
      return video.current;
    },
  });

  return (
    <div ref={hero} data-q="hero" className="relative" style={{ height: "var(--hero-runway)" }}>
      <div className="sticky top-0 overflow-hidden" style={{ height: "var(--hero-vh)" }}>
        <video
          ref={video}
          data-q="hero-video"
          poster={MEDIA.heroPoster}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            // Promote the frame to its own compositor layer so scroll-scrub
            // repaints don't force the rest of the hero to re-composite.
            transform: "translateZ(0)",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        />

        <div
          data-q="hero-veil"
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 45%,rgba(5,6,9,0) 0%,rgba(5,6,9,.55) 62%,rgba(5,6,9,.94) 100%)",
          }}
        />

        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
          style={{ padding: "0 clamp(20px,6vw,80px)" }}
        >
          <p
            data-q="hero-eyebrow"
            className="type-mono"
            style={{
              color: COLORS.dust,
              letterSpacing: "0.34em",
              marginBottom: "clamp(20px,3vh,34px)",
            }}
          >
            {HERO.eyebrow}
          </p>

          <h1
            data-q="hero-title"
            className="m-0 whitespace-nowrap font-medium"
            style={{
              fontSize: "clamp(38px,8.6vw,146px)",
              lineHeight: 0.92,
              letterSpacing: "-0.045em",
            }}
          >
            {HERO.lines.map((line, i) => (
              <span
                key={line}
                className="block overflow-hidden"
                style={{ paddingBottom: "0.1em", marginBottom: "-0.1em" }}
              >
                <span
                  data-q="ht-line"
                  className="block"
                  style={i === 1 ? { fontStyle: "italic", fontWeight: 300 } : undefined}
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <p
            data-q="hero-sub"
            className="font-light"
            style={{
              margin: "clamp(22px,3.2vh,38px) 0 0",
              maxWidth: 640,
              fontSize: "clamp(15px,1.35vw,19px)",
              lineHeight: 1.55,
              color: COLORS.fog,
            }}
          >
            {HERO.sub}
          </p>

          <div
            data-q="hero-cta"
            className="flex flex-wrap justify-center gap-3"
            style={{ marginTop: "clamp(24px,3.4vh,40px)" }}
          >
            {/* Both buttons share the .cta box - see globals.css. */}
            <a
              href={`mailto:${SITE.emailNew}`}
              data-magnetic
              data-cursor="link"
              className="cta cta-primary"
            >
              {HERO.ctaPrimary}
            </a>
            <button
              type="button"
              data-magnetic
              data-cursor="link"
              onClick={() => scrollToRoute("/work")}
              className="cta cta-secondary"
            >
              {HERO.ctaSecondary}
            </button>
          </div>
        </div>

        <div
          data-q="hero-hint"
          aria-hidden="true"
          className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
          style={{ bottom: "var(--hero-hint-bottom)" }}
        >
          <span
            className="type-mono-tight"
            style={{ fontSize: "9.5px", letterSpacing: "0.28em", color: COLORS.shadow }}
          >
            {HERO.hint}
          </span>
          <span
            className="block h-[34px] w-px"
            style={{
              background: `linear-gradient(${COLORS.accent},transparent)`,
              animation: "qhint 2.4s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}
