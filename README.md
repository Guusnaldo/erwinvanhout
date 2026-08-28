# Erwin van Hout, portfolio in parkeervorm

Persoonlijke portfoliosite als verkennend parkeerspel. Je rijdt met een auto door een parkeergarage met twee niveaus; elke keer dat je netjes in een vak parkeert, opent een van Erwin's parkeerprojecten. De meeste projecten staan op de begane grond, via de helling links rijd je naar het tweede niveau. Er zijn ook vakken voor "Over Erwin" en "Contact", laadvakken met laadpalen als aankleding, en een gewone projectenlijst voor wie liever niet rijdt.

## Inhoud vervangen (belangrijk)

Alle projectinhoud is nu **voorbeeldcontent** en staat in [`js/projects.js`](js/projects.js):

- `PROJECTS`: de zes projecten. Per project: titel, type (bepaalt het pictogram), plaats, periode, rol, capaciteit, opdrachtgever, status, intro, de tekstblokken opgave, aanpak en resultaat, kenmerken en tags. Zet `placeholder` op `false` of verwijder de regel zodra een project echt is; zolang die op `true` staat toont de site een "voorbeeldproject"-label.
- `OVER_TEKST` en `CONTACT_TEKST`: de teksten achter de vakken Over en Contact.

Meer of minder dan zes projecten kan ook: pas dan in `js/game.js` de `NIVEAUS`-specificaties aan (`p0` t/m `p5` zijn projectindexen, `static` is een bezette plek, `laad` en `laadS` zijn laadvakken en `leeg` is een vrij vak).

## Bediening

- Toetsenbord: pijltjestoetsen of WASD, `R` zet de auto terug op start.
- Aanraakscherm: gas en achteruit links, sturen rechts.
- De helling aan de linkerkant brengt je naar het andere niveau.
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

## Hosten op erwinvanhout.nl

Het domein staat bij TransIP en wijst nu nog naar TransIP-hosting. Omzetten naar deze site gaat in twee stappen.

**Stap 1: DNS aanpassen bij TransIP** (transip.nl, Domeinen, erwinvanhout.nl, DNS). Verwijder de bestaande A- en AAAA-records op het hoofddomein en zet dit ervoor in de plaats:

| Naam | Type  | Waarde |
|------|-------|--------|
| @    | A     | 185.199.108.153 |
| @    | A     | 185.199.109.153 |
| @    | A     | 185.199.110.153 |
| @    | A     | 185.199.111.153 |
| @    | AAAA  | 2606:50c0:8000::153 |
| @    | AAAA  | 2606:50c0:8001::153 |
| @    | AAAA  | 2606:50c0:8002::153 |
| @    | AAAA  | 2606:50c0:8003::153 |
| www  | CNAME | guusnaldo.github.io. |

**Stap 2: domein koppelen in GitHub** (pas doen nadat de DNS is aangepast, anders verwijst de site tijdelijk naar de oude TransIP-pagina):

```
gh api repos/Guusnaldo/erwinvanhout/pages -X PUT -f cname=erwinvanhout.nl
```

Of via de website: repo Settings, Pages, Custom domain, `erwinvanhout.nl` invullen en opslaan. GitHub maakt dan zelf een `CNAME`-bestand in de repo aan. Zodra de DNS-controle groen is en het certificaat is uitgegeven (kan tot een uur duren), zet je "Enforce HTTPS" aan:

```
gh api repos/Guusnaldo/erwinvanhout/pages -X PUT -F https_enforced=true
```

Daarna is de site bereikbaar op https://erwinvanhout.nl en verwijst www automatisch door.
