/**
 * S3 — The Forces (Animation Bible §4).
 * Four chapters, continuous camera pans, symbols drawing/retracting,
 * plus a scene-wide particle stream that bends toward the cursor.
 */
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { register, unregister } from "@/animations/core/timelineRegistry";
import { reportSceneRange } from "@/animations/core/sceneRanges";
import { setHudLabel } from "@/components/persistent/SectionHUD";
import { getEngine } from "@/components/webgl/engine";
import { FORCES_HUD } from "@/constants/content";
import { FORCES_KEYS } from "@/constants/scenes";
import { PIN } from "@/constants/motion";
import { isTouchDevice } from "@/utils/dom";
import type { SceneBuildArgs } from "@/hooks/useSceneTrigger";

export interface ForcesRefs {
  section: HTMLElement | null;
  track: HTMLDivElement | null;
  intro: HTMLDivElement | null;
  chapters: (HTMLDivElement | null)[];
  demoCanvas: HTMLCanvasElement | null;
}

function createStream(canvas: HTMLCanvasElement): { start: () => void; stop: () => void } {
  const ctx = canvas.getContext("2d");
  if (!ctx || isTouchDevice()) return { start: () => {}, stop: () => {} };
  const N = 90;
  const parts = Array.from({ length: N }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: 0.6 + Math.random() * 1.2,
    vy: (Math.random() - 0.5) * 0.2,
  }));
  let mx = -9999;
  let my = -9999;
  let raf = 0;
  let running = false;

  const onMove = (e: PointerEvent) => {
    mx = e.clientX;
    my = e.clientY;
  };

  const loop = () => {
    if (!running) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(56,219,255,0.75)";
    parts.forEach((p) => {
      const dx = mx - p.x;
      const dy = my - p.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 60000) {
        const f = 42 / Math.max(d2, 900);
        p.vx += dx * f;
        p.vy += dy * f;
      }
      p.vx = p.vx * 0.985 + 0.02;
      p.vy *= 0.97;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x > w + 10) {
        p.x = -10;
        p.y = Math.random() * h;
        p.vx = 0.6 + Math.random() * 1.2;
        p.vy = (Math.random() - 0.5) * 0.2;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.1, 0, Math.PI * 2);
      ctx.fill();
    });
    raf = requestAnimationFrame(loop);
  };

  return {
    start() {
      if (running) return;
      running = true;
      window.addEventListener("pointermove", onMove, { passive: true });
      loop();
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}

export function createForcesScene({ refs, tier, reduced }: SceneBuildArgs<ForcesRefs>): () => void {
  const { section, intro, chapters, demoCanvas } = refs;
  if (!section || !intro || !demoCanvas || chapters.some((c) => !c)) return () => {};
  const chs = chapters as HTMLDivElement[];

  if (reduced) {
    gsap.set([intro, ...chs], { opacity: 1, position: "relative" });
    chs.forEach((c) => {
      c.querySelectorAll<SVGPathElement>("[data-symbol-path]").forEach((p) => {
        p.style.strokeDasharray = "";
        p.style.strokeDashoffset = "";
      });
    });
    return () => {};
  }

  const stream = createStream(demoCanvas);
  const panScale = tier === "desktop" ? 1 : 0.5;

  const splits = chs.map((c) => {
    const name = c.querySelector<HTMLElement>("[data-force-name]");
    return name ? new SplitText(name, { type: "chars" }) : null;
  });

  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

  gsap.set(intro, { opacity: 0 });
  tl.to(intro, { opacity: 1, duration: 0.05, ease: "power2.out" }, 0.005)
    .to(intro, { opacity: 0, z: 200, duration: 0.04, ease: "power2.in" }, FORCES_KEYS.intro[1] - 0.04);

  const introLine = intro.querySelector<HTMLElement>("[data-intro-line]");
  if (introLine) {
    gsap.set(introLine, { scaleX: 0, transformOrigin: "left center" });
    tl.to(introLine, { scaleX: 1, duration: 0.06, ease: "power2.inOut" }, 0.01);
  }

  chs.forEach((c, k) => {
    const start = FORCES_KEYS.intro[1] + FORCES_KEYS.chapter * k;
    const dur = FORCES_KEYS.chapter;
    const arriveEnd = start + dur * FORCES_KEYS.chapterMorph;
    const exitStart = start + dur * FORCES_KEYS.chapterHoldEnd;

    const chars = (splits[k]?.chars ?? []) as HTMLElement[];
    const panel = c.querySelector<HTMLElement>("[data-force-panel]");
    const paths = Array.from(c.querySelectorAll<SVGPathElement>("[data-symbol-path]"));
    const symbolWrap = c.querySelector<HTMLElement>("[data-symbol]");

    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    });

    gsap.set(c, { opacity: 0, xPercent: 8 * panScale, rotationY: -4 * panScale, pointerEvents: "none" });
    if (chars.length) gsap.set(chars, { rotationX: -90, opacity: 0, transformOrigin: "50% 50% -40px" });
    if (panel) gsap.set(panel, { y: 40, opacity: 0, filter: "blur(6px)" });

    tl.to(c, { opacity: 1, xPercent: 0, rotationY: 0, duration: dur * 0.2, ease: "power2.out" }, start)
      .set(c, { pointerEvents: "auto" }, arriveEnd)
      .to(
        paths,
        { strokeDashoffset: 0, duration: dur * 0.28, ease: "power1.inOut", stagger: dur * 0.03 },
        start + dur * 0.04,
      );

    if (chars.length) {
      tl.to(
        chars,
        { rotationX: 0, opacity: 1, duration: dur * 0.2, ease: "power2.out", stagger: dur * 0.012 },
        start + dur * 0.08,
      );
    }
    if (panel) {
      tl.to(panel, { y: 0, opacity: 1, filter: "blur(0px)", duration: dur * 0.2, ease: "power2.out" }, start + dur * 0.16);
    }
    if (symbolWrap) {
      tl.to(symbolWrap, { rotation: 14, duration: dur * (FORCES_KEYS.chapterHoldEnd - FORCES_KEYS.chapterMorph) }, arriveEnd);
    }

    if (k < chs.length - 1) {
      tl.set(c, { pointerEvents: "none" }, exitStart)
        .to(
          paths,
          { strokeDashoffset: (i, t: SVGPathElement) => -t.getTotalLength(), duration: dur * 0.16, ease: "power1.in", stagger: dur * 0.02 },
          exitStart,
        )
        .to(c, { opacity: 0, xPercent: -8 * panScale, rotationY: 4 * panScale, duration: dur * 0.2, ease: "power2.in" }, exitStart + dur * 0.04);
      if (chars.length) {
        tl.to(chars, { rotationX: 90, opacity: 0, duration: dur * 0.14, ease: "power2.in", stagger: dur * 0.01 }, exitStart);
      }
    } else {
      tl.to(c, { opacity: 0, z: 260, duration: 0.05, ease: "power2.in" }, 0.95);
    }
  });

  const st = register(
    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${PIN.forces[tier]}vh`,
      pin: true,
      scrub: 1,
      onEnter: () => {
        setHudLabel(FORCES_HUD);
        stream.start();
        getEngine()?.setActive("gridWorld", false);
        getEngine()?.setActive("triad", false);
      },
      onEnterBack: () => {
        setHudLabel(FORCES_HUD);
        stream.start();
      },
      onLeave: () => stream.stop(),
      onLeaveBack: () => {
        stream.stop();
        getEngine()?.setActive("gridWorld", true);
      },
      onRefresh: (self) => reportSceneRange("forces", self),
      onUpdate: (self) => tl.progress(self.progress),
    }),
  );

  return () => {
    unregister(st);
    st.kill();
    stream.stop();
    splits.forEach((s) => s?.revert());
  };
}
