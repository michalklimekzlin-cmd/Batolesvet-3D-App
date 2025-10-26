// VaFT • Aura – vizuální dech a kouř před orbem
export function startVaFTAura(canvas) {
  const ctx = canvas.getContext('2d', { alpha: true });
  resize();
  let mix = { B: 0, G: 0, AI: 0, P: 0 };
  let t = 0;
  const particles = Array.from({ length: 40 }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    s: 0.5 + Math.random() * 1.5,
    a: Math.random() * 360,
  }));

  function resize() {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize, { passive: true });

  function setMix(m) {
    mix = m;
  }

  function tick() {
    t += 1 / 60;
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2,
      cy = h / 2;
    const colR = Math.floor(100 + 120 * mix.B / 3);
    const colG = Math.floor(140 + 100 * mix.G / 3);
    const colB = Math.floor(200 + 55 * mix.AI / 3);

    // kouřové částice
    for (const p of particles) {
      p.y -= 0.002 * p.s;
      p.x += 0.0015 * Math.sin(t * 2 + p.a);
      if (p.y < 0) p.y = 1;
      const x = cx + (p.x - 0.5) * w * 0.8;
      const y = cy + (p.y - 0.5) * h * 0.8;
      const a = 0.15 + 0.25 * Math.sin((t + p.a) * 2);
      ctx.fillStyle = `rgba(${colR},${colG},${colB},${a})`;
      ctx.beginPath();
      ctx.arc(x, y, 2 + p.s * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // slabé pulzující světlo kolem středu
    const pulse = 80 + 10 * Math.sin(t * 2);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulse);
    grad.addColorStop(0, `rgba(${colR},${colG},${colB},0.15)`);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  return { setMix, tick };
}