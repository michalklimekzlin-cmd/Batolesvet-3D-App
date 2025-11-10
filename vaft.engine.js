// vaft.engine.js
window.VAFT = window.VAFT || {};

(function (VAFT) {

  function tick() {
    if (!VAFT.agents) return;

    // 1) všichni si tlučou srdce
    Object.values(VAFT.agents).forEach(a => a.tick());

    // 2) Hlavoun občas myslí
    VAFT.agents.Hlavoun.think();

    // 3) Pikos může něco vyventilovat (třeba stav)
    VAFT.agents.Pikos.output({
      heartbeat: VAFT.agents.Pikos.heartbeat,
      xp: VAFT.agents.Pikos.xp
    });

    // 4) vyhlásíme heartbeat pro ostatní moduly
    VAFT.bus.emit('system.heartbeat', { ts: Date.now() });
  }

  // spustit rytmus
  setInterval(tick, 3000); // tvoje oblíbené 3s

})(window.VAFT);
