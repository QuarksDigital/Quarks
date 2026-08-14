/**
 * Word-mask splitter for [data-split] headings.
 *
 * Each word is wrapped in an overflow-hidden box so it can ride up from below
 * the baseline without bleeding into its neighbours. Idempotent - re-running
 * after a resize or a re-render leaves already-split nodes alone.
 */
export function splitWords(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
    if (el.dataset.splitDone) return;

    const words = (el.textContent || "").trim().split(/\s+/);
    el.textContent = "";

    words.forEach((word, i) => {
      const wrap = document.createElement("span");
      wrap.className = "q-word-wrap";
      const inner = document.createElement("span");
      inner.className = "q-word";
      inner.textContent = word;
      wrap.appendChild(inner);
      el.appendChild(wrap);
      // Real space nodes keep the heading selectable and copy-pasteable.
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });

    el.dataset.splitDone = "1";
  });
}
