/**
 * Number utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

export default {
  format: function (v, options) {
    if (!options) options = {};
    //return v.toString();
    //
    // TODO: if available, use the Intl.NumberFormat class!!
    // if not, ask for a Polyfill! But in console.info.
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
    if (typeof Intl !== "undefined") {
      return Intl.NumberFormat(options.locale || "en-GB").format(v);
    }
    return (v || "").toString();
    //
    // console.log(new Intl.NumberFormat('pl', { minimumFractionDigits: 2 }).format(123123.000));
  }
}
