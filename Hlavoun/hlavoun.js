// jednoduchý kanál – jestli máš vaft-core, můžeš to pak napojit
const consoleEl = document.getElementById('hlavounConsole');
const inputEl = document.getElementById('hlavounCmd');
const runBtn = document.getElementById('hlavounRun');
const gridEl = document.getElementById('hlavounGrid');
const modeBtn = document.getElementById('hlavounMode');
const noteBtn = document.getElementById('hlavounNote');

// 1) vygeneruj 89 buněk
const CELL_COUNT = 89;
const cells = [];
for (let i = 0; i < CELL_COUNT; i++) {
  const c = document.createElement('div');
  c.className = 'hlavoun-cell';
  gridEl.appendChild(c);
  cells.push(c);
}

// helper: přidej řádek do konzole
function pushLine(txt, kind = 'sys') {
  const p = document.createElement('p');
  p.innerHTML = `<b>[${kind}]</b> ${txt}`;
  consoleEl.appendChild(p);
  consoleEl.scrollTop = consoleEl.scrollHeight;
  pulseGrid();
}

// 2) náhodné blikání buněk, aby to žilo
function randomBlink() {
  const idx = Math.floor(Math.random() * cells.length);
  const cell = cells[idx];
  cell.classList.add('on');
  setTimeout(() => cell.classList.remove('on'), 500 + Math.random() * 900);
  // opakuj
  setTimeout(randomBlink, 180 + Math.random() * 320);
}
randomBlink();

// 3) pulz celé sítě při nové zprávě
function pulseGrid() {
  // rozsvítíme několik za sebou
  let hops = 8;
  const used = new Set();
  function hop() {
    if (hops-- <= 0) return;
    let idx = Math.floor(Math.random() * cells.length);
    // aby se neopakovalo moc stejné
    if (used.has(idx)) {
      hop();
      return;
    }
    used.add(idx);
    cells[idx].classList.add('on');
    setTimeout(() => cells[idx].classList.remove('on'), 600);
    setTimeout(hop, 60);
  }
  hop();
}

// 4) odesílání příkazů
function handleCmd() {
  const v = inputEl.value.trim();
  if (!v) return;
  pushLine(v, 'you');
  inputEl.value = '';

  // malá pseudo-reakce
  setTimeout(() => {
    if (v.toLowerCase().includes('revia')) {
      pushLine('Potvrzuji link s Revií. Přepínám stav.', 'hlavoun');
    } else if (v.toLowerCase().includes('křídlo')) {
      pushLine('Záznam do křídla je lokální – použij zápis v Revii.', 'hlavoun');
    } else {
      pushLine('Rozumím. Zapisuje se do mentální mapy.', 'hlavoun');
    }
  }, 280);
}

runBtn.addEventListener('click', handleCmd);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleCmd();
});

// 5) tlačítka dole – zatím jen hláška
modeBtn.addEventListener('click', () => {
  pushLine('Předávám Revii požadavek na přepnutí angel/daemon.', 'hlavoun');
});

noteBtn.addEventListener('click', () => {
  pushLine('Poznámka: křídlo je dostupné v modulární Revii.', 'hlavoun');
});
