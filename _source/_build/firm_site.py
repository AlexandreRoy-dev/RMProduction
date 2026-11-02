# -*- coding: utf-8 -*-
"""Génère le site immobilier seulement à partir du copy deck et du schéma SEO."""
import csv, html, json, re, shutil
from pathlib import Path

ROOT = Path("/workspace")
COPY = Path("/tmp/rm-v2/content-planner/seo-roymarketing/refonte")
SCHEMA = Path("/tmp/rm-v2/seo-local/roymarketing/immobilier-seulement/schema")
MAPCSV = Path("/tmp/rm-v2/seo-local/roymarketing/immobilier-seulement/page-map.csv")
BOOK = "https://api.leadconnectorhq.com/widget/booking/3PXAPGRrJXvrP7teaEYS"
OG_FR = "https://roymarketing.ca/assets/img/og-image.jpg"
OG_EN = "https://roymarketing.ca/assets/img/og-image-en.jpg"
ALT_FR = "Roy Marketing, firme de marketing immobilier. Sites web, référencement Google et IA, CRM et publicité pour courtiers."
ALT_EN = "Roy Marketing, a real estate marketing firm. Websites, Google and AI search, CRM and advertising for brokers."

# id, lang, url path, title, meta, h1, md, schema, index_mode (index|gate|noindex|legal)
PAGES = [
("accueil","fr","/","Firme de marketing immobilier pour courtiers | Roy Marketing",
 "Firme de marketing immobilier pour courtiers et équipes : sites web, référencement Google et IA, CRM et publicité. Au Québec, au Canada et aux États-Unis.",
 "Plus de mandats vendeurs, sans dépendre des plateformes.","accueil-fr.md","accueil-fr.json","index"),
("accueil","en","/en/","Real estate marketing firm for brokers | Roy Marketing",
 "Real estate marketing firm for brokers and teams: websites, Google and AI search, CRM and advertising. In Quebec, across Canada and in the United States.",
 "More seller listings, without relying on the portals.","home-en.md","accueil-en.json","index"),
("ref","fr","/referencement-google-ia/","Référencement Google et IA pour courtiers | Roy Marketing",
 "Référencement Google et IA pour courtiers : SEO, fiche Google et carte, données structurées et contenu clair pour être cité par ChatGPT, Gemini et Perplexity.",
 "Référencement Google et IA pour courtiers immobiliers","referencement-google-ia-fr.md","service-ref-fr.json","gate"),
("ref","en","/en/google-ai-search/","Google and AI search for real estate brokers | Roy Marketing",
 "Google and AI search for real estate brokers: SEO, Google Business Profile and Map Pack, structured data and clear content that ChatGPT and Gemini can cite.",
 "Google and AI search visibility for real estate brokers","google-ai-search-en.md","service-ref-en.json","gate"),
("site","fr","/site-web-courtier-immobilier/","Site web pour courtier immobilier, bilingue | Roy Marketing",
 "Site web pour courtier immobilier : rapide, à votre image, avec inscriptions, pages de secteur et demande d'estimation reliée à votre CRM. Français, anglais.",
 "Un site web de courtier qui génère des demandes","site-web-courtier-fr.md","service-site-fr.json","gate"),
("site","en","/en/real-estate-agent-website/","Real estate agent website design, bilingual | Roy Marketing",
 "Real estate agent website design: fast, on brand, with listings, area pages and a home estimate request form connected to your CRM. French and English.",
 "A real estate agent website that brings in requests","real-estate-agent-website-en.md","service-site-en.json","gate"),
("crm","fr","/crm-courtier-immobilier/","CRM et suivi automatisé pour courtiers | Roy Marketing",
 "CRM pour courtier immobilier : on travaille avec tous les CRM. Pipelines vendeurs et acheteurs, relances texto et courriel, rendez-vous en ligne, formation.",
 "CRM et suivi automatisé pour courtiers immobiliers","crm-suivi-fr.md","service-crm-fr.json","gate"),
("crm","en","/en/real-estate-crm/","CRM for realtors and automated follow-up | Roy Marketing",
 "CRM for realtors: we work with every CRM. Seller and buyer pipelines, text and email follow-up, online booking, setup and training for agents and teams.",
 "CRM and automated follow-up for real estate agents","real-estate-crm-en.md","service-crm-en.json","gate"),
("pub","fr","/publicite-courtier-immobilier/","Publicité Facebook et Google pour courtiers | Roy Marketing",
 "Publicité immobilière gérée au mois : campagnes Facebook, Instagram et Google qui rejoignent les vendeurs, pages d'atterrissage et suivi de chaque demande.",
 "Publicité immobilière : Facebook, Instagram et Google","publicite-immobiliere-fr.md","service-pub-fr.json","gate"),
("pub","en","/en/real-estate-ads/","Facebook and Google ads for realtors | Roy Marketing",
 "Real estate advertising managed monthly: Facebook, Instagram and Google campaigns that reach sellers in your area, landing pages and tracking of every lead.",
 "Real estate advertising: Facebook, Instagram and Google","real-estate-ads-en.md","service-pub-en.json","gate"),
("contenu","fr","/contenu-video-courtier-immobilier/","Contenu et vidéo pour courtiers immobiliers | Roy Marketing",
 "Contenu et vidéo pour courtiers immobiliers : image de marque, Page Facebook, guides du vendeur, publications et vidéos courtes qui montrent votre marché.",
 "Une image de marque de courtier, à la hauteur de votre pratique","contenu-video-fr.md","service-contenu-fr.json","gate"),
("contenu","en","/en/real-estate-content-video/","Real estate video and content for agents | Roy Marketing",
 "Real estate content and video for agents: branding, Facebook Page, seller guides, posts and short videos that show your market knowledge, in two languages.",
 "A broker brand that matches the quality of your practice","content-video-en.md","service-contenu-en.json","gate"),
("faq","fr","/faq/","FAQ, marketing immobilier pour courtiers | Roy Marketing",
 "Questions fréquentes sur le marketing immobilier de Roy Marketing : territoire, langues, CRM, publicité, règles de l'OACIQ, déroulement et prix d'un projet.",
 "Questions fréquentes","faq-fr.md","faq-fr.json","gate"),
("faq","en","/en/faq/","FAQ, real estate marketing for agents | Roy Marketing",
 "Common questions about Roy Marketing's real estate marketing for agents: service area, languages, CRM, advertising, OACIQ rules, the process and pricing.",
 "Frequently asked questions","faq-en.md","faq-en.json","gate"),
("apropos","fr","/a-propos/","À propos de Roy Marketing, firme immobilière | Roy Marketing",
 "Roy Marketing, firme de marketing immobilier fondée par Alexandre Roy : sites web, CRM et publicité pour courtiers au Québec, au Canada et aux États-Unis.",
 "À propos de Roy Marketing","a-propos-fr.md","a-propos-fr.json","noindex"),
("apropos","en","/en/about/","About Roy Marketing, real estate marketing | Roy Marketing",
 "Roy Marketing, a real estate marketing firm founded by Alexandre Roy: websites, CRM and advertising for agents in Quebec, Canada and the United States.",
 "About Roy Marketing","about-en.md","a-propos-en.json","noindex"),
("contact","fr","/contact/","Contact, planifier une consultation | Roy Marketing",
 "Parlez-nous de votre pratique de courtier : planifiez une consultation avec Roy Marketing par téléphone au 819-201-9042, par courriel ou avec le formulaire.",
 "Planifier une consultation","contact-fr.md","contact-fr.json","noindex"),
("contact","en","/en/contact/","Contact us and book a consultation | Roy Marketing",
 "Tell us about your real estate practice: book a consultation with Roy Marketing by phone at 819-201-9042, by email or with the form. In French or English.",
 "Book a consultation","contact-en.md","contact-en.json","noindex"),
]

