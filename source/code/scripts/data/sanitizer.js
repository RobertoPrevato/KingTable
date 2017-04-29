/**
 * Strings sanitizer.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../scripts/utils";

export default class Sanitizer {

  sanitize(o) {
    var x;
    for (x in o) {
      if (_.isString(o[x])) {
        o[x] = this.escape(o[x]);
      } else if (_.isObject(o[x])) {
        if (_.isArray(o[x])) {
          for (var i = 0, l = o[x].length; i < l; i++) {
            o[x][i] = this.sanitize(o[x][i]);
          }
        } else {
          o[x] = this.sanitize(o[x]);
        }
      }
    }
    return o;
  }

escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
 }

  escape(s) {
    return s ? this.escapeHtml(s) : "";
  }
}
