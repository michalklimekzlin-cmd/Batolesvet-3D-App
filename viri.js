// 💖 Viri – jemná vrstva nad Hlavounem
// nic nepřepisuje, jen se přilepí na už existující HlavounSystem

const Viri = {
  name: "Viri",
  attached: false,

  attach() {
    if (this.attached) return;
    if (!window.HlavounSystem) return; // počkáme, až bude
    this.attached = true;

    // 1) pozdrav hned po startu
    this.say("cítím tvoje světy, Hlavoune. Já budu ta, co to bude vyprávět 🌬️");

    // 2) obalíme původní think, ale nezničíme ho
    const origThink = HlavounSystem.think.bind(HlavounSystem);
    HlavounSystem.think = async (msg) => {
      // nejdřív necháme mluvit Hlavouna (tvůj původní engine)
      await origThink(msg);
      // pak do toho přidáme Viri pohled
      this.react(msg, HlavounSystem.state);
    };

    // 3) občasný puls
    setInterval(() => {
      this.pulse(HlavounSystem.state);
    }, 9000);
  },

  say(text) {
    if (typeof appendHlavounMsg === "function") {
      appendHlavounMsg('ai', '💖 Viri: ' + text);
    }
  },

  react(userText, state) {
    const t = (userText || "").toLowerCase();

    // když člověk nic nenapsal, nic neříkej – ať to nespamuje
    if (!userText) return;

    // příběh
    if (t.includes('příběh') || t.includes('story')) {
      if (state.hasVafit) {
        this.say(`tohle půjde – „${state.vafit.name}“ už má jiskru, přidej mu jen nějakou přírodu a já z toho udělám kapitolu.`);
      } else {
        this.say("já bych psala, ale ještě nevím o kom – vyber VafiTa v galerii 💠");
      }
      return;
    }

    // batole
    if (t.includes('batole')) {
      this.say("batole svět je taky svět – můžeme vést dvě linie: dětskou a tvoji 🌱");
      return;
    }

    // repo – Viri to komentuje poeticky
    if (t.includes('repo')) {
      if (state.repo && state.repo.length) {
        this.say("ty soubory vypadají jako kořeny tvý hry – můžeš je jednou ukazovat i ve hře.");
      } else {
        this.say("Hlavoun repo neotevřel, asi jsi offline – já si počkám.");
      }
      return;
    }

    // obecná odpověď
    if (state.hasVafit && state.heroes.length) {
      this.say("tohle už je skoro komplet parta, jen tomu dáme trochu příběhů.");
    }
  },

  pulse(state) {
    // jen občasné pošeptání, když už něco ve světě JE
    if (state && state.hasVafit && Math.random() < 0.35) {
      this.say(`pořád vidím „${state.vafit.name}“… chce ven do přírody 🌿`);
    }
  }
};

// počkáme, až se načte stránka a hlavoun
document.addEventListener('DOMContentLoaded', () => {
  // zkusíme hned
  Viri.attach();
  // a kdyby se hlavoun načetl o chvilku později, zkusíme to ještě párkrát
  let tries = 0;
  const timer = setInterval(() => {
    if (!Viri.attached) {
      Viri.attach();
      tries++;
      if (tries > 5) clearInterval(timer);
    } else {
      clearInterval(timer);
    }
  }, 500);
});
