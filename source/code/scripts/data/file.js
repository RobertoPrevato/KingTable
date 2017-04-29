/**
 * File utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

export default {
  /**
   * Returns a value indicating whether the client side export is supported
   * by the client, or not.
   */
  supportsCsExport: function () {
    return navigator.msSaveBlob || (function () {
      var link = document.createElement("a");
      return link.download !== undefined;
    })();
  },

  /**
   * Exports a file; prompting the user for download.
   * 
   * @param filename
   * @param lines
   */
  exportfile: function (filename, text, type) {
    var setAttribute = "setAttribute", msSaveBlob = "msSaveBlob";
    var blob = new Blob([text], { type: type });
    if (navigator[msSaveBlob]) { // IE 10+
      navigator[msSaveBlob](blob, filename);
    } else {
      var link = document.createElement("a");
      if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob);
        link[setAttribute]("href", url);
        link[setAttribute]("download", filename);
        var style = {
          visibility: "hidden",
          position: "absolute",
          left: "-9999px"
        };
        for (var x in style)
          link.style[x] = style[x];
        //inject
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }
}