import type { SceneId } from "@/constants/scenes";

export type Tier = "desktop" | "tablet" | "mobile";

export type OrbMode = "video" | "triad" | "morph" | "particle" | "anchor" | "core" | "hidden";

export interface OrbState {
  mode: OrbMode;
  /** normalized screen position 0–1 */
  x: number;
  y: number;
  energy: number;
  scene: SceneId | "preloader";
}

export type CursorVariant = "default" | "link" | "media" | "drag" | "text" | "hero" | "hidden";

export interface SceneContext {
  tier: Tier;
  reduced: boolean;
}
