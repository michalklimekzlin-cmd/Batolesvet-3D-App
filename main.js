// Batolesvět 3D • v0.34 pohyb (Human)
// WASD/šipky + D-pad, tap-to-move na zemi, double-tap = dash
(() => {
  const logEl = document.getElementById('prog');
  const log = (s) => { if(!logEl) return; logEl.value += (logEl.value?'\n':'')+s; logEl.scrollTop = logEl.scrollHeight; };

  // THREE.js základ
  const canvas = document.getElementById('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();

  // světla
  const hemi = new THREE.HemisphereLight(0xcceeff, 0x223344, 0.6); scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.8); dir.position.set(5,8,3); scene.add(dir);

  // kamera + OrbitControls
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 6, 12);
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.target.set(0,1,0);

  // Zem + mřížka
  const groundSize = 60;
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(groundSize, groundSize),
    new THREE.MeshPhongMaterial({ color: 0x0a0e14, shininess: 8, specular: 0x223344 })
  );
  ground.rotation.x = -Math.PI/2;
  scene.add(ground);

  const grid = new THREE.GridHelper(groundSize, 30, 0x3680ff, 0x17324d);
  grid.material.opacity = 0.28; grid.material.transparent = true; scene.add(grid);

  // Hráč (můžeš nahradit GLTF)
  const player = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 24, 20),
    new THREE.MeshStandardMaterial({ color: 0x9fe0ff, metalness: 0.1, roughness: 0.3 })
  );
  body.position.y = 1;
  player.add(body);
  scene.add(player);
  player.position.set(0,0,0);

  // Stav pohybu
  const state = { speed: 6.0, dashSpeed: 14.0, dashTime: 0.15, dashLeft: 0, target: null, bounds: groundSize*0.5-1.0 };

  // Vstup – klávesy
  const keys = new Set();
  const onKey = (e, down) => {
    const k=e.key.toLowerCase();
    if(['w','a','s','d','arrowup','arrowleft','arrowdown','arrowright'].includes(k)){
      e.preventDefault(); down?keys.add(k):keys.delete(k); if(down) state.target=null;
    }
  };
  addEventListener('keydown', e=>onKey(e,true));
  addEventListener('keyup',   e=>onKey(e,false));

  // Vstup – D-pad
  const dpad = document.getElementById('hud-dpad'); const dpadHeld=new Set();
  if(dpad){
    const press = d=>{ dpadHeld.add(d); state.target=null; };
    const release = d=> dpadHeld.delete(d);
    dpad.querySelectorAll('button[data-dir]').forEach(btn=>{
      const d=btn.dataset.dir;
      btn.addEventListener('touchstart', e=>{e.preventDefault();press(d);},{passive:false});
      btn.addEventListener('touchend',   ()=>release(d),{passive:true});
      btn.addEventListener('mousedown',  e=>{e.preventDefault();press(d);});
      addEventListener('mouseup',        ()=>release(d));
      addEventListener('mouseleave',     ()=>release(d));
    });
  }
  const dpadVector = () => ({ x:(dpadHeld.has('left')?-1:0)+(dpadHeld.has('right')?1:0),
                              z:(dpadHeld.has('up')?-1:0)+(dpadHeld.has('down')?1:0) });

  // Tap-to-move + double-tap
  const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2(); let lastTap=0;
  function getPtr(evt){
    const r = renderer.domElement.getBoundingClientRect();
    const x=('touches' in evt)?evt.touches[0].clientX:evt.clientX;
    const y=('touches' in evt)?evt.touches[0].clientY:evt.clientY;
    ptr.x=((x-r.left)/r.width)*2-1; ptr.y=-((y-r.top)/r.height)*2+1;
  }
  function tap(evt){
    getPtr(evt);
    const now=performance.now();
    if(now-lastTap<260){ state.dashLeft=state.dashTime; lastTap=0; return; }
    lastTap=now;
    ray.setFromCamera(ptr, camera);
    const hit=ray.intersectObject(ground,false)[0];
    if(hit){ state.target=hit.point.clone(); state.target.y=0; }
  }
  renderer.domElement.addEventListener('touchstart', tap, { passive:true });
  renderer.domElement.addEventListener('mousedown',  tap);

  // Směr z vstupu
  function dirFromInput(){
    let x=0,z=0;
    if(keys.has('w')||keys.has('arrowup')) z-=1;
    if(keys.has('s')||keys.has('arrowdown')) z+=1;
    if(keys.has('a')||keys.has('arrowleft')) x-=1;
    if(keys.has('d')||keys.has('arrowright')) x+=1;
    const dv=dpadVector(); x+=dv.x; z+=dv.z;

    if(!x && !z && state.target){
      const dx=state.target.x-player.position.x, dz=state.target.z-player.position.z;
      const d=Math.hypot(dx,dz);
      if(d>0.05){ x=dx/d; z=dz/d; } else { state.target=null; }
    } else if(x||z){ state.target=null; }

    const len=Math.hypot(x,z)||1; return {x:x/len,z:z/len, active:(x||z)!==0};
  }

  // Tlačítka nahoře (hooky)
  spaceBtn?.addEventListener('click', ()=>{ grid.visible=!grid.visible; log(`Prostor: grid ${grid.visible?'ON':'OFF'}`); });
  avatarsBtn?.addEventListener('click', ()=>{ body.material.color.setHex(Math.random()*0xffffff); log('Postavy: změna barvy hráče'); });
  runBtn?.addEventListener('click', ()=>{ log('Spustit: smyčka běží, mise si doplníš.'); });
  clearBtn?.addEventListener('click', ()=>{ if(logEl) logEl.value=''; });

  // Resize
  function onResize(){ const w=innerWidth,h=innerHeight; renderer.setSize(w,h); camera.aspect=w/h; camera.updateProjectionMatrix(); }
  addEventListener('resize', onResize, { passive:true });

  // Hlavní smyčka
  let last=performance.now();
  function loop(now){
    const dt=Math.min(0.033,(now-last)/1000); last=now;

    const dir=dirFromInput();
    const spd = state.dashLeft>0 ? state.dashSpeed : state.speed;

    // pohyb relativně ke kameře
    let mx=0,mz=0;
    if(dir.active){
      const fwd=new THREE.Vector3(); camera.getWorldDirection(fwd); fwd.y=0; fwd.normalize();
      const right=new THREE.Vector3().crossVectors(fwd,new THREE.Vector3(0,1,0)).negate();
      mx = right.x*dir.x + fwd.x*dir.z;
      mz = right.z*dir.x + fwd.z*dir.z;
      const l=Math.hypot(mx,mz)||1; mx/=l; mz/=l;
    }

    player.position.x += mx*spd*dt;
    player.position.z += mz*spd*dt;

    const B=state.bounds;
    player.position.x = Math.max(-B, Math.min(B, player.position.x));
    player.position.z = Math.max(-B, Math.min(B, player.position.z));

    if(state.dashLeft>0) state.dashLeft -= dt;

    const target = new THREE.Vector3().copy(player.position).add(new THREE.Vector3(0,1,0));
    controls.target.lerp(target, 0.15);
    controls.update();

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Mini-API
  window.Batole3D = {
    setPlayerColor(hex){ body.material.color.setHex(hex); },
    setPlayerPos(x,z){ player.position.set(x,0,z); },
    getPlayerPos(){ return { x: player.position.x, z: player.position.z }; },
    dash(){ state.dashLeft = state.dashTime; },
    goTo(x,z){ state.target = new THREE.Vector3(x,0,z); }
  };

  log('Batolesvět 3D: pohyb (WASD/šipky, tap-to-move, double-tap=dash, D-pad) připraven.');
})();