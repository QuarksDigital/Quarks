"use client";

/** Mounts the ONE fullscreen WebGL canvas + all scene modules (Bible §0.1). */
import { useEffect, useRef } from "react";
import { createEngine, destroyEngine } from "@/components/webgl/engine";
import { GridWorld } from "@/components/webgl/gridWorld";
import { Triad } from "@/components/webgl/triad";
import { ParticleField } from "@/components/webgl/particleField";
import { Displacement } from "@/components/webgl/displacement";
import { prefersReducedMotion } from "@/utils/dom";

export default function WebGLProvider() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || prefersReducedMotion()) return;
    const engine = createEngine();
    engine.mount(canvasRef.current);
    engine.add(new GridWorld());
    engine.add(new Triad());
    engine.add(new ParticleField());
    engine.add(new Displacement());
    return () => destroyEngine();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ zIndex: "var(--z-webgl)" }}
    />
  );
}
