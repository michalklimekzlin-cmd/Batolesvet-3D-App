// src/engine.js
const VAF_engine = (() => {
  let logEl = null;

  function init(logId) {
    logEl = document.getElementById(logId);
    log("Meziprostor inicializován.");
  }

  function log(msg) {
    const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
    if (logEl) {
      logEl.textContent = line + "\n" + logEl.textContent;
    } else {
      console.log(line);
    }
  }

  function pulse(from = "world", payload = {}) {
    log(`pulse od: ${from}`);
  }

  function saveModule(mod) {
    const mods = loadModules();
    const existing = mods.find(m => m.name === mod.name);
    if (existing) existing.state = mod.state;
    else mods.push(mod);
    localStorage.setItem("VAF_modules", JSON.stringify(mods));
    log(`modul ${mod.name} → ${mod.state}`);
    return mods;
  }

  function loadModules() {
    return JSON.parse(localStorage.getItem("VAF_modules") || "[]");
  }

  return { init, log, pulse, saveModule, loadModules };
})();
