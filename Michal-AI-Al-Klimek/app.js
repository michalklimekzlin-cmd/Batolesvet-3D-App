document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "michal-ai-al-klimek-glyphs";

  // načti uložené glyphy
  let savedGlyphs = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) savedGlyphs = JSON.parse(raw);
  } catch (e) {
    console.warn("Nemůžu načíst uložené glyphy:", e);
  }

  // všechny sloty
  const slots = document.querySelectorAll(".glyph-slot");

  slots.forEach(slot => {
    const slotId = slot.dataset.slot;
    const textEl = slot.querySelector(".glyph-text");
    if (!slotId || !textEl) return;

    // předvyplnit z localStorage
    if (savedGlyphs[slotId]) {
      textEl.textContent = savedGlyphs[slotId];
    }

    // iPhone má rád blur / input
    const save = () => {
      const value = textEl.textContent.trim();
      savedGlyphs[slotId] = value;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedGlyphs));
    };

    textEl.addEventListener("blur", save);
    textEl.addEventListener("input", () => {
      // průběžné ukládání
      save();
    });

    // aby klepnutí na celý slot dalo focus dovnitř
    slot.addEventListener("click", () => {
      textEl.focus();
      // kurzor na konec
      const range = document.createRange();
      range.selectNodeContents(textEl);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    });
  });

  // tlačítko přeměny
  const transformBtn = document.getElementById("transformBtn");
  if (transformBtn) {
    transformBtn.addEventListener("click", () => {
      document.body.classList.toggle("alt-mode");
      transformBtn.classList.add("pressed");
      setTimeout(() => transformBtn.classList.remove("pressed"), 300);
    });
  }
});
