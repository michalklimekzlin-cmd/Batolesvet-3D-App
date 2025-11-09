// agents.js
// 🎛️ společná sběrnice pro dva rovnocenné agenty: Hlavoun (👦) a Viri (👧)

const AgentBus = {
  repoOwner: "michalklimekzlin-cmd",
  repoName: "Vivere-atque-FruiT",
  agents: [],
  state: {
    lastRepoCheck: 0,
    repo: [],
    vafit: null,
    heroes: [],
    nature: [],
    gps: [],
    batole: []
  },

  init() {
    // zaregistrujeme oba
    this.register(HlavounAgent);
    this.register(ViriAgent);

    // první načtení dat
    this.pullLocal();

    // agenty probudíme
    this.agents.forEach(a => a.init && a.init(this.state, this));

    // heartbeat
    setInterval(() => this.heartbeat(), 5000);

    // SW
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
    }

    // označ v UI
    const el = document.getElementById("core-status");
    if (el) el.textContent = "🧠 Duo systém • aktivní";
  },

  register(agent) {
    this.agents.push(agent);
  },

  pullLocal() {
    this.state.vafit  = getJSON('VAFT_SELECTED_VAFIT');
    this.state.heroes = getJSON('VAFT_HEROES') || [];
    this.state.nature = getJSON('VAFT_NATURE_OBJECTS') || [];
    this.state.gps    = getJSON('VAFT_GPS_LOG') || [];
    this.state.batole = getJSON('BATOLE_SVET') || [];
  },

  async pullRepo(force=false) {
    const now = Date.now();
    if (!force && now - this.state.lastRepoCheck < 60000) return;
    try {
      const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents`;
      const res = await fetch(url);
      const data = await res.json();
      this.state.repo = Array.isArray(data) ? data.map(f => f.name) : [];
      this.state.lastRepoCheck = now;
    } catch (e) {
      // necháme agenty, ať to případně zahlásí
    }
  },

  // přijme zprávu od uživatele a dá ji všem se stejnými právy
  async handleUserMessage(text) {
    // ochrana proti cizím repům
    const bad = ['github.com/', 'api.github.com', 'repos/', 'https://github.com/'];
    if (text && bad.some(b => text.toLowerCase().includes(b))) {
      appendHlavounMsg('ai', `🛑 Systém: čteme jen ${this.repoOwner}/${this.repoName}.`);
      return;
    }

    this.pullLocal();
    // každý agent může odpovědět – jsou rovnocenní
    for (const agent of this.agents) {
      if (agent.canHandle && agent.canHandle(text)) {
        await agent.handle(text, this.state, this);
      }
    }
    // když nikdo neskočil, dáme aspoň stav
    // (ale většinou skočí aspoň jeden)
  },

  heartbeat() {
    this.pullLocal();
    this.pullRepo(false);
    this.agents.forEach(a => a.heartbeat && a.heartbeat(this.state, this));
  }
};

// pomocná
function getJSON(key){
  try { return JSON.parse(localStorage.getItem(key)); }
  catch { return null; }
}

/* ============================================================
   👦 HlavounAgent – analytik
   ============================================================ */
const HlavounAgent = {
  name: "HlavounAgent",
  init(state, bus) {
    appendHlavounMsg('ai', '🧠 Hlavoun: jsem online. Můžu kontrolovat repo, hrdiny i VafiTy.');
  },
  canHandle(text) {
    const t = (text || '').toLowerCase();
    return (
      !t ||                        // i prázdné při startu
      t.includes('repo') ||
      t.includes('gps') ||
      t.includes('stav') ||
      t.includes('status')
    );
  },
  async handle(text, state, bus) {
    const t = (text || '').toLowerCase();

    if (t.includes('repo')) {
      await bus.pullRepo(true);
      if (state.repo && state.repo.length) {
        appendHlavounMsg('ai', '🧠 Hlavoun: v repu vidím → ' + state.repo.join(', '));
      } else {
        appendHlavounMsg('ai', '🧠 Hlavoun: repo se nepodařilo načíst.');
      }
      return;
    }

    if (t.includes('gps')) {
      appendHlavounMsg('ai', '🧠 Hlavoun: GPS ukládej jako [{lat,lng,time}] do VAFT_GPS_LOG. Jakmile to uvidím, navrhnu trasu.');
      return;
    }

    // obecný stav
    const parts = [];
    parts.push(state.vafit ? `VafiT: ${state.vafit.name}` : 'VafiT: žádný');
    parts.push(`hrdinů: ${state.heroes.length}`);
    parts.push(`příroda: ${state.nature.length}`);
    parts.push(`gps: ${state.gps.length}`);
    parts.push(`batole: ${state.batole.length}`);
    parts.push(`repo: ${state.repo.length}`);
    appendHlavounMsg('ai', '🧠 Hlavoun (stav): ' + parts.join(' • '));
  },
  heartbeat(state, bus) {
    // klidně později přidáme kontrolu konzistence
  }
};

/* ============================================================
   👧 ViriAgent – kreativka
   ============================================================ */
const ViriAgent = {
  name: "ViriAgent",
  lastSpeak: 0,
  init(state, bus) {
    appendHlavounMsg('ai', '💖 Viri: ahoj, jsem tu taky. Budu dělat z vašich dat příběhy ✨');
  },
  canHandle(text) {
    const t = (text || '').toLowerCase();
    return (
      !t ||
      t.includes('příběh') ||
      t.includes('batole') ||
      t.includes('deník') ||
      t.includes('příroda')
    );
  },
  async handle(text, state, bus) {
    const t = (text || '').toLowerCase();
    const now = Date.now();

    // aby nemluvila 2× za vteřinu
    if (now - this.lastSpeak < 500) return;
    this.lastSpeak = now;

    // konkrétní
    if (t.includes('příběh')) {
      if (state.vafit) {
        appendHlavounMsg('ai', `💖 Viri: napíšu mu kapitolu. „${state.vafit.name}“ bude sbírat přírodu a lidi. Přidej 3 položky do VAFT_NATURE_OBJECTS a já navážu.`);
      } else {
        appendHlavounMsg('ai', '💖 Viri: vyber nejdřív VafiTa v galerii, ať vím, kdo je hrdina příběhu 💠');
      }
      return;
    }

    if (t.includes('batole')) {
      appendHlavounMsg('ai', '💖 Viri: Batole svět budeme psát jemněji – ukládej si ho pod BATOLE_SVET, já ho pak spojím s příběhem velkého světa.');
      return;
    }

    // obecná doplňující reakce
    if (state.vafit && state.heroes.length) {
      appendHlavounMsg('ai', '💖 Viri: tohle už je dvojice – VafiT + hrdina. Můžeme jim psát mise a deník 🌿');
    } else if (state.vafit && !state.heroes.length) {
      appendHlavounMsg('ai', '💖 Viri: máš postavu, ale nemá člověka. Přidej hrdinu a já k nim dopíšu vazbu.');
    } else {
      appendHlavounMsg('ai', '💖 Viri: zatím nic moc nevidím, ale ten pulz světa tu je 🙂');
    }
  },
  heartbeat(state, bus) {
    // občasný jemný šepot
    if (state.vafit && Math.random() < 0.2) {
      appendHlavounMsg('ai', `💖 Viri: „${state.vafit.name}“ je připravený na další krok.`);
    }
  }
};

// start busu
document.addEventListener('DOMContentLoaded', () => {
  AgentBus.init();
  // aby to šlo volat z indexu:
  window.AgentBus = AgentBus;
});
