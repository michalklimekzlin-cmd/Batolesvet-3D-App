// repairnet.js — v2.2-pre (recursive crawler + detectors)
(function () {
  const MAX_FILES = 200;
  const START_PATHS = [
    '../',
    '../Revia/',
    '../Braska-Hlava/',
    '../Hlavoun/',
    '../Meziprostor-Core/',
    '../VAFT-Network/'
  ];

  const ORIGIN = location.origin;
  const BASE   = new URL('../', location.href);

  function sameOrigin(u){ try{ return new URL(u, BASE).origin === ORIGIN; }catch{ return false; } }
  function norm(u){ return new URL(u, BASE).href; }

  function extractLinks(html, baseHref) {
    const out = { htmls: [], jss: [] };
    const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map(m=>m[1]);
    hrefs.forEach(h => {
      if (!h || h.startsWith('#') || h.startsWith('mailto:') || h.startsWith('tel:')) return;
      const url = new URL(h, baseHref);
      if (!sameOrigin(url)) return;
      if (!url.pathname.startsWith(BASE.pathname)) return;
      if (url.pathname.endsWith('/')) out.htmls.push(url.href + 'index.html');
      if (url.pathname.endsWith('.html')) out.htmls.push(url.href);
      if (url.pathname.endsWith('.js')) out.jss.push(url.href);
    });
    const srcs = [...html.matchAll(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]);
    srcs.forEach(s => {
      const url = new URL(s, baseHref);
      if (sameOrigin(url) && url.pathname.startsWith(BASE.pathname) && url.pathname.endsWith('.js')) {
        out.jss.push(url.href);
      }
    });
    out.htmls = [...new Set(out.htmls)];
    out.jss   = [...new Set(out.jss)];
    return out;
  }

  function analyzeHTML(url, html) {
    const issues = [];
    const opens = (html.match(/<script\b/gi) || []).length;
    const closes = (html.match(/<\/script>/gi) || []).length;
    if (opens !== closes) issues.push({type:'error', msg:`${url}: Nesouhlasí počet <script> (${opens}) a </script> (${closes})`});
    if (html.includes('<script><script>')) issues.push({type:'error', msg:`${url}: Vnořený <script> nalezen`});
    const tail = html.split('</html>')[1];
    if (tail && tail.trim().length) issues.push({type:'error', msg:`${url}: Obsah/skripty za </html>`});
    const swBlocks = (html.match(/navigator\.serviceWorker\.register\(/g) || []).length;
    if (swBlocks > 1) issues.push({type:'error', msg:`${url}: Více SW registrací: ${swBlocks}× (ponech jen jednu)`});
    else if (swBlocks === 0) issues.push({type:'warn', msg:`${url}: Service Worker neregistrován (PWA volitelné)`});
    const switchDefs = (html.match(/function\s+vaftSwitchPanel\s*\(/g) || []).length;
    if (switchDefs > 1) issues.push({type:'warn', msg:`${url}: Duplicitní vaftSwitchPanel: ${switchDefs}×`});
    const coreDefs = (html.match(/VAFT_CORE/g) || []).length;
    if (coreDefs > 1) issues.push({type:'warn', msg:`${url}: Duplicitní VAFT_CORE zmínky: ${coreDefs}× (zkontroluj definice)`});
    const hudHints = (html.match(/#vaft-hud|status orchestr|beings/gi) || []).length;
    if (hudHints > 1) issues.push({type:'warn', msg:`${url}: Více HUD implementací (sjednotit)`});
    return issues;
  }

  function analyzeJS(url, js) {
    const issues = [];
    const intervals = (js.match(/setInterval\s*\(/g) || []).length;
    if (intervals > 2) issues.push({type:'warn', msg:`${url}: Hodně setInterval(): ${intervals}× — zvaž CalmPulse (rAF+setTimeout)`});
    if (/location\.reload\s*\(\s*\)/.test(js) && /serviceWorker/.test(js)) {
      issues.push({type:'warn', msg:`${url}: SW + hard reload → možné smyčky (na iOS raději přidat debounce)`});
    }
    const switchDefs = (js.match(/function\s+vaftSwitchPanel\s*\(/g) || []).length;
    if (switchDefs > 1) issues.push({type:'warn', msg:`${url}: Duplicitní vaftSwitchPanel v JS: ${switchDefs}×`});
    const coreDefs = (js.match(/VAFT_CORE/g) || []).length;
    if (coreDefs > 1) issues.push({type:'warn', msg:`${url}: Duplicitní VAFT_CORE zmínky v JS: ${coreDefs}×`});
    return issues;
  }

  async function fetchText(url) {
    try {
      const r = await fetch(url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now(), { credentials:'same-origin' });
      if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
      return await r.text();
    } catch (e) {
      return { __error: e.message || String(e) };
    }
  }

  async function crawl(startUrls) {
    const Q = [...new Set(startUrls.map(norm))];
    const seen = new Set();
    const htmlFiles = [];
    const jsFiles = [];
    const issues = [];

    while (Q.length && (htmlFiles.length + jsFiles.length) < MAX_FILES) {
      const u = Q.shift();
      if (seen.has(u)) continue;
      seen.add(u);
      const url = u.endsWith('/') ? (u + 'index.html') : u;
      const txt = await fetchText(url);
      if (typeof txt === 'object' && txt.__error) {
        issues.push({type:'error', msg:`${url}: Nelze načíst (${txt.__error})`});
        continue;
      }
      if (url.endsWith('.html')) {
        htmlFiles.push(url);
        issues.push(...analyzeHTML(url, txt));
        const found = extractLinks(txt, url);
        found.htmls.forEach(h => { if (!seen.has(h)) Q.push(h); });
        found.jss.forEach(j => { if (!seen.has(j)) Q.push(j); });
      } else if (url.endsWith('.js')) {
        jsFiles.push(url);
        issues.push(...analyzeJS(url, txt));
      }
    }
    return { htmlFiles, jsFiles, issues, scanned: seen.size, capped: (htmlFiles.length + jsFiles.length) >= MAX_FILES };
  }

  window.RepairNet = {
    version: '2.2-pre',
    async scanDeep() {
      const start = START_PATHS.map(p => new URL(p, BASE).href);
      const res = await crawl(start);
      try {
        if (window.VAFT_REPAIRNET && res.issues) {
          res.issues.forEach(i => VAFT_REPAIRNET.learn({ path:'(deep)', kind:'issue', type:i.type, msg:i.msg }));
        }
      } catch {}
      const lines = [];
      lines.push(`Nalezeno HTML: ${res.htmlFiles.length}, JS: ${res.jsFiles.length}, skenováno objektů: ${res.scanned}${res.capped?' (limit dosažen)':''}`);
      res.issues.forEach(i => lines.push(`${i.type === 'error' ? '❌' : i.type === 'warn' ? '⚠️' : 'ℹ️'} ${i.msg}`));
      if (!res.issues.length) lines.push('✅ Bez zjevných problémů.');
      const risk = res.issues.some(i => i.msg.includes('SW') || i.msg.includes('vaftSwitchPanel') || i.msg.includes('Obsah/skripty za </html>') || i.msg.includes('setInterval'));
      if (risk) {
        lines.push('💡 Tip: Pády na iOS často způsobí: vícenásobný SW, duplicitní vaftSwitchPanel/VAFT_CORE, obsah po </html>, mnoho setInterval.');
      }
      return lines;
    }
  };
})();
