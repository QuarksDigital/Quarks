/** QUARKS — every motion value in the experience lives here. (Animation Bible §0) */

export const EASE = {
  /** things being born */
  emergence: "expo.out",
  emergenceCss: "cubic-bezier(0.16,1,0.3,1)",
  /** camera + pinned moves */
  orbital: "power4.inOut",
  orbitalCss: "cubic-bezier(0.83,0,0.17,1)",
  elastic: "elastic.out(1,0.4)",
  settle: "power4.out",
} as const;

export const DURATION = {
  micro: 0.3,
  base: 0.8,
  cinematic: 1.6,
} as const;

export const LENIS = {
  lerp: 0.15,
  wheelMultiplier: 0.3,
  touchMultiplier: 1.1,
} as const;

export const SCRUB = 1;

/** Pin lengths (in viewport-heights) per scene, per tier. */
export const PIN = {
  hero: { desktop: 2000, tablet: 400, mobile: 300 },
  manifesto: { desktop: 2000, tablet: 260, mobile: 220 },
  forces: { desktop: 2500, tablet: 400, mobile: 380 },
  collisionEach: { desktop: 400, tablet: 140, mobile: 120 },
  scale: { desktop: 2000, tablet: 320, mobile: 280 },
  contact: { desktop: 2000, tablet: 180, mobile: 160 },
} as const;

export const CURSOR = {
  dotLerp: 0.12,
  ringLerp: 0.35,
  magneticRadius: 120,
  magneticPull: 0.35,
  labelPull: 0.3,
} as const;

export const VIDEO_SCRUB_LERP = 0.22;

export const PERF = {
  dprMax: 1.75,
  dprDegraded: 1.25,
  droppedFramesWindow: 2000,
  droppedFramesLimit: 12,
} as const;
