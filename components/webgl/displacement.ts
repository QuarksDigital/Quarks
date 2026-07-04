/**
 * S4 case visuals — WebGL displacement planes synced to DOM rects.
 * Cursor velocity ripples the image; spring-decays to rest (Bible §5.2).
 */
import * as THREE from "three";
import { Engine, SceneModule } from "./engine";

const FRAG = `
uniform sampler2D uMap;
uniform vec2 uMouse;
uniform float uStrength;
uniform float uScale;
varying vec2 vUv;
void main() {
  vec2 uv = (vUv - 0.5) / uScale + 0.5;
  float d = distance(vUv, uMouse);
  float ripple = smoothstep(0.35, 0.0, d) * uStrength;
  vec2 dir = normalize(vUv - uMouse + 0.0001);
  uv += dir * ripple * 0.06;
  vec4 tex = texture2D(uMap, uv);
  vec3 duo = mix(vec3(0.016, 0.016, 0.04), vec3(0.22, 0.86, 1.0), dot(tex.rgb, vec3(0.299, 0.587, 0.114)));
  gl_FragColor = vec4(mix(tex.rgb, duo, 0.35), 1.0);
}
`;

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

interface Plane {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  el: HTMLElement;
  strength: number;
}

export class Displacement implements SceneModule {
  id = "displacement";
  group = new THREE.Group();
  private planes = new Map<string, Plane>();
  private engineRef!: Engine;
  private loader = new THREE.TextureLoader();

  init(engine: Engine): void {
    this.engineRef = engine;
  }

  /** world units per CSS pixel at z=0 for a camera at z=10, fov 50 */
  private unitsPerPx(): number {
    const worldH = 2 * 10 * Math.tan((this.engineRef.camera.fov * Math.PI) / 360);
    return worldH / window.innerHeight;
  }

  attach(key: string, el: HTMLElement, src: string): void {
    if (this.planes.has(key)) return;
    const tex = this.loader.load(src);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uMap: { value: tex },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uStrength: { value: 0 },
        uScale: { value: 1.06 },
      },
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    this.group.add(mesh);
    this.planes.set(key, { mesh, el, strength: 0 });

    el.addEventListener("pointermove", (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const p = this.planes.get(key);
      if (!p) return;
      p.mesh.material.uniforms.uMouse.value.set(
        (e.clientX - r.left) / r.width,
        1 - (e.clientY - r.top) / r.height,
      );
      p.strength = Math.min(
        p.strength + Math.hypot(e.movementX, e.movementY) * 0.012,
        1.6,
      );
    });
  }

  setScale(key: string, s: number): void {
    const p = this.planes.get(key);
    if (p) p.mesh.material.uniforms.uScale.value = s;
  }

  setProgress(): void {}

  update(dt: number): void {
    const upp = this.unitsPerPx();
    this.planes.forEach((p) => {
      const r = p.el.getBoundingClientRect();
      const visible = r.bottom > 0 && r.top < window.innerHeight;
      p.mesh.visible = visible;
      if (!visible) return;
      const cx = r.left + r.width / 2 - window.innerWidth / 2;
      const cy = -(r.top + r.height / 2 - window.innerHeight / 2);
      p.mesh.position.set(cx * upp, cy * upp, 0);
      p.mesh.scale.set(r.width * upp, r.height * upp, 1);
      p.strength *= Math.pow(0.9, dt * 60);
      p.mesh.material.uniforms.uStrength.value = p.strength;
    });
  }

  dispose(): void {
    this.planes.forEach((p) => {
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
    });
    this.planes.clear();
  }
}
