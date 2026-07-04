"use client";

/** The CTA: glass ring, orb core, magnetic body, energizing hover (Bible §7). */
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

interface Props {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function MagneticButton({ children, href, onClick, className = "" }: Props) {
  const orbRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const orbEl = orbRef.current;
    if (!root || !orbEl) return;

    const onEnter = () => {
      gsap.to(orbEl, { scale: 1.6, opacity: 1, duration: 0.5, ease: "expo.out" });
      gsap.to(root, { borderColor: "rgba(56,219,255,0.65)", duration: 0.4 });
    };
    const onLeave = () => {
      gsap.to(orbEl, { scale: 1, opacity: 0.7, duration: 0.7, ease: "elastic.out(1,0.5)" });
      gsap.to(root, { borderColor: "rgba(240,244,255,0.16)", duration: 0.5 });
    };
    const onClickBurst = () => {
      const burst = document.createElement("span");
      burst.className = "pointer-events-none absolute inset-0";
      for (let i = 0; i < 12; i++) {
        const p = document.createElement("span");
        p.style.cssText =
          "position:absolute;left:50%;top:50%;width:3px;height:3px;border-radius:9999px;background:#9ff1ff;box-shadow:0 0 8px rgba(56,219,255,.9)";
        burst.appendChild(p);
        const a = (i / 12) * Math.PI * 2;
        gsap.to(p, {
          x: Math.cos(a) * (40 + Math.random() * 30),
          y: Math.sin(a) * (40 + Math.random() * 30),
          opacity: 0,
          duration: 0.6,
          ease: "expo.out",
          onComplete: () => p.remove(),
        });
      }
      root.appendChild(burst);
      setTimeout(() => burst.remove(), 700);
    };

    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("click", onClickBurst);
    return () => {
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("click", onClickBurst);
    };
  }, []);

  return (
    <a
      ref={rootRef}
      href={href}
      onClick={onClick}
      data-magnetic
      data-cursor="link"
      className={`glass relative inline-flex items-center gap-3 overflow-visible rounded-full px-8 py-4 no-underline transition-colors ${className}`}
      style={{ borderColor: "rgba(240,244,255,0.16)" }}
    >
      <span
        ref={orbRef}
        aria-hidden="true"
        className="relative inline-block h-2.5 w-2.5 rounded-full bg-cherenkov-300 opacity-70"
        style={{ boxShadow: "0 0 14px 3px rgba(56,219,255,0.8)" }}
      />
      <span data-magnetic-inner className="type-mono text-starlight">
        {children}
      </span>
    </a>
  );
}
