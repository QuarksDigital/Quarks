"use client";

/**
 * S8 - About. A founder carousel.
 *   • keeps the photo-left / details-right / dot-film design
 *   • desktop: a physics-based directional cursor with a 7s progress ring -
 *     it springs after the pointer with inertia + velocity squash/stretch, and
 *     the arrow does a smooth 3D flip between next (>) and previous (<).
 *     Hovering a half fills the ring and auto-advances; clicking advances now.
 *   • mobile / tablet: left & right arrow buttons (and swipe)
 *   • a bottom loader auto-advances every 7s on touch / when not hovered
 * Add founders by appending to FOUNDERS - everything scales automatically.
 */
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { register, unregister } from "@/animations/core/timelineRegistry";
import { setHudLabel } from "@/components/persistent/SectionHUD";
import { getLenis } from "@/components/providers/SmoothScrollProvider";
import { ABOUT, FOUNDERS } from "@/constants/content";
import { isTouchDevice, prefersReducedMotion } from "@/utils/dom";

const AUTO_MS = 7000;
const RING_R = 30;
const RING_C = 2 * Math.PI * RING_R;

export default function About() {
  const n = FOUNDERS.length;
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const slides = useRef<(HTMLDivElement | null)[]>([]);
  const arrow = useRef<HTMLDivElement>(null);
  const chevron = useRef<SVGSVGElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const ring = useRef<SVGCircleElement>(null);

  const indexRef = useRef(0);
  const animating = useRef(false);
  const hovered = useRef(false);
  const inView = useRef(false);
  const desk = useRef(false);
  const acc = useRef(0);
  const dir = useRef<1 | -1>(1);
  const swipeX = useRef(0);

  const [active, setActive] = useState(0);

  const resetRing = useCallback(() => {
    if (ring.current) ring.current.style.strokeDashoffset = String(RING_C);
  }, []);

  const resetTimer = useCallback(() => {
    acc.current = 0;
    if (bar.current) gsap.set(bar.current, { scaleX: 0 });
    resetRing();
  }, [resetRing]);

  const go = useCallback(
    (target: number, d: 1 | -1) => {
      if (animating.current || n < 2) return;
      const from = indexRef.current;
      const t = ((target % n) + n) % n;
      if (t === from) return;
      const cur = slides.current[from];
      const nxt = slides.current[t];
      if (!cur || !nxt) return;

      animating.current = true;
      indexRef.current = t;
      setActive(t);
      resetTimer();

      const reduced = prefersReducedMotion();
      const dur = reduced ? 0.001 : 0.9;

      gsap.set(nxt, {
        xPercent: d === 1 ? 100 : -100,
        visibility: "visible",
        zIndex: 2,
      });
      gsap.set(cur, { zIndex: 1 });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(cur, { visibility: "hidden" });
          animating.current = false;
        },
      });
      tl.to(
        cur,
        { xPercent: d === 1 ? -100 : 100, duration: dur, ease: "power3.inOut" },
        0,
      ).to(nxt, { xPercent: 0, duration: dur, ease: "power3.inOut" }, 0);

      const det = nxt.querySelector<HTMLElement>(".founder-details");
      if (det && !reduced) {
        tl.fromTo(
          det.children,
          { autoAlpha: 0, y: 26, filter: "blur(10px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            stagger: 0.08,
            duration: 0.55,
            ease: "power2.out",
          },
          0.4,
        );
      }
    },
    [n, resetTimer],
  );

  const step = useCallback((d: 1 | -1) => go(indexRef.current + d, d), [go]);

  // initial slide layout + HUD trigger + in-view observer
  useEffect(() => {
    slides.current.forEach((s, i) => {
      if (s)
        gsap.set(s, {
          xPercent: i === 0 ? 0 : 100,
          visibility: i === 0 ? "visible" : "hidden",
        });
    });

    const st = register(
      ScrollTrigger.create({
        trigger: section.current,
        start: "top 60%",
        end: "bottom 40%",
        onEnter: () => setHudLabel(ABOUT.hudLabel),
        onEnterBack: () => setHudLabel(ABOUT.hudLabel),
        onToggle: (self) => {
          inView.current = self.isActive;
        },
      }),
    );

    return () => {
      unregister(st);
      st.kill();
    };
  }, []);

  // auto-advance loader.
  //  - desktop: the countdown fills the cursor ring while the pointer hovers the
  //    stage; on completion it advances in the hovered direction.
  //  - touch / non-desktop: the bottom bar fills while the section is in view.
  useEffect(() => {
    if (n < 2) return;
    let raf = 0;
    let last = performance.now();
    const reduced = prefersReducedMotion();
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      const dt = t - last;
      last = t;
      if (reduced) return;

      if (desk.current) {
        if (!hovered.current || animating.current) return;
        acc.current += dt;
        const p = Math.min(acc.current / AUTO_MS, 1);
        if (ring.current)
          ring.current.style.strokeDashoffset = String(RING_C * (1 - p));
        if (acc.current >= AUTO_MS) {
          acc.current = 0;
          step(dir.current);
        }
      } else {
        if (!inView.current || animating.current) return;
        acc.current += dt;
        if (bar.current)
          gsap.set(bar.current, { scaleX: Math.min(acc.current / AUTO_MS, 1) });
        if (acc.current >= AUTO_MS) {
          acc.current = 0;
          step(1);
        }
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [n, step]);

  // desktop directional cursor: spring inertia + squash/stretch + 3D arrow flip
  useEffect(() => {
    const stg = stage.current;
    const ar = arrow.current;
    const chev = chevron.current;
    desk.current =
      window.innerWidth >= 1024 && !isTouchDevice() && !prefersReducedMotion();
    if (!stg || !ar || !desk.current) return;

    gsap.set(ar, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    resetRing();

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let px = tx;
    let py = ty;
    let vx = 0;
    let vy = 0;
    let visScale = 0.6;
    let started = false;

    const flip = (d: 1 | -1) => {
      if (!chev) return;
      gsap.to(chev, {
        rotationY: d === 1 ? 0 : 180,
        duration: 0.55,
        ease: "back.out(1.7)",
        overwrite: "auto",
      });
      gsap.fromTo(
        chev,
        { scale: 0.65 },
        { scale: 1, duration: 0.5, ease: "back.out(2.2)" },
      );
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!started) {
        px = tx;
        py = ty;
        started = true;
      }
      const d: 1 | -1 = e.clientX > window.innerWidth / 2 ? 1 : -1;
      if (d !== dir.current) {
        dir.current = d;
        acc.current = 0;
        resetRing();
        flip(d);
      }
    };
    const onEnter = () => {
      hovered.current = true;
      acc.current = 0;
      resetRing();
      gsap.to(ar, { autoAlpha: 1, duration: 0.3, ease: "expo.out" });
    };
    const onLeave = () => {
      hovered.current = false;
      acc.current = 0;
      resetRing();
      gsap.to(ar, { autoAlpha: 0, duration: 0.25, ease: "power2.in" });
    };
    const onClick = (e: MouseEvent) => {
      if (animating.current) return;
      if ((e.target as HTMLElement)?.closest("button")) return;
      step(dir.current);
    };

    // spring integrator
    const STIFF = 0.2;
    const DAMP = 0.74;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      vx = (vx + (tx - px) * STIFF) * DAMP;
      vy = (vy + (ty - py) * STIFF) * DAMP;
      px += vx;
      py += vy;
      const speed = Math.hypot(vx, vy);
      const stretch = Math.min(speed * 0.02, 0.4);
      const angle = Math.atan2(vy, vx) * (180 / Math.PI);
      const rot = Math.max(-16, Math.min(16, angle * stretch * 0.8));
      visScale += ((hovered.current ? 1 : 0.6) - visScale) * 0.2;
      gsap.set(ar, {
        x: px,
        y: py,
        xPercent: -50,
        yPercent: -50,
        rotation: rot,
        scaleX: (1 + stretch) * visScale,
        scaleY: (1 - stretch * 0.55) * visScale,
      });
    };
    raf = requestAnimationFrame(tick);

    stg.addEventListener("pointermove", onMove);
    stg.addEventListener("pointerenter", onEnter);
    stg.addEventListener("pointerleave", onLeave);
    stg.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      stg.removeEventListener("pointermove", onMove);
      stg.removeEventListener("pointerenter", onEnter);
      stg.removeEventListener("pointerleave", onLeave);
      stg.removeEventListener("click", onClick);
    };
  }, [step, resetRing]);

  // Lenis snap: settle the About section to the screen on scroll-idle.
  useEffect(() => {
    const el = section.current;
    if (!el || prefersReducedMotion()) return;
    let idle: ReturnType<typeof setTimeout>;
    let cooldownUntil = 0;
    const onScroll = () => {
      clearTimeout(idle);
      idle = setTimeout(() => {
        if (performance.now() < cooldownUntil) return;
        const lenis = getLenis();
        if (!lenis) return;
        const off = el.getBoundingClientRect().top;
        const band = window.innerHeight * 0.32;
        if (Math.abs(off) > 2 && Math.abs(off) < band) {
          cooldownUntil = performance.now() + 1000;
          lenis.scrollTo(window.scrollY + off, {
            duration: 0.7,
            easing: (x: number) => 1 - Math.pow(1 - x, 3),
            lock: false,
            onComplete: () => {
              cooldownUntil = performance.now() + 250;
            },
          });
        }
      }, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(idle);
    };
  }, []);

  // touch swipe
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType !== "touch") return;
    swipeX.current = e.clientX;
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    if (e.pointerType !== "touch") return;
    const dx = e.clientX - swipeX.current;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  };

  return (
    <section
      ref={section}
      id="about"
      aria-label="About Quarks - our team"
      className="relative mt-[14vh]"
      style={{ zIndex: "var(--z-scene)" }}
    >
      <div
        ref={stage}
        data-cursor="hidden"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className="relative h-screen w-full overflow-hidden bg-void"
      >
        {/* header */}
        <div className="pointer-events-none absolute left-6 top-8 z-20 md:left-16 md:top-12">
          <p className="type-mono text-cherenkov-300">{ABOUT.eyebrow}</p>
          <p className="mt-2 max-w-xs text-sm text-[#ffffff]/60 md:max-w-sm">
            {ABOUT.introTitle}
          </p>
        </div>
        {n > 1 && (
          <div className="pointer-events-none absolute right-6 top-8 z-20 md:right-16 md:top-12">
            <p className="type-mono text-[#ffffff]/60">
              <span className="text-starlight">
                {String(active + 1).padStart(2, "0")}
              </span>{" "}
              / {String(n).padStart(2, "0")}
            </p>
          </div>
        )}

        {/* slides */}
        {FOUNDERS.map((f, i) => {
          const idx =
            f.index ??
            `${String(i + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
          return (
            <div
              key={f.id}
              ref={(el) => {
                slides.current[i] = el;
              }}
              className="absolute inset-0"
            >
              {/* photo */}
              <div className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.photoFull}
                  alt={f.name}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: f.objectPos ?? "30% 38%" }}
                  draggable={false}
                />
                <div className="dot-film absolute inset-0" />
                <div className="dot-film-fine absolute inset-0" />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(4,4,10,0) 26%, rgba(4,4,10,0.45) 52%, rgba(4,4,10,0.93) 100%)",
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    boxShadow: "inset 0 -120px 160px -40px rgba(4,4,10,0.9)",
                  }}
                />
              </div>

              {/* details */}
              <div className="absolute inset-y-0 right-0 flex w-full items-center px-8 md:w-[50%] md:px-16">
                <div className="founder-details">
                  <p className="type-mono text-cherenkov-700">{idx}</p>
                  <h3
                    className="type-display mt-4 text-starlight"
                    style={{ fontSize: "clamp(2.6rem, 7vw, 6rem)" }}
                  >
                    {f.name}
                  </h3>
                  <p className="type-mono mt-4 text-cherenkov-300">{f.role}</p>
                  <div className="mt-8 space-y-3">
                    {f.details.map((d) => (
                      <p
                        key={d}
                        className="max-w-sm text-[#ffffff]/60"
                        style={{ lineHeight: 1.65 }}
                      >
                        {d}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* mobile / tablet arrow buttons */}
        {n > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous founder"
              data-cursor="link"
              onClick={() => step(-1)}
              className="absolute bottom-24 left-4 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-starlight backdrop-blur-md transition-colors hover:border-cherenkov-500/50 hover:text-cherenkov-300 lg:hidden"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M15 18l-6-6 6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Next founder"
              data-cursor="link"
              onClick={() => step(1)}
              className="absolute bottom-24 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-starlight backdrop-blur-md transition-colors hover:border-cherenkov-500/50 hover:text-cherenkov-300 lg:hidden"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M9 6l6 6-6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}

        {/* bottom dots (+ touch loader; the desktop loader lives on the cursor) */}
        {n > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center gap-4 pb-8">
            <div className="flex gap-2">
              {FOUNDERS.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  aria-label={`Go to ${f.name}`}
                  data-cursor="link"
                  onClick={() => go(i, i >= indexRef.current ? 1 : -1)}
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: i === active ? 28 : 8,
                    background:
                      i === active
                        ? "var(--color-cherenkov-500)"
                        : "rgba(242,245,250,0.25)",
                    boxShadow:
                      i === active ? "0 0 10px rgba(56,219,255,0.7)" : "none",
                  }}
                />
              ))}
            </div>
            <div className="h-px w-40 overflow-hidden bg-white/12 md:w-64 lg:hidden">
              <span
                ref={bar}
                className="block h-full origin-left bg-cherenkov-500"
                style={{
                  transform: "scaleX(0)",
                  boxShadow: "0 0 8px rgba(56,219,255,0.8)",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* desktop directional cursor: physics + progress ring + 3D flip */}
      <div
        ref={arrow}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 hidden h-16 w-16 items-center justify-center rounded-full border border-cherenkov-500/20 bg-cherenkov-500/10 backdrop-blur-md lg:flex"
        style={{ zIndex: "var(--z-cursor)", opacity: 0, perspective: 420 }}
      >
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 64 64"
          fill="none"
        >
          <circle
            cx="32"
            cy="32"
            r={RING_R}
            stroke="rgba(56,219,255,0.15)"
            strokeWidth="2"
          />
          <circle
            ref={ring}
            cx="32"
            cy="32"
            r={RING_R}
            stroke="var(--color-cherenkov-300)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C}
            style={{ filter: "drop-shadow(0 0 4px rgba(56,219,255,0.7))" }}
          />
        </svg>
        <svg
          ref={chevron}
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-cherenkov-300)"
          strokeWidth="2"
        >
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
