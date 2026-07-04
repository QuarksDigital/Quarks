/** Cursor-reactive lighting for .glass-lit panels via --mx/--my CSS vars (Bible §4.3). */
import { isTouchDevice } from "@/utils/dom";

export function attachPanelLighting(root: HTMLElement | Document = document): () => void {
  if (isTouchDevice()) return () => {};
  const panels = Array.from(root.querySelectorAll<HTMLElement>(".glass-lit"));
  let raf = 0;

  const onMove = (e: PointerEvent) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      panels.forEach((p) => {
        const r = p.getBoundingClientRect();
        const inside =
          e.clientX > r.left - 200 &&
          e.clientX < r.right + 200 &&
          e.clientY > r.top - 200 &&
          e.clientY < r.bottom + 200;
        p.style.setProperty("--lit", inside ? "1" : "0");
        if (inside) {
          p.style.setProperty("--mx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
          p.style.setProperty("--my", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
        }
      });
    });
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  return () => {
    window.removeEventListener("pointermove", onMove);
    if (raf) cancelAnimationFrame(raf);
  };
}
