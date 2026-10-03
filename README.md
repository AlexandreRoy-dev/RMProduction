# Roy Marketing, roymarketing.ca

Le site public est du HTML statique. GitHub Pages le publie depuis la racine de `main` (type de build legacy, chemin `/`, aucun workflow). Le fichier `CNAME` reste `roymarketing.ca`.

Jekyll est le moteur Pages par défaut. Il ne publie pas les dossiers dont le nom commence par `_`. Les sources éditables sont donc dans `_source/`. Le fichier `_config.yml` exclut aussi ce dossier, ainsi que ce README, pour qu'ils n'apparaissent pas comme des pages du site. Ne pas ajouter de fichier `.nojekyll` : cela désactiverait Jekyll et rendrait `_source/` accessible sur le domaine.

## Reconstruire les pages d'accueil

Les textes français et anglais sont dans `_source/i18n/fr.json` et `_source/i18n/en.json`. Depuis `_source/` :

```bash
python3 _build/build.py
```

La commande réécrit `_source/index.html` et `_source/en/index.html`. Copier ensuite ces fichiers vers la racine publiée :

```bash
cp _source/index.html index.html
cp _source/en/index.html en/index.html
```

Si le CSS, le JavaScript, les images ou la politique de confidentialité changent, copier les mêmes chemins depuis `_source/` vers la racine. La politique (`_source/politique-de-confidentialite/index.html`) n'est pas générée par le script.

Les fichiers publiés `index.html`, `en/index.html` et `politique-de-confidentialite/index.html` contiennent `<meta name="robots" content="noindex, nofollow">`. Le script de build ne l'écrit pas, et la politique dans `_source/` indique `index, follow`. Copier un build frais retire donc cette balise des pages d'accueil. À trancher avant la mise en ligne.

`robots.txt` autorise l'exploration et indique `sitemap.xml`. L'archive de build livrée contenait un `Disallow: /` de prévisualisation. Ce fichier n'est pas celui qui est publié.

## Anciennes adresses

Les pages services, CRM et remerciement de l'ancien site sont de petites pages de redirection (rafraîchissement meta, lien canonique vers l'accueil). `politique-de-confidentialite.html` redirige vers `/politique-de-confidentialite`, l'adresse utilisée par le formulaire Meta. Ne pas supprimer ces fichiers.
