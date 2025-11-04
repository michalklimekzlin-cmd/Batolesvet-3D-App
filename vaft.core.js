// vaft.core.js
// 🟩 Vivere atque FruiT – sdílené jádro entit (heartbeat + info + UI)

(function () {
  const VAFT_NODE_ID = (() => {
    try {
      const path = window.location.pathname.split("/").filter(Boolean);
      return path[path.length - 1] || "VAFT-Unknown";
    } catch {
      return "VAFT-Unknown";
    }
  })();

  const VAFT_HEARTBEAT_KEY = "vaft_heartbeat_v1";
  const VAFT_HEARTBEAT_TTL = 8000;

  function sendHeartbeat() {
    const now = Date.now();
    let map = {};
    try {
      map = JSON.parse(localStorage.getItem(VAFT_HEARTBEAT_KEY)) || {};
    } catch {}
    map[VAFT_NODE_ID] = { ts: now };
    localStorage.setItem(VAFT_HEARTBEAT_KEY, JSON.stringify(map));
  }

  function getOnlineNodes() {
    const now = Date.now();
    let map = {};
    try {
      map = JSON.parse(localStorage.getItem(VAFT_HEARTBEAT_KEY)) || {};
    } catch {}
    return Object.keys(map).filter(id => now - map[id].ts < VAFT_HEARTBEAT_TTL);
  }

  function initUI() {
    let box = document.getElementById("vaftHUD");
    if (!box) {
      box = document.createElement("div");
      box.id = "vaftHUD";
      box.style.cssText = `
        position:fixed;bottom:8px;right:8px;
        font-family:system-ui,sans-serif;
        font-size:.7rem;color:#7f8;
        background:rgba(10,20,10,.25);
        padding:.4rem .7rem;border-radius:.5rem;
        backdrop-filter:blur(6px) saturate(140%);
        z-index:9999;
      `;
      document.body.appendChild(box);
    }
    const render = () => {
      const online = getOnlineNodes();
      box.innerHTML = `
        <b style="color:#8f8">VAFT</b> <small>${VAFT_NODE_ID}</small><br>
        <span style="opacity:.7">online:</span> ${online.join(", ")}
      `;
    };
    render();
    setInterval(render, 4000);
  }

  // pulzování
  sendHeartbeat();
  setInterval(sendHeartbeat, 3000);
  setTimeout(initUI, 1000);

  // globální přístup
  window.VAFT = { id: VAFT_NODE_ID, getOnlineNodes };
})();
