/** QUARKS - all copy. No strings inside components. */
import { MEDIA } from "@/constants/tokens";

export const SITE = {
  name: "QUARKS",
  tagline: "From Invisible to Inevitable.",
  subline: "A DIGITAL MARKETING AGENCY",
  description:
    "Quarks is a digital product and growth studio. We design and build websites, apps and 3D experiences, then run the SEO, ASO, automation and social that make them impossible to ignore.",
  emailNew: "quarksdigitalmarketing@gmail.com",
  emailElse: "quarks.questions@gmail.com",
  city: "Bhubaneswar, Odisha",
  coordinates: "20.296059° N · 85.824539° E",
  readout: "quarks.studio",
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
    "Most agencies stop at the deliverable. We ship the product and the system that grows it.",
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
      line: "A founder is on every project. You talk to the people doing the work, not an account manager.",
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
  sub: "Drag or scroll sideways. Every card is one client, one scope, one live URL.",
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
    sector: "Streetwear",
    year: "2026",
    image: MEDIA.cases.kcpl,
    deliver: "E-commerce · Drop mechanics · Social",
    summary:
      "Drop mechanics that treat scarcity as a feature rather than an accident: a queue that holds, a checkout that survives the spike, and a feed that keeps the next drop warm.",
    scope: ["E-commerce", "Drop mechanics", "Social", "Retention"],
    results: [
      { value: "3x", label: "Drop sell-through" },
      { value: "<1s", label: "Checkout load" },
      { value: "+45%", label: "Returning buyers" },
    ],
  },
  {
    index: "CASE 004",
    name: "SHREE GAUTAM STEEL",
    sector: "Steel utensils manafacturer",
    year: "2026",
    image: MEDIA.cases.shreegautamsteel,
    deliver: "E-commerce · Drop mechanics · Social",
    summary:
      "Drop mechanics that treat scarcity as a feature rather than an accident: a queue that holds, a checkout that survives the spike, and a feed that keeps the next drop warm.",
    scope: ["E-commerce", "Drop mechanics", "Social", "Retention"],
    results: [
      { value: "3x", label: "Drop sell-through" },
      { value: "<1s", label: "Checkout load" },
      { value: "+45%", label: "Returning buyers" },
    ],
  },
] as const;

export interface FounderDef {
  index: string;
  name: string;
  role: string;
  photo: string;
  position: string;
  bio: string;
  detail: string;
  quote: string;
}

export const ABOUT = {
  index: "03 - The studio",
  heading: "Our Team.",
  body: "Quarks started in Bhubaneswar in 2026 because good products kept losing to worse products with better distribution. We fixed that by refusing to separate the two: the people who design your interface also own how it gets found.",
  stats: [
    { value: 10, suffix: "+", label: "Products shipped" },
    { value: 10000, suffix: "+", label: "Lives impacted" },
    { value: 70, suffix: "%+", label: "Performance improved" },
  ],
} as const;

export const FOUNDERS: readonly FounderDef[] = [
  {
    index: "FOUNDER 01",
    name: "SAKSHAM",
    role: "Co-founder · CTO",
    photo: MEDIA.founders.saksham,
    position: "30% 30%",
    bio: "Writes the code that ships. Saksham turns a design file into a product that loads in under a second and holds up under real traffic.",
    detail:
      "Next.js, React Native and WebGL are his daily tools; performance budgets and Core Web Vitals are his obsession.",
    quote: "“If it isn't fast, it isn't finished.”",
  },
  {
    index: "FOUNDER 02",
    name: "VINAYAK",
    role: "Co-founder · Growth",
    photo: MEDIA.founders.vinayak,
    position: "30% 30%",
    bio: "Market research and growth strategy. Vinayak decides where the money goes and proves what it brought back.",
    detail:
      "He builds the SEO, ASO and paid roadmaps, then reports them as pipeline instead of impressions.",
    quote: "“Numbers only matter when they tell a story.”",
  },
  {
    index: "FOUNDER 03",
    name: "TRISHA",
    role: "Co-founder · Creative",
    photo: MEDIA.founders.trisha,
    position: "30% 28%",
    bio: "Creative direction and brand strategy. Trisha finds the sentence a company can own, then makes everything look like it.",
    detail:
      "Campaign concepts, art direction and the content engine that keeps the channels fed after launch.",
    quote: "“A brand is a promise people can repeat.”",
  },
  {
    index: "FOUNDER 04",
    name: "SHUVAM",
    role: "Co-founder · Product",
    photo: MEDIA.founders.shuvam,
    position: "12% 34%",
    bio: "Product design and feature scoping. Shuvam keeps every build pointed at a user who actually exists.",
    detail:
      "Research, flows and the interface system - plus the discipline to cut features that don't earn their place.",
    quote: "“Scope is a design decision.”",
  },
  {
    index: "FOUNDER 05",
    name: "REYANSH",
    role: "Co-founder",
    photo: MEDIA.founders.reyansh,
    position: "50% 30%",
    bio: "Reyansh rounds out the founding team, working across client delivery and studio operations.",
    detail: "",
    quote: "",
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
    { label: "Availability", lines: ["Taking two new builds for Q4 2026. Retainers open now."] },
  ],
  follow: {
    label: "Follow",
    links: [
      { label: "Instagram ↗", href: SITE.instagram },
      { label: "LinkedIn ↗", href: SITE.linkedin },
    ],
  },
} as const;
