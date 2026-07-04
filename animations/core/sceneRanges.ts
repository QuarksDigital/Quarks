/** Scenes report their document ranges here so the scale readout maps correctly. */
import type ScrollTriggerType from "gsap/ScrollTrigger";
import { setSceneRanges, type SceneRange } from "@/lib/scale";
import type { SceneId } from "@/constants/scenes";

const collected = new Map<SceneId, SceneRange>();

export function reportSceneRange(scene: SceneId, st: ScrollTriggerType): void {
  const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  collected.set(scene, { scene, start: st.start / max, end: st.end / max });
  setSceneRanges(Array.from(collected.values()));
}
