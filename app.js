// app.js
// hlavní lepidlo – UI, hrdinové, puls, napojení na engine

window.addEventListener("DOMContentLoaded", () => {
  const heroForm = document.getElementById("heroForm");
  const heroName = document.getElementById("heroName");
  const heroTeam = document.getElementById("heroTeam");
  const heroList = document.getElementById("heroList");

  const ideasBox = document.getElementById("ideasBox");
  const saveIdeasBtn = document.getElementById("saveIdeas");
  const ideasStatus = document.getElementById("ideasStatus");

  const moduleForm = document.getElementById("moduleForm");
  const moduleName = document.getElementById("moduleName");
  const moduleState = document.getElementById("moduleState");
  const moduleList = document.getElementById("moduleList");

  const engineBtn = document.getElementById("enginePing");
  const pulseLabel = document.getElementById("worldPulse");

  // init engine (meziprostor)
  VAF_engine.init("engineLog");

  // načíst uložené nápady
  const savedIdeas = localStorage.getItem("VAF_ideas");
  if (savedIdeas) {
    ideasBox.value = savedIdeas;
    ideasStatus.textContent = "uloženo v prohlížeči ✅";
  }

  // načíst hrdiny
  const heroes = loadHeroes();
  renderHeroes(heroes);

  // načíst moduly
  renderModules(VAF_engine.loadModules());

  heroForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = heroName.value.trim();
    const team = heroTeam.value;
    if (!name) return;
    const newHero = {
      id: "hero_" + Date.now(),
      name,
      team,
      createdAt: Date.now()
    };
    heroes.push(newHero);
    saveHeroes(heroes);
    renderHeroes(heroes);
    heroForm.reset();
  });

  function renderHeroes(list) {
    heroList.innerHTML = "";
    list.forEach(h => {
      const li = document.createElement("li");
      const teamObj = (window.VAF_teams || []).find(t => t.id === h.team);
      li.innerHTML = `
        <span>${h.name}</span>
        <span class="badge">${teamObj ? teamObj.name : h.team}</span>
      `;
      heroList.appendChild(li);
    });
  }

  function saveHeroes(list) {
    localStorage.setItem("VAF_heroes", JSON.stringify(list));
  }

  function loadHeroes() {
    return JSON.parse(localStorage.getItem("VAF_heroes") || "[]");
  }

  // nápady uložit
  saveIdeasBtn.addEventListener("click", () => {
    localStorage.setItem("VAF_ideas", ideasBox.value);
    ideasStatus.textContent = "uloženo ✅ (" + new Date().toLocaleTimeString() + ")";
  });

  // moduly
  moduleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const mod = {
      name: moduleName.value.trim(),
      state: moduleState.value
    };
    if (!mod.name) return;
    const mods = VAF_engine.saveModule(mod);
    renderModules(mods);
    moduleForm.reset();
  });

  function renderModules(mods) {
    moduleList.innerHTML = "";
    mods.forEach(m => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${m.name}</span>
        <span class="badge" style="background:${m.state === "enabled" ? "rgba(112,255,143,.2)" : "rgba(255,112,112,.2)"}">${m.state}</span>
      `;
      moduleList.appendChild(li);
    });
  }

  // engine ping
  engineBtn.addEventListener("click", () => {
    VAF_engine.pulse("ui", { action: "manual-ping" });
  });

  // engine může reagovat na pulsy
  VAF_engine.subscribe((evt) => {
    // tady budoucí WebGuardian / shop
  });

  // světový puls – každé 3s
  setInterval(() => {
    const ts = new Date().toLocaleTimeString();
    pulseLabel.textContent = `🫀 svět: puls ${ts}`;
    VAF_engine.pulse("world", { ts });
  }, 3000);

  // jednoduché "vykreslení" světa – placeholder
  const canvas = document.getElementById("worldCanvas");
  const ctx = canvas.getContext("2d");

  resizeCanvas();
  drawWorld(ctx);
  window.addEventListener("resize", () => {
    resizeCanvas();
    drawWorld(ctx);
  });

  function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  function drawWorld(ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const h = canvas.height;
    const size = Math.min(w, h) * 0.08;
    const teams = window.VAF_teams || [];
    const positions = [
      { x: size*1.4, y: size*1.4 },
      { x: w - size*1.4, y: size*1.4 },
      { x: size*1.4, y: h - size*1.4 },
      { x: w - size*1.4, y: h - size*1.4 },
    ];
    teams.forEach((t, i) => {
      const p = positions[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI*2);
      ctx.strokeStyle = "rgba(112,255,143,.7)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.fill();
      ctx.fillStyle = "#dbe2ff";
      ctx.font = "10px system-ui";
      ctx.fillText(t.name, p.x - size*1.1, p.y + size + 10);
    });

    // střed
    ctx.beginPath();
    ctx.arc(w/2, h/2, size*1.1, 0, Math.PI*2);
    ctx.strokeStyle = "rgba(13,164,255,.6)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "rgba(0,0,0,.35)";
    ctx.fill();
    ctx.fillStyle = "#dbe2ff";
    ctx.font = "11px system-ui";
    ctx.fillText("Vivere atque FruiT • core", w/2 - 80, h/2 + 3);
  }

  // ====== TADY DOPLNÍME TVŮJ PANEL SVĚTŮ/APLIKACÍ/VAFIT ======
  const VAFT_WORLDS = [
    { code: 'R', name: 'Radius', desc: 'Paprsek, světlo' },
    { code: 'A', name: 'Aetheris', desc: 'Éter, nebeská rovina' },
    { code: 'T', name: 'Tempora', desc: 'Časy, rytmus' },
    { code: 'Q', name: 'Quaerentia', desc: 'Hledání, touha po smyslu' },
    { code: 'U', name: 'Unum', desc: 'Jednota, celek' },
    { code: 'E', name: 'Exsolum', desc: 'Vyvstatí, proměna' },
    { code: 'F', name: 'Flamma', desc: 'Plamen stvoření' },
    { code: 'R2', name: 'Reverentia', desc: 'Úcta, řád' },
    { code: 'U2', name: 'Umbra', desc: 'Stín, hloubka' },
    { code: 'I', name: 'Imaginis', desc: 'Obraz, představa' },
    { code: 'T2', name: 'Fructum', desc: 'Plod, naplnění' }
  ];

  const VAFT_APPS = [
    { id: 'Vivere', label: 'Vivere (hlavní)', href: './' },
    { id: 'Braska-Hlava', label: 'Braska-Hlava', href: './Braska-Hlava/' },
    { id: 'Hlavoun', label: 'Hlavoun', href: './Hlavoun/' },
    { id: 'Meziprostor-Core', label: 'Meziprostor-Core', href: './Meziprostor-Core/' },
    { id: 'Michal-AI-Al-Klimek', label: 'Michal-AI-Al-Klimek', href: './Michal-AI-Al-Klimek/' },
    { id: 'VAFT-LetterLab', label: 'VAFT-LetterLab', href: './VAFT-LetterLab/' },
    { id: 'VAFT-MapWorld', label: 'VAFT-MapWorld', href: './VAFT-MapWorld/' },
    { id: 'VAFT-BearHead', label: 'VAFT-BearHead', href: './VAFT-BearHead/' },
    { id: 'VAFT-Doll', label: 'VAFT-Doll', href: './VAFT-Doll/' },
    { id: 'VAFT-Game', label: 'VAFT-Game', href: './VAFT-Game/' },
    { id: 'VAFT-GhostGirl', label: 'VAFT-GhostGirl', href: './VAFT-GhostGirl/' },
  ];

  const VAFT_VAFITS = [
    { id: 'glyph-me', glyph: "ً&’」", role: 'Ty + já + telefon' },
    { id: 'bear', glyph: "{*(•.)(.•)*}//", role: 'Medvěd / ochrana' },
    { id: 'core', glyph: "7¡A|V|A7¡", role: 'Jádro / VAFT' },
  ];

  function renderVAFTPanel() {
    const worldsEl = document.getElementById('worlds-list');
    const appsEl = document.getElementById('apps-list');
    const vafitEl = document.getElementById('vafit-list');

    if (worldsEl) {
      worldsEl.innerHTML = VAFT_WORLDS.map(w => `
        <button class="pill" title="${w.desc}">
          <div class="pill-code">${w.code}</div>
          <div class="pill-text">${w.name}</div>
        </button>
      `).join('');
    }

    if (appsEl) {
      appsEl.innerHTML = VAFT_APPS.map(a => `
        <button class="pill" onclick="window.location.href='${a.href}'">
          <div class="pill-text">${a.label}</div>
        </button>
      `).join('');
    }

    if (vafitEl) {
      vafitEl.innerHTML = VAFT_VAFITS.map(v => `
        <div class="vafit-row">
          <div class="vafit-glyph">${v.glyph}</div>
          <div class="vafit-meta">
            <div class="vafit-id">${v.id}</div>
            <div class="vafit-role">${v.role}</div>
          </div>
        </div>
      `).join('');
    }
  }

  // vykresli po načtení
  renderVAFTPanel();
}); // ← konec DOMContentLoaded

// přepínání panelů (mimo DOMContentLoaded, to je ok)
const tabButtons = document.querySelectorAll(".tab-btn");
const panels = document.querySelectorAll(".panel");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-tab");

    tabButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    panels.forEach(p => {
      if (p.id === target) p.classList.add("active");
      else p.classList.remove("active");
    });
  });
});

// PWA – SW
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js")
    .then(() => console.log("SW registrován"))
    .catch((err) => console.warn("SW chyba", err));
}

// ===== chat do Meziprostoru (jedna správná verze) =====
function sendToHlavoun() {
  const inp = document.getElementById('hlavoun-input') || document.getElementById('hlavounInput');
  if (!inp || !inp.value.trim()) return;
  const text = inp.value.trim();

  if (window.VAFT && window.VAFT.guardian) {
    window.VAFT.guardian.securePayload({ role: 'user', text })
      .then(secured => {
        if (typeof appendHlavounMsg === 'function') {
          appendHlavounMsg('user', text);
        }
        inp.value = '';

        if (window.HlavounSystem && typeof window.HlavounSystem.think === 'function') {
          window.HlavounSystem.think(secured);
        }
        if (window.Pikos && typeof window.Pikos.talk === 'function') {
          window.Pikos.talk(secured);
        }
      })
      .catch(err => {
        console.warn('Guardian error:', err);
      });
  } else {
    if (typeof appendHlavounMsg === 'function') {
      appendHlavounMsg('user', text);
    }
    if (window.HlavounSystem && typeof window.HlavounSystem.think === 'function') {
      window.HlavounSystem.think(text);
    }
    if (window.Pikos && typeof window.Pikos.talk === 'function') {
      window.Pikos.talk(text);
    }
    inp.value = '';
  }
}
