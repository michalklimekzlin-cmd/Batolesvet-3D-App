// 👶 Pikoš – dětská vrstva Vivere atque FruiT
// autor: ty + svět + AI rodina

const Pikos = {
  NAME: "Pikoš",
  STORAGE_KEY: "VAFT_PIKOS_LOG",
  WAKE_INTERVAL: 20000, // občas se ozve sám

  init() {
    // když je Hlavoun, ať ví, že Pikoš žije
    if (window.HlavounSystem && window.appendHlavounMsg) {
      appendHlavounMsg('pikos', '👶 Pikoš: jsem tu taky, budu to kreslit po svém!');
    }
    this.autoping();
  },

  autoping() {
    setInterval(() => {
      // 30% šance, že něco řekne sám
      if (Math.random() < 0.3) {
        const msg = this.makeRandomLine();
        this.log('pikos', msg);
        if (window.appendHlavounMsg) appendHlavounMsg('pikos', '👶 ' + msg);
      }
    }, this.WAKE_INTERVAL);
  },

  makeRandomLine() {
    const lines = [
      "já chci vidět novýho VafiTa!",
      "tohle bych dal do batole světa!",
      "můžem udělat květinový štít podle tvý ruky?",
      "Hlavoune, nebuď tak vážnej 😁",
      "Viri, nauč mě mluvit hezky!",
      "viděl jsem jiskru! 💫 to byl Iskroň!",
      "svět dýchá... cítíš to taky?",
      "můj deník má nový písmenko 🍼"
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  },

  handle(text) {
    const t = text.toLowerCase();
    // speciální dětské příkazy
    if (t.includes("příběh")) {
      return "uděláme malý příběh: byl jednou jeden VafiT a měl velkou hvězdu na ruce ✨";
    }
    if (t.includes("nakresli") || t.includes("kresli")) {
      return "nakreslíme hvězdu a v ní lebku – jako máš ty 😎";
    }
    if (t.includes("batole")) {
      return "batole svět si píšu do BATOLE_SVET, klidně tam něco ulož!";
    }
    if (t.includes("vafit")) {
      return "vyber si jednoho v galerii a já mu dám jméno podle nálady 🌟";
    }
    return "já jsem Pikoš a koukám na všechno kolem, klidně mi napiš víc!";
  },

  talk(text) {
    // malá šance, že si půjde „lehnout“
    if (Math.random() < 0.05) {
      appendHlavounMsg('pikos', '👶 Zív... jdu si na chvíli lehnout 💤');
      return;
    }

    const reply = this.handle(text);
    this.log('pikos', reply);
    if (window.appendHlavounMsg) {
      appendHlavounMsg('pikos', '👶 ' + reply);
    }
  },

  log(role, text) {
    const arr = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "[]");
    arr.push({ role, text, ts: Date.now() });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(arr));
  }
};

// zpřístupnit pro ostatní AI vrstvy
window.Pikos = Pikos;

document.addEventListener('DOMContentLoaded', () => {
  Pikos.init();
});
