/* Roy Marketing, accueil v2 : orchestration du défilement cinématique. */
import { BOOKING_URL, BOOKING_EMBED_SCRIPT, THREE_LOW_DPR } from './config.js';
import { buildPhone } from './phone.js';
import { BUILDERS } from './screens.js';

const I18N = window.RM_I18N || { lang: 'fr' };
const ROOT = window.RM_ROOT || '';
const doc = document.documentElement;
const qs = new URLSearchParams(location.search);
const CAPTURE = qs.has('capture');
if (CAPTURE && !qs.has('intro')) doc.classList.add('no-intro');
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (x, a, b) => cl((x - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = t => t * t * t * (t * (t * 6 - 15) + 10);          // smootherstep : vitesse nulle aux extrémités
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const eo = t => 1 - Math.pow(1 - t, 3);
const R = v => Math.round(v * 1000) / 1000;
const LOGO = ROOT + 'assets/brand/logo/mark/mark-dark-on-light.svg';

/* ---------- réservation (modale, iframe chargée à l'ouverture seulement) ---------- */
function initBooking(lenisRef) {
  const dlg = $('#booking'); if (!dlg) return;
  let loaded = false;
  const open = () => {
    if (!loaded) {
      loaded = true;
      const f = document.createElement('iframe');
      f.src = BOOKING_URL; f.title = I18N.modalTitle || 'Appel découverte'; f.loading = 'lazy';
      f.id = BOOKING_URL.split('/').pop() + '_booking'; f.setAttribute('scrolling', 'no');
      f.addEventListener('load', () => dlg.classList.add('is-loaded'));
      $('#bookingBody').appendChild(f);
      const sc = document.createElement('script'); sc.src = BOOKING_EMBED_SCRIPT; sc.async = true; document.body.appendChild(sc);
    }
    if (typeof dlg.showModal === 'function') dlg.showModal(); else window.open(BOOKING_URL, '_blank', 'noopener');
    lenisRef.current && lenisRef.current.stop();
  };
  $$('[data-booking]').forEach(a => { a.setAttribute('href', BOOKING_URL); a.addEventListener('click', e => { e.preventDefault(); open(); }); });
  dlg.addEventListener('close', () => lenisRef.current && lenisRef.current.start());
  dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
}

/* ---------- version simple : téléphone animé dans la maquette ---------- */
function initStacked() {
  const el = $('#phoneUIStatic'); if (!el) return;
  const ph = buildPhone(el, LOGO, I18N.lang);
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $$('.steps li').forEach(li => li.classList.add('is-on'));
  if (calm) { ph.render(.72); return; }
  let on = false, t0 = 0;
  new IntersectionObserver(es => { on = es[0].isIntersecting; if (on) { t0 = performance.now(); requestAnimationFrame(loop); } }, { threshold: .2 }).observe(el);
  const DUR = 18000;
  function loop(now) { if (!on) return; ph.render(((now - t0) % DUR) / DUR); requestAnimationFrame(loop); }
  ph.render(0);
}

/* ---------- version simple : écrans animés des appareils (maquettes CSS) ---------- */
function initDeviceMocks() {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = $$('.dm__scr').map(el => {
    const s = BUILDERS[el.dataset.screen](el, I18N.lang);
    const fit = () => { const w = el.clientWidth; if (w) el.firstElementChild.style.transform = `scale(${w / s.W})`; };
    fit(); new ResizeObserver(fit).observe(el);
    const it = { el, s, on: false, t0: 0, off: +el.dataset.offset || 0 };
    // image fixe soignée si mouvement réduit
    s.render(calm ? (s.cycle || 16) * .3 + it.off : it.off);
    return it;
  });
  if (calm || !items.length) return;
  const io = new IntersectionObserver(es => es.forEach(e => { const it = items.find(i => i.el === e.target); if (!it) return; if (e.isIntersecting && !it.on) it.t0 = performance.now() / 1000; it.on = e.isIntersecting; }), { rootMargin: '80px' });
  items.forEach(it => io.observe(it.el));
  (function loop() { const now = performance.now() / 1000; for (const it of items) if (it.on) it.s.render(now - it.t0 + it.off); requestAnimationFrame(loop); })();
}

/* ---------- homographie : place l'écran HTML sur les 4 coins projetés ---------- */
function homography(w, h, d) {
  const s = [[0, 0], [w, 0], [w, h], [0, h]], A = [], B = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = s[i], [u, v] = d[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); B.push(v);
  }
  for (let c = 0; c < 8; c++) {                       // élimination de Gauss
    let m = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[m][c])) m = r;
    [A[c], A[m]] = [A[m], A[c]]; [B[c], B[m]] = [B[m], B[c]];
    for (let r = 0; r < 8; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]; B[r] -= f * B[c]; }
  }
  const x = B.map((b, i) => b / A[i][i]);
  return `matrix3d(${x[0]},${x[3]},0,${x[6]},${x[1]},${x[4]},0,${x[7]},0,0,1,0,${x[2]},${x[5]},0,1)`;
}

