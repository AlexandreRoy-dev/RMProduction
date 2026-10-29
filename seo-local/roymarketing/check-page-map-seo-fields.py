# -*- coding: utf-8 -*-
"""QA Roy Marketing page-map-seo-fields.csv (adapté du script Couillard). Sortie 1 si un échec."""
import csv, sys
from collections import Counter
from pathlib import Path
path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("/workspace/seo-local/roymarketing/page-map-seo-fields.csv")
rows = list(csv.DictReader(path.open(encoding="utf-8")))
URLS = {r["url"] for r in rows}
SUFFIX = " | Roy Marketing"
FORBID = ("garanti", "guarantee", "warden", "gratuit", "pas cher", "1839", "fontainebleau", "montréal", "montreal", "452-1975", "évaluation agréée", "#1", "numéro 1", "meilleure agence")
fails = []
def bad(m): fails.append(m)
for i, r in enumerate(rows, start=2):
    u = r["url"]; blob = " ".join(v or "" for v in r.values())
    if "\u2014" in blob or "\u2013" in blob: bad(f"L{i} {u}: tiret cadratin ou demi-cadratin")
    pub = (r["title"] + " " + r["meta"] + " " + r["h1"] + " " + r["h2_cles"] + " " + r["og_title"]).lower()
    for w in FORBID:
        if w in pub: bad(f"L{i} {u}: mot interdit dans un champ public ({w})")
    for col in ("title", "meta", "h1", "h2_cles", "og_title"):
        if "[" in r[col] or "]" in r[col] or "  " in r[col]: bad(f"L{i} {u}: crochet ou double espace dans {col}")
    if not r["title"].endswith(SUFFIX): bad(f"L{i} {u}: title sans suffixe Roy Marketing")
    if len(r["title"]) > 60: bad(f"L{i} {u}: title {len(r['title'])} > 60")
    if not (150 <= len(r["meta"]) <= 158): bad(f"L{i} {u}: meta {len(r['meta'])} hors 150 à 158")
    if not r["meta"].endswith("."): bad(f"L{i} {u}: meta sans point final")
    if not r["h1"].strip(): bad(f"L{i} {u}: h1 vide")
    if r["lang"] not in ("fr-CA", "en-CA"): bad(f"L{i} {u}: lang invalide")
    if r["lang"] == "en-CA" and not u.startswith("/en/"): bad(f"L{i} {u}: page EN hors /en/")
    if r["lang"] == "fr-CA" and u.startswith("/en/"): bad(f"L{i} {u}: page FR sous /en/")
    if r["canonical"] != "https://roymarketing.ca" + u: bad(f"L{i} {u}: canonical incohérente")
    hp = r["hreflang_pair"]
    if hp not in URLS: bad(f"L{i} {u}: hreflang_pair {hp} absente")
    else:
        back = [x for x in rows if x["url"] == hp][0]["hreflang_pair"]
        if back != u: bad(f"L{i} {u}: hreflang non réciproque")
    for l in [x for x in r["liens_internes"].split("|") if x]:
        if l not in URLS: bad(f"L{i} {u}: lien interne {l} absent du fichier")
        else:
            lang_l = [x for x in rows if x["url"] == l][0]["lang"]
            if lang_l != r["lang"]: bad(f"L{i} {u}: lien interne {l} dans l'autre langue")
    if "FAQPage" in r["schema_types"] and r["faq"] != "oui": bad(f"L{i} {u}: FAQPage sans FAQ visible")
for col in ("title", "meta", "h1"):
    for v, c in Counter(r[col] for r in rows).items():
        if c > 1: bad(f"doublon {col}: {v[:70]}")
print(f"rows {len(rows)}"); print(f"failures {len(fails)}")
for f in fails: print(" FAIL", f)
sys.exit(1 if fails else 0)
