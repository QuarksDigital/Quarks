/**
 * QUARKS - /services copy + floating-card geometry.
 *
 * The design groups ten services under four pillars. On this route the pillar
 * tabs filter the cloud, so at most four cards orbit the atom at once - dense
 * enough to feel like a shell, sparse enough to stay readable.
 */

export interface ServiceDef {
  n: string;
  name: string;
  /** engagement cadence, e.g. "3-8 weeks" */
  time: string;
  line: string;
  tags: readonly [string, string, string];
  /** two-letter particle glyph stamped in the card corner */
  glyph: string;
}

export interface PillarDef {
  key: string;
  blurb: string;
  count: string;
  items: readonly ServiceDef[];
}

export const PILLARS: readonly PillarDef[] = [
  {
    key: "Build",
    blurb: "The product itself - designed, coded and shipped by the same team.",
    count: "05 SERVICES",
    items: [
      {
        n: "01",
        name: "UI/UX design",
        time: "2-4 weeks",
        line: "Research, wireframes and a design system your developers can actually build from - not a picture that falls apart in code.",
        tags: ["Audit", "Figma system", "Prototype"],
        glyph: "Ux",
      },
      {
        n: "02",
        name: "Web development",
        time: "3-8 weeks",
        line: "Next.js sites that load in under a second, rank out of the box, and can be edited by someone who has never seen a terminal.",
        tags: ["Next.js", "CMS", "Core Web Vitals"],
        glyph: "We",
      },
      {
        n: "03",
        name: "App development",
        time: "8-16 weeks",
        line: "Cross-platform iOS and Android apps, from the first screen to the store listing and the crash dashboard after launch.",
        tags: ["React Native", "API", "Store release"],
        glyph: "Ap",
      },
      {
        n: "04",
        name: "3D & interactive",
        time: "2-6 weeks",
        line: "WebGL scenes, scroll-driven film and product configurators - the reason people stay on the page instead of bouncing.",
        tags: ["Three.js", "GSAP", "Scroll film"],
        glyph: "3d",
      },
    ],
  },
  {
    key: "Grow",
    blurb: "Being found, and turning that attention into revenue.",
    count: "03 SERVICES",
    items: [
      {
        n: "01",
        name: "SEO",
        time: "90-day cycles",
        line: "Technical repairs, content architecture and digital PR aimed at the top three results - reported as traffic and revenue, not vanity keywords.",
        tags: ["Technical audit", "Content", "Digital PR"],
        glyph: "Se",
      },
      {
        n: "02",
        name: "ASO",
        time: "Monthly",
        line: "Store listings, creative sets and keyword coverage tuned until an install costs less than it did last month.",
        tags: ["Keywords", "Creative", "A/B tests"],
        glyph: "As",
      },
      {
        n: "03",
        name: "Performance & CRO",
        time: "4-week sprint",
        line: "We find the exact steps where money leaks out of your funnel, then close them one experiment at a time.",
        tags: ["Speed budget", "Funnel teardown", "Experiments"],
        glyph: "Cr",
      },
    ],
  },
  {
    key: "Automate",
    blurb: "The repetitive work behind the work, handed over to software.",
    count: "01 SERVICE",
    items: [
      {
        n: "01",
        name: "Business automation",
        time: "2-6 weeks",
        line: "The spreadsheet work your team repeats every week, handed to software: lead routing, CRM sync, invoicing, reporting, AI agents for the boring parts.",
        tags: ["Workflow map", "Integrations", "AI agents"],
        glyph: "Au",
      },
    ],
  },
  {
    key: "Amplify",
    blurb: "Attention, on repeat - channels run by people, not schedulers.",
    count: "02 SERVICES",
    items: [
      {
        n: "01",
        name: "Social media marketing",
        time: "Monthly retainer",
        line: "Channel strategy plus daily execution and community management - a team that posts, replies and reads the analytics.",
        tags: ["Strategy", "Community", "Paid"],
        glyph: "So",
      },
      {
        n: "02",
        name: "Content production",
        time: "Per production",
        line: "Photo, video and 3D shot in one production block, cut into a quarter of feed-ready assets you own outright.",
        tags: ["Direction", "Edit", "Asset library"],
        glyph: "Co",
      },
    ],
  },
] as const;

