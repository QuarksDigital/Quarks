"use client";

/**
 * QUARKS - the floating service cards.
 *
 * DOM + CSS 3D rather than WebGL planes: the faces carry real text, so they
 * stay crisp at any DPR, remain reachable by a screen reader, and can be
 * driven by GSAP directly. Three nested layers per card keep the transforms
 * from fighting each other:
 *
 *   .slot   base 3D placement in the cloud - the only layer GSAP tweens
 *   .float  idle bob, an independent looping tween
 *   .face   hover response
 *
 * Selecting a card flies its slot to the front on an elastic ease while the
 * rest recede, dim and blur. Switching pillar re-forms the whole cloud.
 */
import { useCallback, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import {
  DECK_BELOW,
  PILLARS,
  SERVICES_COPY,
  deckAlpha,
  slotFor,
  type ServiceDef,
} from "@/constants/services";
import { COLORS } from "@/constants/tokens";
import { EASE, DURATION } from "@/constants/motion";
import { prefersReducedMotion, isTouchDevice } from "@/utils/dom";

interface Props {
  pillar: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
}

const keyOf = (pillar: number, s: ServiceDef) => `${pillar}-${s.n}`;

export default function ServiceCards({ pillar, selected, onSelect }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const floatTweens = useRef<gsap.core.Tween[]>([]);
  const baseRef = useRef<Map<string, { x: number; y: number; z: number; alpha: number }>>(
    new Map(),
  );
  const selectedRef = useRef<string | null>(null);
  const deckRef = useRef(false);
  const fitRef = useRef(1);

  const items = PILLARS[pillar].items;

  /** Resolve percentage slots to px for the current viewport. */
  const layout = useCallback(
    (animated: boolean) => {
      const wrap = wrapRef.current;
      if (!wrap) return;

      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      // Narrow viewports get a tighter, flatter cloud so nothing clips offscreen;
      // phones drop to a fanned deck entirely (see slotFor).
      const deck = w <= DECK_BELOW;
      const compact = w < 900;
      const spreadX = deck ? 1 : compact ? 0.72 : 1;
      const depth = deck ? 1 : compact ? 0.5 : 1;
      deckRef.current = deck;

      /*
       * The cloud is laid out inside the band left between the header and the
       * footer rail, not the whole section. Measuring it (rather than
       * hard-coding offsets) is what stops the cards colliding with the
       * heading on short viewports, where the chrome eats most of the screen.
       */
      const px = (name: string, fallback: number) => {
        const v = parseFloat(getComputedStyle(wrap).getPropertyValue(name));
        return Number.isFinite(v) ? v : fallback;
      };
      const bandTop = px("--svc-cloud-top", 300);
      const bandBottom = h - px("--svc-cloud-bottom", 64);
      const bandH = Math.max(bandBottom - bandTop, 160);
      // Where the band's centre sits relative to the section centre.
      const bandShift = (bandTop + bandBottom) / 2 - h / 2;

      const sample = slotRefs.current.get(keyOf(pillar, items[0]));
      const cardH = sample?.querySelector<HTMLElement>("[data-face]")?.offsetHeight ?? 340;

      const slots = items.map((_, i) => slotFor(items.length, i, deck, pillar));
      const maxAbsY = Math.max(...slots.map((s) => Math.abs(s.y))) / 100;

      /*
       * Shrink to fit rather than clip. The arc is symmetric about the centre
       * so its span is twice the largest offset, but the mobile fan only ever
       * steps one way - counting it as symmetric would halve the cards for no
       * reason.
       */
      const required = (deck ? maxAbsY : maxAbsY * 2) * bandH + cardH;
      const fit = Math.min(1, Math.max(bandH / required, 0.58));

      items.forEach((s, i) => {
        const id = keyOf(pillar, s);
        const el = slotRefs.current.get(id);
        if (!el) return;
        const slot = slots[i];

        const x = (slot.x / 100) * w * spreadX * fit;
        const y = bandShift + (slot.y / 100) * bandH * fit;
        const z = slot.z * depth;
        // In deck mode only the front card is fully legible (see deckAlpha).
        const alpha = deck ? deckAlpha(i) : 1;
        baseRef.current.set(id, { x, y, z, alpha });

        if (selectedRef.current) return;

        const to = {
          x,
          y,
          z,
          rotationX: slot.rx,
          rotationY: slot.ry,
          rotationZ: slot.rz,
          scale: fit,
          autoAlpha: alpha,
        };
        if (animated) gsap.to(el, { ...to, duration: DURATION.base, ease: EASE.settle });
        else gsap.set(el, to);
      });

      fitRef.current = fit;
    },
    [items, pillar],
  );

  // ── pillar change: re-form the cloud ────────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduced = prefersReducedMotion();

    floatTweens.current.forEach((t) => t.kill());
    floatTweens.current = [];

    layout(false);

    if (!reduced) {
      items.forEach((s, i) => {
        const id = keyOf(pillar, s);
        const el = slotRefs.current.get(id);
        const base = baseRef.current.get(id);
        if (!el || !base) return;

        // Cards condense out of the void toward their slots.
        gsap.from(el, {
          z: base.z - 900,
          autoAlpha: 0,
          scale: fitRef.current * 0.7,
          duration: 1.4,
          ease: EASE.emergence,
          delay: 0.08 + i * 0.09,
        });

        // Each card bobs on its own period so the cloud never pulses in sync.
        const float = el.querySelector<HTMLElement>("[data-float]");
        if (float) {
          floatTweens.current.push(
            gsap.to(float, {
              y: i % 2 === 0 ? -14 : 12,
              rotate: i % 2 === 0 ? 1.2 : -1.1,
              duration: 3.2 + (i % 4) * 0.55,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              delay: i * 0.28,
            }),
          );
        }
      });
    }

    const onResize = () => layout(true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      floatTweens.current.forEach((t) => t.kill());
      floatTweens.current = [];
    };
  }, [layout, items, pillar]);

  /*
   * Lift the whole cloud above the heading while a card is open.
   *
   * `perspective` on the wrapper makes it a stacking context, so the open
   * card's z-index only ranks it against its siblings *inside* the cloud -
   * the section heading and the footer rail, which come later in the DOM,
   * still painted over it. Raising the wrapper is the only thing that clears
   * them.
   *
   * The drop back is delayed until the return tween has finished, otherwise
   * the card ducks behind the heading while still flying home.
   */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    if (selected) {
      wrap.style.zIndex = "40";
      return;
    }
    const t = setTimeout(
      () => {
        wrap.style.zIndex = "";
      },
      prefersReducedMotion() ? 220 : 1150,
    );
    return () => clearTimeout(t);
  }, [selected]);

  // ── selection: fly to front / return to cloud ───────────────────────────
  useEffect(() => {
    selectedRef.current = selected;
    const reduced = prefersReducedMotion();

    items.forEach((s, i) => {
      const id = keyOf(pillar, s);
      const el = slotRefs.current.get(id);
      const base = baseRef.current.get(id);
      if (!el || !base) return;

      const slot = slotFor(items.length, i, deckRef.current, pillar);
      const float = el.querySelector<HTMLElement>("[data-float]");
      const isActive = selected === id;

      if (isActive) {
        // Pause the bob so the elastic settle isn't fighting a sine wave.
        if (float) gsap.to(float, { y: 0, rotate: 0, duration: 0.4, ease: "power2.out" });
        gsap.to(el, {
          x: 0,
          y: 0,
          z: 340,
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
          scale: 1,
          autoAlpha: 1,
          duration: reduced ? 0.2 : 1.25,
          ease: reduced ? "none" : EASE.elastic,
          overwrite: "auto",
        });
      } else if (selected) {
        gsap.to(el, {
          x: base.x * 1.45,
          y: base.y * 1.45,
          z: base.z - 420,
          scale: fitRef.current * 0.86,
          autoAlpha: 0.12,
          duration: DURATION.base,
          ease: EASE.settle,
          overwrite: "auto",
        });
      } else {
        gsap.to(el, {
          x: base.x,
          y: base.y,
          z: base.z,
          rotationX: slot.rx,
          rotationY: slot.ry,
          rotationZ: slot.rz,
          scale: fitRef.current,
          autoAlpha: base.alpha,
          duration: reduced ? 0.2 : 1.1,
          ease: reduced ? "none" : EASE.settle,
          overwrite: "auto",
        });
      }
    });
  }, [selected, items, pillar]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSelect(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, onSelect]);

  /*
   * Hover: a small lift and lean rather than a plain scale-up. The card rises,
   * grows a touch, and its border brightens, while the radial sheen in
   * .glass-lit follows the pointer (see onCardMove) so the light reads as
   * landing on a physical surface.
   */
  const hover = (id: string, on: boolean) => {
    if (selectedRef.current || isTouchDevice() || prefersReducedMotion()) return;
    const slot = slotRefs.current.get(id);
    const face = slot?.querySelector<HTMLElement>("[data-face]");
    if (!face) return;

    gsap.to(face, {
      scale: on ? 1.035 : 1,
      y: on ? -10 : 0,
      duration: on ? 0.45 : 0.6,
      ease: on ? EASE.settle : EASE.elastic,
      overwrite: "auto",
    });
    gsap.to(face, {
      borderColor: on ? COLORS.accentInk : "rgba(11,12,15,0.12)",
      duration: 0.4,
      overwrite: "auto",
    });
    face.style.setProperty("--lit", on ? "1" : "0");
  };

  /** Feed the pointer position to the card's radial sheen. */
  const onCardMove = (id: string, e: React.PointerEvent) => {
    if (selectedRef.current || isTouchDevice() || prefersReducedMotion()) return;
    const face = slotRefs.current.get(id)?.querySelector<HTMLElement>("[data-face]");
    if (!face) return;
    const r = face.getBoundingClientRect();
    face.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    face.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute inset-0"
      style={{ perspective: "1500px", perspectiveOrigin: "50% 48%" }}
    >
      {/* Click-away layer, only live while a card is open. */}
      <button
        type="button"
        aria-label={SERVICES_COPY.close}
        tabIndex={selected ? 0 : -1}
        onClick={() => onSelect(null)}
        className="absolute inset-0 cursor-default"
        style={{ pointerEvents: selected ? "auto" : "none", zIndex: 20 }}
      />

      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        {items.map((s, i) => {
          const id = keyOf(pillar, s);
          const isActive = selected === id;
          return (
            <div
              key={id}
              ref={(el) => {
                if (el) slotRefs.current.set(id, el);
                else slotRefs.current.delete(id);
              }}
              className="absolute left-1/2 top-1/2"
              style={{
                transformStyle: "preserve-3d",
                // Centre on the slot regardless of the responsive card size.
                marginLeft: "calc(var(--card-w) / -2)",
                marginTop: "calc(var(--card-h) / -2)",
                zIndex: isActive ? 30 : 10 + (items.length - i),
              }}
            >
              <div data-float style={{ transformStyle: "preserve-3d" }}>
                <button
                  data-face
                  data-scard
                  data-cursor="link"
                  type="button"
                  aria-expanded={isActive}
                  onClick={() => onSelect(isActive ? null : id)}
                  onPointerEnter={() => hover(id, true)}
                  onPointerLeave={() => hover(id, false)}
                  onPointerMove={(e) => onCardMove(id, e)}
                  className="svc-card glass-lit pointer-events-auto flex flex-col text-left transition-[height] duration-500"
                  style={{
                    width: "var(--card-w)",
                    height: isActive ? "var(--card-h-open)" : "var(--card-h)",
                    padding: "var(--card-pad)",
                    borderRadius: "var(--card-radius)",
                    /* One rhythm for the whole face: header, body, tags. */
                    gap: "var(--card-gap)",
                    borderColor: isActive ? COLORS.accentInk : "rgba(11,12,15,0.12)",
                    boxShadow: isActive
                      ? "0 40px 120px -30px rgba(11,126,160,0.45), 0 2px 6px rgba(0,0,0,0.35)"
                      : "0 30px 80px -40px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.3)",
                  }}
                >
                  <div
                    data-card-head
                    className="flex items-baseline justify-between gap-3"
                    style={{ paddingBottom: "var(--card-gap)", borderBottom: "1px solid rgba(11,12,15,0.12)" }}
                  >
                    <span className="type-mono-tight" style={{ color: COLORS.accentInk }}>
                      {s.n}
                    </span>
                    <span
                      className="type-mono-tight truncate"
                      style={{ color: COLORS.ash, letterSpacing: "0.14em" }}
                    >
                      {s.time}
                    </span>
                  </div>

                  {/* Body takes the slack so the tag row stays pinned to the base. */}
                  <div data-card-body className="flex flex-1 flex-col" style={{ gap: "var(--card-text-gap)" }}>
                    <h3
                      className="m-0 font-medium"
                      style={{
                        fontSize: "var(--card-title)",
                        letterSpacing: "-0.03em",
                        lineHeight: 1.12,
                      }}
                    >
                      {s.name}
                    </h3>
                    <p
                      className="m-0 font-light"
                      style={{
                        fontSize: "var(--card-body)",
                        lineHeight: 1.62,
                        color: COLORS.steel,
                      }}
                    >
                      {s.line}
                    </p>
                    {isActive && (
                      <p
                        className="m-0 font-light"
                        style={{
                          fontSize: "var(--card-body)",
                          lineHeight: 1.62,
                          color: COLORS.stone,
                          animation: "quarks-fade-up 0.7s var(--ease-emergence) both 0.35s",
                        }}
                      >
                        {PILLARS[pillar].blurb}
                      </p>
                    )}
                  </div>

                  <div data-card-tags className="flex flex-wrap" style={{ gap: "var(--card-tag-gap)" }}>
                    {s.tags.map((t) => (
                      <span
                        key={t}
                        className="whitespace-nowrap rounded-full"
                        style={{
                          border: "1px solid rgba(11,12,15,0.18)",
                          padding: "var(--card-tag-pad)",
                          fontSize: "var(--card-tag)",
                          lineHeight: 1,
                          color: COLORS.graphite,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
