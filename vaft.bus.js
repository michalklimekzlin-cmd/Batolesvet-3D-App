// vaft.bus.js
window.VAFT = window.VAFT || {};

(function (VAFT) {
  const listeners = {};

  VAFT.bus = {
    on(channel, fn) {
      if (!listeners[channel]) listeners[channel] = [];
      listeners[channel].push(fn);
    },
    emit(channel, payload) {
      const subs = listeners[channel] || [];
      subs.forEach(fn => {
        try { fn(payload); } catch (e) { console.warn('bus err', e); }
      });
    },
    // pro debug
    channels() {
      return Object.keys(listeners);
    }
  };

})(window.VAFT);
