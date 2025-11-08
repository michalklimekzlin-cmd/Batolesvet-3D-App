document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "michal-ai-al-klimek-glyphs";

  // naše dva výchozí emoty
  const GOOD_GLYPH = "'Īง";
  const BAD_GLYPH = "(ؔ•۵•ؔ)ؤ";

  // načti uložené glyphy
  let savedGlyphs = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) savedGlyphs = JSON.parse(raw);
  } catch (e) {
    console.warn("Nemůžu načíst uložené glyphy:", e);
  }

  const slots = document.querySelectorAll(".glyph-slot");

  slots.forEach(slot => {
    const slotId = slot.dataset.slot;
    const textEl = slot.querySelector(".glyph-text");
    if (!slotId || !textEl) return;

    // 🔸 speciální případ: horní přepínací
    if (slotId === "left-1") {
      // podívej se, co bylo uložené
      const current = savedGlyphs[slotId] || GOOD_GLYPH;
      textEl.textContent = current;

      // kliknutím přepínáme hodný/zlý
      slot.addEventListener("click", () => {
        const now = textEl.textContent.trim();
        const next = now === GOOD_GLYPH ? BAD_GLYPH : GOOD_GLYPH;
        textEl.textContent = next;
        savedGlyphs[slotId] = next;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedGlyphs));
      });

      return; // dál nepokračujeme, tenhle slot není editovatelný
    }

    // 🔸 ostatní sloty jsou dopisovací
    if (savedGlyphs[slotId]) {
      textEl.textContent = savedGlyphs[slotId];
    }

    const save = () => {
      const value = textEl.textContent.trim();
      savedGlyphs[slotId] = value;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedGlyphs));
    };

    textEl.addEventListener("blur", save);
    textEl.addEventListener("input", save);

    // aby šlo ťuknout na celý čtvereček
    slot.addEventListener("click", () => {
      textEl.focus();
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
