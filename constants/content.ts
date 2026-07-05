/** QUARKS — all copy. No strings inside components. */

export const SITE = {
  name: "QUARKS",
  tagline: "From invisible to inevitable.",
  subline: "A DIGITAL MARKETING AGENCY",
  description:
    "Quarks is a digital marketing agency that engineers attention at the fundamental level. One continuous journey from a single particle to an infinite digital universe.",
  emailNew: "quarksdigitalmarketing@gmail.com",
  emailElse: "quarks.questions@gmail.com",
  coordinates: "51.5074° N · 0.1278° W",
} as const;

export const HERO = {
  scrollHint: "SCROLL TO EXPLORE",
  hudBoot: "INITIALIZING",
  hudLabel: "S1 · THE VOID",
} as const;

export const MANIFESTO = {
  hudLabel: "S2 · THE DIMENSION",
  lines: [
    "Everything that matters",
    "is made of things",
    "you can't see.",
  ],
  particles: "ATTENTION · INSIGHT · IDEAS — THE PARTICLES OF CULTURE.",
} as const;

export interface ForceDef {
  id: string;
  index: string;
  name: string;
  service: string;
  line: string;
  tags: [string, string, string];
  symbol: "experience" | "seo" | "performance" | "presence";
}

export const FORCES: readonly ForceDef[] = [
  {
    id: "experience",
    index: "FORCE 01 / 04",
    name: "EXPERIENCE",
    service: "Design & Development",
    line: "We dont create websites, we create digital experiences like no other.",
    tags: ["Design Language", "3D", "Interactive"],
    symbol: "experience",
  },
  {
    id: "seo",
    index: "FORCE 02 / 04",
    name: "SEO",
    service: "Reach & Growth",
    line: "Attraction, engineered.",
    tags: ["Search", "Real-time", "CRO"],
    symbol: "seo",
  },
  {
    id: "performance",
    index: "FORCE 03 / 04",
    name: "PERFORMANCE",
    service: "Strategy & Transformation",
    line: "The force that changes one thing into another.",
    tags: ["Brand strategy", "Rebrands", "Go-to-market"],
    symbol: "performance",
  },
  {
    id: "presence",
    index: "FORCE 04 / 04",
    name: "PRESENCE",
    service: "Content & Social",
    line: "Amass attention, build communities, and grow your audience.",
    tags: ["Content engines", "Social", "Community"],
    symbol: "presence",
  },
] as const;

export const FORCES_HUD = "S3 · THE FORCES";

export interface CollisionDef {
  id: string;
  index: string;
  product: string;
  client: string;
  sector: string;
  year: string;
  image: string;
  metrics: { value: number; prefix?: string; suffix: string; label: string }[];
}

export const COLLISIONS: readonly CollisionDef[] = [
  {
    id: "helios",
    index: "COLLISION 001",
    product: "HELIOS",
    client: "HELIOS",
    sector: "Consumer EV",
    year: "2025",
    image: "/media/cases/helios.png",
    metrics: [
      { value: 412, prefix: "+", suffix: "%", label: "Organic reach" },
      { value: 2.4, suffix: "M", label: "Launch views" },
      { value: 38, suffix: "%", label: "CAC reduction" },
    ],
  },
  {
    id: "kute",
    index: "COLLISION 002",
    product: "KUTE",
    client: "FlaminCo",
    sector: "Dating",
    year: "2025",
    image: "/media/cases/kute.png",
    metrics: [
      { value: 1, suffix: "M", label: "Installs / 90 days" },
      { value: 4.8, suffix: "★", label: "Store rating" },
      { value: 9, prefix: "+", suffix: "pt", label: "Brand recall" },
    ],
  },
  {
    id: "atlas",
    index: "COLLISION 003",
    product: "ATLAS",
    client: "ATLAS",
    sector: "Streetwear",
    year: "2026",
    image: "/media/cases/atlas.png",
    metrics: [
      { value: 18, suffix: "min", label: "Sellout time" },
      { value: 320, suffix: "K", label: "Waitlist" },
      { value: 7, suffix: "", label: "Countries" },
    ],
  },
] as const;

export const COLLISIONS_HUD = "S4 · COLLISIONS";

export const SCALE_STEPS = [
  { index: "01", name: "OBSERVE", line: "Research & Insight - Market analysis." },
  { index: "02", name: "BIND", line: "Strategy - that holds ideas together." },
  { index: "03", name: "COLLIDE", line: "Creativity - where new ideas are made." },
  { index: "04", name: "ACCELERATE", line: "Launch & Promote - exposure beyond measure." },
  { index: "05", name: "ORBIT", line: "Optimize & Retain - audiences that never leave." },
] as const;

export const SCALE_HUD = "S5 · THE SCALE";

export const PROOF = {
  hudLabel: "S6 · PROOF",
  stats: [
    { value: 10, suffix: "+", label: "PRODUCTS" },
    { value: 10000, suffix: "+", label: "LIVES IMPACTED" },
    { value: 9, suffix: "", label: "COUNTRIES" },
  ],
} as const;

export const CONTACT = {
  hudLabel: "S7 · GRAVITY WELL",
  headline: "Let's Connect.",
  cta: "LET'S CONNECT",
  rows: [
    { label: "QUARKS", value: "quarksdigitalmarketing@gmail.com" },
    { label: "QUESTIONS", value: "quarks.questions@gmail.com" },
  ],
  socials: ["Instagram", "LinkedIn", "X"],
  backToTop: "SCROLL UP",
  legal: "© 2026 QUARKS. All matter reserved.",
} as const;

export const NAV = {
  links: [
    { label: "Excellence", target: "#forces" },
    { label: "Works", target: "#collisions" },
    { label: "Process", target: "#scale" },
  ],
  cta: "LET'S CONNECT",
} as const;
