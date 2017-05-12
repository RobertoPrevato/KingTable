/**
 * String utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
const REP = "replace"
const INVALID_FILLER = "invalid filler (must be as single character)"
const LENGTH_MUST_POSITIVE = "length must be > 0"
import {
  ArgumentException
} from "../../scripts/exceptions"
import _ from "../../scripts/utils.js"
import normalize from "../../scripts/components/string.normalize"
const isString = _.isString

function toLower(s) {
  return s.toLowerCase();
}

function toUpper(s) {
  return s.toUpperCase();
}

export default {

  normalize,

  replaceAt(s, index, replacement) {
    if (!s) return s;
    return s.substr(0, index) + replacement + s.substr(index + replacement.length);
  },

  findDiacritics(s) {
    if (!s) return s;
    var rx = /[^\u0000-\u007E]/gm;
    var a = [], m;
    while (m = rx.exec(s)) {
      a.push({
        i: m.index,
        v: m[0]
      });
    }
    return a;
  },

  /**
   * Restore diacritics in normalized strings.
   */
  restoreDiacritics(s, diacritics, offset) {
    if (!s) return s;
    var l = diacritics.length;
    if (!l) return s;
    if (offset === undefined) offset = 0;
    var endIndex = offset + s.length - 1; // NB: we only restore diacritics that appears in the string portion
    var d;
    for (var i = 0; i < l; i++) {
      d = diacritics[i];
      if (d.i > endIndex) break;
      s = this.replaceAt(s, d.i - offset, d.v);
    }
    return s;
  },

  /**
   * Returns a new string in snake_case, from the given string.
   */
  snakeCase(s) {
    if (!s) return s;
    return this.removeMultipleSpaces(s.trim())
      [REP](/[^a-zA-Z0-9]/g, "_")
      [REP](/([a-z])[\s\-]?([A-Z])/g, (a, b, c) => { return b + "_" + toLower(c); })
      [REP](/([A-Z]+)/g, (a, b) => { return toLower(b); })
      [REP](/_{2,}/g, "_");
  },

  /**
   * Returns a new string in kebab-case, from the given string.
   */
  kebabCase(s) {
    if (!s) return "";
    return this.removeMultipleSpaces(s.trim())
      [REP](/[^a-zA-Z0-9]/g, "-")
      [REP](/([a-z])[\s\-]?([A-Z])/g, (a, b, c) => { return b + "-" + toLower(c); })
      [REP](/([A-Z]+)/g, (a, b) => { return toLower(b); })
      [REP](/-{2,}/g, "-");
  },

  /**
   * Returns a new string in camelCase, from the given string.
   */
  camelCase(s) {
    if (!s) return s;
    return this.removeMultipleSpaces(s.trim())
      [REP](/[^a-zA-Z0-9]+([a-zA-Z])?/g, (a, b) => { return toUpper(b); })
      [REP](/([a-z])[\s\-]?([A-Z])/g, (a, b, c) => { return b + toUpper(c); })
      [REP](/^([A-Z]+)/g, (a, b) => { return toLower(b); });
  },

  format(s) {
    var args = Array.prototype.slice.call(arguments, 1);
      return s[REP](/{(\d+)}/g, (match, i) => {
      return typeof args[i] != "undefined" ? args[i] : match;
    });
  },

  /**
   * Returns a string from the given value, in any case.
   */
  getString(val) {
    if (typeof val == "string") return val;
    if (val.toString) return val.toString();
    return "";
  },

  /**
   * A string compare function that supports sorting of special characters.
   *
   * @param a the first string to compare
   * @param b the second string to compare
   * @param order ascending or descending
   * @param options (caseSensitive; characters option)
   * @returns {*}
   */
  compare(a, b, order, options) {
    order = _.isNumber(order) ? order : (/^asc/i.test(order) ? 1 : -1);
    var o = _.extend({
      ci: true  // case insensitive
    }, options);
    if (a && !b) return order;
    if (!a && b) return -order;
    if (!a && !b) return 0;
    if (a == b) return 0;
    if (!_.isString(a)) a = a.toString();
    if (!_.isString(b)) b = b.toString();
    if (o.ci) {
      a = a.toLowerCase();
      b = b.toLowerCase();
    }
    return normalize(a) < normalize(b) ? -order : order;
  },

  ofLength(c, l) {
    return new Array(l + 1).join(c);
  },

  /**
   * Python-like center function: returns a new string of the given length, centering the given string.
   *
   * @param s: string to center
   * @param length: output string length
   * @param filler: filler character
   * @returns {String}
   */
  center(s, length, filler) {
    if (length <= 0)
      throw new Error(LENGTH_MUST_POSITIVE);
    if (!filler) filler = " ";
    if (!s)
      return this.ofLength(filler, length);
    if (filler.length != 1) throw new Error(INVALID_FILLER);
    var halfLength = Math.floor((length - s.length) / 2);
    var startHalf = this.ofLength(filler, halfLength);
    var left = false;
    var output = startHalf + s + startHalf;
    while (output.length < length) {
      if (left) {
          output = fillter + output;
      } else {
          output = output + filler;
      }
      left = !left;
    }
    return output;
  },

  /**
   * Returns a value indicating whether the given string starts with the second
   * given string.
   * 
   * @param {string} String to check
   * @param {string} Start value
   * @param {boolean} Case insensitive?
   */
  startsWith(a, b, ci) {
    if (!a || !b) return false;
    if (ci) {
      return a.toLowerCase().indexOf(b) == 0;
    }
    return a.indexOf(b) == 0;
  },

  /**
   * Returns a new string of the given length, right filled with the given
   * filler character.
   */
  ljust(s, length, filler) {
    if (length <= 0)
      throw new Error(LENGTH_MUST_POSITIVE);
    if (!filler) filler = " ";
    if (!s)
      return this.ofLength(filler, length);
    if (filler.length != 1)
      throw new Error(INVALID_FILLER);
    while (s.length < length)
      s = s + filler;
    return s;
  },

  /**
   * Returns a new string of the given length, left filled with the given
   * filler character.
   */
  rjust(s, length, filler) {
    if (length <= 0)
      throw new Error(LENGTH_MUST_POSITIVE);
    if (!filler) filler = " ";
    if (!s)
      return this.ofLength(filler, length);
    if (filler.length != 1)
      throw new Error(INVALID_FILLER);
    while (s.length < length)
      s = filler + s;
    return s;
  },

  removeMultipleSpaces(s) {
    return s[REP](/\s{2,}/g, " ");
  },

  removeLeadingSpaces(s) {
    return s[REP](/^\s+|\s+$/, "");
  },

  /**
   * Fixes the width of all lines inside the given text, using the given filler.
   *
   * @param {string} s - text of which lines should be normalized
   * @param {string} [filler= ] - filler to use
   */
  fixWidth(s, filler) {
    if (!s) return s;
    if (!filler) filler = " ";
    var lines, wasString;
    if (_.isString(s)) {
      lines = s.split(/\n/g);
      wasString = true;
    } else if (_.isArray(s)) {
      lines = _.clone(s);
      wasString = false;
    } else {
      ArgumentException("s", "expected string or string[]");
    }
    var line, l = lines.length, a = [];
    // obtain the lines max length
    var maxLength = _.max(lines, x => { return x.length; });
    for (var i = 0; i < l; i++) {
      line = lines[i];
      while (line.length < maxLength) {
        line += filler;
      }
      lines[i] = line;
    }
    return wasString ? lines.join("\n") : lines;
  },

  repeat(s, l) {
    return new Array(l+1).join(s);
  },

  /**
   * Returns the width of all lines inside the given string.
   */
  linesWidths(s) {
    if (!s) return 0;
    var lines;
    if (_.isString(s)) {
      lines = s.split(/\n/g);
    } else if (_.isArray(s)) {
      lines = _.clone(s);
    } else {
      ArgumentException("s", "expected string or string[]");
    }
    return _.map(lines, x => { return x.length; });
  }
}
