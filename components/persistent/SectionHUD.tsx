"use client";

/** Top-left mono section indicator; scrambles on scene change (Bible §0.3). */
import { useEffect, useRef } from "react";
import { scrambleTo } from "@/components/ui/ScrambleText";

export function setHudLabel(label: string): void {
  if (typeof document === "undefined") return;
  const el = document.getElementById("quarks-hud-label");
  if (el && el.dataset.label !== label) {
    el.dataset.label = label;
    scrambleTo(el, label, 0.45);
  }
}

export default function SectionHUD() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = document.getElementById("quarks-hud-label");
    if (el) scrambleTo(el, "INITIALIZING", 0.4);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="type-mono fixed left-12 top-6 hidden text-dust select-none md:block"
      style={{ zIndex: "var(--z-hud)" }}
    >
      <span id="quarks-hud-label" data-label="" />
    </div>
  );
}
