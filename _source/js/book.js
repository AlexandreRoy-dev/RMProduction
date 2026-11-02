import { BOOKING_URL } from './config.js';
const top = document.getElementById('top');
const menu = document.querySelector('.menu');
if (menu && top) {
  menu.addEventListener('click', () => {
    const open = top.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}
const dlg = document.getElementById('book');
function openBook(e) {
  if (!dlg || typeof dlg.showModal !== 'function') return;
  e.preventDefault();
  if (!dlg.dataset.ready) {
    const f = document.createElement('iframe');
    f.src = BOOKING_URL;
    f.title = document.documentElement.lang.startsWith('fr') ? 'Planifier une consultation' : 'Book a consultation';
    document.getElementById('bookBody').appendChild(f);
    dlg.dataset.ready = '1';
  }
  dlg.showModal();
}
document.querySelectorAll('[data-book]').forEach(a => a.addEventListener('click', openBook));
if (dlg) {
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
  });
}
