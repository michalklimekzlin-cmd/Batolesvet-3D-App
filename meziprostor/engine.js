// engine.js — základní sběrač písmenek
const MeziEngine = (function(){
  const state = {
    fragments: [],
    listeners: {}
  };

  function init(initial) {
    const saved = JSON.parse(localStorage.getItem('michal_fragments') || '[]');
    state.fragments = saved.length ? saved : initial;
    save();
  }

  function addFragment(text){
    const obj = {text, ts: Date.now()};
    state.fragments.unshift(obj);
    state.fragments = state.fragments.slice(0, 150);
    save();
    emit('fragment:new', obj);
  }

  function getFragments(){
    return state.fragments;
  }

  function save(){
    localStorage.setItem('michal_fragments', JSON.stringify(state.fragments));
  }

  function on(evt, cb){
    (state.listeners[evt] ||= []).push(cb);
  }

  function emit(evt, payload){
    (state.listeners[evt] || []).forEach(fn => fn(payload));
  }

  return { init, addFragment, getFragments, on };
})();
