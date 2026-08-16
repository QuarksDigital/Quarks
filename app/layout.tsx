import type { Metadata, Viewport } from "next";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import Reveals from "@/components/providers/Reveals";
import Preloader from "@/components/persistent/Preloader";
import Nav from "@/components/persistent/Nav";
import RouteRail from "@/components/persistent/RouteRail";
import Cursor from "@/components/persistent/Cursor";
import { SITE, FOUNDERS } from "@/constants/content";
import { COLORS } from "@/constants/tokens";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.quarksdigital.in";
const TITLE = `${SITE.name} : ${SITE.tagline}`;

/**
 * Both faces (Switzer + JetBrains Mono) are self-hosted from public/fonts and
 * declared in globals.css - no next/font, so the build has no network
 * dependency and there is no third-party request at runtime.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s - ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  manifest: "/manifest.json",
  category: "Marketing",
  keywords: [
    "digital marketing agency",
    "creative agency",
    "brand strategy",
    "web design",
    "web development",
    "app development",
    "3D web experiences",
    "SEO",
    "ASO",
    "business automation",
    "performance marketing",
    "content marketing",
    "social media",
    "Quarks",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE.name,
    title: TITLE,
    description: SITE.description,
    locale: "en_US",
    images: [{ url: "/hero/genesis-poster.jpg", alt: TITLE, width: 1920, height: 1080 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE.description,
    images: ["/hero/genesis-poster.jpg"],
  },
icons: { icon: "/icon_black_bg.png", apple: "/icon_black_bg.png", shortcut: "/icon_black_bg.png" },
formatDetection: { email: false, telephone: false, address: false },
};

export const viewport: Viewport = {
  themeColor: COLORS.void,
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  legalName: SITE.name,
  url: SITE_URL,
  logo: `${SITE_URL}/icon_black_bg.png`,
  image: `${SITE_URL}/hero/genesis-poster.jpg`,
  description: SITE.description,
  slogan: SITE.tagline,
  email: SITE.emailNew,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bhubaneswar",
    addressRegion: "Odisha",
    addressCountry: "IN",
  },
  sameAs: [SITE.linkedin, SITE.instagram],
  founder: FOUNDERS.map((f) => ({
    "@type": "Person",
    name: f.name.charAt(0) + f.name.slice(1).toLowerCase(),
    jobTitle: f.role,
  })),
  knowsAbout: [
    "Digital Marketing",
    "Brand Strategy",
    "Web Design",
    "Web Development",
    "App Development",
    "3D Web Experiences",
    "SEO",
    "ASO",
    "Business Automation",
    "Content",
    "Social Media",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      {/*
       * suppressHydrationWarning: browser extensions (ColorZilla, Grammarly,
       * password managers) inject attributes like cz-shortcut-listen onto
       * <body> before React hydrates, which React would otherwise flag as a
       * mismatch. This suppresses the warning for body's own attributes only -
       * it does not affect children.
       */}
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScrollProvider>
          {children}
          <Nav />
          <RouteRail />
          <Cursor />
          <Reveals />
          <Preloader />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