export interface Slot {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
}

/**
 * Cloud arrangements keyed by how many cards the active pillar holds, so a
 * one-service pillar centres rather than sitting lopsided in a four-up rig.
 * x/y are viewport-relative percentages from centre; z is px depth.
 */
/**
 * Arrangements are an arc, not a grid. The heading occupies the centre-top of
 * the stage, so cards that sit near the centre line have to hang below it
 * while the outer cards ride up beside it - that's what keeps the cloud clear
 * of the type at every count.
 *
 * y is a percentage of the *band* between the header and the footer rail
 * (see ServiceCards.layout), not of the viewport, so these stay honest when
 * the chrome changes height.
 */
/**
 * Pillars holding exactly one service, in document order.
 *
 * A lone card parked dead centre sits squarely on top of the atom and hides
 * it, so solo cards are pushed off to one side instead - alternating down
 * this list, so two solo pillars in a row don't both land on the left.
 */
const SOLO_PILLARS: readonly number[] = PILLARS.reduce<number[]>((acc, p, i) => {
  if (p.items.length === 1) acc.push(i);
  return acc;
}, []);

/** -1 for the left of the atom, +1 for the right. */
export const soloSide = (pillar: number): -1 | 1 => {
  const ordinal = SOLO_PILLARS.indexOf(pillar);
  return ordinal > 0 && ordinal % 2 === 1 ? 1 : -1;
};

/** A lone card, set beside the atom rather than over it. */
const soloSlot = (side: -1 | 1): Slot => ({
  x: side * 27,
  y: 2,
  z: -10,
  rx: 0,
  // Turned inward, the same way the two-card pair faces the centre line.
  ry: -side * 20,
  rz: side * 3,
});

const LAYOUTS: Record<number, readonly Slot[]> = {
  // Overridden by soloSlot when a pillar index is known; kept as a fallback.
  1: [{ x: 0, y: 6, z: 40, rx: 0, ry: 0, rz: 0 }],
  2: [
    { x: -27, y: 0, z: -20, rx: 0, ry: 20, rz: -3 },
    { x: 27, y: 0, z: -20, rx: 0, ry: -20, rz: 3 },
  ],
  3: [
    { x: -33, y: -10, z: -70, rx: -4, ry: 24, rz: -4 },
    { x: 0, y: 16, z: 30, rx: 3, ry: 0, rz: 0 },
    { x: 33, y: -10, z: -70, rx: -4, ry: -24, rz: 4 },
  ],
  4: [
    { x: -38, y: -12, z: -150, rx: -5, ry: 27, rz: -4 },
    { x: 38, y: -12, z: -150, rx: -5, ry: -27, rz: 4 },
    { x: -14, y: 20, z: 10, rx: 6, ry: 11, rz: -3 },
    { x: 14, y: 20, z: 10, rx: 6, ry: -11, rz: 3 },
  ],
};

/**
 * Phones can't hold a spread cloud: a card is nearly the full width, so any
 * horizontal fan just overlaps into mush. There the cards become a fanned
 * deck instead - stacked on the centre line, each one stepped back and
 * rotated slightly, so it still reads as floating depth. Tapping any card
 * still pulls it to the front, which is the whole interaction anyway.
 *
 * Values are per-index rather than per-count, so a deck of one and a deck of
 * four are built from the same rule.
 */
/** Vertical step between fanned cards, as a percentage of the card band. */
export const DECK_PEEK = 13;

