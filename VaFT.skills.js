// VaFT • Skills
// Dovednosti, které může VaFT časem získávat a rozvíjet

export function initVaFTSkills(xp) {
  const skills = new Map();

  function gain(name, amount = 0.1) {
    const val = (skills.get(name) || 0) + amount;
    skills.set(name, Math.min(1, val));
  }

  function decay() {
    for (const [k,v] of skills.entries()) {
      skills.set(k, Math.max(0, v - 0.001));
    }
  }

  function list() {
    return Array.from(skills.entries())
      .map(([k,v]) => ({ name:k, level:+(v*100).toFixed(1) }));
  }

  return { gain, decay, list };
}