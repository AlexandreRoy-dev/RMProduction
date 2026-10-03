"""Génère index.html (fr) et en/index.html à partir de i18n/*.json. Usage : python3 _build/build.py"""
import json, os, html, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOKING_NOTE = "<!-- Lien de réservation : voir js/config.js (BOOKING_URL). -->"

def fr_typo(s):
    # espaces insécables françaises
    s = re.sub(r" ([?!;])", "\u202f\\1", s)
    s = re.sub(r" :", "\u00a0:", s)
    return s

def page(d, root):
    L = d["langShort"]
    sx = "" if L.lower().startswith("fr") else "-en"
    t = (lambda s: fr_typo(s)) if L == "fr" else (lambda s: s)
    e = lambda k: html.escape(t(d[k]), quote=True)
    ea = lambda s: html.escape(t(s), quote=True)
    # Slogan sous le titre principal : clé "tagline2" dans i18n/*.json (laisser vide pour le masquer).
    tagline2 = f'<p class="tagline2">{ea(d["tagline2"])}</p>' if d.get("tagline2") else ""
    tags = lambda k: "".join(f"<li>{ea(x)}</li>" for x in d[k])
    def chap(i, cid, img=None, phone=False, extra=""):
        n, k, h, hb, p = tuple(d[f"c{i}{x}"] for x in "nkh") + (d[f"c{i}hb"], d[f"c{i}p"])
        dev = {"applications": "laptop", "erp-crm": "tablet", "ia": "pad", "web": "monitor"}.get(cid)
        # version simple : maquette d'appareil avec écran animé (remplace les images fixes)
        still = f'<figure class="dm dm--{dev}" role="img" aria-label="{e("altC%d" % i)}"><div class="dm__scr" data-screen="{dev}" data-offset="{6 if cid == "applications" else 0}"></div></figure>' if img and dev else ""
        mock = '<div class="mock" aria-hidden="true"><div class="mock__frame"><div class="phone-ui" id="phoneUIStatic"></div></div></div>' if phone else ""
        body = extra or f'<ul class="tags">{tags("c%dt" % i)}</ul>'
        return f'''
  <section class="chap" id="{cid}" data-chap="{i}">
    {still}{mock}
    <div class="panel panel--{cid}">
      <p class="label"><span>{ea(n)}</span>{ea(k)}</p>
      <h2 class="h2"><span class="h-a">{ea(h)}</span> <span class="h-b">{ea(hb)}<i>.</i></span></h2>
      <p class="body">{ea(p)}</p>
      {body}
    </div>
  </section>'''
    steps = '<ol class="steps">' + "".join(f'<li data-step="{j}"><b>{ea(a)}</b><span>{ea(b)}</span></li>' for j, (a, b) in enumerate(d["c2s"])) + "</ol>"
    opts = "".join(f"<option>{ea(o)}</option>" for o in d["fOpts"])
    hud = "".join(f'<li data-i="{j+1}">{ea(x)}</li>' for j, x in enumerate(d["hud"]))
    other = "en" if L == "fr" else "fr"
    i18n_js = json.dumps({"lang": L, "modalTitle": t(d["modalTitle"]), "modalSub": t(d["modalSub"]), "modalClose": d["modalClose"], "modalAlt": t(d["modalAlt"]), "modalLoading": d["modalLoading"]}, ensure_ascii=False)
    return f'''<!DOCTYPE html>
<html lang="{d["lang"]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e("title")}</title>
<meta name="description" content="{e("metaDesc")}">
<link rel="canonical" href="{d["canonical"]}">
<link rel="alternate" hreflang="fr-CA" href="https://roymarketing.ca/">
<link rel="alternate" hreflang="en-CA" href="https://roymarketing.ca/en/">
<link rel="alternate" hreflang="x-default" href="https://roymarketing.ca/">
<meta name="theme-color" content="#F3F1EC">
<meta property="og:type" content="website">
<meta property="og:locale" content="{d["ogLocale"]}">
<meta property="og:site_name" content="Roy Marketing">
<meta property="og:title" content="{e("ogTitle")}">
<meta property="og:description" content="{e("ogDesc")}">
<meta property="og:url" content="{d["canonical"]}">
<!-- TODO avant mise en ligne : image Open Graph 1200 x 630 qui existe vraiment (og-image.jpg renvoie une 404 sur le site actuel). -->
<meta property="og:image" content="https://roymarketing.ca/assets/img/og-image.jpg">
<link rel="icon" href="{root}assets/brand/favicon/favicon.ico" sizes="32x32">
<link rel="icon" href="{root}assets/brand/favicon/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="{root}assets/brand/favicon/apple-touch-icon-180.png">
<meta name="theme-color" content="#F9F9F7">
<link rel="preload" href="{root}assets/brand/fonts/montserrat-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{root}assets/brand/fonts/inter-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{root}assets/brand/fonts/fonts.css">
<link rel="stylesheet" href="{root}css/site.css">
<link rel="stylesheet" href="{root}css/screens.css">
<link rel="stylesheet" href="{root}css/consent.css">
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": ["MarketingAgency", "LocalBusiness"],
  "@id": "https://roymarketing.ca/#entreprise",
  "name": "Roy Marketing",
  "url": "https://roymarketing.ca/",
  "logo": "https://roymarketing.ca/assets/brand/logo/png/mark/mark-dark-on-light-512.png",
  "description": "{ea(d["ogDesc"])}",
  "telephone": "+18192019042",
  "email": "info@roymarketing.ca",
  "founder": {{ "@type": "Person", "name": "Alexandre Roy" }},
  "address": {{ "@type": "PostalAddress", "addressLocality": "Sherbrooke", "addressRegion": "QC", "addressCountry": "CA" }},
  "areaServed": [
    {{ "@type": "City", "name": "Sherbrooke" }},
    {{ "@type": "City", "name": "Montréal" }},
    {{ "@type": "City", "name": "Québec" }}
  ],
  "knowsLanguage": ["fr-CA", "en-CA"],
  "hasOfferCatalog": {{
    "@type": "OfferCatalog",
    "name": "Services",
    "itemListElement": [
      {{ "@type": "Offer", "itemOffered": {{ "@type": "Service", "name": "Applications sur mesure" }} }},
      {{ "@type": "Offer", "itemOffered": {{ "@type": "Service", "name": "Automatisation" }} }},
      {{ "@type": "Offer", "itemOffered": {{ "@type": "Service", "name": "ERP et CRM" }} }},
      {{ "@type": "Offer", "itemOffered": {{ "@type": "Service", "name": "Intégration IA" }} }},
      {{ "@type": "Offer", "itemOffered": {{ "@type": "Service", "name": "Création de sites web" }} }}
    ]
  }}
}}
</script>
<!-- TODO schema, à confirmer par Alexandre avant mise en ligne : heures d'ouverture (lun. au ven., 9 h à 17 h, non vérifiées), liens sameAs (Facebook, Instagram, LinkedIn, non vérifiés), image Open Graph, fiche Google Business Profile quand elle existera. -->
<script>
/* Amélioration progressive : version cinématique sur grand écran seulement, sans préférence de mouvement réduit. */
(function(){{var d=document.documentElement,q=location.search;
var big=matchMedia('(min-width: 900px) and (min-height: 560px)').matches;
var calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
if((big&&!calm&&q.indexOf('simple')<0)||q.indexOf('cine')>-1)d.classList.add('cine');
if(q.indexOf('notext')>-1)d.classList.add('notext');
d.classList.add('js');
if(d.classList.contains('cine'))setTimeout(function(){{d.classList.add('scene-ready');}},4500);}})();
window.RM_I18N={i18n_js};window.RM_ROOT="{root}";
</script>
</head>
<body>
<a class="skip" href="#contenu">{e("skip")}</a>
<div class="frame" aria-hidden="true"><i class="fl fl--l"></i><i class="fl fl--r"></i><i class="fl fl--b"></i><b class="fd fd--l"></b><b class="fd fd--r"></b></div>

<header class="top" id="top">
  <a class="brand" href="#top" aria-label="{e("brandHome")}">
    <img src="{root}assets/brand/logo/mark/mark-dark-on-light.svg" width="40" height="33" alt="">
    <span class="brand__txt"><span class="brand__name">ROY MARKETING<i>.</i></span><span class="brand__tag">{e("tagline")}</span></span>
  </a>
  <nav class="nav" aria-label="{e("navLabel")}">
    <a href="#applications">{e("navExp")}</a>
    <a href="#automatisation">{e("navAuto")}</a>
    <a href="#ia">{e("navIa")}</a>
    <a href="#contact">{e("navContact")}</a>
  </nav>
  <div class="top__contact">
    <a href="tel:+18192019042">819-201-9042</a>
    <a href="mailto:info@roymarketing.ca">info@roymarketing.ca</a>
  </div>
  <a class="lang" href="{d['switchHref']}" hreflang="{other}" lang="{other}" aria-label="{e("switchLabel")}">{e("switchShort")}</a>
  {BOOKING_NOTE}
  <a class="btn btn--dark top__cta" href="#contact" data-booking>{e("cta")}</a>
</header>

<main id="contenu">

<div class="stage" id="stage" aria-hidden="true">
  <canvas id="desk"></canvas>
  <div class="glow" id="glow"></div>
  <div class="scr-wrap" id="scrWrap"></div>
  <div class="phone-ui-wrap" id="phoneWrap"><div class="phone-ui" id="phoneUI"></div></div>
  <div class="grain"></div>
  <div class="fade-out" id="fadeOut"></div>
</div>

<div class="track" id="track">

  <section class="chap chap--hero" id="hero" data-chap="0">
    <figure class="dm dm--ipad dm--hero" role="img" aria-label="{e("altHero")}"><div class="dm__scr" data-screen="laptop" data-offset="0"></div></figure>
    <div class="panel panel--hero">
      <p class="label label--lines"><span class="ln"></span>{e("heroEyebrow")}<span class="ln"></span></p>
      <h1 class="h1"><span class="h-a">{e("heroH1a")}</span> <span class="h-b">{e("heroH1b")}<i>.</i></span></h1>
      {tagline2}
      <p class="lead">{e("heroLead")}</p>
      <div class="actions">
        <a class="pill" href="#contact" data-booking>{e("cta")}</a>
        <a class="link" href="#applications">{e("heroLink")}</a>
      </div>
    </div>
    <div class="scroll-cue" aria-hidden="true"><span></span>{e("scroll")}</div>
  </section>
{chap(1, "applications", img=True)}
{chap(2, "automatisation", phone=True, extra=steps)}
{chap(3, "erp-crm", img=True)}
{chap(4, "ia", img=True)}
{chap(5, "web", img=True)}

  <section class="chap chap--outro" id="outro" data-chap="6" aria-label="{e("outroLabel")}"></section>
</div>

<section class="contact" id="contact">
  <div class="wrap contact__grid">
    <div class="contact__intro">
      <p class="label"><span>06</span>{e("ctK")}</p>
      <h2 class="h2 h2--xl"><span class="h-a">{e("ctH")}</span><i>.</i></h2>
      <p class="body">{e("ctP")}</p>
      <ul class="contact__list">
        <li><span>{e("phoneL")}</span><a href="tel:+18192019042">819-201-9042</a></li>
        <li><span>{e("emailL")}</span><a href="mailto:info@roymarketing.ca">info@roymarketing.ca</a></li>
      </ul>
      {BOOKING_NOTE}
      <a class="pill pill--lg" href="#contact" data-booking>{e("cta")}</a>
      <p class="location">{e("location")}</p>
    </div>
    <!-- Formulaire : même point de réception Formspree que le site actuel. À remplacer par un envoi direct dans GHL si Alexandre le décide. -->
    <form class="form" action="https://formspree.io/f/mjgknole" method="POST">
      <input type="hidden" name="langue" value="{L}">
      <div class="form__row">
        <label><span>{e("fName")}</span><input name="nom" autocomplete="name" required></label>
        <label><span>{e("fEmail")}</span><input type="email" name="courriel" autocomplete="email" required></label>
      </div>
      <div class="form__row">
        <label><span>{e("fPhone")}</span><input type="tel" name="telephone" autocomplete="tel"></label>
        <label><span>{e("fService")}</span><select name="service">{opts}</select></label>
      </div>
      <label><span>{e("fGoals")}</span><textarea name="objectifs" rows="4"></textarea></label>
      <p class="form__legal">{e("fLegal")} <a href="{d["privacyHref"]}">{e("fLegalLink")}</a>.</p>
      <button class="btn btn--dark" type="submit">{e("fSend")}</button>
    </form>
  </div>
</section>

</main>

<footer class="foot">
  <div class="wrap foot__grid">
    <div class="foot__brand"><span class="brand__name">ROY MARKETING<i>.</i></span><span>{e("location")}</span></div>
    <div class="foot__nap"><a href="tel:+18192019042">819-201-9042</a><a href="mailto:info@roymarketing.ca">info@roymarketing.ca</a></div>
    <div class="foot__legal"><a href="{d["privacyHref"]}">{e("privacy")}</a><button type="button" class="rm-consent-manage" data-consent-manage>{e("cookies")}</button><span>© 2026 Roy Marketing</span></div>
  </div>
</footer>

<div class="hud" id="hud" aria-hidden="true"><ol>{hud}</ol><div class="hud__bar"><span id="hudBar"></span></div></div>

<dialog class="booking" id="booking" aria-labelledby="bookingTitle">
  <div class="booking__head"><div><p class="label"><span>RDV</span>{e("modalTitle")}</p><h2 id="bookingTitle" class="booking__title">{e("modalSub")}</h2></div><button type="button" class="booking__close" data-close aria-label="{e("modalClose")}">×</button></div>
  <div class="booking__body" id="bookingBody"><p class="booking__loading">{e("modalLoading")}</p></div>
  <p class="booking__alt">{e("modalAlt")} <a href="tel:+18192019042">819-201-9042</a> · <a href="mailto:info@roymarketing.ca">info@roymarketing.ca</a></p>
</dialog>

<!-- Pixel Meta : bloqué jusqu'au consentement marketing (Loi 25). fbq('init') reste en commentaire tant qu'il n'y a pas d'identifiant de pixel. -->
<script type="text/plain" data-consent="marketing">/* fbq('init', 'A_REMPLACER'); fbq('track', 'PageView'); */</script>
<script type="importmap">{{"imports":{{"three":"https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/","lenis":"https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.mjs"}}}}</script>
<script src="{root}js/consent.js" defer></script>
<script type="module" src="{root}js/main.js"></script>
</body>
</html>
'''

for lang, out, root in [("fr", "index.html", ""), ("en", "en/index.html", "../")]:
    d = json.load(open(os.path.join(ROOT, "i18n", lang + ".json"), encoding="utf-8"))
    os.makedirs(os.path.dirname(os.path.join(ROOT, out)) or ROOT, exist_ok=True)
    open(os.path.join(ROOT, out), "w", encoding="utf-8").write(page(d, root))
    print("écrit", out)
