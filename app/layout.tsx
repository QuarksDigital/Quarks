import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import WebGLProvider from "@/components/providers/WebGLProvider";
import Preloader from "@/components/persistent/Preloader";
import Nav from "@/components/persistent/Nav";
import Cursor from "@/components/persistent/Cursor";
import ScaleReadout from "@/components/persistent/ScaleReadout";
import ProgressFilament from "@/components/persistent/ProgressFilament";
import SectionHUD from "@/components/persistent/SectionHUD";
import { SITE, FOUNDERS } from "@/constants/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quarks-rosy.vercel.app";
const TITLE = `${SITE.name} — ${SITE.tagline}`;

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s — ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  category: "Marketing",
  keywords: [
    "digital marketing agency",
    "creative agency",
    "brand strategy",
    "web design",
    "web development",
    "3D web experiences",
    "SEO",
    "performance marketing",
    "content marketing",
    "marketing",
    "instagram",
    "youtube",
    "x",
    "social media",
    "Quarks",
    "near me",
    "digital marketing",
    "digital marketing near me",
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
    images: [
      { url: "/hero/genesis-poster.jpg", alt: TITLE, width: 1920, height: 1080 },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE.description,
    images: ["/hero/genesis-poster.jpg"],
  },
  icons: { icon: "/icon.png", apple: "/icon.png", shortcut: "/icon.png" },
  formatDetection: { email: false, telephone: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#04040a",
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
  logo: `${SITE_URL}/icon.png`,
  image: `${SITE_URL}/hero/genesis-poster.jpg`,
  description: SITE.description,
  slogan: SITE.tagline,
  email: SITE.emailNew,
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
    "3D Web Experiences",
    "SEO",
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
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} antialiased`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScrollProvider>
          <WebGLProvider />
          {children}
          <Nav />
          <SectionHUD />
          <ScaleReadout />
          <ProgressFilament />
          <Cursor />
          <Preloader />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
