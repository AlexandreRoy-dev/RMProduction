/* Écran du téléphone : automatisations reprises des pubs Roy Marketing (reel CRM et reel Sites web).
   render(q), q entre 0 et 1, piloté par le défilement (ou par le temps sur mobile). */
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (q, a, b) => cl((q - a) / (b - a));
const eo = x => 1 - Math.pow(1 - x, 3);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const back = x => { const c = 1.4; return x <= 0 ? 0 : x >= 1 ? 1 : 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const R = v => Math.round(v * 1000) / 1000;
const NB = '\u202F';

const STR = {
  fr: {
    day: 'lundi', app: 'CRM', now: 'maintenant', auto: 'Automatisation', newLead: 'Nouveau lead', formReq: `Formulaire web${NB}: demande de soumission`,
    welcome: 'Texto de bienvenue envoyé', welcomeSub: 'Réponse automatique au nouveau lead', crm: 'Votre CRM', newLeads: 'Nouveaux leads',
    who: 'Client potentiel', whoIni: 'CP', viaForm: "Formulaire web, à l'instant", email: 'Courriel', request: 'Demande', quote: 'Soumission', tagWeb: 'Site web', tagNew: 'Nouveau',
    sources: 'Sources', rows: ['Lead, formulaire web', 'Lead, Messenger', 'Lead, SMS', 'Lead, courriel'], sorted: 'TRIÉ', allOne: 'Tout au même endroit', sms: 'Texto',
    msg: `Bonjour${NB}! Merci pour votre demande. Voici le lien pour réserver un appel au moment qui vous convient.`, sentAuto: 'Envoyé automatiquement',
    reply: `Parfait, merci${NB}! Je réserve tout de suite.`, reply2: `Merci${NB}! À très bientôt.`, book: 'Réserver un appel', pickDay: 'Choisissez une journée',
    days: [['lun', '13'], ['mar', '14'], ['mer', '15'], ['jeu', '16'], ['ven', '17']], slotsT: 'Plages disponibles', slots: ['9 h 00', '10 h 30', '13 h 00', '15 h 30'],
    confirmed: 'Rendez-vous confirmé', reminder: 'Rappel planifié la veille', pipe: 'Pipeline', sales: 'Ventes', cols: ['Nouveau', 'Contacté', 'Rendez-vous'],
    k1: ['Demande de soumission', 'Formulaire web'], k2: ['Appel de suivi', 'Messenger'], k3: ['Rencontre', 'SMS'], kSub: ['Site web', 'Texto envoyé', 'Rendez-vous confirmé'],
    task: 'Tâche de suivi créée', hello: `Bonjour${NB}!`, myDay: 'Ma journée', items: ['Suivis à faire', 'Rendez-vous du jour', 'Soumissions à relancer', 'Leads à rappeler'], summary: 'Résumé envoyé chaque matin'
  },
  en: {
    day: 'Monday', app: 'CRM', now: 'now', auto: 'Automation', newLead: 'New lead', formReq: 'Web form: quote request',
    welcome: 'Welcome text sent', welcomeSub: 'Automatic reply to the new lead', crm: 'Your CRM', newLeads: 'New leads',
    who: 'Prospective client', whoIni: 'PC', viaForm: 'Web form, just now', email: 'Email', request: 'Request', quote: 'Quote', tagWeb: 'Website', tagNew: 'New',
    sources: 'Sources', rows: ['Lead, web form', 'Lead, Messenger', 'Lead, SMS', 'Lead, email'], sorted: 'SORTED', allOne: 'Everything in one place', sms: 'Text message',
    msg: 'Hi! Thanks for reaching out. Here is a link to book a call at a time that suits you.', sentAuto: 'Sent automatically',
    reply: 'Perfect, thank you! Booking now.', reply2: 'Thank you! Talk soon.', book: 'Book a call', pickDay: 'Pick a day',
    days: [['Mon', '13'], ['Tue', '14'], ['Wed', '15'], ['Thu', '16'], ['Fri', '17']], slotsT: 'Available times', slots: ['9:00 AM', '10:30 AM', '1:00 PM', '3:30 PM'],
    confirmed: 'Meeting confirmed', reminder: 'Reminder set for the day before', pipe: 'Pipeline', sales: 'Sales', cols: ['New', 'Contacted', 'Meeting'],
    k1: ['Quote request', 'Web form'], k2: ['Follow-up call', 'Messenger'], k3: ['Meeting', 'SMS'], kSub: ['Website', 'Text sent', 'Meeting confirmed'],
    task: 'Follow-up task created', hello: 'Good morning!', myDay: 'My day', items: ['Follow-ups to do', "Today's meetings", 'Quotes to follow up', 'Leads to call back'], summary: 'Summary sent every morning'
  }
};
const ICON = {
  bolt: '<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  list: '<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2"/></svg>',
  doc: '<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="10" cy="8" r="3.5"/><path d="M3.5 20a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6"/></svg>',
  sun: '<svg viewBox="0 0 24 24" style="width:1.6em;height:1.6em;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  ok: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5"/><path d="m7.5 12.3 3 3 6-6.3"/></svg>'
};

export function buildPhone(root, logoSrc, lang = 'fr') {
  const T = STR[lang] || STR.fr;
  root.innerHTML = `
  <div class="pu-scr pu-lock" data-s="lock">
    <div class="date">${T.day}</div><div class="time">9:41</div>
    <div class="pu-notif" data-e="n1" style="top:12.2em"><div class="ap"><img src="${logoSrc}" alt=""></div><div style="flex:1"><div class="hd"><span>${T.app}</span><span>${T.now}</span></div><b>${T.newLead}</b><p>${T.formReq}</p></div></div>
    <div class="pu-notif" data-e="n2" style="top:18.1em"><div class="ap"><img src="${logoSrc}" alt=""></div><div style="flex:1"><div class="hd"><span>${T.auto}</span><span>${T.now}</span></div><b>${T.welcome}</b><p>${T.welcomeSub}</p></div></div>
  </div>
  <div class="pu-scr pu-app" data-s="lead">
    <div class="pu-top"><h4>${T.crm}</h4><span class="chip">${T.newLeads}</span></div>
    <div class="pu-card" data-e="lc" style="top:6.6em;height:12.4em;padding:1.1em">
      <div style="display:flex;gap:.8em;align-items:center"><div class="pu-av">${T.whoIni}</div><div><div style="font:700 1.05em/1.2 Inter">${T.who}</div><div style="font:500 .8em/1.4 Inter;color:#5f6b66">${T.viaForm}</div></div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.8em;margin-top:1.1em">
        <div><div class="pu-fl">${T.email}</div><div class="pu-fv">client@courriel.ca</div></div>
        <div><div class="pu-fl">${T.request}</div><div class="pu-fv">${T.quote}</div></div>
      </div>
      <div style="position:absolute;left:1.1em;bottom:1em;display:flex;gap:.4em"><span class="pu-pill">${T.tagWeb}</span><span class="pu-pill">${T.tagNew}</span></div>
    </div>
    <div class="pu-card" style="top:20.2em;height:22.6em">
      <div style="position:absolute;left:1em;top:1em;font:700 .95em/1 Inter">${T.sources}</div>
      ${T.rows.map((t, i) => `<div class="pu-row" data-e="r${i}" style="top:${3.1 + i * 3.9}em"><span class="d"></span>${t}<span class="tag">${T.sorted}</span></div>`).join('')}
      <div data-e="all" style="position:absolute;left:0;right:0;bottom:1.1em;text-align:center;font:600 .8em/1 Inter;color:#1c7a5c">${T.allOne}</div>
    </div>
  </div>
  <div class="pu-scr pu-app" data-s="sms">
    <div class="pu-top" style="justify-content:flex-start;gap:.8em"><div class="pu-av" style="width:2.6em;height:2.6em;font-size:.95em">${T.whoIni}</div><div><h4 style="font-size:1.15em">${T.who}</h4><div style="font:500 .75em/1.4 Inter;color:#5f6b66">${T.sms}</div></div></div>
    <div style="position:absolute;left:1em;right:1em;top:7.2em;height:1px;background:#e6e8e3"></div>
    <div class="pu-bub out" data-e="b1" style="top:9em"><span data-t="b1t"></span></div>
    <div class="pu-auto" data-e="a1" style="top:20.6em">${ICON.bolt}${T.sentAuto}</div>
    <div class="pu-bub in" data-e="b2" style="top:23.2em">${T.reply}</div>
    <div class="pu-bub out" data-e="b3" style="top:28.6em">${T.reply2}</div>
    <div style="position:absolute;left:1em;right:1em;bottom:2.2em;height:3em;border-radius:99em;background:#fff;border:1px solid #e6e8e3;display:flex;align-items:center;padding:0 1.1em;font:500 .85em/1 Inter;color:#9aa39f">${T.sms}</div>
  </div>
  <div class="pu-scr pu-app" data-s="cal">
    <div class="pu-top"><h4>${T.book}</h4></div>
    <div class="pu-card" style="top:6.4em;height:auto;padding:1em">
      <div style="font:600 .8em/1 Inter;color:#5f6b66;margin-bottom:.8em">${T.pickDay}</div>
      <div class="pu-cal">${T.days.map((d, i) => `<div data-e="d${i}">${d[0]}<b>${d[1]}</b></div>`).join('')}</div>
    </div>
    <div class="pu-card" style="top:14.2em;height:17.6em">
      <div style="position:absolute;left:1em;top:1em;font:600 .8em/1 Inter;color:#5f6b66">${T.slotsT}</div>
      ${T.slots.map((t, i) => `<div class="pu-slot" data-e="s${i}" style="top:${2.6 + i * 3.5}em">${t}</div>`).join('')}
    </div>
    <div class="pu-ok" data-e="ok" style="top:33.6em">${ICON.ok}${T.confirmed}</div>
    <div class="pu-auto" data-e="rem" style="top:38.2em;left:0;right:0;justify-content:center">${ICON.bolt}${T.reminder}</div>
  </div>
  <div class="pu-scr pu-app" data-s="pipe">
    <div class="pu-top"><h4>${T.pipe}</h4><span class="chip">${T.sales}</span></div>
    <div data-e="track" style="position:absolute;left:0;top:0;bottom:0;width:36em">
      ${T.cols.map((h, i) => `<div class="pu-col" style="left:${1 + i * 11.2}em"><h5>${h}</h5></div>`).join('')}
      <div class="pu-k" style="left:1.6em;width:9.2em;top:12.6em">${T.k1[0]}<small>${T.k1[1]}</small></div>
      <div class="pu-k" style="left:12.8em;width:9.2em;top:8.2em">${T.k2[0]}<small>${T.k2[1]}</small></div>
      <div class="pu-k" style="left:24em;width:9.2em;top:8.2em">${T.k3[0]}<small>${T.k3[1]}</small></div>
      <div class="pu-k hot" data-e="kc" style="left:1.6em;width:9.2em;top:8.2em">${T.who}<small></small></div>
    </div>
    <div class="pu-ok" data-e="task" style="top:37em;font-size:.82em">${ICON.ok}${T.task}</div>
  </div>
  <div class="pu-scr pu-app" data-s="day">
    <div class="pu-card" data-e="mj" style="top:4.6em;bottom:2.4em;padding:1.4em 1.2em">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><div style="font:600 .85em/1 Inter;color:#5f6b66">${T.hello}</div><div style="font:700 1.9em/1.1 Montserrat,sans-serif;letter-spacing:-.03em;margin-top:.2em">${T.myDay}</div></div>
        <div style="width:3em;height:3em;border-radius:.9em;background:#e3efe9;color:#0f4b3a;display:grid;place-items:center">${ICON.sun}</div>
      </div>
      ${['list', 'cal', 'doc', 'user'].map((ic, i) => `<div class="pu-it" data-e="i${i}" style="top:${7.4 + i * 4.4}em"><div class="pu-ic">${ICON[ic]}</div>${T.items[i]}<span class="ck" data-e="c${i}">${ICON.check}</span></div>`).join('')}
      <div style="position:absolute;left:0;right:0;bottom:1.3em;text-align:center;font:600 .78em/1 Inter;color:#1c7a5c">${T.summary}</div>
    </div>
  </div>
  <div class="pu-status" data-e="status"><span>9:41</span><span class="ic"><i style="width:1.05em;height:.62em"></i><i style="width:1.5em;height:.7em;border-radius:.22em"></i></span></div>
  <div class="pu-island"></div><div class="pu-home" data-e="home"></div><div class="pu-glare"></div>`;

  const S = {}; root.querySelectorAll('[data-s]').forEach(n => S[n.dataset.s] = n);
  const E = {}; root.querySelectorAll('[data-e]').forEach(n => E[n.dataset.e] = n);
  const b1t = root.querySelector('[data-t="b1t"]');
  const kcSub = E.kc.querySelector('small');
  const ORDER = ['lock', 'lead', 'sms', 'cal', 'pipe', 'day'];
  const W = { lock: [0, .14], lead: [.14, .31], sms: [.31, .5], cal: [.5, .68], pipe: [.68, .85], day: [.85, 1.01] };
  const TR = .024;
  const st = (el, o, tf) => { if (o != null) el.style.opacity = R(o); if (tf != null) el.style.transform = tf; };
  const loc = (q, k) => seg(q, W[k][0], W[k][1]);
  let lastQ = -1;
  function render(q) {
    q = cl(q, 0, 1);
    if (Math.abs(q - lastQ) < 1e-5) return; lastQ = q;
    ORDER.forEach((k, i) => {
      const [a, b] = W[k]; const el = S[k];
      const enter = i === 0 ? 1 : eio(seg(q, a - TR, a + TR));
      const leave = i === ORDER.length - 1 ? 0 : eio(seg(q, b - TR, b + TR));
      const vis = enter > 0 && leave < 1;
      el.style.visibility = vis ? 'visible' : 'hidden';
      if (!vis) return;
      el.style.transform = `translate3d(${R((1 - enter) * 100 - leave * 28)}%,0,0)`;
      el.style.zIndex = i;
      el.style.filter = leave > 0 ? `brightness(${R(1 - .25 * leave)})` : '';
    });
    const dark = q < W.lock[1];
    E.status.style.color = dark ? '#fff' : '#161a18';
    E.home.style.background = dark ? 'rgba(255,255,255,.8)' : 'rgba(0,0,0,.75)';
    let u = loc(q, 'lock');
    { const k1 = back(seg(u, .12, .45)); st(E.n1, seg(u, .12, .3), `translateY(${R((1 - k1) * -2.5)}em) scale(${R(.92 + .08 * k1)})`);
      const k2 = back(seg(u, .5, .82)); st(E.n2, seg(u, .5, .68), `translateY(${R((1 - k2) * -2.5)}em) scale(${R(.92 + .08 * k2)})`); }
    u = loc(q, 'lead');
    { const k = eo(seg(u, .05, .3)); st(E.lc, seg(u, 0, .2), `translateY(${R((1 - k) * 2)}em)`);
      for (let i = 0; i < 4; i++) { const t = .25 + i * .13; const kr = eo(seg(u, t, t + .18)); st(E['r' + i], seg(u, t, t + .12), `translateX(${R((1 - kr) * -1.6)}em)`);
        const tg = E['r' + i].querySelector('.tag'); const kt = back(seg(u, t + .1, t + .25)); tg.style.opacity = R(seg(u, t + .1, t + .16)); tg.style.transform = `scale(${R(.6 + .4 * kt)})`; }
      st(E.all, seg(u, .85, .95)); }
    u = loc(q, 'sms');
    { const kb = eo(seg(u, .06, .2)); st(E.b1, seg(u, .04, .14), `translateY(${R((1 - kb) * 1.2)}em) scale(${R(.96 + .04 * kb)})`);
      b1t.textContent = T.msg.slice(0, Math.max(1, Math.round(T.msg.length * seg(u, .1, .55))));
      st(E.a1, seg(u, .56, .64)); const k2 = eo(seg(u, .66, .8)); st(E.b2, seg(u, .66, .74), `translateY(${R((1 - k2) * 1.2)}em)`);
      const k3 = eo(seg(u, .82, .95)); st(E.b3, seg(u, .82, .9), `translateY(${R((1 - k3) * 1.2)}em)`); }
    u = loc(q, 'cal');
    { const dsel = seg(u, .15, .25);
      for (let i = 0; i < 5; i++) { const on = i === 2 && dsel > .5; const d = E['d' + i]; d.style.background = on ? '#0f4b3a' : '#f3f6f4'; d.style.color = on ? '#cfe5da' : '#5f6b66'; d.querySelector('b').style.color = on ? '#fff' : '#161a18'; }
      for (let i = 0; i < 4; i++) { const t = .25 + i * .06; const ks = eo(seg(u, t, t + .14)); st(E['s' + i], seg(u, t, t + .08), `translateY(${R((1 - ks) * .8)}em)`); }
      const ss = seg(u, .55, .65) > .5; const s1 = E.s1; s1.style.borderColor = ss ? '#0f4b3a' : '#e6e8e3'; s1.style.background = ss ? '#e3efe9' : '#fff'; s1.style.color = ss ? '#0f4b3a' : '#161a18';
      const ko = back(seg(u, .66, .82)); st(E.ok, seg(u, .66, .72), `translateX(-50%) scale(${R(.7 + .3 * ko)})`);
      st(E.rem, seg(u, .82, .92)); }
    u = loc(q, 'pipe');
    { const m1 = eio(seg(u, .15, .35)), m2 = eio(seg(u, .45, .65)); const pan = eio(seg(u, .4, .62));
      E.track.style.transform = `translate3d(${R(-pan * 11.6)}em,0,0)`;
      const lift = Math.sin(Math.PI * seg(u, .15, .35)) + Math.sin(Math.PI * seg(u, .45, .65));
      E.kc.style.transform = `translate3d(${R((m1 + m2) * 11.2)}em,${R(-lift * .5)}em,0) rotate(${R(lift * 2.2)}deg)`;
      kcSub.textContent = T.kSub[m2 > .5 ? 2 : m1 > .5 ? 1 : 0];
      const kt = back(seg(u, .72, .88)); st(E.task, seg(u, .72, .8), `translateX(-50%) scale(${R(.7 + .3 * kt)})`); }
    u = loc(q, 'day');
    { const km = eo(seg(u, 0, .2)); st(E.mj, null, `translateY(${R((1 - km) * 2)}em)`);
      for (let i = 0; i < 4; i++) { const t = .1 + i * .12; const ki = eo(seg(u, t, t + .12)); st(E['i' + i], seg(u, t, t + .07), `translateX(${R((1 - ki) * -1.4)}em)`);
        const c = E['c' + i]; const on = seg(u, t + .14, t + .2) > .5; c.style.background = on ? '#1c7a5c' : 'transparent'; c.style.borderColor = on ? '#1c7a5c' : '#b9cdc4'; c.querySelector('svg').style.opacity = on ? 1 : 0; } }
  }
  const step = q => q < W.lead[1] ? 0 : q < W.sms[1] ? 1 : q < W.cal[1] ? 2 : q < W.pipe[1] ? 3 : 4;
  return { render, step };
}
