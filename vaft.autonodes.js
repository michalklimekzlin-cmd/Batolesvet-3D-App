// vaft.autonodes.js
// automatické rozesetí "čtverečků" (uzlů) kolem Vivere atque FruiT
// každý uzel má: mozek, paměť, motor, srdce, ventil
// Michalův kruh – auto verze

(function (window, document) {
  // 1) zajistíme VAFT a bus
  window.VAFT = window.VAFT || {};
  if (!window.VAFT.bus) {
    const listeners = {};
    window.VAFT.bus = {
      on(ch, fn) {
        if (!listeners[ch]) listeners[ch] = [];
        listeners[ch].push(fn);
      },
      emit(ch, payload) {
        (listeners[ch] || []).forEach(fn => {
          try { fn(payload); } catch (e) { console.warn('bus err', e); }
        });
      }
    };
  }

  const BUS = window.VAFT.bus;

  // 2) malý slovník znaků, ať všichni uzly mluví stejným jazykem
  if (!window.VAFT.language) {
    const dict = {
      "V": "Vivere",
      "A": "atque",
      "F": "FruiT",
      "♥": "puls",
      "∴": "cíl",
      "⌘": "systém"
    };
    window.VAFT.language = {
      decode: (s) => dict[s] || s,
      encode: (word) => {
        const found = Object.entries(dict).find(([k, v]) => v === word);
        return found ? found[0] : "?";
      }
    };
  }

  // 3) kontejner kam to nasypeme (když není, vytvoříme)
  let host = document.getElementById('vaft-nodes');
  if (!host) {
    host = document.createElement('div');
    host.id = 'vaft-nodes';
    host.style.position = 'relative';
    host.style.marginTop = '10px';
    host.style.padding = '8px 10px 120px';
    host.style.display = 'flex';
    host.style.flexWrap = 'wrap';
    host.style.gap = '8px';
    document.body.appendChild(host);
  }

  // 4) továrna na uzel
  function createNode(id, layer) {
    const nodeEl = document.createElement('div');
    nodeEl.className = 'vaft-node';
    nodeEl.style.border = '1px solid rgba(150,200,255,.15)';
    nodeEl.style.borderRadius = '14px';
    nodeEl.style.padding = '7px 9px';
    nodeEl.style.background = 'rgba(2,5,10,.35)';
    nodeEl.style.backdropFilter = 'blur(8px)';
    nodeEl.style.minWidth = '148px';
    nodeEl.style.fontSize = '.62rem';
    nodeEl.style.color = '#e8f5ff';

    nodeEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <div style="opacity:.7;">${layer} • ${id}</div>
        <div id="n-${id}-pulse" style="font-size:.6rem;opacity:.5;">--:--:--</div>
      </div>
      <div>🧠 <span id="n-${id}-idea">-</span></div>
      <div>💾 <span id="n-${id}-mem">0</span> záznamů</div>
      <div>🌬 <span id="n-${id}-out">-</span></div>
    `;
    host.appendChild(nodeEl);

    // paměť uzlu
    const memKey = `VAFT_NODE_${id}_MEM`;
    let memory = [];
    try {
      memory = JSON.parse(localStorage.getItem(memKey) || '[]');
    } catch (e) { memory = []; }

    function saveToMemory(obj) {
      memory.push(obj);
      localStorage.setItem(memKey, JSON.stringify(memory));
      const mEl = document.getElementById(`n-${id}-mem`);
      if (mEl) mEl.textContent = memory.length;
    }

    // samotný uzel
    const node = {
      id,
      layer,
      heartbeat: 0,
      idea: null,
      memory,
      tick() {
        this.heartbeat++;
        // update času
        const pEl = document.getElementById(`n-${id}-pulse`);
        if (pEl) {
          const now = new Date();
          pEl.textContent = now.toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
        }
        // mozek něco vymyslí
        const symbols = ['V','A','F','♥','∴','⌘'];
        const pick = symbols[Math.floor(Math.random()*symbols.length)];
        this.idea = pick;
        const iEl = document.getElementById(`n-${id}-idea`);
        if (iEl) iEl.textContent = pick;

        // uložit každé 2. srdce
        if (this.heartbeat % 2 === 0) {
          saveToMemory({ ts: Date.now(), sym: pick });
        }

        // každé 3. srdce vyšleme ven
        if (this.heartbeat % 3 === 0) {
          const msg = {
            from: this.id,
            symbol: pick,
            decoded: window.VAFT.language ? window.VAFT.language.decode(pick) : pick,
            ts: Date.now()
          };
          BUS.emit('node.out', msg);
          const oEl = document.getElementById(`n-${id}-out`);
          if (oEl) oEl.textContent = msg.decoded;
        }
      }
    };

    return node;
  }

  // 5) vytvoříme uzly podle tvého obrázku: vnitřní kruh + vnější kopie
  const nodes = [];
  const INNER_COUNT = 6;
  const OUTER_COUNT = 6;

  for (let i = 0; i < INNER_COUNT; i++) {
    nodes.push(createNode('inner-'+i, 'inner'));
  }
  for (let i = 0; i < OUTER_COUNT; i++) {
    nodes.push(createNode('outer-'+i, 'outer'));
  }

  // 6) rytmus – všem uzlům stejné srdce (3s, jak máš ty)
  setInterval(() => {
    nodes.forEach(n => n.tick());
    // dáme vědět i zbytku systému
    BUS.emit('system.heartbeat', { ts: Date.now(), source: 'autonodes' });
  }, 3000);

  // 7) napojení na hlavní chat (když existuje appendHlavounMsg)
  if (typeof window.appendHlavounMsg === 'function') {
    BUS.on('node.out', (msg) => {
      window.appendHlavounMsg('ai', `🔹 uzel ${msg.from} poslal: ${msg.decoded || msg.symbol}`);
    });
  }

  // 8) umíme přijímat broadcast ze středu
  BUS.on('center.broadcast', (data) => {
    // uložíme všem
    nodes.forEach(n => {
      const memKey = `VAFT_NODE_${n.id}_MEM`;
      const m = JSON.parse(localStorage.getItem(memKey) || '[]');
      m.push({ ts: Date.now(), from:'center', data });
      localStorage.setItem(memKey, JSON.stringify(m));
      const el = document.getElementById(`n-${n.id}-mem`);
      if (el) el.textContent = m.length;
    });
  });

  console.log('[VAFT] autonodes inicializovány:', nodes.length);

})(window, document);