NAV_FR = [
("/site-web-courtier-immobilier/","Site web"),
("/referencement-google-ia/","Référencement Google et IA"),
("/crm-courtier-immobilier/","CRM et suivi"),
("/publicite-courtier-immobilier/","Publicité"),
("/contenu-video-courtier-immobilier/","Contenu et vidéo"),
("/a-propos/","À propos"),
("/faq/","FAQ"),
("/contact/","Contact"),
]
NAV_EN = [
("/en/real-estate-agent-website/","Website"),
("/en/google-ai-search/","Google and AI search"),
("/en/real-estate-crm/","CRM and follow-up"),
("/en/real-estate-ads/","Advertising"),
("/en/real-estate-content-video/","Content and video"),
("/en/about/","About"),
("/en/faq/","FAQ"),
("/en/contact/","Contact"),
]
PAIR = {a[2]: b[2] for a,b in zip([p for p in PAGES if p[1]=="fr"], [p for p in PAGES if p[1]=="en"])}
PAIR.update({v:k for k,v in list(PAIR.items())})
MAP = {}
if MAPCSV.exists():
    for _row in csv.DictReader(MAPCSV.open(encoding="utf-8")):
        MAP[(_row["id"], _row["lang"])] = _row

def esc(s):
    return html.escape(s, quote=True)

