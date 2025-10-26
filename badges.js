// badges.js — zobrazí jména mentorek v rozích světa Batolesvěta
// autor: Michal & Kovošrot (2025–2027)

export async function mountMentorBadges(url = './data/members.json') {
  try {
    // načti JSON se jmény (bez cachování)
    const res = await fetch(url + '?v=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('Soubor members.json nenalezen');
    const data = await res.json();

    // stylování odznaků
    const css = document.createElement('style');
    css.textContent = `
      .mentor-badge{
        position:fixed;z-index:21;
        background:rgba(20,24,32,.88);color:#cfe;
        border:1px solid #334;border-radius:.8rem;padding:6px 10px;
        font:12px/1.25 system-ui,-apple-system,sans-serif;
        backdrop-filter:blur(6px) saturate(120%);
        box-shadow:0 8px 28px rgba(0,0,0,.4);
        pointer-events:none;opacity:.96;transition:.3s;
      }
      .mentor-badge:hover{transform:scale(1.05);opacity:1}
      .mentor-badge .t{opacity:.75;margin-right:6px}
      .mentor-badge .chip{
        display:inline-block;margin:2px 4px 0 0;
        padding:2px 8px;border-radius:.7rem;
        border:1px solid #3a4557;background:#0f131b;
      }
      .mb-tl{top:52px;left:16px}
      .mb-tr{top:52px;right:16px}
      .mb-bl{bottom:52px;left:16px}
      .mb-br{bottom:52px;right:16px}
    `;
    document.head.appendChild(css);

    // funkce pro vytvoření jednoho odznaku
    const make = (cls, label, names) => {
      const el = document.createElement('div');
      el.className = `mentor-badge ${cls}`;
      el.innerHTML = `<span class="t">Mentorka:</span>${names
        .map(n => `<span class="chip">${n}</span>`)
        .join('')}`;
      el.setAttribute('aria-label', `Mentorka ${label}: ${names.join(', ')}`);
      document.body.appendChild(el);
    };

    // vytvoř 4 rohové odznaky
    make('mb-tl', data.batolesvet.title, data.batolesvet.mentors);
    make('mb-tr', data.glyph.title, data.glyph.mentors);
    make('mb-bl', data.pedrovci.title, data.pedrovci.mentors);
    make('mb-br', data.ai.title, data.ai.mentors);
  } catch (err) {
    console.error('Mentor badges error:', err);
  }
}