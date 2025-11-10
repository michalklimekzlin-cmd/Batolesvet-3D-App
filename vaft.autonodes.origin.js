// vaft.autonodes.origin.js
// čtvrtá vrstva – reálné originály Hlavoun, Viri, Pikoš
(function(window, document) {
  if (!window.VAFT || !window.VAFT.bus) {
    console.warn('[VAFT origin] bus nenalezen – připoj nejdřív layer3');
    return;
  }
  const BUS = window.VAFT.bus;

  const ORIGINS = ['Hlavoun', 'Viri', 'Pikos'];
  const COLORS = {
    Hlavoun: '#aee1ff',
    Viri: '#7fff9f',
    Pikos: '#ffb347'
  };

  let zone = document.getElementById('vaft-nodes-origin');
  if (!zone) {
    zone = document.createElement('div');
    zone.id = 'vaft-nodes-origin';
    Object.assign(zone.style, {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      borderTop: '1px solid rgba(255,255,255,.08)',
      paddingTop: '12px',
      marginTop: '12px'
    });
    (document.getElementById('panel-nodes') || document.body).appendChild(zone);
  }

  // vytvoří „živý“ uzel – mozek, paměť, motor, srdce, ventil
  function createOrigin(name) {
    const box = document.createElement('div');
    box.className = 'vaft-origin';
    Object.assign(box.style, {
      border: `1px solid ${COLORS[name]}44`,
      borderRadius: '12px',
      background: 'rgba(5,10,15,.4)',
      color: COLORS[name],
      padding: '10px',
      fontSize: '.7rem',
      width: '180px'
    });

    box.innerHTML = `
      <div style="font-weight:600;font-size:.8rem;">${name}</div>
      <div>🧠 mozek: <span id="${name}-brain">klid</span></div>
      <div>💾 paměť: <span id="${name}-mem">0</span></div>
      <div>⚙️ motor: <span id="${name}-motor">---</span></div>
      <div>❤️ srdce: <span id="${name}-heart">0</span></div>
      <div>💨 ventil: <span id="${name}-vent">ticho</span></div>
    `;
    zone.appendChild(box);

    // živý stav
    const state = {
      brain: 'klid',
      memory: [],
      heart: 0
    };

    // mozek – zpracování signálů
    function think(input) {
      state.brain = input.text || 'zvuk';
      document.getElementById(`${name}-brain`).textContent = state.brain;
      state.memory.push(input);
      localStorage.setItem(`VAFT_${name}_MEM`, JSON.stringify(state.memory));
      document.getElementById(`${name}-mem`).textContent = state.memory.length;

      // ventil (vysílání ven)
      const msg = { from: name, echo: input.text, ts: Date.now() };
      BUS.emit('origin.out', msg);
      document.getElementById(`${name}-vent`).textContent = '→ vysláno';
    }

    // motor – pulzuje a spouští srdce
    setInterval(() => {
      const t = new Date().toLocaleTimeString('cs-CZ', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
      document.getElementById(`${name}-motor`).textContent = t;
      state.heart++;
      document.getElementById(`${name}-heart`).textContent = state.heart;
      BUS.emit('origin.heartbeat', { name, beat: state.heart, ts: Date.now() });
    }, 4000 + Math.random()*2000);

    // reaguje na přijaté zprávy
    BUS.on('layer2.in', (msg) => {
      if (msg && msg.data && msg.data.from !== name) think(msg.data);
    });
    BUS.on('layer3.echo', (msg) => {
      if (msg.from !== name) think(msg);
    });

    return { name, think };
  }

  // vytvoření všech tří originálů
  const originNodes = ORIGINS.map(createOrigin);

  // propojení mezi sebou
  BUS.on('origin.out', (msg) => {
    // echo do layer3 jako vizuální šipka
    BUS.emit('layer3.echo', msg);
  });

  console.log('[VAFT origin] aktivní – tři originální entity propojené se systémem');
})(window, document);
