/**
 * S4 - the founder stage.
 *
 * A crossfade slideshow that advances on click, swipe, arrows or dwell. The
 * custom ring cursor doubles as the progress indicator for the auto-advance,
 * and its chevron flips depending on which half of the stage you're over -
 * so the click target is always legible before you commit to it.
 */
import { gsap } from "@/lib/gsap";
import { FOUNDERS as FOUNDER_MOTION } from "@/constants/motion";
import { COLORS } from "@/constants/tokens";
import type { SceneBuildArgs } from "@/hooks/useSceneTrigger";

export interface FounderRefs {
  stage: HTMLElement | null;
  counter: HTMLElement | null;
  cursor: HTMLElement | null;
  chevron: HTMLElement | null;
  ring: SVGCircleElement | null;
}

export function createFounderScene({ refs, reduced }: SceneBuildArgs<FounderRefs>): () => void {
  const { stage, counter, cursor, chevron, ring } = refs;
  if (!stage) return () => {};

  const slides = Array.from(stage.querySelectorAll<HTMLElement>("[data-slide]"));
  const dots = Array.from(stage.querySelectorAll<HTMLElement>("[data-fdot]"));
  const n = slides.length;
  if (!n) return () => {};

  let index = 0;
  let busy = false;
  let dwell = 0;
  let dir = 1;

  const paintDots = (next: number, animate: boolean) => {
    dots.forEach((d, i) => {
      const vals = {
        width: i === next ? 24 : 7,
        backgroundColor: i === next ? COLORS.accentPale : "rgba(241,240,236,.28)",
      };
      if (animate) gsap.to(d, { ...vals, duration: 0.5, ease: "power3.out" });
      else gsap.set(d, vals);
    });
  };

  slides.forEach((s, i) => {
    gsap.set(s, { autoAlpha: i === 0 ? 1 : 0, zIndex: i === 0 ? 2 : 1 });
    gsap.set(s.querySelector("[data-fdetails]"), { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 22 });
  });
  paintDots(0, false);
  if (counter) counter.textContent = "01";

  const go = (next: number, d: number) => {
    if (next === index || busy) return;
    busy = true;
    const from = index;
    index = next;
    const a = slides[from];
    const b = slides[next];

    gsap.set(b, { zIndex: 3 });
    gsap
      .timeline({
        onComplete: () => {
          gsap.set(a, { zIndex: 1 });
          gsap.set(b, { zIndex: 2 });
          busy = false;
        },
      })
      .to(a.querySelector("[data-fdetails]"), { autoAlpha: 0, y: -18 * d, duration: 0.35, ease: "power2.in" }, 0)
      .fromTo(
        b,
        { autoAlpha: 0, scale: 1.06, xPercent: 4 * d },
        { autoAlpha: 1, scale: 1, xPercent: 0, duration: 0.95, ease: "expo.out" },
        0.05,
      )
      .to(a, { autoAlpha: 0, duration: 0.7, ease: "power2.inOut" }, 0.1)
      .fromTo(
        b.querySelector("[data-fdetails]"),
        { autoAlpha: 0, y: 26 * d },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out" },
        0.28,
      );

    paintDots(next, true);
    if (counter) counter.textContent = String(next + 1).padStart(2, "0");
    dwell = 0;
  };

  const step = (d: number) => go((index + d + n) % n, d);

  // ── controls ────────────────────────────────────────────────────────────
  const cleanups: (() => void)[] = [];

  stage.querySelectorAll<HTMLElement>("[data-farrow]").forEach((btn) => {
    const onClick = (e: Event) => {
      e.stopPropagation();
      step(parseInt(btn.dataset.farrow || "1", 10));
    };
    btn.addEventListener("click", onClick);
    cleanups.push(() => btn.removeEventListener("click", onClick));
  });

  dots.forEach((d, i) => {
    const onClick = (e: Event) => {
      e.stopPropagation();
      go(i, i > index ? 1 : -1);
    };
    d.addEventListener("click", onClick);
    cleanups.push(() => d.removeEventListener("click", onClick));
  });

  const onStageClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-farrow],[data-fdot],a")) return;
    step(dir);
  };
  stage.addEventListener("click", onStageClick);
  cleanups.push(() => stage.removeEventListener("click", onStageClick));

  if (reduced) return () => cleanups.forEach((fn) => fn());

  // ── ring cursor ─────────────────────────────────────────────────────────
  const coarse = window.matchMedia("(pointer:coarse)").matches;
  if (cursor && !coarse) {
    const cx = gsap.quickTo(cursor, "x", { duration: 0.28, ease: "power3" });
    const cy = gsap.quickTo(cursor, "y", { duration: 0.28, ease: "power3" });
    const globalCursor = document.querySelectorAll("[data-q='cursor'],[data-q='cursor-ring']");

    const onEnter = () => {
      gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" });
      gsap.to(globalCursor, { opacity: 0, duration: 0.25 });
    };
    const onLeave = () => {
      gsap.to(cursor, { opacity: 0, scale: 0.7, duration: 0.35, ease: "power3.in" });
      gsap.to(globalCursor, { opacity: 1, duration: 0.25 });
    };
    const onMove = (e: MouseEvent) => {
      cx(e.clientX - 32);
      cy(e.clientY - 32);
      const r = stage.getBoundingClientRect();
      const nd = (e.clientX - r.left) / r.width < 0.42 ? -1 : 1;
      if (nd !== dir) {
        dir = nd;
        gsap.to(chevron, { rotate: nd === -1 ? 180 : 0, duration: 0.45, ease: "back.out(2)" });
      }
    };
    const onDown = () => {
      gsap.fromTo(cursor, { scale: 0.82 }, { scale: 1, duration: 0.55, ease: "elastic.out(1,0.5)" });
    };

    stage.addEventListener("mouseenter", onEnter);
    stage.addEventListener("mouseleave", onLeave);
    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mousedown", onDown);
    cleanups.push(() => {
      stage.removeEventListener("mouseenter", onEnter);
      stage.removeEventListener("mouseleave", onLeave);
      stage.removeEventListener("mousemove", onMove);
      stage.removeEventListener("mousedown", onDown);
    });
  }

  // ── swipe ───────────────────────────────────────────────────────────────
  let sx = 0;
  let dragging = false;
  const onTouchStart = (e: TouchEvent) => {
    sx = e.touches[0].clientX;
    dragging = true;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 44) step(dx < 0 ? 1 : -1);
  };
  stage.addEventListener("touchstart", onTouchStart, { passive: true });
  stage.addEventListener("touchend", onTouchEnd);
  cleanups.push(() => {
    stage.removeEventListener("touchstart", onTouchStart);
    stage.removeEventListener("touchend", onTouchEnd);
  });

  // ── dwell ───────────────────────────────────────────────────────────────
  /*
   * The dwell timer must run *while* the pointer is over the stage, because
   * the ring that visualises it is only on screen then. Pausing on hover
   * (the obvious reading of "don't advance under the user") meant the ring
   * appeared frozen whenever you could actually see it, and only ran once you
   * had left - which looked broken from every angle.
   *
   * So it advances whenever the stage is in view, and only holds during a
   * transition. Hovering still gives you control via click, arrows and dots.
   */
  const tick = () => {
    if (!stage.isConnected) return;
    const r = stage.getBoundingClientRect();
    const visible = r.top < window.innerHeight * 0.85 && r.bottom > window.innerHeight * 0.15;
    if (visible && !busy) {
      dwell = Math.min(1, dwell + 1 / (60 * FOUNDER_MOTION.dwell));
    }
    ring?.setAttribute("stroke-dashoffset", String(FOUNDER_MOTION.ringCircumference * (1 - dwell)));
    if (dwell >= 1) {
      dwell = 0;
      step(1);
    }
  };
  gsap.ticker.add(tick);
  cleanups.push(() => gsap.ticker.remove(tick));

  return () => cleanups.forEach((fn) => fn());
}
