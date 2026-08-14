export type Tier = "desktop" | "tablet" | "mobile";

export type CursorVariant = "default" | "link" | "drag" | "hidden";

export interface SceneContext {
  tier: Tier;
  reduced: boolean;
}