def faq_map(schema_name):
    doc = json.loads((SCHEMA/schema_name).read_text(encoding="utf-8"))
    out = {}
    for n in doc["@graph"]:
        if n.get("@type")=="FAQPage":
            for q in n["mainEntity"]:
                out[q["name"].strip()] = q["acceptedAnswer"]["text"].strip()
    return out

def words(text):
    return re.findall(r"[A-Za-zÀ-ÿ0-9''-]+", text)

def parse(md, faqs):
    body = md.split("---",1)[1] if "---" in md else md
    lines = body.splitlines()
    eyebrow=h1=sub=""
    blocks=[]
    i=0
    mode=None
    buf=[]
    def flush_para():
        nonlocal buf
        if buf:
            blocks.append(("p"," ".join(buf).strip()))
            buf=[]
    while i < len(lines):
        line=lines[i].rstrip()
        head = line.upper()
        if line.startswith("## ") and any(k in head for k in ("OFFRE", "PREUVE", "PROOF", "PIED DE PAGE", "FOOTER")):
            i+=1
            while i < len(lines) and not lines[i].startswith("## "):
                i+=1
            continue
        if (line.startswith("Direction artistique") or line.startswith("Art direction")
            or line.startswith("[OFFRE") or line.startswith("[PREUVES")
            or "[À confirmer" in line or "[A confirmer" in line
            or "OFFRE À APPROUVER" in line or "OFFRE A APPROUVER" in line
            or line.startswith("Note :") or line.startswith("Note:")):
            i+=1
            continue
        if line.startswith("- Surligne") or line.startswith("- Eyebrow"):
            eyebrow=line.split(":",1)[1].strip()
        elif line.startswith("- H1"):
            h1=line.split(":",1)[1].strip()
        elif line.startswith("- Sous-ligne") or line.startswith("- Sous-titre") or line.startswith("- Subline") or line.startswith("- Subtitle"):
            sub=line.split(":",1)[1].strip()
        elif line.startswith("## "):
            flush_para()
            title=line[3:].strip()
            if title.lower().startswith("hero"):
                mode="hero"
            elif title.lower().startswith("faq"):
                mode="faq"
            elif title.lower().startswith("cta") or title.lower().startswith("final cta"):
                mode="cta"
            else:
                mode="sec"
            # next non-empty may be H2 :
        elif line.startswith("H2 :") or line.startswith("H2:"):
            flush_para()
            blocks.append(("h2", line.split(":",1)[1].strip()))
        elif line.startswith("### "):
            flush_para()
            blocks.append(("h3", line[4:].strip()))
        elif line.startswith("**") and line.endswith("**") and len(line)>4:
            flush_para()
            q=line.strip("*").strip()
            i+=1
            ans=[]
            while i < len(lines) and lines[i].strip() and not lines[i].startswith("**") and not lines[i].startswith("##") and not lines[i].startswith("Lien :") and not lines[i].startswith("H2"):
                ans.append(lines[i].strip())
                i+=1
            a=" ".join(ans).strip()
            if q in faqs:
                a=faqs[q]
            blocks.append(("qa", q, a))
            continue
        elif line.startswith("Lien :") or line.startswith("Link:"):
            flush_para()
            rest=line.split(":",1)[1].strip()
            if "→" in rest:
                label, href=rest.split("→",1)
            elif "->" in rest:
                label, href=rest.split("->",1)
            else:
                label, href=rest, ""
            blocks.append(("link", label.strip(), href.strip()))
        elif line.startswith("- Bouton") or line.startswith("Bouton :") or line.startswith("Bouton:") or line.startswith("- Button") or line.startswith("Button:") or line.startswith("Button :"):
            i+=1
            continue
        elif line.startswith("- "):
            flush_para()
            items=[]
            while i < len(lines) and lines[i].startswith("- "):
                item=lines[i][2:].strip()
                i+=1
                low=item.lower()
                if low.startswith("bouton") or low.startswith("button") or "OFFRE À APPROUVER" in item or "OFFRE A APPROUVER" in item:
                    continue
                items.append(item)
            if items:
                blocks.append(("ul", items))
            continue
        elif re.match(r"^\d+\. ", line):
            flush_para()
            items=[re.sub(r"^\d+\. ","",line)]
            i+=1
            while i < len(lines) and re.match(r"^\d+\. ", lines[i]):
                items.append(re.sub(r"^\d+\. ","",lines[i]))
                i+=1
            blocks.append(("ol", items))
            continue
        elif line.startswith("Texte :") or line.startswith("Text:") or line.startswith("Coordonnées :") or line.startswith("Contact:") or line.startswith("Mention :") or line.startswith("Notice:"):
            flush_para()
            blocks.append(("p", line.split(":",1)[1].strip()))
        elif line.startswith("Champs :") or line.startswith("Options"):
            flush_para()
        elif not line.strip():
            flush_para()
        elif line.startswith("#"):
            pass
        else:
            if mode!="hero":
                buf.append(line.strip())
        i+=1
    flush_para()
    # rebuild FAQ block from schema order if we have faqs, keeping non-faq blocks
    return eyebrow, h1, sub, blocks

