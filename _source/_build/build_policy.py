"""Génère les pages de politique de confidentialité (FR et EN) à partir de _build/policy_text.py,
ainsi que politique-de-confidentialite.html (redirection vers l'adresse avec barre oblique finale).

Pourquoi la redirection : sur GitHub Pages, /politique-de-confidentialite est servi par le fichier
politique-de-confidentialite.html s'il existe. L'ancien fichier du dépôt redirigeait vers lui-même
(boucle infinie). Celui-ci redirige vers /politique-de-confidentialite/, servi par le dossier."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from policy_text import FR, EN, DATE_FR, DATE_EN
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def page(lang, body, root, path, alt_path, title, desc, nav, foot):
    other = 'en' if lang == 'fr' else 'fr'
    short = title.split(" | ")[0]
    og_locale = "fr_CA" if lang == "fr" else "en_CA"
    og_alt = "en_CA" if lang == "fr" else "fr_CA"
    og_image = "https://roymarketing.ca/assets/img/og-image.jpg" if lang == "fr" else "https://roymarketing.ca/assets/img/og-image-en.jpg"
    og_alt_text = ("Roy Marketing, agence web et marketing au Québec, au Canada et aux États-Unis. Marketing immobilier et industriel. Stratégie, web et automatisation."
                   if lang == "fr" else
                   "Roy Marketing, a web and marketing agency in Quebec, Canada and the United States. Real estate and industrial marketing. Strategy, web and automation.")
    home_url = "https://roymarketing.ca/" if lang == "fr" else "https://roymarketing.ca/en/"
    home_name = "Accueil" if lang == "fr" else "Home"
    url = "https://roymarketing.ca" + path
    schema = json.dumps({
        "@context": "https://schema.org",
        "@graph": [
            {"@type": "WebPage", "@id": url + "#page", "url": url, "name": short, "description": desc,
             "inLanguage": "fr-CA" if lang == "fr" else "en-CA",
             "isPartOf": {"@id": "https://roymarketing.ca/#site"},
             "about": {"@id": "https://roymarketing.ca/#entreprise"}},
            {"@type": "BreadcrumbList", "@id": url + "#breadcrumb", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": home_name, "item": home_url},
                {"@type": "ListItem", "position": 2, "name": short, "item": url}]}
        ]
    }, ensure_ascii=False, indent=2)
    return f'''<!DOCTYPE html>
<html lang="{'fr-CA' if lang == 'fr' else 'en-CA'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://roymarketing.ca{path}">
<link rel="alternate" hreflang="fr-CA" href="https://roymarketing.ca/politique-de-confidentialite/">
<link rel="alternate" hreflang="en-CA" href="https://roymarketing.ca/en/privacy-policy/">
<link rel="alternate" hreflang="x-default" href="https://roymarketing.ca/politique-de-confidentialite/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Roy Marketing">
<meta property="og:locale" content="{og_locale}">
<meta property="og:locale:alternate" content="{og_alt}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="https://roymarketing.ca{path}">
<meta property="og:image" content="{og_image}">
<meta property="og:image:secure_url" content="{og_image}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{og_alt_text}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{og_image}">
<meta name="twitter:image:alt" content="{og_alt_text}">
<link rel="icon" href="/assets/brand/favicon/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="/assets/brand/favicon/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/brand/favicon/apple-touch-icon.png" sizes="180x180">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#F9F9F7">
<link rel="stylesheet" href="{root}assets/brand/fonts/fonts.css">
<link rel="stylesheet" href="{root}css/site.css">
<link rel="stylesheet" href="{root}css/consent.css">
<script type="application/ld+json">
{schema}
</script>
</head>
<body class="policy-page">
<a class="skip" href="#contenu">{nav["skip"]}</a>
<header class="top is-solid" id="top">
  <a class="brand" href="{nav["home"]}" aria-label="{nav["homeL"]}">
    <img src="{root}assets/brand/logo/mark/mark-dark-on-light.svg" width="40" height="33" alt="Roy Marketing">
    <span class="brand__txt"><span class="brand__name">ROY MARKETING<i>.</i></span><span class="brand__tag">{nav["tag"]}</span></span>
  </a>
  <nav class="nav" aria-label="Navigation"><a href="{nav["home"]}">{nav["homeT"]}</a><a href="{nav["home"]}#contact">Contact</a></nav>
  <div class="top__contact"><a href="tel:+18192019042">819-201-9042</a><a href="mailto:info@roymarketing.ca">info@roymarketing.ca</a></div>
  <a class="lang" href="{alt_path}" hreflang="{other}-CA" lang="{other}">{other.upper()}</a>
</header>
<main id="contenu">
<article class="policy">{body}</article>
</main>
<footer class="foot">
  <div class="wrap foot__grid">
    <div class="foot__brand"><span class="brand__name">ROY MARKETING<i>.</i></span><span>{foot["loc"]}</span></div>
    <div class="foot__nap"><a href="tel:+18192019042">819-201-9042</a><a href="mailto:info@roymarketing.ca">info@roymarketing.ca</a></div>
    <div class="foot__legal"><a href="{path}" aria-current="page">{short}</a><button type="button" class="rm-consent-manage" data-consent-manage>{foot["cookies"]}</button><span>© 2026 Roy Marketing</span></div>
  </div>
</footer>
<script src="{root}js/consent.js" defer></script>
</body>
</html>
'''

fr = page('fr', FR.format(date=DATE_FR), '../', '/politique-de-confidentialite/', '/en/privacy-policy/', 'Politique de confidentialité | Roy Marketing',
          "Politique de confidentialité de Roy Marketing : renseignements recueillis, usages, témoins, conservation et droits prévus par la Loi 25 en vigueur au Québec.",
          {"skip": "Aller au contenu", "home": "/", "homeL": "Roy Marketing, retour à l'accueil", "tag": "Stratégie • Web • Automatisation", "homeT": "Accueil"},
          {"loc": "Québec, Canada et États-Unis.", "cookies": "Gérer les témoins"})
en = page('en', EN.format(date=DATE_EN), '../../', '/en/privacy-policy/', '/politique-de-confidentialite/', 'Privacy policy | Roy Marketing',
          "Roy Marketing privacy policy: personal information collected, how it is used, cookies, retention and your rights under Quebec Law 25 on privacy protection.",
          {"skip": "Skip to content", "home": "/en/", "homeL": "Roy Marketing, back to home", "tag": "Strategy • Web • Automation", "homeT": "Home"},
          {"loc": "Quebec, Canada and the United States.", "cookies": "Manage cookies"})
for rel, html in [('politique-de-confidentialite/index.html', fr), ('en/privacy-policy/index.html', en)]:
    os.makedirs(os.path.join(ROOT, os.path.dirname(rel)), exist_ok=True)
    open(os.path.join(ROOT, rel), 'w', encoding='utf-8').write(html); print('écrit', rel)
redirect = '''<!DOCTYPE html>
<html lang="fr-CA">
<head>
<meta charset="utf-8">
<title>Politique de confidentialité | Roy Marketing</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="https://roymarketing.ca/politique-de-confidentialite/">
<meta http-equiv="refresh" content="0; url=/politique-de-confidentialite/">
<script>location.replace('/politique-de-confidentialite/' + location.hash);</script>
</head>
<body>
<p><a href="/politique-de-confidentialite/">Politique de confidentialité</a></p>
</body>
</html>
'''
open(os.path.join(ROOT, 'politique-de-confidentialite.html'), 'w', encoding='utf-8').write(redirect); print('écrit politique-de-confidentialite.html')
