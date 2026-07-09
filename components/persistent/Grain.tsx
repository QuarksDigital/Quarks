"use client";

/** Animated film grain - 128px noise tile re-randomized at 12fps (Bible §0.3). */
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/utils/dom";

export default function Grain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = 128;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const img = ctx.createImageData(size, size);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    };

    draw();
    if (prefersReducedMotion()) return;
    const id = setInterval(draw, 1000 / 12);
    return () => clearInterval(id);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{
        zIndex: "var(--z-grain)",
        opacity: 0.035,
        mixBlendMode: "overlay",
        imageRendering: "pixelated",
      }}
    />
  );
}
