/* Chybožrout-Opravář 2.0 — multi-scan + legacy napojení + OPRAVY (fix preview) */
(function () {
  const $ = (s) => document.querySelector(s);

  const scanBtn = $('#scanBtn');
  const resultsEl = $('#results');
  const logEl = $('#log');
  const probe = $('#probe');
  const exportBtn = $('#exportBtn');
  const clearBtn = $('#clearBtn');
  const toggleLogBtn = $('#toggleLog');
  const targetInput = $('#targetUrl');
  const installBtn = $('#installBtn');

  // --- PWA instalace
  let deferredPrompt, showLog = true;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e; installBtn.disabled = false;
  });
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null;
  });

  // --- připojení původního Chybožrouta z hlavní appky
  (function importLegacy() {
    const s = document.createElement('script');
    s.src = '../vaft.chybozrout.js?v=live';
    s.onload = () => console.log('[Chybožrout] původní jádro připojeno');
    s.onerror = () => console.warn('[Chybožrout] nepodařilo se načíst ../vaft.chybozrout.js');
    document.head.appendChild(s);
  })();

  // --- stav
  const state = {
    queue: [],
    current: null,
    issuesByPath: {},
    logsByPath: {},
    allIssues: [],
    allLogs: [],
  };

  // --- pomocné funkce
  function parsePaths(input) {
    const raw = input.split(',').map(s => s.trim()).filter(Boolean);
    const list = raw.length ? raw : ['/'];
    return list.map(p => new URL(p, location.href).href);
  }
  function addIssue(path, type, msg) {
    const item = { t: Date.now(), type, msg, path };
    (state.issuesByPath[path] ||= []).push(item);
    state.allIssues.push(item);
    renderIssues();
  }
  function addLog(path, kind, msg) {
    const line = `[${new Date().toLocaleTimeString()}] ${kind.toUpperCase()} ${msg}`;
    (state.logsByPath[path] ||= []).push(line);
    state.allLogs.push({ path, line });
    if (showLog) { logEl.textContent += `[${path}] ${line}\n`; logEl.scrollTop = logEl.scrollHeight; }
  }
  function renderIssues() {
    if (!state.allIssues.length) { resultsEl.innerHTML = '<div class="muted">Žádné problémy nenalezeny ✅</div>'; return; }
    const blocks = Object.entries(state.issuesByPath).map(([path, list]) => {
      const items = list.map(i => {
        const c = i.type === 'error' ? '#ff6a6a' : i.type === 'warn' ? '#ffc46a' : '#9fe29f';
        return `<div class="issue"><span class="dot" style="background:${c}"></span><b>${i.type.toUpperCase()}</b> — ${i.msg}</div>`;
      }).join('');
      return `
        <div class="card" style="margin-top:8px">
          <h4 style="margin:0 0 6px">${path}</h4>
          ${items || '<div class="muted">Bez problémů</div>'}
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
            <button class="btn" data-fix="${path}">🛠️ Vytvořit FIX náhled</button>
            <button class="btn" data-copysw="${path}">📋 Kopírovat SW blok</button>
            <button class="btn" data-copycalm="${path}">📋 Kopírovat CalmPulse</button>
          </div>
        </div>`;
    }).join('');
    resultsEl.innerHTML = blocks;

    // navázat akce na tlačítka
    resultsEl.querySelectorAll('[data-fix]').forEach(b => b.addEventListener('click', () => generateFix(b.getAttribute('data-fix'))));
    resultsEl.querySelectorAll('[data-copysw]').forEach(b => b.addEventListener('click', copySW));
    resultsEl.querySelectorAll('[data-copycalm]').forEach(b => b.addEventListener('click', copyCalm));
  }
  function reset() {
    state.queue = []; state.current = null;
    state.issuesByPath = {}; state.logsByPath = {};
    state.allIssues = []; state.allLogs = [];
    resultsEl.innerHTML = 'Připravuji sken…'; logEl.textContent = '';
  }

  // --- hook konzole cílového okna
  function hookConsole(win, path) {
    if (!win || !win.console) return;
    try {
      const orig = { log: win.console.log, warn: win.console.warn, error: win.console.error };
      win.console.log  = (...a)=>{ addLog(path,'log',  a.join(' ')); orig.log.apply(win.console,a); };
      win.console.warn = (...a)=>{ addLog(path,'warn', a.join(' ')); orig.warn.apply(win.console,a); };
      win.console.error= (...a)=>{ addLog(path,'error',a.join(' ')); orig.error.apply(win.console,a); };
      win.addEventListener('error', e => addLog(path,'error', `${e.message} @${e.filename}:${e.lineno}`));
      win.addEventListener('unhandledrejection', e => addLog(path,'error', 'Promise: '+(e.reason && e.reason.message || String(e.reason))));
    } catch {}
  }

  // --- strukturální audit
  function structuralScan(win, path) {
    try {
      const doc = win.document;
      const html = doc.documentElement.outerHTML || '';
      const scripts = Array.from(doc.querySelectorAll('script')).map(s => s.textContent || '');

      const swCount = scripts.filter(t => /navigator\.serviceWorker\.register\(/.test(t)).length;
      if (swCount > 1) addIssue(path,'error',`Vícenásobná registrace Service Workeru: ${swCount}× (ponech jednu).`);
      else if (swCount === 1) addIssue(path,'info','Service Worker registrace: 1× (OK).');
      else addIssue(path,'warn','Service Worker neregistrován.');

      const tabDefs = scripts.filter(t => /function\s+vaftSwitchPanel\s*\(/.test(t)).length;
      if (tabDefs > 1) addIssue(path,'warn',`Duplicitní vaftSwitchPanel: ${tabDefs}× (ponech jednu).`);

      const coreDefs = scripts.filter(t => /VAFT_CORE/.test(t)).length;
      if (coreDefs > 1) addIssue(path,'warn',`VAFT_CORE definován ${coreDefs}× (ponech jeden).`);

      const opens = (html.match(/<script\b/gi) || []).length;
      const closes = (html.match(/<\/script>/gi) || []).length;
      if (opens !== closes) addIssue(path,'error',`Nesouhlasí počet <script> (${opens}) a </script> (${closes}).`);
      if (html.includes('<script><script>')) addIssue(path,'error','Vnořený <script> nalezen – oprav uzavírání bloků.');

      const intervals = scripts.reduce((n,t)=> n + (t.match(/setInterval\s*\(/g)||[]).length, 0);
      if (intervals > 2) addIssue(path,'warn',`Hodně setInterval(): ${intervals}× – zvaž CalmPulse.`);
      if (scripts.some(t => /function\s+tick\s*\(/.test(t))) addIssue(path,'info','Nalezen tick() – preferuj rAF orchestrace.');

      const hudHints = scripts.filter(t => /#vaft-hud|status orchestr|beings/.test(t)).length;
      if (hudHints > 1) addIssue(path,'warn','Více HUD implementací – sjednoť na jednu.');

      const tail = html.split('</html>')[1];
      if (tail && tail.trim().length) addIssue(path,'error','Obsah/skripty za </html> – odstraň vše po uzavření dokumentu.');
    } catch (e) {
      addIssue(path,'error','Sken se nepovedl: '+(e.message || e));
    }
  }

  // --- legacy scan (pokud je ve stránce tvůj původní VAFT_CHYBOZROUT)
  async function legacyScan(win, path) {
    try {
      if (win.VAFT_CHYBOZROUT && typeof win.VAFT_CHYBOZROUT.scan === 'function') {
        const res = await Promise.resolve(win.VAFT_CHYBOZROUT.scan());
        if (Array.isArray(res)) res.forEach(r => addIssue(path, (r.type || 'info'), r.msg || JSON.stringify(r)));
      }
    } catch (e) {
      addIssue(path,'warn','Legacy scan selhal: '+(e.message || e));
    }
  }

  // --- zpracování fronty
  function nextInQueue() {
    if (!state.queue.length) { addLog('SUM','log','Sken dokončen'); renderIssues(); return; }
    const path = state.queue.shift();
    state.current = path;
    try { probe.src = path; } catch { addIssue(path,'error','Neplatná adresa'); nextInQueue(); }
  }

  probe.addEventListener('load', () => {
    const path = state.current;
    const win = probe.contentWindow;
    try { void win.document.title; } catch { addIssue(path,'error','Jiný původ (doména) – nelze skenovat.'); return nextInQueue(); }
    addLog(path,'log','Načteno: ' + win.location.href);
    hookConsole(win, path);
    structuralScan(win, path);
    legacyScan(win, path).finally(() => setTimeout(nextInQueue, 300));
  });

  // --- ovládání
  scanBtn.addEventListener('click', () => {
    reset();
    const paths = parsePaths(targetInput.value.trim());
    const origin = location.origin;
    if (paths.some(u => new URL(u).origin !== origin)) {
      resultsEl.innerHTML = `<div class="issue"><span class="dot" style="background:#f55"></span><b>ERROR</b> — Některá cesta není na stejném původu (${origin})</div>`;
      return;
    }
    state.queue = paths;
    resultsEl.innerHTML = 'Skenuji…';
    nextInQueue();
  });

  exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({
      generatedAt: new Date().toISOString(),
      issuesByPath: state.issuesByPath,
      logsByPath: state.logsByPath
    }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vaft-chybozrout-report.json';
    a.click();
  });

  clearBtn.addEventListener('click', () => { reset(); resultsEl.innerHTML = 'Vyčištěno'; });
  toggleLogBtn.addEventListener('click', () => {
    showLog = !showLog;
    if (showLog) {
      logEl.textContent = '';
      for (const [path, lines] of Object.entries(state.logsByPath))
        lines.forEach(line => logEl.textContent += `[${path}] ${line}\n`);
      logEl.scrollTop = logEl.scrollHeight;
    }
  });

  // --- „OPRAVY“: generátor fix náhledu pro konkrétní cestu -----------------
  async function generateFix(pathHref) {
    try {
      // pokud je to adresář typu .../Revia/ → načti index.html
      const u = new URL(pathHref);
      const htmlUrl = u.pathname.endsWith('/') ? (u.pathname + 'index.html') : u.pathname;
      const abs = new URL(htmlUrl, location.origin).href;

      const res = await fetch(abs, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('Nelze stáhnout ' + abs);
      let html = await res.text();

      const report = [];

      // 1) Odstřihni vše za </html>
      const split = html.split('</html>');
      if (split[1] && split[1].trim().length) {
        html = split[0] + '</html>';
        report.push('✂️ Odstraněn obsah za </html>.');
      }

      // 2) Sjednoť Service Worker: odstraň všechny bloky s registrací a vlož náš čistý
      const SW_SNIPPET =
`<script>
if ('serviceWorker' in navigator) {
  let alreadyRefreshed = false;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js?v=4').then(reg => {
      console.log('[SW] registrován');
      reg.addEventListener('updatefound', () => {
        const w = reg.installing; if (!w) return;
        w.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller && !alreadyRefreshed) {
            alreadyRefreshed = true;
            console.log('[SW] nová verze, reload za 1s');
            setTimeout(()=>location.reload(), 1000);
          }
        });
      });
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }).catch(err => console.warn('[SW] chyba registrace', err));
  });
}
</script>`;

      const beforeSW = html;
      // odstranit všechny <script> bloky, které obsahují navigator.serviceWorker.register(
      html = html.replace(/<script\b[^>]*>[\s\S]*?navigator\.serviceWorker\.register\([\s\S]*?<\/script>/gi, '');
      if (html !== beforeSW) report.push('🔁 Konsolidován Service Worker na 1 blok.');

      // vložit náš SW blok před </body> nebo na konec před </html>
      if (/<\/body>/i.test(html)) {
        html = html.replace(/<\/body>/i, `${SW_SNIPPET}\n</body>`);
      } else {
        html = html.replace(/<\/html>/i, `${SW_SNIPPET}\n</html>`);
      }

      // 3) (Nepokouším se automaticky mazat duplicitní vaftSwitchPanel/VAFT_CORE — rizikové)
      //    Jen přidáme info do reportu. Samotné nálezy už máš z auditu.
      report.push('ℹ️ Ostatní nálezy (duplicitní funkce/VAFT_CORE, neuzavřené <script>) zkontroluj ručně dle auditu.');

      // výstupní soubor
      const outName = (u.pathname.replace(/\/+$/, '') || '/').split('/').filter(Boolean).pop() || 'index';
      const fileName = outName + '.fixed.html';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      a.download = fileName;
      a.click();

      alert('Fix náhled vygenerován:\n- ' + report.join('\n- ') + '\nSoubor: ' + fileName);
    } catch (e) {
      alert('FIX se nepovedl: ' + (e.message || e));
    }
  }

  // --- rychlé kopírování snippetů -----------------------------------------
  function copy(text) {
    navigator.clipboard && navigator.clipboard.writeText(text).then(()=>alert('Zkopírováno do schránky.'));
  }
  function copySW() {
    copy(
`if ('serviceWorker' in navigator) {
  let alreadyRefreshed = false;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js?v=4').then(reg => {
      console.log('[SW] registrován');
      reg.addEventListener('updatefound', () => {
        const w = reg.installing; if (!w) return;
        w.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller && !alreadyRefreshed) {
            alreadyRefreshed = true;
            console.log('[SW] nová verze, reload za 1s');
            setTimeout(()=>location.reload(), 1000);
          }
        });
      });
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }).catch(err => console.warn('[SW] chyba registrace', err));
  });
}`
    );
  }
  function copyCalm() {
    copy(
`document.addEventListener('DOMContentLoaded', ()=>{
  function tick(){
    const el = document.getElementById('pulseTime');
    if (el) el.textContent = new Date().toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  }
  (function calmPulse(){
    tick();
    requestAnimationFrame(()=> setTimeout(calmPulse, 1000));
  })();
});`
    );
  }

  // --- delegáty
  resultsEl.addEventListener('click', (e) => {
    const t = e.target;
    if (t.matches('[data-copysw]')) copySW();
    if (t.matches('[data-copycalm]')) copyCalm();
  });

  // --- ovládání
  scanBtn.addEventListener('click', () => {
    reset();
    const paths = parsePaths(targetInput.value.trim());
    const origin = location.origin;
    if (paths.some(u => new URL(u).origin !== origin)) {
      resultsEl.innerHTML = `<div class="issue"><span class="dot" style="background:#f55"></span><b>ERROR</b> — Některá cesta není na stejném původu (${origin})</div>`;
      return;
    }
    state.queue = paths;
    resultsEl.innerHTML = 'Skenuji…';
    nextInQueue();
  });

  exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({
      generatedAt: new Date().toISOString(),
      issuesByPath: state.issuesByPath,
      logsByPath: state.logsByPath
    }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vaft-chybozrout-report.json';
    a.click();
  });

  clearBtn.addEventListener('click', () => { reset(); resultsEl.innerHTML = 'Vyčištěno'; });
  toggleLogBtn.addEventListener('click', () => {
    showLog = !showLog;
    if (showLog) {
      logEl.textContent = '';
      for (const [path, lines] of Object.entries(state.logsByPath))
        lines.forEach(line => logEl.textContent += `[${path}] ${line}\n`);
      logEl.scrollTop = logEl.scrollHeight;
    }
  });

  // --- service worker pro Chybožrouta
  if ('serviceWorker' in navigator)
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));

  // --- fronta loaderu (nakonec kvůli přehlednosti)
  function nextInQueue() {
    if (!state.queue.length) { addLog('SUM','log','Sken dokončen'); renderIssues(); return; }
    const path = state.queue.shift();
    state.current = path;
    try { probe.src = path; } catch { addIssue(path,'error','Neplatná adresa'); nextInQueue(); }
  }
})();