def render_blocks(blocks, lang):
    parts=[]
    for b in blocks:
        if b[0]=="h2":
            parts.append(f"<h2>{esc(b[1])}</h2>")
        elif b[0]=="h3":
            parts.append(f"<h3>{esc(b[1])}</h3>")
        elif b[0]=="p":
            if b[1].startswith("[OFFRE") or b[1].startswith("[PREUVES") or "OFFRE À APPROUVER" in b[1]:
                continue
            parts.append(f"<p>{esc(b[1])}</p>")
        elif b[0]=="ul":
            parts.append("<ul>"+"".join(f"<li>{esc(x)}</li>" for x in b[1] if "OFFRE À APPROUVER" not in x)+"</ul>")
        elif b[0]=="ol":
            parts.append("<ol>"+"".join(f"<li>{esc(x)}</li>" for x in b[1])+"</ol>")
        elif b[0]=="link":
            parts.append(f'<p><a class="more" href="{esc(b[2])}">{esc(b[1].rstrip("."))}</a></p>')
        elif b[0]=="qa":
            parts.append(f"<h3>{esc(b[1])}</h3><p>{esc(b[2])}</p>")
    return "\n".join(parts)

def house(lang):
    sign = "À vendre" if lang=="fr" else "For sale"
    agency = "Votre agence" if lang=="fr" else "Your brokerage"
    return f'''<div class="hero-art" aria-hidden="true">
<svg viewBox="0 0 420 360" role="img">
<title>{esc(sign)}</title>
<rect width="420" height="360" fill="#F3EFE7"/>
<rect x="70" y="150" width="280" height="160" fill="#E7E1D6" stroke="#1A1814" stroke-width="2"/>
<polygon points="50,160 210,50 370,160" fill="#0F4B3A"/>
<rect x="168" y="220" width="84" height="90" fill="#F7F5F1" stroke="#1A1814" stroke-width="2"/>
<rect x="96" y="186" width="58" height="46" fill="#F7F5F1" stroke="#1A1814" stroke-width="2"/>
<rect x="266" y="186" width="58" height="46" fill="#F7F5F1" stroke="#1A1814" stroke-width="2"/>
<rect x="250" y="118" width="118" height="46" fill="#0F4B3A"/>
<text x="309" y="140" text-anchor="middle" fill="#F7F5F1" font-family="Inter,Arial" font-size="13">{esc(sign)}</text>
<text x="309" y="156" text-anchor="middle" fill="#F7F5F1" font-family="Inter,Arial" font-size="10">{esc(agency)}</text>
</svg></div>'''

