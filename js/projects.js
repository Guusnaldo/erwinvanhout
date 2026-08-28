/*
 * Projectdata voor de portfolio-parkeerplaats.
 *
 * LET OP: dit zijn voorbeeldprojecten. Vervang de inhoud hieronder door
 * echte projecten van Erwin. Zet `placeholder` op false (of verwijder de
 * regel) zodra de inhoud klopt; zolang die op true staat toont de site
 * een "voorbeeld"-label bij het project.
 *
 * Velden:
 *   id      unieke sleutel (wordt gebruikt voor voortgang in localStorage)
 *   kort    korte naam, wordt op het wegdek in het parkeervak geschilderd
 *   titel   volledige projectnaam in het detailvenster
 *   plaats  plaatsnaam
 *   jaar    jaartal of periode (tekst)
 *   rol     rol van Erwin in het project
 *   cijfer  kerncijfer, bijvoorbeeld aantal parkeerplaatsen
 *   tekst   korte omschrijving (2 a 4 zinnen)
 *   tags    lijst met trefwoorden
 */
const PROJECTS = [
  {
    id: "stationskwartier",
    kort: "Stations-kwartier",
    titel: "Parkeergarage Stationskwartier",
    plaats: "Voorbeeldstad",
    jaar: "2021",
    rol: "Ontwerp en advies",
    cijfer: "± 420 parkeerplaatsen",
    tekst: "Nieuwe openbare garage naast het station, met dubbel grondgebruik voor bewoners en treinreizigers. Erwin adviseerde over de indeling, de rijroutes en de capaciteitsverdeling per doelgroep.",
    tags: ["garage", "ov-knooppunt", "dubbelgebruik"],
    placeholder: true
  },
  {
    id: "marktplein",
    kort: "Marktplein",
    titel: "Ondergrondse garage Marktplein",
    plaats: "Voorbeeldstad",
    jaar: "2023",
    rol: "Functioneel ontwerp",
    cijfer: "± 310 parkeerplaatsen",
    tekst: "Tweelaagse ondergrondse garage onder een vernieuwd marktplein. Het maaiveld kwam vrij voor voetgangers en terrassen; de garage kreeg een compacte entree in de gevelwand.",
    tags: ["ondergronds", "binnenstad", "herinrichting"],
    placeholder: true
  },
  {
    id: "ziekenhuis-noord",
    kort: "Ziekenhuis Noord",
    titel: "Parkeerterrein Ziekenhuis Noord",
    plaats: "Voorbeelddorp",
    jaar: "2019",
    rol: "Capaciteits- en routeadvies",
    cijfer: "± 650 parkeerplaatsen",
    tekst: "Uitbreiding en herindeling van het bezoekersterrein bij een regionaal ziekenhuis. Aparte routes voor bezoekers, personeel en kiss-and-ride, met kortere loopafstanden naar de hoofdentree.",
    tags: ["terrein", "zorg", "routering"],
    placeholder: true
  },
  {
    id: "transferium",
    kort: "Transferium A0",
    titel: "Transferium A0",
    plaats: "Voorbeeldstad",
    jaar: "2018",
    rol: "Programma van eisen",
    cijfer: "± 900 parkeerplaatsen",
    tekst: "P+R-locatie aan de rand van de stad met een snelle busverbinding naar het centrum. Erwin stelde het programma van eisen op en toetste het ontwerp op doorstroming en vindbaarheid.",
    tags: ["p+r", "mobiliteit", "pve"],
    placeholder: true
  },
  {
    id: "fietsenstalling",
    kort: "Stalling Centrum",
    titel: "Fietsenstalling Centrumzijde",
    plaats: "Voorbeeldstad",
    jaar: "2022",
    rol: "Advies stallingsconcept",
    cijfer: "± 2100 fietsplekken",
    tekst: "Inpandige fietsenstalling aan de centrumzijde van het station. Parkeren gaat verder dan auto's: hier lag de puzzel in etagerekken, brede gangpaden en een logische in- en uitgang.",
    tags: ["fiets", "stalling", "station"],
    placeholder: true
  },
  {
    id: "parkeerroute",
    kort: "Parkeer-route",
    titel: "Parkeerroute binnenstad",
    plaats: "Voorbeeldstad",
    jaar: "2020",
    rol: "Verkeerskundig advies",
    cijfer: "6 garages op 1 route",
    tekst: "Nieuwe bewegwijzerde parkeerroute die bezoekers langs zes garages leidt, met dynamische borden voor vrije plaatsen. Minder zoekverkeer in de smalle straten van de binnenstad.",
    tags: ["route", "bewegwijzering", "binnenstad"],
    placeholder: true
  }
];

/* Teksten voor de vakken "Over" en "Contact". Vervang door echte inhoud. */
const OVER_TEKST = "Erwin van Hout werkt aan parkeeroplossingen: garages, terreinen en alles wat daarbij komt kijken. Deze introductietekst is een voorbeeld, vervang hem in js/projects.js door een echte bio.";
const CONTACT_TEKST = "Contactgegevens volgen nog. Vervang deze tekst in js/projects.js door een echt e-mailadres of een link naar LinkedIn.";
