/**
 * The protagonist as three orbiting quark-sprites with fading ghost trails.
 * Lives inside the GridWorld set during S2; screen-space anchored via orbController.
 */
import * as THREE from "three";
import { Engine, SceneModule, getGlowTexture } from "./engine";
import { orb } from "@/animations/core/orbController";

const TRAIL = 14;

export class Triad implements SceneModule {
  id = "triad";
  group = new THREE.Group();
  private quarks: THREE.Sprite[] = [];
  private trails: THREE.Sprite[][] = [];
  private engineRef!: Engine;
  private progress = 0;
  private radius = 0.9;
  private anchor = new THREE.Vector3(3.2, 0.6, 0);

  init(engine: Engine): void {
    this.engineRef = engine;
    for (let i = 0; i < 3; i++) {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: getGlowTexture(),
          color: 0xe8fcff,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      s.scale.setScalar(0.9);
      this.quarks.push(s);
      this.group.add(s);

      const trail: THREE.Sprite[] = [];
      for (let t = 0; t < TRAIL; t++) {
        const g = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: getGlowTexture(),
            color: 0x38dbff,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          }),
        );
        g.scale.setScalar(0.5);
        trail.push(g);
        this.group.add(g);
      }
      this.trails.push(trail);
    }
  }

  setProgress(p: number): void {
    this.progress = p;
  }

  /** move the whole triad in world space (scene timelines drive this) */
  setAnchor(x: number, y: number, z: number): void {
    this.anchor.set(x, y, z);
  }

  setRadius(r: number): void {
    this.radius = r;
  }

  update(dt: number, elapsed: number): void {
    const speed = 1.1 + this.progress * 0.8;
    for (let i = 0; i < 3; i++) {
      const phase = elapsed * speed + (i * Math.PI * 2) / 3;
      const wobble = Math.sin(elapsed * 0.7 + i) * 0.18;
      const x = this.anchor.x + Math.cos(phase) * this.radius;
      const y = this.anchor.y + Math.sin(phase) * this.radius * 0.55 + wobble;
      const z = this.anchor.z + Math.sin(phase * 0.9) * 0.4;

      const trail = this.trails[i];
      for (let t = trail.length - 1; t > 0; t--) {
        trail[t].position.copy(trail[t - 1].position);
        const mat = trail[t].material as THREE.SpriteMaterial;
        mat.opacity = (1 - t / trail.length) * 0.28;
        trail[t].scale.setScalar(0.5 * (1 - t / trail.length) + 0.08);
      }
      trail[0].position.set(x, y, z);
      (trail[0].material as THREE.SpriteMaterial).opacity = 0.3;

      this.quarks[i].position.set(x, y, z);
    }
    const s = orb.get();
    orb.set({ x: 0.5 + this.anchor.x / 20, y: 0.5 - this.anchor.y / 12, energy: s.energy });
  }

  dispose(): void {
    this.group.traverse((o) => {
      const sp = o as THREE.Sprite;
      if (sp.material) (sp.material as THREE.Material).dispose();
    });
  }
}