def schema_text(name):
    """Colle le JSON-LD du plan, puis retire les champs que schema.org refuse."""
    doc = json.loads((SCHEMA/name).read_text(encoding="utf-8"))
    org_ids=set()
    def collect(node):
        if isinstance(node, list):
            for x in node: collect(x)
        elif isinstance(node, dict):
            if node.get("@id") and node.get("@type") in ("Organization","ProfessionalService","LocalBusiness"):
                org_ids.add(node["@id"])
            for v in node.values(): collect(v)
    collect(doc.get("@graph", []))
    def fix(node):
        if isinstance(node, list):
            for x in node: fix(x)
            return
        if not isinstance(node, dict):
            return
        if node.get("@type")=="Service":
            node.pop("availableLanguage", None)
        wf=node.get("worksFor")
        if node.get("@type")=="Person" and isinstance(wf, dict) and set(wf)=={"@id"} and wf.get("@id") not in org_ids:
            wf["@type"]="Organization"
            wf["name"]="Roy Marketing"
        for v in list(node.values()):
            fix(v)
    fix(doc.get("@graph", []))
    return json.dumps(doc, ensure_ascii=False, indent=2)

def page_html(spec, body_html, robots, faq_html):
    pid, lang, path, title, meta, h1, md, schema, mode = spec
    fr = lang=="fr"
    other = PAIR[path]
    canon = "https://roymarketing.ca/" if path=="/" else "https://roymarketing.ca" + path
    fr_url = "https://roymarketing.ca" + (path if fr else other)
    en_url = "https://roymarketing.ca" + (other if fr else path)
    if path=="/":
        fr_url="https://roymarketing.ca/"
        en_url="https://roymarketing.ca/en/"
    if path=="/en/":
        fr_url="https://roymarketing.ca/"
        en_url="https://roymarketing.ca/en/"
    nav = NAV_FR if fr else NAV_EN
    nav_html="".join(f'<a href="{esc(h)}"{" aria-current=\"page\"" if h==path else ""}>{esc(t)}</a>' for h,t in nav)
    cta = "Planifier une consultation" if fr else "Book a consultation"
    switch = "EN" if fr else "FR"
    schema_txt = schema_text(schema)
    og = OG_FR if fr else OG_EN
    alt = ALT_FR if fr else ALT_EN
    home = "/" if fr else "/en/"
    privacy = "/politique-de-confidentialite/" if fr else "/en/privacy-policy/"
    privacy_l = "Politique de confidentialité" if fr else "Privacy policy"
    foot_place = "Au Québec, au Canada et aux États-Unis." if fr else "Across Quebec, Canada and the United States."
    firm = "Firme de marketing immobilier." if fr else "Real estate marketing firm."
    skip = "Aller au contenu" if fr else "Skip to content"
    menu = "Menu" if fr else "Menu"
    cookies = "Gérer les témoins" if fr else "Manage cookies"
    close = "Fermer" if fr else "Close"
    # eyebrow from caller stored in spec extra? passed via body
    return f'''<!DOCTYPE html>
<html lang="{"fr-CA" if fr else "en-CA"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(meta)}">
<meta name="robots" content="{robots}">
<link rel="canonical" href="{canon}">
<link rel="alternate" hreflang="fr-CA" href="{fr_url}">
<link rel="alternate" hreflang="en-CA" href="{en_url}">
<link rel="alternate" hreflang="x-default" href="{fr_url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Roy Marketing">
<meta property="og:locale" content="{"fr_CA" if fr else "en_CA"}">
<meta property="og:locale:alternate" content="{"en_CA" if fr else "fr_CA"}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(meta)}">
<meta property="og:url" content="{canon}">
<meta property="og:image" content="{og}">
<meta property="og:image:secure_url" content="{og}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{esc(alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(meta)}">
<meta name="twitter:image" content="{og}">
<meta name="twitter:image:alt" content="{esc(alt)}">
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="/assets/brand/favicon/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/brand/favicon/apple-touch-icon.png" sizes="180x180">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#F9F9F7">
<link rel="stylesheet" href="/assets/brand/fonts/fonts.css">
<link rel="stylesheet" href="/css/firm.css">
<link rel="stylesheet" href="/css/consent.css">
<script type="application/ld+json">
{schema_txt}
</script>
</head>
<body>
<a class="skip" href="#contenu">{skip}</a>
<header class="top" id="top">
  <a class="brand" href="{home}" aria-label="{"Roy Marketing, accueil" if fr else "Roy Marketing, home"}"><img src="/assets/brand/logo/mark/mark-dark-on-light.svg" width="40" height="33" alt=""><b>ROY MARKETING</b></a>
  <button class="menu" type="button" aria-expanded="false" aria-controls="nav">{menu}</button>
  <nav class="nav" id="nav" aria-label="{"Navigation" if fr else "Navigation"}">{nav_html}</nav>
  <div class="top-actions">
    <a class="lang" href="{other}" hreflang="{"en-CA" if fr else "fr-CA"}" lang="{"en" if fr else "fr"}">{switch}</a>
    <a class="btn" href="{BOOK}" data-book>{cta}</a>
  </div>
</header>
<main id="contenu">
{body_html}
{faq_html}
</main>
<footer class="foot">
  <div class="wrap">
    <p><b>ROY MARKETING.</b> {firm} {foot_place}</p>
    <p><a href="tel:+18192019042">819-201-9042</a> · <a href="mailto:info@roymarketing.ca">info@roymarketing.ca</a></p>
    <div class="foot-links">{nav_html}<a href="{privacy}">{privacy_l}</a><button type="button" class="rm-consent-manage" data-consent-manage>{cookies}</button></div>
  </div>
</footer>
<dialog class="book" id="book">
  <header><p>{cta}</p><button type="button" data-close>{close}</button></header>
  <div id="bookBody"></div>
</dialog>
<script type="module" src="/js/book.js"></script>
<script src="/js/consent.js" defer></script>
</body>
</html>
'''

