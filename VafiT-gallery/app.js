const vafits = [
  { name:'&’', glyph:"&’"},
  { name:'("°•)(•.°)”', glyph:'("°•)(•.°)”'},
  { name:'¡(*)(%☉)(*)¡', glyph:'¡(*)(%☉)(*)¡'}
];

const list = document.getElementById('vafitList');
vafits.forEach(v => {
  const div = document.createElement('div');
  div.className = 'vafit';
  div.textContent = v.glyph;
  div.onclick = () => selectVafit(v);
  list.appendChild(div);
});

function selectVafit(v){
  localStorage.setItem('VAFT_SELECTED_VAFIT', JSON.stringify(v));
  alert(`Vybral jsi ${v.name}!`);
  history.back();
}
