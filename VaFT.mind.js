// VaFT • Mind
// Jednoduché mentální vzorce – přemýšlení mezi týmy

export function initVaFTMind(xp) {
  let ideas = [];

  function reflect() {
    const s = xp.getState();
    const { B, G, AI, P } = s.mix;

    // „myšlenky“ vznikají z kombinací
    if (B > 1 && G > 1) ideas.push('Vznikl symbol života');
    if (AI > 1.5 && P > 1.5) ideas.push('Cítím logickou empatii');
    if (B + G + AI + P > 7) ideas.push('VaFT prozářený celou energií');

    // uchovává posledních pár nápadů
    ideas = ideas.slice(-6);
  }

  return {
    reflect,
    getThoughts() { return [...ideas]; }
  };
}