def contact_form(lang):
    if lang=="fr":
        return '''<section class="section"><div class="wrap contact-grid"><div>
<h2>Options de contact</h2>
<ul><li>Téléphone : <a href="tel:+18192019042">819-201-9042</a></li>
<li>Courriel : <a href="mailto:info@roymarketing.ca">info@roymarketing.ca</a></li></ul>
<p><a class="btn" href="'''+BOOK+'''" data-book>Planifier une consultation</a></p>
</div><form class="form" action="https://formspree.io/f/mjgknole" method="POST">
<input type="hidden" name="langue" value="fr">
<label for="nom">Nom</label><input id="nom" name="nom" autocomplete="name" required>
<label for="courriel">Courriel</label><input id="courriel" name="courriel" type="email" autocomplete="email" required>
<label for="tel">Téléphone (facultatif)</label><input id="tel" name="telephone" type="tel" autocomplete="tel">
<label for="qui">Vous êtes</label><select id="qui" name="vous_etes"><option>Courtier</option><option>Équipe</option><option>Agence ou bannière</option></select>
<label for="svc">Service souhaité</label><select id="svc" name="service"><option>Site web pour courtier</option><option>Référencement Google et IA</option><option>CRM et suivi automatisé</option><option>Publicité immobilière (Meta et Google)</option><option>Contenu et vidéo</option><option>Système complet</option><option>Je ne sais pas encore</option></select>
<label for="crm">Votre CRM actuel (facultatif)</label><input id="crm" name="crm">
<label for="obj">Vos objectifs</label><textarea id="obj" name="objectifs" rows="4"></textarea>
<p class="note">En envoyant ce formulaire, vous acceptez que Roy Marketing utilise vos coordonnées pour vous répondre. Voir notre <a href="/politique-de-confidentialite/">politique de confidentialité</a>.</p>
<button class="btn" type="submit">Envoyer</button>
</form></div></section>
<section class="section"><div class="wrap"><h2>Ce qui se passe ensuite</h2>
<ol><li>Nous vous répondons rapidement pour fixer la consultation.</li>
<li>Pendant la consultation, nous regardons votre marché, vos outils et vos objectifs.</li>
<li>Vous recevez un plan écrit, avec les étapes et les prix.</li></ol></div></section>'''
    return '''<section class="section"><div class="wrap contact-grid"><div>
<h2>Contact options</h2>
<ul><li>Phone: <a href="tel:+18192019042">819-201-9042</a></li>
<li>Email: <a href="mailto:info@roymarketing.ca">info@roymarketing.ca</a></li></ul>
<p><a class="btn" href="'''+BOOK+'''" data-book>Book a consultation</a></p>
</div><form class="form" action="https://formspree.io/f/mjgknole" method="POST">
<input type="hidden" name="langue" value="en">
<label for="nom">Name</label><input id="nom" name="nom" autocomplete="name" required>
<label for="courriel">Email</label><input id="courriel" name="courriel" type="email" autocomplete="email" required>
<label for="tel">Phone (optional)</label><input id="tel" name="telephone" type="tel" autocomplete="tel">
<label for="qui">You are</label><select id="qui" name="vous_etes"><option>Broker</option><option>Team</option><option>Agency or banner</option></select>
<label for="svc">Service you need</label><select id="svc" name="service"><option>Real estate agent website</option><option>Google and AI search visibility</option><option>CRM and automated follow-up</option><option>Real estate advertising (Meta and Google)</option><option>Content and video</option><option>Complete system</option><option>Not sure yet</option></select>
<label for="crm">Your current CRM (optional)</label><input id="crm" name="crm">
<label for="obj">Your goals</label><textarea id="obj" name="objectifs" rows="4"></textarea>
<p class="note">By sending this form, you agree that Roy Marketing may use your contact details to reply to you. See our <a href="/en/privacy-policy/">privacy policy</a>.</p>
<button class="btn" type="submit">Send</button>
</form></div></section>
<section class="section"><div class="wrap"><h2>What happens next</h2>
<ol><li>We reply promptly to set up the consultation.</li>
<li>During the consultation, we look at your market, your tools and your goals.</li>
<li>You receive a written plan, with steps and pricing.</li></ol></div></section>'''

