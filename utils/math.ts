export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

export const mapRange = (
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number => outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);

/** progress of v within [a,b], clamped 0–1 */
export const window01 = (v: number, a: number, b: number): number =>
  clamp((v - a) / (b - a), 0, 1);

/** exponential interpolation (for the 10^N zoom shells) */
export const expInterp = (from: number, to: number, t: number): number =>
  from * Math.pow(to / from, t);
