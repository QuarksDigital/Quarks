# QUARKS - From invisible to inevitable.

The digital showcase of Quarks, a digital marketing agency. One continuous cinematic
scroll experience: a single quark becomes an atom, the camera dives through the nucleus,
and the site unfolds inside the digital universe it finds there.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · GSAP 3.13 (ScrollTrigger, SplitText, MotionPath) · Lenis · three.js (one shared WebGL context)

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. First run downloads Google fonts at build time (needs network).

## Architecture

- `sections/` - dumb DOM shells. No animation logic.
- `animations/scenes/` - one GSAP module per scene (the Animation Bible, executable).
- `animations/interactions/` - magnetic physics, panel lighting, the video scrub engine.
- `animations/core/` - orb state machine, ScrollTrigger registry, scene→scale mapping.
- `components/webgl/` - the single three.js engine + scene modules (grid world, triad, particles, displacement).
- `components/persistent/` - preloader, nav, cursor, grain, HUD, scale readout, progress filament.
- `constants/` - every color, ease, duration, pin length, keyframe table, and line of copy.

## The film

`public/hero/genesis-1080.mp4` - 16 s master, two frame-chained Kling 3.0 clips,
re-encoded all-intra (`-g 1`) so scroll scrubbing is frame-perfect in both directions.
Scroll drives `currentTime`; the video never plays.

## Docs

- `quarks-animation-bible.md` - every scene, transition, camera move, and timeline (in the project chat outputs).
- Reduced motion: every scene ships a static variant (`prefers-reduced-motion`).
