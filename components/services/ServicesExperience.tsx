"use client";

/**
 * QUARKS - the /services stage.
 *
 * One shared component drives two entry points: the standalone /services
 * route and the scroll gate at the foot of the home document. Keeping it in
 * one place means the gate reveal never has to cross-fade into a different
 * tree - the section under the gate *is* the route.
 *
 * The design's four pillars survive as tabs; picking one re-forms the card
 * cloud around the atom rather than swapping a grid.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { createAtom, type AtomHandle } from "@/components/services/atom";
import ServiceCards from "@/components/services/ServiceCards";
import { PILLARS, SERVICES_COPY, STEPS } from "@/constants/services";
import { SITE } from "@/constants/content";
import { COLORS } from "@/constants/tokens";
import { EASE } from "@/constants/motion";
import { prefersReducedMotion } from "@/utils/dom";

interface Props {
  /** Standalone route shows a back link; the gate version does not. */
  standalone?: boolean;
}

export default function ServicesExperience({ standalone = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const atomRef = useRef<AtomHandle | null>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [pillar, setPillar] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const atom = createAtom(canvasRef.current);
    atomRef.current = atom;
    return () => {
      atom.dispose();
      atomRef.current = null;
    };
  }, []);

  // The core excites and pulls back while a card is held at the front.
  useEffect(() => {
    atomRef.current?.setEnergy(selected ? 1 : 0);
    atomRef.current?.setScale(selected ? 0.72 : 1);
  }, [selected]);

  // Tab indicator rides to the active tab, elastic on click.
  useEffect(() => {
    const ind = indicatorRef.current;
    const btn = tabRefs.current[pillar];
    if (!ind || !btn) return;
    gsap.to(ind, {
      x: btn.offsetLeft,
      width: btn.offsetWidth,
      duration: prefersReducedMotion() ? 0 : 0.8,
      ease: EASE.pill,
      overwrite: "auto",
    });
  }, [pillar]);

  const active = PILLARS[pillar];

  return (
    <section
      id="services"
      /*
       * Only the standalone route registers with the route observer. Inside
       * the gate this section is pinned, so its box reports a viewport-locked
       * position - gate.ts publishes the route directly instead.
       */
      data-route={standalone ? "/services" : undefined}
      data-theme="dark"
      aria-label="Quarks services"
      className="relative h-screen w-full overflow-hidden"
      style={{ background: COLORS.void, zIndex: "var(--z-scene)" }}
    >
      {/* Depth wash so the cloud has something to sit against. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 48%, rgba(14,143,191,0.13), transparent 70%), radial-gradient(120% 90% at 50% 120%, rgba(5,6,9,0.92), transparent 60%)",
        }}
      />

      {/* The atom. Sits behind the cards; empty space drags it. */}
      <canvas
        ref={canvasRef}
        data-cursor="drag"
        aria-label="Interactive three-dimensional atom"
        className="absolute inset-0 h-full w-full touch-none"
      />

      <ServiceCards pillar={pillar} selected={selected} onSelect={setSelected} />

      {/* ── heading + pillar tabs ───────────────────────────────────────── */}
      <header
        className="pointer-events-none absolute left-0 right-0 top-0 flex flex-col items-center text-center"
        style={{ padding: "var(--svc-head-top) var(--gutter) 0" }}
      >
        <p className="type-mono" style={{ color: COLORS.shadow }}>
          {SERVICES_COPY.index}
        </p>
        <h1
          className="type-display m-0"
          style={{
            marginTop: "var(--svc-title-mt)",
            fontSize: "var(--svc-title)",
            maxWidth: "16ch",
          }}
        >
          {SERVICES_COPY.heading}
        </h1>

        <nav
          data-q="svc-tabs"
          aria-label="Service pillars"
          className="pointer-events-auto relative flex w-max max-w-full shrink-0 rounded-full"
          style={{
            marginTop: "var(--svc-tabs-mt)",
            gap: "var(--svc-tab-gap)",
            padding: "var(--svc-tabs-pad)",
            border: "1px solid rgba(241,240,236,.14)",
            background: "rgba(8,10,14,.5)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <span
            ref={indicatorRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 w-0 rounded-full"
            style={{
              top: "var(--svc-tabs-pad)",
              height: "calc(100% - 2 * var(--svc-tabs-pad))",
              background: COLORS.bone,
            }}
          />
          {PILLARS.map((p, i) => (
            <button
              key={p.key}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              data-ptab={i}
              data-cursor="link"
              aria-pressed={i === pillar}
              onClick={() => {
                setSelected(null);
                setPillar(i);
              }}
              className="relative z-[1] whitespace-nowrap rounded-full font-semibold"
              style={{
                padding: "var(--svc-tab-pad-y) var(--svc-tab-pad-x)",
                fontSize: "var(--svc-tab-size)",
                color: i === pillar ? COLORS.ink : COLORS.fog,
                transition: "color .35s",
              }}
            >
              {p.key}
            </button>
          ))}
        </nav>

      </header>

      {/* ── footer rail ─────────────────────────────────────────────────── */}
      {/*
        The pillar blurb lives down here rather than under the tabs: in the
        header it sat squarely in the band the cards occupy and collided with
        them on every viewport. Next to the interaction hint it reads better
        anyway - description and affordance in the same glance.
      */}
      <div
        data-q="services-foot"
        className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-6"
        style={{ padding: "0 var(--gutter) var(--svc-foot-pb)" }}
      >
        <div className="flex min-w-0 flex-col gap-1.5">
          <p
            className="m-0 truncate"
            style={{ fontSize: "var(--svc-blurb)", color: COLORS.dust }}
          >
            {active.blurb}
          </p>
          <p className="type-mono-tight m-0" style={{ color: COLORS.shadow }}>
            {selected ? `${active.key} · ${STEPS.length} STEP PROCESS` : `${active.count} · ${SERVICES_COPY.hint}`}
          </p>
        </div>

        {selected ? (
          <button
            type="button"
            data-cursor="link"
            onClick={() => setSelected(null)}
            className="type-mono-tight shrink-0 whitespace-nowrap rounded-full px-4 py-1.5"
            style={{ border: `1px solid ${COLORS.accentDeep}`, color: COLORS.accentPale }}
          >
            {SERVICES_COPY.close}
          </button>
        ) : standalone ? (
          <Link
            href="/"
            data-cursor="link"
            className="type-mono-tight shrink-0 whitespace-nowrap rounded-full px-4 py-1.5"
            style={{ border: "1px solid rgba(241,240,236,.16)", color: COLORS.dust }}
          >
            {SERVICES_COPY.backToHome}
          </Link>
        ) : (
          <p className="type-mono-tight m-0" style={{ color: COLORS.shadow }}>
            {SITE.name}
          </p>
        )}
      </div>
    </section>
  );
}
