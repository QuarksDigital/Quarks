"use client";

/**
 * QUARKS - the route bar.
 *
 * Layout is edge-anchored: the mark is pinned hard left, the CTA hard right,
 * and the link pill is absolutely centred. All three are positioned rather
 * than flexed, so the pill sits on the true centre line of the viewport no
 * matter how wide the mark or the CTA get - a space-between row would drift
 * it off-centre by half the difference.
 *
 * The centre carries inertia. A smoothed scroll velocity translates it
 * against the direction of travel - scroll down and it rides up, scroll up
 * and it settles back down - then eases home once the scroll stops. Driving
 * it from velocity rather than direction means it accelerates and relaxes on
 * its own, which is what makes it read as weight rather than a toggle.
 *
 * A pill slides between links with an elastic settle. It follows hover, then
 * snaps back to whichever section owns the viewport. On light routes the
 * whole bar inverts.
 */
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { routeStore } from "@/lib/route";
import { NAV, SITE } from "@/constants/content";
import { COLORS } from "@/constants/tokens";
import { EASE, NAV_INERTIA } from "@/constants/motion";
import SoundToggle from "@/components/persistent/SoundToggle";
import { scrollToRoute } from "@/lib/scrollTo";
import { getLenis } from "@/components/providers/SmoothScrollProvider";
import { prefersReducedMotion } from "@/utils/dom";
import { clamp } from "@/utils/math";

