/**
 * Regex utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../scripts/utils.js"

export default {

  /**
   * Gets a search pattern from a list of strings.
   */
  getPatternFromStrings(a) {
    if (!a || !a.length)
      throw new Error("invalid parameter");
    var s = _.map(a, x => {
      return this.escapeCharsForRegex(x);
    }).join("|");
    return new RegExp("(" + s + ")", "mgi");
  },

  /**
   * Prepares a string to use it to declare a regular expression.
   */
  escapeCharsForRegex(s) {
    if (typeof s != "string") {
      return "";
    }
    //characters to escape in regular expressions
    return s.replace(/([\^\$\.\(\)\[\]\?\!\*\+\{\}\|\/\\])/g, "\\$1").replace(/\s/g, "\\s");
  },

  /**
   * Gets a regular expression for a search pattern,
   * returns undefined if the regular expression is not valid.
   */
  getSearchPattern(s, options) {
    if (!s) return /.+/mgi;
    options = _.extend({ searchMode: "fullstring" }, options || {});
    switch (options.searchMode.toLowerCase()) {
      case "splitwords":
        throw new Error("Not implemented")

      case "fullstring":
        //escape characters
        s = this.escapeCharsForRegex(s);
        try {
          return new RegExp("(" + s + ")", "mgi");
        } catch (ex) {
          //this should not happen
          return;
        }
      break;
      default:
        throw "invalid searchMode";
    }
  },

  /**
   * Gets a regular expression for a search match pattern.
   */
  getMatchPattern(s) {
    if (!s) { return /.+/mg; }
    s = this.escapeCharsForRegex(s);
    return new RegExp(s, "i");
  }
}
