# Scenes from the Roy Marketing ads

Each ad is one self-contained HTML file (HTML, CSS and JS inline). Canvas is 1080x1920 (9:16).
Animation is driven by a `render(t)` function (t in seconds), so it can be mapped to scroll progress instead of time.
Fonts: Manrope and Inter (Google Fonts). Brand font is Gotham, with Montserrat as fallback, for new work.
The logo file is `roy-marketing-logo.png`. Reference MP4 renders are included to show the motion.

## crm-reel.html (CRM reel, about 20 s)
- `#s1` Hook, "PME du Québec".
- `#s2` "La solution", with the pill "Tout au même endroit".
- `#s3` "Automatisations CRM": 4 numbered step cards (`#k0` to `#k3`) linked by animated arrows (`#arrows` SVG). Steps are instant reply to new leads, automatic follow-ups, tasks, and clear reports. Best match for the phone screen automations.
- `#s4` "Fonction Ma journée": morning summary card (`#mj`) with items that check off (`#i0` to `#i3`).
- `#s5` "Plus de clients. Moins de tâches." plus the pill "Fonctionne avec votre CRM".
- `#s6` End screen (roymarketing.ca, 819-201-9042).

## web-reel.html (websites reel, 30 s)
- `#s1` Hook, browser typing a URL.
- `#s2` Build, "Un site pensé pour convertir."
- `#s3` Features: design, speed, mobile morph, Google search.
- `#s4` CRM: a phone (`#ph`) shows a "Nous joindre" form that types itself, the "Envoyer" button is clicked, then a lead chip (`#fly`) flies into a "Votre CRM" card (`#crm`, rows in `#rows4`) and a task chip appears. Best match for a phone landing scene.
- `#s5` Benefit, "Une image à la hauteur de votre entreprise."
- `#s6` End screen.

## Notes
- The numbers shown in the scenes (for example "3 suivis à faire", "2 rendez-vous") are example interface content, not real stats.
- The web reel form uses the example name "Marie T." and "marie@courriel.ca". Swap them for generic placeholders if wanted.
- Never show the current roymarketing.ca site. These scenes use concept mockups only.
