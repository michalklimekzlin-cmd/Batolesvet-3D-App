// vaft.network.js
// komplet síť pro Vivere atque FruiT
// dělá 4 vrstvy + tajný člen + napojení na hlavní appku

(function (window, document) {
  // 0) VAFT + BUS + jazyk
  window.VAFT = window.VAFT || {};

  // bus
  if (!window.VAFT.bus) {
    const listeners = {};
    window.VAFT.bus = {
      on(ch, fn) {
        (listeners[ch] ||= []).push(fn);
      },
      emit(ch, payload) {
        (listeners[ch] || []).forEach(fn => {
          try { fn(payload); } catch (e) { console.warn('bus err', e); }
        });
      }
    };
  }
  const BUS = window.VAFT.bus;

  // jazyk
  if (!window.VAFT.language) {
    const dict = {
      "V": "Vivere",
      "A": "atque",
      "F": "FruiT",
      "H": "Hlavoun",
      "P": "Pikoš",
      "R": "Viri",
      "?": "Strážce",
      "♥": "puls"
    };
    window.VAFT.language = {
      decode: (s) => dict[s] || s,
      encode: (word) => Object.entries(dict).find(([k,v]) => v === word)?.[0] || "?"
    };
  }

  // 1) zajisti panel "Síť" (kdyby tam nebyl)
  let panel = document.getElementById('panel-nodes');
  if (!panel) {
    // vytvoříme tlačítko do tabs
    const tabs = document.querySelector('.tabs');
    if (tabs) {
      const btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.dataset.tab = 'nodes';
      btn.textContent = 'Síť';
      tabs.appendChild(btn);
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        panel.classList.add('active');
      });
    }

    panel = document.createElement('div');
    panel.className = 'panel';
    panel.id = 'panel-nodes';
    panel.innerHTML = `
      <div class="panel-title">Síť uzlů</div>
      <p style="opacity:.6;font-size:.7rem;">Živá síť Vivere atque FruiT (uzly, vrstvy, originály).</p>
      <div id="vaft-nodes" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;"></div>
      <div id="vaft-nodes-outer"></div>
      <div id="vaft-nodes-mirror"></div>
      <div id="vaft-nodes-origin"></div>
    `;
    const after = document.getElementById('panel-system');
    if (after && after.parentNode) {
      after.parentNode.insertBefore(panel, after.nextSibling);
    } else {
      document.body.appendChild(panel);
    }
  }

  // 2) ========== VRSTVA 1 – MALÉ UZLY (tvoje první čtverečky) ==========
  const host = document.getElementById('vaft-nodes');
  const nodes = [];
  function createNode(id, layer) {
    const el = document.createElement('div');
    el.className = 'vaft-node';
    Object.assign(el.style, {
      border: '1px solid rgba(150,200,255,.15)',
      borderRadius: '14px',
      padding: '7px 9px',
      background: 'rgba(2,5,10,.35)',
      backdropFilter: 'blur(8px)',
      minWidth: '148px',
      fontSize: '.62rem',
      color: '#e8f5ff'
    });
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;">
        <div>${layer} • ${id}</div>
        <div id="n-${id}-pulse" style="font-size:.6rem;opacity:.5;">--:--:--</div>
      </div>
      <div>🧠 <span id="n-${id}-idea">-</span></div>
      <div>💾 <span id="n-${id}-mem">0</span></div>
      <div>🌬 <span id="n-${id}-out">-</span></div>
    `;
    host.appendChild(el);

    const memKey = `VAFT_NODE_${id}_MEM`;
    let mem = JSON.parse(localStorage.getItem(memKey) || '[]');

    function save(obj) {
      mem.push(obj);
      if (mem.length > 100) mem.shift();
      localStorage.setItem(memKey, JSON.stringify(mem));
      const mEl = document.getElementById(`n-${id}-mem`);
      if (mEl) mEl.textContent = mem.length;
    }

    return {
      id,
      layer,
      tick() {
        const now = new Date();
        const pEl = document.getElementById(`n-${id}-pulse`);
        if (pEl) pEl.textContent = now.toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
        const syms = ['V','A','F','H','P','R','♥','?'];
        const sym = syms[Math.floor(Math.random()*syms.length)];
        const iEl = document.getElementById(`n-${id}-idea`);
        if (iEl) iEl.textContent = sym;
        if (now.getSeconds() % 4 === 0) {
          save({ ts: Date.now(), sym });
        }
        if (now.getSeconds() % 6 === 0) {
          const msg = { from: id, symbol: sym, decoded: window.VAFT.language.decode(sym), ts: Date.now() };
          BUS.emit('node.out', msg);
          const oEl = document.getElementById(`n-${id}-out`);
          if (oEl) oEl.textContent = msg.decoded;
        }
      },
      hear(label, data) {
        save({ from: label, data, ts: Date.now() });
      }
    };
  }

  const INNER = 6;
  const OUTER = 6;
  for (let i=0;i<INNER;i++) nodes.push(createNode('inner-'+i, 'inner'));
  for (let i=0;i<OUTER;i++) nodes.push(createNode('outer-'+i, 'outer'));

  // společný tep pro vrstvu 1
  setInterval(() => {
    nodes.forEach(n => n.tick());
    BUS.emit('system.heartbeat', { ts: Date.now(), source: 'vaft.network' });
  }, 3000);

  // 3) ========== VRSTVA 2 – Hlavoun/Viri/Pikoš „vnější“ ==========
  const outer = document.getElementById('vaft-nodes-outer');
  const layer2 = {
    hlavoun: makeBigBox('Hlavoun', 'hl'),
    viri: makeBigBox('Viri', 'vi'),
    pikos: makeBigBox('Pikoš', 'pi')
  };

  function makeBigBox(title, short) {
    const el = document.createElement('div');
    Object.assign(el.style, {
      background: 'rgba(1,4,7,.35)',
      border: '1px solid rgba(130,160,200,.28)',
      borderRadius: '18px',
      minWidth: '170px',
      padding: '10px 12px',
      color: '#e8f5ff',
      fontSize: '.68rem'
    });
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:600;">${title} – vrstva 2</div>
        <div id="outer-${short}-pulse" style="font-size:.6rem;opacity:.6;">--:--:--</div>
      </div>
      <div style="margin-top:6px;">poslední: <span id="outer-${short}-last">—</span></div>
      <div style="margin-top:4px;opacity:.5;font-size:.6rem;" id="outer-${short}-count">0 zpráv</div>
    `;
    outer.appendChild(el);
    return { el, short, count:0 };
  }

  function updateLayer2(key, text) {
    const box = layer2[key];
    if (!box) return;
    box.count++;
    const now = new Date().toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    box.el.querySelector(`#outer-${box.short}-pulse`).textContent = now;
    box.el.querySelector(`#outer-${box.short}-last`).textContent = text;
    box.el.querySelector(`#outer-${box.short}-count`).textContent = box.count + ' zpráv';
  }

  // napojení vrstva1 -> vrstva2
  BUS.on('node.out', (msg) => {
    updateLayer2('viri', msg.decoded || msg.symbol);
    BUS.emit('layer2.in', { from: msg.from, data: msg });
  });
  BUS.on('hlavoun.output', (msg) => updateLayer2('hlavoun', msg.text || JSON.stringify(msg)));
  BUS.on('pikos.output', (msg) => updateLayer2('pikos', msg.text || msg.type || JSON.stringify(msg)));
  BUS.on('vaft.world', (msg) => updateLayer2('viri', msg.meaning || msg.code || 'svět'));

  // 4) ========== VRSTVA 3 – zrcadlo (šipky místo čtverečků) ==========
  const mirror = document.getElementById('vaft-nodes-mirror');
  const mirrorEls = [];
  for (let i=0;i<9;i++) {
    const isArrow = i % 2 === 0;
    const el = document.createElement('div');
    if (isArrow) {
      el.textContent = '→';
      Object.assign(el.style, {
        border: '1px dashed rgba(100,200,255,.2)',
        borderRadius: '50%',
        width: '26px',
        height: '26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#79d6ff',
        background: 'rgba(0,50,90,.2)',
        transition: 'transform .3s ease'
      });
    } else {
      el.textContent = '□';
      Object.assign(el.style, {
        border: '1px solid rgba(120,150,200,.25)',
        borderRadius: '8px',
        padding: '4px 8px',
        color: '#aee1ff',
        fontSize: '.65rem',
        background: 'rgba(0,20,40,.25)'
      });
    }
    mirror.appendChild(el);
    mirrorEls.push(el);
  }

  setInterval(() => {
    mirrorEls.forEach(el => {
      if (el.textContent === '→' || el.textContent === '←') {
        el.textContent = el.textContent === '→' ? '←' : '→';
        el.style.transform = `rotate(${el.textContent === '→' ? 0 : 180}deg)`;
      } else {
        el.style.background = el.style.background.includes('0,20,40')
          ? 'rgba(0,60,90,.45)'
          : 'rgba(0,20,40,.25)';
      }
    });
  }, 2000);

  BUS.on('layer2.in', (msg) => {
    // přidej šipku zpětného toku
    const el = document.createElement('div');
    el.textContent = '↩';
    Object.assign(el.style, {
      border: '1px dashed rgba(255,180,100,.4)',
      borderRadius: '50%',
      width: '26px',
      height: '26px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffb347'
    });
    mirror.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  });

  // 5) ========== VRSTVA 4 – ORIGINÁLY + TAJNÝ ==========
  const originHost = document.getElementById('vaft-nodes-origin');
  const originNames = ['Hlavoun','Viri','Pikos','Strazce']; // Strazce = ten otazník
  const colors = {
    Hlavoun: '#aee1ff',
    Viri: '#7fff9f',
    Pikos: '#ffb347',
    Strazce: '#d28bff'
  };

  originNames.forEach(name => makeOrigin(name));

  function makeOrigin(name) {
    const box = document.createElement('div');
    Object.assign(box.style, {
      border: `1px solid ${colors[name]}44`,
      borderRadius: '12px',
      background: 'rgba(5,10,15,.4)',
      color: colors[name],
      padding: '10px',
      fontSize: '.7rem',
      width: '180px'
    });
    box.innerHTML = `
      <div style="font-weight:600;font-size:.78rem;">${name} – originál</div>
      <div>🧠 <span id="${name}-brain">klid</span></div>
      <div>💾 <span id="${name}-mem">0</span></div>
      <div>⚙️ <span id="${name}-motor">---</span></div>
      <div>❤️ <span id="${name}-heart">0</span></div>
      <div>💨 <span id="${name}-vent">ticho</span></div>
    `;
    originHost.appendChild(box);

    const memKey = `VAFT_ORIG_${name}_MEM`;
    let mem = JSON.parse(localStorage.getItem(memKey) || '[]');
    let heart = 0;

    // motor/srdce
    setInterval(() => {
      heart++;
      const now = new Date().toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
      document.getElementById(`${name}-motor`).textContent = now;
      document.getElementById(`${name}-heart`).textContent = heart;
      BUS.emit('origin.heartbeat', { name, beat: heart, ts: Date.now() });
    }, 4500 + Math.random()*1500);

    // co mají dělat, když k nim něco přijde
    function learn(input) {
      mem.push(input);
      if (mem.length > 80) mem.shift();
      localStorage.setItem(memKey, JSON.stringify(mem));
      document.getElementById(`${name}-mem`).textContent = mem.length;
      document.getElementById(`${name}-brain`).textContent = input.text || input.decoded || 'signál';
      document.getElementById(`${name}-vent`).textContent = '→ posl. ' + (input.from || 'uzel');
      // pošleme dál do světa
      BUS.emit('vaft.world', {
        from: name,
        code: input.symbol || input.code || input.decoded,
        meaning: input.decoded || input.text || 'signál'
      });
    }

    // poslouchají na data z nižších vrstev
    BUS.on('layer2.in', (msg) => learn(msg.data || msg));
    BUS.on('node.out', (msg) => learn(msg));
  }

  // 6) napojení na hlavní chat (pokud existuje)
  if (typeof window.appendHlavounMsg === 'function') {
    BUS.on('node.out', (msg) => {
      window.appendHlavounMsg('ai', `📡 uzel ${msg.from} poslal: ${msg.decoded || msg.symbol}`);
    });
    BUS.on('origin.heartbeat', (hb) => {
      // můžeš zakomentovat, když to bude moc kecat
      // window.appendHlavounMsg('ai', `❤️ ${hb.name} žije (${hb.beat})`);
    });
  }

  console.log('[VAFT network] kompletní síť Vivere atque FruiT spuštěna.');

})(window, document);
