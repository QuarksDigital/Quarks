"use client";

/** Mono HUD text that scrambles into place (imperative API for scenes + declarative for HUD). */
import { useEffect, useRef } from "react";

const CHARS = "QUARKSΔΦΨ∴∵×+01";

export function scrambleTo(el: HTMLElement, text: string, duration = 0.4): void {
  const from = el.textContent ?? "";
  const len = Math.max(from.length, text.length);
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min((now - start) / (duration * 1000), 1);
    let out = "";
    for (let i = 0; i < len; i++) {
      const reveal = i / len < t;
      out += reveal
        ? (text[i] ?? "")
        : CHARS[(Math.random() * CHARS.length) | 0];
    }
    el.textContent = out;
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = text;
  };
  requestAnimationFrame(tick);
}

export default function ScrambleText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) scrambleTo(ref.current, text);
  }, [text]);
  return <span ref={ref} className={className} />;
}
