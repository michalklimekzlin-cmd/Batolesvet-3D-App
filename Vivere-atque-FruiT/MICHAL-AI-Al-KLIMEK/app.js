// MICHAL-AI-AI-KLIMEK / app.js
document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "michal-ai-ai-klimek-glyphs";

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

  // naplň sloty z uložených dat + umožni přepis
  slots.forEach(slot => {
    const slotId = slot.dataset.slot;
    const span = slot.querySelector(".glyph-text");
    if (!span || !slotId) return;

    // pokud něco je uložené, zobraz to
    if (savedGlyphs[slotId]) {
      span.textContent = savedGlyphs[slotId];
    }

    // kliknutím přepíšu glyph
    slot.addEventListener("click", () => {
      const current = savedGlyphs[slotId] || "";
      const value = prompt("Zadej glyph / znak / kód:", current);
      if (value === null) return;
      savedGlyphs[slotId] = value;
      span.textContent = value;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedGlyphs));
    });
  });

  // dýchání středu
  const center =
    document.querySelector(".center-character") ||
    document.querySelector(".vaft-name");

  if (center) {
    let scale = 1;
    let direction = 1;
    setInterval(() => {
      scale += direction * 0.005;
      if (scale > 1.05 || scale < 0.95) direction *= -1;
      center.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }, 50);
  }

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
