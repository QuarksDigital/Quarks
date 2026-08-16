import Hero from "@/sections/Hero";
import Intro from "@/sections/Intro";
import Work from "@/sections/Work";
import About from "@/sections/About";
import Contact from "@/sections/Contact";
import ScrollGate from "@/components/services/ScrollGate";
import ServicesFooter from "@/components/services/ServicesFooter";
import { COLORS } from "@/constants/tokens";

export default function Home() {
  return (
    <main className="select-none">
      {/*
        One document, five routes. Each section declares its route + theme;
        the observer in RouteRail publishes whichever owns the viewport.
        Services is deliberately absent here - it lives past the scroll gate.
      */}
      <section
        id="top"
        data-route="/"
        data-theme="dark"
        aria-label="Quarks - from invisible to inevitable"
        className="relative"
        style={{ background: COLORS.void }}
      >
        <Hero />
        <Intro />
      </section>

      <Work />
      <About />
      <Contact />
      <ScrollGate />
      {/* Closes the services stage the gate reveals - a slim footer bar that
          flows in once the gate's pinned scroll completes. */}
      <ServicesFooter />
    </main>
  );
}
