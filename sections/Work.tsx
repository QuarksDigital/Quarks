"use client";

import { useEffect, useRef } from "react";
import { useSceneTrigger } from "@/hooks/useSceneTrigger";
import { createWorkScene, type WorkRefs } from "@/animations/scenes/work";
import { createAtom, type AtomHandle } from "@/components/services/atom";
import { CASES, WORK } from "@/constants/content";
import { COLORS } from "@/constants/tokens";
import { prefersReducedMotion } from "@/utils/dom";

export default function Work() {
  const stage = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const atomCanvas = useRef<HTMLCanvasElement>(null);
  const atomRef = useRef<AtomHandle | null>(null);

  useSceneTrigger<WorkRefs>((args) => createWorkScene(args), {
    get stage() {
      return stage.current;
    },
    get ring() {
      return ring.current;
    },
    get progress() {
      return progress.current;
    },
    get rail() {
      return rail.current;
    },
    get hint() {
      return hint.current;
    },
    get scrim() {
      return scrim.current;
    },
  });

  // The same procedural atom that anchors /services, sitting on the helix axis.
  useEffect(() => {
    if (!atomCanvas.current || prefersReducedMotion()) return;
    const atom = createAtom(atomCanvas.current);
    atomRef.current = atom;
    return () => {
      atom.dispose();
      atomRef.current = null;
    };
  }, []);

  /* Panel width drives the helix radius, so it is a real responsive token
     rather than a clamp on the visual only. */
  const panelStyle: React.CSSProperties = {
    width: "var(--work-panel-w)",
    maxHeight: "var(--work-panel-maxh)",
    aspectRatio: "16/10",
    backfaceVisibility: "hidden",
    willChange: "transform, opacity",
  };

  return (
    <section
      data-route="/work"
      data-theme="dark"
      aria-label="Selected work"
      className="route-cap relative"
      style={{
        background: COLORS.void,
        zIndex: 3,
        padding: "clamp(90px,13vh,160px) 0 0",
      }}
    >
      <div
        className="mx-auto"
        style={{
          padding: "0 var(--gutter)",
          maxWidth: "var(--measure)",
          marginBottom: "clamp(48px,7vh,84px)",
        }}
      >
        <p className="type-mono" style={{ color: COLORS.shadow, marginBottom: 22 }}>
          {WORK.index}
        </p>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2
            data-split
            className="type-display m-0"
            style={{ maxWidth: "15ch", fontSize: "clamp(36px,6.4vw,96px)" }}
          >
            {WORK.heading}
          </h2>
          <p
            className="m-0 font-light"
            style={{ maxWidth: "34ch", fontSize: 15.5, lineHeight: 1.6, color: COLORS.dust }}
          >
            {WORK.sub}
          </p>
        </div>
      </div>

      {/* The helix. Scroll carries the column down; drag spins it. */}
      <div
        ref={stage}
        data-q="work-stage"
        className="relative h-screen overflow-hidden"
        style={{
          perspective: "1600px",
          perspectiveOrigin: "50% 50%",
          cursor: "grab",
          touchAction: "pan-y",
        }}
      >
        {/* Atom on the axis, behind the cards. */}
        <canvas
          ref={atomCanvas}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />

        {/* Dim plate behind an opened card. */}
        <div
          ref={scrim}
          aria-hidden="true"
          className="absolute inset-0 opacity-0"
          style={{
            zIndex: 150,
            background: "radial-gradient(70% 70% at 50% 50%, rgba(5,6,9,.72), rgba(5,6,9,.94))",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        />

        <div
          ref={ring}
          data-q="work-ring"
          className="absolute left-1/2 top-1/2 h-0 w-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {CASES.map((c) => (
            <article
              key={c.index}
              data-panel
              data-cursor="link"
              className="work-card absolute left-0 top-0 overflow-hidden"
              style={panelStyle}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.image}
                alt={c.name}
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
                style={{ opacity: 0.95 }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(180deg,rgba(5,6,9,.05) 35%,rgba(5,6,9,.86))",
                }}
              />

              <div className="absolute inset-0 flex flex-col justify-end gap-3 p-[clamp(18px,2.2vw,32px)]">
                <div className="flex items-end justify-between gap-4">
                  <h3
                    className="m-0 font-semibold"
                    style={{ fontSize: "clamp(22px,2.6vw,42px)", letterSpacing: "-0.038em" }}
                  >
                    {c.name}
                  </h3>
                  <span
                    className="type-mono-tight shrink-0"
                    style={{ fontSize: "9.5px", color: COLORS.mist }}
                  >
                    {c.index}
                  </span>
                </div>

                {/* Revealed only once the card is lifted to the front. */}
                <div
                  data-panel-detail
                  className="flex flex-col gap-3 opacity-0"
                  style={{ transform: "translateY(14px)", maxWidth: "62ch" }}
                >
                  <p className="type-mono-tight m-0" style={{ color: COLORS.accentPale }}>
                    {`${c.sector} · ${c.year}`}
                  </p>

                  <p
                    className="m-0 font-light"
                    style={{ fontSize: "clamp(14px,1.2vw,17px)", lineHeight: 1.6, color: COLORS.mist }}
                  >
                    {c.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {c.scope.map((t) => (
                      <span
                        key={t}
                        className="type-mono-tight whitespace-nowrap rounded-full px-3 py-1.5"
                        style={{ border: "1px solid rgba(241,240,236,.16)", color: COLORS.fog }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-x-10 gap-y-3">
                    {c.results.map((r) => (
                      <div key={r.label} className="flex flex-col gap-1">
                        <span
                          className="font-medium"
                          style={{
                            fontSize: "clamp(20px,2vw,30px)",
                            letterSpacing: "-0.03em",
                            lineHeight: 1,
                          }}
                        >
                          {r.value}
                        </span>
                        <span className="type-mono-tight" style={{ color: COLORS.shadow }}>
                          {r.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* No live URL yet? Then no button - never a dead link. */}
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="link"
                      className="type-mono-tight mt-1 inline-block w-max rounded-full px-5 py-[11px]"
                      style={{ border: "1px solid rgba(241,240,236,.26)" }}
                    >
                      {WORK.visit}
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}

          {/* Fourth face is deliberately empty - an invitation, not a case. */}
          <article
            data-panel
            data-cursor="link"
            className="work-card work-card-open absolute left-0 top-0 flex flex-col justify-between overflow-hidden p-[clamp(18px,2.2vw,32px)]"
            style={panelStyle}
          >
            <span className="type-mono-tight" style={{ color: COLORS.shadow }}>
              {WORK.openSlot.tag}
            </span>
            <div className="flex flex-col gap-3">
              <h3
                className="m-0 font-medium"
                style={{
                  fontSize: "clamp(20px,2.2vw,32px)",
                  letterSpacing: "-0.03em",
                  maxWidth: "15ch",
                }}
              >
                {WORK.openSlot.heading}
              </h3>
              <div
                data-panel-detail
                className="flex flex-col gap-2 opacity-0"
                style={{ transform: "translateY(14px)" }}
              >
                <p
                  className="m-0 font-light"
                  style={{ fontSize: "clamp(14px,1.2vw,17px)", color: COLORS.mist }}
                >
                  {WORK.openSlot.deliver}
                </p>
                <a
                  href="mailto:quarksdigitalmarketing@gmail.com"
                  data-cursor="link"
                  className="type-mono-tight mt-1 inline-block w-max rounded-full px-5 py-[11px]"
                  style={{ border: "1px solid rgba(241,240,236,.26)" }}
                >
                  {WORK.claim}
                </a>
              </div>
            </div>
          </article>
        </div>

        {/* Drag / scroll rail. Steps aside while a card is open. */}
        <div
          ref={rail}
          aria-hidden="true"
          className="absolute flex items-center gap-3.5"
          style={{ left: "var(--gutter)", bottom: "var(--work-drag-bottom)", zIndex: 120 }}
        >
          <span className="type-mono-tight" style={{ color: COLORS.shadow }}>
            {WORK.openHint}
          </span>
          <span
            className="relative block h-px overflow-hidden"
            style={{ width: "clamp(80px,12vw,190px)", background: "rgba(241,240,236,.16)" }}
          >
            <span
              ref={progress}
              className="absolute inset-0 block origin-left"
              style={{ background: COLORS.accent, transform: "scaleX(0)" }}
            />
          </span>
          <span className="type-mono-tight" style={{ color: COLORS.shadow }}>
            {WORK.scrollLabel}
          </span>
        </div>

        {/* Only visible while a card is open. */}
        <div
          ref={hint}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center gap-3 opacity-0"
          style={{ bottom: "var(--work-drag-bottom)", zIndex: 220 }}
        >
          <span
            className="block h-px w-8"
            style={{ background: "linear-gradient(90deg,transparent,rgba(58,219,255,.8))" }}
          />
          <span className="type-mono-tight" style={{ color: COLORS.accentPale }}>
            {WORK.closeHint}
          </span>
          <span
            className="block h-px w-8"
            style={{ background: "linear-gradient(90deg,rgba(58,219,255,.8),transparent)" }}
          />
        </div>
      </div>
    </section>
  );
}
