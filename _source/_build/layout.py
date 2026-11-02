# -*- coding: utf-8 -*-
"""Mise en page des pages v2. Le texte vient du markdown, la FAQ du JSON-LD."""
import html
import re

def esc(s):
    return html.escape(s, quote=True)

def count_words(s):
    s = re.sub(r"\(?/[a-z0-9/\-]+/\)?", "", s)
    s = re.sub(r"[\[\]*→#]", " ", s)
    return len(re.findall(r"[0-9A-Za-zÀ-ÿœŒ'’\-]+", s))

def inline(text):
    parts = re.split(r"(\(/[a-z0-9/\-]+/\))", text)
    out = []
    for part in parts:
        m = re.fullmatch(r"\((/[a-z0-9/\-]+/)\)", part)
        if m:
            href = m.group(1)
            out.append('(<a href="%s">%s</a>)' % (esc(href), esc(href)))
        else:
            out.append(esc(part))
    s = "".join(out)
    s = s.replace("info@roymarketing.ca", '<a href="mailto:info@roymarketing.ca">info@roymarketing.ca</a>')
    s = s.replace("819-201-9042", '<a href="tel:+18192019042">819-201-9042</a>')
    return s

SKIP = {
    "navigation", "hero", "preuves", "proof", "pied de page", "footer",
}

def parse_md(text):
    lines = text.splitlines()
    i = 0
    while i < len(lines) and lines[i].strip() != "## Hero":
        i += 1
    i += 1
    eyebrow = sub = ""
    intros = []
    secondary = ""
    while i < len(lines) and not lines[i].startswith("## "):
        line = lines[i].rstrip()
        low = line.lower()
        if line.startswith("### "):
            i += 1
            while i < len(lines) and not lines[i].startswith("## "):
                i += 1
            continue
        if low.startswith("eyebrow"):
            eyebrow = line.split(":", 1)[1].strip()
        elif line.startswith("# "):
            pass
        elif low.startswith("direction artistique") or low.startswith("art direction"):
            pass
        elif "voir nos services" in low:
            secondary = "Voir nos services"
        elif "see our services" in low:
            secondary = "See our services"
        elif line.startswith("[") or low.startswith("bouton") or low.startswith("button"):
            pass
        elif line.strip():
            if not sub:
                sub = line.strip()
            else:
                intros.append(line.strip())
        i += 1
    blocks = []
    md_faqs = []
    faq_title = ""
    while i < len(lines):
        if not lines[i].startswith("## "):
            i += 1
            continue
        title = lines[i][3:].strip()
        i += 1
        body = []
        while i < len(lines) and not lines[i].startswith("## "):
            body.append(lines[i].rstrip())
            i += 1
        key = title.lower().rstrip(".")
        if key in SKIP or key.startswith("seo"):
            continue
        cleaned = []
        qas = []
        is_faq = False
        j = 0
        while j < len(body):
            b = body[j]
            if b.startswith("(Texte identique") or b.startswith("(Text identical"):
                is_faq = True
                j += 1
                continue
            if "OFFRE À APPROUVER" in b or "OFFER TO BE APPROVED" in b:
                j += 1
                continue
            if b.strip().startswith("[BIO:"):
                j += 1
                continue
            if b.startswith("### "):
                is_faq = True
                q = b[4:].strip()
                j += 1
                ans = []
                while j < len(body) and body[j].strip() and not body[j].startswith("#"):
                    ans.append(body[j].strip())
                    j += 1
                qas.append((q, " ".join(ans)))
                continue
            cleaned.append(b)
            j += 1
        if is_faq and qas:
            faq_title = title
            md_faqs.extend(qas)
            prose = "\n".join(cleaned).strip()
            if prose:
                blocks.append(("section", title, prose))
            continue
        prose = "\n".join(cleaned).strip()
        if prose or title:
            blocks.append(("section", title, prose))
    return {
        "eyebrow": eyebrow,
        "sub": sub,
        "intro": "\n\n".join(intros),
        "secondary": secondary,
        "blocks": blocks,
        "faqs": md_faqs,
        "faq_title": faq_title,
    }

def _lines(body):
    return [ln.strip() for ln in body.splitlines() if ln.strip()]

def section_kind(title, body):
    lines = _lines(body)
    if title in ("Formulaire", "Form"):
        return "form"
    if lines and all(re.match(r"^\d+\. \*\*", ln) for ln in lines):
        return "cards"
    if lines and all(re.match(r"^\d+\.\s+\S", ln) for ln in lines) and not any("→" in ln for ln in lines):
        return "steps"
    if lines and all(ln.startswith("- ") for ln in lines):
        return "list"
    if any(ln.startswith("Bouton :") or ln.startswith("Button:") for ln in lines):
        return "cta"
    return "prose"

