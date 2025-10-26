// VaFT • Inventář (kompatibilní s map.logic.js)

export async function buildInventory(state) {
  const { mix, label } = state;
  const items = [];

  // základní položky podle mixu
  if (mix.B > 0.6) items.push({ id:'seed',   title:'Semínko',      power:mix.B });
  if (mix.G > 0.6) items.push({ id:'glyph',  title:'Znak ☼',       power:mix.G });
  if (mix.AI> 0.6) items.push({ id:'logic',  title:'Čip logiky',   power:mix.AI});
  if (mix.P > 0.6) items.push({ id:'heart',  title:'Tlukot srdce', power:mix.P });

  // vždy jádro
  items.push({ id:'core', title:`Jádro (${label})`, power: 0.5 + 0.5*Math.random() });

  // 🔑 map.logic očekává funkci tipsFor(m) -> pole tipů
  function tipsFor(m) {
    const tips = [];
    if (m?.B > 1.5) tips.push('🌱 Pečuj o klid – B je silné.');
    if (m?.G > 1.5) tips.push('✨ Zapisuj symboly – G roste.');
    if (m?.AI > 1.5) tips.push('🧩 Zkus analýzu cesty – AI žhne.');
    if (m?.P > 1.5) tips.push('❤️ Naslouchej pocitu – P vede.');
    // vždy vrať aspoň prázdné pole
    return tips;
  }

  // volitelně může map.logic používat i linksFor – dáme bezpečný default
  function linksFor() { return []; }

  return { items, tipsFor, linksFor };
}