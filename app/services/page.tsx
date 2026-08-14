import type { Metadata } from "next";
import ServicesExperience from "@/components/services/ServicesExperience";
import { PILLARS, SERVICES_COPY, STEPS } from "@/constants/services";
import { SITE } from "@/constants/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.quarksdigital.in";

const ALL = PILLARS.flatMap((p) => p.items);
const description = `${SERVICES_COPY.sub} ${ALL.map((s) => s.name).join(", ")}.`;

export const metadata: Metadata = {
  title: SERVICES_COPY.heading,
  description,
  alternates: { canonical: "/services" },
  openGraph: {
    type: "website",
    url: "/services",
    siteName: SITE.name,
    title: `${SERVICES_COPY.heading} - ${SITE.name}`,
    description,
    images: [
      {
        url: "/hero/genesis-poster.jpg",
        alt: `${SITE.name} services`,
        width: 1920,
        height: 1080,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SERVICES_COPY.heading} - ${SITE.name}`,
    description,
    images: ["/hero/genesis-poster.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${SITE.name} Services`,
  itemListElement: ALL.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Service",
      name: s.name,
      description: s.line,
      provider: { "@type": "Organization", name: SITE.name, url: SITE_URL },
    },
  })),
};

const howTo = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: SERVICES_COPY.stepsIndex,
  step: STEPS.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.name,
    text: s.line,
  })),
};

export default function ServicesPage() {
  return (
    <main className="select-none">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, howTo]) }}
      />
      <ServicesExperience standalone />
    </main>
  );
}
