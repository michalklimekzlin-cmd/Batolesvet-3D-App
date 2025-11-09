// 🧠 Hlavoun v2.5 — textový engine
// cíl: umí číst tvoje repo + localStorage + odpovídá "lidsky" podle stavu světa

const HlavounSystem = {
  REPO_OWNER: "michalklimekzlin-cmd",
  REPO_NAME: "Vivere-atque-FruiT",

  state: {
    lastRepoCheck: 0,
    repo: [],
    hasVafit: false,
    heroes: [],
    hasNature: false,
    hasGPS: false,
    hasBatole: false
  },

  init() {
    this.markActive();
    this.loadChatLog();
    this.refreshLocalState();
    this.think("");          // úvodní analýza
    setInterval(() => this.heartbeat(), 5000); // občas koukni na stav
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
    }
  },

  markActive() {
    const el = document.getElementById("core-status");
    if (el) el.textContent = "🧠 Hlavoun systém • aktivní";
  },

  loadChatLog() {
    const log = JSON.parse(localStorage.getItem('VAFT_HLAVOUN_LOG') || '[]');
    if (log.length) {
      log.forEach(m => appendHlavounMsg(m.role, m.text));
    } else {
      appendHlavounMsg('ai', 'Jsem Hlavoun. Vidím tvoje appky, repo i localStorage. Napiš třeba „příběh“, „repo“, „gps“ nebo „batole svět“.');
    }
  },

  // přečteme localStorage a uložíme do state
  refreshLocalState() {
    const vafit  = this.safeJSON('VAFT_SELECTED_VAFIT');
    const heroes = this.safeJSON('VAFT_HEROES') || [];
    const nature = this.safeJSON('VAFT_NATURE_OBJECTS') || [];
    const gps    = this.safeJSON('VAFT_GPS_LOG') || [];
    const batole = this.safeJSON('BATOLE_SVET') || [];

    this.state.hasVafit = !!vafit;
    this.state.heroes = heroes;
    this.state.hasNature = nature.length > 0;
    this.state.hasGPS = gps.length > 0;
    this.state.hasBatole = batole.length > 0;
    this.state.vafit = vafit || null;
  },

  // tenhle engine vyrobí odpověď z dostupných dat
  buildReply(intent, extra = {}) {
    const s = this.state;
    const lines = [];

    // společný kontext
    const ctx = [];
    if (s.hasVafit) ctx.push(`VafiT: ${s.vafit.name}`);
    if (s.heroes.length) ctx.push(`hrdinů: ${s.heroes.length}`);
    if (s.hasNature) ctx.push(`příroda: OK`);
    if (s.hasGPS) ctx.push(`gps: OK`);
    if (s.hasBatole) ctx.push(`batole svět: OK`);
    if (s.repo.length) ctx.push(`repo: ${s.repo.length} položek`);
    const ctxLine = ctx.length ? `(${ctx.join(' • ')})` : '';

    switch (intent) {
      case 'greet':
        lines.push('Ahoj, jsem Hlavoun tohohle světa. Vidím tvoje data a pomůžu ti je poskládat.');
        if (!s.hasVafit) lines.push('Začni tím, že ve VafiT galerii vybereš glyph.');
        break;

      case 'story':
        if (!s.hasVafit) {
          lines.push('Nejdřív si vyber VafiTa, ať vím, komu to vyprávím 🙂');
        } else {
          lines.push(`Příběh pro „${s.vafit.name}“: bude nosič deníku. Úkol 1: ulož 3 objekty z přírody. Úkol 2: přidej hrdinu, který je sbírá. Úkol 3: exportuj JSON.`);
        }
        break;

      case 'gps':
        lines.push('GPS ukládej pod klíč VAFT_GPS_LOG jako pole objektů: [{lat, lng, time}].');
        if (s.hasGPS) lines.push('Vidím, že už nějaká GPS data máš – můžeme na tom postavit výpravy.');
        break;

      case 'repo':
        if (s.repo.length) {
          lines.push('V repu vidím: ' + s.repo.join(', '));
        } else {
          lines.push('Repo se mi teď nepodařilo načíst, ale klidně to zkus znova.');
        }
        break;

      case 'batole':
        lines.push('Batole svět: ukládej pod BATOLE_SVET. Beru to jako paralelní deník k přírodě – takže stejná logika.');
        break;

      case 'status':
      default:
        if (!s.hasVafit) {
          lines.push('Nemáš vybraného VafiTa. Otevři “Systém → VafiT galerie” a klikni.');
        } else if (!s.heroes.length) {
          lines.push(`Máš VafiTa „${s.vafit.name}“, ale nemáš hrdinu. Přidej postavu v záložce Hrdinové.`);
        } else {
          lines.push(`Vidím VafiTa i hrdiny. Můžeme to propojit a začít psát mise.`);
          if (!s.hasNature) lines.push('Přidej 1 objekt z přírody, ať vidím, že chodíš ven.');
          if (s.hasGPS) lines.push('GPS máš – můžeme dělat “cestu dne”.');
        }
        break;
    }

    if (ctxLine) lines.push(ctxLine);
    return lines.join(' ');
  },

  // hlavní funkce – volá se, když na tebe uživatel mluví
  async think(userText) {
    this.refreshLocalState();

    // ochrana před cizím repem
    const banned = ['github.com/', 'api.github.com', 'repos/', 'https://github.com/'];
    if (userText && banned.some(b => userText.includes(b))) {
      appendHlavounMsg('ai', `Čtu jen ${this.REPO_OWNER}/${this.REPO_NAME}.`);
      return;
    }

    // když člověk něco napsal → pokusíme se rozpoznat intent
    if (userText) {
      const intent = this.detectIntent(userText);
      if (intent === 'repo') {
        await this.readRepo(true);
        appendHlavounMsg('ai', this.buildReply('repo'));
        return;
      }
      // ostatní odpovědi
      appendHlavounMsg('ai', this.buildReply(intent));
      return;
    }

    // když nic nenapsal → jen status
    appendHlavounMsg('ai', this.buildReply('status'));
  },

  // velmi jednoduchá detekce z textu
  detectIntent(text) {
    const t = text.toLowerCase();
    if (t.includes('ahoj') || t.includes('čau') || t.includes('nazdar')) return 'greet';
    if (t.includes('příběh') || t.includes('story')) return 'story';
    if (t.includes('gps')) return 'gps';
    if (t.includes('repo')) return 'repo';
    if (t.includes('batole')) return 'batole';
    if (t.includes('stav') || t.includes('status') || t.includes('co vidíš')) return 'status';
    return 'status';
  },

  // běží každých pár sekund – když dlouho nebylo repo → koukni
  heartbeat() {
    const now = Date.now();
    if (now - this.state.lastRepoCheck > 60000) {
      this.readRepo(false);
    }
  },

  async readRepo(force) {
    const now = Date.now();
    if (!force && now - this.state.lastRepoCheck < 60000) return;
    try {
      const url = `https://api.github.com/repos/${this.REPO_OWNER}/${this.REPO_NAME}/contents`;
      const res = await fetch(url);
      const data = await res.json();
      this.state.repo = Array.isArray(data) ? data.map(f => f.name) : [];
      this.state.lastRepoCheck = now;
      // ne vždycky to hned vypisuj, ať to nezaspamuje – do chatu jen když je to vyžádané
    } catch (e) {
      // když to nejde, jen to nehlásíme pořád dokola
      if (force) appendHlavounMsg('ai', 'Repo teď nemůžu načíst (asi GitHub limit nebo offline).');
    }
  },

  safeJSON(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch { return null; }
  }
};

// start
document.addEventListener('DOMContentLoaded', () => {
  HlavounSystem.init();
});
