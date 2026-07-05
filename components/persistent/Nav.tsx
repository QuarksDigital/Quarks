"use client";

/** Glass nav pill — hides on downscroll past 100vh, reveals on any upscroll (Bible §0.3). */
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
      className="glass fixed left-1/2 top-5 flex -translate-x-1/2 items-center gap-6 rounded-full px-6 py-3"
      style={{ zIndex: "var(--z-nav)" }}
    >
      <a
        href="#top"
        data-cursor="link"
        aria-label={`${SITE.name} — back to top`}
        className="flex items-center gap-2 no-underline"
        onClick={(e) => {
          e.preventDefault();
          getLenis()?.scrollTo(0, { duration: 2 });
        }}
      >
        <span aria-hidden="true" className="relative inline-block h-4 w-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute h-[4px] w-[4px] rounded-full bg-cherenkov-500"
              style={{
                left: `${[6, 0, 12][i]}px`,
                top: `${[0, 10, 10][i]}px`,
                boxShadow: "0 0 6px rgba(56,219,255,0.9)",
              }}
            />
          ))}
        </span>
        <span className="type-display text-sm tracking-tight text-starlight">{SITE.name}</span>
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
        className="type-mono rounded-full border border-cherenkov-700 px-4 py-1.5 text-cherenkov-300"
      >
        <span data-magnetic-inner className="inline-block">{NAV.cta}</span>
      </button>
    </header>
  );
}
