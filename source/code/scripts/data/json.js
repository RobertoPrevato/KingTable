/**
 * Proxy functions for built-in JSON API.
 * Proxy functions are used, for example, to remove the asymmetry between
 * -  JSON stringify (creating string representations of dates) and
 * -  JSON parse (NOT parsing dates in ISO format - losing dates).
 *
 * Besides, I HATE the word "stringify"!!!
 *
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../scripts/utils"
import D from "../../scripts/components/date"

export default {
  /**
   * Serializes an object into JSON format.
   */
  compose: function (o, indentation) {
    return JSON.stringify(o, function(k, v) {
      if (v === undefined) { return null; }
      return v;
    }, indentation);
  },

  /**
   * Parses an object represented in JSON format.
   */
  parse: function (s, options) {
    var o = _.extend({
      parseDates: true
    }, options);

    if (!o.parseDates) {
      return JSON.parse(s);
    }

    return JSON.parse(s, function(k, v) {
      if (_.isString(v) && D.looksLikeDate(v)) {
        // check if the value looks like a date and can be parsed
        var a = D.parse(v);
        if (a && D.isValid(a)) {
          return a;
        }
      }
      return v;
    });
  },

  /**
   * Clones an object using JSON.
   * Unlike the normal JSON API, Dates are kept as dates;
   * however, strings that looks like dates becomes dates.
   */
  clone: function (o) {
    return this.parse(this.compose(o));
  }
}
