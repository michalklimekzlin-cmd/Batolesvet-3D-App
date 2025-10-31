// Batolesvět • 3D Space-first (v0.33)
// Prostor nejdřív, postavy potom. Glyf avatary: \{*(•.)(.•)*}//  a  \[*(•.)(.•)*]//
(() => {
  const TAU = Math.PI * 2;
  const canvas = document.getElementById('c');
  const prog = document.getElementById('prog');
  const runBtn = document.getElementById('runBtn');
  const clearBtn = document.getElementById('clearBtn');
  const spaceBtn = document.getElementById('spaceBtn');
  const avatarsBtn = document.getElementById('avatarsBtn');

  // --- Three.js scéna ---
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:false });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 150);
  camera.position.set(0, 1.2, 4.2);

  // světla
  scene.add(new THREE.AmbientLight(0x88aaff, 0.35));
  const dir = new THREE.DirectionalLight(0x99ccff, 0.8);
  dir.position.set(3, 5, 4);
  scene.add(dir);

  // kořen pro všechen obsah
  const world = new THREE.Group();
  scene.add(world);

  // podkladová mlha (zapneme v buildSpace)
  scene.fog = null;

  function onResize(){
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize, { passive:true });
  onResize();

  // --- jednoduché orbit ovládání (drag) ---
  let dragging = false, lastX = 0, lastY = 0, rotY = 0, rotX = 0;
  canvas.addEventListener('pointerdown', (e)=>{ dragging=true; lastX=e.clientX; lastY=e.clientY; });
  window.addEventListener('pointerup', ()=> dragging=false );
  window.addEventListener('pointermove', (e)=>{
    if(!dragging) return;
    const dx = (e.clientX - lastX) / window.innerWidth;
    const dy = (e.clientY - lastY) / window.innerHeight;
    lastX = e.clientX; lastY = e.clientY;
    rotY -= dx * TAU * 0.3;
    rotX = Math.max(-0.8, Math.min(0.8, rotX - dy * TAU * 0.3));
  });

  // --- util ---
  function clearWorld(){ while(world.children.length) world.remove(world.children[0]); }

  // --- Space Core ---
  function buildSpace(){
    clearWorld();

    // zemní plane
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60, 1, 1),
      new THREE.MeshStandardMaterial({ color:0x0b1018, roughness:0.92, metalness:0.05 })
    );
    plane.rotation.x = -Math.PI/2;
    plane.position.y = -0.8;
    world.add(plane);

    // grid pro orientaci
    const grid = new THREE.GridHelper(60, 60, 0x274055, 0x1b2a3a);
    grid.position.y = -0.799;
    world.add(grid);

    // kruhový „střed světa“
    const hub = new THREE.Mesh(
      new THREE.CircleGeometry(2.2, 64),
      new THREE.MeshBasicMaterial({ color:0x102032, transparent:true, opacity:0.6 })
    );
    hub.rotation.x = -Math.PI/2;
    hub.position.y = -0.79;
    world.add(hub);

    // sky dome (vnitřní strana koule)
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(120, 40, 24),
      new THREE.MeshBasicMaterial({ color:0x02040a, side:THREE.BackSide })
    );
    world.add(sky);

    // mlha pro hloubku
    scene.fog = new THREE.Fog(0x02040a, 25, 120);
  }

  // --- stavebnice pro avatary ---
  const palette = {
    me:   { frame:0x6ac8ff, eye:0xbfe9ff, pulse:0x6ac8ff },
    misa: { frame:0xff93d0, eye:0xffc9e8, pulse:0xff93d0 },
  };

  function makeBracketFrame(kind = "square", color = 0xffffff, scale = 1.0) {
    const g = new THREE.Group();
    const bar = (w,h,t,x,y,z,rx=0,ry=0,rz=0)=>{
      const geo = new THREE.BoxGeometry(w,h,t);
      const mat = new THREE.MeshStandardMaterial({ color, metalness:0.2, roughness:0.35 });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x,y,z); m.rotation.set(rx,ry,rz);
      g.add(m);
    };
    const s = scale;

    if (kind === "square") { // [ ]
      const t = 0.05*s, L = 1.4*s, H = 1.8*s, Z = 0;
      // levá
      bar(t,H, t, -L/2, 0, Z);
      bar(L/3,t, t, -L/2+L/6,  H/2, Z);
      bar(L/3,t, t, -L/2+L/6, -H/2, Z);
      // pravá
      bar(t,H, t,  L/2, 0, Z);
      bar(L/3,t, t,  L/2-L/6,  H/2, Z);
      bar(L/3,t, t,  L/2-L/6, -H/2, Z);
    }

    if (kind === "curly") { // { }
      const t = 0.05*s, L = 1.4*s, H = 1.8*s, Z = 0;
      bar(t, H*0.6, t, -L/2+0.08*s, 0, Z);
      bar(t, H*0.6, t,  L/2-0.08*s, 0, Z);
      bar(L*0.25,t, t, -L/2+L*0.18,  H/2-0.2*s, Z);
      bar(L*0.25,t, t, -L/2+L*0.18, -H/2+0.2*s, Z);
      bar(L*0.25,t, t,  L/2-L*0.18,  H/2-0.2*s, Z);
      bar(L*0.25,t, t,  L/2-L*0.18, -H/2+0.2*s, Z);
      bar(L*0.18,t, t, -0.28*s,  0, Z);
      bar(L*0.18,t, t,  0.28*s,  0, Z);
    }

    return g;
  }

  function makeEye(color=0xffffff, offsetX=0.28, offsetY=0.12, blinkPhase=0) {
    const grp = new THREE.Group();
    const geo = new THREE.SphereGeometry(0.08, 24, 16);
    const mat = new THREE.MeshStandardMaterial({ color, emissive:color, emissiveIntensity:0.35, roughness:0.25, metalness:0.1 });
    const ball = new THREE.Mesh(geo, mat);
    ball.position.set(offsetX, offsetY, 0.02);
    grp.add(ball);

    const ring = new THREE.RingGeometry(0.09, 0.11, 32);
    const rim = new THREE.Mesh(ring, new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.35 }));
    rim.position.set(offsetX, offsetY, 0.01);
    grp.add(rim);

    grp.userData.tick = (t)=>{
      const s = 1 + Math.sin(t + blinkPhase)*0.03;
      ball.scale.setScalar(s);
      rim.scale.setScalar(s);
    };
    return grp;
  }

  function makePulse(color=0xffffff, phase=0) {
    const ring = new THREE.RingGeometry(0.25, 0.28, 64);
    const mat  = new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.6, side:THREE.DoubleSide });
    const mesh = new THREE.Mesh(ring, mat);
    mesh.rotation.x = -Math.PI/2;
    mesh.position.y = -0.78;

    mesh.userData.tick = (t)=>{
      const k = (Math.sin(t*1.8 + phase)+1)/2;
      const s = 0.8 + k*1.2;
      mesh.scale.set(s,s,1);
      mat.opacity = 0.25 + k*0.5;
    };
    return mesh;
  }

  function buildAvatarFromGlyph(glyph, paletteKey="me", x=0, z=0) {
    const col = palette[paletteKey] || palette.me;
    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const isSquare = glyph.includes('[') && glyph.includes(']');
    const isCurly  = glyph.includes('{') && glyph.includes('}');
    const frame = makeBracketFrame(isSquare ? "square" : isCurly ? "curly" : "square", col.frame, 1.0);
    g.add(frame);

    if (glyph.includes('(•.)')) g.add(makeEye(col.eye, +0.28, +0.10, 0.0));
    if (glyph.includes('(.•)')) g.add(makeEye(col.eye, -0.28, +0.10, 1.1));

    const stars = (glyph.match(/\*/g) || []).length;
    for (let i=0;i<Math.min(3,stars);i++) g.add(makePulse(col.pulse, i*0.8));

    const heartGeo = new THREE.SphereGeometry(0.05, 16, 12);
    const heartMat = new THREE.MeshStandardMaterial({ color:col.eye, emissive:col.eye, emissiveIntensity:0.6, roughness:0.4 });
    const heart = new THREE.Mesh(heartGeo, heartMat);
    heart.position.set(0, -0.05, 0.0);
    heart.userData.tick = (t)=>{ heart.scale.setScalar(1 + Math.sin(t*2.0)*0.12); };
    g.add(heart);

    g.userData.tickers = [];
    g.traverse(o=>{ if (o.userData && o.userData.tick) g.userData.tickers.push(o.userData.tick); });

    return g;
  }

  // --- běh ---
  function run(code){
    // nepřepisuj prostor – jen přidávej postavy
    // postavy dáme do vlastní skupiny, aby šly čistit zvlášť
    let avatarsRoot = world.getObjectByName('avatarsRoot');
    if (!avatarsRoot){ avatarsRoot = new THREE.Group(); avatarsRoot.name = 'avatarsRoot'; world.add(avatarsRoot); }
    while(avatarsRoot.children.length) avatarsRoot.remove(avatarsRoot.children[0]);

    const parts = code.split(/\s+/).filter(Boolean);
    let x = -1.2;
    for (const p of parts){
      if ((/[{\[]/.test(p) && p.includes('//'))){
        const who = (p.includes('[') || p.includes(']')) && !(p.includes('{')||p.includes('}')) ? 'misa' : 'me';
        const av = buildAvatarFromGlyph(p, who, x, 0);
        avatarsRoot.add(av);
        x += 1.2;
      }
    }
    if (avatarsRoot.children.length === 0) {
      avatarsRoot.add(buildAvatarFromGlyph("\\{*(•.)(.•)*}//", "me",   -0.6, 0));
      avatarsRoot.add(buildAvatarFromGlyph("\\[*(•.)(.•)*]//", "misa", +0.6, 0));
    }
  }

  function addAvatarsFromTextarea(){ run(prog.value); }

  // --- smyčka ---
  function loop(){
    const t = performance.now()/1000;
    world.rotation.y = rotY;
    world.rotation.x = rotX*0.5;

    world.traverse(o=>{ if (o.userData && o.userData.tick) o.userData.tick(t); });

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // --- UI ---
  spaceBtn.addEventListener('click', buildSpace);
  avatarsBtn.addEventListener('click', addAvatarsFromTextarea);
  runBtn.addEventListener('click', ()=> run(prog.value));
  clearBtn.addEventListener('click', ()=>{
    // smaž jen postavy, prostor nech
    const avatarsRoot = world.getObjectByName('avatarsRoot');
    if (avatarsRoot) while(avatarsRoot.children.length) avatarsRoot.remove(avatarsRoot.children[0]);
  });

  // start: postav prostor, ale počkej na postavy
  buildSpace();
})();