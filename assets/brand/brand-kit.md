# Roy Marketing: brand kit (roymarketing.ca v2 prototype)

Roy Marketing, Sherbrooke (Québec). Site language: French only (`lang="fr-CA"`).
Phone: **819-201-9042** (never 819-452-1975, the old number still printed on the old reference visual).
Tagline: **STRATÉGIE • WEB • AUTOMATISATION** (offer: strategy, websites, custom software and automation).

Quick review: `brand-sheet.png`. Tokens: `tokens.css`, `tokens.json`. Fonts: `fonts/`. Photos: `desk/`.

## 1. Logo: the R. mark

The new logo is a bold geometric uppercase **R** in ink followed by a round green **dot**.

### How the vector was built

- Source: `../from-ads/roy-marketing-logo.png` (599 x 499 px, the only raster available; same file as the current site favicon).
- Montserrat was tested first, as requested: the R glyph was outlined with fontTools at weights 600 to 900 and overlaid on the reference. Best Montserrat match is **Bold (700)**, overlap (IoU) 0.87 (ExtraBold 800: 0.81). It is close but visibly different: Montserrat's bowl sits lower, the counter is smaller and the leg starts further right. The reference R is not Montserrat (it looks like Gotham Bold, the brand typeface).
- So the master R is a **clean geometric rebuild fitted to the reference**: straight stem, bars and leg, two smooth Bézier curves for the bowl and two for the counter, 15 nodes in total, fitted by optimisation against the raster. Overlap with the reference: **IoU 0.994** (R and dot together), the residual is the anti-aliasing of the low-res PNG.
- The dot is a true `<circle>`: diameter = 0.289 x R height, gap R to dot = 0.051 x R height, bottom on the baseline (0.5 unit overshoot, as in the reference). Measured on the reference by area and centroid.
- The Montserrat Bold version is kept for comparison in `logo/alt-montserrat-bold/`. It is not the master.
- If a Gotham licence covering logo outlines is available, outlining Gotham Bold "R" is a good way to double-check the master.

Geometry in SVG units (R height = 700): R width 605.24, dot r = 101, viewBox `0 0 843.24 700.5`.

### Colour versions

| File | R | Dot | Use on |
|---|---|---|---|
| mark-dark-on-light | #111111 | #0F4B3A | white, #F9F9F7, light photos |
| mark-light-on-dark | #FFFFFF | #3DA37F | #111111 ink sections and #0F4B3A green |
| mark-mono-black | #000000 | #000000 | one-colour print, stamps, embossing |
| mark-mono-white | #FFFFFF | #FFFFFF | busy dark photos, one-colour reverse |

**Dark-mode dot: #3DA37F** ("vert clair"). Same hue family as #0F4B3A, contrast 6.1:1 on #111111 and 3.2:1 on #0F4B3A (both above the 3:1 WCAG target for graphics). Tested against #62C69B, #59C0A3 and #7FD3B0: those read as mint or pastel; #3DA37F stays deep and premium. The brand green #0F4B3A on ink is too dark (1.9:1) and disappears on the green background.
Use #3DA37F only for the dot or period on dark backgrounds, never as a text or UI colour on light backgrounds.

Ink note: the reference raster uses #232323 for the R. The kit uses the site ink #111111 everywhere so the logo, wordmark, text and buttons share one black. Swap the fill in the SVGs if the lighter #222222 is preferred.

### Lockups

