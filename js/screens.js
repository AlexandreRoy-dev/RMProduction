/* Écrans animés des appareils (portable, tablette, carnet IA, écran externe).
   Même principe que le téléphone : du HTML posé sur l'écran 3D par homographie (ou dans une maquette en version simple).
   render(t) : t en secondes, chaque écran boucle sur son propre cycle. Mouvement continu, sans à-coups. */
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => cl((t - a) / (b - a));
const ss = t => t * t * t * (t * (t * 6 - 15) + 10);                 // smootherstep
const eo = t => 1 - Math.pow(1 - t, 3);
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const R = v => Math.round(v * 100) / 100;
const NB = '\u202F', NS = '\u00A0';
const lerp = (a, b, k) => a + (b - a) * k;

const ICO = {
  check: '<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7z"/></svg>',
  mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  doc: '<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
  box: '<svg viewBox="0 0 24 24"><path d="m3.5 7.5 8.5-4 8.5 4v9l-8.5 4-8.5-4z"/><path d="m3.5 7.5 8.5 4 8.5-4M12 11.5v9"/></svg>'
};
const CURSOR = '<svg viewBox="0 0 28 28"><path d="M5 3.5v19.2l5.2-4.6 3.3 7.4 3.4-1.5-3.2-7.2 7-.4z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';

const fmtN = (n, lang) => Math.round(n).toLocaleString(lang === 'en' ? 'en-CA' : 'fr-CA').replace(/\s/g, NS);
const money = (n, lang) => lang === 'en' ? '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  : n.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\s/g, NS) + NS + '$';
const typed = (s, k) => s.slice(0, Math.round(s.length * cl(k)));
const caret = (t, on) => on ? `<i class="sx-caret" style="opacity:${Math.sin(t * 9) > -.2 ? 1 : 0}"></i>` : '';

function el(root, sel) { return root.querySelector(sel); }
function els(root, sel) { return [...root.querySelectorAll(sel)]; }
function put(e, { x = 0, y = 0, s = 1, o = 1, r = 0, extra = '' } = {}) {
  e.style.transform = `translate3d(${R(x)}px,${R(y)}px,0) scale(${R(s * 1000) / 1000})${r ? ` rotate(${R(r)}deg)` : ''}${extra}`;
  e.style.opacity = R(cl(o) * 1000) / 1000;
}
// trajectoire du curseur : images clés [t, x, y], mouvement adouci avec une légère courbe
function pathAt(keys, t) {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, x0, y0] = keys[i], [t1, x1, y1] = keys[i + 1];
    if (t <= t1) {
      const k = ss(seg(t, t0, t1)), dx = x1 - x0, dy = y1 - y0, bow = Math.sin(Math.PI * k) * .12;
      return [x0 + dx * k - dy * bow, y0 + dy * k + dx * bow];
    }
  }
  const l = keys[keys.length - 1]; return [l[1], l[2]];
}
function clickRing(ring, t, clicks) {
  let v = 0; for (const c of clicks) { const k = seg(t, c, c + .5); if (k > 0 && k < 1) v = k; }
  ring.style.opacity = v ? R(1 - v) : 0; ring.style.transform = `translate(-50%,-50%) scale(${R(.3 + v * 1.2)})`;
}

/* =========================================================================================
   1. PORTABLE : application sur mesure (tableau de bord, formulaire, tableau, notification)
   ========================================================================================= */
