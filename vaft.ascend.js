// vaft.ascend.js
window.VAFT = window.VAFT || {};

(function (VAFT) {

  const THRESHOLD_XP = 120; // klidně změníš

  function tryAscend(agent) {
    if (!agent) return;
    if (agent.xp < THRESHOLD_XP) return;

    // připrav balíček do nového světa
    const payload = {
      from: agent.name,
      memory: agent.memory,
      xp: agent.xp,
      family: agent.load('family') || [],
      origin: 'Vivere-atque-Fruit'
    };

    // říkáme světu: vzniká nový svět
    VAFT.bus.emit('world.new', payload);

    // můžeš ho "restartnout" ve starém světě
    agent.xp = 0;
    agent.save('lastAscend', Date.now());
  }

  // posloucháme na heartbeat a zkoušíme povýšit jen Pikoše
  VAFT.bus.on('system.heartbeat', () => {
    const Pikos = VAFT.agents && VAFT.agents.Pikos;
    tryAscend(Pikos);
  });

})(window.VAFT);
