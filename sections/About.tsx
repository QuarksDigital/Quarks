"use client";

import { useRef } from "react";
import { useSceneTrigger } from "@/hooks/useSceneTrigger";
import { createFounderScene, type FounderRefs } from "@/animations/scenes/founders";
import { ABOUT, FOUNDERS } from "@/constants/content";
import { COLORS } from "@/constants/tokens";
import { FOUNDERS as FOUNDER_MOTION } from "@/constants/motion";

export default function About() {
  const stage = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const chevron = useRef<SVGSVGElement>(null);
  const ring = useRef<SVGCircleElement>(null);

  useSceneTrigger<FounderRefs>((args) => createFounderScene(args), {
    get stage() {
      return stage.current;
    },
    get counter() {
      return counter.current;
    },
    get cursor() {
      return cursor.current;
    },
    get chevron() {
      return chevron.current as unknown as HTMLElement | null;
    },
    get ring() {
      return ring.current;
    },
  });

  const arrow = (d: -1 | 1) => (
    <button
      type="button"
      data-farrow={d}
      data-cursor="link"
      aria-label={d === -1 ? "Previous founder" : "Next founder"}
      className="absolute bottom-[84px] z-[3] flex h-[46px] w-[46px] items-center justify-center rounded-full"
      style={{
        [d === -1 ? "left" : "right"]: 16,
        border: "1px solid rgba(241,240,236,.18)",
        background: "rgba(241,240,236,.06)",
      }}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path
          d={d === -1 ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );

  return (
    <section
      data-route="/about"
      data-theme="light"
      aria-label="About Quarks"
      className="route-cap relative"
      style={{
        background: COLORS.bone,
        color: COLORS.ink,
        zIndex: 4,
        padding: "clamp(90px,13vh,160px) var(--gutter) clamp(80px,11vh,140px)",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "var(--measure)" }}>
        <p className="type-mono" style={{ color: COLORS.ash, marginBottom: 22 }}>
          {ABOUT.index}
        </p>

        <h2
          data-split
          className="type-display m-0"
          style={{ maxWidth: "19ch", fontSize: "clamp(32px,5.6vw,84px)", lineHeight: 1 }}
        >
          {ABOUT.heading}
        </h2>

        <p
          data-split
          className="font-light"
          style={{
            margin: "clamp(26px,4vh,44px) 0 0",
            maxWidth: "62ch",
            fontSize: "clamp(15px,1.3vw,18px)",
            lineHeight: 1.65,
            color: COLORS.stone,
          }}
        >
          {ABOUT.body}
        </p>

        {/* ── stats ─────────────────────────────────────────────────────── */}
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
            background: "var(--hairline-light)",
            margin: "clamp(48px,7vh,90px) 0",
            borderTop: "1px solid var(--hairline-light)",
            borderBottom: "1px solid var(--hairline-light)",
          }}
        >
          {ABOUT.stats.map((s) => (
            <div
              key={s.label}
              style={{
                background: COLORS.bone,
                padding: "clamp(26px,3.4vw,42px) clamp(18px,2vw,30px)",
              }}
            >
              <div
                className="flex items-baseline gap-0.5 font-medium"
                style={{
                  fontSize: "clamp(38px,5.6vw,78px)",
                  lineHeight: 1,
                  letterSpacing: "-0.045em",
                }}
              >
                <span data-count={s.value}>0</span>
                <span>{s.suffix}</span>
              </div>
              <div
                className="type-mono-tight mt-3.5"
                style={{ color: COLORS.ash, letterSpacing: "0.2em" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── founder stage ─────────────────────────────────────────────── */}
        <div
          ref={stage}
          data-q="fstage"
          data-cursor="hidden"
          className="relative overflow-hidden rounded-[22px]"
          style={{ height: "min(82vh,720px)", background: COLORS.void, color: COLORS.bone }}
        >
          {FOUNDERS.map((f) => (
            <div key={f.name} data-slide className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.photo}
                  alt={f.name}
                  draggable={false}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: f.position }}
                />
                <div aria-hidden="true" className="dot-film absolute inset-0" />
                <div aria-hidden="true" className="dot-film-fine absolute inset-0" />
                <div
                  aria-hidden="true"
                  className="fstage-wash pointer-events-none absolute inset-0"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{ boxShadow: "inset 0 -120px 160px -40px rgba(4,4,10,.9)" }}
                />
              </div>

              <div
                data-q="fdetails-col"
                className="pointer-events-none absolute bottom-0 right-0 top-0 flex items-center"
              >
                <div data-fdetails>
                  <div
                    className="type-mono-tight"
                    style={{ color: COLORS.accentDeep, letterSpacing: "0.22em" }}
                  >
                    {f.index}
                  </div>
                  <h3
                    className="mt-3.5 font-semibold"
                    style={{
                      fontSize: "var(--founder-name)",
                      lineHeight: 0.95,
                      letterSpacing: "-0.045em",
                    }}
                  >
                    {f.name}
                  </h3>
                  <div
                    className="type-mono-tight mt-4"
                    style={{ color: COLORS.accentPale, letterSpacing: "0.2em" }}
                  >
                    {f.role}
                  </div>
                  <p
                    className="mt-[26px] font-light"
                    style={{
                      maxWidth: "38ch",
                      fontSize: 15,
                      lineHeight: 1.65,
                      color: "rgba(255,255,255,.62)",
                    }}
                  >
                    {f.bio}
                  </p>
                  {f.detail && (
                    <p
                      className="mt-3 font-light"
                      style={{
                        maxWidth: "38ch",
                        fontSize: 15,
                        lineHeight: 1.65,
                        color: "rgba(255,255,255,.62)",
                      }}
                    >
                      {f.detail}
                    </p>
                  )}
                  {f.quote && (
                    <p
                      className="mt-3 font-light italic"
                      style={{
                        maxWidth: "38ch",
                        fontSize: 14,
                        lineHeight: 1.65,
                        color: "rgba(159,241,255,.72)",
                      }}
                    >
                      {f.quote}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div
            className="type-mono-tight absolute"
            style={{
              right: "clamp(18px,3vw,40px)",
              top: "clamp(18px,3vh,34px)",
              color: "rgba(255,255,255,.55)",
              letterSpacing: "0.2em",
            }}
          >
            <span ref={counter} style={{ color: COLORS.bone }}>
              01
            </span>{" "}
            / {String(FOUNDERS.length).padStart(2, "0")}
          </div>

          {arrow(-1)}
          {arrow(1)}

          <div className="absolute bottom-0 left-0 right-0 z-[3] flex justify-center gap-2 pb-[30px]">
            {FOUNDERS.map((f) => (
              <button
                key={f.name}
                type="button"
                data-fdot
                data-cursor="link"
                aria-label={f.name}
                className="h-1.5 w-[7px] rounded-full"
                style={{ background: "rgba(241,240,236,.28)" }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Ring cursor doubles as the dwell timer for auto-advance. */}
      <div
        ref={cursor}
        data-q="fcursor"
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 flex h-16 w-16 items-center justify-center rounded-full opacity-0"
        style={{
          border: "1px solid rgba(58,219,255,.22)",
          background: "rgba(58,219,255,.10)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          zIndex: "calc(var(--z-cursor) + 1)",
        }}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          className="absolute inset-0 h-full w-full"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle cx="32" cy="32" r="30" stroke="rgba(56,219,255,0.15)" strokeWidth="2" />
          <circle
            ref={ring}
            cx="32"
            cy="32"
            r="30"
            stroke={COLORS.accentPale}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={FOUNDER_MOTION.ringCircumference}
            strokeDashoffset={FOUNDER_MOTION.ringCircumference}
          />
        </svg>
        <svg
          ref={chevron}
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={COLORS.accentPale}
          strokeWidth="2"
        >
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