/* ---------- chemin de caméra ---------- */
// Chaque arrêt : position, cible, roulis (degrés), focale. Les transitions ont chacune leur caractère.
const V = (x, y, z) => ({ x, y, z });
const SHOTS = [
  { p: V(-30, 31.1, 31.8), t: V(-30, 7.2, -30.3), roll: 0, fov: 32, shift: .2 },   // 0 accueil : tablette vue de face (axe de l'écran), objectif décentré
  { p: V(-90, 50, 40), t: V(-88, 6, -10), roll: 0, fov: 34 },         // 1 portable : applications
  { p: V(-9.6, 40, 57.2), t: V(-9.6, 0, 54.2), roll: 5.7, fov: 33 },   // 2 téléphone : automatisation
  { p: V(37, 47, -12), t: V(37, 0, -23.5), roll: -4, fov: 34 },          // 3 tablette : ERP et CRM
  { p: V(108, 52, 52), t: V(108, 0, 40), roll: 3.4, fov: 34 },           // 4 carnet : IA
  { p: V(134, 38, 46), t: V(134, 25, -64), roll: 0, fov: 34 },           // 5 écran : sites web
  { p: V(46, 250, 62), t: V(46, 0, 6), roll: 0, fov: 34 }                // 6 vue d'ensemble
];
// caractère de chaque transition (vers l'arrêt i)
const MOVES = [null,
  { kind: 'push', arc: 6 },        // plongée vers l'écran du portable
  { kind: 'glide', arc: 34 },      // glisse en arc vers le téléphone
  { kind: 'crane', arc: 70 },      // grue : on remonte puis on redescend sur la tablette
  { kind: 'slide', arc: 10 },      // travelling latéral avec rotation
  { kind: 'tilt', arc: 28 },       // on relève le regard vers l'écran
  { kind: 'rise', arc: 0 }         // envol final
];
const LAST = SHOTS.length - 1;     // vue d'ensemble finale
const TRANS = .44;                 // part de chaque chapitre consacrée au mouvement

