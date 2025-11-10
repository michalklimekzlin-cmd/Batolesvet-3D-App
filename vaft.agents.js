// vaft.agents.js
window.VAFT = window.VAFT || {};

(function (VAFT) {

  // společná základna – mají všichni tři
  function createBaseAgent(name) {
    return {
      name,
      memory: {},
      xp: 0,
      heartbeat: 0,
      say(msg) {
        VAFT.bus.emit('chat.out', { from: name, msg });
      },
      save(key, value) {
        this.memory[key] = value;
        try {
          localStorage.setItem(`VAFT_${name}_${key}`, JSON.stringify(value));
        } catch (e) {}
      },
      load(key) {
        if (this.memory[key]) return this.memory[key];
        try {
          const v = localStorage.getItem(`VAFT_${name}_${key}`);
          return v ? JSON.parse(v) : null;
        } catch (e) { return null; }
      },
      tick() {
        this.heartbeat++;
        this.xp++;
      }
    };
  }

  const Hlavoun = createBaseAgent('Hlavoun');
  const Viri    = createBaseAgent('Viri');
  const Pikos   = createBaseAgent('Pikos');

  // Hlavoun – rozhoduje
  Hlavoun.think = function () {
    // tady můžeš později dát tvoje pravidla
    VAFT.bus.emit('logic.decided', { by: 'Hlavoun', ts: Date.now() });
  };

  // Viri – zapisuje
  Viri.observe = function (data) {
    const log = this.load('log') || [];
    log.push({ ts: Date.now(), data });
    this.save('log', log);
  };
  VAFT.bus.on('logic.decided', (d) => Viri.observe(d));

  // Pikos – ventil ven (hra / UI)
  Pikos.output = function (data) {
    // zatím jen pošle ven
    VAFT.bus.emit('game.out', { from: 'Pikos', payload: data });
  };

  // zveřejnit
  VAFT.agents = { Hlavoun, Viri, Pikos };

})(window.VAFT);