const LAP = {
  fr: { app: 'Votre app', nav: ['Tableau de bord', 'Projets', 'Clients', 'Soumissions', 'Rapports'], hello: 'Bonjour', titleD: 'Tableau de bord', titleP: 'Projets', newP: 'Nouveau projet',
    kpi: [['Projets actifs', 12], ['Soumissions envoyées', 8], ['Tâches de la semaine', 24]], act: 'Activité', bars: 'Soumissions par semaine', today: "Aujourd'hui",
    todo: [['Visite de chantier', 'En cours'], ['Commande de matériaux', 'Planifié'], ['Envoi de la soumission', 'Automatique']],
    modal: 'Nouveau projet', fields: [['Nom du projet', 'Rénovation de cuisine'], ['Client', 'Client potentiel'], ['Échéance', '15 novembre'], ['Responsable', 'Équipe terrain']],
    cancel: 'Annuler', create: 'Créer le projet', cols: ['Projet', 'Client', 'Échéance', 'Statut'],
    rows: [['Agrandissement', 'Client existant', '3 novembre', 'En cours'], ['Toiture', 'Client existant', '8 novembre', 'Planifié'], ['Salle de bain', 'Nouveau client', '20 novembre', 'Soumission'], ['Terrasse', 'Client existant', '27 novembre', 'Planifié']],
    st: { 'En cours': 'g', 'Planifié': 'y', 'Soumission': 'b', 'Nouveau': 'n' }, newSt: 'Nouveau', toast: 'Soumission envoyée', toastSub: 'Automatiquement au client', days: ['L', 'M', 'M', 'J', 'V', 'S', 'D'] },
  en: { app: 'Your app', nav: ['Dashboard', 'Projects', 'Clients', 'Quotes', 'Reports'], hello: 'Good morning', titleD: 'Dashboard', titleP: 'Projects', newP: 'New project',
    kpi: [['Active projects', 12], ['Quotes sent', 8], ['Tasks this week', 24]], act: 'Activity', bars: 'Quotes per week', today: 'Today',
    todo: [['Site visit', 'In progress'], ['Materials order', 'Scheduled'], ['Quote delivery', 'Automatic']],
    modal: 'New project', fields: [['Project name', 'Kitchen renovation'], ['Client', 'Prospective client'], ['Due date', 'November 15'], ['Owner', 'Field team']],
    cancel: 'Cancel', create: 'Create project', cols: ['Project', 'Client', 'Due', 'Status'],
    rows: [['Extension', 'Existing client', 'November 3', 'In progress'], ['Roofing', 'Existing client', 'November 8', 'Scheduled'], ['Bathroom', 'New client', 'November 20', 'Quote'], ['Deck', 'Existing client', 'November 27', 'Scheduled']],
    st: { 'In progress': 'g', 'Scheduled': 'y', 'Quote': 'b', 'New': 'n' }, newSt: 'New', toast: 'Quote sent', toastSub: 'Automatically to the client', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'] }
};
export function buildLaptop(root, lang = 'fr') {
  const T = LAP[lang] || LAP.fr, W = 1280, H = 800, CY = 16;
  const pill = s => `<span class="sx-st sx-st--${T.st[s] || 'n'}">${s}</span>`;
  root.innerHTML = `<div class="sx sx-lap" style="width:${W}px;height:${H}px">
    <aside class="sx-side"><div class="sx-logo"><i></i>${T.app}</div><div class="sx-nav"><b class="sx-hl"></b>${T.nav.map(n => `<div>${n}</div>`).join('')}</div><div class="sx-side-ft"><i></i><i></i><i></i></div></aside>
    <main class="sx-main">
      <header class="sx-hd"><div><small>${T.hello}</small><h3 class="ttl">${T.titleD}</h3></div><div class="sx-btn">${ICO.plus}${T.newP}</div></header>
      <section class="sx-view v-dash">
        <div class="sx-kpis">${T.kpi.map(([l]) => `<div class="sx-kpi"><small>${l}</small><b>0</b><span class="dl">+1</span><svg class="sp" viewBox="0 0 120 30"><path pathLength="1" d="M0 24 C20 22 30 12 50 15 S80 6 120 4"/></svg></div>`).join('')}</div>
        <div class="sx-g2">
          <div class="sx-card ch"><h4>${T.act}</h4><svg viewBox="0 0 640 230" preserveAspectRatio="none"><defs><linearGradient id="lg-${lang}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c7a5c" stop-opacity=".22"/><stop offset="1" stop-color="#1c7a5c" stop-opacity="0"/></linearGradient></defs>
            <g class="gl">${[50, 100, 150, 200].map(y => `<line x1="0" x2="640" y1="${y}" y2="${y}"/>`).join('')}</g>
            <path class="ar" fill="url(#lg-${lang})" d="M0 190 C40 180 70 150 100 155 S160 120 200 128 S270 90 310 100 S380 70 420 82 S490 50 530 60 L560 52 L560 230 L0 230Z"/>
            <path class="ln" pathLength="1" d="M0 190 C40 180 70 150 100 155 S160 120 200 128 S270 90 310 100 S380 70 420 82 S490 50 530 60 S600 30 640 26"/>
            <circle class="dt" r="7" cx="640" cy="26"/></svg></div>
          <div class="sx-card br"><h4>${T.bars}</h4><div class="bars">${[46, 62, 52, 74, 58, 80, 0].map((h, i) => `<div><u data-h="${h}"></u><small>${T.days[i]}</small></div>`).join('')}</div></div>
        </div>
        <div class="sx-card td"><h4>${T.today}</h4>${T.todo.map(([a, b]) => `<div class="tr"><i></i>${a}<span>${b}</span></div>`).join('')}</div>
      </section>
      <section class="sx-view v-tab"><div class="sx-card tb"><div class="th">${T.cols.map(c => `<span>${c}</span>`).join('')}</div>
        <div class="trw nw"><span><i class="ic"></i>${T.fields[0][1]}</span><span>${T.fields[1][1]}</span><span>${T.fields[2][1]}</span><span>${pill(T.newSt)}</span></div>
        ${T.rows.map(r => `<div class="trw"><span><i class="ic"></i>${r[0]}</span><span>${r[1]}</span><span>${r[2]}</span><span>${pill(r[3])}</span></div>`).join('')}</div></section>
    </main>
    <div class="sx-dim"></div>
    <div class="sx-modal"><h4>${T.modal}</h4>${T.fields.map(([l]) => `<label><small>${l}</small><div class="fv"></div></label>`).join('')}<div class="mb"><span>${T.cancel}</span><b>${T.create}</b></div></div>
    <div class="sx-toast"><i>${ICO.check}</i><div><b>${T.toast}</b><small>${T.toastSub}</small></div></div>
    <div class="sx-cur"><i class="ring"></i>${CURSOR}</div>
    <div class="sx-glare"></div></div>`;
  const q = s => el(root, s), qa = s => els(root, s);
  const hl = q('.sx-hl'), ttl = q('.ttl'), dash = q('.v-dash'), tab = q('.v-tab'), dim = q('.sx-dim'), modal = q('.sx-modal'), toast = q('.sx-toast'), cur = q('.sx-cur'), ring = q('.ring');
  const kpiB = qa('.sx-kpi b'), kpiD = qa('.sx-kpi .dl'), kpiS = qa('.sx-kpi .sp path'), line = q('.ch .ln'), area = q('.ch .ar'), dot = q('.ch .dt'), bars = qa('.bars u'), tds = qa('.td .tr');
  const fv = qa('.sx-modal .fv'), btnCreate = q('.sx-modal .mb b'), btnNew = q('.sx-btn'), rows = qa('.trw'), newRow = q('.trw.nw');
  const keys = [[0, 980, 640], [1.6, 980, 640], [2.9, 1148, 54], [3.4, 1148, 54], [4.0, 760, 268], [6.6, 790, 520], [7.15, 884, 603], [7.6, 884, 603], [8.6, 720, 300], [10.2, 720, 300], [10.9, 118, 132], [11.3, 118, 132], [12.3, 980, 520], [15.4, 980, 640], [16, 980, 640]];
  function render(time) {
    const t = ((time % CY) + CY) % CY;
    // vues : tableau de bord / tableau des projets
    const toTab = ss(seg(t, 7.35, 8.05)), toDash = ss(seg(t, 11.05, 11.85));
    const onTab = toTab * (1 - toDash), loopIn = ss(seg(t, 0, .45)) * (1 - ss(seg(t, 15.25, 15.95)));
    put(dash, { o: (1 - toTab + toDash * (t > 11 ? 1 : 0)) * (t > 11 ? 1 : 1) * (t < 7.35 || t > 11 ? 1 : 1 - toTab), x: t > 11 ? (1 - toDash) * 380 : 0, s: t < 11 ? 1 - toTab * .03 : 1 });
    dash.style.opacity = R((t < 11 ? 1 - toTab : toDash) * (t < 11 ? 1 : 1));
    put(tab, { o: onTab, x: t > 11 ? -toDash * 380 : 0, s: t < 11 ? .97 + toTab * .03 : 1 });
    dash.querySelectorAll('.sx-kpis,.sx-g2,.td').forEach(e => { e.style.opacity = R(loopIn); });
    const navI = onTab;
    hl.style.transform = `translateY(${R(navI * 46)}px)`;
    ttl.textContent = onTab > .5 ? T.titleP : T.titleD;
    // indicateurs : comptage à l'arrivée, puis +1 après la création du projet
    const kc = eo(seg(t, .2, 1.5)), bump = ss(seg(t, 12.0, 12.6));
    T.kpi.forEach(([, v], i) => { kpiB[i].textContent = fmtN(v * kc + (i === 0 ? bump : 0), lang); kpiS[i].style.strokeDashoffset = R(1 - eo(seg(t, .3 + i * .15, 1.6 + i * .15))); });
    put(kpiD[0], { o: bump * (1 - seg(t, 14.6, 15.2)), y: (1 - bump) * 8 });
    // courbe : tracé initial puis prolongement
    const lk = eio(seg(t, .3, 2.0)) * .86 + ss(seg(t, 12.1, 13.0)) * .14;
    line.style.strokeDashoffset = R(1 - lk); area.style.opacity = R(eo(seg(t, .9, 2.0)) * .9 + ss(seg(t, 12.1, 13.0)) * .1);
    dot.style.opacity = R(ss(seg(t, 12.8, 13.1))); dot.setAttribute('r', R(7 + 3 * Math.sin(t * 4) * ss(seg(t, 12.8, 13.1))));
    bars.forEach((b, i) => { const h = +b.dataset.h || 66; const k = i === 6 ? ss(seg(t, 12.2, 13.0)) : eo(seg(t, .4 + i * .1, 1.3 + i * .1)); b.style.height = R(h * k) + '%'; });
    tds.forEach((r, i) => put(r, { o: eo(seg(t, 1.0 + i * .15, 1.6 + i * .15)), y: (1 - eo(seg(t, 1.0 + i * .15, 1.6 + i * .15))) * 10 }));
    // fenêtre « Nouveau projet » : glisse du bas, puis se replie vers la ligne du tableau
    const mIn = eo(seg(t, 3.05, 3.65)), mOut = ss(seg(t, 7.3, 7.95));
    put(modal, { o: mIn * (1 - mOut), y: (1 - mIn) * 120 - mOut * 150, s: 1 - mOut * .35 });
    dim.style.opacity = R(.38 * mIn * (1 - mOut));
    T.fields.forEach(([, v], i) => { const a = 3.8 + i * .78, k = seg(t, a, a + .62); fv[i].innerHTML = typed(v, k) + caret(t, k > 0 && k < 1); fv[i].parentNode.classList.toggle('on', k > 0 && t < 7.3); });
    btnCreate.classList.toggle('pr', t > 7.12 && t < 7.4); btnNew.classList.toggle('pr', t > 2.95 && t < 3.25);
    // nouvelle ligne insérée en tête
    const ins = ss(seg(t, 8.15, 8.85));
    rows.forEach((r, i) => { if (r === newRow) return; r.style.transform = `translateY(${R(ins * 58)}px)`; });
    put(newRow, { o: ins, x: (1 - ins) * -30 }); newRow.style.background = `rgba(28,122,92,${R(.12 * (1 - seg(t, 9.6, 11.0)) * ins)})`;
    // notification
    const tin = eo(seg(t, 12.45, 13.05)), tout = ss(seg(t, 14.4, 15.0));
    put(toast, { o: tin * (1 - tout), x: (1 - tin) * 380 + tout * 40 });
    // curseur
    const [cx, cy] = pathAt(keys, t); cur.style.transform = `translate(${R(cx)}px,${R(cy)}px)`;
    cur.style.opacity = R(ss(seg(t, .8, 1.4)) * (1 - ss(seg(t, 15.2, 15.8))));
    clickRing(ring, t, [2.98, 7.18, 11.0]);
  }
  render(5.5);
  return { render, W, H, cycle: CY };
}

/* =========================================================================================
   2. TABLETTE : ERP et CRM (pipeline, facture, inventaire, fiche client)
   ========================================================================================= */
const TAB = {
  fr: { app: 'CRM', nav: ['Pipeline', 'Contacts', 'Factures', 'Inventaire', 'Rapports'], sub: 'Ventes et opérations', titles: ['Pipeline', 'Facture', 'Inventaire', 'Fiche client'], chip: 'Synchronisé',
    cols: ['Nouveau', 'Contacté', 'Soumission', 'Gagné'], who: 'Client potentiel', src: 'Formulaire web', won: 'Gagné',
    cards: [[['Demande de prix', 'Messenger'], ['Appel entrant', 'Téléphone']], [['Suivi par texto', 'Automatique'], ['Rappel planifié', 'Demain']], [['Soumission envoyée', 'Courriel'], ['Relance prévue', 'Automatique']], [['Projet confirmé', 'Facture créée']]],
    inv: 'Facture', invNo: 'F-1042', date: '2 octobre', billed: `Facturé à${NS}:`, email: 'client@courriel.ca', lines: [['Configuration du CRM', 2400], ['Automatisations de suivi', 1650], ['Formation de l\u2019équipe', 800]],
    total: 'Total', sent: 'Envoyée', auto: 'Créée automatiquement depuis le pipeline', stockH: ['Article', 'Code', 'En stock', ''], items: [['Panneaux de bois', 'PB-210', 48, 44], ['Vis inox 50 mm', 'VI-050', 120, 112], ['Peinture extérieure', 'PE-004', 36, 36], ['Membrane de toiture', 'MT-118', 15, 9], ['Quincaillerie', 'QC-330', 64, 64]],
    restock: 'Réapprovisionner', toast: 'Bon de commande créé', toastSub: 'Automatiquement chez le fournisseur', tags: ['Site web', 'Gagné'],
    tl: [['Formulaire web reçu', 'lundi 9 h 12'], ['Texto de suivi envoyé', 'lundi 9 h 13'], ['Soumission acceptée', 'mercredi 14 h 40'], ['Facture envoyée', 'mercredi 14 h 41'], ['Paiement reçu', 'jeudi 10 h 05']] },
  en: { app: 'CRM', nav: ['Pipeline', 'Contacts', 'Invoices', 'Inventory', 'Reports'], sub: 'Sales and operations', titles: ['Pipeline', 'Invoice', 'Inventory', 'Client record'], chip: 'Synced',
    cols: ['New', 'Contacted', 'Quote', 'Won'], who: 'Prospective client', src: 'Web form', won: 'Won',
    cards: [[['Price request', 'Messenger'], ['Incoming call', 'Phone']], [['Text follow-up', 'Automatic'], ['Callback booked', 'Tomorrow']], [['Quote sent', 'Email'], ['Reminder set', 'Automatic']], [['Project confirmed', 'Invoice created']]],
    inv: 'Invoice', invNo: 'F-1042', date: 'October 2', billed: 'Billed to:', email: 'client@courriel.ca', lines: [['CRM setup', 2400], ['Follow-up automations', 1650], ['Team training', 800]],
    total: 'Total', sent: 'Sent', auto: 'Created automatically from the pipeline', stockH: ['Item', 'Code', 'In stock', ''], items: [['Wood panels', 'PB-210', 48, 44], ['Stainless screws 50 mm', 'VI-050', 120, 112], ['Exterior paint', 'PE-004', 36, 36], ['Roofing membrane', 'MT-118', 15, 9], ['Hardware', 'QC-330', 64, 64]],
    restock: 'Reorder', toast: 'Purchase order created', toastSub: 'Sent to the supplier automatically', tags: ['Website', 'Won'],
    tl: [['Web form received', 'Monday 9:12 AM'], ['Follow-up text sent', 'Monday 9:13 AM'], ['Quote accepted', 'Wednesday 2:40 PM'], ['Invoice sent', 'Wednesday 2:41 PM'], ['Payment received', 'Thursday 10:05 AM']] }
};
export function buildTablet(root, lang = 'fr') {
  const T = TAB[lang] || TAB.fr, W = 1000, H = 698, CY = 16, CW = 178, CG = 12, SL = 72;
  root.innerHTML = `<div class="sx sx-tab" style="width:${W}px;height:${H}px">
    <aside class="sx-side sm"><div class="sx-logo"><i></i>${T.app}</div><div class="sx-nav"><b class="sx-hl"></b>${T.nav.map(n => `<div>${n}</div>`).join('')}</div></aside>
    <main class="sx-main">
      <header class="sx-hd"><div><small>${T.sub}</small><h3 class="ttl">${T.titles[0]}</h3></div><span class="sx-chip"><i></i>${T.chip}</span></header>
      <div class="sx-persp">
        <section class="sx-view v-pipe">${T.cols.map((c, i) => `<div class="col" style="left:${i * (CW + CG)}px;width:${CW}px"><h5>${c}<b>0</b></h5></div>`).join('')}
          ${T.cards.map((cs, i) => cs.map(([a, b], j) => `<div class="kc" data-c="${i}" data-j="${j}" style="left:${i * (CW + CG) + 8}px;width:${CW - 16}px">${a}<small>${b}</small></div>`).join('')).join('')}
          <div class="kc mv" style="width:${CW - 16}px"><span class="av">CP</span>${T.who}<small>${T.src}</small><em>${T.won}</em></div></section>
        <section class="sx-view v-inv"><div class="doc"><div class="dh"><div><small>${T.inv.toUpperCase()}</small><b>${T.invNo}</b></div><div class="lg"><i></i>Roy Marketing</div></div>
          <div class="bt"><small>${T.billed}</small><b>${T.who}</b><span>${T.email}</span><span class="dd">${T.date}</span></div>
          ${T.lines.map(([a, v]) => `<div class="ln"><span>${a}</span><b>${money(v, lang)}</b></div>`).join('')}
          <div class="tt"><span>${T.total}</span><b class="tv"></b></div><div class="stamp">${T.sent}</div><p class="au">${ICO.spark}${T.auto}</p></div></section>
      </div>
      <section class="sx-view v-stk"><div class="sx-card stb"><div class="th">${T.stockH.map(h => `<span>${h}</span>`).join('')}</div>
        ${T.items.map(([a, c]) => `<div class="trw"><span><i class="ic">${ICO.box}</i>${a}</span><span class="cd">${c}</span><span class="qt"><b></b><u><i></i></u></span><span><em>${T.restock}</em></span></div>`).join('')}</div></section>
      <section class="sx-view v-cli"><div class="sx-card cc"><span class="av">CP</span><div><b>${T.who}</b><span>${T.email}</span></div><div class="tg">${T.tags.map(g => `<span>${g}</span>`).join('')}</div></div>
        <div class="sx-card tlc"><i class="rail"><u></u></i>${T.tl.map(([a, b]) => `<div class="ti"><i></i><b>${a}</b><small>${b}</small></div>`).join('')}</div></section>
    </main>
    <div class="sx-toast"><i>${ICO.check}</i><div><b>${T.toast}</b><small>${T.toastSub}</small></div></div>
    <div class="sx-glare"></div></div>`;
  const q = s => el(root, s), qa = s => els(root, s);
  const hl = q('.sx-hl'), ttl = q('.ttl'), pipe = q('.v-pipe'), inv = q('.v-inv'), stk = q('.v-stk'), cli = q('.v-cli'), toast = q('.sx-toast');
  const mv = q('.kc.mv'), cnt = qa('.col h5 b'), kcs = qa('.kc:not(.mv)'), lines = qa('.v-inv .ln'), tv = q('.v-inv .tv'), stamp = q('.stamp'), au = q('.v-inv .au');
  const qts = qa('.v-stk .qt'), restk = qa('.v-stk em'), srows = qa('.v-stk .trw'), cc = q('.cc'), tis = qa('.ti'), rail = q('.rail u');
  const cx = (c) => c * (CW + CG) + 8, cy = (j) => 44 + j * SL;
  function render(time) {
    const t = ((time % CY) + CY) % CY;
    // pipeline : la carte est prise, glissée sur deux étapes, puis déposée
    const d1 = ss(seg(t, 1.0, 2.4)), d2 = ss(seg(t, 3.0, 4.0));
    const lift = Math.max(seg(t, .75, 1.0) * (1 - seg(t, 2.4, 2.65)), seg(t, 2.8, 3.0) * (1 - seg(t, 4.0, 4.25)));
    let x = cx(0), y = cy(0);
    if (t >= 1.0 && t < 3.0) { x = lerp(cx(0), cx(2), d1); y = lerp(cy(0), cy(2), d1) - Math.sin(Math.PI * d1) * 34; }
    if (t >= 3.0) { x = lerp(cx(2), cx(3), d2); y = lerp(cy(2), cy(1), d2) - Math.sin(Math.PI * d2) * 26; }
    mv.style.left = R(x) + 'px'; mv.style.top = R(y) + 'px';
    mv.style.transform = `scale(${R(1 + lift * .05)}) rotate(${R(lift * -1.6)}deg)`; mv.style.boxShadow = `0 ${R(4 + lift * 22)}px ${R(10 + lift * 34)}px rgba(15,60,45,${R(.08 + lift * .16)})`;
    mv.classList.toggle('won', t > 4.1);
    const wonK = ss(seg(t, 4.1, 4.4)); mv.querySelector('em').style.opacity = R(wonK);
    kcs.forEach(k => { const c = +k.dataset.c, j = +k.dataset.j; let jj = j + (c === 0 ? 1 : 0); if (c === 0) jj -= ss(seg(t, 1.2, 1.9)); k.style.top = R(cy(jj)) + 'px'; });
    const n = [3 - (t > 1.5 ? 1 : 0), 2, 2 + (t > 2.2 && t < 3.3 ? 1 : 0), 1 + (t > 3.8 ? 1 : 0)];
    cnt.forEach((b, i) => { b.textContent = n[i]; });
    // retournement vers la facture (3D)
    const f1 = ss(seg(t, 4.6, 5.0)), f2 = ss(seg(t, 5.0, 5.45)), loopIn = ss(seg(t, 15.3, 16));
    const pipeVis = t < 5 ? 1 : loopIn;
    pipe.style.transform = t < 5 ? `rotateY(${R(-f1 * 90)}deg)` : 'none'; pipe.style.opacity = R(t < 5 ? 1 - f1 * .3 : loopIn);
    if (t >= 15.3) { mv.style.left = cx(0) + 'px'; mv.style.top = cy(0) + 'px'; mv.style.transform = 'none'; mv.classList.remove('won'); }
    pipe.style.visibility = pipeVis > 0.001 && (t < 5 || t >= 15.3) ? 'visible' : 'hidden';
    const sl = ss(seg(t, 8.6, 9.3));
    inv.style.visibility = t >= 5 && t < 9.3 ? 'visible' : 'hidden';
    inv.style.transform = `rotateY(${R((1 - f2) * 90)}deg) translateX(${R(-sl * 820)}px)`; inv.style.opacity = R(1 - sl * .4);
    lines.forEach((l, i) => put(l, { o: eo(seg(t, 5.7 + i * .3, 6.2 + i * .3)), x: (1 - eo(seg(t, 5.7 + i * .3, 6.2 + i * .3))) * 24 }));
    tv.textContent = money(4850 * eo(seg(t, 6.7, 7.6)), lang);
    const sk = seg(t, 7.7, 8.05); put(stamp, { o: ss(sk), s: 1.35 - .35 * eo(sk), r: -8 });
    au.style.opacity = R(ss(seg(t, 8.0, 8.4)));
    // inventaire : glisse depuis la droite, les quantités diminuent après la commande
    stk.style.visibility = t >= 8.6 && t < 13.1 ? 'visible' : 'hidden';
    const zo = ss(seg(t, 12.4, 13.1));
    put(stk, { x: (1 - sl) * 820, o: 1 - zo, s: 1 - zo * .05 });
    const dk = ss(seg(t, 10.2, 11.3));
    T.items.forEach(([, , a, b], i) => { const v = lerp(a, b, dk); qts[i].querySelector('b').textContent = fmtN(v, lang); qts[i].querySelector('i').style.width = R(cl(v / 130) * 100) + '%';
      srows[i].style.background = a !== b ? `rgba(28,122,92,${R(.08 * Math.sin(Math.PI * dk))})` : 'transparent'; });
    restk[3].style.opacity = R(ss(seg(t, 11.3, 11.6))); restk[3].style.transform = `scale(${R(.85 + .15 * eo(seg(t, 11.3, 11.6)))})`;
    const tin = eo(seg(t, 10.0, 10.5)), tout = ss(seg(t, 11.9, 12.4));
    put(toast, { o: tin * (1 - tout), y: (1 - tin) * -60 });
    // fiche client : s'ouvre par un zoom, la chronologie se déroule
    cli.style.visibility = t >= 12.4 ? 'visible' : 'hidden';
    put(cli, { o: zo * (1 - loopIn), s: .82 + .18 * eo(seg(t, 12.4, 13.1)) });
    tis.forEach((e, i) => { const k = eo(seg(t, 13.4 + i * .38, 13.9 + i * .38)); put(e, { o: k, x: (1 - k) * 18 }); });
    rail.style.height = R(ss(seg(t, 13.4, 15.3)) * 100) + '%';
    put(cc, { o: 1, s: 1 });
    // navigation et titre
    const nav = t < 5 ? 0 : t < 8.95 ? 2 : t < 12.75 ? 3 : t < 15.65 ? 1 : 0;
    const prev = t < 5 ? 0 : t < 8.95 ? 0 : t < 12.75 ? 2 : t < 15.65 ? 3 : 1;
    const bnd = [5, 8.95, 12.75, 15.65].reduce((a, b) => (t >= b - .35 && t < b + .35) ? b : a, 0);
    const kk = bnd ? ss(seg(t, bnd - .35, bnd + .35)) : 1;
    const from = bnd ? [0, 0, 2, 3, 1][[5, 8.95, 12.75, 15.65].indexOf(bnd) + (t >= bnd ? 0 : 0)] : nav;
    const to = bnd ? [2, 3, 1, 0][[5, 8.95, 12.75, 15.65].indexOf(bnd)] : nav;
    hl.style.transform = `translateY(${R(lerp(bnd ? from : nav, to, bnd ? kk : 1) * 44)}px)`;
    ttl.textContent = T.titles[[0, 1, 2, 3][t < 5 ? 0 : t < 8.95 ? 1 : t < 12.75 ? 2 : t < 15.65 ? 3 : 0]];
    void prev;
  }
  render(1.8);
  return { render, W, H, cycle: CY };
}

/* =========================================================================================
   3. CARNET IA : note manuscrite, réponse de l'IA, résumé de document, note vocale
   ========================================================================================= */
const PAD = {
  fr: { app: 'Carnet IA', q1: 'Résume les demandes', q2: 'de la semaine', ask: "Demander à l'IA", ai: 'Assistant IA', from: 'Votre note',
    ans: ['Trois demandes de soumission à traiter en priorité.', 'Deux rappels à planifier jeudi matin.', 'Une facture en attente de paiement.'],
    docN: 'Contrat de service.pdf', ext: 'Données extraites', fields: [['Client', 'Client potentiel'], ['Montant', '4' + NS + '850' + NS + '$'], ['Échéance', '30 jours'], ['Signature', 'Requise']],
    voice: 'Note vocale', rec: 'Enregistrement', tr: 'Rappeler le client jeudi pour confirmer la date des travaux.', task: `Tâche créée${NS}: jeudi, 10 h`, done: 'Validé par vous' },
  en: { app: 'AI notebook', q1: 'Summarize this', q2: "week's requests", ask: 'Ask AI', ai: 'AI assistant', from: 'Your note',
    ans: ['Three quote requests to handle first.', 'Two callbacks to schedule Thursday morning.', 'One invoice waiting for payment.'],
    docN: 'Service agreement.pdf', ext: 'Extracted data', fields: [['Client', 'Prospective client'], ['Amount', '$4,850'], ['Due', '30 days'], ['Signature', 'Required']],
    voice: 'Voice note', rec: 'Recording', tr: 'Call the client back Thursday to confirm the project date.', task: 'Task created: Thursday, 10 AM', done: 'Approved by you' }
};
export function buildPad(root, lang = 'fr') {
  const T = PAD[lang] || PAD.fr, W = 744, H = 1000, CY = 18, NW = 34;
  root.innerHTML = `<div class="sx sx-pad" style="width:${W}px;height:${H}px">
    <div class="pd-top"><span><i></i>${T.app}</span><span class="pd-ic"><b></b><b></b><b></b></span></div>
    <section class="pd s1"><div class="hw l1"><span>${T.q1}</span></div><div class="hw l2"><span>${T.q2}</span></div>
      <svg class="ink" viewBox="0 0 744 1000"><path class="ul" pathLength="1" d="M92 418 C210 430 360 424 520 414"/><path class="la" pathLength="1" d="M70 300 C60 200 300 170 560 200 C700 220 690 400 560 440 C400 480 120 470 80 400 C64 372 70 340 88 318"/></svg>
      <div class="pd-ask">${ICO.spark}${T.ask}</div><i class="tap"></i></section>
    <section class="pd s2"><div class="echo">${T.from}<span>${T.q1} ${T.q2}</span></div>
      <div class="pd-card"><div class="pd-ai"><i>${ICO.spark}</i>${T.ai}</div>${T.ans.map(() => '<p class="an"><i></i><span></span></p>').join('')}</div></section>
    <section class="pd s3"><div class="pd-doc"><div class="dn">${ICO.doc}${T.docN}</div>${Array.from({ length: 12 }, (_, i) => `<i class="dl" style="width:${[92, 84, 88, 60, 90, 78, 86, 52, 88, 80, 70, 40][i]}%"></i>`).join('')}
      ${[1, 5, 8].map(i => `<b class="hlt" style="top:${74 + i * 34}px"></b>`).join('')}</div>
      <div class="pd-ext"><h5>${ICO.spark}${T.ext}</h5>${T.fields.map(([a, b]) => `<div class="ef"><small>${a}</small><b>${b}</b><i>${ICO.check}</i></div>`).join('')}</div></section>
    <section class="pd s4"><div class="pd-voice"><small>${T.voice}</small><div class="mic"><i class="r1"></i><i class="r2"></i><span>${ICO.mic}</span></div>
      <div class="wave">${Array.from({ length: NW }, () => '<u></u>').join('')}</div><div class="tm"><i></i><span class="rc">${T.rec}</span><b>0:00</b></div></div>
      <div class="pd-card tr"><p class="tx"></p><div class="task">${ICO.check}${T.task}</div><small class="ok">${T.done}</small></div></section>
    <div class="sx-glare soft"></div></div>`;
  const q = s => el(root, s), qa = s => els(root, s);
  const s1 = q('.s1'), s2 = q('.s2'), s3 = q('.s3'), s4 = q('.s4'), l1 = q('.l1 span'), l2 = q('.l2 span'), ul = q('.ul'), la = q('.la'), ask = q('.pd-ask'), tap = q('.tap');
  const echo = q('.echo'), card = q('.s2 .pd-card'), ans = qa('.s2 .an'), hlt = qa('.hlt'), efs = qa('.ef'), doc = q('.pd-doc');
  const wave = qa('.wave u'), tm = q('.tm b'), tx = q('.tx'), task = q('.task'), ok = q('.ok'), r1 = q('.r1'), r2 = q('.r2'), mic = q('.mic');
  function render(time) {
    const t = ((time % CY) + CY) % CY;
    // 1. question écrite à la main
    const w1 = seg(t, .3, 1.6), w2 = seg(t, 1.7, 2.7);
    l1.style.clipPath = `inset(-20% ${R((1 - w1) * 100)}% -20% 0)`; l2.style.clipPath = `inset(-20% ${R((1 - w2) * 100)}% -20% 0)`;
    ul.style.strokeDashoffset = R(1 - eio(seg(t, 2.8, 3.2))); la.style.strokeDashoffset = R(1 - eio(seg(t, 3.1, 3.7)));
    const ak = eo(seg(t, 3.6, 3.9)); put(ask, { o: ak, s: .9 + .1 * ak, y: (1 - ak) * 10 }); ask.classList.toggle('pr', t > 3.95 && t < 4.2);
    clickRing(tap, t, [3.95]);
    // dissolution vers la réponse
    const dz = ss(seg(t, 4.2, 5.0));
    s1.style.visibility = t < 5 ? 'visible' : 'hidden'; put(s1, { o: 1 - dz, y: -dz * 30 }); s1.style.filter = `blur(${R(dz * 8)}px)`;
    // 2. réponse tapée par l'IA
    const pt = ss(seg(t, 8.6, 9.4));
    s2.style.visibility = t >= 4.2 && t < 9.4 ? 'visible' : 'hidden';
    put(s2, { o: dz * (1 - pt), y: -pt * 340, extra: ` rotateX(${R(pt * 18)}deg)` }); s2.style.filter = `blur(${R((1 - dz) * 8)}px)`;
    put(echo, { o: eo(seg(t, 4.8, 5.3)) }); put(card, { o: eo(seg(t, 5.0, 5.5)), y: (1 - eo(seg(t, 5.0, 5.5))) * 30 });
    T.ans.forEach((a, i) => { const st = 5.5 + i * 1.0, k = seg(t, st, st + .85); ans[i].querySelector('span').innerHTML = typed(a, k) + caret(t, k > 0 && k < 1); ans[i].style.opacity = t > st - .05 ? 1 : 0; });
    // 3. résumé et extraction (la page monte)
    const ir = ss(seg(t, 13.2, 13.9));
    s3.style.visibility = t >= 8.6 && t < 13.9 ? 'visible' : 'hidden';
    put(s3, { o: pt, y: (1 - pt) * 340, s: 1 - ir * .04, extra: ` rotateX(${R((1 - pt) * -12)}deg)` });
    hlt.forEach((h, i) => { h.style.width = R(eio(seg(t, 9.7 + i * .45, 10.2 + i * .45)) * 84) + '%'; });
    efs.forEach((e, i) => { const a = 10.9 + i * .45, k = eo(seg(t, a, a + .55)); const b = e.querySelector('b'); b.style.transform = `translateX(${R((1 - k) * 40)}px)`; b.style.filter = `blur(${R((1 - k) * 4)}px)`; b.style.opacity = R(k);
      e.querySelector('i').style.transform = `scale(${R(ss(seg(t, a + .45, a + .7)))})`; e.classList.toggle('on', k > .02); });
    doc.style.boxShadow = `0 18px 40px rgba(20,30,40,${R(.06 + .06 * Math.sin(Math.PI * seg(t, 10.9, 12.7)))})`;
    // 4. note vocale (ouverture en iris)
    const out = ss(seg(t, 17.3, 18));
    s4.style.visibility = t >= 13.2 ? 'visible' : 'hidden';
    s4.style.clipPath = `circle(${R(ir * 140)}% at 50% 30%)`; s4.style.opacity = R(1 - out);
    const recK = ss(seg(t, 13.9, 14.3)) * (1 - ss(seg(t, 16.1, 16.5)));
    wave.forEach((u, i) => { const v = .18 + recK * (.45 + .3 * Math.sin(t * 6.1 + i * .55) + .25 * Math.sin(t * 9.7 + i * 1.3)); u.style.transform = `scaleY(${R(cl(v, .12, 1))})`; });
    const pr = (t * .8) % 1, pr2 = (t * .8 + .5) % 1;
    r1.style.transform = `scale(${R(1 + pr * .9)})`; r1.style.opacity = R((1 - pr) * .5 * recK); r2.style.transform = `scale(${R(1 + pr2 * .9)})`; r2.style.opacity = R((1 - pr2) * .5 * recK);
    mic.classList.toggle('on', recK > .5);
    tm.textContent = `0:0${Math.min(4, Math.floor(seg(t, 14.0, 16.1) * 4.99))}`;
    const tk = seg(t, 14.4, 16.2); tx.innerHTML = typed(T.tr, tk) + caret(t, tk > 0 && tk < 1);
    const ck = eo(seg(t, 16.4, 16.8)); put(task, { o: ck, s: .9 + .1 * ck, y: (1 - ck) * 12 }); ok.style.opacity = R(ss(seg(t, 16.8, 17.1)));
  }
  render(6.6);
  return { render, W, H, cycle: CY };
}

/* =========================================================================================
   4. ÉCRAN EXTERNE : un site qui se construit, défile, reçoit une demande, puis passe en mobile
   ========================================================================================= */
const MON = {
  fr: { brand: 'Votre entreprise', nav: ['Services', 'À propos', 'Projets', 'Contact'], cta: 'Demander une soumission', eb: 'Conception sur mesure', h1a: 'Votre entreprise,', h1b: 'mise en valeur.',
    p: 'Un site rapide, clair et pensé pour transformer chaque visite en demande de soumission.', b2: 'Nos services', art: 'Nouvelle demande reçue', artS: 'Formulaire web',
    sv: [['Conception web', 'Un design soigné, fidèle à votre image.'], ['Optimisé pour Google', 'Une structure claire et rapide.'], ['Relié à votre CRM', 'Chaque demande arrive au bon endroit.']],
    svH: 'Ce que nous faisons', band: 'Parlons de votre projet.', fN: 'Votre nom', fE: 'Votre courriel', vN: 'Client potentiel', vE: 'client@courriel.ca', send: 'Envoyer', sent: 'Demande envoyée',
    toast: 'Nouvelle demande reçue', toastS: 'Ajoutée au CRM automatiquement', dev: ['Ordinateur', 'Mobile'], foot: 'Tous droits réservés' },
  en: { brand: 'Your business', nav: ['Services', 'About', 'Work', 'Contact'], cta: 'Request a quote', eb: 'Custom design', h1a: 'Your business,', h1b: 'at its best.',
    p: 'A fast, clear website built to turn every visit into a quote request.', b2: 'Our services', art: 'New request received', artS: 'Web form',
    sv: [['Web design', 'Polished design, true to your brand.'], ['Built for Google', 'A clean, fast structure.'], ['Connected to your CRM', 'Every request lands in the right place.']],
    svH: 'What we do', band: "Let's talk about your project.", fN: 'Your name', fE: 'Your email', vN: 'Prospective client', vE: 'client@courriel.ca', send: 'Send', sent: 'Request sent',
    toast: 'New request received', toastS: 'Added to the CRM automatically', dev: ['Desktop', 'Mobile'], foot: 'All rights reserved' }
};
export function buildMonitor(root, lang = 'fr') {
  const T = MON[lang] || MON.fr, W = 1280, H = 720, CY = 16, FORM_Y = 760;
  const page = `<nav class="wn"><div class="lg"><i></i>${T.brand}</div>${T.nav.map(n => `<span>${n}</span>`).join('')}<b>${T.cta}</b></nav>
    <div class="wh"><div class="tx"><small>${T.eb}</small><h1>${T.h1a}<br><em>${T.h1b}</em></h1><p>${T.p}</p><div class="bb"><b>${T.cta}</b><span>${T.b2}</span></div></div>
      <div class="art"><i class="c1"></i><i class="c2"></i><div class="nt"><b>${T.art}</b><small>${T.artS}</small><u><i></i></u></div></div></div>
    <div class="ws"><h2>${T.svH}</h2><div class="cards">${T.sv.map(([a, b]) => `<div class="sv"><i></i><b>${a}</b><span>${b}</span></div>`).join('')}</div></div>
    <div class="wband"><h2>${T.band}</h2><div class="fm"><div class="fi n"><small>${T.fN}</small><span></span></div><div class="fi e"><small>${T.fE}</small><span></span></div><b class="sb"><span class="s1">${T.send}</span><span class="s2">${ICO.check}${T.sent}</span></b></div></div>
    <footer class="wf"><div class="lg"><i></i>${T.brand}</div><span>${T.foot}</span></footer>`;
  root.innerHTML = `<div class="sx sx-mon" style="width:${W}px;height:${H}px">
    <div class="wb-bg"></div>
    <div class="wb-frame"><div class="wb-page">${page}</div>
      <div class="wb-skel"><i style="left:48px;top:26px;width:200px;height:26px"></i><i style="left:720px;top:28px;width:360px;height:20px"></i><i style="left:1092px;top:20px;width:140px;height:36px"></i>
        <i style="left:64px;top:150px;width:150px;height:14px"></i><i style="left:64px;top:186px;width:470px;height:52px"></i><i style="left:64px;top:252px;width:400px;height:52px"></i><i style="left:64px;top:330px;width:440px;height:16px"></i><i style="left:64px;top:356px;width:360px;height:16px"></i><i style="left:64px;top:404px;width:220px;height:48px"></i>
        <i style="left:690px;top:130px;width:530px;height:360px;border-radius:28px"></i><i style="left:64px;top:560px;width:350px;height:130px"></i><i style="left:466px;top:560px;width:350px;height:130px"></i><i style="left:868px;top:560px;width:350px;height:130px"></i></div>
      <div class="wb-sheen"></div><div class="wb-bar"><i></i></div></div>
    <div class="wb-mob"><div class="nm"><i></i>${T.brand}</div><small>${T.eb}</small><h1>${T.h1a} <em>${T.h1b}</em></h1><p>${T.p}</p><b>${T.cta}</b><div class="mc"><i></i><i></i></div></div>
    <div class="wb-dev">${T.dev.map(d => `<span>${d}</span>`).join('')}<i></i></div>
    <div class="sx-toast"><i>${ICO.bell}</i><div><b>${T.toast}</b><small>${T.toastS}</small></div></div>
    <div class="wb-cover"></div>
    <div class="sx-cur"><i class="ring"></i>${CURSOR}</div><div class="sx-glare"></div></div>`;
  const q = s => el(root, s), qa = s => els(root, s);
  const cover = q('.wb-cover');
  const frame = q('.wb-frame'), pg = q('.wb-page'), skel = q('.wb-skel'), sk = qa('.wb-skel i'), sheen = q('.wb-sheen'), bar = q('.wb-bar i'), mob = q('.wb-mob'), dev = q('.wb-dev'), devI = q('.wb-dev i');
  const svs = qa('.ws .sv'), band = q('.wband'), fN = q('.fi.n span'), fE = q('.fi.e span'), sb = q('.sb'), toast = q('.sx-toast'), cur = q('.sx-cur'), ring = q('.ring'), nt = q('.art .nt'), ntBar = q('.art .nt u i');
  const keys = [[0, 1000, 560], [7.6, 1000, 560], [8.3, 460, 300], [9.25, 640, 300], [10.3, 1040, 300], [10.6, 1040, 300], [11.6, 1100, 640], [16, 1000, 560]];
  function render(time) {
    const t = ((time % CY) + CY) % CY;
    // 1. construction : squelette, puis balayage lumineux qui révèle le vrai contenu
    const sw = ss(seg(t, 1.4, 2.7)), blank = 0;
    const cin = eio(seg(t, 15.2, 15.75)), cout = eio(seg(t, 0, .45));
    cover.style.clipPath = t >= 15.2 ? `inset(0 ${R((1 - cin) * 100)}% 0 0)` : `inset(0 0 0 ${R(cout * 100)}%)`;
    sk.forEach((e, i) => { const k = eo(seg(t, .1 + i * .07, .5 + i * .07)); e.style.opacity = R(k); e.style.transform = `translateY(${R((1 - k) * 8)}px)`; });
    pg.style.clipPath = `inset(0 ${R((1 - sw) * 100)}% 0 0)`; skel.style.clipPath = `inset(0 0 0 ${R(sw * 100)}%)`;
    skel.style.visibility = sw < 1 ? 'visible' : 'hidden';
    sheen.style.opacity = R(Math.sin(Math.PI * sw)); sheen.style.left = R(sw * 100) + '%';
    // 2. défilement avec apparition des sections, 3. formulaire, retour en haut pendant la vue mobile
    const sc = eio(seg(t, 3.6, 7.6)) * FORM_Y * (1 - eio(seg(t, 11.8, 13.0)));
    pg.style.transform = `translateY(${R(-sc)}px)`;
    bar.style.transform = `translateY(${R(sc / FORM_Y * 380)}px)`; bar.parentNode.style.opacity = R(seg(t, 3.4, 3.7) * (1 - seg(t, 11.6, 11.9)));
    svs.forEach((e, i) => { const k = eo(seg(sc, 120 + i * 40, 360 + i * 40)); e.style.opacity = 1; e.style.transform = `translateY(${R(t < 3.6 ? 0 : (1 - k) * 24)}px)`; });
    band.style.opacity = 1;
    put(nt, { o: eo(seg(t, 2.6, 3.1)), y: (1 - eo(seg(t, 2.6, 3.1))) * 14 }); ntBar.style.width = R(eio(seg(t, 2.9, 3.8)) * 100) + '%';
    const kn = seg(t, 8.4, 9.2), ke = seg(t, 9.3, 10.2);
    fN.innerHTML = typed(T.vN, kn) + caret(t, kn > 0 && kn < 1); fE.innerHTML = typed(T.vE, ke) + caret(t, ke > 0 && ke < 1);
    const sent = ss(seg(t, 10.6, 10.9)); sb.style.setProperty('--k', R(sent)); sb.classList.toggle('pr', t > 10.5 && t < 10.75);
    const tin = eo(seg(t, 10.85, 11.4)), tout = ss(seg(t, 12.0, 12.5));
    put(toast, { o: tin * (1 - tout), x: (1 - tin) * 360 });
    if (t < 3) { fN.innerHTML = ''; fE.innerHTML = ''; sb.style.setProperty('--k', 0); }
    // 4. vue côte à côte ordinateur et mobile
    const rs = eio(seg(t, 11.8, 12.9));
    frame.style.transform = `translate(${R(-rs * 210)}px,${R(rs * 26)}px) scale(${R(1 - rs * .38)})`; frame.style.borderRadius = R(rs * 18) + 'px';
    frame.style.boxShadow = `0 ${R(rs * 30)}px ${R(rs * 60)}px rgba(20,40,30,${R(rs * .18)})`;
    const mk = eo(seg(t, 12.3, 13.2)); put(mob, { o: Math.min(1, mk * 3.5), x: (1 - mk) * 160 });
    mob.style.setProperty('--sc', R(-ss(seg(t, 13.3, 15.0)) * 60) + 'px');
    put(dev, { o: eo(seg(t, 12.6, 13.1)), y: (1 - eo(seg(t, 12.6, 13.1))) * 10 }); devI.style.transform = `translateX(${R(ss(seg(t, 13.4, 13.9)) * 100)}%)`;
    frame.style.opacity = R(1 - blank);
    // curseur
    const [cx, cy] = pathAt(keys, t); cur.style.transform = `translate(${R(cx)}px,${R(cy)}px)`; cur.style.opacity = R(ss(seg(t, 7.6, 8.0)) * (1 - ss(seg(t, 11.0, 11.5))));
    clickRing(ring, t, [8.35, 9.28, 10.55]);
  }
  render(2.4);
  return { render, W, H, cycle: CY };
}

export const BUILDERS = { laptop: buildLaptop, tablet: buildTablet, pad: buildPad, monitor: buildMonitor };
