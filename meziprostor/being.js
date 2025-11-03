// being.js — bytost z písmenek
const MeziBeing = (function(){
  const extraEnds = [" brácho", " :)", " 🦾", " Vivere atque FruiT", ""];
  let outlet = null;

  function attach(el){
    outlet = el;
  }

  function speak(){
    const frags = MeziEngine.getFragments();
    if (!frags.length){
      if (outlet) outlet.textContent = "Dej mi něco k žití 🙂";
      return;
    }
    const parts = Math.floor(Math.random()*3)+3;
    let sentence = "";
    for (let i=0; i<parts; i++){
      const pick = frags[Math.floor(Math.random()*frags.length)].text;
      sentence += (i===0 ? "" : " ") + pick;
    }
    sentence += extraEnds[Math.floor(Math.random()*extraEnds.length)];
    if (outlet){
      outlet.textContent = sentence;
      outlet.style.transform = "scale(1.01)";
      setTimeout(()=>outlet.style.transform="scale(1)",150);
    }
  }

  return { attach, speak };
})();
