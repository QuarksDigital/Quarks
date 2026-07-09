/**
 * QUARKS - the ONE WebGL context (Bible §0.1). Raw three.js, no reconciler.
 * Scene modules register here; ScrollTrigger timelines drive their progress.
 */
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { PERF } from "@/constants/motion";

export interface SceneModule {
  id: string;
  group: THREE.Group;
  init(engine: Engine): void;
  /** scroll progress 0–1 within the owning scene */
  setProgress(p: number): void;
  update(dt: number, elapsed: number): void;
  dispose(): void;
}

export class Engine {
  renderer!: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera!: THREE.PerspectiveCamera;
  pointer = new THREE.Vector2(0, 0);
  pointerVel = new THREE.Vector2(0, 0);
  private modules = new Map<string, SceneModule>();
  private active = new Set<string>();
  private clock = new THREE.Clock();
  private tick = (): void => this.render();
  private lastPointer = new THREE.Vector2(0, 0);
  degraded = false;

  mount(canvas: HTMLCanvasElement): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.setSize();
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      400,
    );
    this.camera.position.set(0, 0, 10);

    window.addEventListener("resize", this.onResize);
    window.addEventListener("pointermove", this.onPointer, { passive: true });
    gsap.ticker.add(this.tick);
  }

  private onResize = (): void => {
    this.setSize();
    if (this.camera) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }
  };

  private onPointer = (e: PointerEvent): void => {
    this.pointer.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1,
    );
  };

  private setSize(): void {
    const dpr = Math.min(
      window.devicePixelRatio || 1,
      this.degraded ? PERF.dprDegraded : PERF.dprMax,
    );
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  degrade(): void {
    if (this.degraded) return;
    this.degraded = true;
    this.setSize();
  }

  add(module: SceneModule): void {
    this.modules.set(module.id, module);
    module.init(this);
    module.group.visible = false;
    this.scene.add(module.group);
  }

  get<T extends SceneModule>(id: string): T | undefined {
    return this.modules.get(id) as T | undefined;
  }

  setActive(id: string, on: boolean): void {
    const m = this.modules.get(id);
    if (!m) return;
    if (on) this.active.add(id);
    else this.active.delete(id);
    m.group.visible = on;
  }

  private render(): void {
    if (!this.renderer || !this.camera) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.elapsedTime;
    this.pointerVel.subVectors(this.pointer, this.lastPointer);
    this.lastPointer.copy(this.pointer);
    if (this.active.size === 0) return;
    this.active.forEach((id) => this.modules.get(id)?.update(dt, elapsed));
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    gsap.ticker.remove(this.tick);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointer);
    this.modules.forEach((m) => m.dispose());
    this.modules.clear();
    this.active.clear();
    this.renderer?.dispose();
  }
}

let engine: Engine | null = null;
export const getEngine = (): Engine | null => engine;
export const createEngine = (): Engine => {
  engine = new Engine();
  return engine;
};
export const destroyEngine = (): void => {
  engine?.dispose();
  engine = null;
};

/** Shared soft-glow sprite texture (generated, no asset). */
let glowTex: THREE.Texture | null = null;
export function getGlowTexture(): THREE.Texture {
  if (glowTex) return glowTex;
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(232,252,255,1)");
  g.addColorStop(0.25, "rgba(56,219,255,0.85)");
  g.addColorStop(0.6, "rgba(56,219,255,0.22)");
  g.addColorStop(1, "rgba(56,219,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}
