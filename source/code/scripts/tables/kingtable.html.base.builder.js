/**
 * KingTable base HTML builder.
 * Base class for all HTML builders.
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
import S from "../../scripts/components/string"
import { escapeHtml } from "../../scripts/data/html"
import KingTableBuilder from "../../scripts/tables/kingtable.builder"

export default class KingTableBaseHtmlBuilder extends KingTableBuilder {

  /**
   * Returns an attribute object for an HTML element related to an item.
   * 
   * @param {int} ix 
   */
  getItemAttrObject(ix, item) {
    var o = this.options, deco = o && o.itemDecorator;
    var attr = { 
      "class": "kt-item",
      "data-item-ix": ix  // item index among currently displayed items
    };
    if (deco) {
      var re = deco.call(this, item);
      // TODO: merge class or css option
      return _.extend(attr, re);
    }
    return attr;
  }

  /**
   * Produces a fragment of HTML to highligh a pattern inside a text.
   *
   * @param {string} text: text from which to produce an HTML fragment.
   * @param {RegExp} pattern: search pattern.
   */
  highlight(text, pattern) {
    if (!text) return "";
    if (!(pattern instanceof RegExp)) {
      // obtain from table
      var table = this.table;
      var pattern = table.searchText ? table.filters.getRuleByKey("search").value : null;
      if (!pattern) return text;
    }

    var diacritics = S.findDiacritics(text);
    var hasDiacritics = diacritics.length, textWithoutDiacritics;

    if (hasDiacritics) {
      // remove diacritics before finding matches
      textWithoutDiacritics = S.normalize(text);
    } else {
      textWithoutDiacritics = text;
    }
    // find all matches at their index, this is required to properly escape html characters
    var matches = [];
    textWithoutDiacritics.replace(pattern, function (value) {
      var index = arguments[arguments.length-2];
      // NB: if the string contained diacritics, we need to restore
      // only those that appeared in the same place of the original string
      matches.push({
        i: index,
        val: hasDiacritics ? S.restoreDiacritics(value, diacritics, index) : value // put back diacritics where they were
      });
    });

    var s = "", j = 0, m, val;
    for (var i = 0, l = matches.length; i < l; i++) {
      m = matches[i];
      val = m.val;
      var portion = text.substring(j, m.i);
      s += escapeHtml(portion); // escape the portion that is outside of the highlight
      j = m.i + val.length;
      s += "<span class=\"kt-search-highlight\">" + escapeHtml(val) + "</span>";
    }
    if (j < text.length) {
      s += escapeHtml(text.substr(j));
    }
    return s;
  }
}
