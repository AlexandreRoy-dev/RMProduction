/* Roy Marketing, accueil : défilement natif. Mobile : sections empilées. Bureau (900 px et plus) : sections en alternance. */
import { BOOKING_URL, BOOKING_EMBED_SCRIPT } from './config.js';
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
const DESK = matchMedia('(min-width: 900px)');
const CALM = matchMedia('(prefers-reduced-motion: reduce)');
const LOGO = ROOT + 'assets/brand/logo/mark/mark-dark-on-light.svg';

/* ---------- réservation (modale, iframe chargée à l'ouverture seulement) ---------- */
function initBooking() {
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
  };
  $$('[data-booking]').forEach(a => { a.setAttribute('href', BOOKING_URL); a.addEventListener('click', e => { e.preventDefault(); open(); }); });
  dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
}

/* ---------- navigation : bureau = défilement natif adouci ; mobile = fondu doux et saut instantané ---------- */
let jumping = false;
function fadeJump(go) {
  const f = $('#jumpFade');
  if (!f || CAPTURE) { go(); return; }
  if (jumping) return; jumping = true;
  f.classList.add('is-on');
  setTimeout(() => {
    go();
    // deux images pour que la scène soit déjà à jour sous le voile avant qu'il ne se retire
    requestAnimationFrame(() => requestAnimationFrame(() => { f.classList.remove('is-on'); setTimeout(() => { jumping = false; }, 340); }));
  }, 330);
}
function initNav(targetY, jumpTo) {
  $$('a[href^="#"]').forEach(a => {
    if (a.hasAttribute('data-booking') || a.classList.contains('skip')) return;
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const y = targetY(id); if (y == null) return;
      e.preventDefault();
      if (DESK.matches) window.scrollTo({ top: y, behavior: CALM.matches ? 'auto' : 'smooth' });
      else fadeJump(() => jumpTo(y));
      if (history.replaceState) history.replaceState(null, '', id === 'top' ? location.pathname : '#' + id);
    });
  });
  const tt = $('#toTop');
  if (tt) {
    let on = false;
    const form = $('form.form');
    // masqué aussi quand le formulaire passe sous le bouton (évite qu'il chevauche « Envoyer »)
    const overForm = () => { if (!form) return false; const r = form.getBoundingClientRect(), t = tt.getBoundingClientRect(); return r.bottom > t.top - 16 && r.top < t.bottom + 16 && r.right > t.left - 16 && r.left < t.right + 16; };
    const chk = () => { const v = scrollY > innerHeight * .9 && !overForm(); if (v !== on) { on = v; tt.classList.toggle('is-on', v); } };
    addEventListener('scroll', chk, { passive: true }); addEventListener('resize', chk, { passive: true }); chk();
    // le formulaire peut encore glisser (apparition) après le dernier défilement : vérification légère en continu
    setInterval(() => { if (!document.hidden) chk(); }, 300);
  }
}

/* ---------- formulaire : validation en ligne et état d'envoi (envoi natif inchangé vers Formspree) ---------- */
function initForm() {
  const f = $('form.form'); if (!f) return;
  const nom = f.querySelector('[name="nom"]'), mail = f.querySelector('[name="courriel"]'), status = f.querySelector('.form__status'), btn = f.querySelector('.send');
  const okMail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  const set = (inp, msg) => { const fd = inp.closest('.field'); fd.classList.toggle('is-bad', !!msg); inp.setAttribute('aria-invalid', msg ? 'true' : 'false'); fd.querySelector('.field__err').textContent = msg || ''; };
  const check = (inp, force) => {
    if (inp === nom) { const bad = !nom.value.trim(); if (bad && !force && !nom.dataset.t) return true; set(nom, bad ? f.dataset.errName : ''); return !bad; }
    const bad = !okMail(mail.value); if (bad && !force && !mail.dataset.t) return true; set(mail, bad ? f.dataset.errEmail : ''); return !bad;
  };
  [nom, mail].forEach(inp => {
    inp.addEventListener('blur', () => { if (inp.value.trim()) inp.dataset.t = 1; check(inp); });
    inp.addEventListener('input', () => { if (inp.closest('.field').classList.contains('is-bad')) check(inp, true); });
  });
  f.addEventListener('submit', e => {
    const a = check(nom, true), b = check(mail, true);
    if (!a || !b) { e.preventDefault(); status.textContent = f.dataset.fix; (a ? mail : nom).focus(); return; }
    status.textContent = '';
    btn.classList.add('is-loading'); btn.querySelector('.send__label').textContent = btn.dataset.sending;
  });
  // retour arrière depuis la page de confirmation : bouton remis à neuf
  addEventListener('pageshow', () => { btn.classList.remove('is-loading'); });
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

/* ---------- bureau : apparition douce des sections (aucun détournement du défilement) ---------- */
function initReveal() {
  if (!DESK.matches || CALM.matches || CAPTURE || !('IntersectionObserver' in window)) return;
  const els = $$('.chap:not(.chap--hero) .dm, .chap:not(.chap--hero) .mock, .chap:not(.chap--hero) .panel');
  // ce qui est déjà à l'écran au chargement reste visible tout de suite
  els.forEach(el => { if (el.getBoundingClientRect().top > innerHeight * .92) el.classList.add('rv'); });
  doc.classList.add('rv-on');
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  els.filter(el => el.classList.contains('rv')).forEach(el => io.observe(el));
}

/* ---------- bureau : en-tête opaque après l'accueil ---------- */
function initHeader() {
  const hd = $('#top'); if (!hd) return;
  let on = null;
  const chk = () => { const v = DESK.matches && scrollY > 40; if (v !== on) { on = v; hd.classList.toggle('is-solid', v); } };
  addEventListener('scroll', chk, { passive: true }); DESK.addEventListener && DESK.addEventListener('change', chk); chk();
}

/* ---------- démarrage ---------- */
(function boot() {
  initStacked();
  initDeviceMocks();
  initBooking();
  initNav(id => {
    if (id === 'top' || id === 'contenu') return 0;
    const el = document.getElementById(id); if (!el) return null;
    const hd = $('#top'); const off = hd ? hd.getBoundingClientRect().height : 0;
    return Math.max(0, Math.round(el.getBoundingClientRect().top + scrollY - off - 8));
  }, y => window.scrollTo({ top: y, behavior: 'instant' }));
  initForm();
  initHeader();
  initReveal();
  window.__rmReady = true;
})();
