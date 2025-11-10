// vaft.network.core.js
// Inteligentní headless síť pro VAFT (napojí Hlavoun, Viri, Pikos, Vivere, ?)
// Vkládej až po vaft.bus.js a vaft.agents.js (ale můžeš načítat lazy)
(function (window, document) {
  if (!window) return;
  console.log('%c[VAFT.network.core] init', 'color:#7ec8ff');

  // --- BUS (nabízíme fallback pokud chybí) ---
  window.VAFT = window.VAFT || {};
  if (!window.VAFT.bus) {
    (function createFallbackBus() {
      const listeners = {};
      window.VAFT.bus = {
        on: (ch, fn) => ((listeners[ch] ||= []).push(fn)),
        emit: (ch, data) => ((listeners[ch] || []).forEach(f => { try { f(data); } catch(e){console.warn(e);} })),
        _listeners: listeners
      };
    })();
  }
  const BUS = window.VAFT.bus;

  // --- interní stav ---
  const CONFIG = {
    agents: ['Hlavoun', 'Viri', 'Pikos', 'Vivere', '?'],
    heartbeatBase: 4200,
    heartbeatJitter: 1500,
    reactionChance: 0.35,
    maxMemory: 200
  };
  const internal = {
    timers: [],
    started: false,
    createdAt: Date.now()
  };

  // --- util: safe append to hlavoun chat ---
  function safeAppendHlavoun(role, text) {
    try {
      if (typeof window.appendHlavounMsg === 'function') {
        window.appendHlavounMsg(role, text);
      } else {
        console.log('[HLAVOUN-FB]', role, text);
      }
    } catch (e) {
      console.warn('safeAppendHlavoun err', e);
    }
  }

  // --- util: diagnostic log to localStorage (light) ---
  function diagPush(obj) {
    try {
      const key = 'VAFT_DIAG';
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.push(Object.assign({ ts: Date.now() }, obj));
      if (arr.length > 400) arr.shift();
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) { /* ignore */ }
  }

  // --- create placeholder agent if missing ---
  function createPlaceholder(name) {
    window.VAFT.agents = window.VAFT.agents || {};
    if (window.VAFT.agents[name]) return window.VAFT.agents[name];

    const state = { name, brain: 'placeholder', memory: [], heart: 0, isPlaceholder: true };
    function think(msg) {
      try {
        state.brain = msg && (msg.text || msg.type) || 'signál';
        state.memory.push({ ts: Date.now(), msg });
        if (state.memory.length > CONFIG.maxMemory) state.memory.shift();
        localStorage.setItem('VAFT_' + name + '_MEM', JSON.stringify(state.memory));
        BUS.emit('vaft.signal', { from: name, msg: { text: 'placeholder echo: ' + (msg && msg.text) } });
      } catch (e) { console.warn('placeholder think err', e); }
    }

    const stub = { state, think, isPlaceholder: true };
    window.VAFT.agents[name] = stub;
    safeAppendHlavoun('ai', `⚙️ Placeholder vytvořen pro ${name}`);
    diagPush({ type: 'placeholder.created', name });
    BUS.emit('vaft.diagnostic', { level: 'warn', msg: `placeholder ${name} vytvořen` });
    return stub;
  }

  // --- ensure agents exist (wrap if needed) ---
  function ensureAgents() {
    window.VAFT.agents = window.VAFT.agents || {};
    CONFIG.agents.forEach(name => {
      if (!window.VAFT.agents[name]) {
        createPlaceholder(name);
      } else {
        // if agent present, ensure minimal API
        const a = window.VAFT.agents[name];
        if (typeof a.think !== 'function') {
          a.think = function (m) {
            (a.state ||= {}).brain = m && (m.text || m.type) || 'signal';
            a.state.memory = a.state.memory || [];
            a.state.memory.push({ ts: Date.now(), m });
            if (a.state.memory.length > CONFIG.maxMemory) a.state.memory.shift();
            localStorage.setItem('VAFT_' + name + '_MEM', JSON.stringify(a.state.memory));
          };
        }
      }
    });
  }

  // --- agent reaction: when vaft.signal happens, route to agents ---
  BUS.on('vaft.signal', (d) => {
    if (!d || !d.from) return;
    // broadcast: let agents maybe react
    CONFIG.agents.forEach(name => {
      if (d.from === name) return;
      const ag = window.VAFT.agents && window.VAFT.agents[name];
      if (!ag) return;
      // random small chance to react to reduce noise
      if (Math.random() < CONFIG.reactionChance) {
        try {
          ag.think({ text: `${d.from}→${name}`, origin: d });
        } catch (e) { console.warn('agent think err', name, e); }
      }
    });
  });

  // expose function to send a system-level signal (from code)
  function systemSignal(from, text, meta) {
    BUS.emit('vaft.signal', { from: from || 'System', text, meta });
  }

  // --- heartbeat per agent (motor) ---
  function startHeartbeats() {
    CONFIG.agents.forEach(name => {
      const ag = window.VAFT.agents && window.VAFT.agents[name];
      if (!ag) return;
      const interval = CONFIG.heartbeatBase + Math.random() * CONFIG.heartbeatJitter;
      const t = setInterval(() => {
        try {
          (ag.state ||= {}).heart = ((ag.state && ag.state.heart) || 0) + 1;
          BUS.emit('vaft.heartbeat', { from: name, beat: ag.state.heart, ts: Date.now() });
        } catch (e) { console.warn('heartbeat err', e); }
      }, interval);
      internal.timers.push(t);
    });
  }

  // --- diagnostics check (periodic) ---
  function checkAndReport() {
    const present = [], missing = [];
    window.VAFT.agents = window.VAFT.agents || {};
    CONFIG.agents.forEach(name => {
      if (window.VAFT.agents[name]) present.push(name); else missing.push(name);
    });
    if (missing.length) {
      const msg = `⚠️ Chybějící agenty: ${missing.join(', ')} (přítomní: ${present.join(', ') || 'žádný'})`;
      safeAppendHlavoun('ai', msg);
      BUS.emit('vaft.diagnostic', { level: 'warn', msg, missing, present, ts: Date.now() });
      diagPush({ type: 'missing', missing, present });
      // create placeholders automatically (option)
      missing.forEach(n => createPlaceholder(n));
    } else {
      BUS.emit('vaft.diagnostic', { level: 'info', msg: `Agenti OK: ${present.join(', ')}`, ts: Date.now() });
    }
  }

  // --- startup / stop functions ---
  function startNetwork(opts) {
    if (internal.started) return internal;
    internal.started = true;
    ensureAgents();
    startHeartbeats();
    checkAndReport();
    // small intro signal
    setTimeout(() => systemSignal('Vivere', 'Síť spuštěna (core)'), 600);
    // periodic diagnostics (every 6s)
    const d = setInterval(checkAndReport, 6000);
    internal.timers.push(d);
    diagPush({ type: 'network.started', ts: Date.now(), opts: opts || {} });
    safeAppendHlavoun('ai', '🔌 VAFT síť spuštěna (core)');
    return internal;
  }

  function stopNetwork() {
    internal.timers.forEach(t => clearInterval(t));
    internal.timers = [];
    internal.started = false;
    diagPush({ type: 'network.stopped', ts: Date.now() });
    safeAppendHlavoun('ai', '⏹️ VAFT síť zastavena');
  }

  function status() {
    return {
      started: internal.started,
      createdAt: internal.createdAt,
      agents: Object.keys(window.VAFT.agents || {}),
      timersCount: internal.timers.length
    };
  }

  // --- try to integrate with existing agents by wiring a small hook: when agent emits via BUS, forward to agent.think ---
  // we provide helper so other scripts can call VAFT.network.sendTo(name,msg)
  function sendToAgent(name, msg) {
    const ag = window.VAFT.agents && window.VAFT.agents[name];
    if (!ag) {
      createPlaceholder(name);
    }
    try {
      window.VAFT.agents[name].think(msg);
    } catch (e) {
      console.warn('sendToAgent err', e);
    }
  }

  // expose API
  window.VAFT.network = {
    start: startNetwork,
    stop: stopNetwork,
    status,
    sendToAgent,
    createPlaceholder,
    config: CONFIG
  };

  // Auto-start policy: detect device and behave safely
  (function autoStartPolicy() {
    const ua = (navigator.userAgent || '').toLowerCase();
    const isIPhone = /iphone/.test(ua);
    const isIPad = /ipad|macintosh/.test(ua) && /mobile/.test(ua) === false ? false : /ipad/.test(ua);
    // if iPhone -> do NOT autostart heavy; start core (headless) but slowly
    if (isIPhone) {
      // minimal safe start after short delay
      setTimeout(() => { startNetwork({ mode: 'headless-auto' }); }, 900);
    } else {
      // other devices start normally
      setTimeout(() => { startNetwork({ mode: 'auto' }); }, 200);
    }
  })();

  // debug hooks
  BUS.on('vaft.diagnostic.request', () => {
    BUS.emit('vaft.diagnostic', { level: 'info', msg: 'diagnostic dump', ts: Date.now(), status: status() });
  });

  console.log('%c[VAFT.network.core] ready', 'color:#9fff84');

})(window, document);
