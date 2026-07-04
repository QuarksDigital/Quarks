/**
 * S2 set — the inner dimension from the hero film's final frame:
 * reflective grid floor + ceiling, glass monoliths, center glow, drifting stars.
 * Virtual camera continues the film's forward glide (Bible §3).
 */
import * as THREE from "three";
import { Engine, SceneModule, getGlowTexture } from "./engine";

const GRID_FRAG = `
uniform float uTime;
uniform float uDrift;
varying vec2 vUv;
float gridLine(vec2 uv, float scale, float width) {
  vec2 g = abs(fract(uv * scale - 0.5) - 0.5) / fwidth(uv * scale);
  float line = min(g.x, g.y);
  return 1.0 - smoothstep(0.0, width, line);
}
void main() {
  vec2 uv = vUv;
  uv.y += uDrift;
  float major = gridLine(uv, 24.0, 1.4);
  float minor = gridLine(uv, 96.0, 1.0) * 0.35;
  float fade = smoothstep(0.0, 0.45, vUv.y) * (1.0 - smoothstep(0.7, 1.0, vUv.y));
  float horizon = smoothstep(0.35, 0.5, vUv.y) * (1.0 - smoothstep(0.5, 0.75, vUv.y));
  vec3 cyan = vec3(0.22, 0.86, 1.0);
  vec3 col = cyan * (major + minor) * 0.6 * fade + cyan * horizon * 0.12;
  float a = clamp((major + minor) * fade * 0.85 + horizon * 0.18, 0.0, 1.0);
  gl_FragColor = vec4(col, a);
}
`;

const GRID_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export class GridWorld implements SceneModule {
  id = "gridWorld";
  group = new THREE.Group();
  private floorMat!: THREE.ShaderMaterial;
  private ceilMat!: THREE.ShaderMaterial;
  private monoliths!: THREE.InstancedMesh;
  private stars!: THREE.Points;
  private glow!: THREE.Sprite;
  private progress = 0;
  private engineRef!: Engine;

  init(engine: Engine): void {
    this.engineRef = engine;

    const geo = new THREE.PlaneGeometry(220, 120, 1, 1);
    this.floorMat = new THREE.ShaderMaterial({
      vertexShader: GRID_VERT,
      fragmentShader: GRID_FRAG,
      uniforms: { uTime: { value: 0 }, uDrift: { value: 0 } },
      transparent: true,
      depthWrite: false,
    });
    const floor = new THREE.Mesh(geo, this.floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -6;
    this.group.add(floor);

    this.ceilMat = this.floorMat.clone();
    const ceil = new THREE.Mesh(geo.clone(), this.ceilMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 9;
    this.group.add(ceil);

    const monoGeo = new THREE.BoxGeometry(0.5, 4.5, 0.5);
    const monoMat = new THREE.MeshBasicMaterial({
      color: 0x38dbff,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const COUNT = 26;
    this.monoliths = new THREE.InstancedMesh(monoGeo, monoMat, COUNT);
    const m = new THREE.Matrix4();
    for (let i = 0; i < COUNT; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (7 + Math.random() * 22);
      const z = -10 - (i / COUNT) * 120;
      const s = 0.6 + Math.random() * 2.2;
      m.makeScale(1, s, 1);
      m.setPosition(x, -6 + (4.5 * s) / 2, z);
      this.monoliths.setMatrixAt(i, m);
    }
    this.monoliths.instanceMatrix.needsUpdate = true;
    this.group.add(this.monoliths);

    const starGeo = new THREE.BufferGeometry();
    const N = 350;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 160;
      pos[i * 3 + 1] = Math.random() * 26 - 8;
      pos[i * 3 + 2] = -Math.random() * 140;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.35,
      map: getGlowTexture(),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0x9ff1ff,
    });
    this.stars = new THREE.Points(starGeo, starMat);
    this.group.add(this.stars);

    this.glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: getGlowTexture(),
        color: 0x38dbff,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.glow.scale.setScalar(30);
    this.glow.position.set(0, 1, -90);
    this.group.add(this.glow);
  }

  setProgress(p: number): void {
    this.progress = p;
  }

  update(dt: number, elapsed: number): void {
    const drift = elapsed * 0.012 + this.progress * 0.35;
    this.floorMat.uniforms.uDrift.value = drift;
    this.ceilMat.uniforms.uDrift.value = drift * 0.7;
    const cam = this.engineRef.camera;
    cam.position.x += (this.engineRef.pointer.x * 1.1 - cam.position.x) * 0.03;
    cam.position.y += (this.engineRef.pointer.y * 0.6 - cam.position.y) * 0.03;
    cam.lookAt(0, 0.4, -60);
    this.stars.rotation.z = elapsed * 0.004;
    const g = this.glow.material as THREE.SpriteMaterial;
    g.opacity = 0.42 + Math.sin(elapsed * 0.8) * 0.08;
  }

  dispose(): void {
    this.group.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = (mesh as THREE.Mesh).material as THREE.Material | undefined;
      if (mat) mat.dispose();
    });
  }
}