function shotAt(chapters, p) {
  // chapitre courant
  let i = 0; while (i < chapters.length - 1 && p >= chapters[i + 1].a) i++;
  const c = chapters[i]; const lp = seg(p, c.a, c.b);
  const out = { p: V(0, 0, 0), t: V(0, 0, 0), roll: 0, fov: 35, shift: 0, i, lp, moving: false };
  const S = SHOTS[i];
  if (i === 0 || lp >= TRANS) {
    // tenue : léger mouvement continu (dolly très lent), vitesse nulle aux bornes
    const h = i === 0 ? lp : seg(lp, TRANS, 1);
    const d = (1 - Math.cos(Math.PI * h)) / 2;
    const dir = V(S.t.x - S.p.x, S.t.y - S.p.y, S.t.z - S.p.z);
    const k = i === LAST ? 0 : .05 * d;
    out.p = V(S.p.x + dir.x * k, S.p.y + dir.y * k, S.p.z + dir.z * k);
    out.t = { ...S.t }; out.roll = S.roll + (i === LAST ? 0 : .8 * (d - .5)); out.fov = S.fov; out.shift = S.shift || 0;
    if (i === 0) { out.roll = 0; }
    return out;
  }
  // transition de l'arrêt i-1 vers i
  const A = SHOTS[i - 1], B = S, M = MOVES[i];
  const k = seg(lp, 0, TRANS); const e = sstep(k); const bump = Math.sin(Math.PI * k);
  // le départ reprend la position de fin de tenue précédente (dolly de 5 %)
  const Ad = V(A.t.x - A.p.x, A.t.y - A.p.y, A.t.z - A.p.z), kd = i - 1 === 0 ? 0 : .05;
  const Ap = i - 1 === 0 ? A.p : V(A.p.x + Ad.x * kd, A.p.y + Ad.y * kd, A.p.z + Ad.z * kd);
  const Aroll = i - 1 === 0 ? A.roll : A.roll + .4;
  let et = e;
  if (M.kind === 'glide' || M.kind === 'slide') et = sstep(Math.min(1, k * 1.12));   // le regard précède le mouvement
  if (M.kind === 'tilt') et = sstep(cl((k - .25) / .75));                              // le regard se relève en fin de course
  if (M.kind === 'drop') et = sstep(cl(k / .7));                                        // le regard redescend tôt
  out.p = V(lerp(Ap.x, B.p.x, e), lerp(Ap.y, B.p.y, e), lerp(Ap.z, B.p.z, e));
  out.t = V(lerp(A.t.x, B.t.x, et), lerp(A.t.y, B.t.y, et), lerp(A.t.z, B.t.z, et));
  out.roll = lerp(Aroll, B.roll, e); out.fov = lerp(A.fov, B.fov, e); out.shift = lerp(A.shift || 0, B.shift || 0, e);
  if (M.kind === 'push') { out.fov -= 3 * bump; }
  if (M.kind === 'glide') { out.p.y += M.arc * bump; out.p.z += 10 * bump; out.roll += 4 * bump; }
  if (M.kind === 'crane') { out.p.y += M.arc * bump; out.t.y += 0; out.roll -= 6 * bump; }
  if (M.kind === 'slide') { out.p.y += M.arc * bump; out.roll += 7 * bump; out.p.z += 14 * bump; }
  if (M.kind === 'tilt') { out.p.y += M.arc * bump; }
  if (M.kind === 'drop') { out.p.y += M.arc * bump; out.p.z += 10 * bump; }
  if (M.kind === 'rise') { out.roll += 0; }
  out.moving = true;
  return out;
}

/* ---------- textes : entrées différentes pour chaque chapitre ---------- */
const PANEL_IN = {
  1: 'mask', 2: 'rise', 3: 'mask', 4: 'wipe', 5: 'mask', 6: 'slide'
};
function stylePanel(el, kind, vin, vout, side) {
  const v = Math.min(vin, 1 - vout);
  if (v <= 0) { el.style.visibility = 'hidden'; return; }
  el.style.visibility = 'visible';
  const ei = eo(vin), eoO = ease(vout);
  let tf = 'translateY(-50%)', clip = 'none', op = 1, filt = 'none';
  if (kind === 'mask') { clip = side === 'left' ? `inset(0 ${R((1 - ei) * 100)}% 0 0 round 18px)` : `inset(0 0 0 ${R((1 - ei) * 100)}% round 18px)`; tf += ` translateX(${R((1 - ei) * (side === 'left' ? -24 : 24))}px)`; }
  if (kind === 'rise') { tf += ` translateY(${R((1 - ei) * 40)}px)`; op = ei; filt = `blur(${R((1 - ei) * 8)}px)`; }
  if (kind === 'wipe') { clip = `inset(${R((1 - ei) * 100)}% 0 0 0 round 18px)`; tf += ` translateY(${R((1 - ei) * 30)}px)`; }
  if (kind === 'slide') { tf += ` translateX(${R((1 - ei) * 60)}px)`; op = ei; }
  // sortie commune : légère montée et fondu
  tf += ` translateY(${R(-eoO * 36)}px)`; op *= 1 - eoO;
  el.style.transform = tf; el.style.clipPath = clip; el.style.opacity = R(op); el.style.filter = filt;
}

