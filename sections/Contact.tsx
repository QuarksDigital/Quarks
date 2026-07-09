"use client";

import { useEffect, useRef } from "react";
import { useSceneTrigger } from "@/hooks/useSceneTrigger";
import {
  createContactScene,
  type ContactRefs,
} from "@/animations/scenes/contact";
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
    get section() {
      return section.current;
    },
    get pinned() {
      return pinned.current;
    },
    get headline() {
      return headline.current;
    },
    get rows() {
      return rows.current;
    },
    get footer() {
      return footer.current;
    },
    get cta() {
      return cta.current;
    },
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
      <div
        ref={pinned}
        className="flex h-screen flex-col items-center justify-center px-6"
      >
        <h2
          ref={headline}
          className="type-display text-center text-starlight"
          style={{ fontSize: "clamp(2.8rem, 9vw, 9rem)" }}
        >
          {CONTACT.headline}
        </h2>

        <div ref={cta} className="mt-12">
          <MagneticButton href={`mailto:${SITE.emailNew}`}>
            {CONTACT.cta}
          </MagneticButton>
        </div>

        <div ref={rows} className="mt-14 flex flex-col items-center gap-3">
          {CONTACT.rows.map((r) => (
            <p key={r.label} className="type-mono text-dust">
              {r.label} -{" "}
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

        {/* About Us - centered on mobile/tablet, bottom-right on desktop; jumps to the About section */}
        {/* <div className="absolute bottom-28 left-0 right-0 z-10 flex justify-center px-6 md:bottom-12 md:left-auto md:right-12 md:justify-end md:px-0">
          <button
            type="button"
            data-cursor="link"
            aria-label="Go to About Us"
            onClick={() => getLenis()?.scrollTo("#about", { duration: 2 })}
            className="group relative flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-7 py-3.5 backdrop-blur-md transition-colors hover:border-cherenkov-500/40"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cherenkov-500 shadow-[0_0_12px_2px_rgba(56,219,255,0.7)]" />
            <span className="type-mono text-starlight group-hover:text-whitehot">
              {ABOUT.triggerLabel}
            </span>
            <span className="type-mono text-cherenkov-700 transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
        </div> */}

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
                key={s.name}
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                data-magnetic
                data-magnetic-pull="0.12"
                data-magnetic-radius="20"
                data-cursor="link"
                className="type-mono text-dust no-underline transition-colors hover:text-cherenkov-300"
                style={{ fontSize: "0.62rem" }}
              >
                <span data-magnetic-inner className="inline-block">
                  {s.name}
                </span>
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
