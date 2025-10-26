// VaFT • Door (pozadí, vlnění a světelný dech)
console.log("✅ VaFT.door.js načten");

export function startVaFTDoor(canvas) {
  const ctx = canvas.getContext("2d", { alpha: true });
  let t = 0;

  function resize() {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  function tick(state = { mix: { B: 0, G: 0, AI: 0, P: 0 } }) {
    t += 1 / 60;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const energy = (state.mix.B + state.mix.G + state.mix.AI + state.mix.P) / 4;
    const hue = 200 + (state.mix.AI * 20) - (state.mix.P * 15);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, `hsl(${hue}, 70%, ${20 + 20 * energy}%)`);
    grad.addColorStop(1, `hsl(${hue + 30}, 80%, ${10 + 10 * energy}%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // pulz brány
    const pulse = Math.sin(t * 1.3) * 0.5 + 0.5;
    const glow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.5);
    glow.addColorStop(0, `rgba(180,200,255,${0.15 + energy * 0.15 + pulse * 0.1})`);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  }

  return { tick };
}