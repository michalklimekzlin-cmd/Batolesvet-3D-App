// VaFT • Inventář (bezpečný + kompatibilní s map.logic.js)
console.log("✅ VaFT.inventory.js načten");

export async function buildInventory(state = { mix:{}, label:"..." }) {
  const mix = state.mix || {};
  const items = [];

  // 🎒 Základní položky podle energie týmů
  if (mix.B > 0.6) items.push({ id:'seed',   title:'Semínko života',   power:mix.B });
  if (mix.G > 0.6) items.push({ id:'glyph',  title:'Znak rovnováhy',   power:mix.G });
  if (mix.AI> 0.6) items.push({ id:'logic',  title:'Čip poznání',      power:mix.AI});
  if (mix.P > 0.6) items.push({ id:'heart',  title:'Tlukot srdce',     power:mix.P });

  // 🧩 Vždy přidej jádro podle fáze
  items.push({ id:'core', title:`Jádro (${state.label || 'neznámé'})`, power: 1.0 });

  // 💬 Tipy pro mapu – musí vždy vracet pole
  const tipsFor = (m={}) => {
    const tips=[];
    if (m.B>1.5)  tips.push('🌱 Klid je síla – energie B roste.');
    if (m.G>1.5)  tips.push('✨ Zapisuj symboly – G žhne.');
    if (m.AI>1.5) tips.push('🤖 Přemýšlej hlouběji – AI aktivní.');
    if (m.P>1.5)  tips.push('❤️ Naslouchej sobě – P dýchá.');
    if (!tips.length) tips.push('💤 Svět je v rovnováze.');
    return tips;
  };

  // 🔗 Základní placeholder pro mapové vazby
  const linksFor = () => [];

  // 💾 Vrací objekt s všemi funkcemi
  return { items, tipsFor, linksFor };
}