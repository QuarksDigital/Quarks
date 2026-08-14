/**
 * S3 - the work helix.
 *
 * Case panels ride a vertical helix around a central axis. Scrolling down
 * carries the column down and out of frame while the next cards rise from
 * below; scrolling up runs it backwards. Each card's angle is a function of
 * how far it has travelled, so vertical motion and rotation are the same
 * gesture rather than two effects layered together.
 *
 * Travel wraps, so the column is endless in both directions - a card that
 * leaves the bottom re-enters at the top.
 *
 * Clicking a card lifts it out of the helix to the front of the stage and
 * expands it. While a card is open the page scroll is locked and any scroll
 * gesture closes it, which is why the hint reads "scroll to close".
 */
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { WORK as M } from "@/constants/motion";
import { getLenis } from "@/components/providers/SmoothScrollProvider";
import type { SceneBuildArgs } from "@/hooks/useSceneTrigger";

export interface WorkRefs {
  stage: HTMLElement | null;
  ring: HTMLElement | null;
  progress: HTMLElement | null;

  /** the drag/scroll rail, hidden while a card is open */
  rail: HTMLElement | null;

  /** centred "scroll to close" line, shown only while a card is open */
  hint: HTMLElement | null;
  scrim: HTMLElement | null;
}

/** Wrap v into [0,1). */
const wrap01 = (v: number): number => ((v % 1) + 1) % 1;