- `lockup-horizontal-*`: mark + "ROY MARKETING." on one line. Wordmark cap height = 0.30 x R height, centred vertically, gap 0.36 x R height.
- `lockup-stacked-*`: mark centred above the wordmark. Wordmark cap height = 0.17 x R height, gap 0.30 x R height.
- `wordmark-*`: "ROY MARKETING." alone, as on the current site.
- Wordmark: Montserrat Bold, uppercase, tracking 0.1em, kerning on, final period in green (#0F4B3A on light, #3DA37F on dark). Outlined to paths, no font needed.

### Files and formats

- SVG: `logo/mark/`, `logo/lockup/`, `logo/wordmark/` (outlined paths, tight bounding box, `role="img"` with title "Roy Marketing").
- PNG: `logo/png/<group>/<name>-512.png` (long side 512 px) and `-2048.png` (long side 2048 px, 4x). Transparent, tight to the artwork (no padding).

### Usage rules

- Clear space: at least one dot diameter (0.29 x R height) on every side.
- Minimum size on screen: mark 24 px tall (favicons excepted), horizontal lockup 140 px wide, stacked lockup 96 px wide.
- Do not stretch, rotate, outline, add shadows or effects, recolour the R green, place the dark version on dark photos, or move or resize the dot.
- The dot is always a perfect circle and always on the baseline.

## 2. Favicons (`favicon/`)

`favicon.svg` switches automatically: ink R + green dot in light mode, white R + #3DA37F dot in dark mode.
`favicon-16.png`, `favicon-32.png` and `favicon.ico` (16, 32, 48) sit on an off-white #F9F9F7 square so they stay readable on dark browser tabs.
`apple-touch-icon-180.png`, `icon-192.png`, `icon-512.png`: opaque #F9F9F7 tiles, mark at 58% width (safe for maskable icons). `favicon-512-transparent.png` for other uses.

```html
<link rel="icon" href="/assets/brand/favicon/favicon.ico" sizes="32x32">
<link rel="icon" href="/assets/brand/favicon/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/brand/favicon/apple-touch-icon-180.png">
<meta name="theme-color" content="#F9F9F7">
```

## 3. Colours

| Token | Hex | Role |
|---|---|---|
| --rm-green | #0F4B3A | Primary: labels, links, hovers, focus, the signature period, logo dot |
| --rm-green-2 | #1A6B55 | Gradient partner only (135deg #0F4B3A to #1A6B55) |
| --rm-green-light | #3DA37F | Logo dot and period on dark backgrounds only |
| --rm-ink | #111111 | Text, headings, primary button, dark section, logo R |
| --rm-bg | #F9F9F7 | Page background |
| --rm-bg-2 | #F5F5F3 | Light text on dark, scrollbar track |
| --rm-white | #FFFFFF | Alternating sections, nav, footer |
| --rm-stone-200 to 800 | #E7E5E4, #D6D3D1, #A8A29E, #78716C, #57534E, #44403C, #292524 | Tailwind stone greys (borders, secondary text, dark section cards) |
| --rm-error | #DC2626 | Form validation only |

Green tints: --rm-green-5, -10, -20 (rgba of #0F4B3A).

## 4. Typography

- **Brand typeface: Gotham** (licensed). Use it in design and print files only. Its font files are not shipped here and must not be uploaded to the site or the repository.
- **Web display: Montserrat** (free Gotham substitute). Headings Medium 500 and Bold 700. Hero H1 uppercase, 44 to 72 px, line height 0.95, tracking -0.025em, last line Bold.
- **Web body: Inter**, 300 to 600. Intro paragraphs Light 300 at 18 px.
- **Labels (eyebrows)**: Inter 12 px, Bold, uppercase, green, tracking 0.15em.
- **Wordmark**: Montserrat Bold, uppercase, tracking 0.1em, final period green.
- **Buttons**: sharp corners (radius 0), solid #111111, white Inter Bold 12 px uppercase, tracking 0.1em, padding 20 x 48 px, green on hover.
- Signature device: headlines end with a green period ("Parlons Web.").

Type scale and spacing: see `tokens.css` (`--rm-fs-*`, `--rm-space-*`). Radius is 0 everywhere; only dots are circles.

### Font loading

Both fonts are SIL Open Font License 1.1, so they are self-hosted (better for GitHub Pages: no third-party request, no layout shift from late CSS). Files in `fonts/`: `montserrat-latin-var.woff2` (65 KB, weights 400 to 800) and `inter-latin-var.woff2` (98 KB, weights 300 to 700), Latin subset with all French characters. Licences: `fonts/OFL-Montserrat.txt`, `fonts/OFL-Inter.txt`.

```html
<link rel="preload" href="/assets/brand/fonts/montserrat-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/brand/fonts/inter-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/brand/fonts/fonts.css">
<link rel="stylesheet" href="/assets/brand/tokens.css">
```

Google Fonts alternative (if self-hosting is not wanted):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300..700&family=Montserrat:wght@400..800&display=swap" rel="stylesheet">
```

Paths above assume the site root is `roymarketing-site-v2/`. Adjust if the prototype is served from a sub-folder.

## 5. Desk photography

See `desk/README.md` (shot list, phone placement) and `desk/credits.md` (photographers, URLs, licence). Rule: real licensed photos only (Pexels or Unsplash free licence), never AI-generated imagery.

## 6. Rebuilding the logo files

Scripts in `source/` (Python 3 with fonttools, skia-pathops, uharfbuzz, cairosvg, Pillow, numpy, scipy; a ready venv exists on the box at `/workspace/.brandenv`):

- `gen.py`: writes every logo SVG (`GEOM=montserrat` writes the comparison version). `DOT_DARK=#xxxxxx` changes the dark-mode dot.
- `png.py`: renders the PNGs. `fav.py`: favicons. `fonts.py`: woff2 subsets.
- `fitR.py` + `r-mark-fit-params.json`: the fitted R geometry.
