console.log('[Chybožrout-Opravář v2.1] start');

const logBox = document.getElementById('scanLog');
const btn = document.getElementById('scanBtn');

function log(msg) {
  const line = document.createElement('div');
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logBox.appendChild(line);
  logBox.scrollTop = logBox.scrollHeight;
}

btn.addEventListener('click', async () => {
  log('Spouštím skenování souborů Vivere atque FruiT…');
  const results = await window.RepairNet.scan();
  results.forEach(r => log(r));
  log('Skenování dokončeno ✅');
});
