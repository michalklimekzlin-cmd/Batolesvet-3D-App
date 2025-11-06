// počkáme, až je DOM
document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('.revia-main');
  const slot1 = document.getElementById('slot1');
  const slot1Glyph = document.getElementById('slot1Glyph');
  const toggleBtn = document.getElementById('revToggle');
  const notesBtn = document.getElementById('revWing');
  const notesPanel = document.getElementById('revNotes');
  const notesClose = document.getElementById('notesClose');
  const notesText = document.getElementById('notesText');
  const toast = document.getElementById('revToast');

  const GLYPH_ANGEL = 'Ī’𞋒';
  const GLYPH_DAEMON = 'Ī’☆';

  // 1) připoj se na VAFT
  if (window.VAFT) {
    // reaguj na změny zvenku
    VAFT.subscribe((state) => {
      // přepni pozadí
      root.dataset.mode = state.reviaMode || 'angel';
      // přepni glyph
      slot1Glyph.textContent = state.reviaMode === 'daemon' ? GLYPH_DAEMON : GLYPH_ANGEL;
      // nahraj případný zápis pro revii
      if (state.notes && state.notes.revia) {
        notesText.value = state.notes.revia;
      }
    });
  }

  // 2) lokální přepínač
  function toggleRevia() {
    const isDaemon = root.dataset.mode === 'daemon';
    const nextMode = isDaemon ? 'angel' : 'daemon';
    root.dataset.mode = nextMode;
    slot1Glyph.textContent = nextMode === 'daemon' ? GLYPH_DAEMON : GLYPH_ANGEL;

    // zapiš do centra
    if (window.VAFT) {
      VAFT.setReviaMode(nextMode, 'revia');
    }

    showToast(`Revia: ${nextMode === 'daemon' ? 'Ďábel' : 'Anděl'}`);
  }

  toggleBtn?.addEventListener('click', toggleRevia);
  slot1?.addEventListener('click', toggleRevia);

  // 3) zápisník
  notesBtn?.addEventListener('click', () => {
    notesPanel.classList.add('show');
  });
  notesClose?.addEventListener('click', () => {
    notesPanel.classList.remove('show');
  });
  notesText?.addEventListener('input', () => {
    if (window.VAFT) {
      const state = VAFT.load();
      VAFT.save({
        notes: {
          ...state.notes,
          revia: notesText.value
        },
        lastSender: 'revia'
      });
    } else {
      localStorage.setItem('reviaNotes', notesText.value);
    }
  });

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
});
