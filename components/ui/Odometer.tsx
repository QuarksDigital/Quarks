"use client";

/** Rolling metric counter — digit columns translate like an instrument locking in (Bible §5.2). */
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/utils/dom";

interface Props {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function Odometer({ value, prefix = "", suffix = "", className = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const str = Number.isInteger(value) ? String(value) : value.toFixed(1);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cols = Array.from(root.querySelectorAll<HTMLElement>("[data-odo-col]"));
    if (prefersReducedMotion() || cols.length === 0) return;

    const st = ScrollTrigger.create({
      trigger: root,
      start: "top 85%",
      once: true,
      onEnter: () => {
        cols.forEach((col, i) => {
          const digit = Number(col.dataset.digit ?? 0);
          gsap.fromTo(
            col,
            { yPercent: 0 },
            {
              yPercent: -digit * 10,
              duration: 1.2,
              delay: i * 0.08,
              ease: "power4.out",
            },
          );
        });
      },
    });
    return () => st.kill();
  }, [str]);

  return (
    <span ref={ref} className={`inline-flex items-baseline ${className}`}>
      {prefix && <span>{prefix}</span>}
      {str.split("").map((ch, i) =>
        /\d/.test(ch) ? (
          <span
            key={i}
            className="inline-block overflow-hidden align-baseline"
            style={{ height: "1em", lineHeight: 1 }}
          >
            <span
              data-odo-col
              data-digit={ch}
              className="inline-flex flex-col"
              style={{ lineHeight: 1 }}
            >
              {Array.from({ length: 10 }, (_, d) => (
                <span key={d} style={{ height: "1em" }}>
                  {d}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
      {suffix && <span>{suffix}</span>}
    </span>
  );
}
