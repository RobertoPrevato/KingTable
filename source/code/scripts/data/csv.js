/**
 * Csv format functions.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../scripts/utils"

var TypeHandling = {
  allStrings: 1, // all values are treated as allStrings
  keepType: 2    // types are kept
};

export default {

  default: {
    /**
     * Whether to add BOM
     */
    addBom: true,
    /**
     * Separator to use
     */
    separator: ",",
    /**
     * Whether to add a separator line at the beginning of the file, or not.
     * (May be useful for excel)
     */
    addSeparatorLine: false,
    /**
     * How the types should be handled: allStrings to manage all properties as strings (all will be quoted)
     */
    typeHandling: TypeHandling.keepType
  },

  /**
   * Serializes the given collection in csv format.
   * Assumes that the collection is optimized (the first row contains properties, the other only values)
   * 
   * @param data collection
   * @param options
   */
  serialize(data, options) {
    var o = _.extend({}, this.default, options);

    var re = [],
      push = "push",
      toString = "toString",
      len = "length",
      rep = "replace",
      test = "test",
      sep = o.separator,
      dobquote = "\"",
      typeHandling = o.typeHandling,
      mark = o.addBom ? "\uFEFF" : "";
    //if (o.addSeparatorLine) {
    //  re[push]("sep=" + sep);
    //}
    for (var i = 0, l = data[len]; i < l; i++) {
      var a = [], row = data[i];
      //assume that the first row contains the columns
      for (var k = 0, j = row[len]; k < j; k++) {
        var v = row[k];
        if (v instanceof Date) {
          // TODO: use date utilities.
          // if the value has time, include time; otherwise use only date
          v = v.toLocaleString();
        } else {
          if (typeof v != "string") {
            v = v && v[toString] ? v[toString]() : "";
          }
        }
        //escape quotes - RFC-4180, paragraph "If double-quotes are used to enclose fields, then a double-quote
        //appearing inside a field must be escaped by preceding it with another double quote."
        if (/"/[test](v))
          v = v[rep](/"/g, "\"\"");
        //https://en.wikipedia.org/wiki/Comma-separated_values
        //Fields with embedded commas or double-quote characters must be quoted. (by standard, so even if CsvTypeHandling is different than "AllStrings")
        //1997, Ford, E350, "Super, ""luxurious"" truck"
        //1997, Ford, E350, "Super, luxurious truck"
        if (typeHandling == TypeHandling.allStrings || /"|\n/[test](v) || v.indexOf(sep) > -1)
          v = dobquote + v + dobquote;
        a[push](v);
      }
      re[push](a.join(sep));
    }
    // the only way to make MS Excel work with UTF-8 and specific separator,
    // is to put at the end a tab + separator; and a BOM mark at the beginning
    if (o.addSeparatorLine) {
      re[push]("\t" + sep);
    }
    return mark + (re.join("\n"));
  }
}