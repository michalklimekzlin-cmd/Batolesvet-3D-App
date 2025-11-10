// vaft.autonodes.layer3.js
// třetí prstenec - zrcadlová síť, kde se šipky mění na uzly a uzly na toky
(function (window, document) {
  if (!window.VAFT || !window.VAFT.bus) {
    console.warn('[VAFT layer3] bus nenalezen – připoj nejdřív layer2');
    return;
  }
  const BUS = window.VAFT.bus;

  // vytvoření vizuálního kontejneru
  let mirror = document.getElementById('vaft-nodes-mirror');
  if (!mirror) {
    mirror = document.createElement('div');
    mirror.id = 'vaft-nodes-mirror';
    mirror.style.display = 'flex';
    mirror.style.flexWrap = 'wrap';
    mirror.style.gap = '8px';
    mirror.style.marginTop = '14px';
    mirror.style.borderTop = '1px solid rgba(255,255,255,.08)';
    mirror.style.paddingTop = '10px';
    mirror.style.opacity = '.9';
    const host = document.getElementById('panel-nodes') || document.body;
    host.appendChild(mirror);
  }

  // pomocná funkce na vytvoření „šipky“ a „čtverečku“
  function arrowSymbol(direction = '→') {
    const el = document.createElement('div');
    el.className = 'vaft-arrow';
    el.textContent = direction;
    Object.assign(el.style, {
      border: '1px dashed rgba(100,200,255,.2)',
      borderRadius: '50%',
      width: '26px',
      height: '26px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#79d6ff',
      fontSize: '.9rem',
      background: 'rgba(0,50,90,.2)',
      transform: 'rotate(0deg)',
      transition: 'transform .3s ease'
    });
    mirror.appendChild(el);
    return el;
  }

  function squareSymbol(label = '□') {
    const el = document.createElement('div');
    el.className = 'vaft-square';
    el.textContent = label;
    Object.assign(el.style, {
      border: '1px solid rgba(120,150,200,.25)',
      borderRadius: '8px',
      padding: '4px 8px',
      color: '#aee1ff',
      fontSize: '.65rem',
      background: 'rgba(0,20,40,.25)'
    });
    mirror.appendChild(el);
    return el;
  }

  // vytvoříme střídající se vzor: šipka, čtverec, šipka, čtverec...
  const sequence = [];
  for (let i = 0; i < 9; i++) {
    if (i % 2 === 0) sequence.push(arrowSymbol('→'));
    else sequence.push(squareSymbol('□'));
  }

  // zrcadlové otáčení (dech sítě)
  setInterval(() => {
    sequence.forEach((el, i) => {
      if (el.className === 'vaft-arrow') {
        // změna směru
        el.textContent = el.textContent === '→' ? '←' : '→';
        el.style.transform = `rotate(${el.textContent === '→' ? '0' : '180'}deg)`;
      } else {
        // změna intenzity (jako puls)
        el.style.background = el.style.background.includes('0,20,40')
          ? 'rgba(0,60,90,.45)'
          : 'rgba(0,20,40,.25)';
      }
    });
  }, 2000);

  // reaguje na zprávy z layer2
  BUS.on('layer2.in', (msg) => {
    // vytvoří symbolický tok zpět
    const a = arrowSymbol('↩');
    a.style.color = '#ffb347';
    a.style.borderColor = 'rgba(255,180,100,.3)';
    setTimeout(() => a.remove(), 4000);
  });

  BUS.on('layer2.heartbeat', (hb) => {
    // každý heartbeat přidá jeden nový čtvereček jako uzel
    const sq = squareSymbol('■');
    sq.style.color = '#00ffaa';
    setTimeout(() => sq.remove(), 5000);
  });

  console.log('[VAFT layer3] aktivní zrcadlová vrstva – šipky <-> čtverečky');
})(window, document);
