// VaFT • Aura – vizuální dech a kouř před orbem
export function startVaFTAura(canvas) {
  const ctx = canvas.getContext('2d', { alpha: true });
  let mix = { B: 0, G: 0, AI: 0, P: 0 };
  let t = 0;
  const particles = Array.from({ length: 48 }, () => ({
    x: Math.random(), y: Math.random(), s: 0.5 + Math.random() * 1.6, a: Math.random() * 6.283
  }));

  function resize() {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    canvas.width  = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  function setMix(m) { mix = m || mix; }

  function tick() {
    t += 1/60;
    const w = canvas.clientWidth, h = canvas.clientHeight, cx = w/2, cy = h/2;
    ctx.clearRect(0,0,w,h);

    const colR = Math.floor(100 + 120 * (mix.B/3));
    const colG = Math.floor(140 + 100 * (mix.G/3));
    const colB = Math.floor(200 +  55 * (mix.AI/3));

    // částice
    for (const p of particles) {
      p.y -= 0.0018 * p.s;
      p.x += 0.0012 * Math.sin(t*2 + p.a);
      if (p.y < 0) { p.y = 1; p.x = Math.random(); }
      const x = cx + (p.x - 0.5) * w * 0.9;
      const y = cy + (p.y - 0.5) * h * 0.9;
      const a = 0.14 + 0.26 * Math.sin((t + p.a) * 2);
      ctx.fillStyle = `rgba(${colR},${colG},${colB},${a})`;
      ctx.beginPath(); ctx.arc(x, y, 2 + p.s * 2, 0, Math.PI*2); ctx.fill();
    }

    // pulzující světlo
    const pulse = 90 + 16 * Math.sin(t * 1.8);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulse);
    grad.addColorStop(0, `rgba(${colR},${colG},${colB},0.18)`);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  return { setMix, tick };
}