def build_one(spec):
    import layout
    pid, lang, path, title, meta, h1, md, schema, mode = spec
    row = MAP.get((pid, lang))
    if row:
        title, meta, h1 = row["title"], row["meta"], row["h1"]
        spec = (pid, lang, path, title, meta, h1, md, schema, mode)
    schema_faqs = list(faq_map(schema).items())
    raw = (COPY/md).read_text(encoding="utf-8")
    parsed = layout.parse_md(raw)
    diffs = layout.faq_diff(parsed["faqs"], schema_faqs)
    if diffs:
        print("FAQ DIFF", path, len(diffs))
        for kind, q, a, b in diffs:
            print(" ", kind)
            print("  Q", q)
            print("  MD", a)
            print("  JSON", b)
    else:
        print("FAQ OK", path, len(schema_faqs))
    cta = "Planifier une consultation" if lang=="fr" else "Book a consultation"
    art = house(lang) if pid=="accueil" else ""
    grid = " hero-grid" if art else ""
    intro_html = ""
    if parsed["intro"]:
        intro_html = "".join(
            '<p class="intro">%s</p>' % layout.inline(part)
            for part in parsed["intro"].split("\n\n") if part.strip()
        )
    secondary = ""
    if parsed["secondary"]:
        secondary = '<a class="btn btn-ghost" href="#le-systeme">%s</a>' % layout.esc(parsed["secondary"])
    hero = (
        '<section class="hero"><div class="wrap%s"><div>'
        '<p class="eyebrow">%s</p><h1>%s</h1><p class="lede">%s</p>%s'
        '<div class="actions"><a class="btn" href="%s" data-book>%s</a>%s</div>'
        '</div>%s</div></section>'
    ) % (
        grid, layout.esc(parsed["eyebrow"]), layout.esc(h1), layout.esc(parsed["sub"]),
        intro_html, BOOK, layout.esc(cta), secondary, art,
    )
    body, bits = layout.render_blocks(parsed, lang, BOOK, cta, schema_faqs)
    count_text = " ".join([parsed["eyebrow"], h1, parsed["sub"], parsed["intro"], *bits])
    nwords = layout.count_words(count_text)
    if mode == "noindex":
        robots = "noindex, follow"
    elif nwords >= 300:
        robots = "index, follow"
    else:
        robots = "noindex, follow"
    html_doc = page_html(spec, hero + body, robots, "")
    rel = "index.html" if path in ("/", "/en/") else path.strip("/") + "/index.html"
    if path == "/en/":
        rel = "en/index.html"
    for base in (ROOT, ROOT/"_source"):
        out = base/rel
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(html_doc, encoding="utf-8")
    print(f"{path} words={nwords} robots={robots} faq={len(schema_faqs)}")
    return path, nwords, robots


