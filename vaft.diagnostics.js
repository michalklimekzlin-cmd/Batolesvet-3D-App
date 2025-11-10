// vaft.diagnostics.js
(function (window, document) {
  if (!window.VAFT) window.VAFT = {};
  if (!window.VAFT.bus) {
    // lehký bus fallback (pokud ještě není)
    const listeners = {};
    window.VAFT.bus = {
      on(ch, fn) { (listeners[ch] ||= []).push(fn); },
      emit(ch, data) { (listeners[ch] || []).forEach(f => { try { f(data); } catch(e){console.warn(e);} }); }
    };
  }
  const BUS = window.VAFT.bus;

  // bezpečné volání appendHlavounMsg - pokud není, fallback do console
  function safeAppend(role, text) {
    try {
      if (typeof window.appendHlavounMsg === 'function') {
        window.appendHlavounMsg(role, text);
      } else {
        console.log('[HLAVOUN Fallback]', role, text);
      }
    } catch (e) {
      console.warn('appendHlavounMsg error', e);
    }
  }

  // vytvoříme placeholder agenta pokud chybí (headless minimal)
  function createPlaceholderAgent(name) {
    window.VAFT.agents = window.VAFT.agents || {};
    if (window.VAFT.agents[name]) return window.VAFT.agents[name];
    // jednoduchý stub s think() a state
    const stub = {
      state: { name, memory: [], heart: 0, brain: 'placeholder' },
      think(msg) {
        // uložit do paměti a echo
        stub.state.memory.push({ ts: Date.now(), msg });
        localStorage.setItem(`VAFT_${name}_MEM`, JSON.stringify(stub.state.memory));
        // echo do bus
        BUS.emit('vaft.signal', { from: name, msg: { text: 'placeholder echo: '+(msg && msg.text) }});
      }
    };
    window.VAFT.agents[name] = stub;
    safeAppend('ai', `⚙️ Vytvořen placeholder pro ${name} (dočasné řešení).`);
    return stub;
  }

  // uloží diagnostiku
  function saveDiag(entry) {
    const key = 'VAFT_DIAG';
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    arr.push(entry);
    if (arr.length > 200) arr.shift();
    localStorage.setItem(key, JSON.stringify(arr));
  }

  // hlavní kontrola
  const REQUIRED = ['Hlavoun', 'Viri', 'Pikos'];
  let lastReport = 0;
  function checkAgents() {
    const now = Date.now();
    const present = [];
    const missing = [];

    window.VAFT.agents = window.VAFT.agents || {};
    REQUIRED.forEach(name => {
      if (window.VAFT.agents[name]) present.push(name);
      else missing.push(name);
    });

    // report do konzole + hlavoun chatu
    if (missing.length) {
      const msg = `⚠️ Chybějící agenty: ${missing.join(', ')}. Přítomní: ${present.join(', ') || 'žádný'}.`;
      safeAppend('ai', msg);
      saveDiag({ ts: now, type: 'missing', missing, present });
      BUS.emit('vaft.diagnostic', { level: 'warn', msg, missing, present, ts: now });

      // pokud chybí, vytvoříme placeholders (volitelné)
      missing.forEach(n => createPlaceholderAgent(n));
    } else {
      // občas napiš, že je vše OK
      if (now - lastReport > 30_000) { // každých 30s
        const okMsg = `✅ Agenti OK: ${present.join(', ')}.`;
        safeAppend('ai', okMsg);
        saveDiag({ ts: now, type: 'ok', present });
        BUS.emit('vaft.diagnostic', { level: 'info', msg: okMsg, present, ts: now });
        lastReport = now;
      }
    }

    // zkontroluj bus/heartbeat kanál jako extra
    // pokud existují heartbeat eventy, zaznamenáme je - neinvazivně
  }

  // spustíme jemný interval - každé 4s (nepřetíží iPhone)
  const INTERVAL = 4000;
  const handle = setInterval(checkAgents, INTERVAL);

  // expozice drobných util funkcí do VAFT.diagnostics
  window.VAFT.diagnostics = {
    checkNow: checkAgents,
    stop: () => clearInterval(handle),
    createPlaceholderAgent,
    readLog: () => JSON.parse(localStorage.getItem('VAFT_DIAG') || '[]'),
    clearLog: () => localStorage.removeItem('VAFT_DIAG')
  };

  // okamžitá jednorázová kontrola
  setTimeout(checkAgents, 500);
  console.log('[VAFT diagnostics] spuštěno, kontrola každých', INTERVAL, 'ms');
})(window, document);
