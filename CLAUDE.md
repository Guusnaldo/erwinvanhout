# erwinvanhout.nl

Portfolio van Erwin van Hout als verkennend parkeerspel: rijd over een parkeerplaats, parkeer in een vak en bekijk per plek een project. Dit is een losstaand project; het heeft niets te maken met de parkeerpuzzel-repo. Deel er geen stijl, code of aanpak mee.

## Conventies

- Zero-build vanilla HTML/CSS/JS, geen dependencies en geen build-stap.
- Alle teksten in het Nederlands. Geen em-dashes en geen emoji in de interface; iconen als SVG.
- Stijl: realistische parkeergarage (betonvloer met textuur, witte belijning, kolommen, tl-verlichting, laadpalen) en een lichte, neutrale interface met verkeersblauw (#1259a6) als accent en Inter als letter.
- Het speelveld heeft twee niveaus (P1 en P2) met links een helling; de indeling per niveau staat in de `NIVEAUS`-specs in js/game.js. De meeste inhoud hoort op de begane grond (expliciete wens van Guus): vier projecten plus Over en Contact op P1, de laatste twee projecten op P2.
- Mobiele bediening: gas en achteruit links, sturen rechts (ook een expliciete wens).
- De heldauto is een witte klassieke 911 met walvisstaart. De tekening in `drawHero` (js/game.js) staat in 92x46-maten en wordt met factor 1.35 geschaald naar de botsingsbox van 124x56.

## Status

- Projectinhoud, bio en contacttekst zijn voorbeeldcontent in `js/projects.js`. Zolang `placeholder: true` op een project staat, toont de site een "voorbeeldproject"-label. Vervangen door echte projecten van Erwin.
- Live op https://guusnaldo.github.io/erwinvanhout/ via GitHub Pages (branch `main`, root). Elke push naar `main` deployt.
- Het domein erwinvanhout.nl (TransIP) is nog niet gekoppeld. Volg het stappenplan in README.md: eerst de DNS bij TransIP omzetten, daarna pas het domein in GitHub Pages koppelen en HTTPS afdwingen.

## Testen

- Lokaal draaien: `python3 -m http.server` in de projectmap, of de launch-configuratie "erwinvanhout" uit `.claude/launch.json`.
- Met `#debug` in de URL is `window.__evhDebug` beschikbaar (step, render, zoom, car, keys) om fysica en tekenwerk deterministisch te testen zonder echte toetsaanslagen.
