/**
 * QUARKS - the protagonist of /services.
 *
 * A procedural, physically-posed atom: a packed nucleon core sitting at the
 * shared focus of three tilted elliptical electron shells. Real geometry and
 * real lighting - no SVG, no imported mesh, no external asset.
 *
 * Deliberately dim. The cards float in front of it, so every emissive and
 * additive element is scaled by ATOM.opacity and the exposure is pulled down:
 * the atom should read as depth behind the copy, never compete with it.
 *
 * Self-contained: owns its canvas, renderer and RAF subscription, so it works
 * identically on the standalone route and inside the home scroll gate.
 */
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { ATOM } from "@/constants/services";
import { COLORS } from "@/constants/tokens";
import { PERF } from "@/constants/motion";
import { prefersReducedMotion } from "@/utils/dom";

const DIM = ATOM.opacity;

const PROTON = new THREE.Color(COLORS.accentDeep);
const NEUTRON = new THREE.Color(COLORS.panelDeep);
const ELECTRON = new THREE.Color(COLORS.accentPale);

/** Soft radial sprite used for every glow in the module. */
function makeGlowTexture(inner: string, mid: string): THREE.Texture {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.28, mid);
  g.addColorStop(1, "rgba(58,219,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Evenly distributed points on a sphere - packs the nucleus without overlap. */
function fibonacciSphere(n: number, radius: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(n - 1, 1)) * 2;
    const r = Math.sqrt(Math.max(1 - y * y, 0));
    const theta = golden * i;
    // Pull inner shells inward so the core reads as packed, not hollow.
    const shrink = 0.55 + 0.45 * Math.sqrt(i / Math.max(n - 1, 1));
    pts.push(
      new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius * shrink),
    );
  }
  return pts;
}

interface Electron {
  mesh: THREE.Mesh;
  glow: THREE.Sprite;
  trail: THREE.Sprite[];
  phase: number;
  shell: number;
}

export interface AtomHandle {
  /** 0 = calm, 1 = fully excited. Drives spin, glow and electron speed. */
  setEnergy(v: number): void;
  /** External scalar for entrance / gate reveal. */
  setScale(v: number): void;
  dispose(): void;
}

