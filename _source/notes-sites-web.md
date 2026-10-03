# Notes Sites web, roymarketing.ca v2

## 1. What exists today (reusable)

The Sept 30 Figma mockup was parked before a final design, so the useful material is a capture of the current live site, with its structure, copy and images, in `/workspace/figma-roymarketing/` (`site/index.html`, `desktop.png`, `mobile.png`).

Current home page structure (French), in order:
1. Header: logo, Expertises, Travaux, Agence, phone, email, "Démarrer un projet" button.
2. Hero (H1): "Stratégie Commerciale, Web et Publicité." with "Sherbrooke - Montréal - Québec" above it.
3. Agence (`#agency`), H2 "Nous ne suivons pas les tendances. Nous dictons la croissance." with 3 pillars: Pas de "Boîte Noire", Rentabilité avant tout, Partenaires de Guerre.
4. Services (`#expertise`), H2 "Nos Services Marketing", 5 cards:
   - Stratégie Commerciale (Pricing, Go-to-Market)
   - Design & Web: "Conception de sites web et plateformes numériques qui convertissent." (E-Commerce, Vitrine, SEO Technique)
   - Publicité Numérique: "Acquisition de trafic qualifié via Google et Meta." (Search, Retargeting, LinkedIn Ads)
   - Production Média: "Studio interne de création." (Shooting Produit, Vidéo Corpo, Reels/TikTok)
   - Personnalisation CRM: "Nous configurons vos outils (Ava Client, GoHighLevel, Ultimo) pour automatiser vos ventes et centraliser vos données." (Automatisations, Pipeline Ventes, Intégration API)
5. Réalisations (`#portfolio`) on the current site: NOT reused. Alexandre wants no réalisations or client project images on the new site.
6. Contact (`#contact`), H2 "Parlons Croissance.", with a form (nom, courriel, téléphone, service souhaité, objectifs) posting to Formspree `mjgknole`.

Suggested mapping for the cinematic scroll:
- The desk intro becomes the hero, keeping the H1 text for SEO, since it currently ranks on "Stratégie Commerciale, Web et Publicité".
- The Web, Publicité and Stratégie stops reuse the copy from cards 2, 3 and 1 above.
- The phone with automations reuses the card 5 copy (CRM and GoHighLevel).
- Keep the contact form after the scroll sequence. No réalisations section and no client project images.
- No stats or testimonials unless Alexandre provides them.

## 2. Target pages

- `/` new cinematic home page (French).
- `/politique-de-confidentialite` already live since Oct 1 (Law 25 and the anti-spam law LCAP). It must stay at this exact URL, because the Meta lead form links to it.
- Law 25 cookie banner (`consent.js` and `consent.css`, currently on every page) must be carried over. Non-essential scripts stay blocked until consent. The Meta Pixel hook is ready, but its `fbq('init')` call is commented out until there is a pixel ID.
- Existing service and CRM pages in the repo should keep their URLs, or get redirects, so nothing breaks in Google.
- Footer links on every page: Politique de confidentialité, Gérer les témoins.
- Phone everywhere: 819-201-9042 (`tel:+18192019042`). The live site already uses it.

## 3. Hosting and publishing plan

- Live site: repo `AlexandreRoy-dev/RMProduction`, served by GitHub Pages from `main`, with CNAME `roymarketing.ca`, as static HTML at the root.
- The v2 build must output static files (plain HTML/JS, or a static export if a framework is used) so it stays on GitHub Pages at no cost.
- Steps:
  1. Prod - Développement versions the prototype once Alexandre approves it.
  2. The work goes on a branch with a pull request in RMProduction (or a separate repo published to a preview subdomain such as `v2.roymarketing.ca`, which needs a DNS record and his OK).
  3. Alexandre reviews the desktop and mobile preview.
  4. Merge to `main` with his OK only.
  5. Verify live: home, policy URL, cookie banner, form submission, sitemap.
- Before going live:
  - On mobile, and when `prefers-reduced-motion` is set, show a simple stacked version (no pinned scroll).
  - Keep the page weight reasonable: compressed WebP or AVIF, lazy-loaded video on the phone screen.
  - Keep the title and meta description, add Open Graph tags, update `sitemap.xml`.
  - Forms: either keep Formspree or send leads straight into GHL (Prod - Développement suggested this for MA Transport). Either way, the form must link to the privacy policy.
- Nothing goes live without Alexandre's OK.