export function createWorkScene({ refs, reduced }: SceneBuildArgs<WorkRefs>): () => void {
  const { stage, ring, progress, rail, hint, scrim } = refs;
  if (!stage || !ring) return () => {};

  const panels = Array.from(ring.querySelectorAll<HTMLElement>("[data-panel]"));

  const n = panels.length;
  if (!n) return () => {};

  let radius = 0;

  let spread = 0;

  const layout = () => {
    const w = panels[0].offsetWidth || 480;
    radius = Math.round((w / 2) * M.radiusFactor + w * 0.32);
    spread = window.innerHeight * M.spread;
    panels.forEach((p) => {
      p.style.marginLeft = `${-(p.offsetWidth / 2)}px`;
      p.style.marginTop = `${-(p.offsetHeight / 2)}px`;
    });
  };

  layout();

  const st = {
    travel: 0,
    target: 0,
    scroll: 0,
    drag: 0,
    vel: 0,
    dragging: false,
    open: -1,
  };

  const paint = () => {
    if (st.open >= 0) return; // the open card owns its own transform
    panels.forEach((p, i) => {
      /*
       * Position along the loop, where t=0.5 is dead ahead.
       *
       * Phrased so that travel=0 centres card 0 and each further quarter-turn
       * of travel centres the next one, which keeps them arriving in document
       * order: case 1, 2, 3, then the open slot. Deriving t from `i/n - travel`
       * instead runs the stack backwards and starts mid-sequence.
       *
       * Because travel increases as you scroll down and t rises with it, the
       * column travels downward under a downward scroll.
       */
      const t = wrap01(0.5 + st.travel - i / n);

      /*
       * t=0.5 is dead ahead, so the angle is measured *from* that point.
       * Deriving it straight from t instead puts the centre card at 180deg -
       * facing away from the camera - and the whole column reads as empty.
       */
      const y = (t - 0.5) * spread;

      const angle = (t - 0.5) * 360 * M.turns;

      const facing = Math.cos((angle * Math.PI) / 180);

      const depth = (facing + 1) / 2;

      // Fade out at the extremes so cards dissolve rather than pop.
      const edge = 1 - Math.min(1, Math.abs(t - 0.5) / M.falloff);

      const alpha = Math.pow(edge, 0.9) * (0.18 + depth * 0.82);
      p.style.transform = `rotateY(${angle}deg) translateZ(${radius}px) translateY(${y}px) rotateY(${-angle * 0.35}deg)`;
      p.style.opacity = String(alpha);
      p.style.filter = `brightness(${(0.5 + depth * 0.5).toFixed(3)}) blur(${((1 - depth) * 2.6).toFixed(2)}px)`;
      p.style.zIndex = String(Math.round(depth * 100));
    });

    if (progress) progress.style.transform = `scaleX(${wrap01(st.travel).toFixed(4)})`;
  };

  const tick = () => {
    if (!st.dragging) {
      st.drag += st.vel;
      st.vel *= M.friction;
      if (Math.abs(st.vel) < 1e-5) st.vel = 0;
    }

    st.target = st.scroll + st.drag;
    st.travel += (st.target - st.travel) * M.lerp;
    paint();
  };

  if (reduced) {
    paint();

    return () => {};
  }

  gsap.ticker.add(tick);

  /*
   * ── snap the runway to card boundaries ──────────────────────────────────
   *
   * travel runs 0 -> 1 across the pin and card i is dead ahead at travel = i/n,
   * so parking scroll progress on a multiple of 1/n leaves whichever card is
   * nearest square to the camera, instead of stopping the column halfway
   * between two faces.
   *
   * ScrollTrigger's own `snap` is not used: it drives the scroll position
   * directly, and Lenis - which owns scrolling here - overwrites that on its
   * next frame, so the snap tween lands and is immediately undone. Handing the
   * move to Lenis instead is the only version that actually holds.
   */
  let settleTimer: ReturnType<typeof setTimeout> | null = null;
  let snapping = false;

  const settle = () => {
    settleTimer = null;
    if (st.open >= 0 || st.dragging || snapping) return;

    const from = pinTrigger.start;
    const span = pinTrigger.end - from;
    if (span <= 0) return;

    const p = (window.scrollY - from) / span;
    // Outside the pin (or right at its edges) there is nothing to snap to.
    if (p < 0.001 || p > 0.999) return;

    /*
     * What has to land on a card boundary is total travel, not scroll alone -
     * a drag on the stage offsets one from the other. Scroll covers as much
     * of the correction as the runway allows and any remainder is folded back
     * into the drag offset, which the ticker's lerp eases in for free.
     */
    const total = st.scroll + st.drag;
    const nearest = Math.round(total * n) / n;
    if (Math.abs(nearest - total) < 0.0015) return;

    const pTarget = Math.min(1, Math.max(0, nearest - st.drag));
    st.drag = nearest - pTarget;
    st.vel = 0;

    const lenis = getLenis();
    const target = Math.round(from + pTarget * span);
    if (!lenis) {
      window.scrollTo({ top: target, behavior: "smooth" });
      return;
    }

    snapping = true;
    lenis.scrollTo(target, {
      duration: 0.55,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      onComplete: () => {
        snapping = false;
      },
    });
  };

  const pinTrigger = ScrollTrigger.create({
    trigger: stage,
    start: "top top",
    end: `+=${Math.round(window.innerHeight * M.runway)}`,
    pin: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      st.scroll = self.progress;
      // Every frame of movement pushes the settle out; it only fires once the
      // reader has actually stopped.
      if (settleTimer) clearTimeout(settleTimer);
      if (!snapping) settleTimer = setTimeout(settle, 160);
    },
  });

  // ── open / close ────────────────────────────────────────────────────────
  const cleanups: (() => void)[] = [];

  const openCard = (i: number) => {
    if (st.open >= 0) return;
    st.open = i;
    stage.dataset.open = "1";
    getLenis()?.stop();

    const card = panels[i];

    const others = panels.filter((_, k) => k !== i);
    gsap.killTweensOf([card, ...others]);
    gsap.to(others, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
      overwrite: true,
    });

    gsap.to(scrim, { autoAlpha: 1, duration: 0.5, ease: "power2.out" });

    /*
     * Target size is resolved to pixels here rather than handed to GSAP as a
     * CSS function: `min(1100px, 88vw)` is not an interpolable value and
     * silently aborts the tween, which left the card sitting in the helix.
     * The card keeps its 16/10 aspect-ratio, so width alone drives height -
     * hence capping width by the viewport height as well.
     */
    card.style.maxHeight = "none";

    const targetW = Math.min(1100, window.innerWidth * 0.88, window.innerHeight * 0.78 * 1.6);

    /*
     * Raise the ring, not just the card. `transform-style: preserve-3d` makes
     * the ring its own stacking context, so a z-index on the card is scoped
     * inside it and still paints beneath the scrim - which is why the opened
     * card came up blurred and dimmed.
     */
    ring.style.zIndex = "200";

    /*
     * Re-centre with explicit pixel margins for the *open* size. layout() sets
     * them from the card's helix size, so once the open tween grows the card
     * those values are stale and it hangs off the bottom-right of the stage.
     * Margins rather than xPercent/yPercent: the card's transform is written
     * as a raw string by paint(), and mixing GSAP's percentage translation
     * into that did not survive the hand-off.
     */
    const targetH = targetW * (10 / 16);
    gsap.set(card, { zIndex: 200 });

    // Square up to the camera. rotationX/Y, not rotateX/Y - GSAP's own names.
    gsap.to(card, {
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      x: 0,
      y: 0,
      z: 0,
      width: targetW,
      marginLeft: -targetW / 2,
      marginTop: -targetH / 2,
      opacity: 1,
      filter: "brightness(1) blur(0px)",
      duration: M.openDuration,
      ease: "expo.out",
      overwrite: true,
    });

    gsap.to(card.querySelectorAll("[data-panel-detail]"), {
      autoAlpha: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.06,
      delay: 0.25,
    });

    // The rail sits over the enlarged card, so it steps aside for the hint.
    gsap.to(rail, { autoAlpha: 0, duration: 0.3, ease: "power2.in" });
    if (hint) gsap.fromTo(hint, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, delay: 0.4 });
  };

  const closeCard = () => {
    if (st.open < 0) return;

    const card = panels[st.open];
    st.open = -1;
    delete stage.dataset.open;
    gsap.killTweensOf(card);
    gsap.to(card.querySelectorAll("[data-panel-detail]"), {
      autoAlpha: 0,
      y: 14,
      duration: 0.25,
      ease: "power2.in",
    });

    gsap.to(scrim, { autoAlpha: 0, duration: 0.45, ease: "power2.in" });

    /*
     * Shrink back to the helix size, then hand every property the open tween
     * touched back to paint(). Tweening to the CSS var directly is not
     * possible, so we resolve the resting width in pixels and clear the
     * inline overrides once we land.
     */
    const restW = parseFloat(getComputedStyle(ring).getPropertyValue("--work-panel-w")) || 0;

    const fallbackW = Math.min(640, window.innerWidth * 0.54);
    gsap.to(card, {
      width: restW || fallbackW,
      duration: M.closeDuration,
      ease: "expo.inOut",
      onComplete: () => {
        gsap.set(card, { clearProps: "transform,width,filter,opacity,zIndex,marginLeft,marginTop" });
        card.style.width = "";
        card.style.maxHeight = "";
        ring.style.zIndex = "";
        layout();
        paint();
      },
    });

    gsap.to(panels, { opacity: 1, duration: 0.5, delay: 0.15, ease: "power2.out" });
    if (hint) gsap.to(hint, { autoAlpha: 0, duration: 0.25 });
    gsap.to(rail, { autoAlpha: 1, duration: 0.4, delay: 0.2, ease: "power2.out" });
    getLenis()?.start();
  };

  panels.forEach((p, i) => {
    const onClick = (e: MouseEvent) => {
      // Let the detail's own link work without closing.
      if ((e.target as HTMLElement).closest("a")) return;
      if (st.open === i) closeCard();
      else if (st.open < 0) openCard(i);
    };

    p.addEventListener("click", onClick);
    cleanups.push(() => p.removeEventListener("click", onClick));
  });

  /*
   * Any scroll gesture closes. The wheel listener is non-passive so the
   * gesture can be swallowed - otherwise the first notch would also scroll
   * the page behind the open card.
   */
  const onWheel = (e: WheelEvent) => {
    if (st.open < 0) return;
    e.preventDefault();
    closeCard();
  };

  const onKey = (e: KeyboardEvent) => {
    if (st.open >= 0 && (e.key === "Escape" || e.key === " " || e.key.startsWith("Arrow"))) {
      closeCard();
    }
  };

  let touchY = 0;

  const onTouchStart = (e: TouchEvent) => {
    touchY = e.touches[0].clientY;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (st.open < 0) return;
    if (Math.abs(e.touches[0].clientY - touchY) > 24) closeCard();
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKey);
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: true });
  cleanups.push(() => {
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
  });

  if (scrim) {
    const onScrimClick = () => closeCard();
    scrim.addEventListener("click", onScrimClick);
    cleanups.push(() => scrim.removeEventListener("click", onScrimClick));
  }

  // ── drag spins the helix ────────────────────────────────────────────────
  let lastY = 0;

  const down = (y: number) => {
    if (st.open >= 0) return;
    st.dragging = true;
    lastY = y;
    st.vel = 0;
    stage.style.cursor = "grabbing";
  };

  const move = (y: number) => {
    if (!st.dragging) return;

    const d = (y - lastY) * M.dragScale;
    lastY = y;
    st.drag -= d;
    st.vel = -d * 0.5;
  };

  const up = () => {
    if (!st.dragging) return;
    st.dragging = false;
    stage.style.cursor = "grab";
  };

  const onMouseDown = (e: MouseEvent) => down(e.clientY);

  const onMouseMove = (e: MouseEvent) => move(e.clientY);

  const onTS = (e: TouchEvent) => down(e.touches[0].clientY);

  const onTM = (e: TouchEvent) => move(e.touches[0].clientY);
  stage.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", up);

  /*
   * Touch drag is desktop-only on purpose.
   *
   * The stage keeps `touch-action: pan-y`, so on a phone a single swipe is
   * both a page scroll *and* a drag: travel advanced twice per gesture and the
   * column looped more than once down the runway, which read as the same case
   * showing up two or three times. A pointer that can hover is a mouse, and a
   * mouse only drags when a button is held - so there the two never overlap.
   */
  const finePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (finePointer) {
    stage.addEventListener("touchstart", onTS, { passive: true });
    stage.addEventListener("touchmove", onTM, { passive: true });
    stage.addEventListener("touchend", up);
  }
  window.addEventListener("resize", layout);
  cleanups.push(() => {
    stage.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", up);
    stage.removeEventListener("touchstart", onTS);
    stage.removeEventListener("touchmove", onTM);
    stage.removeEventListener("touchend", up);
    window.removeEventListener("resize", layout);
  });

  paint();

  return () => {
    if (settleTimer) clearTimeout(settleTimer);
    gsap.ticker.remove(tick);
    pinTrigger.kill();
    getLenis()?.start();
    cleanups.forEach((fn) => fn());
  };
}
