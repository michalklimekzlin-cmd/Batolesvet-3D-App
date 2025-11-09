// vaft.hub.js
// launcher pro celý tvůj repozitář Vivere-atque-FruiT
// nic nemaže, jen do hlavní stránky přidá panel s odkazy na všechny tvoje podapky

(function() {
  if (document.getElementById("vaft-hub")) return;

  // seznam složek podle toho, co máš v repu
  // když přidáš další složku, jen ji sem připíšeš
  const APPS = [
    { name: "Vivere (hlavní)", desc: "hlavní svět", url: "./Vivere/" },
    { name: "Braska-Hlava", desc: "bráška AI hlava", url: "./Braska-Hlava/" },
    { name: "Hlavoun", desc: "hlavoun modul", url: "./Hlavoun/" },
    { name: "Meziprostor-Core", desc: "meziprostor", url: "./Meziprostor-Core/" },
    { name: "Michal-AI-Al-Klimek", desc: "tvoje AI appka", url: "./Michal-AI-Al-Klimek/" },
    { name: "VAFT-LetterLab", desc: "písmena / obchod", url: "./VAFT-LetterLab/" },
    { name: "VAFT-MapWorld", desc: "pokud ji máš", url: "./VAFT-MapWorld/" },
    { name: "VAFT-BearHead", desc: "medvědí hlava", url: "./VAFT-BearHead/" },
    { name: "VAFT-Doll", desc: "doll modul", url: "./VAFT-Doll/" },
    { name: "VAFT-Game", desc: "hra", url: "./VAFT-Game/" },
    { name: "VAFT-GhostGirl", desc: "ghost girl", url: "./VAFT-GhostGirl/" },
    { name: "VAFT-Girls", desc: "girls", url: "./VAFT-Girls/" },
    { name: "VAFT-Jizva", desc: "jizva modul", url: "./VAFT-Jizva/" },
    { name: "VAFT-Lady", desc: "lady modul", url: "./VAFT-Lady/" },
    { name: "VAFT-Lilies", desc: "lilies", url: "./VAFT-Lilies/" },
    { name: "VAFT-StarSkull", desc: "star skull", url: "./VAFT-StarSkull/" },
    { name: "mapa", desc: "2D mapa", url: "./mapa/" },
    { name: "mapa-3d", desc: "3D mapa", url: "./mapa-3d/" },
    { name: "build", desc: "build náhled", url: "./build/" },
  ];

  // vytvoříme panel
  const hub = document.createElement("div");
  hub.id = "vaft-hub";
  hub.innerHTML = `
    <style>
      #vaft-hub {
        position: fixed;
        bottom: 10px;
        right: 10px;
        width: 240px;
        max-height: 70vh;
        background: rgba(0,0,0,.8);
        border: 1px solid rgba(156,200,255,.15);
        border-radius: 14px;
        backdrop-filter: blur(12px);
        font-family: system-ui, -apple-system, sans-serif;
        color: #e8f4ff;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 9999;
      }
      #vaft-hub-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 10px 3px;
      }
      #vaft-hub-title {
        font-size: 12px;
        font-weight: 600;
      }
      #vaft-hub-body {
        overflow-y: auto;
        padding: 6px 8px 6px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .vaft-hub-app {
        background: rgba(255,255,255,.01);
        border: 1px solid rgba(255,255,255,.01);
        border-radius: 9px;
        padding: 4px 5px 3px;
        cursor: pointer;
      }
      .vaft-hub-app-name { font-size: 12px; }
      .vaft-hub-app-desc { font-size: 10px; opacity: .6; }
      #vaft-hub-footer {
        border-top: 1px solid rgba(255,255,255,.02);
        padding: 5px 8px 8px;
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
      }
      .vaft-hub-btn {
        background: rgba(156,200,255,.05);
        border: 1px solid rgba(156,200,255,.25);
        border-radius: 8px;
        font-size: 10px;
        padding: 3px 6px 2px;
        cursor: pointer;
      }
      #vaft-hub-collapse {
        background: none;
        border: none;
        color: #fff;
        opacity: .5;
        cursor: pointer;
      }
      @media (max-width: 600px) {
        #vaft-hub { width: 92vw; right: 4vw; }
      }
    </style>
    <div id="vaft-hub-header">
      <div id="vaft-hub-title">VAFT – tvoje appky</div>
      <button id="vaft-hub-collapse">–</button>
    </div>
    <div id="vaft-hub-body"></div>
    <div id="vaft-hub-footer">
      <button class="vaft-hub-btn" data-action="fuel">palivo</button>
      <button class="vaft-hub-btn" data-action="spell">kouzlo</button>
      <button class="vaft-hub-btn" data-action="tree">strom</button>
    </div>
  `;
  document.body.appendChild(hub);

  const body = hub.querySelector("#vaft-hub-body");

  APPS.forEach(app => {
    const div = document.createElement("div");
    div.className = "vaft-hub-app";
    div.dataset.url = app.url;
    div.innerHTML = `
      <div class="vaft-hub-app-name">${app.name}</div>
      <div class="vaft-hub-app-desc">${app.desc}</div>
    `;
    div.addEventListener("click", () => openApp(app.url));
    body.appendChild(div);
  });

  // collapse
  hub.querySelector("#vaft-hub-collapse").addEventListener("click", () => {
    const b = hub.querySelector("#vaft-hub-body");
    const f = hub.querySelector("#vaft-hub-footer");
    const hidden = b.style.display === "none";
    b.style.display = hidden ? "flex" : "none";
    f.style.display = hidden ? "flex" : "none";
  });

  // akce vespod
  hub.querySelectorAll(".vaft-hub-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const act = btn.dataset.action;
      if (act === "fuel") showFuel();
      if (act === "spell") doSpell();
      if (act === "tree") addTree();
    });
  });

  function openApp(url) {
    // pokud máš v hlavním indexu <iframe id="app-frame">, použije to ten iframe
    const frame = document.getElementById("app-frame");
    if (frame) {
      frame.src = url;
    } else {
      // jinak prostě přejdi do složky
      window.location.href = url;
    }
  }

  function showFuel() {
    if (window.VAFT && VAFT.fuel && typeof VAFT.fuel.getBag === "function") {
      const bag = VAFT.fuel.getBag();
      alert("Palivo (písmena):\n" + JSON.stringify(bag, null, 2));
    } else {
      alert("Palivo není načtené.");
    }
  }

  function doSpell() {
    if (window.VAFT && VAFT.spell && typeof VAFT.spell.cast === "function") {
      VAFT.spell.cast("2 stromy u baráku");
    } else {
      alert("Spell modul není načtený.");
    }
  }

  function addTree() {
    // zkus sjednocené API z vaft.all.js
    if (window.VAFT && VAFT.ALL && typeof VAFT.ALL.spawn === "function") {
      VAFT.ALL.spawn({ type: "tree", count: 1, near: "house" });
      return;
    }
    // fallback – zkus přímo VAFT.world
    if (window.VAFT && VAFT.world && typeof VAFT.world.spawn === "function") {
      VAFT.world.spawn({ type: "tree", count: 1, near: "house" });
      return;
    }
    alert("Nemám modul světa pro vykreslení stromu.");
  }

  console.log("VAFT HUB: načteno z hlavního adresáře.");
})();
