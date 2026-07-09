"use client";

/** Glass nav pill - hides on downscroll past 100vh, reveals on any upscroll (Bible §0.3). */
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { NAV, SITE } from "@/constants/content";
import { getLenis } from "@/components/providers/SmoothScrollProvider";
import { attachMagnetic } from "@/animations/interactions/magnetic";
import { prefersReducedMotion } from "@/utils/dom";

export default function Nav() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let hidden = false;

    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const shouldHide = self.direction === 1 && self.scroll() > window.innerHeight;
        if (shouldHide !== hidden) {
          hidden = shouldHide;
          gsap.to(el, {
            yPercent: hidden ? -150 : 0,
            duration: 0.5,
            ease: "expo.out",
            overwrite: "auto",
          });
        }
      },
    });

    const detachMagnetic = attachMagnetic(el);
    return () => {
      st.kill();
      detachMagnetic();
    };
  }, []);

  const go = (target: string) => {
    const lenis = getLenis();
    const node = document.querySelector(target);
    if (lenis && node) lenis.scrollTo(node as HTMLElement, { duration: 1.8 });
    else node?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      ref={ref}
      className="glass fixed left-1/2 top-4 flex w-[calc(100vw-2rem)] -translate-x-1/2 items-center justify-between gap-4 rounded-full px-4 py-2 md:top-5 md:w-auto md:justify-start md:gap-6 md:px-6 md:py-3"
      style={{ zIndex: "var(--z-nav)" }}
    >
      <a
        href="#top"
        data-cursor="link"
        aria-label={`${SITE.name} - back to top`}
        className="flex shrink-0 items-center gap-2 no-underline"
        onClick={(e) => {
          e.preventDefault();
          getLenis()?.scrollTo(0, { duration: 2 });
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="logo"
          aria-hidden="true"
          className="h-5 w-5 md:h-6 md:w-6"
          style={{ filter: "drop-shadow(0 0 6px rgba(56,219,255,0.55))" }}
        />
        <span className="type-display whitespace-nowrap text-xs tracking-tight text-starlight md:text-sm">{SITE.name}</span>
      </a>

      <nav className="hidden items-center gap-5 md:flex">
        {NAV.links.map((l) => (
          <button
            key={l.label}
            type="button"
            data-cursor="link"
            onClick={() => go(l.target)}
            className="type-mono text-dust transition-colors hover:text-starlight"
          >
            {l.label}
          </button>
        ))}
      </nav>

      <button
        type="button"
        data-magnetic
        data-magnetic-radius="70"
        data-magnetic-pull="0.2"
        data-cursor="link"
        onClick={() => go("#contact")}
        className="type-mono shrink-0 whitespace-nowrap rounded-full border border-cherenkov-700 px-3 py-1 text-[11px] text-cherenkov-300 md:px-4 md:py-1.5 md:text-xs"
      >
        <span data-magnetic-inner className="inline-block">{NAV.cta}</span>
      </button>
    </header>
  );
}
