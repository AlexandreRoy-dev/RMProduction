"""Génère les pages de politique de confidentialité (FR et EN) à partir de _build/policy_text.py,
ainsi que politique-de-confidentialite.html (redirection vers l'adresse avec barre oblique finale).

Pourquoi la redirection : sur GitHub Pages, /politique-de-confidentialite est servi par le fichier
politique-de-confidentialite.html s'il existe. L'ancien fichier du dépôt redirigeait vers lui-même
(boucle infinie). Celui-ci redirige vers /politique-de-confidentialite/, servi par le dossier."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from policy_text import FR, EN, DATE_FR, DATE_EN
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def page(lang, body, root, path, alt_path, title, desc, nav, foot):
    other = 'en' if lang == 'fr' else 'fr'
    return f'''<!DOCTYPE html>
<html lang="{'fr-CA' if lang == 'fr' else 'en-CA'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} | Roy Marketing</title>
<meta name="description" content="{desc}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://roymarketing.ca{path}">
<link rel="alternate" hreflang="{lang}-CA" href="https://roymarketing.ca{path}">
<link rel="alternate" hreflang="{other}-CA" href="https://roymarketing.ca{alt_path}">
<link rel="alternate" hreflang="x-default" href="https://roymarketing.ca/politique-de-confidentialite/">
<link rel="icon" href="{root}assets/brand/favicon/favicon.ico" sizes="32x32">
<link rel="icon" href="{root}assets/brand/favicon/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="{root}assets/brand/favicon/apple-touch-icon-180.png">
<meta name="theme-color" content="#F4F0E8">
<link rel="stylesheet" href="{root}assets/brand/fonts/fonts.css">
<link rel="stylesheet" href="{root}css/site.css">
<link rel="stylesheet" href="{root}css/consent.css">
</head>
<body class="policy-page">
<a class="skip" href="#contenu">{nav["skip"]}</a>
<header class="top is-solid" id="top">
  <a class="brand" href="{nav["home"]}" aria-label="{nav["homeL"]}">
    <img src="{root}assets/brand/logo/mark/mark-dark-on-light.svg" width="40" height="33" alt="">
    <span class="brand__txt"><span class="brand__name">ROY MARKETING<i>.</i></span><span class="brand__tag">{nav["tag"]}</span></span>
  </a>
  <nav class="nav" aria-label="Navigation"><a href="{nav["home"]}">{nav["homeT"]}</a><a href="{nav["home"]}#contact">Contact</a></nav>
  <div class="top__contact"><a href="tel:+18192019042">819-201-9042</a><a href="mailto:info@roymarketing.ca">info@roymarketing.ca</a></div>
  <a class="lang" href="{alt_path}" hreflang="{other}" lang="{other}">{other.upper()}</a>
</header>
<main id="contenu">
<article class="policy">{body}</article>
</main>
<footer class="foot">
  <div class="wrap foot__grid">
    <div class="foot__brand"><span class="brand__name">ROY MARKETING<i>.</i></span><span>{foot["loc"]}</span></div>
    <div class="foot__nap"><a href="tel:+18192019042">819-201-9042</a><a href="mailto:info@roymarketing.ca">info@roymarketing.ca</a></div>
    <div class="foot__legal"><a href="{path}" aria-current="page">{title}</a><button type="button" class="rm-consent-manage" data-consent-manage>{foot["cookies"]}</button><span>© 2026 Roy Marketing</span></div>
  </div>
</footer>
<script src="{root}js/consent.js" defer></script>
</body>
</html>
'''

fr = page('fr', FR.format(date=DATE_FR), '../', '/politique-de-confidentialite/', '/en/privacy-policy/', 'Politique de confidentialité',
          "Politique de confidentialité de Roy Marketing : renseignements recueillis, consentement, fournisseurs, témoins, droits et responsable de la protection des renseignements personnels (Loi 25).",
          {"skip": "Aller au contenu", "home": "/", "homeL": "Roy Marketing, retour à l'accueil", "tag": "Stratégie • Web • Automatisation", "homeT": "Accueil"},
          {"loc": "Bureaux à Sherbrooke, Montréal et Québec.", "cookies": "Gérer les témoins"})
en = page('en', EN.format(date=DATE_EN), '../../', '/en/privacy-policy/', '/politique-de-confidentialite/', 'Privacy policy',
          "Roy Marketing privacy policy: information collected, consent, service providers, cookies, your rights and the person in charge of personal information (Quebec Law 25).",
          {"skip": "Skip to content", "home": "/en/", "homeL": "Roy Marketing, back to home", "tag": "Strategy • Web • Automation", "homeT": "Home"},
          {"loc": "Offices in Sherbrooke, Montréal and Québec City.", "cookies": "Manage cookies"})
for rel, html in [('politique-de-confidentialite/index.html', fr), ('en/privacy-policy/index.html', en)]:
    os.makedirs(os.path.join(ROOT, os.path.dirname(rel)), exist_ok=True)
    open(os.path.join(ROOT, rel), 'w', encoding='utf-8').write(html); print('écrit', rel)
redirect = '''<!DOCTYPE html>
<html lang="fr-CA">
<head>
<meta charset="utf-8">
<title>Politique de confidentialité | Roy Marketing</title>
<meta name="robots" content="noindex">
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
