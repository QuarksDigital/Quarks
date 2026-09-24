/** QUARKS - all copy. No strings inside components. */
import { MEDIA } from "@/constants/tokens";

export const SITE = {
  name: "QUARKS",
  tagline: "Digital Marketing, SEO & Web Development",
  subline: "A DIGITAL MARKETING AGENCY",
  description:
  "Quarks Digital helps businesses grow through SEO, social media marketing, web and app development, brand strategy, and business automation.",
  emailNew: "quarksdigitalmarketing@gmail.com",
  emailElse: "quarks.questions@gmail.com",
  city: "Bhubaneswar, Odisha",
  coordinates: "20.296059° N · 85.824539° E",
  readout: "quarks",
  instagram: "https://www.instagram.com/quarksdigital",
  linkedin: "https://www.linkedin.com/company/quarksdigital/",
} as const;

export const PRELOADER = {
  status: "Assembling matter",
} as const;

export const AUDIO = {
  track: "/sounds/background.mp3",
  /** Quiet enough to sit under the experience rather than compete with it. */
  volume: 0.3,
  labelOn: "Mute background audio",
  labelOff: "Play background audio",
} as const;

export const NAV = {
  cta: "Start a project",
  /** narrow viewports, where the full label would crowd the pill */
  ctaShort: "Start",
  /*
   * Services sits last because it genuinely is last: it lives past the
   * threshold gate at the foot of the document, so listing it second put the
   * furthest destination in the nearest slot.
   */
  links: [
    { label: "Home", route: "/" },
    { label: "Work", route: "/work" },
    { label: "About", route: "/about" },
    { label: "Contact", route: "/contact" },
    { label: "Services", route: "/services" },
  ],
} as const;

export const HERO = {
  eyebrow: "Digital product & growth studio",
  lines: ["From invisible", "to inevitable."] as const,
  sub: "We create experiences like no other.",
  ctaPrimary: "Start a project",
  ctaSecondary: "See the work",
  hint: "SCROLL",
} as const;

export const INTRO = {
  index: "01 - What we do for you.",
  heading:
    "Most agencies stop at the deliverable. We at quarks ship the product and the system that grows it.",
  body: "One team designs the interface, writes the code, tunes the search rankings, automates the back office and runs the channels. No handoffs between four vendors. No one to blame but us.",
  facts: [
    {
      label: "ONE TEAM",
      line: "Strategy, design, engineering and growth sit in the same room and ship on the same board.",
    },
    {
      label: "ONE TIMELINE",
      line: "Design starts and marketing starts together, so launch day has an audience already waiting.",
    },
    {
      label: "ONE ACCOUNTABILITY",
      line: "You talk to the people doing the work, not an account manager.",
    },
  ],
} as const;

export interface CaseDef {
  index: string;
  name: string;
  sector: string;
  year: string;
  image: string;
  /**
   * Live site. Optional on purpose: when a project has no public URL - still
   * under NDA, shipped to an app store, or simply not launched - the opened
   * card renders no button at all rather than a dead link to "#".
   */
  url?: string;
  deliver: string;
  /** One short line shown on the card face, before it is opened. */
  blurb: string;
  /** One paragraph shown when the card is opened. */
  summary: string;
  /** Everything the studio actually did, as chips. */
  scope: readonly string[];
  /** Headline outcomes, shown as a small figure grid on the open card. */
  results: readonly { value: string; label: string }[];
}

export const WORK = {
  index: "02 - Selected work",
  heading: "Our Products.",
  sub: "Tailored to your needs.",
  dragLabel: "DRAG",
  scrollLabel: "SCROLL",
  visit: "Visit live ↗",
  claim: "Claim the slot ↗",
  openHint: "CLICK A CARD",
  closeHint: "SCROLL TO CLOSE",
  openSlot: {
    tag: "SLOT 004 - OPEN",
    heading: "Your product could sit here next.",
    meta: "Open slot · 2026",
    deliver: "Your product, built end to end",
  },
} as const;

/*
 * Copy below the headline figures is placeholder - swap it for the real
 * story per project. Leave `url` off entirely until a project is public;
 * that is what suppresses the "Visit live" button on the opened card.
 */
