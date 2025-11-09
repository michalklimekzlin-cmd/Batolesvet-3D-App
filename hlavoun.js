// 🧠 Hlavoun síť Vivere atque FruiT + BatoleSvět
// čte: localStorage, strukturu repozitáře (jen tvoje repo), a navrhuje další krok

const HlavounSystem = {
  REPO_OWNER: "michalklimekzlin-cmd",
  REPO_NAME: "Vivere-atque-FruiT",
  init() {
    this.markActive();
    this.loadChatLog();
    // hned po startu zkusíme přečíst svět
    this.think("");
  },

  markActive() {
    const el = document.getElementById("core-status");
    if (el) el.textContent = "🧠 Hlavoun systém • aktivní";
  },

  loadChatLog() {
    const log = JSON.parse(localStorage.getItem('VAFT_HLAVOUN_LOG') || '[]');
    if (log.length) {
      log.forEach(m => {
        if (typeof appendHlavounMsg === "function") {
          appendHlavounMsg(m.role, m.text);
        }
      });
    } else {
      appendHlavounMsg('ai', 'Jsem Hlavoun. Vidím tvoji hru. Vyber VafiTa nebo přidej hrdinu a já navrhnu další krok.');
    }
  },

  async think(userText) {
    // zakázat jiné repozitáře
    const banned = ['github.com/', 'api.github.com', 'repos/', 'https://github.com/'];
    if (userText && banned.some(b => userText.includes(b))) {
      appendHlavounMsg('ai', 'Čtu jen tvoje repo: '+this.REPO_OWNER+'/'+this.REPO_NAME+'.');
      return;
    }

    // načíst localStorage data
    const vafit = this.safeJSON('VAFT_SELECTED_VAFIT');
    const heroes = this.safeJSON('VAFT_HEROES') || [];
    const nature = this.safeJSON('VAFT_NATURE_OBJECTS') || [];
    const gps = this.safeJSON('VAFT_GPS_LOG') || [];
    const batole = this.safeJSON('BATOLE_SVET') || []; // kdyby sis tam něco ukládal

    // reagovat na explicitní dotazy
    if (userText) {
      const t = userText.toLowerCase();
      if (t.includes('příběh')) {
        if (vafit) {
          appendHlavounMsg('ai', `Příběh pro „${vafit.name}“: může nosit deníky z přírody a hlásit GPS kroky. Ulož přírod. objekt do VAFT_NATURE_OBJECTS a já to uvidím.`);
        } else {
          appendHlavounMsg('ai', 'Nejdřív si vyber VafiTa v Systému.');
        }
        return;
      }
      if (t.includes('gps')) {
        appendHlavounMsg('ai', 'GPS ukládej jako [{lat,lng,time}] do VAFT_GPS_LOG. Pak ti navrhnu trasové úkoly.');
        return;
      }
      if (t.includes('batole')) {
        appendHlavounMsg('ai', 'Batole svět detekován: tyhle data si můžeš ukládat pod klíč BATOLE_SVET a já je tu taky uvidím.');
        return;
      }
      if (t.includes('repo')) {
        await this.readRepo();
        return;
      }
    }

    // obecná pravidla
    if (!vafit) {
      appendHlavounMsg('ai', 'Ještě nevidím vybraného VafiTa. Otevři „VafiT galerie“ → klikni na znak → vrať se.');
      return;
    }

    if (vafit && !heroes.length) {
      appendHlavounMsg('ai', `Máš vybraného VafiTa „${vafit.name}“, ale nemáš hrdinu. Přidej v záložce Hrdinové aspoň jednoho člověka.`);
      return;
    }

    if (vafit && heroes.length) {
      let msg = `Vidím hrdinu „${heroes[heroes.length-1].name}“ a VafiTa „${vafit.name}“. Propojíme je. `;
      if (!nature.length) {
        msg += 'Ještě nemáš přírodní objekty (VAFT_NATURE_OBJECTS). Přidej jeden a budu je počítat.';
      } else {
        msg += `Už máš ${nature.length} přírodních objektů – můžeme dělat deník.`;
      }
      if (gps.length) {
        msg += ` Máš i GPS stopu (${gps.length} bodů) – můžu ti navrhnout import do mapy.`;
      }
      appendHlavounMsg('ai', msg);
    }
  },

  async readRepo() {
    const url = `https://api.github.com/repos/${this.REPO_OWNER}/${this.REPO_NAME}/contents`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const names = data.map(f => f.name).join(', ');
      appendHlavounMsg('ai', '📁 V repu vidím: '+names);
      if (!names.includes('VafiT-gallery')) {
        appendHlavounMsg('ai', 'Chybí mi VafiT-gallery složka, bez ní neumím vybírat glyphy.');
      }
    } catch(e) {
      appendHlavounMsg('ai', 'Repozitář teď nemůžu načíst (limit / offline).');
    }
  },

  safeJSON(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch(e){ return null; }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js');
  HlavounSystem.init();
});
