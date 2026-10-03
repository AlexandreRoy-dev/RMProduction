# Notes SEO, nouvelle page d'accueil roymarketing.ca

Rédigé par Marketing - SEO local, 2 octobre 2026. Source : mon audit du 2026-09 (`/workspace/seo-local/roymarketing-audit-2026-09.md`).
Note : le dossier du prototype n'existait pas encore sur la box au moment d'écrire ces notes. Elles ne dépendent pas du design, mais je n'ai pas relu le texte du prototype.

## 1. Retirer Sherbrooke du texte visible : est-ce que ça nuit au SEO local ?

Réponse courte : un peu, oui, si on l'enlève partout. Non, si on le garde aux bons endroits discrets.

- Roy Marketing n'a pas de fiche Google Business Profile vérifiée (non vérifié, aucune fiche trouvée). Sans fiche, le site est le principal signal qui dit à Google « cette entreprise est à Sherbrooke ». Enlever la ville de toute la page affaiblirait ce signal pour « agence marketing Sherbrooke », « agence web Sherbrooke », etc.
- Le profil Facebook personnel d'Alexandre n'a aucun effet sur le SEO local. Le cacher là ne change rien. Seuls comptent le site, la fiche Google et les annuaires de l'entreprise.
- Compromis recommandé : aucune ville dans le hero, le H1 ni les grands visuels cinématiques. La ville reste dans :
  1. la balise title et la meta description (invisibles sur la page, visibles seulement dans Google) ;
  2. une petite ligne de texte plus bas (ex. section « Approche » ou au-dessus du formulaire) : « Basé à Sherbrooke, au service des PME partout au Québec. » ;
  3. le pied de page (NAP : nom, ville, téléphone, courriel) ;
  4. le schema LocalBusiness (invisible).
- Le plus gros levier reste la fiche Google Business Profile (zone desservie, adresse masquée). Une fois la fiche active, la ville peut se faire encore plus discrète sur le site.

## 2. Balise title (moins de 60 caractères)

`Roy Marketing | Agence web et marketing à Sherbrooke`

Variante plus « logiciel » si la nouvelle accueil met l'automatisation en avant :
`Roy Marketing | Sites web, logiciels et pub, Sherbrooke`

## 3. Meta description (environ 150 caractères)

`Sites web haut de gamme, logiciels sur mesure, automatisation et publicité pour les PME du Québec. Basé à Sherbrooke. Appelez le 819 201-9042.`

## 4. Structure des titres (un seul H1)

- **H1** : « Technologies d'affaires, logiciels et automatisation pour les PME » (même ligne que la couverture Facebook, cohérence de marque). Pas de ville.
- **H2** Sites web haut de gamme
- **H2** Logiciels sur mesure et automatisation (CRM, flux de travail)
- **H2** Publicité numérique (Google Ads, Meta)
- **H2** Stratégie commerciale et production média
- **H2** Réalisations (seulement de vrais clients et vrais résultats fournis par Alexandre)
- **H2** Notre approche (c'est ici qu'entre la ligne « Basé à Sherbrooke, au service des PME partout au Québec »)
- **H2** Parlons de votre projet (formulaire + téléphone 819 201-9042)

Règles : titres dans l'ordre (pas de H3 avant un H2, l'audit avait relevé un ordre non séquentiel). Les textes animés du hero doivent être du vrai texte HTML, pas une image ni un canvas, et visibles sans attendre le JavaScript (l'audit montrait un problème de LCP causé par `.reveal { opacity: 0 }`).

## 5. Mots-clés locaux à intégrer naturellement

Tirés de l'autocomplétion Google (fr, Canada). **Volumes de recherche non vérifiés** (aucun outil de mots-clés ni Search Console).

| Mot-clé | Où l'utiliser |
|---|---|
| agence marketing sherbrooke | title, meta, ligne « Basé à Sherbrooke » |
| agence web sherbrooke / création site web sherbrooke | H2 Sites web (« création de sites web » dans le texte), future page service dédiée |
| agence publicité sherbrooke / agence google ads sherbrooke | H2 Publicité numérique (« Google Ads » dans le texte) |
| seo sherbrooke / agence seo sherbrooke | une phrase dans Sites web (« optimisés pour Google ») ; pas de page SEO pour l'instant |
| agence communication sherbrooke | facultatif, texte secondaire |
| logiciel sur mesure PME, automatisation PME, CRM PME | H2 Logiciels (mots non locaux, non vérifiés, cohérents avec la nouvelle bio) |

La ville n'a pas besoin d'être répétée dans chaque section : une mention visible (ligne Approche) + le pied de page suffisent sur l'accueil. Le ciblage ville par service ira sur les pages services.

## 6. Schema LocalBusiness (JSON-LD, dans le `<head>`)

À vérifier avant mise en ligne :
- heures (lun. au ven., 9 h à 17 h, reprises de l'ancien schema, **non vérifiées**) ;
- URL du logo (l'ancien `logo.png` renvoyait une 404) et de l'image Open Graph (`og-image.jpg` en 404 aussi) ;
- liens sameAs (Facebook et Instagram repris de l'ancien schema, **non vérifiés**) ; ajouter le lien de la fiche Google quand elle existera ;
- pas d'adresse civique : l'adresse du registre peut être résidentielle, donc ville seulement (comme une fiche Google en zone desservie).

```json
{
  "@context": "https://schema.org",
  "@type": ["MarketingAgency", "LocalBusiness"],
  "@id": "https://roymarketing.ca/#entreprise",
  "name": "Roy Marketing",
  "url": "https://roymarketing.ca/",
  "logo": "https://roymarketing.ca/A_REMPLACER_logo.png",
  "image": "https://roymarketing.ca/A_REMPLACER_og-image.jpg",
  "description": "Sites web haut de gamme, logiciels sur mesure, automatisation et publicité pour les PME du Québec.",
  "telephone": "+18192019042",
  "email": "info@roymarketing.ca",
  "founder": { "@type": "Person", "name": "Alexandre Roy" },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Sherbrooke",
    "addressRegion": "QC",
    "addressCountry": "CA"
  },
  "areaServed": [
    { "@type": "City", "name": "Sherbrooke" },
    { "@type": "AdministrativeArea", "name": "Estrie" },
    { "@type": "AdministrativeArea", "name": "Québec" }
  ],
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "17:00"
  }],
  "sameAs": [
    "https://www.facebook.com/profile.php?id=61581535466026",
    "https://www.instagram.com/rmarketing32/",
    "https://www.linkedin.com/company/A_CONFIRMER"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Services",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Création de sites web" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Logiciels sur mesure et automatisation" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Personnalisation CRM" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Publicité numérique" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Stratégie commerciale" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Production média" } }
    ]
  }
}
```

Après mise en ligne : tester avec l'outil de test des résultats enrichis de Google (non fait).

## 7. Autres points techniques pour la nouvelle accueil

- Téléphone partout : 819 201-9042, lien `tel:+18192019042`. Retirer complètement (819) 452-1975 (en-tête, pied de page, ancien schema, meta descriptions des pages services).
- Garder `lang="fr-CA"`, la balise canonical `https://roymarketing.ca/`, et ajouter les pages services au sitemap.xml (il ne contenait que l'accueil), puis déclarer le sitemap dans robots.txt.
- Supprimer la balise meta keywords (inutile).
- Vidéo ou animations du hero : poster image légère, chargement différé, pas de lecture automatique lourde sur mobile, pour garder un bon LCP.
- Balises Open Graph avec une image qui existe vraiment (1200 x 630).
