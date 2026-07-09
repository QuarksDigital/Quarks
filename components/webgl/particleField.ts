/**
 * Shared particle buffer: ambient drift (S2), cosmos (S5 exit), and the
 * S7 gravity well in-fall - same points, retargeted (Bible §6.3/§7).
 */
import * as THREE from "three";
import { Engine, SceneModule, getGlowTexture } from "./engine";

export type FieldMode = "drift" | "cosmos" | "well";

export class ParticleField implements SceneModule {
  id = "particleField";
  group = new THREE.Group();
  private points!: THREE.Points;
  private velocities!: Float32Array;
  private mode: FieldMode = "drift";
  private wellStrength = 0;
  private engineRef!: Engine;
  private count = 420;

  init(engine: Engine): void {
    this.engineRef = engine;
    if (window.innerWidth < 640) this.count = 180;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 3);
    for (let i = 0; i < this.count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 4;
      this.velocities[i * 3] = (Math.random() - 0.5) * 0.12;
      this.velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.08;
      this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.06;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.22,
      map: getGlowTexture(),
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0x38dbff,
      sizeAttenuation: true,
    });
    this.points = new THREE.Points(geo, mat);
    this.group.add(this.points);
  }

  setMode(mode: FieldMode): void {
    this.mode = mode;
  }

  /** 0–1, scrubbed by the S7 timeline */
  setWellStrength(v: number): void {
    this.wellStrength = v;
  }

  setProgress(): void {}

  update(dt: number): void {
    const attr = this.points.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const px = this.engineRef.pointer.x * 1.4;
    const py = this.engineRef.pointer.y * 0.9;

    for (let i = 0; i < this.count; i++) {
      const ix = i * 3;
      if (this.mode === "well" && this.wellStrength > 0) {
        const dx = -arr[ix];
        const dy = -arr[ix + 1];
        const dz = -2 - arr[ix + 2];
        const d2 = dx * dx + dy * dy + dz * dz + 0.6;
        const f = (this.wellStrength * 2.2) / d2;
        this.velocities[ix] += dx * f * dt;
        this.velocities[ix + 1] += dy * f * dt;
        this.velocities[ix + 2] += dz * f * dt;
        this.velocities[ix] *= 0.985;
        this.velocities[ix + 1] *= 0.985;
        this.velocities[ix + 2] *= 0.985;
      }
      arr[ix] += this.velocities[ix] * dt * 8 + px * dt * 0.4;
      arr[ix + 1] += this.velocities[ix + 1] * dt * 8 + py * dt * 0.3;
      arr[ix + 2] += this.velocities[ix + 2] * dt * 8;

      if (this.mode !== "well") {
        if (arr[ix] > 22) arr[ix] = -22;
        if (arr[ix] < -22) arr[ix] = 22;
        if (arr[ix + 1] > 13) arr[ix + 1] = -13;
        if (arr[ix + 1] < -13) arr[ix + 1] = 13;
      }
    }
    attr.needsUpdate = true;
  }

  dispose(): void {
    this.points.geometry.dispose();
    (this.points.material as THREE.Material).dispose();
  }
}
