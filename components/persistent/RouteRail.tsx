"use client";

/** Right-edge route ticks. The active one grows a rule and reveals its label. */
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { routeStore } from "@/lib/route";
import { installRouteObserver } from "@/animations/core/routeObserver";
import { ROUTES, COLORS } from "@/constants/tokens";

export default function RouteRail() {
  const rootRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    // The rail owns the observer: it is the one chrome piece always mounted
    // alongside the routed sections.
    const teardown = installRouteObserver();

    const unsub = routeStore.subscribe(({ route, theme }) => {
      gsap.to(rootRef.current, {
        color: theme === "light" ? COLORS.ink : COLORS.bone,
        duration: 0.5,
      });
      itemRefs.current.forEach((el, path) => {
        const on = path === route;
        gsap.to(el.querySelector("span:first-child"), { opacity: on ? 1 : 0, duration: 0.4 });
        gsap.to(el.querySelector("span:last-child"), {
          width: on ? 40 : 22,
          opacity: on ? 1 : 0.28,
          duration: 0.5,
          ease: "power3.out",
        });
      });
    });

    return () => {
      teardown();
      unsub();
    };
  }, []);

  return (
    <aside
      ref={rootRef}
      data-q="rail"
      aria-hidden="true"
      className="fixed top-1/2 flex -translate-y-1/2 flex-col items-end gap-4"
      style={{ right: "clamp(14px,2vw,26px)", zIndex: "var(--z-rail)" }}
    >
      {ROUTES.map((r) => (
        <div
          key={r.path}
          ref={(el) => {
            if (el) itemRefs.current.set(r.path, el);
            else itemRefs.current.delete(r.path);
          }}
          className="flex items-center gap-[10px]"
        >
          <span
            className="type-mono-tight opacity-0"
            style={{ fontSize: "9.5px", letterSpacing: "0.2em" }}
          >
            {r.label}
          </span>
          <span className="block h-[1.5px] w-[22px] bg-current opacity-[0.28]" />
        </div>
      ))}
    </aside>
  );
}
