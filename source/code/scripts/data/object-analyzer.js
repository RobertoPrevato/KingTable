/**
 * Object analyzer.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../scripts/utils";

export default class Analyzer {

  /**
   * Returns an object describing the properties of a given item.
   * @return {object}
   */
  describe(o, options) {
    if (_.isArray(o))
      return this.describeList(o, options);
    var schema = {}, x;
    for (x in o) {
      schema[x] = this.getType(o[x]);
    }
    return schema;
  }

  /**
   * Returns an object describing the properties of the items contained by a list.
   * @return {object}
   */
  describeList(a, options) {
    var schema = {};
    options = options || {};
    function typ(o) {
      return o; // TODO: refactor to return object with "nullable" info?
    }
    var l = _.isNumber(options.limit) ? options.limit : a.length;
    for (var i = 0; i < l; i++) {
      var o = this.describe(a[i]);
      for (var x in o) {
        if (_.has(schema, x)) {
          //compare
          if (typ(o[x]) != undefined && typ(schema[x]) != typ(o[x])) {
            if (!typ(schema[x])) {
              schema[x] = typ(o[x]);
            } else {
              //force string type
              schema[x] = "string";
            }
          }
        } else {
          // add new  property
          _.extend(schema, o);
        }
      }
      if (options.lazy && !_.any(schema, (k, v) => {
        return v === undefined;
      })) {
        break;
      }
    }
    return schema;
  }

  /**
   * Returns a string representing a type, in greater detail than normal JS.
   * @return {string}
   */
  getType(o) {
    if (o == null || o == undefined) return;
    if (o instanceof Array) return "array";
    if (o instanceof Date) return "date";
    if (o instanceof RegExp) return "regex";
    return typeof o;
  }

}
