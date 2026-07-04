/**
 * Every ScrollTrigger in the experience registers here so we can
 * refresh (debounced resize) or kill globally (Bible §9.5/9.8).
 */
import { ScrollTrigger } from "@/lib/gsap";

const registry = new Set<ScrollTrigger>();

export function register(st: ScrollTrigger): ScrollTrigger {
  registry.add(st);
  return st;
}

export function unregister(st: ScrollTrigger): void {
  registry.delete(st);
}

export function refreshAll(): void {
  ScrollTrigger.refresh();
}

let resizeTimer: ReturnType<typeof setTimeout> | null = null;
export function installDebouncedRefresh(): () => void {
  const onResize = () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => refreshAll(), 200);
  };
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}