def stubs():
    items=[
        ("marketing-immobilier/index.html","fr","/"),
        ("marketing-industriel/index.html","fr","/"),
        ("en/real-estate-marketing/index.html","en","/en/"),
        ("en/industrial-marketing/index.html","en","/en/"),
    ]
    for rel, lang, target in items:
        if lang=="fr":
            html_doc=f'''<!DOCTYPE html>
<html lang="fr-CA">
<head>
<meta charset="utf-8">
<title>Roy Marketing</title>
<meta name="robots" content="noindex, follow">
<meta http-equiv="refresh" content="0; url={target}">
<link rel="canonical" href="https://roymarketing.ca{target}">
</head>
<body>
<p>Cette page a été déplacée. <a href="{target}">Continuer vers Roy Marketing</a></p>
</body>
</html>
'''
        else:
            html_doc=f'''<!DOCTYPE html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<title>Roy Marketing</title>
<meta name="robots" content="noindex, follow">
<meta http-equiv="refresh" content="0; url={target}">
<link rel="canonical" href="https://roymarketing.ca{target}">
</head>
<body>
<p>This page has moved. <a href="{target}">Continue to Roy Marketing</a></p>
</body>
</html>
'''
        for base in (ROOT, ROOT/"_source"):
            p=base/rel
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(html_doc, encoding="utf-8")
    # repoint old stubs
    mapping={
        "design-web.html":"/site-web-courtier-immobilier/",
        "crm.html":"/crm-courtier-immobilier/",
        "publicite-numerique.html":"/publicite-courtier-immobilier/",
        "production-media.html":"/contenu-video-courtier-immobilier/",
    }
    for name, target in mapping.items():
        doc=f'''<!DOCTYPE html>
<html lang="fr-CA">
<head>
<meta charset="utf-8">
<title>Roy Marketing</title>
<meta name="robots" content="noindex, follow">
<meta http-equiv="refresh" content="0; url={target}">
<link rel="canonical" href="https://roymarketing.ca{target}">
</head>
<body>
<p>Cette page a été déplacée. <a href="{target}">Continuer vers Roy Marketing</a></p>
</body>
</html>
'''
        (ROOT/name).write_text(doc, encoding="utf-8")

def sitemap(rows):
    indexable=[r for r in rows if r[2].startswith("index")]
    # legal always
    locs=[]
    # pairs
    pairs=[]
    seen=set()
    for spec in PAGES:
        path=spec[2]
        if path in seen: continue
        other=PAIR[path]
        fr = path if spec[1]=="fr" else other
        en = other if spec[1]=="fr" else path
        # only if the fr page (or this) is index. Use robots of this path
        rob=dict((a,c) for a,b,c in rows) 
        # rows are (path, words, robots)
    rob={p:r for p,w,r in rows}
    lines=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    done=set()
    for spec in PAGES:
        if spec[1]!="fr":
            continue
        path, other = spec[2], PAIR[spec[2]]
        if not rob.get(path,"").startswith("index"):
            continue
        if not rob.get(other,"").startswith("index") and spec[0] not in ("accueil",):
            # still list both if legal? privacy handled separately
            pass
        fr="https://roymarketing.ca"+path
        en="https://roymarketing.ca"+other
        for loc in (fr, en):
            if loc in done: continue
            # skip if that language page is noindex, except we only entered if fr is index
            page_path = path if loc==fr else other
            if not rob.get(page_path,"").startswith("index"):
                continue
            done.add(loc)
            lines += ["  <url>", f"    <loc>{loc}</loc>", "    <lastmod>2026-11-02</lastmod>",
                      f'    <xhtml:link rel="alternate" hreflang="fr-CA" href="{fr}"/>',
                      f'    <xhtml:link rel="alternate" hreflang="en-CA" href="{en}"/>',
                      f'    <xhtml:link rel="alternate" hreflang="x-default" href="{fr}"/>',
                      "  </url>"]
    lines.append("</urlset>")
    (ROOT/"sitemap.xml").write_text("\n".join(lines)+"\n", encoding="utf-8")

def main():
    shutil.copy(SCHEMA/"llms.txt", ROOT/"llms.txt")
    rows=[]
    for spec in PAGES:
        rows.append(build_one(spec))
    stubs()
    sitemap(rows)
    print("DONE")

if __name__=="__main__":
    main()
