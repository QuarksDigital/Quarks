"use client";

/**
 * Watches every [data-route] section and publishes the one owning the middle
 * of the viewport. Mounted once, from the route chrome.
 */
import { ScrollTrigger } from "@/lib/gsap";
import { routeStore } from "@/lib/route";
import type { RouteTheme } from "@/constants/tokens";

export function installRouteObserver(): () => void {
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-route]"));
  const triggers = sections.map((sec) =>
    ScrollTrigger.create({
      trigger: sec,
      start: "top 45%",
      end: "bottom 45%",
      onToggle: (self) => {
        if (!self.isActive) return;
        const route = sec.dataset.route || "/";
        const theme = (sec.dataset.theme as RouteTheme) || "dark";
        routeStore.set(route, theme);
        // Reflect the section in the address bar without a navigation.
        try {
          window.history.replaceState(null, "", route === "/" ? "#home" : `#${route.slice(1)}`);
        } catch {
          /* replaceState can throw in sandboxed frames - non-fatal */
        }
      },
    }),
  );

  return () => triggers.forEach((t) => t.kill());
}
