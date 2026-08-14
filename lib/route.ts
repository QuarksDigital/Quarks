/**
 * QUARKS - the pseudo-router.
 *
 * The home page is one document that behaves like five routes. Each section
 * declares `data-route` / `data-theme`; a ScrollTrigger per section reports
 * which one owns the viewport, and everything chrome-side (nav pill, rail,
 * readout, body theme, address bar) subscribes here.
 *
 * A tiny observable store - no state library, same shape as the old orb
 * controller it replaces.
 */
import type { RouteTheme } from "@/constants/tokens";

export interface RouteState {
  route: string;
  theme: RouteTheme;
}

type Listener = (s: RouteState) => void;

const state: RouteState = { route: "/", theme: "dark" };
const listeners = new Set<Listener>();

export const routeStore = {
  get: (): RouteState => state,
  set(route: string, theme: RouteTheme): void {
    if (state.route === route && state.theme === theme) return;
    state.route = route;
    state.theme = theme;
    listeners.forEach((l) => l(state));
  },
  subscribe(l: Listener): () => void {
    listeners.add(l);
    l(state);
    return () => listeners.delete(l);
  },
};
