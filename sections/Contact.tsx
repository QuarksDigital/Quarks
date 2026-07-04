"use client";

import { useEffect, useRef } from "react";
import { useSceneTrigger } from "@/hooks/useSceneTrigger";
import { createContactScene, type ContactRefs } from "@/animations/scenes/contact";
import { attachMagnetic } from "@/animations/interactions/magnetic";
import MagneticButton from "@/components/ui/MagneticButton";
import { getLenis } from "@/components/providers/SmoothScrollProvider";
import { CONTACT, SITE } from "@/constants/content";

export default function Contact() {
  const section = useRef<HTMLElement>(null);
  const pinned = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const rows = useRef<HTMLDivElement>(null);
  const footer = useRef<HTMLDivElement>(null);
  const cta = useRef<HTMLDivElement>(null);

  useSceneTrigger<ContactRefs>((args) => createContactScene(args), {
    get section() { return section.current; },
    get pinned() { return pinned.current; },
    get headline() { return headline.current; },
    get rows() { return rows.current; },
    get footer() { return footer.current; },
    get cta() { return cta.current; },
  });

  useEffect(() => {
    if (!footer.current) return;
    return attachMagnetic(footer.current);
  }, []);

  return (
    <section
      ref={section}
      id="contact"
      aria-label="Contact Quarks"
      className="relative"
      style={{ zIndex: "var(--z-scene)" }}
    >
      <div ref={pinned} className="flex h-screen flex-col items-center justify-center px-6">
        <h2
          ref={headline}
          className="type-display text-center text-starlight"
          style={{ fontSize: "clamp(2.8rem, 9vw, 9rem)" }}
        >
          {CONTACT.headline}
        </h2>

        <div ref={cta} className="mt-12">
          <MagneticButton href={`mailto:${SITE.emailNew}`}>{CONTACT.cta}</MagneticButton>
        </div>

        <div ref={rows} className="mt-14 flex flex-col items-center gap-3">
          {CONTACT.rows.map((r) => (
            <p key={r.label} className="type-mono text-dust">
              {r.label} —{" "}
              <a
                href={`mailto:${r.value}`}
                data-cursor="link"
                className="text-cherenkov-300 no-underline hover:text-whitehot"
              >
                {r.value}
              </a>
            </p>
          ))}
        </div>

        <div
          ref={footer}
          className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-6 border-t border-white/5 px-6 py-8 md:flex-row md:justify-between md:px-16"
        >
          <p className="type-mono text-dust" style={{ fontSize: "0.6rem" }}>
            {SITE.coordinates}
          </p>
          <div className="flex gap-6">
            {CONTACT.socials.map((s) => (
              <a
                key={s}
                href="#"
                data-magnetic
                data-cursor="link"
                className="type-mono text-dust no-underline transition-colors hover:text-cherenkov-300"
                style={{ fontSize: "0.62rem" }}
                onClick={(e) => e.preventDefault()}
              >
                <span data-magnetic-inner className="inline-block">{s}</span>
              </a>
            ))}
          </div>
          <button
            type="button"
            data-cursor="link"
            className="type-mono text-cherenkov-700 transition-colors hover:text-cherenkov-300"
            style={{ fontSize: "0.62rem" }}
            onClick={() => getLenis()?.scrollTo(0, { duration: 2.4 })}
          >
            {CONTACT.backToTop} ↑
          </button>
          <p className="type-mono text-dust/60" style={{ fontSize: "0.55rem" }}>
            {CONTACT.legal}
          </p>
        </div>
      </div>
    </section>
  );
}