def _strip_button(body):
    kept = []
    phone = False
    for ln in body.splitlines():
        if ln.startswith("Bouton :") or ln.startswith("Button:"):
            if "819-201-9042" in ln:
                phone = True
            continue
        kept.append(ln)
    return "\n".join(kept).strip(), phone

def render_cards(body):
    cards = []
    for ln in _lines(body):
        m = re.match(r"^(\d+)\. \*\*(.+?)\*\*\s*(.*?)\s*→\s*(/\S+)\s*$", ln)
        if not m:
            continue
        num, title, text, href = m.groups()
        href = href.rstrip(".")
        title = title.rstrip(".")
        lead = " is-lead" if ("Référencement Google" in title or title.startswith("Google and AI")) else ""
        cards.append(
            '<article class="card%s"><p class="num">%s</p><h3><a href="%s">%s</a></h3><p>%s</p></article>'
            % (lead, esc(num), esc(href), esc(title), inline(text))
        )
    return '<div class="cards">' + "".join(cards) + "</div>"

def render_steps(body):
    bits = []
    for ln in _lines(body):
        m = re.match(r"^(\d+)\.\s+(.*)$", ln)
        if not m:
            continue
        bits.append('<div class="step"><b>%s</b><p>%s</p></div>' % (esc(m.group(1)), inline(m.group(2))))
    return '<div class="steps">' + "".join(bits) + "</div>"

def render_list(body, book, cta):
    items = []
    for ln in _lines(body):
        item = ln[2:].strip()
        m = re.search(r"\[(.+?)\]", item)
        if m:
            html_item = inline(item[:m.start()]) + '<a href="%s" data-book>%s</a>' % (esc(book), esc(m.group(1))) + inline(item[m.end():])
        else:
            html_item = inline(item)
        items.append("<li>" + html_item + "</li>")
    return '<ul class="plist">' + "".join(items) + "</ul>"

def render_prose(body):
    chunks = [c.strip() for c in re.split(r"\n\s*\n", body) if c.strip()]
    if not chunks and body.strip():
        chunks = [body.strip()]
    return "".join("<p>%s</p>" % inline(c.replace("\n", " ")) for c in chunks)

def contact_form(lang, book):
    if lang == "fr":
        return '''<form class="form" action="https://formspree.io/f/mjgknole" method="POST">
<input type="hidden" name="langue" value="fr">
<label for="nom">Nom</label><input id="nom" name="nom" autocomplete="name" required>
<label for="courriel">Courriel</label><input id="courriel" name="courriel" type="email" autocomplete="email" required>
<label for="tel">Téléphone (facultatif)</label><input id="tel" name="telephone" type="tel" autocomplete="tel">
<label for="qui">Vous êtes</label><select id="qui" name="vous_etes"><option>Courtier</option><option>Équipe</option><option>Agence ou bannière</option></select>
<label for="svc">Service souhaité</label><select id="svc" name="service"><option>Site web pour courtier</option><option>Référencement Google et IA</option><option>CRM et suivi automatisé</option><option>Publicité immobilière</option><option>Contenu et vidéo</option><option>Système complet</option><option>Je ne sais pas encore</option></select>
<label for="crm">Votre CRM actuel (facultatif)</label><input id="crm" name="crm">
<label for="obj">Vos objectifs</label><textarea id="obj" name="objectifs" rows="5"></textarea>
<p class="note">En envoyant ce formulaire, vous acceptez que Roy Marketing utilise vos coordonnées pour vous répondre. Voir notre <a href="/politique-de-confidentialite/">politique de confidentialité</a>.</p>
<button class="btn" type="submit">Envoyer</button>
</form>'''
    return '''<form class="form" action="https://formspree.io/f/mjgknole" method="POST">
<input type="hidden" name="langue" value="en">
<label for="nom">Name</label><input id="nom" name="nom" autocomplete="name" required>
<label for="courriel">Email</label><input id="courriel" name="courriel" type="email" autocomplete="email" required>
<label for="tel">Phone (optional)</label><input id="tel" name="telephone" type="tel" autocomplete="tel">
<label for="qui">You are</label><select id="qui" name="vous_etes"><option>Broker</option><option>Team</option><option>Agency or brokerage</option></select>
<label for="svc">Service you need</label><select id="svc" name="service"><option>Real estate agent website</option><option>Google and AI search visibility</option><option>CRM and automated follow-up</option><option>Real estate advertising</option><option>Content and video</option><option>Complete system</option><option>Not sure yet</option></select>
<label for="crm">Your current CRM (optional)</label><input id="crm" name="crm">
<label for="obj">Your goals</label><textarea id="obj" name="objectifs" rows="5"></textarea>
<p class="note">By sending this form, you agree that Roy Marketing may use your contact details to reply to you. See our <a href="/en/privacy-policy/">privacy policy</a>.</p>
<button class="btn" type="submit">Send</button>
</form>'''

