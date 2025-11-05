// VAFT – Lilie 🌸 • Poutník mini deník
// autor: Michal Klimek, 2025

(function(){
  const box = document.createElement('div');
  box.id = 'lilie-poutnik';
  box.innerHTML = `
    <style>
      #lilie-poutnik {
        position: fixed;
        bottom: 10px;
        right: 10px;
        z-index: 900;
        font-family: system-ui,-apple-system,sans-serif;
      }
      #lilie-btn {
        background: rgba(30,40,30,.8);
        color: #cfc;
        border: 1px solid #3b4;
        border-radius: .7rem;
        padding: 6px 12px;
      }
      #lilie-denik {
        display: none;
        position: fixed;
        bottom: 50px;
        right: 10px;
        width: 260px;
        height: 180px;
        background: rgba(5,5,7,.9);
        border: 1px solid #242;
        border-radius: .7rem;
        padding: 10px;
        color: #efe;
        font-size: 13px;
      }
      #lilie-denik textarea {
        width: 100%;
        height: 130px;
        background: #111;
        color: #dfd;
        border: 1px solid #343;
        border-radius: .4rem;
        padding: 6px;
      }
    </style>
    <button id="lilie-btn">🌿 Deník</button>
    <div id="lilie-denik">
      <textarea id="lilie-text" placeholder="Zapiš poznatek z přírody…"></textarea>
      <button id="lilie-save">Uložit</button>
    </div>
  `;
  document.body.appendChild(box);

  const btn = document.getElementById('lilie-btn');
  const denik = document.getElementById('lilie-denik');
  const save = document.getElementById('lilie-save');
  const text = document.getElementById('lilie-text');

  btn.addEventListener('click', ()=>{
    denik.style.display = denik.style.display === 'none' ? 'block' : 'none';
  });

  save.addEventListener('click', ()=>{
    const entry = text.value.trim();
    if(entry){
      const notes = JSON.parse(localStorage.getItem('LILIE_DENIK')||'[]');
      notes.push({time:new Date().toLocaleString(), text: entry});
      localStorage.setItem('LILIE_DENIK', JSON.stringify(notes));
      text.value='';
      alert('🪶 Poznatek uložen.');
    }
  });
})();
