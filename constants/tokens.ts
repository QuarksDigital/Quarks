/** QUARKS - design tokens (mirror of app/globals.css @theme). */

export const COLORS = {
  /** dark route background */
  void: "#050609",
  /** light route background (also the ink colour on dark) */
  bone: "#F1F0EC",
  /** ink on light routes */
  ink: "#0B0C0F",

  /** raised dark surfaces */
  panel: "#0C0E13",
  panelDeep: "#0A0C11",
  panelVoid: "#07080C",
  /** raised light surface (service cards) */
  card: "#E9E8E4",

  accent: "#3ADBFF",
  accentDeep: "#0E8FBF",
  accentInk: "#0B7EA0",
  accentPale: "#9FF1FF",

  /** greys reading on dark */
  mist: "#C4C9D2",
  fog: "#B6BCC7",
  dust: "#9BA2B0",
  slate: "#8A8F9C",
  shadow: "#7E8593",

  /** greys reading on light */
  graphite: "#3D4149",
  steel: "#4A4E57",
  stone: "#5A5E67",
  ash: "#6B6F78",
} as const;

export const Z = {
  webgl: 0,
  scene: 10,
  rail: 90,
  nav: 100,
  cursor: 150,
  preloader: 200,
} as const;

export const BREAKPOINTS = {
  desktop: "(min-width: 1024px)",
  tablet: "(min-width: 640px) and (max-width: 1023.98px)",
  mobile: "(max-width: 639.98px)",
  reduced: "(prefers-reduced-motion: reduce)",
} as const;

export const MEDIA = {
  heroVideo1080: "/hero/genesis-1080.mp4",
  heroVideo720: "/hero/genesis-720.mp4",
  heroPoster: "/hero/genesis-poster.jpg",
  logo: "/logo.png",
  cases: {
    mosaram: "/media/cases/mosaram.webp",
    kute: "/media/cases/kute.webp",
    kcpl: "/media/cases/kcpl.webp",
    shreegautamsteel: "/media/cases/shreegautamsteel.png"
  },
  founders: {
    saksham: "/founders/saksham.webp",
    vinayak: "/founders/vinayak.webp",
    trisha: "/founders/trisha.webp",
    shuvam: "/founders/shuvam.webp",
    reyansh: "/founders/reyansh.png",
  },
} as const;

/** Route sections drive the nav pill, the rail and the light/dark theme flip. */
export type RouteTheme = "dark" | "light";
export interface RouteDef {
  path: string;
  label: string;
  theme: RouteTheme;
}

export const ROUTES: readonly RouteDef[] = [
  { path: "/", label: "Home", theme: "dark" },
  { path: "/work", label: "Work", theme: "dark" },
  { path: "/about", label: "About", theme: "light" },
  { path: "/contact", label: "Contact", theme: "dark" },
] as const;