def render_faq(title, faqs):
    rows = []
    for q, a in faqs:
        rows.append("<details><summary>%s</summary><p>%s</p></details>" % (esc(q), esc(a)))
    return '<section class="section faq"><div class="wrap"><h2>%s</h2><div class="accordion">%s</div></div></section>' % (
        esc(title), "".join(rows)
    )

def render_blocks(parsed, lang, book, cta, faqs):
    """faqs is a list of (q, a) from JSON-LD. Markdown FAQ is not rendered."""
    blocks = parsed["blocks"]
    parts = []
    alt = False
    i = 0
    count_bits = []
    while i < len(blocks):
        kind_tag, title, body = blocks[i]
        # contact pair
        if title in ("Nous joindre", "Reach us") and i + 1 < len(blocks) and blocks[i + 1][1] in ("Formulaire", "Form"):
            reach = render_list(body, book, cta)
            head = "Nous joindre" if lang == "fr" else "Reach us"
            parts.append(
                '<section class="section%s"><div class="wrap contact-grid"><div><h2>%s</h2>%s</div>%s</div></section>'
                % (" alt" if alt else "", esc(head), reach, contact_form(lang, book))
            )
            count_bits.append(title + " " + body)
            count_bits.append(blocks[i + 1][1] + " " + blocks[i + 1][2])
            alt = not alt
            i += 2
            continue
        kind = section_kind(title, body)
        band = " alt" if alt else ""
        alt = not alt
        if kind == "cards":
            sid = ' id="le-systeme"' if ("système" in title.lower() or "system" in title.lower()) else ""
            parts.append(
                '<section class="section%s"%s><div class="wrap"><h2>%s</h2>%s</div></section>'
                % (band, sid, esc(title), render_cards(body))
            )
            count_bits.append(title + " " + body)
        elif kind == "steps":
            parts.append(
                '<section class="section%s"><div class="wrap"><h2>%s</h2>%s</div></section>'
                % (band, esc(title), render_steps(body))
            )
            count_bits.append(title + " " + body)
        elif kind == "list":
            parts.append(
                '<section class="section%s"><div class="wrap"><h2>%s</h2>%s</div></section>'
                % (band, esc(title), render_list(body, book, cta))
            )
            count_bits.append(title + " " + body)
        elif kind == "cta":
            prose, phone = _strip_button(body)
            extra = ""
            if phone:
                extra = '<p class="cta-meta"><a href="tel:+18192019042">819-201-9042</a> · <a href="mailto:info@roymarketing.ca">info@roymarketing.ca</a></p>'
            parts.append(
                '<section class="section cta-band"><div class="wrap"><h2>%s</h2>%s<div class="actions"><a class="btn" href="%s" data-book>%s</a></div>%s</div></section>'
                % (esc(title), render_prose(prose) if prose else "", esc(book), esc(cta), extra)
            )
            count_bits.append(title + " " + prose)
        else:
            parts.append(
                '<section class="section%s"><div class="wrap prose"><h2>%s</h2>%s</div></section>'
                % (band, esc(title), render_prose(body) if body else "")
            )
            count_bits.append(title + " " + body)
        i += 1
    if faqs:
        title = parsed["faq_title"] or ("Questions fréquentes" if lang == "fr" else "Frequently asked questions")
        # Place the FAQ where the source had it: before a trailing CTA if the last block is a CTA.
        faq_html = render_faq(title, faqs)
        if parts and 'class="section cta-band"' in parts[-1]:
            parts.insert(-1, faq_html)
        else:
            parts.append(faq_html)
        count_bits.append(title)
        count_bits.extend(q + " " + a for q, a in faqs)
    return "\n".join(parts), count_bits

def faq_diff(md_faqs, schema_pairs):
    diffs = []
    if list(md_faqs) == list(schema_pairs):
        return diffs
    md_map = {q: a for q, a in md_faqs}
    js_map = {q: a for q, a in schema_pairs}
    for q in md_map:
        if q not in js_map:
            diffs.append(("only-markdown", q, md_map[q], ""))
    for q in js_map:
        if q not in md_map:
            diffs.append(("only-jsonld", q, "", js_map[q]))
        elif md_map[q] != js_map[q]:
            diffs.append(("answer", q, md_map[q], js_map[q]))
    return diffs
