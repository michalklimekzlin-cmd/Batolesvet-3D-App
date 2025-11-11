// vaft.chybozrout.js
(function () {
  const Chybozrout = {
    log: [],
    agents: {},

    init(opts = {}) {
      this.opts = opts;
      this.setupAgents();
      this.installGlobalHandlers();
      this.renderPanel();
      this.say('Hlavoun', 'Chybožrout-Opravář nastartován pro: ' + (opts.appName || 'neznámá app'));
      this.say('Hlavoun', 'Verze: ' + (opts.version || 'dev'));
      this.checkSW();
    },

    setupAgents() {
      // 1) Pikoš – HTML a UI
      this.agents.Pikos = {
        name: 'Pikoš',
        canHandle(err) {
          return (
            /document\.getElementById/.test(err.msg || '') ||
            /null/.test(err.msg || '') ||
            /Cannot read properties of null/.test(err.msg || '')
          );
        },
        handle(err) {
          return {
            speaker: 'Pikoš',
            text: 'Vypadá to, že saháme na element, který není v HTML. Mrkni, jestli máš v indexu panel nebo sekci, na kterou script sahá.',
            fix: `<!-- Příklad doplnění chybějícího elementu -->
<div id="panel-worlds" class="panel">Obsah světů…</div>`
          };
        }
      };

      // 2) Viri – načítání souborů, cache
      this.agents.Viri = {
        name: 'Viri',
        canHandle(err) {
          return (
            /Failed to fetch/.test(err.msg || '') ||
            /NetworkError/.test(err.msg || '') ||
            /service worker/i.test(err.msg || '')
          );
        },
        handle(err) {
          return {
            speaker: 'Viri',
            text: 'Soubor se nenačetl nebo je stará cache. Zkus verzi v URL (?v=3) nebo vyčistit cache.',
            fix: `// příklad: v service-worker.js přidej novou verzi
const CACHE_NAME = 'vaft-cache-v3';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/vaft.chybozrout.js'
];`
          };
        }
      };

      // 3) Hlavoun – logika VAFT
      this.agents.Hlavoun = {
        name: 'Hlavoun',
        canHandle(err) {
          return (
            /VAFT/.test(err.msg || '') ||
            /boot/.test(err.msg || '') ||
            /is not defined/.test(err.msg || '')
          );
        },
        handle(err) {
          return {
            speaker: 'Hlavoun',
            text: 'VAFT jádro ještě nebylo načtené, ale už ho voláme. Přesuň volání VAFT.boot() až za všechny VAFT skripty.',
            fix: `<!-- správné pořadí -->
<script src="./vaft.loader.js"></script>
<script src="./vaft.core.js"></script>
<script src="./vaft.heartbeat.js"></script>
<script>
  VAFT.boot && VAFT.boot();
</script>`
          };
        }
      };

      // 4) VaFT (core) – fallback a složené chyby
      this.agents.VaFT = {
        name: 'VaFT',
        canHandle(err) {
          return true; // vezme cokoliv, co ostatní nevzali
        },
        handle(err) {
          return {
            speaker: 'VaFT',
            text: 'Chyba nepatří čistě jedné části. Zkontroluj prosím cesty ke skriptům a verze v query.',
            fix: `// v index.html používej verzi
<script src="./app.js?v=4"></script>`
          };
        }
      };
    },

    installGlobalHandlers() {
      window.addEventListener('error', (event) => {
        const errObj = {
          msg: event.message,
          src: event.filename,
          line: event.lineno,
          col: event.colno,
          stack: event.error && event.error.stack
        };
        this.routeError(errObj);
      });

      window.addEventListener('unhandledrejection', (event) => {
        const errObj = {
          msg: (event.reason && event.reason.message) || 'unhandled rejection',
          stack: event.reason && event.reason.stack
        };
        this.routeError(errObj);
      });
    },

    routeError(err) {
      // najdi agenta, který to umí
      const agent = Object.values(this.agents).find(a => a.canHandle(err)) || this.agents.VaFT;
      const reply = agent.handle(err);
      this.log.push({
        time: new Date().toISOString(),
        ...err,
        reply
      });
      this.updatePanel();
      console.warn('[CHYBOZROUT]', err, reply);
    },

    say(who, text) {
      this.log.push({
        time: new Date().toISOString(),
        msg: text,
        reply: { speaker: who, text }
      });
      this.updatePanel();
    },

    checkSW() {
      if (!('serviceWorker' in navigator)) {
        this.say('Viri', 'Service worker tady nejede.');
        return;
      }
      navigator.serviceWorker.getRegistrations()
        .then(regs => {
          if (regs.length === 0) {
            this.say('Viri', 'Není registrovaný žádný service worker.');
          } else {
            this.say('Viri', 'Nalezeno SW: ' + regs.length);
          }
        })
        .catch(e => {
          this.routeError({ msg: 'Service worker kontrola selhala: ' + e.message });
        });
    },

    renderPanel() {
      const box = document.createElement('div');
      box.id = 'vaft-chybozrout';
      box.style.position = 'fixed';
      box.style.bottom = '0';
      box.style.right = '0';
      box.style.width = '310px';
      box.style.maxHeight = '55vh';
      box.style.background = 'rgba(5,5,5,0.9)';
      box.style.color = '#fff';
      box.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      box.style.fontSize = '12px';
      box.style.zIndex = '99999';
      box.style.borderTopLeftRadius = '10px';
      box.style.overflow = 'hidden';

      box.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,.08);">
          <div>🛠️ Chybožrout-Opravář</div>
          <div>
            <button id="chyb-close" style="background:#444;color:#fff;border:none;border-radius:4px;padding:2px 6px;">−</button>
          </div>
        </div>
        <div id="chyb-body" style="max-height:46vh;overflow:auto;">
          <div id="chyb-list" style="padding:6px 8px;">Zatím žádné chyby.</div>
        </div>
      `;
      document.body.appendChild(box);

      document.getElementById('chyb-close').onclick = () => {
        const b = document.getElementById('chyb-body');
        b.style.display = b.style.display === 'none' ? 'block' : 'none';
      };
    },

    updatePanel() {
      const list = document.getElementById('chyb-list');
      if (!list) return;

      if (this.log.length === 0) {
        list.textContent = 'Zatím žádné chyby.';
        return;
      }

      list.innerHTML = this.log.slice(-25).map(entry => {
        const reply = entry.reply;
        return `
          <div style="margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid rgba(255,255,255,.03);">
            <div style="opacity:.6">${entry.time}</div>
            ${entry.msg ? `<div style="margin-top:2px;">❗ ${entry.msg}</div>` : ''}
            ${reply ? `<div style="margin-top:4px;"><strong>${reply.speaker} říká:</strong> ${reply.text}</div>` : ''}
            ${reply && reply.fix ? `<pre style="white-space:pre-wrap;background:rgba(255,255,255,.03);padding:4px 6px;border-radius:4px;margin-top:4px;">${reply.fix}</pre>` : ''}
          </div>
        `;
      }).join('');
    }
  };

  window.VAFT_CHYBOZROUT = Chybozrout;
})();
