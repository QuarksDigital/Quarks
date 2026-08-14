"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useSceneTrigger } from "@/hooks/useSceneTrigger";
import { createThresholdScene, type ThresholdRefs } from "@/animations/scenes/threshold";
import { scrollToRoute } from "@/lib/scrollTo";
import { CONTACT, SITE } from "@/constants/content";
import { GATE } from "@/constants/services";
import { COLORS } from "@/constants/tokens";
import { prefersReducedMotion } from "@/utils/dom";

export default function Contact() {
  const marquee = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const percent = useRef<HTMLSpanElement>(null);

  useSceneTrigger<ThresholdRefs>((args) => createThresholdScene(args), {
    get section() {
      return section.current;
    },
    get inner() {
      return inner.current;
    },
    get panel() {
      return panel.current;
    },
    get fill() {
      return fill.current;
    },
    get label() {
      return label.current;
    },
    get percent() {
      return percent.current;
    },
  });

  useEffect(() => {
    const el = marquee.current;
    if (!el || prefersReducedMotion()) return;
    // Three copies; wrap at one copy's width so the seam is never visible.
    const w = el.scrollWidth / 3;
    const tween = gsap.to(el, {
      x: -w,
      duration: 26,
      ease: "none",
      repeat: -1,
      modifiers: { x: (x) => `${(parseFloat(x) % w)}px` },
    });
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <section
      ref={section}
      data-route="/contact"
      data-theme="dark"
      aria-label="Contact Quarks"
      className="route-cap relative overflow-hidden"
      style={{ background: COLORS.void, zIndex: 5 }}
    >
      {/*
        Everything lives in this wrapper because the threshold pins it, not the
        section: the section carries the route-cap negative margin, and a
        pin-spacer wrapped around that would fight it.
      */}
      <div
        ref={inner}
        className="relative"
        style={{
          background: COLORS.void,
          padding: "clamp(90px,13vh,160px) var(--gutter) 0",
        }}
      >
      <div className="relative mx-auto" style={{ maxWidth: "var(--measure)" }}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2"
          style={{
            top: "-10%",
            width: "min(900px,90vw)",
            aspectRatio: "1",
            background: "radial-gradient(circle,rgba(58,219,255,.16),transparent 62%)",
          }}
        />

        <div className="relative">
          <p className="type-mono" style={{ color: COLORS.shadow, marginBottom: 22 }}>
            {CONTACT.index}
          </p>

          <h2
            data-split
            className="type-display m-0"
            style={{
              maxWidth: "16ch",
              fontSize: "clamp(36px,6.8vw,104px)",
              lineHeight: 0.96,
              letterSpacing: "-0.045em",
            }}
          >
            {CONTACT.heading}
          </h2>

          <p
            className="font-light"
            style={{
              margin: "clamp(24px,3.6vh,40px) 0 0",
              maxWidth: "56ch",
              fontSize: "clamp(15px,1.3vw,18px)",
              lineHeight: 1.65,
              color: COLORS.dust,
            }}
          >
            {CONTACT.body}
          </p>

          <div
            className="flex flex-wrap gap-3.5"
            style={{ marginTop: "clamp(30px,4.5vh,50px)" }}
          >
            <a
              href={`mailto:${SITE.emailNew}`}
              data-magnetic
              data-cursor="link"
              className="whitespace-nowrap rounded-full px-[30px] py-4 text-[15px] font-semibold"
              style={{ background: COLORS.accent, color: COLORS.void }}
            >
              {SITE.emailNew}
            </a>
            <a
              href={`mailto:${SITE.emailElse}`}
              data-magnetic
              data-cursor="link"
              className="whitespace-nowrap rounded-full px-[30px] py-4 text-[15px] font-medium"
              style={{ border: "1px solid rgba(241,240,236,.22)" }}
            >
              {CONTACT.secondaryCta}
            </a>
          </div>

          <div
            className="grid gap-7"
            style={{
              gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
              marginTop: "clamp(60px,9vh,110px)",
              paddingTop: 34,
              borderTop: "1px solid var(--hairline-dark)",
            }}
          >
            {CONTACT.columns.map((col) => (
              <div key={col.label}>
                <p
                  className="type-mono-tight"
                  style={{ color: COLORS.shadow, marginBottom: 12 }}
                >
                  {col.label}
                </p>
                <p
                  className="m-0 font-light"
                  style={{ fontSize: 15, lineHeight: 1.55, color: COLORS.mist }}
                >
                  {col.lines.map((l, i) => (
                    <span key={l}>
                      {i > 0 && <br />}
                      {l}
                    </span>
                  ))}
                </p>
              </div>
            ))}

            <div>
              <p className="type-mono-tight" style={{ color: COLORS.shadow, marginBottom: 12 }}>
                {CONTACT.follow.label}
              </p>
              <div
                className="flex flex-col gap-[7px]"
                style={{ fontSize: 15, color: COLORS.mist }}
              >
                {CONTACT.follow.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="link"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative overflow-hidden"
        style={{
          marginTop: "clamp(60px,9vh,110px)",
          borderTop: "1px solid var(--hairline-dark)",
          padding: "clamp(28px,4vh,52px) 0",
        }}
      >
        <div ref={marquee} className="flex gap-[60px] whitespace-nowrap will-change-transform">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              aria-hidden={i > 0}
              className="font-medium"
              style={{
                fontSize: "clamp(40px,7vw,110px)",
                lineHeight: 1,
                letterSpacing: "-0.04em",
                color: "rgba(241,240,236,.10)",
              }}
            >
              {CONTACT.marquee}
            </span>
          ))}
        </div>

        {/*
          Blurred black shoulders. The backdrop-filter does the softening and
          the gradient does the fade, so the type dissolves into the edge
          instead of being cut off by the overflow clip.
        */}
        <div aria-hidden="true" className="marquee-fade marquee-fade-left" />
        <div aria-hidden="true" className="marquee-fade marquee-fade-right" />
      </div>

      <div
        data-q="footer-bar"
        className="type-mono-tight mx-auto flex flex-wrap items-center justify-between gap-4"
        style={{
          maxWidth: "var(--measure)",
          padding: "26px 0 30px",
          borderTop: "1px solid var(--hairline-dark)",
          color: COLORS.shadow,
        }}
      >
        <span>{CONTACT.copyright}</span>
        <button
          type="button"
          data-cursor="link"
          onClick={() => scrollToRoute("/")}
          className="type-mono-tight"
        >
          {CONTACT.backToTop}
        </button>
      </div>

      {/*
        The threshold. Sits at the foot of the footer and stays invisible until
        the section pins, at which point continued scroll draws the line. When
        it completes, the gate below takes over and opens /services.
      */}
      <div
        ref={panel}
        data-q="gate-panel"
        aria-hidden="true"
        /* In flow, not absolute: an absolute strip sat on top of the copyright
           row. Reserving the space costs ~44px of invisible footer and keeps
           the two from ever colliding. */
        className="pointer-events-none"
        style={{ opacity: 0 }}
      >
        <div
          className="mx-auto flex flex-col gap-2.5"
          style={{ maxWidth: "var(--measure)", paddingBottom: "clamp(18px,3vh,30px)" }}
        >
          <div className="flex items-baseline justify-between gap-4">
            <span ref={label} className="type-mono" style={{ color: COLORS.accentPale }}>
              {GATE.prompt}
            </span>
            <span ref={percent} className="type-mono-tight" style={{ color: COLORS.shadow }}>
              000
            </span>
          </div>
          <span className="gate-line">
            <span ref={fill} />
          </span>
        </div>
      </div>
      </div>
    </section>
  );
}
