/*
 * Projectdata voor de portfolio-parkeerplaats.
 *
 * LET OP: dit zijn voorbeeldprojecten. Vervang de inhoud hieronder door
 * echte projecten van Erwin. Zet `placeholder` op false (of verwijder de
 * regel) zodra de inhoud klopt; zolang die op true staat toont de site
 * een "voorbeeld"-label bij het project.
 *
 * Velden:
 *   id           unieke sleutel (voortgang in localStorage)
 *   kort         korte naam, geschilderd op het wegdek in het vak
 *   titel        volledige projectnaam
 *   type         pictogram: garage | ondergronds | terrein | pr | fiets | route
 *   plaats       plaatsnaam
 *   periode      jaartal of periode (tekst)
 *   rol          rol van Erwin in het project
 *   capaciteit   kerncijfer, bijvoorbeeld aantal parkeerplaatsen
 *   opdrachtgever, status
 *   intro        samenvatting in 1 a 2 zinnen (bovenaan de projectpagina)
 *   opgave, aanpak, resultaat   de drie tekstblokken van de projectpagina
 *   kenmerken    lijst met 3 a 5 kenmerken
 *   tags         trefwoorden
 */
const PROJECTS = [
  {
    id: "stationskwartier",
    kort: "Stations-kwartier",
    titel: "Parkeergarage Stationskwartier",
    type: "garage",
    plaats: "Voorbeeldstad",
    periode: "2019 tot 2021",
    rol: "Ontwerp en advies",
    capaciteit: "420 parkeerplaatsen",
    opdrachtgever: "Gemeente Voorbeeldstad",
    status: "In gebruik sinds 2021",
    intro: "Nieuwe openbare parkeergarage naast het station, met dubbel grondgebruik voor bewoners en treinreizigers.",
    opgave: "Rond het vernieuwde station kwamen honderden woningen bij, terwijl de bestaande parkeerterreinen plaats moesten maken voor de nieuwe stationsentree. De gemeente zocht een oplossing die bewoners, forenzen en bezoekers tegelijk kon bedienen zonder het stationsplein te belasten.",
    aanpak: "Erwin werkte het functioneel ontwerp uit: de maatvoering van vakken en rijbanen, de ligging van in- en uitritten ten opzichte van de drukke stationsweg en een verdeling van de capaciteit per doelgroep over de dag. Met een bezettingsmodel is aangetoond dat bewoners en treinreizigers grotendeels dezelfde plaatsen kunnen delen.",
    resultaat: "De garage draait sinds de opening op een gezonde bezetting en het stationsplein is autovrij opgeleverd. Door het dubbelgebruik konden er circa honderd plaatsen minder gebouwd worden dan aanvankelijk gevraagd, wat ruimte en bouwkosten scheelde.",
    kenmerken: [
      "Dubbelgebruik door bewoners en treinreizigers",
      "In- en uitrit gescheiden van het stationsplein",
      "Brede vakken langs de looproutes",
      "Voorbereid op laadpunten op elke verdieping"
    ],
    tags: ["garage", "ov-knooppunt", "dubbelgebruik"],
    placeholder: true
  },
  {
    id: "marktplein",
    kort: "Marktplein",
    titel: "Ondergrondse garage Marktplein",
    type: "ondergronds",
    plaats: "Voorbeeldstad",
    periode: "2021 tot 2023",
    rol: "Functioneel ontwerp",
    capaciteit: "310 parkeerplaatsen",
    opdrachtgever: "Gemeente Voorbeeldstad",
    status: "Opgeleverd in 2023",
    intro: "Tweelaagse ondergrondse garage onder een vernieuwd marktplein, zodat het maaiveld vrijkwam voor voetgangers en terrassen.",
    opgave: "Het marktplein stond vol geparkeerde auto's en de binnenstad wilde het plein teruggeven aan de markt en de horeca. Onder het plein was ruimte, maar de smalle aanrijroutes en de archeologische ondergrond maakten het een lastige puzzel.",
    aanpak: "Erwin maakte het functioneel ontwerp van beide parkeerlagen: een eenrichtingscircuit zonder krappe bochten, een compacte entree in de gevelwand en een logische verdeling van voetgangersuitgangen naar de winkelstraten. Varianten zijn doorgerekend op capaciteit, rijcomfort en bouwvolume.",
    resultaat: "Het plein is nu volledig autovrij en de garage vangt de bezoekers van de binnenstad op. De gekozen variant bleef binnen het bouwvolume van de archeologische randvoorwaarden en haalt een vlotte in- en uitrijtijd op piekmomenten.",
    kenmerken: [
      "Twee lagen onder een monumentaal plein",
      "Eenrichtingscircuit zonder tegenverkeer",
      "Entree opgenomen in de bestaande gevelwand",
      "Voetgangersuitgangen aan beide winkelstraten"
    ],
    tags: ["ondergronds", "binnenstad", "herinrichting"],
    placeholder: true
  },
  {
    id: "ziekenhuis-noord",
    kort: "Ziekenhuis Noord",
    titel: "Parkeerterrein Ziekenhuis Noord",
    type: "terrein",
    plaats: "Voorbeelddorp",
    periode: "2018 tot 2019",
    rol: "Capaciteits- en routeadvies",
    capaciteit: "650 parkeerplaatsen",
    opdrachtgever: "Ziekenhuis Noord",
    status: "In gebruik sinds 2019",
    intro: "Uitbreiding en herindeling van het bezoekersterrein bij een regionaal ziekenhuis, met aparte routes per doelgroep.",
    opgave: "Bezoekers, personeel en kiss-and-ride liepen op het oude terrein voortdurend door elkaar. Op piekdagen stonden er wachtrijen tot op de openbare weg en waren de looproutes naar de hoofdentree onlogisch en lang.",
    aanpak: "Op basis van tellingen en het afsprakenrooster van de polikliniek bracht Erwin de werkelijke parkeervraag per uur in beeld. Daarop is het terrein opnieuw ingedeeld: personeel naar de rand, bezoekers dichtbij, een aparte kiss-and-ride lus bij de entree en een heldere bewegwijzering per zone.",
    resultaat: "De wachtrijen op de toegangsweg zijn verdwenen en de gemiddelde loopafstand voor bezoekers is bijna gehalveerd. Het terrein kan de verwachte groei van het ziekenhuis tot zeker tien jaar vooruit opvangen.",
    kenmerken: [
      "Aparte zones voor bezoekers, personeel en kiss-and-ride",
      "Kortere loopafstanden naar de hoofdentree",
      "Opstelruimte voor pieken binnen het terrein",
      "Gedimensioneerd op het afsprakenrooster"
    ],
    tags: ["terrein", "zorg", "routering"],
    placeholder: true
  },
  {
    id: "transferium",
    kort: "Transferium A0",
    titel: "Transferium A0",
    type: "pr",
    plaats: "Voorbeeldstad",
    periode: "2017 tot 2018",
    rol: "Programma van eisen",
    capaciteit: "900 parkeerplaatsen",
    opdrachtgever: "Provincie Voorbeeld",
    status: "In gebruik sinds 2018",
    intro: "P+R-locatie aan de rand van de stad met een snelle busverbinding naar het centrum.",
    opgave: "De binnenstad slibde dicht met bezoekersverkeer, terwijl langs de snelweg ruimte lag voor opvang aan de rand. De provincie wilde een transferium dat automobilisten echt verleidt om over te stappen, geen terrein dat halfleeg blijft staan.",
    aanpak: "Erwin stelde het programma van eisen op: de maat van het terrein, de rijroutes van snelweg tot parkeervak, de ligging van de bushalte op loopafstand van elk vak en de voorzieningen die een overstap aantrekkelijk maken. Het ontwerp van de aannemer is daarna getoetst op doorstroming en vindbaarheid.",
    resultaat: "Het transferium trekt op topdagen meer dan achthonderd auto's en de bus rijdt in twaalf minuten naar het centrum. De opzet in compacte velden zorgt dat het terrein ook op rustige dagen gevuld en sociaal veilig aanvoelt.",
    kenmerken: [
      "Directe afslag vanaf de snelweg",
      "Bushalte op maximaal twee minuten lopen van elk vak",
      "Compacte velden die per dagdeel opengaan",
      "Toetsing van het ontwerp op doorstroming"
    ],
    tags: ["p+r", "mobiliteit", "programma van eisen"],
    placeholder: true
  },
  {
    id: "fietsenstalling",
    kort: "Stalling Centrum",
    titel: "Fietsenstalling Centrumzijde",
    type: "fiets",
    plaats: "Voorbeeldstad",
    periode: "2020 tot 2022",
    rol: "Advies stallingsconcept",
    capaciteit: "2100 fietsplekken",
    opdrachtgever: "Gemeente en spoorbeheerder",
    status: "Opgeleverd in 2022",
    intro: "Inpandige fietsenstalling aan de centrumzijde van het station: parkeren gaat verder dan auto's alleen.",
    opgave: "Rond de stationsentree stonden duizenden fietsen op elke vrije meter stoep. De nieuwe stalling moest die stroom opvangen op een kleine voetafdruk, zonder dat fietsers er een omweg voor over moesten hebben.",
    aanpak: "Erwin adviseerde over het stallingsconcept: etagerekken met een comfortabele til-hulp, gangpaden breed genoeg om elkaar te passeren en een in- en uitgang precies op de natuurlijke fietsroute naar de stationsentree. Met een simulatie van de ochtendspits is de maat van de ingang bepaald.",
    resultaat: "De stalling vult zich sinds de opening zonder aansturing vanzelf, omdat hij op de route ligt en sneller is dan zoeken op straat. De stoepen rond de entree zijn weer vrij voor voetgangers.",
    kenmerken: [
      "Etagerekken met til-hulp",
      "Ingang op de natuurlijke fietsroute",
      "Gangpaden op passeerbreedte",
      "Ingangsmaat bepaald met spitssimulatie"
    ],
    tags: ["fiets", "stalling", "station"],
    placeholder: true
  },
  {
    id: "parkeerroute",
    kort: "Parkeer-route",
    titel: "Parkeerroute binnenstad",
    type: "route",
    plaats: "Voorbeeldstad",
    periode: "2019 tot 2020",
    rol: "Verkeerskundig advies",
    capaciteit: "6 garages op 1 route",
    opdrachtgever: "Gemeente Voorbeeldstad",
    status: "In gebruik sinds 2020",
    intro: "Bewegwijzerde parkeerroute die bezoekers langs zes garages leidt, met dynamische borden voor vrije plaatsen.",
    opgave: "Bezoekers reden rondjes door de smalle straten op zoek naar een vrije plek, terwijl er in de garages vrijwel altijd ruimte was. Het zoekverkeer zorgde voor drukte, uitstoot en irritatie bij bewoners.",
    aanpak: "Erwin ontwierp een logische lus langs alle zes garages, met beslispunten waar de automobilist steeds precies een keuze hoeft te maken. Op die punten kwamen dynamische borden met actuele vrije plaatsen, gevoed vanuit de garagesystemen.",
    resultaat: "Het zoekverkeer in de binnenstad is meetbaar afgenomen en de garages worden gelijkmatiger gevuld. Bewoners merken het verschil vooral op koopzaterdagen, wanneer de route het verkeer buiten de woonstraten houdt.",
    kenmerken: [
      "Een lus langs alle zes garages",
      "Dynamische borden met vrije plaatsen",
      "Beslispunten met steeds een keuze",
      "Gevoed vanuit de garagesystemen"
    ],
    tags: ["route", "bewegwijzering", "binnenstad"],
    placeholder: true
  }
];

/* Teksten voor de vakken "Over" en "Contact". Vervang door echte inhoud. */
const OVER_TEKST = "Erwin van Hout werkt aan parkeeroplossingen: garages, terreinen, fietsenstallingen en alles wat daarbij komt kijken. Deze introductietekst is een voorbeeld, vervang hem in js/projects.js door een echte bio.";
const CONTACT_TEKST = "Contactgegevens volgen nog. Vervang deze tekst in js/projects.js door een echt e-mailadres of een link naar LinkedIn.";
