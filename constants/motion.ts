/** QUARKS - every motion value in the experience lives here. */

export const EASE = {
  /** things being born */
  emergence: "expo.out",
  emergenceCss: "cubic-bezier(0.16,1,0.3,1)",
  /** pinned + camera moves */
  orbital: "power4.inOut",
  orbitalCss: "cubic-bezier(0.83,0,0.17,1)",
  elastic: "elastic.out(1,0.4)",
  /** the nav pill and services tab indicator */
  pill: "elastic.out(1,0.62)",
  settle: "power3.out",
} as const;

export const DURATION = {
  micro: 0.3,
  base: 0.9,
  cinematic: 1.35,
} as const;

export const LENIS = {
  duration: 1.15,
  wheelMultiplier: 0.92,
  touchMultiplier: 1.1,
} as const;

export const SCRUB = 1;

/** Word-mask reveal shared by every [data-split] heading. */
export const REVEAL = {
  yPercent: 118,
  duration: 1.05,
  stagger: 0.035,
  start: "top 88%",
} as const;

export const HERO = {
  /** scroll runway for the pinned hero, in viewport-heights */
  runway: 340,
  videoScrub: 0.6,
} as const;

/**
 * The work carousel is a helix: cards travel vertically past the camera while
 * orbiting a central axis, so scrolling down carries them down and out of
 * frame while the next ones rise from below.
 */
export const WORK = {
  /** pinned runway, in viewport-heights */
  runway: 3.2,
  /**
   * Revolutions across one pass of the stack. Held under 1 deliberately: at a
   * full turn the neighbouring cards sit at +/-90deg and present their edges,
   * so only one card is ever readable. Half a turn keeps three in view.
   */
  turns: 0.5,
  /** vertical travel of the whole column, in viewport-heights */
  spread: 2.4,
  /**
   * How far from centre a card stays visible, as a fraction of the loop.
   *
   * Must stay under 0.5. A card's distance from centre peaks at exactly 0.5 -
   * the seam where it wraps from one end of the column to the other - so any
   * larger value leaves it still faintly visible as it teleports, which reads
   * as the same case appearing twice.
   */
  falloff: 0.46,
  /** cylinder radius as a multiple of the panel's half-width */
  radiusFactor: 1.05,
  /** drag adds to the scroll travel; these govern its feel */
  dragScale: 0.0016,
  friction: 0.93,
  lerp: 0.1,
  /** seconds for the open / close transition */
  openDuration: 1.05,
  closeDuration: 0.7,
} as const;

export const FOUNDERS = {
  /** seconds each portrait holds before auto-advancing */
  dwell: 7,
  ringCircumference: 188.5,
} as const;

/**
 * Nav centre inertia. Driven by smoothed scroll velocity rather than a
 * direction flag, so it accelerates into the move and relaxes home on its own.
 */
export const NAV_INERTIA = {
  /** how much of each frame's delta feeds the running velocity (0-1) */
  smoothing: 0.16,
  /** ignore anything past this px/frame, so a scrollbar fling can't max it out */
  clampVelocity: 45,
  /** px of travel per px/frame of velocity */
  strength: 0.5,
  /** hard cap on travel, kept under half the bar height so it never clips */
  max: 14,
  /** degrees of X-tip per px/frame - the flex itself */
  bend: 0.42,
  /** hard cap on the tip */
  maxBend: 13,
  /** trailing ease on both channels - this is the "weight" */
  lag: 0.5,
  /** below this width the pill is docked to the bottom edge; no drift */
  disableBelow: 900,
} as const;

export const CURSOR = {
  dotLerp: 0.12,
  ringLerp: 0.45,
  magneticPullX: 0.34,
  magneticPullY: 0.44,
} as const;

export const PERF = {
  dprMax: 1.75,
  dprDegraded: 1.25,
} as const;
