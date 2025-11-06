// Revia – logika
(function () {
  const root = document.querySelector('.revia-main');
  const toggleBtn = document.getElementById('reviaToggle');
  const slot1 = document.getElementById('reviaSlot1');
  const glyphSpan = document.getElementById('reviaGlyph');

  // tvoje dva přesné glyphy
  const GLYPHS = ["「Ī’𞋒", "「Ī’☆"];
  let glyphIndex = 0;

  // funkce na nastavení módu podle glyphu
  function applyModeFromGlyph(index) {
    if (!root) return;
    // 0 = hodný → anděl, 1 = hvězda → démon
    const mode = index === 0 ? 'angel' : 'daemon';
    root.setAttribute('data-mode', mode);
  }

  // klik na první slot -> přepni glyph + pozadí
  if (slot1 && glyphSpan) {
    slot1.addEventListener('click', () => {
      glyphIndex = (glyphIndex + 1) % GLYPHS.length;
      glyphSpan.textContent = GLYPHS[glyphIndex];
      applyModeFromGlyph(glyphIndex);
    });
  }

  // tlačítko dole – ruční přepnutí
  if (toggleBtn && root) {
    toggleBtn.addEventListener('click', () => {
      const current = root.getAttribute('data-mode') || 'angel';
      const next = current === 'angel' ? 'daemon' : 'angel';
      root.setAttribute('data-mode', next);

      // když uživatel přepne ručně, taky sladíme glyph
      if (next === 'angel') {
        glyphIndex = 0;
      } else {
        glyphIndex = 1;
      }
      glyphSpan.textContent = GLYPHS[glyphIndex];
    });
  }

  // inicializace – držíme to v anděl módu
  applyModeFromGlyph(glyphIndex);
})();
