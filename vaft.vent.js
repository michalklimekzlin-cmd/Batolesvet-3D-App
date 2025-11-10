// vaft.vent.js — Ventil / Event hub UI for VAFT
(function(window, document){
  if (!window) window = {};
  window.VAFT = window.VAFT || {};
  const BUS = (window.VAFT && window.VAFT.bus) || (function(){ const L={}; return { on:(t,f)=>((L[t]||=[]).push(f)), emit:(t,d)=>( (L[t]||[]).forEach(fn=>fn(d)) ), _L:L }; })();

  const FEED = document.getElementById('vent-feed');
  const SUMMARY = document.getElementById('vent-summary');
  const FILTER_AGENT = document.getElementById('vent-filter-agent');
  const FILTER_TYPE = document.getElementById('vent-filter-type');
  const CLEAR_BTN = document.getElementById('vent-clear');
  const EXPORT_BTN = document.getElementById('vent-export');

  if (!FEED) {
    console.warn('VAFT Vent: #vent-feed nenalezen — vlož panel do indexu.');
    return;
  }

  const KEY = 'VAFT_VENT_LOG_v1';
  const MAX = 800;

  function saveLog(arr) { try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch(e) {} }
  function readLog() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e){ return []; } }

  const TYPE_CLASS = {
    signal: 'vent-type-signal',
    heartbeat: 'vent-type-heartbeat',
    diagnostic: 'vent-type-diagnostic',
    output: 'vent-type-output',
    custom: 'vent-type-custom'
  };

  function escapeHtml(s) {
    if (!s && s !== 0) return '';
    return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function renderEntry(obj, prepend) {
    const row = document.createElement('div');
    row.className = 'vent-row ' + (TYPE_CLASS[obj.type] || TYPE_CLASS.custom);
    row.innerHTML = `
      <div class="vent-meta">${new Date(obj.ts).toLocaleTimeString()} • <strong>${obj.from||'?'}</strong> • <em>${obj.type}</em></div>
      <div class="vent-text">${escapeHtml(obj.text || JSON.stringify(obj.payload || obj, null, 2))}</div>
    `;
    if (prepend && FEED.firstChild) FEED.insertBefore(row, FEED.firstChild);
    else FEED.appendChild(row);

    while (FEED.children.length > 200) FEED.removeChild(FEED.lastChild);
  }

  function updateSummary() {
    const log = readLog();
    const byType = log.reduce((acc, it) => { acc[it.type] = (acc[it.type]||0)+1; return acc; }, {});
    const byFrom = log.reduce((acc, it) => { acc[it.from] = (acc[it.from]||0)+1; return acc; }, {});
    SUMMARY.innerHTML = `Záznamů: ${log.length} • typy: ${Object.entries(byType).map(e=>e[0]+':'+e[1]).join(' | ')} • agenty: ${Object.entries(byFrom).slice(0,5).map(e=>e[0]+':'+e[1]).join(' | ')}`;
  }

  function pushEntry(obj) {
    const log = readLog();
    log.unshift(obj);
    while (log.length > MAX) log.pop();
    saveLog(log);

    const agentFilter = FILTER_AGENT ? FILTER_AGENT.value : '';
    const typeFilter = FILTER_TYPE ? FILTER_TYPE.value : '';
    if ((agentFilter && obj.from !== agentFilter) || (typeFilter && obj.type !== typeFilter)) {
      updateSummary();
      return;
    }
    renderEntry(obj, true);
    updateSummary();
  }

  function renderExisting() {
    FEED.innerHTML = '';
    const log = readLog();
    log.forEach(item => renderEntry(item, false));
    updateSummary();
  }

  // napojení na bus
  function hookBus() {
    BUS.on('vaft.signal', (d) => {
      pushEntry({ ts: Date.now(), from: d && d.from, type: 'signal', text: d && (d.msg && (d.msg.text || JSON.stringify(d.msg))) || d.text || JSON.stringify(d) , payload: d });
    });
    BUS.on('vaft.heartbeat', (d) => {
      pushEntry({ ts: Date.now(), from: d && d.from, type: 'heartbeat', text: 'beat: '+(d && d.beat), payload: d });
    });
    BUS.on('vaft.diagnostic', (d) => {
      pushEntry({ ts: Date.now(), from: d && (d.from || 'diag'), type: 'diagnostic', text: d && (d.msg || JSON.stringify(d)), payload: d });
    });
    BUS.on('vaft.output', (d) => {
      pushEntry({ ts: Date.now(), from: d && d.from, type: 'output', text: d && (d.text || JSON.stringify(d)), payload: d });
    });
    BUS.on('vaft.vent', (d) => {
      pushEntry(Object.assign({ ts: Date.now(), type: 'custom' }, d));
    });
  }

  // UI
  FILTER_AGENT && FILTER_AGENT.addEventListener('change', () => { FEED.innerHTML=''; renderExisting(); });
  FILTER_TYPE && FILTER_TYPE.addEventListener('change', () => { FEED.innerHTML=''; renderExisting(); });
  CLEAR_BTN && CLEAR_BTN.addEventListener('click', () => { localStorage.removeItem(KEY); FEED.innerHTML=''; updateSummary(); });
  EXPORT_BTN && EXPORT_BTN.addEventListener('click', () => {
    const data = readLog();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'vaft-vent.json'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 3000);
  });

  hookBus();
  renderExisting();

  window.VAFT.vent = {
    push: (o) => pushEntry(Object.assign({ ts: Date.now(), type: 'custom' }, o)),
    clear: () => { localStorage.removeItem(KEY); FEED.innerHTML=''; updateSummary(); },
    read: readLog
  };

  console.log('[VAFT Vent] ready');
})(window, document);
