"use client";

/**
 * QUARKS - the compact footer bar that closes the services stage.
 *
 * A slim, self-contained strip: wordmark, the two social links, copyright, and
 * a back-to-top control. Mirrors the copyright row at the foot of the Contact
 * section (see sections/Contact.tsx, [data-q='footer-bar']) so the site reads
 * as one system, but stands alone here because the services stage above is a
 * pinned, clipped h-screen box that can't host in-flow content of its own.
 */
import { scrollToRoute } from "@/lib/scrollTo";
import { CONTACT, SITE } from "@/constants/content";
import { COLORS } from "@/constants/tokens";

export default function ServicesFooter() {
  return (
    <footer
      data-q="services-footer"
      aria-label={`${SITE.name} footer`}
      className="relative"
      style={{ background: COLORS.void, zIndex: "var(--z-scene)" }}
    >
      <div
        className="mx-auto flex flex-wrap items-center justify-between gap-x-8 gap-y-4"
        style={{
          maxWidth: "var(--measure)",
          padding: "clamp(30px,5vh,56px) var(--gutter)",
          borderTop: "1px solid var(--hairline-dark)",
        }}
      >
        {/* Wordmark + copyright */}
        <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-2">
          <span
            className="font-medium"
            style={{
              fontSize: 17,
              letterSpacing: "-0.02em",
              color: COLORS.mist,
            }}
          >
            {SITE.name}
          </span>
          <span
            className="type-mono-tight"
            style={{ color: COLORS.shadow }}
          >
            {CONTACT.copyright}
          </span>
        </div>

        {/* Social links + back to top */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {CONTACT.follow.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              data-cursor="link"
              className="type-mono-tight"
              style={{ color: COLORS.dust }}
            >
              {l.label}
            </a>
          ))}
          <button
            type="button"
            data-cursor="link"
            onClick={() => scrollToRoute("/")}
            className="type-mono-tight"
            style={{ color: COLORS.dust }}
          >
            {CONTACT.backToTop}
          </button>
        </div>
      </div>
    </footer>
  );
}
