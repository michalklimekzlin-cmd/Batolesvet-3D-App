// repairnet.monitor.js — v2.2
(function () {
  const ORIGIN = location.origin;
  const ROOT   = new URL('../', location.href); // kořen repa (…/Vivere-atque-FruiT/)
  const MAX    = 250;

  // kam logovat
  const say = (s) => {
    if (window.RepairNetUI && typeof RepairNetUI.log === 'function') {
      RepairNetUI.log(s);
    } else {
      console.log('[RepairNet]', s);
    }
  };

  // util
  const okOrigin = (u) => { try { return new URL(u, ROOT).origin === ORIGIN; } catch { return false; } };
  const norm = (u) => new URL(u, ROOT).href;
  const uniq = (arr) => [...new Set(arr)];

  // z HTML vytáhneme odkazy + JS
  function extract(html, base) {
    const htmls = [];
    const jss = [];
    const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map(m=>m[1]);
    hrefs.forEach(h => {
      if (!h || h.startsWith('#') || h.startsWith('mailto:') || h.startsWith('tel:')) return;
      const u = new URL(h, base);
      if (!okOrigin(u)) return;
      if (!u.pathname.startsWith(ROOT.pathname)) return;
      if (u.pathname.endsWith('/')) htmls.push(u.href + 'index.html');
      if (u.pathname.endsWith('.html')) htmls.push(u.href);
      if (u.pathname.endsWith('.js')) jss.push(u.href);
    });
    const srcs = [...html.matchAll(/<script[^>]*src=["']([^"']+)["']/gi)].map(m=>m[1]);
    srcs.forEach(s => {
      const u = new URL(s, base);
      if (okOrigin(u) && u.pathname.startsWith(ROOT.pathname) && u.pathname.endsWith('.js')) jss.push(u.href);
    });
    return { htmls: uniq(htmls), jss: uniq(jss) };
  }

  // rychlý HEAD/GET test s měřením latence
  async function ping(url) {
    const t0 = performance.now();
    try {
      const r = await fetch(url, { method:'GET', cache:'no-store', credentials:'same-origin' });
      const d = performance.now()-t0;
      return { ok: r.ok, status: r.status, ms: Math.round(d) };
    } catch (e) {
      const d = performance.now()-t0;
      return { ok:false, status:'ERR', ms: Math.round(d), err: String(e) };
    }
  }

  async function getText(url) {
    try {
      const r = await fetch(url + (url.includes('?')?'&':'?') + 'v=' + Date.now(), { credentials:'same-origin' });
      if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
      return await r.text();
    } catch (e) {
      return { __error: e.message || String(e) };
    }
  }

  function analyzeHTML(url, html) {
    const issues = [];
    const opens = (html.match(/<script\b/gi) || []).length;
    const closes = (html.match(/<\/script>/gi) || []).length;
    if (opens !== closes) issues.push(`❌ ${url}: Nesouhlasí <script> (${opens}) vs </script> (${closes})`);
    if (html.includes('<script><script>')) issues.push(`❌ ${url}: Vnořený <script>`);
    const after = html.split('</html>')[1];
    if (after && after.trim().length) issues.push(`❌ ${url}: Obsah po </html>`);
    const sw = (html.match(/navigator\.serviceWorker\.register\(/g) || []).length;
    if (sw > 1) issues.push(`⚠️ ${url}: Více SW registrací (${sw}×)`);
    const dupSwitch = (html.match(/function\s+vaftSwitchPanel\s*\(/g) || []).length;
    if (dupSwitch > 1) issues.push(`⚠️ ${url}: Duplicitní vaftSwitchPanel (${dupSwitch}×)`);
    return issues;
  }

  function analyzeJS(url, js) {
    const issues = [];
    const intervals = (js.match(/setInterval\s*\(/g) || []).length;
    if (intervals > 2) issues.push(`⚠️ ${url}: Hodně setInterval() (${intervals}×)`);
    if (/location\.reload\s*\(\s*\)/.test(js) && /serviceWorker/.test(js)) {
      issues.push(`⚠️ ${url}: SW + hard reload → možné smyčky na iOS`);
    }
    return issues;
  }

  async function crawl(start) {
    const Q = uniq(start.map(norm));
    const seen = new Set();
    const htmls = [];
    const jss = [];
    const issues = [];

    while (Q.length && (htmls.length + jss.length) < MAX) {
      const u = Q.shift();
      if (seen.has(u)) continue;
      seen.add(u);
      const url = u.endsWith('/') ? (u + 'index.html') : u;

      const txt = await getText(url);
      if (typeof txt === 'object' && txt.__error) {
        issues.push(`❌ ${url}: Nelze načíst (${txt.__error})`);
        continue;
      }
      if (url.endsWith('.html')) {
        htmls.push(url);
        issues.push(...analyzeHTML(url, txt));
        const f = extract(txt, url);
        f.htmls.forEach(n => { if (!seen.has(n)) Q.push(n); });
        f.jss.forEach(n => { if (!seen.has(n)) Q.push(n); });
      } else if (url.endsWith('.js')) {
        jss.push(url);
        issues.push(...analyzeJS(url, txt));
      }
    }
    return { htmls, jss, issues, scanned: seen.size, capped: (htmls.length + jss.length) >= MAX };
  }

  // modulová diagnostika
  function probeModules() {
    const out = [];
    const has = (p) => p ? '✅' : '❌';
    out.push(`${has(window.HlavounSystem)} HlavounSystem`);
    out.push(`${has(window.VAFT && window.VAFT.agents && window.VAFT.agents.Viri)} Viri`);
    out.push(`${has(window.VAFT && window.VAFT.agents && window.VAFT.agents.Pikos)} Pikoš`);
    out.push(`${has(window.VAFT && window.VAFT.engine)} VAFT.engine`);
    return out;
  }

  // veřejné API
  window.RepairNetMonitor = {
    version: '2.2',
    async runDeep() {
      say('Spouštím rekurzivní sken podsložek…');

      const START = [
        ROOT.href,                       // kořen repa …/Vivere-atque-FruiT/
        new URL('./Revia/', ROOT).href,
        new URL('./Braska-Hlava/', ROOT).href,
        new URL('./Hlavoun/', ROOT).href,
        new URL('./Meziprostor-Core/', ROOT).href,
        new URL('./VAFT-Network/', ROOT).href
      ];

      // PINGY hlavních „brán“
      say('Testuji latenci bran…');
      for (const u of START) {
        const testUrl = u.endsWith('/') ? (u + 'index.html') : u;
        const p = await ping(testUrl);
        if (p.ok) say(`🟢 ${testUrl} • ${p.status} • ${p.ms}ms`);
        else      say(`🔴 ${testUrl} • ${p.status} • ${p.ms}ms`);
      }

      // CRAWL
      const res = await crawl(START);
      say(`Nalezeno HTML: ${res.htmls.length}, JS: ${res.jss.length}, skenováno objektů: ${res.scanned}${res.capped?' (limit)':''}`);
      if (res.issues.length) res.issues.forEach(i => say(i));
      else say('✅ Bez zjevných problémů.');

      // MODULY
      probeModules().forEach(line => say('🧩 ' + line));

      // TIPY
      const risky = res.issues.some(i => i.includes('SW') || i.includes('Obsah po </html>') || i.includes('setInterval'));
      if (risky) say('💡 Tip: u iOS pádů často pomůže zredukovat SW registrace, odstranit obsah po </html> a omezit setInterval().');

      // Vitals (když je připojen)
      if (window.RepairVitals) {
        say('Spouštím Vitals (FPS, paměť)…');
        window.RepairVitals.onLine = (l) => say(l);
        window.RepairVitals.start();
      } else {
        say('ℹ️ Vitals nejsou načtené (repairnet.vitals.js).');
      }
    }
  };
})();