export function createAtom(canvas: HTMLCanvasElement): AtomHandle {
  const reduced = prefersReducedMotion();

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // Held well under 1 so the core never blooms into the card copy.
  renderer.toneMappingExposure = 0.72;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 11.5);

  const root = new THREE.Group();
  scene.add(root);

  // ── lighting ────────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0x141a26, 1));
  const key = new THREE.PointLight(COLORS.accentDeep, 44 * DIM, 40, 2);
  key.position.set(5, 4, 7);
  scene.add(key);
  const rim = new THREE.PointLight(COLORS.bone, 20 * DIM, 40, 2);
  rim.position.set(-6, -3, -4);
  scene.add(rim);
  const core = new THREE.PointLight(COLORS.accent, 14 * DIM, 14, 2);
  scene.add(core);

  // ── bookkeeping for teardown ────────────────────────────────────────────
  const coreGlowTex = makeGlowTexture("rgba(159,241,255,0.7)", "rgba(14,143,191,0.4)");
  const dotGlowTex = makeGlowTexture("rgba(220,246,255,0.85)", "rgba(58,219,255,0.5)");
  const textures = [coreGlowTex, dotGlowTex];
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const track = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };

  // ── nucleus ─────────────────────────────────────────────────────────────
  const nucleus = new THREE.Group();
  root.add(nucleus);

  const nucleonGeo = trackGeo(new THREE.IcosahedronGeometry(0.26, 3));
  const nucleonSeeds: { mesh: THREE.Mesh; base: THREE.Vector3; seed: number }[] = [];

  fibonacciSphere(ATOM.nucleons, ATOM.nucleusRadius).forEach((p, i) => {
    const isProton = i % 2 === 0;
    const mat = track(
      new THREE.MeshStandardMaterial({
        color: isProton ? PROTON : NEUTRON,
        emissive: isProton ? PROTON : new THREE.Color(COLORS.panelVoid),
        emissiveIntensity: (isProton ? 0.55 : 0.12) * DIM,
        roughness: 0.45,
        metalness: 0.6,
        transparent: true,
        opacity: 0.5 + DIM * 0.4,
      }),
    );
    const mesh = new THREE.Mesh(nucleonGeo, mat);
    mesh.position.copy(p);
    nucleus.add(mesh);
    nucleonSeeds.push({ mesh, base: p.clone(), seed: Math.random() * Math.PI * 2 });
  });

  const coreGlow = new THREE.Sprite(
    track(
      new THREE.SpriteMaterial({
        map: coreGlowTex,
        color: 0xffffff,
        transparent: true,
        opacity: 0.5 * DIM,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  coreGlow.scale.setScalar(4.6);
  nucleus.add(coreGlow);

  const shellSkin = new THREE.Mesh(
    trackGeo(new THREE.IcosahedronGeometry(ATOM.nucleusRadius * 1.75, 4)),
    track(
      new THREE.MeshBasicMaterial({
        color: COLORS.accentDeep,
        wireframe: true,
        transparent: true,
        opacity: 0.14 * DIM,
      }),
    ),
  );
  nucleus.add(shellSkin);

  // ── electron shells ─────────────────────────────────────────────────────
  const shellGroups: THREE.Group[] = [];
  const electrons: Electron[] = [];

  ATOM.shells.forEach((shell, si) => {
    const g = new THREE.Group();
    g.rotation.set(shell.tiltX, si * 0.9, shell.tiltZ);
    root.add(g);
    shellGroups.push(g);

    const b = shell.a * Math.sqrt(1 - shell.e * shell.e);
    const c = shell.a * shell.e;

    // Orbit path. The nucleus sits at a focus, not the centre.
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 220; i++) {
      const t = (i / 220) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(t) * shell.a - c, 0, Math.sin(t) * b));
    }
    g.add(
      new THREE.Line(
        trackGeo(new THREE.BufferGeometry().setFromPoints(pts)),
        track(
          new THREE.LineBasicMaterial({
            color: COLORS.accentDeep,
            transparent: true,
            opacity: 0.22 * DIM,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        ),
      ),
    );

    const electronGeo = trackGeo(new THREE.SphereGeometry(0.1, 20, 20));

    for (let e = 0; e < shell.electrons; e++) {
      const mesh = new THREE.Mesh(
        electronGeo,
        track(
          new THREE.MeshStandardMaterial({
            color: ELECTRON,
            emissive: ELECTRON,
            emissiveIntensity: 1.2 * DIM,
            roughness: 0.25,
            transparent: true,
            opacity: 0.55 + DIM * 0.3,
          }),
        ),
      );
      g.add(mesh);

      const glow = new THREE.Sprite(
        track(
          new THREE.SpriteMaterial({
            map: dotGlowTex,
            transparent: true,
            opacity: 0.55 * DIM,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        ),
      );
      glow.scale.setScalar(0.85);
      g.add(glow);

      const trail: THREE.Sprite[] = [];
      if (!reduced) {
        for (let t = 0; t < ATOM.trailLength; t++) {
          const s = new THREE.Sprite(
            track(
              new THREE.SpriteMaterial({
                map: dotGlowTex,
                color: COLORS.accentDeep,
                transparent: true,
                opacity: 0,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
              }),
            ),
          );
          s.scale.setScalar(0.4);
          g.add(s);
          trail.push(s);
        }
      }

      electrons.push({ mesh, glow, trail, phase: (e / shell.electrons) * Math.PI * 2, shell: si });
    }
  });

  // ── interaction state ───────────────────────────────────────────────────
  const drag = { active: false, lastX: 0, lastY: 0, vx: 0, vy: 0 };
  const pointer = { x: 0, y: 0 };
  const state = { energy: 0, scale: 1, spin: 0, tilt: 0 };
  let elapsed = 0;

  const onPointerDown = (e: PointerEvent): void => {
    drag.active = true;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent): void => {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    if (!drag.active) return;
    drag.vx += (e.clientX - drag.lastX) * 0.0045;
    drag.vy += (e.clientY - drag.lastY) * 0.0045;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
  };

  const onPointerUp = (e: PointerEvent): void => {
    drag.active = false;
    canvas.releasePointerCapture?.(e.pointerId);
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  // ── sizing ──────────────────────────────────────────────────────────────
  const resize = (): void => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, PERF.dprMax));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 720 ? 15 : 11.5;
    camera.updateProjectionMatrix();
  };
  resize();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // ── frame ───────────────────────────────────────────────────────────────
  const frame = (): void => {
    const dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 0.05);
    elapsed += dt;

    if (!drag.active) {
      drag.vx *= ATOM.dragDamping;
      drag.vy *= ATOM.dragDamping;
    }
    state.spin += drag.vx + dt * ATOM.autoSpin * (1 + state.energy * 2.2);
    state.tilt = THREE.MathUtils.clamp(state.tilt + drag.vy, -0.95, 0.95);

    root.rotation.y = state.spin + pointer.x * 0.16;
    root.rotation.x = state.tilt - pointer.y * 0.12;
    root.scale.setScalar(state.scale * (1 + state.energy * 0.06));

    const swell = 1 + state.energy * 0.22;
    nucleonSeeds.forEach(({ mesh, base, seed }) => {
      const j = Math.sin(elapsed * 2.1 + seed) * 0.035;
      mesh.position.copy(base).multiplyScalar(swell + j);
      mesh.rotation.x += dt * 0.4;
      mesh.rotation.y += dt * 0.3;
    });

    shellSkin.rotation.y -= dt * 0.22;
    shellSkin.rotation.x += dt * 0.11;
    (shellSkin.material as THREE.MeshBasicMaterial).opacity = (0.14 + state.energy * 0.16) * DIM;
    coreGlow.scale.setScalar(4.6 + Math.sin(elapsed * 1.6) * 0.18 + state.energy * 1.5);
    core.intensity = (14 + state.energy * 26) * DIM;

    electrons.forEach((el) => {
      const shell = ATOM.shells[el.shell];
      const b = shell.a * Math.sqrt(1 - shell.e * shell.e);
      const c = shell.a * shell.e;
      const t = elapsed * shell.speed * (1 + state.energy * 1.4) + el.phase;

      const x = Math.cos(t) * shell.a - c;
      const z = Math.sin(t) * b;

      // Shift trail history back one slot, then write the new head.
      for (let i = el.trail.length - 1; i > 0; i--) {
        el.trail[i].position.copy(el.trail[i - 1].position);
        const m = el.trail[i].material as THREE.SpriteMaterial;
        const k = 1 - i / el.trail.length;
        m.opacity = k * (0.3 + state.energy * 0.28) * DIM;
        el.trail[i].scale.setScalar(0.4 * k + 0.06);
      }
      if (el.trail.length > 0) {
        el.trail[0].position.set(x, 0, z);
        (el.trail[0].material as THREE.SpriteMaterial).opacity =
          (0.32 + state.energy * 0.28) * DIM;
      }

      el.mesh.position.set(x, 0, z);
      el.glow.position.set(x, 0, z);
      el.glow.scale.setScalar(0.85 + state.energy * 0.5);
    });

    shellGroups.forEach((g, i) => {
      g.rotation.y += dt * (0.05 + i * 0.02) * (1 + state.energy);
    });

    renderer.render(scene, camera);
  };

  if (reduced) {
    root.rotation.set(-0.2, 0.5, 0);
    renderer.render(scene, camera);
  } else {
    gsap.ticker.add(frame);
  }

  return {
    setEnergy(v: number) {
      gsap.to(state, { energy: v, duration: 0.9, ease: "power3.out", overwrite: "auto" });
    },
    setScale(v: number) {
      gsap.to(state, { scale: v, duration: 1.1, ease: "expo.out", overwrite: "auto" });
    },
    dispose() {
      gsap.ticker.remove(frame);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      renderer.dispose();
    },
  };
}
