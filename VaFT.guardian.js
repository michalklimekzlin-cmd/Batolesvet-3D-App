// VaFT • Guardian
// Ochranný prvek jádra – hlídá, že mix a energie zůstávají v rovnováze

export function initVaFTGuardian(xp) {
  let calm = 0.5;

  function tick() {
    const s = xp.getState();
    const e = s.mix.B + s.mix.G + s.mix.AI + s.mix.P;
    const drift = Math.abs(s.mix.B - s.mix.P) + Math.abs(s.mix.G - s.mix.AI);

    // jednoduchá autoregulace
    if (drift > 2) calm -= 0.01;
    else calm += 0.005;
    calm = Math.max(0, Math.min(1, calm));

    // mírné tlumení energií, když je příliš velká nerovnováha
    if (calm < 0.4) {
      for (const k of Object.keys(s.mix)) xp.mix[k] *= 0.98;
    }
  }

  return { tick, get calm() { return calm; } };
}