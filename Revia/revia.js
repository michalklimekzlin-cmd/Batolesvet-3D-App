// Revia – logika přepínání
(function() {
  const root = document.querySelector('.revia-main');
  const glyph = document.getElementById('revia-glyph');
  const mini = document.getElementById('reviaMini');
  const toggleBtn = document.getElementById('reviaToggle');
  const helpBtn = document.getElementById('reviaHelp');

  // glyphy
  const MODES = {
    angel: "「Ī’♡",
    daemon: "「Ī’☆"
  };

  // načíst poslední stav
  let current = localStorage.getItem('revia_mode') || 'angel';
  applyMode(current);

  // přepínač
  toggleBtn.addEventListener('click', () => {
    current = current === 'angel' ? 'daemon' : 'angel';
    applyMode(current);
    localStorage.setItem('revia_mode', current);
  });

  // help – jen ukážeme hlášku do konzole, později toast
  helpBtn.addEventListener('click', () => {
    console.log('Revia: tady bude později AI odpověď / toast.');
  });

  function applyMode(mode) {
    if (!root) return;
    root.setAttribute('data-mode', mode);
    if (glyph) glyph.textContent = MODES[mode] || "「Ī’♡";
    if (mini) mini.textContent = MODES[mode] || "「Ī’♡";
  }
})();
