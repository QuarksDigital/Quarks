import Hero from "@/sections/Hero";
import Manifesto from "@/sections/Manifesto";
import Forces from "@/sections/Forces";
import Collisions from "@/sections/Collisions";
import Scale from "@/sections/Scale";
import Proof from "@/sections/Proof";
import Contact from "@/sections/Contact";

export default function Home() {
  return (
    <main className="select-none">
      <Hero />
      <Manifesto />
      <Forces />
      <Collisions />
      <Scale />
      <Proof />
      <Contact />
    </main>
  );
}