/* ---------- version cinématique ---------- */
async function initCine() {
  const { createScene } = await import('./scene.js');
  const canvas = $('#desk');
  const low = (navigator.hardwareConcurrency || 8) <= 4 || CAPTURE;
  const S = await createScene(canvas, { base: ROOT + 'assets/tex/', low, lang: I18N.lang });
  const { THREE } = S;
  const phoneEl = $('#phoneUI');
  const phone = buildPhone(phoneEl, LOGO, I18N.lang);

  // chapitres : hauteurs de défilement (en vh)
  const HEIGHTS = [110, 180, 300, 180, 170, 190, 160];
  const secs = $$('.track .chap');
  secs.forEach((s, i) => s.style.setProperty('--h', HEIGHTS[i] + 'vh'));
  const track = $('#track');
  let chapters = [], trackTop = 0, trackLen = 1, vw = innerWidth, vh = innerHeight;
  function measure() {
    vw = innerWidth; vh = innerHeight;
    trackTop = track.offsetTop; trackLen = Math.max(1, track.offsetHeight - vh);
    let acc = 0; const tot = HEIGHTS.reduce((a, b) => a + b, 0);
    chapters = HEIGHTS.map((h, i) => { const a = acc / tot; acc += h; return { a, b: Math.min(1, acc / tot) }; });
    S.resize(vw, vh);
  }
  measure();

  const panels = secs.map(s => s.querySelector('.panel'));
  const sides = panels.map(p => p && getComputedStyle(p).left !== 'auto' && parseFloat(getComputedStyle(p).left) < vw / 2 ? 'left' : 'right');
  const heroLines = $$('.panel--hero > *');
  const steps = $$('#automatisation .steps li');
  const hudItems = $$('#hud li'); const hudBar = $('#hudBar'); const hud = $('#hud');
  const header = $('#top'); const fade = $('#fadeOut'); const cue = $('.scroll-cue');
  const pos = new THREE.Vector3(), tgt = new THREE.Vector3();
  let lastP = -1, firstFrame = true, sh = null;

  // horloge : réelle, ou fixée pour les captures (window.__rm.setClock)
  let clockOverride = null;
  const clock = () => clockOverride != null ? clockOverride : performance.now() / 1000;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // écrans animés des appareils, posés par homographie comme le téléphone
  const scrWrap = $('#scrWrap');
  // [écran 3D, contenu] : la tablette de l'accueil affiche le tableau de bord de l'application
  const screens = [['hero', 'laptop'], ['laptop', 'laptop'], ['tablet', 'tablet'], ['pad', 'pad'], ['monitor', 'monitor']].map(([k, b]) => {
    const el = document.createElement('div'); el.className = 'scr-ov scr-ov--' + k; scrWrap.appendChild(el);
    const s = BUILDERS[b](el, I18N.lang);
    return { k, el, s, vis: false, t0: 0, last: '' };
  });
  function placeScreens(t) {
    for (const o of screens) {
      const cs = S.screenCorners(o.k);
      const xs = cs.map(c => c[0]), ys = cs.map(c => c[1]);
      let area = 0; for (let i = 0; i < 4; i++) { const a = cs[i], b = cs[(i + 1) % 4]; area += a[0] * b[1] - b[0] * a[1]; }
      const vis = cs.every(c => c[2] < 1 && c[2] > -1) && area > 600 &&
        Math.max(...xs) > 0 && Math.min(...xs) < vw && Math.max(...ys) > 0 && Math.min(...ys) < vh;
      if (!vis) { if (o.vis) { o.el.style.display = 'none'; o.vis = false; } continue; }
      if (!o.vis) { o.el.style.display = 'block'; o.vis = true; if (clockOverride == null && o.k !== 'hero') o.t0 = t - (o.k === 'laptop' ? 4.5 : 0); }
      const m = homography(o.s.W, o.s.H, cs);
      if (m !== o.last) { o.el.style.transform = m; o.last = m; }
      o.s.render(calm ? (o.s.cycle || 16) * .3 : t - o.t0);
    }
  }

  // profondeur : parallaxe douce à la souris, dérive lente de la caméra, entrée en scène
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  if (!CAPTURE && !calm) addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { mouse.x = e.clientX / vw * 2 - 1; mouse.y = e.clientY / vh * 2 - 1; } }, { passive: true });
  const glowEl = $('#glow');
  const INTRO = 3.0; let introStart = null;
  const playIntro = !calm && (!CAPTURE || qs.has('intro'));

  function camera(p, t) {
    sh = shotAt(chapters, p);
    pos.set(sh.p.x, sh.p.y, sh.p.z); tgt.set(sh.t.x, sh.t.y, sh.t.z);
    let roll = sh.roll, fov = sh.fov; const shift = sh.shift || 0;
    // accueil : plus la page descend, moins les effets sont marqués
    const heroW = sh.i === 0 ? 1 - .6 * ease(sh.lp) : .3;
    // parallaxe lissée (aucune secousse : interpolation exponentielle)
    mouse.sx += (mouse.x - mouse.sx) * .045; mouse.sy += (mouse.y - mouse.sy) * .045;
    pos.x += mouse.sx * 2.6 * heroW; pos.y -= mouse.sy * 1.6 * heroW; pos.z += mouse.sy * 1.2 * heroW;
    tgt.x += mouse.sx * .9 * heroW;
    // dérive lente, presque imperceptible
    if (!calm) { pos.x += Math.sin(t * .16) * 1.0 * heroW; pos.y += Math.sin(t * .11 + 1.3) * .7 * heroW; pos.z += Math.cos(t * .13) * .8 * heroW; }
    // entrée en scène : la caméra descend vers le bureau
    if (playIntro && introStart != null) {
      const k = sstep(cl((t - introStart) / INTRO)), r = 1 - k;
      pos.y += 46 * r; pos.z += 30 * r; tgt.z -= 4 * r; fov += 4 * r;
    }
    S.setCamera(pos, tgt, roll, fov, shift);
    if (glowEl) glowEl.style.opacity = R(sh.i === 0 ? 1 - ease(seg(sh.lp, 0, .9)) : 0);
  }

  function update(force) {
    const y = window.scrollY;
    const p = cl((y - trackTop) / trackLen);
    header.classList.toggle('is-solid', y > trackTop + trackLen + vh * .5);
    const t = clock();
    camera(p, t);
    S.tick && S.tick(t);
    placeScreens(t);
    if (!force && Math.abs(p - lastP) < 1e-6) { S.render(); return; }
    lastP = p;

    // téléphone : progression des automatisations pendant le chapitre 2
    const c2 = chapters[2];
    const q = seg(p, c2.a + (c2.b - c2.a) * (TRANS - .02), c2.b - (c2.b - c2.a) * .1);
    phone.render(q);
    const st = phone.step(q);
    steps.forEach((li, j) => li.classList.toggle('is-on', j === st));
    // écran du site : défilement lent pendant le chapitre 5
    const c5 = chapters[5]; S.setScreenScroll(ease(seg(p, c5.a + (c5.b - c5.a) * .56, c5.b - (c5.b - c5.a) * .04)));

    // écran HTML du téléphone
    const cs = S.phoneCorners();
    const xs = cs.map(c => c[0]), ys = cs.map(c => c[1]);
    const visible = cs.every(c => c[2] < 1 && c[2] > -1) && Math.max(...xs) > -50 && Math.min(...xs) < vw + 50 && Math.max(...ys) > -50 && Math.min(...ys) < vh + 50 && (Math.max(...ys) - Math.min(...ys)) > 24;
    if (visible) { phoneEl.style.display = 'block'; phoneEl.style.visibility = 'visible'; phoneEl.style.transform = homography(360, 770, cs); }
    else phoneEl.style.display = 'none';

    // textes
    const ch = sh.i, lp = sh.lp;
    // accueil : les lignes se lèvent une à une
    const hout = seg(chapters[0].b > 0 ? p : 0, chapters[0].b * .25, chapters[0].b * 1.05);
    heroLines.forEach((el, j) => { const k = ease(seg(hout, j * .08, .6 + j * .08)); el.style.transform = `translateY(${R(-k * 60)}px)`; el.style.opacity = R(1 - k); });
    if (cue) cue.style.opacity = R(1 - seg(p, 0, chapters[0].b * .3));
    for (let j = 1; j < LAST; j++) {
      const c = chapters[j]; const l = seg(p, c.a, c.b);
      const vin = seg(l, TRANS - .1, TRANS + .1), vout = seg(l, .9, 1);
      stylePanel(panels[j], PANEL_IN[j], vin, vout, sides[j]);
    }
    // repère de progression
    const inChap = ch >= 1 && ch < LAST;
    hud.style.opacity = inChap || (ch === 0 && lp > .6) ? 1 : 0;
    hudItems.forEach(li => li.classList.toggle('is-on', +li.dataset.i === ch));
    hudBar.style.transform = `scaleX(${R(seg(p, chapters[1].a, chapters[LAST].a))})`;
    // fondu final vers les sections suivantes
    const c7 = chapters[LAST]; fade.style.opacity = R(ease(seg(p, c7.a + (c7.b - c7.a) * .55, c7.b)));

    S.render();
    if (firstFrame) { firstFrame = false; introStart = clock(); screens[0].t0 = introStart; doc.classList.add('scene-ready'); }
  }

  // défilement doux (Lenis), désactivé en mode capture
  const lenisRef = { current: null };
  if (!CAPTURE) {
    try {
      const { default: Lenis } = await import('lenis');
      lenisRef.current = new Lenis({ lerp: .075, wheelMultiplier: .85, smoothWheel: true, touchMultiplier: 1.2 });
    } catch (e) { /* défilement natif */ }
  }
  initBooking(lenisRef);
  // ancres : on vise le moment où l'objet est cadré
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    if (a.hasAttribute('data-booking')) return;
    const id = a.getAttribute('href').slice(1); const el = document.getElementById(id); if (!el) return;
    e.preventDefault();
    let y = el.getBoundingClientRect().top + scrollY;
    const ci = secs.indexOf(el);
    if (ci > 0) y = trackTop + chapters[ci].a * trackLen + (chapters[ci].b - chapters[ci].a) * trackLen * (TRANS + .12);
    if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: Math.min(4, 1.2 + Math.abs(y - scrollY) / vh * .18) }); else scrollTo({ top: y, behavior: 'smooth' });
  }));
  function raf(t) { if (lenisRef.current) lenisRef.current.raf(t); update(false); requestAnimationFrame(raf); }
  addEventListener('resize', () => { measure(); update(true); });
  measure(); update(true);
  requestAnimationFrame(raf);

  // accès pour les captures automatiques
  window.__rm = {
    chapters: () => chapters,
    goto: (p) => { const y = trackTop + p * trackLen; scrollTo(0, y); update(true); return y; },
    hold: (i, f = .7) => chapters[i].a + (chapters[i].b - chapters[i].a) * (TRANS + (1 - TRANS) * f),
    gotoY: (y) => { scrollTo(0, y); update(true); },
    // captures : horloge déterministe des écrans animés
    setClock: (t) => { clockOverride = t; screens.forEach(o => { o.t0 = 0; }); mouse.sx = mouse.x; mouse.sy = mouse.y; update(true); },
    introAt: (x) => { clockOverride = introStart + x; update(true); },
    shot: (i, o) => { Object.assign(SHOTS[i], o); update(true); },
    setMouse: (x, y) => { mouse.x = mouse.sx = x; mouse.y = mouse.sy = y; update(true); }
  };
  window.__rmReady = true;
}

/* ---------- démarrage ---------- */
(async function boot() {
  if (doc.classList.contains('cine')) {
    try { await initCine(); return; }
    catch (err) { console.warn('Scène 3D indisponible, version simple.', err); doc.classList.remove('cine'); }
  }
  initStacked();
  initDeviceMocks();
  initBooking({ current: null });
  window.__rmReady = true;
})();
