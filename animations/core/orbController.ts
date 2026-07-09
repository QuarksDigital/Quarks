/**
 * The protagonist's state machine (Animation Bible §0.2).
 * A tiny observable store - no external state library needed.
 */
import type { OrbState } from "@/types";

type Listener = (s: OrbState) => void;

const state: OrbState = {
  mode: "hidden",
  x: 0.5,
  y: 0.46,
  energy: 0,
  scene: "preloader",
};

const listeners = new Set<Listener>();

export const orb = {
  get: (): OrbState => state,
  set(partial: Partial<OrbState>): void {
    Object.assign(state, partial);
    listeners.forEach((l) => l(state));
  },
  subscribe(l: Listener): () => void {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
