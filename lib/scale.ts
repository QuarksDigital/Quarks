/** Scroll progress → 10^N exponent for the persistent scale readout (Bible §0.4). */
import { SCALE_MAP, type SceneId } from "@/constants/scenes";
import { clamp, lerp } from "@/utils/math";

export interface SceneRange {
  scene: SceneId;
  start: number;
  end: number;
}

/** Built at runtime once ScrollTriggers exist; falls back to even spread. */
let ranges: SceneRange[] = [];

export function setSceneRanges(r: SceneRange[]): void {
  ranges = r.slice().sort((a, b) => a.start - b.start);
}

export function exponentAt(docProgress: number): number {
  if (ranges.length === 0) {
    return Math.round(lerp(-18, 26, clamp(docProgress, 0, 1)));
  }
  for (const seg of ranges) {
    if (docProgress >= seg.start && docProgress <= seg.end) {
      const local = (docProgress - seg.start) / Math.max(seg.end - seg.start, 1e-6);
      const m = SCALE_MAP.find((s) => s.scene === seg.scene);
      if (!m) break;
      return Math.round(lerp(m.from, m.to, clamp(local, 0, 1)));
    }
  }
  const last = SCALE_MAP[SCALE_MAP.length - 1];
  return docProgress > 0.5 ? last.to : SCALE_MAP[0].from;
}
