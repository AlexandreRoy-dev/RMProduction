#!/usr/bin/env python3
"""Adapté de check-schema-home.py (CDF) pour Roy Marketing. Valide tous les schema/*.json:
JSON valide, @context, chaque @type et propriété existe dans le vocabulaire schema.org,
propriété permise sur son type (domainIncludes avec supertypes), références @id résolues
dans l'ensemble des fichiers du site, aucun aggregateRating/Review, aucun tiret long ou demi-cadratin,
aucune adresse, aucun mot interdit RM. Exit 1 si échec."""
import json, sys, glob
VOC = "/tmp/schemaorg.jsonld"  # https://schema.org/version/latest/schemaorg-current-https.jsonld
FILES = sorted(glob.glob("/workspace/seo-local/roymarketing/schema/*.json"))
g = json.load(open(VOC))["@graph"]
def ids(v):
    if v is None: return []
    v = v if isinstance(v, list) else [v]
    return [x["@id"].replace("schema:", "") for x in v]
types, props = {}, {}
for n in g:
    t = n["@type"] if isinstance(n["@type"], list) else [n["@type"]]
    name = n["@id"].replace("schema:", "")
    if "rdfs:Class" in t: types[name] = ids(n.get("rdfs:subClassOf"))
    if "rdf:Property" in t: props[name] = (ids(n.get("schema:domainIncludes")), ids(n.get("schema:rangeIncludes")))
def ancestors(t, seen=None):
    seen = seen or set()
    for p in types.get(t, []):
        if p not in seen: seen.add(p); ancestors(p, seen)
    return seen | {t}
docs = {f: json.load(open(f, encoding="utf-8")) for f in FILES}  # raises if invalid JSON
defined = set()
def collect(node):
    if isinstance(node, list):
        for x in node: collect(x)
    elif isinstance(node, dict):
        if "@id" in node and len(node) > 1: defined.add(node["@id"])
        for v in node.values(): collect(v)
for d in docs.values(): collect(d)
total = 0
for F, doc in docs.items():
    errs = []
    if doc.get("@context") != "https://schema.org": errs.append("@context")
    def walk(node, path):
        if isinstance(node, list):
            for i, x in enumerate(node): walk(x, f"{path}[{i}]")
            return
        if not isinstance(node, dict): return
        if set(node) == {"@id"}:
            if node["@id"] not in defined: errs.append(f"{path}: unresolved @id {node['@id']}")
            return
        t = node.get("@type")
        if t is None: errs.append(f"{path}: no @type"); return
        if t not in types: errs.append(f"{path}: unknown type {t}"); return
        anc = ancestors(t)
        for k, v in node.items():
            if k.startswith("@"): continue
            if k in ("aggregateRating", "review", "reviews"): errs.append(f"{path}.{k}: forbidden")
            if k not in props: errs.append(f"{path}.{k}: unknown property"); continue
            dom = props[k][0]
            if dom and not (set(dom) & anc): errs.append(f"{path}.{k}: not allowed on {t} (domain {dom})")
            walk(v, f"{path}.{k}")
    walk(doc["@graph"], "@graph")
    s = open(F, encoding="utf-8").read()
    for ch in ("\u2014", "\u2013"):
        if ch in s: errs.append(f"dash {hex(ord(ch))} present")
    for bad in ('"Review"', "aggregateRating", "garanti", "guarantee", "streetAddress", "PostalAddress", "1839", "Fontainebleau", "Warden", "452-1975", "Montréal", "Montreal", "gratuit"):
        if bad.lower() in s.lower(): errs.append(f"{bad} present")
    if '"Person"' in s and '"worksFor"' not in s: errs.append("Person sans worksFor")
    for n in doc["@graph"]:
        if n.get("@type") == "FAQPage":
            for q in n["mainEntity"]:
                if not q["acceptedAnswer"]["text"].strip(): errs.append("FAQ réponse vide")
    tps = sorted({n["@type"] for n in doc["@graph"]})
    print(f"{F.split('/')[-1]}: nodes {len(doc['@graph'])}, types {tps}, failures {len(errs)}")
    for e in errs: print("  -", e)
    total += len(errs)
print("TOTAL FAILURES:", total)
sys.exit(1 if total else 0)
