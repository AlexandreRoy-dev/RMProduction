/* Scène 3D du bureau (three.js). Tout est construit en code, sans modèle externe. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const LAYOUT = {
  laptop: { x: -76, z: 2, ry: 0.10 },
  heroTab: { x: -30, z: -28, ry: 0 },
  mouse: { x: -47, z: 18, ry: -0.18 },
  cup: { x: -97, z: 27 },
  plant: { x: -114, z: -52 },
  glasses: { x: -66, z: 46, ry: 0.35 },
  usb3: { x: -82, z: 41, ry: -0.3 },
  sticky3: { x: -30, z: 36, ry: 0.2 },
  clips1: { x: -60, z: -33, ry: 0.5 },
  phone: { x: -14, z: 56, ry: 0.10 },
  earbuds: { x: -36, z: 66, ry: -0.4 },
  usb1: { x: 6, z: 47, ry: 0.9 },
  tablet: { x: 46, z: -24, ry: -0.07 },
  pencil: { x: 46, z: -9.5, ry: 0.03 },
  sticky1: { x: 70, z: -40, ry: 0.12 },
  sticky2: { x: 75, z: -31, ry: -0.18 },
  latte: { x: 92, z: -72 },
  planner: { x: 27, z: 16, ry: 0.22 },
  notebook: { x: 100, z: 40, ry: -0.06 },
  pen: { x: 118, z: 45, ry: 1.28 },
  pen2: { x: 84, z: 62, ry: 0.4 },
  clips2: { x: 86, z: 24, ry: -0.3 },
  usb2: { x: 120, z: 22, ry: -0.5 },
  monitor: { x: 152, z: -64 },
  keyboard: { x: 152, z: -36, ry: 0 },
  cup2: { x: 124, z: -30 },
  cards: { x: 170, z: 61, ry: 0.22 },
  plant2: { x: 214, z: -34 }
};
export const PHONE = { w: 7.15, h: 14.7, d: 0.8, sw: 6.62, sh: 14.12 };

function roundedRect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
// plaque arrondie extrudée vers le haut (y de 0 à depth)
function slab(w, d, depth, r, bevel = 0.15, seg = 6) {
  const g = new THREE.ExtrudeGeometry(roundedRect(w - bevel * 2, d - bevel * 2, Math.max(.05, r - bevel)), {
    depth: depth - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: seg, curveSegments: 16
  });
  g.rotateX(-Math.PI / 2); g.translate(0, bevel, 0); g.computeVertexNormals();
  return g;
}
function flatRounded(w, h, r) { const g = new THREE.ShapeGeometry(roundedRect(w, h, r), 16); g.rotateX(-Math.PI / 2); return planarUV(g, w, h); }
function planarUV(g, w, h) {
  const p = g.attributes.position, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) { uv[i * 2] = p.getX(i) / w + .5; uv[i * 2 + 1] = .5 - p.getZ(i) / h; }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g;
}
function blobTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(0,0,0,0.62)'); g.addColorStop(.45, 'rgba(0,0,0,0.32)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// aluminium brossé : fines stries horizontales (rugosité et relief)
function brushedTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
  x.fillStyle = 'rgb(150,150,150)'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) {
    const v = 120 + Math.random() * 70 | 0; x.strokeStyle = `rgba(${v},${v},${v},${.25 + Math.random() * .35})`;
    x.lineWidth = Math.random() < .9 ? .6 : 1.2; const y = Math.random() * 512, l = 60 + Math.random() * 400, s0 = Math.random() * 512;
    x.beginPath(); x.moveTo(s0, y); x.lineTo(s0 + l, y); x.stroke(); x.beginPath(); x.moveTo(s0 - 512, y); x.lineTo(s0 - 512 + l, y); x.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
// ombre d'occlusion ambiante : rectangle arrondi flou (contact serré sous un appareil)
function aoTexture(w, h, r, blur) {
  const S = 256, pad = blur * 3, sx = (S - pad * 2) / w, c = document.createElement('canvas');
  c.width = S; c.height = Math.round(h * sx + pad * 2); const x = c.getContext('2d');
  x.filter = `blur(${blur}px)`; x.fillStyle = '#000';
  const W = w * sx, H = h * sx, R = r * sx; x.beginPath(); x.roundRect(pad, pad, W, H, R); x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return { t, kx: S / W, ky: c.height / H };
}
// reflet de vitre : bande diagonale très douce
function sheenTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 512, 512);
  g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(.22, 'rgba(255,255,255,.16)'); g.addColorStop(.38, 'rgba(255,255,255,0)');
  g.addColorStop(.62, 'rgba(255,255,255,0)'); g.addColorStop(.7, 'rgba(255,255,255,.12)'); g.addColorStop(.76, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 512, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// disposition du clavier (largeurs relatives), partagée par le portable et le clavier externe
const KB_ROWS = [['esc','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','⏻'],['`','1','2','3','4','5','6','7','8','9','0','-','=','⌫'],['⇥','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],['⇪','A','S','D','F','G','H','J','K','L',';','\'','⏎'],['⇧','Z','X','C','V','B','N','M',',','.','/','⇧'],['fn','ctrl','⌥','⌘','','⌘','⌥','◀','▲▼','▶']];
const KB_W = { 'esc': 1.5, '⌫': 1.5, '⇥': 1.5, '\\': 1.5, '⇪': 1.8, '⏎': 1.8, '⇧': 2.3, '': 5.6, '⌘': 1.3, '▲▼': 1 };
function cremaTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  const g = x.createRadialGradient(118, 120, 4, 128, 128, 128);
  g.addColorStop(0, '#c58b4f'); g.addColorStop(.35, '#a8672f'); g.addColorStop(.8, '#6b3a17'); g.addColorStop(1, '#3a1d0b');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  x.globalAlpha = .18; x.strokeStyle = '#e8c08a'; x.lineWidth = 3;
  for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(128 + i * 3, 128 - i * 2, 30 + i * 16, .4 + i, 2.4 + i); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export async function createScene(canvas, { base = 'assets/tex/', low = false, lang = 'fr' } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1.25 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f4f4f2');
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(35, 1, 1, 2000);
  camera.up.set(0, 0, -1);

  // textures
  const loader = new THREE.TextureLoader();
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const load = f => new Promise(res => loader.load(base + f, res, undefined, () => res(null)));
  const tex = async (f, srgb = true, localized = false) => {
    let t = null;
    if (localized && lang !== 'fr') t = await load(f.replace('.webp', '-' + lang + '.webp'));
    if (!t) t = await load(f);
    if (t) { if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; }
    return t;
  };
  const [tSite, tDeck, tPage, tFront, tBack, tGrain, tApp, tCrm, tSt1, tSt2] = await Promise.all([
    tex('screen-site.webp', true, true), Promise.resolve(null), tex('notebook-page.webp', true, true), tex('card-front.webp'), tex('card-back.webp'),
    tex('grain.webp', false), tex('laptop-app.webp', true, true), tex('tablet-crm.webp', true, true),
    tex('sticky-1.webp', true, true), tex('sticky-2.webp', true, true)
  ]);

  // matériaux
  const M = {
    desk: new THREE.MeshStandardMaterial({ color: '#fdfdfc', roughness: .86, metalness: 0 }),
    alu: new THREE.MeshPhysicalMaterial({ color: '#cfd2d6', metalness: .92, roughness: .5, envMapIntensity: 1.45, clearcoat: .15, clearcoatRoughness: .4 }),
    aluPad: new THREE.MeshPhysicalMaterial({ color: '#c3c6ca', metalness: .55, roughness: .2, envMapIntensity: 1.2, clearcoat: .9, clearcoatRoughness: .12 }),
    gap: new THREE.MeshStandardMaterial({ color: '#77797d', metalness: .6, roughness: .5 }),
    gray: new THREE.MeshPhysicalMaterial({ color: '#5a5d62', metalness: .9, roughness: .5, envMapIntensity: 1.35, clearcoat: .2, clearcoatRoughness: .35 }),
    ti: new THREE.MeshPhysicalMaterial({ color: '#6d6f73', metalness: .92, roughness: .42, envMapIntensity: 1.4, clearcoat: .3, clearcoatRoughness: .3 }),
    well: new THREE.MeshStandardMaterial({ color: '#0d0e0f', roughness: .8 }),
    key: new THREE.MeshPhysicalMaterial({ color: '#1c1d1f', roughness: .55, metalness: 0, clearcoat: .25, clearcoatRoughness: .45, sheen: .3, sheenColor: '#6a6d72' }),
    hinge: new THREE.MeshPhysicalMaterial({ color: '#2b2c2e', metalness: .7, roughness: .35, clearcoat: .5 }),
    bezel: new THREE.MeshPhysicalMaterial({ color: '#050506', roughness: .05, metalness: 0, clearcoat: 1, clearcoatRoughness: .02, envMapIntensity: 1.6 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#07080a', metalness: 0, roughness: .06, clearcoat: 1, clearcoatRoughness: .03 }),
    porcelain: new THREE.MeshPhysicalMaterial({ color: '#fbfbf9', roughness: .22, metalness: 0, clearcoat: .8, clearcoatRoughness: .12 }),
    ceramic: new THREE.MeshStandardMaterial({ color: '#f2f1ec', roughness: .7 }),
    white: new THREE.MeshPhysicalMaterial({ color: '#f7f7f5', roughness: .3, clearcoat: .6 }),
    paper: new THREE.MeshStandardMaterial({ color: '#fbfaf6', roughness: .92 }),
    cover: new THREE.MeshStandardMaterial({ color: '#2b2d2f', roughness: .78 }),
    black: new THREE.MeshPhysicalMaterial({ color: '#141516', roughness: .25, clearcoat: .8 }),
    chrome: new THREE.MeshStandardMaterial({ color: '#d9dadc', metalness: 1, roughness: .18 }),
    soil: new THREE.MeshStandardMaterial({ color: '#3b3128', roughness: 1 }),
    blob: new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false, opacity: .55 })
  };
  const tBrush = brushedTexture();
  for (const k of ['alu', 'gray', 'ti']) { M[k].roughnessMap = tBrush; M[k].bumpMap = tBrush; M[k].bumpScale = .015; }
  tBrush.repeat.set(3, 3);
  const tSheen = sheenTexture();
  if (tGrain) {
    tGrain.wrapS = tGrain.wrapT = THREE.RepeatWrapping; tGrain.repeat.set(14, 8);
    M.desk.roughnessMap = tGrain; M.desk.bumpMap = tGrain; M.desk.bumpScale = .25;
  }
  const lit = (t, extra = {}) => new THREE.MeshStandardMaterial({ map: t, roughness: .9, ...extra });
  // écran : image émissive sous une vitre (vernis réfléchissant)
  const glow = (t) => new THREE.MeshPhysicalMaterial({ map: t, emissiveMap: t, emissive: new THREE.Color('#ffffff'), emissiveIntensity: .62, roughness: .3, metalness: 0, color: '#7d7d7d', clearcoat: 1, clearcoatRoughness: .04, envMapIntensity: .9 });

  const world = new THREE.Group(); scene.add(world);
  const add = (g, m, p = [0, 0, 0], parent = world, cast = true, recv = false) => { const o = new THREE.Mesh(g, m); o.position.set(...p); o.castShadow = cast; o.receiveShadow = recv; parent.add(o); return o; };
  const blob = (x, z, sx, sz, ry = 0, o = .55) => { const b = add(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), M.blob.clone(), [x, .03, z], world, false); b.material.opacity = o; b.scale.set(sx, 1, sz); b.rotation.y = ry; b.renderOrder = 1; return b; };
  // ombre de contact serrée (occlusion ambiante) sous un appareil : w, h = empreinte
  const ao = (x, z, w, h, r, ry = 0, o = .5, blur = 6) => {
    const { t, kx, ky } = aoTexture(w, h, r, blur);
    const b = add(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, opacity: o }), [x, .035, z], world, false);
    b.scale.set(w * kx, 1, h * ky); b.rotation.y = ry; b.renderOrder = 1; return b;
  };
  // reflet de vitre posé sur un écran (plan local, normal +y)
  const sheen = (w, h, pos, parent, o = .1, flip = false) => {
    const g = new THREE.PlaneGeometry(w, h).rotateX(flip ? Math.PI / 2 : -Math.PI / 2);
    const m = add(g, new THREE.MeshBasicMaterial({ map: tSheen, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false }), pos, parent, false);
    m.renderOrder = 3; return m;
  };
  // clavier en volume : touches individuelles (instances) et légendes fines
  function keyboard(W, D, parent, y0) {
    const g = new THREE.Group(); g.position.y = y0; parent.add(g);
    add(flatRounded(W + .5, D + .5, .45), M.well, [0, .002, 0], g, false, true);
    const gap = .2, rowsH = KB_ROWS.map((r, i) => i === 0 ? .55 : 1), tot = rowsH.reduce((a, b) => a + b, 0);
    const u = (D - gap * (KB_ROWS.length - 1)) / tot, rects = [];
    let zc = -D / 2;
    KB_ROWS.forEach((row, ri) => {
      const h = rowsH[ri] * u, ws = row.map(k => KB_W[k] || 1), sw = ws.reduce((a, b) => a + b, 0);
      const ku = (W - gap * (row.length - 1)) / sw; let xc = -W / 2;
      row.forEach((k, i) => { const w = ws[i] * ku; rects.push({ k, x: xc + w / 2, z: zc + h / 2, w, h }); xc += w + gap; });
      zc += h + gap;
    });
    const kg = slab(1, 1, .24, .16, .07, 3);
    const inst = new THREE.InstancedMesh(kg, M.key, rects.length); inst.castShadow = true; inst.receiveShadow = true;
    const m4 = new THREE.Matrix4();
    rects.forEach((r, i) => { m4.makeScale(r.w, 1, r.h); m4.setPosition(r.x, 0, r.z); inst.setMatrixAt(i, m4); });
    g.add(inst);
    // légendes : texture transparente posée sur le dessus des touches
    const cw = 2048, ch = Math.round(cw * D / W), c = document.createElement('canvas'); c.width = cw; c.height = ch;
    const x = c.getContext('2d'), sx = cw / W; x.fillStyle = 'rgba(244,245,246,.95)'; x.textBaseline = 'top';
    rects.forEach(r => { if (!r.k) return; const fs = Math.min(r.h, 1) * sx * (r.k.length > 2 ? .24 : .32); x.font = `500 ${fs}px Inter, system-ui, sans-serif`;
      x.fillText(r.k, (r.x - r.w / 2 + W / 2) * sx + fs * .55, (r.z - r.h / 2 + D / 2) * sx + fs * .45); });
    const lt = new THREE.CanvasTexture(c); lt.colorSpace = THREE.SRGBColorSpace; lt.anisotropy = aniso;
    add(new THREE.PlaneGeometry(W, D).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: lt, transparent: true, depthWrite: false }), [0, .245, 0], g, false).renderOrder = 2;
    return g;
  }
  const place = (grp, L) => { grp.position.set(L.x, 0, L.z); grp.rotation.y = L.ry || 0; world.add(grp); return grp; };

  // bureau
  add(new THREE.PlaneGeometry(900, 500).rotateX(-Math.PI / 2), M.desk, [40, 0, 10], world, false, true);

  // ordinateur portable
  const lap = new THREE.Group();
  add(slab(31, 21.6, 1.05, 1.15, .42, 8), M.alu, [0, 0, 0], lap, true, true);
  keyboard(26.4, 10.4, lap, 1.05).position.z = -4.0;          // clavier encastré
  add(flatRounded(13.6, 8.0, .75), M.gap, [0, 1.052, 6.4], lap, false);   // joint du pavé tactile
  add(flatRounded(13.4, 7.8, .68), M.aluPad, [0, 1.056, 6.4], lap, false, true);
  // grilles des haut-parleurs
  { const c = document.createElement('canvas'); c.width = 64; c.height = 512; const x = c.getContext('2d'); x.fillStyle = 'rgba(20,20,22,.75)';
    for (let yy = 4; yy < 512; yy += 9) for (let xx = 6; xx < 64; xx += 9) { x.beginPath(); x.arc(xx + (yy / 9 % 2) * 4, yy, 1.7, 0, 7); x.fill(); }
    const st = new THREE.CanvasTexture(c); st.colorSpace = THREE.SRGBColorSpace;
    for (const sxp of [-14.3, 14.3]) add(new THREE.PlaneGeometry(1.0, 10.2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false }), [sxp, 1.053, -4.0], lap, false).renderOrder = 2; }
  add(new THREE.BoxGeometry(5.5, .05, .5), M.gap, [0, .98, 10.78], lap, false);   // encoche d'ouverture
  const hc = add(new THREE.CylinderGeometry(.5, .5, 24.5, 32), M.hinge, [0, .95, -10.55], lap); hc.rotation.z = Math.PI / 2;   // charnière
  const hinge = new THREE.Group(); hinge.position.set(0, 1.05, -10.6); lap.add(hinge);
  const lid = new THREE.Group(); hinge.add(lid);
  add(slab(31, 21.4, .48, 1.15, .2, 6), M.alu, [0, 0, 10.7], lid);
  const bez = add(flatRounded(30.6, 21.0, .95), M.bezel, [0, -.012, 10.7], lid, false); bez.rotation.x = Math.PI;
  const scrLap = add(new THREE.PlaneGeometry(29.3, 18.3).rotateX(Math.PI / 2), tApp ? glow(tApp) : M.glass, [0, -.02, 11.6], lid, false);
  sheen(30.6, 21.0, [0, -.03, 10.7], lid, .09, true);
  hinge.rotation.x = -THREE.MathUtils.degToRad(110);   // ouverture réaliste de l'écran
  place(lap, LAYOUT.laptop);
  blob(LAYOUT.laptop.x, LAYOUT.laptop.z + 1, 40, 30, LAYOUT.laptop.ry, .3);
  blob(LAYOUT.laptop.x - 1.2, LAYOUT.laptop.z - 13.5, 36, 13, LAYOUT.laptop.ry, .3);
  ao(LAYOUT.laptop.x, LAYOUT.laptop.z, 31.2, 21.8, 1.2, LAYOUT.laptop.ry, .55, 5);

  // souris
  const mouse = new THREE.Group();
  const mg = new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2); mg.scale(3.05, 1.25, 5.6);
  add(mg, M.white, [0, .12, 0], mouse);
  add(new THREE.CylinderGeometry(1, 1, .14, 48).scale(3.0, 1, 5.5), M.ceramic, [0, .07, 0], mouse);
  place(mouse, LAYOUT.mouse); blob(LAYOUT.mouse.x, LAYOUT.mouse.z, 9, 14, LAYOUT.mouse.ry, .5);

  // tasse espresso
  function makeCup() {
    const g = new THREE.Group();
    const sau = [[0, 0], [5.4, 0], [6.6, .55], [6.9, .85], [6.7, .9], [5.2, .55], [2.6, .5], [0, .5]].map(p => new THREE.Vector2(p[0], p[1]));
    add(new THREE.LatheGeometry(sau, 72), M.porcelain, [0, 0, 0], g);
    const cup = [[0, .5], [2.1, .5], [2.25, .8], [2.7, 1.6], [3.15, 3.4], [3.35, 5.6], [3.12, 5.75], [2.95, 5.6], [2.8, 3.6], [2.3, 1.6], [0, 1.4]].map(p => new THREE.Vector2(p[0], p[1]));
    add(new THREE.LatheGeometry(cup, 72), M.porcelain, [0, 0, 0], g);
    const coffee = add(new THREE.CircleGeometry(2.92, 64).rotateX(-Math.PI / 2), new THREE.MeshPhysicalMaterial({ map: cremaTexture(), roughness: .25, clearcoat: 1 }), [0, 4.85, 0], g, false);
    const h = add(new THREE.TorusGeometry(1.05, .3, 16, 40, Math.PI * 1.15), M.porcelain, [3.55, 3.6, 0], g);
    h.rotation.z = -Math.PI * .57;
    return g;
  }
  const cup = place(makeCup(), { ...LAYOUT.cup, ry: .9 }); blob(LAYOUT.cup.x, LAYOUT.cup.z, 16, 16, 0, .45);
  const cup2 = place(makeCup(), { ...LAYOUT.cup2, ry: -.6 }); blob(LAYOUT.cup2.x, LAYOUT.cup2.z, 16, 16, 0, .45);

  // plantes
  function makePlant(scale = 1, seed = 1) {
    const g = new THREE.Group();
    const pot = [[0, 0], [4.3, 0], [4.6, .4], [5.6, 8.4], [5.9, 8.6], [5.5, 8.7], [5.0, 8.0], [0, 8.0]].map(p => new THREE.Vector2(p[0], p[1]));
    add(new THREE.LatheGeometry(pot, 64), M.ceramic, [0, 0, 0], g);
    add(new THREE.CircleGeometry(5.1, 40).rotateX(-Math.PI / 2), M.soil, [0, 8.05, 0], g, false);
    const lg = new THREE.SphereGeometry(1, 20, 12); lg.scale(1.15, .42, 3.1); lg.translate(0, 0, 2.6);
    const rings = [[11, 0.22, 1.0, '#5f8f63'], [9, 0.55, .82, '#6c9d6c'], [7, 0.95, .62, '#7aab75'], [5, 1.35, .42, '#8cba82']];
    let r = seed;
    const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    rings.forEach(([n, tilt, s, col], ri) => {
      const m = new THREE.MeshStandardMaterial({ color: col, roughness: .55 });
      for (let i = 0; i < n; i++) {
        const leaf = new THREE.Mesh(lg, m); leaf.castShadow = true;
        const a = i / n * Math.PI * 2 + ri * .4 + rnd() * .2;
        const pv = new THREE.Group(); pv.position.set(0, 8.6 + ri * .55, 0); pv.rotation.y = a; g.add(pv);
        leaf.rotation.x = -tilt; leaf.scale.setScalar(s); pv.add(leaf);
      }
    });
    g.scale.setScalar(scale); return g;
  }
  place(makePlant(1.05, 3), LAYOUT.plant); blob(LAYOUT.plant.x, LAYOUT.plant.z, 22, 22, 0, .4);
  place(makePlant(.9, 7), LAYOUT.plant2); blob(LAYOUT.plant2.x, LAYOUT.plant2.z, 19, 19, 0, .4);

  // tablette de l'accueil : style iPad, debout sur un support en aluminium, face au visiteur
  const HT = { w: 25.4, d: 16.6, sw: 24.0, sh: 15.0, tilt: 70 };
  const htPivot = new THREE.Group(); htPivot.position.set(LAYOUT.heroTab.x, .5, LAYOUT.heroTab.z); htPivot.rotation.y = LAYOUT.heroTab.ry; world.add(htPivot);
  const htTilt = new THREE.Group(); htTilt.rotation.x = THREE.MathUtils.degToRad(HT.tilt); htPivot.add(htTilt);
  const htBody = new THREE.Group(); htBody.position.z = -HT.d / 2; htTilt.add(htBody);
  add(slab(HT.w, HT.d, .6, 1.45, .24, 8), M.alu, [0, 0, 0], htBody, true, true);
  add(flatRounded(HT.w - .36, HT.d - .36, 1.25), M.bezel, [0, .603, 0], htBody, false);
  const scrHero = add(new THREE.PlaneGeometry(HT.sw, HT.sh).rotateX(-Math.PI / 2), M.glass, [0, .61, 0], htBody, false);
  add(new THREE.CircleGeometry(.11, 20).rotateX(-Math.PI / 2), M.hinge, [0, .607, -HT.d / 2 + .4], htBody, false);   // caméra avant
  sheen(HT.w - .36, HT.d - .36, [0, .62, 0], htBody, .08);
  { // support : socle, rebord avant et deux bras arrière
    const sp = new THREE.Group(); sp.position.copy(htPivot.position); sp.rotation.y = LAYOUT.heroTab.ry; world.add(sp);
    add(slab(15, 10, .45, 1.3, .15, 6), M.alu, [0, -.5, -3.6], sp, true, true);
    add(new THREE.BoxGeometry(15, .9, .5), M.alu, [0, -.1, 1.0], sp);
    for (const ax of [-4.2, 4.2]) { const arm = add(new THREE.BoxGeometry(1.8, .4, 9.4), M.alu, [ax, 4.6, -5.9], sp); arm.rotation.x = -THREE.MathUtils.degToRad(63.5); }
  }
  ao(LAYOUT.heroTab.x, LAYOUT.heroTab.z - 3.6, 15.2, 10.2, 1.3, LAYOUT.heroTab.ry, .55, 4);
  blob(LAYOUT.heroTab.x, LAYOUT.heroTab.z - 6, 30, 16, LAYOUT.heroTab.ry, .3);

  // tablette (applications sur mesure)
  const tab = new THREE.Group();
  add(slab(25.2, 18, .62, 1.55, .26, 8), M.gray, [0, 0, 0], tab, true, true);
  add(flatRounded(24.75, 17.55, 1.3), M.bezel, [0, .623, 0], tab, false);
  const scrTab = add(new THREE.PlaneGeometry(23.7, 16.55).rotateX(-Math.PI / 2), tCrm ? glow(tCrm) : M.glass, [0, .63, 0], tab, false);
  add(new THREE.CircleGeometry(.13, 20).rotateX(-Math.PI / 2), M.hinge, [0, .628, -8.5], tab, false);   // caméra avant
  sheen(24.75, 17.55, [0, .64, 0], tab, .1);
  for (const [bx, bz, bw] of [[-7, -9.02, 1.6], [5.5, -9.02, 3.2]]) add(new THREE.BoxGeometry(bw, .22, .1), M.gray, [bx, .31, bz], tab);   // boutons
  place(tab, LAYOUT.tablet); blob(LAYOUT.tablet.x, LAYOUT.tablet.z, 31, 24, LAYOUT.tablet.ry, .32);
  ao(LAYOUT.tablet.x, LAYOUT.tablet.z, 25.3, 18.1, 1.6, LAYOUT.tablet.ry, .6, 4);
  const pencil = new THREE.Group();
  const pc = add(new THREE.CylinderGeometry(.42, .42, 15.5, 24), M.white, [0, .45, 0], pencil); pc.rotation.z = Math.PI / 2;
  const pt = add(new THREE.ConeGeometry(.42, 1.4, 24), M.ceramic, [8.45, .45, 0], pencil); pt.rotation.z = -Math.PI / 2;
  place(pencil, LAYOUT.pencil); blob(LAYOUT.pencil.x, LAYOUT.pencil.z + .3, 19, 2.6, LAYOUT.pencil.ry, .45);

  // téléphone (automatisations) : l'écran est une couche HTML positionnée par homographie
  const phone = new THREE.Group();
  add(slab(PHONE.w, PHONE.h, PHONE.d, 1.15, .3, 8), M.ti, [0, 0, 0], phone, true, true);
  const pscreen = add(flatRounded(PHONE.w - .2, PHONE.h - .2, 1.05), M.bezel, [0, PHONE.d + .004, 0], phone, false);
  for (const [bx, bz, bl] of [[-PHONE.w / 2 - .03, -3.4, 1.0], [-PHONE.w / 2 - .03, -1.9, 1.6], [-PHONE.w / 2 - .03, -.1, 1.6], [PHONE.w / 2 + .03, -2.2, 2.6]])
    add(new THREE.BoxGeometry(.1, .34, bl), M.ti, [bx, PHONE.d / 2, bz], phone);   // boutons latéraux
  place(phone, LAYOUT.phone); blob(LAYOUT.phone.x, LAYOUT.phone.z, 10.5, 19, LAYOUT.phone.ry, .4);
  ao(LAYOUT.phone.x, LAYOUT.phone.z, 7.25, 14.8, 1.2, LAYOUT.phone.ry, .6, 4);

  // carnet (intégration IA)
  // carnet IA : tablette à encre électronique, écran mat (l'écran animé est posé par homographie)
  const nb = new THREE.Group();
  add(slab(19.6, 26.0, .62, 1.3, .24, 8), M.gray, [0, 0, 0], nb, true, true);
  add(flatRounded(19.0, 25.4, 1.0), new THREE.MeshPhysicalMaterial({ color: '#2a2c2f', roughness: .35, clearcoat: .6, clearcoatRoughness: .3 }), [0, .623, 0], nb, false);
  const scrPad = add(new THREE.PlaneGeometry(17.6, 23.65).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#efeee9', roughness: .92 }), [0, .63, -.25], nb, false, true);
  place(nb, LAYOUT.notebook); blob(LAYOUT.notebook.x, LAYOUT.notebook.z, 25, 31, LAYOUT.notebook.ry, .32);
  ao(LAYOUT.notebook.x, LAYOUT.notebook.z, 19.7, 26.1, 1.4, LAYOUT.notebook.ry, .55, 4);
  const pen = new THREE.Group();
  const pb = add(new THREE.CylinderGeometry(.48, .48, 12.5, 28), M.black, [0, .5, 0], pen); pb.rotation.z = Math.PI / 2;
  const ptp = add(new THREE.ConeGeometry(.48, 1.8, 28), M.chrome, [7.15, .5, 0], pen); ptp.rotation.z = -Math.PI / 2;
  const clip = add(new THREE.BoxGeometry(5, .16, .32), M.chrome, [-3.4, .98, 0], pen);
  const cap = add(new THREE.CylinderGeometry(.5, .5, .5, 28), M.chrome, [-6.4, .5, 0], pen); cap.rotation.z = Math.PI / 2;
  place(pen, LAYOUT.pen); blob(LAYOUT.pen.x, LAYOUT.pen.z, 15, 2.6, LAYOUT.pen.ry, .45);

  // cartes professionnelles
  const card = (w, h, t, L, y = 0) => {
    const mats = [M.paper, M.paper, t ? lit(t, { roughness: .6 }) : M.paper, M.paper, M.paper, M.paper];
    const m = add(new THREE.BoxGeometry(w, .06, h), mats, [0, y + .03, 0], world, true, true);
    m.position.x = L.x; m.position.z = L.z; m.rotation.y = L.ry || 0; return m;
  };
  for (let i = 0; i < 4; i++) card(8.9, 5.1, tFront, { x: LAYOUT.cards.x, z: LAYOUT.cards.z, ry: LAYOUT.cards.ry + i * .015 }, i * .06);
  card(8.9, 5.1, tBack, { x: LAYOUT.cards.x - 9, z: LAYOUT.cards.z + 4, ry: -.35 });
  blob(LAYOUT.cards.x - 4, LAYOUT.cards.z + 2, 20, 12, 0, .2);

  // écran externe (sites web), face à la caméra
  const mon = new THREE.Group();
  const panel = new THREE.Group();
  add(slab(62, 36, 1.1, 1.0, .3, 6), M.alu, [0, 0, 0], panel);
  add(flatRounded(61.5, 35.5, .75), M.bezel, [0, 1.105, 0], panel, false);
  sheen(61.5, 35.5, [0, 1.125, 0], panel, .08);
  const siteMat = tSite ? glow(tSite) : M.glass;
  const scrMon = add(new THREE.PlaneGeometry(60.3, 33.9).rotateX(-Math.PI / 2), siteMat, [0, 1.112, -.15], panel, false);
  if (tSite) { tSite.wrapT = THREE.ClampToEdgeWrapping; tSite.repeat.set(1, (1280 / (60.3 / 33.9)) / tSite.image.height); tSite.offset.set(0, 1 - tSite.repeat.y); }
  panel.rotation.x = THREE.MathUtils.degToRad(84); panel.position.set(0, 31, 0); mon.add(panel);
  add(new THREE.BoxGeometry(4.2, 26, 1.4), M.alu, [0, 15, -3.2], mon).rotation.x = -.16;
  add(slab(19, 15, .7, 2, .2), M.alu, [0, 0, -3], mon);
  place(mon, LAYOUT.monitor); blob(LAYOUT.monitor.x, LAYOUT.monitor.z - 2, 30, 22, 0, .35); ao(LAYOUT.monitor.x, LAYOUT.monitor.z - 3, 19.2, 15.2, 2, 0, .5, 5); blob(LAYOUT.monitor.x, LAYOUT.monitor.z + 9, 70, 16, 0, .18);
  // clavier
  const kbG = new THREE.Group();
  add(slab(28, 11.5, .7, .8, .3, 6), M.alu, [0, 0, 0], kbG, true, true);
  keyboard(26.6, 10.2, kbG, .7);
  place(kbG, LAYOUT.keyboard); blob(LAYOUT.keyboard.x, LAYOUT.keyboard.z, 34, 16, 0, .28); ao(LAYOUT.keyboard.x, LAYOUT.keyboard.z, 28.1, 11.6, .9, 0, .5, 4);

  // accessoires
  function latteTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    x.fillStyle = '#b07a4a'; x.fillRect(0, 0, 256, 256);
    const g = x.createRadialGradient(128, 128, 20, 128, 128, 128); g.addColorStop(0, 'rgba(240,226,206,.0)'); g.addColorStop(1, 'rgba(70,40,20,.55)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    x.fillStyle = '#f3e7d6'; x.beginPath(); x.moveTo(128, 205); x.bezierCurveTo(40, 140, 60, 60, 128, 98); x.bezierCurveTo(196, 60, 216, 140, 128, 205); x.fill();
    x.strokeStyle = '#b07a4a'; x.lineWidth = 7; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(128, 120 + i * 14, 34 - i * 8, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  { const g = new THREE.Group();
    const prof = [[0, 0], [2.6, 0], [2.9, .4], [4.2, 4.5], [4.75, 8.6], [4.5, 8.75], [4.25, 8.4], [3.9, 4.6], [2.5, 1.0], [0, .8]].map(p => new THREE.Vector2(p[0], p[1]));
    add(new THREE.LatheGeometry(prof, 72), M.porcelain, [0, 0, 0], g);
    add(new THREE.CircleGeometry(4.35, 64).rotateX(-Math.PI / 2), new THREE.MeshPhysicalMaterial({ map: latteTexture(), roughness: .35, clearcoat: .6 }), [0, 7.9, 0], g, false);
    const h = add(new THREE.TorusGeometry(1.7, .42, 16, 40, Math.PI * 1.1), M.porcelain, [4.9, 5.0, 0], g); h.rotation.z = -Math.PI * .55;
    place(g, { ...LAYOUT.latte, ry: -.5 }); blob(LAYOUT.latte.x, LAYOUT.latte.z, 15, 15, 0, .45); }
  // lunettes
  { const g = new THREE.Group(); const fr = new THREE.MeshPhysicalMaterial({ color: '#1b1a19', roughness: .3, clearcoat: 1 });
    const lens = new THREE.MeshPhysicalMaterial({ color: '#cfd6d3', roughness: .05, transmission: .9, transparent: true, opacity: .35, thickness: .2 });
    for (const sx of [-1, 1]) { const ring = add(new THREE.TorusGeometry(2.25, .24, 12, 48), fr, [sx * 2.9, .6, 0], g); ring.rotation.x = Math.PI / 2; ring.scale.set(1.18, 1, 1);
      add(new THREE.CircleGeometry(2.2, 40).rotateX(-Math.PI / 2).scale(1.18, 1, 1), lens, [sx * 2.9, .62, 0], g, false);
      const tm = add(new THREE.BoxGeometry(.32, .3, 12.5), fr, [sx * 5.4, .45, 6.4], g); tm.rotation.y = sx * -.08; }
    add(new THREE.BoxGeometry(1.4, .28, .3), fr, [0, .78, -.4], g);
    place(g, LAYOUT.glasses); blob(LAYOUT.glasses.x, LAYOUT.glasses.z + 3, 16, 16, LAYOUT.glasses.ry, .22); }
  // clés USB
  function usb(L) { const g = new THREE.Group(); add(slab(1.9, 4.2, .8, .35, .1, 3), M.ti, [0, 0, 0], g); add(new THREE.BoxGeometry(1.25, .45, 1.3), M.chrome, [0, .3, -2.65], g);
    add(new THREE.TorusGeometry(.32, .1, 8, 20), M.chrome, [0, .45, 1.65], g).rotation.x = Math.PI / 2; place(g, L); blob(L.x, L.z, 3.4, 7, L.ry, .4); }
  usb(LAYOUT.usb1); usb(LAYOUT.usb2); usb(LAYOUT.usb3);
  // étui d'écouteurs
  { const g = new THREE.Group(); add(slab(6.0, 4.8, 2.3, 2.0, 1.0, 8), M.white, [0, 0, 0], g); add(new THREE.BoxGeometry(5.8, .03, .05), M.ceramic, [0, 1.6, .9], g);
    place(g, LAYOUT.earbuds); blob(LAYOUT.earbuds.x, LAYOUT.earbuds.z, 9, 8, LAYOUT.earbuds.ry, .5); }
  // agenda
  { const g = new THREE.Group(); const lea = new THREE.MeshStandardMaterial({ color: '#2f3c36', roughness: .7 });
    add(slab(15, 21, 2.0, .6, .25, 4), lea, [0, 0, 0], g); add(new THREE.BoxGeometry(14.4, 1.7, 20.4), M.paper, [.4, .15, 0], g);
    add(new THREE.BoxGeometry(.55, .1, 21.2), new THREE.MeshStandardMaterial({ color: '#141615', roughness: .6 }), [5.2, 2.02, 0], g);
    add(new THREE.BoxGeometry(.6, .05, 5), new THREE.MeshStandardMaterial({ color: '#0f4b3a', roughness: .5 }), [-3, .05, 12.6], g);
    place(g, LAYOUT.planner); blob(LAYOUT.planner.x, LAYOUT.planner.z, 21, 27, LAYOUT.planner.ry, .4); }
  // stylo gris
  { const g = new THREE.Group(); const gm = new THREE.MeshPhysicalMaterial({ color: '#8d9093', metalness: .7, roughness: .3 });
    const b2 = add(new THREE.CylinderGeometry(.42, .42, 13, 24), gm, [0, .42, 0], g); b2.rotation.z = Math.PI / 2;
    const t2 = add(new THREE.ConeGeometry(.42, 1.5, 24), M.chrome, [7.25, .42, 0], g); t2.rotation.z = -Math.PI / 2;
    place(g, LAYOUT.pen2); blob(LAYOUT.pen2.x, LAYOUT.pen2.z, 15, 2.4, LAYOUT.pen2.ry, .4); }
  // notes autocollantes
  [[tSt1, LAYOUT.sticky1, 0], [tSt2, LAYOUT.sticky2, .05], [tSt2, LAYOUT.sticky3, 0]].forEach(([t, L, y]) => { const m = add(new THREE.BoxGeometry(7.6, .05, 7.6), [M.paper, M.paper, t ? lit(t, { roughness: .9 }) : M.paper, M.paper, M.paper, M.paper], [L.x, y + .03, L.z], world, true, true); m.rotation.y = L.ry; });
  // trombones
  function paperclip(L) { const g = new THREE.Group();
    const pts = [[0, 0], [0, 3.2], [.9, 3.2], [.9, -.3], [-.35, -.3], [-.35, 2.5], [.45, 2.5], [.45, .6]].map(([x, z]) => new THREE.Vector3(x, .1, -z));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', .05);
    add(new THREE.TubeGeometry(curve, 80, .055, 6, false), M.chrome, [0, 0, 0], g); place(g, L); return g; }
  paperclip(LAYOUT.clips1); paperclip({ x: LAYOUT.clips1.x + 2.2, z: LAYOUT.clips1.z + 1, ry: 1.2 }); paperclip(LAYOUT.clips2); paperclip({ x: LAYOUT.clips2.x + 1.8, z: LAYOUT.clips2.z - 1.6, ry: .8 });

  // ombre douce de fenêtre et de feuillage sur le bureau (profondeur, lumière naturelle)
  const gobo = (() => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 640; const x = c.getContext('2d');
    x.filter = 'blur(22px)'; x.fillStyle = '#000';
    x.save(); x.translate(512, 320); x.rotate(-.42);
    for (let i = -3; i <= 3; i++) x.fillRect(i * 230 - 14, -700, 28, 1400);     // montants de fenêtre
    x.fillRect(-900, -40, 1800, 24); x.restore();
    x.filter = 'blur(14px)';
    let r = 7; const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 46; i++) { const cx = 80 + rnd() * 300, cy = 40 + rnd() * 260, a = rnd() * 6.28; x.beginPath(); x.ellipse(cx, cy, 34 + rnd() * 26, 12 + rnd() * 8, a, 0, 6.28); x.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: .085, depthWrite: false, blending: THREE.MultiplyBlending, premultipliedAlpha: true });
    m.blending = THREE.NormalBlending;
    const g = add(new THREE.PlaneGeometry(260, 162).rotateX(-Math.PI / 2), m, [-40, .045, -8], world, false); g.renderOrder = 1;
    return { g, t };
  })();
  // lumières : fenêtre douce en haut à gauche
  const hemi = new THREE.HemisphereLight('#ffffff', '#e6e4df', 1.2); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff8ef', 2.2);
  sun.castShadow = true; sun.shadow.mapSize.set(low ? 1024 : 2048, low ? 1024 : 2048);
  sun.shadow.radius = 9; sun.shadow.blurSamples = 16; sun.shadow.bias = -0.0006; sun.shadow.normalBias = .02;
  sun.shadow.camera.near = 10; sun.shadow.camera.far = 600;
  scene.add(sun); scene.add(sun.target);
  const fill = new THREE.DirectionalLight('#eef4ff', .35); fill.position.set(150, 120, 120); scene.add(fill);
  const SUN_OFF = new THREE.Vector3(-95, 175, -75);

  // état
  const tmp = new THREE.Vector3(), q = new THREE.Vector3();
  let W = 1, H = 1;
  function resize(w, h) { W = w; H = h; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  const upV = new THREE.Vector3(), dirV = new THREE.Vector3();
  function setCamera(pos, target, rollDeg, fov, shift = 0) {
    // haut du monde comme référence : les verticales restent verticales (aucun roulis parasite)
    dirV.subVectors(target, pos).normalize();
    if (Math.abs(dirV.y) > .995) upV.set(0, .7071, -.7071); else upV.set(0, 1, 0);
    camera.position.copy(pos); camera.up.copy(upV); camera.lookAt(target); camera.rotateZ(THREE.MathUtils.degToRad(rollDeg));
    // décentrement optique (comme un objectif à bascule) : déplace le cadrage sans déformer la perspective
    const skew = shift * camera.getFilmWidth() * 2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2) * camera.aspect;
    if (Math.abs(camera.fov - fov) > 1e-4 || Math.abs(camera.filmOffset - skew) > 1e-5) { camera.fov = fov; camera.filmOffset = skew; camera.updateProjectionMatrix(); }
    camera.updateMatrixWorld();
    // ombre : la caméra de lumière suit la zone regardée
    const s = THREE.MathUtils.clamp(pos.distanceTo(target) * .62, 34, 190);
    const sc = sun.shadow.camera;
    if (Math.abs(sc.right - s) > .5) { sc.left = -s; sc.right = s; sc.top = s; sc.bottom = -s; sc.updateProjectionMatrix(); }
    const step = s * 2 / sun.shadow.mapSize.x;
    sun.target.position.set(Math.round(target.x / step) * step, 0, Math.round(target.z / step) * step);
    sun.position.copy(sun.target.position).add(SUN_OFF);
  }
  function setScreenScroll(v) { if (tSite) tSite.offset.y = (1 - tSite.repeat.y) * (1 - v); }
  // coins de l'écran du téléphone en pixels (haut gauche, haut droite, bas droite, bas gauche)
  function phoneCorners() {
    const y = PHONE.d + .01, w = PHONE.sw / 2, h = PHONE.sh / 2;
    return [[-w, -h], [w, -h], [w, h], [-w, h]].map(([x, z]) => {
      tmp.set(x, y, z); phone.localToWorld(tmp); q.copy(tmp).project(camera);
      return [(q.x * .5 + .5) * W, (-q.y * .5 + .5) * H, q.z];
    });
  }
  function render() { renderer.render(scene, camera); }
  // coins projetés d'un écran (haut gauche, haut droite, bas droite, bas gauche), d'après les UV du plan
  const SCR = { hero: scrHero, laptop: scrLap, tablet: scrTab, pad: scrPad, monitor: scrMon };
  const uvIdx = {};
  for (const [k, m] of Object.entries(SCR)) {
    const uv = m.geometry.attributes.uv; const f = (u, v) => { for (let i = 0; i < uv.count; i++) if (Math.abs(uv.getX(i) - u) < 1e-3 && Math.abs(uv.getY(i) - v) < 1e-3) return i; return 0; };
    uvIdx[k] = [f(0, 1), f(1, 1), f(1, 0), f(0, 0)];
  }
  function screenCorners(k) {
    const m = SCR[k], pa = m.geometry.attributes.position; m.updateWorldMatrix(true, false);
    return uvIdx[k].map(i => { tmp.fromBufferAttribute(pa, i); m.localToWorld(tmp); q.copy(tmp).project(camera); return [(q.x * .5 + .5) * W, (-q.y * .5 + .5) * H, q.z]; });
  }
  // léger balancement de l'ombre du feuillage (très lent)
  function tick(t) { gobo.g.position.x = -40 + Math.sin(t * .35) * 1.6; gobo.g.position.z = -8 + Math.sin(t * .23 + 1) * 1.0; }
  return { renderer, scene, camera, resize, setCamera, render, phoneCorners, screenCorners, tick, setScreenScroll, THREE };
}
