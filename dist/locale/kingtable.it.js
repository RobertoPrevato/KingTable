/**
 * KingTable 2.0.0
 * Italian locale file.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
(function () {

  if (typeof KingTable == "undefined") {
    var message = "KingTable library is not defined. For further details: https://github.com/RobertoPrevato/KingTable/wiki/Errors#39";
    throw new Error(message);
  }

  KingTable.regional.it = {
    "goToDetails": "Dettagli",
    "sortOptions": "Ordinamento",
    "searchSortingRules": "Durante una ricerca testuale, ordina per rilevanza.",
    "advancedFilters": "Filtri avanzati",
    "sortModes": {
      "simple": "Semplice (proprietà singola)",
      "complex": "Complesso (proprietà multiple)"
    },
    "viewsType": {
      "table": "Tabella",
      "gallery": "Galleria"
    },
    "exportFormats": {
      "csv": "Csv",
      "json": "Json",
      "xml": "Xml"
    },
    "columns": "Colonne",
    "export": "Esporta",
    "view": "Vista",
    "views": "Viste",
    "loading": "Caricamento dati",
    "noData": "Nessun oggetto da mostrare",
    "page": "Pagina",
    "resultsPerPage": "Risultati per pagina",
    "results": "Risultati",
    "of": "di",
    "firstPage": "Prima pagina",
    "lastPage": "Ultima pagina",
    "prevPage": "Pagina precedente",
    "nextPage": "Prossima pagina",
    "refresh": "Ricarica",
    "fetchTime": "Dati caricati alle:",
    "anchorTime": "Dati fino alle:",
    "sortAscendingBy": "Ordina per {{name}} crescente",
    "sortDescendingBy": "Ordina per {{name}} decrescente",
    "errorFetchingData": "Si è verificato un errore durante il caricamento dei dati."
  };
})();