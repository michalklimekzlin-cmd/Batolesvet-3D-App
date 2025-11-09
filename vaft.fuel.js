// vaft.fuel.js
window.VAFT = window.VAFT || {};

VAFT.fuel = (function() {
  // nádrž paliva – písmena
  let bag = loadBag();

  // základní abeceda – když budeme chtít auto-generovat
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // init může spustit třeba pulsové generování
  function init() {
    // pokud chceš čistě pasivní generování každých X s:
    // setInterval(generateRandom, 15000);
    render && render();
  }

  // přidá 1 nebo víc písmen
  function addLetters(lettersArr) {
    lettersArr.forEach(l => {
      const up = l.toUpperCase();
      bag[up] = (bag[up] || 0) + 1;
    });
    saveBag();
    render && render();
  }

  // přidá náhodné písmeno – to můžeš volat z heartbeatu
  function generateRandom() {
    const ch = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    addLetters([ch]);
  }

  // ověří, jestli máme palivo na dané slovo
  function hasWord(word) {
    const need = {};
    word.toUpperCase().split("").forEach(ch => {
      need[ch] = (need[ch] || 0) + 1;
    });
    for (const ch in need) {
      if ((bag[ch] || 0) < need[ch]) return false;
    }
    return true;
  }

  // spálí palivo – zaplacení slovem
  function consumeWord(word) {
    word.toUpperCase().split("").forEach(ch => {
      bag[ch] -= 1;
      if (bag[ch] <= 0) delete bag[ch];
    });
    saveBag();
    render && render();
  }

  // veřejný getter
  function getBag() {
    return Object.assign({}, bag);
  }

  // možnost nastavit rendrovací callback (třeba z LetterLabu)
  let render = null;
  function onRender(fn) {
    render = fn;
  }

  // storage
  function saveBag() {
    try {
      localStorage.setItem("VAFT_FUEL_BAG", JSON.stringify(bag));
    } catch (e) {}
  }
  function loadBag() {
    try {
      const raw = localStorage.getItem("VAFT_FUEL_BAG");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  }

  // veřejné API
  return {
    init,
    addLetters,
    generateRandom,
    hasWord,
    consumeWord,
    getBag,
    onRender
  };
})();
