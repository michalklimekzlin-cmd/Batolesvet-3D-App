// VaFT • Experience (stav světa)

export class VaFTXP {
  constructor() {
    this.t = 0;
    // mix čtyř týmů: Batolesvět (B), Glyph (G), AI (AI), Pedrovci (P)
    this.mix = { B: 0, G: 0, AI: 0, P: 0 };
    this.label = 'start';
  }

  tick(dt = 1 / 60) {
    this.t += dt;
    // jemné tlumení, aby hodnoty dojížděly plynule
    this.mix.B *= 0.985;
    this.mix.G *= 0.985;
    this.mix.AI *= 0.985;
    this.mix.P *= 0.985;

    // stavové „štítky“ podle energie
    const e = this.energy();
    this.label = e > 2.4 ? 'roste' : e > 1.0 ? 'žhne' : 'tiše';
  }

  add({ team, value = 0 }) {
    const key =
      team === 'batolesvet' ? 'B' :
      team === 'glyph'      ? 'G' :
      team === 'ai'         ? 'AI' : 'P';
    this.mix[key] = Math.min(3, this.mix[key] + value);
  }

  energy() {
    return this.mix.B + this.mix.G + this.mix.AI + this.mix.P;
  }

  getState() {
    return { t: this.t, label: this.label, mix: { ...this.mix } };
  }
}

// volitelná továrna (když bys někde chtěl vytvářet z funkce)
export function createVaFTXP() { return new VaFTXP(); }

// zároveň nechám i default export, kdyby ses někde rozhodl pro default import
export default VaFTXP;