import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import WebGLProvider from "@/components/providers/WebGLProvider";
import Preloader from "@/components/persistent/Preloader";
import Nav from "@/components/persistent/Nav";
import Cursor from "@/components/persistent/Cursor";
import Grain from "@/components/persistent/Grain";
import ScaleReadout from "@/components/persistent/ScaleReadout";
import ProgressFilament from "@/components/persistent/ProgressFilament";
import SectionHUD from "@/components/persistent/SectionHUD";
import { SITE } from "@/constants/content";

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
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/hero/genesis-poster.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#04040a",
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
        <SmoothScrollProvider>
          <WebGLProvider />
          {children}
          <Nav />
          <SectionHUD />
          <ScaleReadout />
          <ProgressFilament />
          <Cursor />
          <Grain />
          <Preloader />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
