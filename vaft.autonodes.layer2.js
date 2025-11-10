// vaft.autonodes.layer2.js
// druhý prstenec podle Michalova schématu – Hlavoun kopie, Viri kopie, Pikoš kopie
(function (window, document) {
  // musíme mít VAFT i bus z první vrstvy
  if (!window.VAFT || !window.VAFT.bus) {
    console.warn('[VAFT layer2] bus nenalezen – připoj nejdřív vaft.autonodes.js');
    return;
  }
  const BUS = window.VAFT.bus;

  // vytvoříme v panelu Síť i druhý kontejner
  let outer = document.getElementById('vaft-nodes-outer');
  if (!outer) {
    outer = document.createElement('div');
    outer.id = 'vaft-nodes-outer';
    outer.style.display = 'flex';
    outer.style.flexWrap = 'wrap';
    outer.style.gap = '10px';
    outer.style.marginTop = '14px';
    outer.style.borderTop = '1px solid rgba(160,200,255,.08)';
    outer.style.paddingTop = '10px';
    const host = document.getElementById('panel-nodes') || document.body;
    host.appendChild(outer);
  }

  // pomocná funkce na box
  function bigBox(title, id) {
    const el = document.createElement('div');
    el.className = 'vaft-big-node';
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
        <div style="font-weight:600;">${title}</div>
        <div id="outer-${id}-pulse" style="font-size:.6rem;opacity:.6;">--:--:--</div>
      </div>
      <div style="margin-top:6px;">poslední: <span id="outer-${id}-last">—</span></div>
      <div style="margin-top:4px;opacity:.5;font-size:.6rem;" id="outer-${id}-count">0 zpráv</div>
    `;
    outer.appendChild(el);
    return el;
  }

  // tři hlavní kopie
  const kopie = {
    hlavoun: {
      id: 'hlavoun-copy',
      el: bigBox('Hlavoun – kopie', 'hl'),
      count: 0
    },
    viri: {
      id: 'viri-copy',
      el: bigBox('Viri – kopie', 'vi'),
      count: 0
    },
    pikos: {
      id: 'pikos-copy',
      el: bigBox('Pikoš – kopie', 'pi'),
      count: 0
    }
  };

  // malé spojovací uzly (jen přeposílají – aby to odpovídalo kresbě)
  const connectors = [];
  for (let i = 0; i < 6; i++) {
    const c = document.createElement('div');
    c.textContent = '□ spoj';
    c.style.border = '1px solid rgba(150,200,255,.1)';
    c.style.borderRadius = '10px';
    c.style.padding = '4px 8px';
    c.style.fontSize = '.58rem';
    c.style.opacity = '.6';
    outer.appendChild(c);
    connectors.push(c);
  }

  // funkce pro update boxu
  function updateBox(key, text) {
    const box = kopie[key];
    if (!box) return;
    const last = box.el.querySelector(`#outer-${key.slice(0,2)}-last`);
    const cnt  = box.el.querySelector(`#outer-${key.slice(0,2)}-count`);
    const pls  = box.el.querySelector(`#outer-${key.slice(0,2)}-pulse`);
    if (last) last.textContent = text;
    box.count++;
    if (cnt) cnt.textContent = box.count + ' zpráv';
    if (pls) pls.textContent = new Date().toLocaleTimeString('cs-CZ',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  }

  // 1) cokoli vyletí z uzlů vnitřního kruhu → přebere to vnější vrstva
  BUS.on('node.out', (msg) => {
    // zapíše si to viri-kopie (archiv)
    updateBox('viri', (msg.decoded || msg.symbol || msg.code || '…'));
    // a pošle to dál, aby to mohly vidět i kopie Hlavouna/Pikoše
    BUS.emit('layer2.in', { from: msg.from, data: msg });
  });

  // 2) když mluví Hlavoun (hlavní), vnější Hlavoun si to uloží
  BUS.on('hlavoun.output', (data) => {
    updateBox('hlavoun', data.text || JSON.stringify(data));
  });

  // 3) když mluví Pikoš (hlavní), vnější Pikoš si to uloží
  BUS.on('pikos.output', (data) => {
    updateBox('pikos', data.text || data.type || JSON.stringify(data));
  });

  // 4) když jde cokoliv z centra světa
  BUS.on('vaft.world', (data) => {
    // ať o tom ví aspoň viri-kopie
    updateBox('viri', data.meaning || data.code || 'svět');
  });

  // 5) vnější vrstva může občas mluvit zpět
  setInterval(() => {
    // pošleme do systému info, že vnější vrstva žije
    BUS.emit('layer2.heartbeat', { ts: Date.now(), layer: 2, source: 'outer-ring' });
  }, 5000);

  console.log('[VAFT layer2] druhý prstenec aktivní a napojený na první');

})(window, document);