export default function Nav() {
  const rootRef = useRef<HTMLElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const btnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const lightRef = useRef(false);
  /** previous theme, so the mark's first paint is instant rather than a flash */
  const prevLightRef = useRef<boolean | null>(null);
  const activeRef = useRef("/");

  // ── the sliding pill ────────────────────────────────────────────────────
  useEffect(() => {
    const pill = pillRef.current;
    const list = listRef.current;
    if (!pill) return;
    const reduced = prefersReducedMotion();

    const paintLabels = (target: string) => {
      btnRefs.current.forEach((btn, route) => {
        btn.style.color = route === target ? (lightRef.current ? COLORS.bone : COLORS.ink) : "";
      });
    };

    const movePill = (route: string, elastic: boolean) => {
      const btn = btnRefs.current.get(route);
      if (!btn) return;
      gsap.to(pill, {
        x: btn.offsetLeft,
        width: btn.offsetWidth,
        duration: elastic ? 0.85 : 0.5,
        ease: elastic ? EASE.pill : EASE.settle,
        overwrite: "auto",
      });
      if (elastic && !reduced) {
        // Squash-and-settle so the pill feels like it has mass.
        gsap.fromTo(
          pill,
          { scaleY: 0.62, scaleX: 1.12 },
          {
            scaleY: 1,
            scaleX: 1,
            duration: 0.95,
            ease: "elastic.out(1,0.42)",
            transformOrigin: "center",
            overwrite: false,
          },
        );
      }
      paintLabels(route);
    };

    // Hover previews a destination; leaving restores the live route.
    const detachHovers: (() => void)[] = [];
    btnRefs.current.forEach((btn, route) => {
      const onEnter = () => movePill(route, true);
      btn.addEventListener("mouseenter", onEnter);
      detachHovers.push(() => btn.removeEventListener("mouseenter", onEnter));
    });
    const onLeave = () => movePill(activeRef.current, false);
    list?.addEventListener("mouseleave", onLeave);

    const unsub = routeStore.subscribe(({ route, theme }) => {
      const light = theme === "light";
      lightRef.current = light;
      activeRef.current = route;

      gsap.to(rootRef.current, { color: light ? COLORS.ink : COLORS.bone, duration: 0.5 });
      gsap.to(pill, { backgroundColor: light ? COLORS.ink : COLORS.bone, duration: 0.5 });

      /*
       * The wordmark inherits `color`, but the glyph beside it is a PNG, so it
       * has to be inverted to follow the theme - otherwise a light-on-dark
       * mark sits invisibly on the bone-coloured About section.
       *
       * Both endpoints are stated explicitly because GSAP refuses to
       * interpolate out of the initial computed value of `none`. The very
       * first call is a `set` rather than a tween: a fromTo would apply its
       * `from` immediately and flash the mark inverted before animating back.
       */
      if (logoRef.current) {
        const to = light ? "invert(1)" : "invert(0)";
        const wasLight = prevLightRef.current;
        if (wasLight === null) {
          gsap.set(logoRef.current, { filter: to });
        } else if (wasLight !== light) {
          gsap.fromTo(
            logoRef.current,
            { filter: wasLight ? "invert(1)" : "invert(0)" },
            { filter: to, duration: 0.45, ease: "power2.out", overwrite: "auto" },
          );
        }
        prevLightRef.current = light;
      }

      if (list) {
        list.style.background = light ? "rgba(241,240,236,.55)" : "rgba(8,10,14,.44)";
        list.style.borderColor = light ? "rgba(11,12,15,.12)" : "rgba(241,240,236,.12)";
      }
      if (readoutRef.current) {
        readoutRef.current.textContent = SITE.readout + (route === "/" ? "/" : route);
        gsap.fromTo(
          readoutRef.current,
          { opacity: 0, y: -6 },
          { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
        );
      }
      document.body.style.backgroundColor = light ? COLORS.bone : COLORS.void;
      movePill(route, false);
    });

    gsap.set(pill, { opacity: 1 });
    const t = setTimeout(() => movePill(activeRef.current, false), 60);
    const onResize = () => movePill(activeRef.current, false);
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(t);
      unsub();
      detachHovers.forEach((fn) => fn());
      list?.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // ── centre bend ─────────────────────────────────────────────────────────
  /*
   * Only this element ever receives a transform. The mark and the CTA are
   * plain positioned boxes with nothing animating them, so they are welded to
   * the viewport corners no matter what the page is doing.
   *
   * The bend is two coupled channels driven by one smoothed scroll velocity:
   * the pill slides against the direction of travel, and it tips on X at the
   * same time. Under the parent's perspective that tip reads as the bar
   * flexing away from the scroll rather than merely sliding - the near edge
   * lifts while the far edge trails.
   */
  useEffect(() => {
    const center = centerRef.current;
    if (!center || prefersReducedMotion()) return;

    // Docked to the bottom edge on small screens - a fixed bar shouldn't drift.
    const mq = window.matchMedia(`(max-width: ${NAV_INERTIA.disableBelow}px)`);

    /*
     * Establish the transform up front. It gives the element its own
     * perspective (so the tip renders as a flex even if an ancestor's
     * perspective is ever lost) and gives GSAP a baseline to interpolate
     * from - without it the first frames have nothing to write into.
     *
     * rotationX, not rotateX: GSAP's canonical 3D property name.
     */
    gsap.set(center, { y: 0, rotationX: 0, transformPerspective: 700, force3D: true });

    const yTo = gsap.quickTo(center, "y", { duration: NAV_INERTIA.lag, ease: "power3.out" });
    const rxTo = gsap.quickTo(center, "rotationX", {
      duration: NAV_INERTIA.lag,
      ease: "power3.out",
    });

    let last = window.scrollY;
    let velocity = 0;

    const tick = () => {
      /*
       * Two signals, and we take whichever is actually moving.
       *
       * Lenis reports velocity only for scrolls *it* drove, so it reads zero
       * for anything programmatic (an anchor jump, scrollTo, a scrollbar
       * drag). The raw frame delta catches those but is quantised during
       * Lenis' own smoothing. Taking the larger magnitude means the bend
       * responds to every kind of scroll rather than only wheel gestures.
       *
       * Lenis is resolved per frame, not captured: it is created by the
       * provider above this component and React runs child effects first, so
       * at mount there is nothing to read yet.
       */
      const lenis = getLenis() as { velocity?: number } | null;
      const current = window.scrollY;
      const raw = current - last;
      const lv = typeof lenis?.velocity === "number" ? lenis.velocity : 0;
      const delta = Math.abs(lv) > Math.abs(raw) ? lv : raw;
      last = current;

      if (mq.matches) {
        if (velocity !== 0) {
          velocity = 0;
          yTo(0);
          rxTo(0);
        }
        return;
      }

      // Smooth the raw per-frame delta so one jumpy frame can't snap the bar.
      velocity += (delta - velocity) * NAV_INERTIA.smoothing;

      const v = clamp(velocity, -NAV_INERTIA.clampVelocity, NAV_INERTIA.clampVelocity);
      yTo(clamp(-v * NAV_INERTIA.strength, -NAV_INERTIA.max, NAV_INERTIA.max));
      rxTo(clamp(v * NAV_INERTIA.bend, -NAV_INERTIA.maxBend, NAV_INERTIA.maxBend));
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      gsap.set(center, { y: 0, rotationX: 0 });
    };
  }, []);

  return (
    <header
      ref={rootRef}
      data-q="nav"
      className="pointer-events-none fixed left-0 top-0 w-full"
      style={{ zIndex: "var(--z-nav)", height: "var(--nav-h)" }}
    >
      {/* ── hard left ──────────────────────────────────────────────────── */}
      <a
        href="#top"
        data-q="nav-mark"
        data-cursor="link"
        aria-label={`${SITE.name} - back to top`}
        onClick={(e) => {
          e.preventDefault();
          scrollToRoute("/");
        }}
        className="pointer-events-auto absolute top-1/2 flex -translate-y-1/2 items-center gap-[11px]"
        style={{ left: "var(--nav-gutter)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={logoRef}
          data-q="logomark"
          src="/logo.png"
          alt={SITE.name}
          className="h-6 w-6 shrink-0 object-contain"
          /*
           * No `filter` here on purpose - the route callback owns it. React
           * re-applies inline styles on every render, which would fight the
           * value the callback writes and snap the mark back to dark.
           */
        />
        <span
          data-q="wordmark"
          data-gate-anchor
          className="text-[12px] font-medium"
          style={{ letterSpacing: "0.34em" }}
        >
          {SITE.name}
        </span>
      </a>

      {/* ── centre, with inertia ───────────────────────────────────────── */}
      {/*
        Two layers on purpose: the outer owns the centring transform in CSS,
        the inner owns the inertia offset in GSAP. Sharing one element would
        mean GSAP's transform writes wiping out translateX(-50%) the moment
        the pill docks to the bottom edge.
      */}
      <div data-q="nav-center" className="pointer-events-none">
        <div ref={centerRef} className="will-change-transform">
          <nav
            ref={listRef}
            data-q="navlist"
            aria-label="Sections"
            className="pointer-events-auto relative flex items-center gap-[2px] rounded-full p-[5px]"
            style={{
              border: "1px solid rgba(241,240,236,.12)",
              background: "rgba(8,10,14,.44)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              transition: "background .5s, border-color .5s",
            }}
          >
            <span
              ref={pillRef}
              data-q="pill"
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-[5px] w-0 rounded-full opacity-0"
              style={{ height: "calc(100% - 10px)", background: COLORS.bone }}
            />
            {NAV.links.map((l) => (
              <button
                key={l.route}
                ref={(el) => {
                  if (el) btnRefs.current.set(l.route, el);
                  else btnRefs.current.delete(l.route);
                }}
                type="button"
                data-cursor="link"
                onClick={() => scrollToRoute(l.route)}
                className="relative z-[1] whitespace-nowrap rounded-full font-medium"
                style={{
                  padding: "var(--nav-link-pad-y) var(--nav-link-pad-x)",
                  fontSize: "var(--nav-link-size)",
                  transition: "color .3s",
                }}
              >
                {l.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── hard right ─────────────────────────────────────────────────── */}
      <div
        data-q="nav-end"
        className="pointer-events-auto absolute top-1/2 flex -translate-y-1/2 items-center gap-3"
        style={{ right: "var(--nav-gutter)" }}
      >
        <SoundToggle />

        <span
          ref={readoutRef}
          data-q="route-readout"
          className="type-mono-tight whitespace-nowrap"
          style={{ color: COLORS.slate, letterSpacing: "0.2em", fontSize: "10.5px" }}
        >
          {SITE.readout}/
        </span>
        <a
          href={`mailto:${SITE.emailNew}`}
          data-magnetic
          data-cursor="link"
          data-q="nav-cta"
          className="whitespace-nowrap rounded-full font-semibold"
          style={{
            padding: "var(--nav-cta-pad-y) var(--nav-cta-pad-x)",
            fontSize: "var(--nav-cta-size)",
            background: COLORS.accent,
            color: COLORS.void,
            transition: "background .5s,color .5s",
          }}
        >
          <span data-q="cta-long">{NAV.cta}</span>
          <span data-q="cta-short">{NAV.ctaShort}</span>
        </a>
      </div>
    </header>
  );
}
