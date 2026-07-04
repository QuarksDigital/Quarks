"use client";

/** Read/write the global cursor variant via a DOM data attribute (zero re-renders). */
import type { CursorVariant } from "@/types";

export function setCursorVariant(v: CursorVariant, label?: string): void {
  if (typeof document === "undefined") return;
  document.body.dataset.cursorVariant = v;
  if (label !== undefined) document.body.dataset.cursorLabel = label;
  else delete document.body.dataset.cursorLabel;
}
