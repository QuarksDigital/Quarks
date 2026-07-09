/** QUARKS - design tokens (mirror of app/globals.css @theme). */
export const COLORS = {
  void: "#04040a",
  obsidian900: "#07070f",
  obsidian800: "#0b0c16",
  obsidian700: "#12141f",
  starlight: "#f2f5fa",
  dust: "#7c8598",
  cherenkov300: "#9ff1ff",
  cherenkov500: "#38dbff",
  cherenkov700: "#0e8fbf",
  whitehot: "#e8fcff",
} as const;

export const Z = {
  webgl: 0,
  scene: 10,
  hud: 40,
  nav: 50,
  cursor: 60,
  grain: 70,
  preloader: 80,
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
  cosmos: "/media/cosmos.png",
  obsidian: "/media/obsidian.png",
  cases: {
    helios: "/media/cases/helios.png",
    kute: "/media/cases/kute.png",
    atlas: "/media/cases/atlas.png",
  },
} as const;
