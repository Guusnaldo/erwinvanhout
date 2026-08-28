# Erwin van Hout, portfolio in parkeervorm

Persoonlijke portfoliosite als verkennend parkeerspel. Je rijdt met een auto over een parkeerdek; elke keer dat je netjes in een vak parkeert, opent een van Erwin's parkeerprojecten. Er zijn ook vakken voor "Over Erwin" en "Contact", en een gewone projectenlijst voor wie liever niet rijdt.

## Inhoud vervangen (belangrijk)

Alle projectinhoud is nu **voorbeeldcontent** en staat in [`js/projects.js`](js/projects.js):

- `PROJECTS`: de zes projecten. Per project: titel, type (bepaalt het pictogram), plaats, periode, rol, capaciteit, opdrachtgever, status, intro, de tekstblokken opgave, aanpak en resultaat, kenmerken en tags. Zet `placeholder` op `false` of verwijder de regel zodra een project echt is; zolang die op `true` staat toont de site een "voorbeeldproject"-label.
- `OVER_TEKST` en `CONTACT_TEKST`: de teksten achter de vakken Over en Contact.

Meer of minder dan zes projecten kan ook: pas dan in `js/game.js` de `TOP_ORDER`-lijst aan (`p0` t/m `p5` zijn projectindexen, `static` is een bezette plek).

## Bediening

- Toetsenbord: pijltjestoetsen of WASD, `R` zet de auto terug op start.
- Aanraakscherm: stuur- en gasknoppen op het scherm.
- Parkeren: rijd een vak in, kom tot stilstand en sta recht; na een halve seconde opent het project.
- Voortgang wordt lokaal bewaard (localStorage).

## Techniek

Zero-build vanilla HTML/CSS/JS, geen dependencies en geen build-stap. Canvas 2D voor het parkeerdek, DOM voor de vensters.

```
index.html        pagina, vensters, knoppen
css/style.css     stijl (licht en neutraal, verkeersblauw accent)
js/projects.js    projectdata (hier vervang je de inhoud)
js/game.js        spel: fysica, parkeerdetectie, tekenen, interface
```

## Lokaal bekijken

Gewoon `index.html` openen in de browser werkt, of met een simpele server:

```
python3 -m http.server 8000
```

## Publiceren

De site staat op GitHub Pages (Settings, Pages, deploy vanaf de `main`-branch, root). Elke push naar `main` werkt de site bij.
