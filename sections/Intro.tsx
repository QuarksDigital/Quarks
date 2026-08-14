"use client";

import { INTRO } from "@/constants/content";
import { COLORS } from "@/constants/tokens";

/** The positioning statement plus the three "one …" facts, on a hairline grid. */
export default function Intro() {
  return (
    <div
      className="relative"
      style={{
        padding:
          "clamp(90px,14vh,170px) var(--gutter) clamp(110px,16vh,200px)",
      }}
    >
      <div className="mx-auto" style={{ maxWidth: "var(--measure)" }}>
        <p
          className="type-mono"
          style={{ color: COLORS.shadow, marginBottom: "clamp(30px,5vh,56px)" }}
        >
          {INTRO.index}
        </p>

        <h2
          data-split
          className="m-0 font-normal"
          style={{
            maxWidth: "22ch",
            fontSize: "clamp(30px,5.2vw,78px)",
            lineHeight: 1.04,
            letterSpacing: "-0.035em",
          }}
        >
          {INTRO.heading}
        </h2>

        <p
          data-split
          className="font-light"
          style={{
            margin: "clamp(26px,4vh,44px) 0 0",
            maxWidth: "60ch",
            fontSize: "clamp(15px,1.3vw,18px)",
            lineHeight: 1.65,
            color: COLORS.dust,
          }}
        >
          {INTRO.body}
        </p>

        {/* 1px gap + matching background paints the hairline rules between cells. */}
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            background: "var(--hairline-dark)",
            marginTop: "clamp(56px,9vh,110px)",
            borderTop: "1px solid var(--hairline-dark)",
            borderBottom: "1px solid var(--hairline-dark)",
          }}
        >
          {INTRO.facts.map((f) => (
            <div
              key={f.label}
              data-fact
              style={{
                background: COLORS.void,
                padding: "clamp(28px,4vw,44px) clamp(20px,2.4vw,34px)",
              }}
            >
              <p
                className="type-mono-tight"
                style={{ color: COLORS.accent, letterSpacing: "0.24em", marginBottom: 16 }}
              >
                {f.label}
              </p>
              <p
                className="m-0 font-light"
                style={{ fontSize: 16, lineHeight: 1.55, color: COLORS.mist }}
              >
                {f.line}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
