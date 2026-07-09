/** QUARKS - per-scene keyframe tables (Animation Bible). Progress values are 0–1 inside each scene. */

export const SCENE_IDS = [
  "hero",
  "manifesto",
  "forces",
  "collisions",
  "scale",
  "proof",
  "contact",
] as const;
export type SceneId = (typeof SCENE_IDS)[number];

/** Scale-readout exponent plateaus across the document (Bible §0.4). */
export const SCALE_MAP: { scene: SceneId; from: number; to: number }[] = [
  { scene: "hero", from: -18, to: -15 },
  { scene: "manifesto", from: -15, to: -12 },
  { scene: "forces", from: -12, to: -9 },
  { scene: "collisions", from: -9, to: 0 },
  { scene: "scale", from: 0, to: 24 },
  { scene: "proof", from: 24, to: 25 },
  { scene: "contact", from: 25, to: 26 },
];

export const HERO_KEYS = {
  taglineIn: [0.0, 0.08],
  actOne: [0.08, 0.42],
  glyphOut: [0.42, 0.55],
  actTwo: [0.55, 0.9],
  handoff: [0.9, 1.0],
} as const;

export const MANIFESTO_KEYS = {
  settle: [0.0, 0.08],
  groupA: [0.08, 0.4],
  groupB: [0.3, 0.62],
  groupC: [0.52, 0.84],
  particlesLine: [0.68, 0.92],
  exit: [0.92, 1.0],
} as const;

export const FORCES_KEYS = {
  intro: [0.0, 0.12],
  chapter: 0.22,
  chapterMorph: 0.25,
  chapterHoldEnd: 0.75,
} as const;

export const COLLISION_KEYS = {
  beams: [0.0, 0.2],
  impact: [0.2, 0.24],
  burst: [0.24, 0.35],
  hold: [0.35, 0.85],
  exit: [0.85, 1.0],
} as const;

export const SCALE_SHELLS = ["quark", "nucleus", "atom", "lattice", "network", "cosmos"] as const;
export const SCALE_SHELL_WINDOW = 0.3;
export const SCALE_SHELL_STEP = 0.15;
export const SCALE_STEP_AT = [0.12, 0.28, 0.46, 0.64, 0.8] as const;

export const CONTACT_KEYS = {
  infall: [0.0, 0.35],
  merge: [0.35, 0.55],
  headline: [0.4, 0.8],
  footer: [0.8, 1.0],
} as const;