const deckSlot = (index: number, count: number): Slot => {
  /*
   * A fanned hand, dealt upward. Card 0 sits square and fully readable at the
   * bottom of the band; every card behind it is stepped *up* by one peek so
   * its own top strip - index and title - clears the card in front. On mobile
   * the face reorders to put the title first (see globals.css), so a peek of
   * roughly 13% of the band is enough to read every heading at once.
   *
   * Stacking them almost on top of each other, which is what a literal deck
   * does, left a single legible card covering three invisible ones.
   *
   * x and y are percentages (of stage width and of the card band), same as
   * every other slot - not pixels.
   */
  const spread = count > 1 ? 1 : 0;
  return {
    x: index * 1.6 * spread,
    y: -index * DECK_PEEK * spread,
    z: -index * 60,
    rx: 0,
    ry: 0,
    // Alternating tilt so the stack reads as separate cards, not one thick slab.
    rz: index * 2.2 * (index % 2 ? 1 : -1) * spread,
  };
};


/**
 * How visible a card is at a given depth in the fan. The front card is fully
 * opaque and the ones behind step down gently - far enough to read as depth,
 * but nowhere near the old ghosting, which made the headings we now
 * deliberately expose too faint to read.
 */
export const deckAlpha = (index: number): number =>
  index === 0 ? 1 : Math.max(0.55, 0.88 - (index - 1) * 0.11);

export const slotFor = (
  count: number,
  index: number,
  deck = false,
  pillar?: number,
): Slot => {
  if (deck) return deckSlot(index, count);
  // A solo card only knows which side to take once it knows which pillar it is.
  if (count === 1 && pillar !== undefined) return soloSlot(soloSide(pillar));
  const layout = LAYOUTS[count] ?? LAYOUTS[4];
  return layout[index % layout.length];
};

/**
 * Width at or below which the cloud becomes a deck.
 *
 * Set at desktop, not phone. Four spread cards need roughly 1000px of width
 * *and* ~700px of vertical band to sit apart; below that the arc either
 * overlaps horizontally or, if stacked into two rows, overlaps vertically -
 * the band simply isn't tall enough for two card heights. Rather than shrink
 * the type into illegibility, everything under this width uses the deck,
 * which stays readable at any size.
 */
export const DECK_BELOW = 1200;

export const SERVICES_COPY = {
  index: "05 - Services",
  heading: "Our Expertise.",
  sub: "Pick one or take the full stack. Every engagement has a named lead, a fixed scope and a date.",
  hint: "DRAG TO ORBIT · CLICK A CARD",
  close: "RELEASE",
  backToHome: "BACK TO THE VOID",
  stepsIndex: "How an engagement runs",
} as const;

export const STEPS = [
  {
    n: "01",
    name: "Observe",
    line: "Two weeks inside your market, your analytics and your customers' language.",
  },
  {
    n: "02",
    name: "Define",
    line: "Scope, budget and success metric agreed in writing before anyone designs.",
  },
  {
    n: "03",
    name: "Build",
    line: "Weekly demos on a live URL. You watch it come together, not a slide about it.",
  },
  {
    n: "04",
    name: "Launch",
    line: "Ship, plus the campaign that makes launch day louder than a press release.",
  },
  {
    n: "05",
    name: "Compound",
    line: "Monthly cycles of measurement and optimisation. Results get bigger, not staler.",
  },
] as const;

/** Overscroll gate at the foot of the home document. */
export const GATE = {
  prompt: "KEEP SCROLLING",
  charging: "BINDING",
  release: "SERVICES",
} as const;

/** Atom module tuning. Deliberately dim so card copy stays legible over it. */
export const ATOM = {
  nucleons: 16,
  nucleusRadius: 0.62,
  shells: [
    { a: 2.35, e: 0.72, tiltX: 1.15, tiltZ: 0.32, electrons: 2, speed: 0.95 },
    { a: 3.15, e: 0.78, tiltX: -0.55, tiltZ: -0.85, electrons: 3, speed: 0.68 },
    { a: 3.9, e: 0.66, tiltX: 0.42, tiltZ: 1.32, electrons: 2, speed: 0.52 },
  ],
  trailLength: 18,
  dragDamping: 0.92,
  autoSpin: 0.085,
  /** Global dimmer applied to every emissive/additive element in the module. */
  opacity: 0.42,
} as const;
