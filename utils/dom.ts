export const vh = (n: number): number =>
  typeof window === "undefined" ? 0 : (window.innerHeight * n) / 100;

export const vw = (n: number): number =>
  typeof window === "undefined" ? 0 : (window.innerWidth * n) / 100;

export const isTouchDevice = (): boolean =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

/*
 * A mouse or trackpad is present. Checked with a pointer media query rather
 * than `isTouchDevice`, because touchscreen laptops (e.g. an HP EliteBook)
 * report touch points *and* drive a fine trackpad - keying the custom cursor
 * off touch capability alone wrongly suppressed it on those machines. `fine`
 * as the primary pointer, or any fine pointer at all, both count.
 */
export const hasFinePointer = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  (window.matchMedia("(pointer: fine)").matches ||
    window.matchMedia("(any-pointer: fine)").matches);

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
