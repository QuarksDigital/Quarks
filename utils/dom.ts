export const vh = (n: number): number =>
  typeof window === "undefined" ? 0 : (window.innerHeight * n) / 100;

export const vw = (n: number): number =>
  typeof window === "undefined" ? 0 : (window.innerWidth * n) / 100;

export const isTouchDevice = (): boolean =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