export const CASES: readonly CaseDef[] = [
  {
    index: "CASE 001",
    name: "MOSARAM",
    sector: "Automobile",
    year: "2026",
    image: MEDIA.cases.mosaram,
    deliver: "Brand film · Website · Launch campaign",
    blurb: "A cinematic launch for an automobile brand — film, configurator and campaign shipped as one.",
    summary:
      "A launch built backwards from the showroom floor. We shot the film, built the configurator around it, and ran the campaign that put both in front of buyers in the first week.",
    scope: ["Brand film", "Web build", "Configurator", "Launch campaign"],
    results: [
      { value: "+60%", label: "Organic visits" },
      { value: "1.5K", label: "Launch views" },
      { value: "+20%", label: "Increase in sales" },
    ],
  },
  {
    index: "CASE 002",
    name: "KUTE",
    sector: "Dating app · FlaminCo",
    year: "2025",
    image: MEDIA.cases.kute,
    deliver: "Product design · App build · ASO",
    blurb: "A dating app engineered to turn matches into real conversations.",
    summary:
      "A dating product designed around one question: does a match turn into a conversation? Every screen, and the store listing that feeds it, is tuned to that single number.",
    scope: ["Product design", "React Native", "ASO", "Store creative"],
    results: [
      { value: "1K", label: "Installs / 90 days" },
      { value: "4.3★", label: "Store rating" },
      { value: "+70%", label: "Faster" },
    ],
  },
  {
    index: "CASE 003",
    name: "KCPL",
    sector: "Laptop retail & distribution",
    year: "2026",
    image: MEDIA.cases.kcpl,
    deliver: "E-commerce · Catalogue · Storefront",
    blurb: "An online store for a laptop seller — a searchable catalogue and a checkout that converts.",
    summary:
      "A storefront built around how people actually buy a laptop: filter by spec, compare side by side, and check out fast — with stock and pricing kept in sync across the whole catalogue.",
    scope: ["E-commerce", "Catalogue", "Search & filter", "Retention"],
    results: [
      { value: "+50%", label: "Organic visits" },
      { value: "<1s", label: "Catalogue load" },
      { value: "+35%", label: "Returning buyers" },
    ],
  },
  {
    index: "CASE 004",
    name: "SHREE GAUTAM STEEL",
    sector: "Steel utensils manufacturer",
    year: "2026",
    image: MEDIA.cases.shreegautamsteel,
    deliver: "E-commerce · Catalogue · Storefront",
    blurb: "An online storefront for a steel-utensils manufacturer.",
    summary:
      "A catalogue-first storefront for a steel-utensils manufacturer: a clean product grid, wholesale and retail pricing, and a checkout that holds up as the range grows.",
    scope: ["E-commerce", "Catalogue", "Storefront", "Retention"],
    results: [
      { value: "3x", label: "Drop sell-through" },
      { value: "<1s", label: "Checkout load" },
      { value: "+45%", label: "Returning buyers" },
    ],
  },
] as const;

export interface FounderDef {
  id: string;
  name: string;
  role: string;
  /** Lines shown under the name; the final line is a signed quote. */
  details: readonly string[];
  photoFull: string;
  /** object-position for the portrait crop; defaults to a centred head. */
  objectPos?: string;
}

export const ABOUT = {
  index: "03 - The studio",
  heading: "Our Team.",
  body: "Quarks started because good products kept losing to worse products with better distribution. We fixed that by refusing to separate the two: the people who design your interface also own how it gets found.",
  stats: [
    { value: 10, suffix: "+", label: "Products shipped" },
    { value: 10000, suffix: "+", label: "Lives impacted" },
    { value: 70, suffix: "%+", label: "Performance improved" },
  ],
} as const;

export const FOUNDERS: readonly FounderDef[] = [
  {
    id: "saksham",
    name: "SAKSHAM",
    role: "CO-FOUNDER · CHIEF TECHNOLOGY OFFICER",
    details: [
      "Development & Implementation.",
      "Obsessed with the physics of attention.",
      '"Believe in yourself and the world shall too." ~Saksham Sinha',
    ],
    photoFull: MEDIA.founders.saksham,
    objectPos: "18% 30%",
  },
  {
    id: "founder-2",
    name: "VINAYAK",
    role: "CO-FOUNDER · GROWTH EXPERT",
    details: [
      "Market research and growth strategy.",
      "Love for data-driven marketing and analytics.",
      '"The beauty of numbers lie in their ability to tell stories." ~Vinayak Mittal',
    ],
    photoFull: MEDIA.founders.vinayak,
    objectPos: "8% 30%",
  },
  {
    id: "founder-3",
    name: "TRISHA",
    role: "CO-FOUNDER · CREATIVE HEAD",
    details: [
      "Creative direction and brand strategy.",
      "Love for storytelling and visual communication.",
      '"It is not the eye that sees the beauty but the heart that feels it." ~Trisha Jain',
    ],
    photoFull: MEDIA.founders.trisha,
    objectPos: "22% 28%",
  },
  {
    id: "founder-4",
    name: "SHUVAM",
    role: "CO-FOUNDER · PRODUCT HEAD",
    details: [
      "Product design and feature development.",
      "Love for creating user-centric products and experiences.",
      '"The best way to predict the future is to create it." ~Shuvam Kumar Sahu',
    ],
    photoFull: MEDIA.founders.shuvam,
    objectPos: "10% 40%",
  },
  {
    id: "reyansh",
    name: "REYANSH",
    role: "CO-FOUNDER · CHIEF FINANCIAL OFFICER",
    details: [
      "Financial planning, budgeting, and business strategy.",
      "Passionate about turning numbers into sustainable growth.",
      '"Great business is built not just by earning more, but by managing wisely." ~Reyansh Singh',
    ],
    photoFull: MEDIA.founders.reyansh,
    objectPos: "25% 28%",
  },
] as const;

export const CONTACT = {
  index: "04 - Start something",
  heading: "Tell us what you're building.",
  body: "Send a paragraph about the product, the deadline and the budget range. You'll get a reply from a founder within one working day - not a form auto-response.",
  secondaryCta: "Just a question",
  marquee: "FROM INVISIBLE TO INEVITABLE -",
  backToTop: "Back to top ↑",
  copyright: "© 2026 Quarks. All matter reserved.",
  columns: [
    { label: "Studio", lines: [SITE.city, SITE.coordinates] },
    { label: "Availability", lines: ["Taking eight new builds for Q4 2026. Retainers open now."] },
  ],
  follow: {
    label: "Follow",
    links: [
      { label: "Instagram ↗", href: SITE.instagram },
      { label: "LinkedIn ↗", href: SITE.linkedin },
    ],
  },
} as const;
