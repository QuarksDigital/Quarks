"use client";

/**
 * "The Particle" — custom cursor (Animation Bible §8).
 * Dot + lagging ring; variants via [data-cursor] on targets.
 * Media variant splits the ring into the three-quark triad.
 */
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { CURSOR } from "@/constants/motion";
import { isTouchDevice, prefersReducedMotion } from "@/utils/dom";
import type { CursorVariant } from "@/types";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const triadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTouchDevice() || prefersReducedMotion()) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    const triad = triadRef.current;
    if (!dot || !ring || !label || !triad) return;

    document.body.dataset.customCursor = "true";

    const dotX = gsap.quickTo(dot, "x", {
      duration: CURSOR.dotLerp,
      ease: "power3.out",
    });
    const dotY = gsap.quickTo(dot, "y", {
      duration: CURSOR.dotLerp,
      ease: "power3.out",
    });
    const ringX = gsap.quickTo(ring, "x", {
      duration: CURSOR.ringLerp,
      ease: "power3.out",
    });
    const ringY = gsap.quickTo(ring, "y", {
      duration: CURSOR.ringLerp,
      ease: "power3.out",
    });

    let lastX = 0;
    let lastY = 0;
    let lastT = performance.now();
    let variant: CursorVariant = "default";

    const setVariant = (v: CursorVariant, labelText?: string) => {
      if (v === variant && !labelText) return;
      variant = v;
      const ringEl = ring;
      gsap.killTweensOf(ringEl, "width,height,opacity");
      const size =
        v === "link"
          ? 48
          : v === "hero"
            ? 56
            : v === "drag"
              ? 64
              : v === "media"
                ? 0
                : 32;
      gsap.to(ringEl, {
        width: size,
        height: size,
        opacity: v === "media" || v === "text" ? 0 : 1,
        duration: 0.35,
        ease: "expo.out",
      });
      gsap.to(triad, {
        opacity: v === "media" ? 1 : 0,
        scale: v === "media" ? 1 : 0.5,
        duration: 0.3,
        ease: "expo.out",
      });
      gsap.to(dot, {
        scaleX: v === "text" ? 0.3 : 1,
        scaleY: v === "text" ? 3.2 : 1,
        duration: 0.25,
        ease: "expo.out",
      });
      label.textContent = labelText ?? "";
      gsap.to(label, { opacity: labelText ? 1 : 0, duration: 0.25 });
    };

    const onMove = (e: PointerEvent) => {
      const { clientX: x, clientY: y } = e;
      dotX(x);
      dotY(y);
      ringX(x);
      ringY(y);
      gsap.to(triad, {
        x,
        y,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(label, {
        x: x + 18,
        y: y - 24,
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto",
      });

      const now = performance.now();
      const dt = Math.max(now - lastT, 1);
      const vx = (x - lastX) / dt;
      const vy = (y - lastY) / dt;
      const speed = Math.hypot(vx, vy);
      const angle = (Math.atan2(vy, vx) * 180) / Math.PI;

      gsap.set(dot, { xPercent: -50, yPercent: -50 });
      gsap.set(ring, { xPercent: -50, yPercent: -50 });

      gsap.set(ring, {
        rotation: angle,
        scaleX: 1 + Math.min(speed * 0.18, 0.4),
        scaleY: 1 - Math.min(speed * 0.08, 0.18),
      });
      lastX = x;
      lastY = y;
      lastT = now;

      const target = (e.target as HTMLElement)?.closest?.(
        "[data-cursor]",
      ) as HTMLElement | null;
      if (target) {
        setVariant(
          (target.dataset.cursor as CursorVariant) || "link",
          target.dataset.cursorLabel,
        );
      } else {
        const interactive = (e.target as HTMLElement)?.closest?.(
          "a,button,input,textarea,[role='button']",
        );
        setVariant(interactive ? "link" : "default");
      }
    };

    const onDown = () => gsap.to(dot, { scale: 0.6, duration: 0.15 });
    const onUp = () =>
      gsap.to(dot, { scale: 1, duration: 0.3, ease: "elastic.out(1,0.4)" });
    const onLeave = () =>
      gsap.to([dot, ring, triad, label], { opacity: 0, duration: 0.2 });
    const onEnter = () => gsap.to([dot, ring], { opacity: 1, duration: 0.2 });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);

    return () => {
      delete document.body.dataset.customCursor;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return (
    <div aria-hidden="true" className="contents">
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-cherenkov-500"
        style={{
          zIndex: "var(--z-cursor)",
          boxShadow: "0 0 12px 2px rgba(56,219,255,0.75)",
        }}
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border"
        style={{
          zIndex: "var(--z-cursor)",
          borderColor: "rgba(242,245,250,0.35)",
        }}
      />
      <div
        ref={triadRef}
        className="pointer-events-none fixed left-0 top-0 opacity-0"
        style={{
          zIndex: "var(--z-cursor)",
          marginLeft: "-2px",
          marginTop: "-2px",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-cherenkov-300"
            style={{
              boxShadow: "0 0 8px 1px rgba(159,241,255,0.8)",
              animation: `quarks-orbit 1.6s linear infinite`,
              animationDelay: `${(-i * 1.6) / 3}s`,
            }}
          />
        ))}
        <style>{`
          @keyframes quarks-orbit {
            from { transform: rotate(0deg) translateX(24px) rotate(0deg); }
            to { transform: rotate(360deg) translateX(24px) rotate(-360deg); }
          }
        `}</style>
      </div>
      <div
        ref={labelRef}
        className="type-mono pointer-events-none fixed left-0 top-0 text-cherenkov-300 opacity-0"
        style={{ zIndex: "var(--z-cursor)", fontSize: "0.6rem" }}
      />
    </div>
  );
}
