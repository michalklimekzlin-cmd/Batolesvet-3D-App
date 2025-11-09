// vaft.hub.js (skupinová verze)
(function() {
  if (document.getElementById("vaft-hub")) return;

  // 1) definice skupin podle toho, co máš v repu
  const GROUPS = [
    {
      name: "🧠 Core / AI / Hlava",
      items: [
        { name: "Braska-Hlava", url: "./Braska-Hlava/", desc: "AI hlava" },
        { name: "Hlavoun", url: "./Hlavoun/", desc: "tvoje hlava" },
        { name: "Michal-AI-Al-Klimek", url: "./Michal-AI-Al-Klimek/", desc: "osobní AI appka" },
        { name: "Meziprostor-Core", url: "./Meziprostor-Core/", desc: "meziprostor" }
      ]
    },
    {
      name: "🛠 VAFT moduly",
      items: [
        { name: "VAFT-LetterLab", url: "./VAFT-LetterLab/", desc: "písmena → obchod" },
        { name: "VAFT-Game", url: "./VAFT-Game/", desc: "herní část" },
        { name: "VAFT-Doll", url: "./VAFT-Doll/", desc: "doll modul" },
        { name: "VAFT-BearHead", url: "./VAFT-BearHead/", desc: "medvědí hlava" },
        { name: "VAFT-Lady", url: "./VAFT-Lady/", desc: "lady" },
        { name: "VAFT-Jizva", url: "./VAFT-Jizva/", desc: "jizva" }
      ]
    },
    {
      name: "🌍 Mapy / světy",
      items: [
        { name: "Vivere", url: "./Vivere/", desc: "hlavní svět" },
        { name: "mapa", url: "./mapa/", desc: "2D mapa" },
        { name: "mapa-3d", url: "./mapa-3d/", desc: "3D mapa" },
        { name: "VAFT-MapWorld", url: "./VAFT-MapWorld/", desc: "dům + stromy" }
      ]
    },
    {
      name: "🎭 Postavy / vizuál",
      items: [
        { name: "VAFT-GhostGirl", url: "./VAFT-GhostGirl/", desc: "ghost girl" },
        { name: "VAFT-Girls", url: "./VAFT-Girls/", desc: "girls" },
        { name: "VAFT-Lilies", url: "./VAFT-Lilies/", desc: "lilies" },
        { name: "VAFT-StarSkull", url: "./VAFT-StarSkull/", desc: "star skull" }
      ]
    },
    {
      name: "⚗️ Build / test",
      items: [
        { name: "build", url: "./build/", desc: "build náhled" }
      ]
    }
  ];

  // 2) vytvoření panelu
  const hub = document.createElement("div");
  hub.id = "vaft-hub";
  hub.innerHTML = `
    <style>
      #vaft-hub {
        position: fixed;
        bottom: 10px;
        right: 10px;
        width: 260px;
        max-height: 70vh;
        background: rgba(0,0,0,.78);
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
      #vaft-hub-title { font-size: 12px; font-weight: 600; }
      #vaft-hub-body {
        overflow-y: auto;
        padding: 4px 6px 6px;
      }
      .vaft-group {
        margin-bottom: 6px;
        border: 1px solid rgba(255,255,255,.01);
        border-radius: 10px;
        background: rgba(255,255,255,.01);
      }
      .vaft-group-header {
        padding: 5px 6px 4px;
        font-size: 11px;
        font-weight: 500;
        display: flex;
        justify-content: space-between;
        cursor: pointer;
      }
      .vaft-group-body {
        display: none;
        padding: 4px 4px 6px;
        display: none;
        flex-direction: column;
        gap: 4px;
      }
      .vaft-app {
        background: rgba(255,255,255,.01);
        border: 1px solid rgba(255,255,255,.01);
        border-radius: 7px;
        padding: 3px 5px 2px;
        cursor: pointer;
      }
      .vaft-app-name { font-size: 11px; }
      .vaft-app-desc { font-size: 9px; opacity: .5; }
      #vaft-hub-footer {
        border-top: 1px solid rgba(255,255,255,.02);
        padding: 5px 6px 7px;
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
      <div id="vaft-hub-title">Vivere atque FruiT • přehled</div>
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

  // 3) naplnění skupin
  GROUPS.forEach(group => {
    const g = document.createElement("div");
    g.className = "vaft-group";

    const gh = document.createElement("div");
    gh.className = "vaft-group-header";
    gh.innerHTML = `<span>${group.name}</span><span>＋</span>`;
    g.appendChild(gh);

    const gb = document.createElement("div");
    gb.className = "vaft-group-body";
    group.items.forEach(app => {
      const a = document.createElement("div");
      a.className = "vaft-app";
      a.dataset.url = app.url;
      a.innerHTML = `
        <div class="vaft-app-name">${app.name}</div>
        <div class="vaft-app-desc">${app.desc || ""}</div>
      `;
      a.addEventListener("click", () => openApp(app.url));
      gb.appendChild(a);
    });
    g.appendChild(gb);

    gh.addEventListener("click", () => {
      const isOpen = gb.style.display === "flex";
      gb.style.display = isOpen ? "none" : "flex";
      gh.querySelector("span:last-child").textContent = isOpen ? "＋" : "－";
    });

    body.appendChild(g);
  });

  // collapse celé hub okno
  hub.querySelector("#vaft-hub-collapse").addEventListener("click", () => {
    const b = hub.querySelector("#vaft-hub-body");
    const f = hub.querySelector("#vaft-hub-footer");
    const hidden = b.style.display === "none";
    b.style.display = hidden ? "block" : "none";
    f.style.display = hidden ? "flex" : "none";
  });

  // tlačítka dole
  hub.querySelectorAll(".vaft-hub-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const act = btn.dataset.action;
      if (act === "fuel") showFuel();
      if (act === "spell") doSpell();
      if (act === "tree") addTree();
    });
  });

  function openApp(url) {
    const frame = document.getElementById("app-frame");
    if (frame) {
      frame.src = url;
    } else {
      window.location.href = url;
    }
  }

  function showFuel() {
    if (window.VAFT && VAFT.fuel && typeof VAFT.fuel.getBag === "function") {
      alert("Palivo:\n" + JSON.stringify(VAFT.fuel.getBag(), null, 2));
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
    if (window.VAFT && VAFT.ALL && typeof VAFT.ALL.spawn === "function") {
      VAFT.ALL.spawn({ type: "tree", count: 1, near: "house" });
    } else if (window.VAFT && VAFT.world && typeof VAFT.world.spawn === "function") {
      VAFT.world.spawn({ type: "tree", count: 1, near: "house" });
    } else {
      alert("Nemám modul světa pro strom.");
    }
  }

  console.log("VAFT HUB (skupiny): aktivní");
})();
