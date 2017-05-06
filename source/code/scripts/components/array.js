/**
 * Array utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../scripts/utils"
import StringUtils from "../../scripts/components/string"
import R from "../../scripts/components/regex"
import Reflection from "../../scripts/components/reflection"
import {
  ArgumentException,
  TypeException
} from "../../scripts/exceptions"

/**
 * Normalizes a sort by condition.
 */
function normalizeOrder(props) {
  var l = props.length;
  for (var i = 0; i < l; i++) {
    var p = props[i], name = p[0], order = p[1];
    if (!_.isNumber(order) && !/^asc|^desc/i.test(order)) {
      ArgumentException(`The sort order '${order}' for '${name}' is not valid (it must be /^asc|^desc/i).`)
    }
    p[1] = _.isNumber(order) ? order : (/^asc/i.test(order) ? 1 : -1);
  }
  return props;
}

/**
 * Parses a string, possibly represented with thousands separators,
 * decimal separators different than JS default.
 */
function parseAnyNumber(s) {
  var parts = s.split(/([\.\,]\d+)$/);
  var integralPart = parts[0],
    decimalPart = parts[1],
    a = 0;
  if (integralPart) {
    a = parseInt(integralPart.replace(/\D/g, ""));
  }
  if (decimalPart) {
    a += parseFloat(decimalPart.replace(/\,/g, "."));
  }
  return /^\s?-/.test(s) ? -a : a;
}

/**
 * Returns a value indicating whether the given string looks sortable as a number.
 * If true, returns a parsed number.
 */
function lookSortableAsNumber(s) {
  if (!_.isString(s)) {
    TypeException("s", "string");
  }
  var m = s.match(/[-+~]?([0-9]{1,3}(?:[,\s\.]{1}[0-9]{3})*(?:[\.|\,]{1}[0-9]+)?)/g);
  if (m && m.length == 1) {
    if (/(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8})$/.test(s)) {
      // hexadecimal string: alphabetical order is fine
      return false;
    }
    // Numbers are checked only if there is a single match in the string.
    // how many digits compared to other letters?
    var nonNumbers = s.match(/[^0-9\.\,\s]/g).length;
    if (nonNumbers > 6) {
      // there are too many characters that are not numbers or separators;
      // the string must be most probably sorted in alphabetical order
      return false;
    }
    var numericPart = m[0];
    var numVal = parseAnyNumber(numericPart);
    return numVal;
  }
  return false;
}

var options = {
  autoParseNumbers: true,
  ci: true
};

export default {

  normalizeOrder,

  lookSortableAsNumber,

  options,

  /**
   * Parses a sort by string, converting it into an array of arrays.
   * 
   * @param {string} s, string to sort
   */
  parseSortBy(s) {
    if (!s) return;
    var parts = s.split(/\s*,\s*/g);
    return _.map(parts, part => {
      var a = part.split(/\s/), name = a[0], order = a[1] || "asc";
      return [name, StringUtils.startsWith(order, "asc", true) ? 1 : -1];
    });
  },

  humanSortBy(a, verbose) {
    if (!a || !a.length) return "";
    return _.map(a, part => {
      var name = part[0], order = part[1];
      if (order === 1) {
        return verbose ? (name + " asc") : name;
      }
      return name + " desc";
    }).join(", ");
  },

  /**
   * Gets sort criteria from given arguments.
   */
  getSortCriteria(args) {
    var al = args.length, props;
    
    if (args.length == 1) {
      var firstParameter = args[0];
      if (_.isString(firstParameter) && firstParameter.search(/,|\s/) > -1)
      return this.parseSortBy(firstParameter);
    }

    if (al > 1) {
      // passing multiple property names sortBy(a, "aa", "bb", "cc");
      var a = _.toArray(args);
      props = _.map(a, x => {
        return this.normalizeSortByValue(x, true);
      });
    } else {
      // expect a single string; or an object
      props = this.normalizeSortByValue(args[0]);
    }
    return props;
  },

  /**
   * Normalizes a sort by condition.
   */
  normalizeSortByValue(a, multi) {
    if (_.isString(a)) {
      return multi ? [a, "asc"] : [[a, "asc"]];
    }
    if (_.isArray(a)) {
      if (_.isArray(a[0]))
        return a; // Hej, here we can expect the user of the function is passing a proper parameter.
      return _.map(a, c => { return this.normalizeSortByValue(c, true); });
    }
    if (_.isPlainObject(a)) {
      var x, b = [];
      for (x in a) {
        b.push([x, a[x]]);
      }
      return b;
    }
    TypeException("sort", "string | [] | {}")
  },

  /**
   * Compares two strings, but also checking if they look like numbers.
   * In this case, they are compared as numbers.
   */
  compareStrings(a, b, order) {
    if (this.options.autoParseNumbers) {
      //
      // check if the strings contain numbers
      //
      var aVal = lookSortableAsNumber(a), bVal = lookSortableAsNumber(b);
      // numbers win
      if (aVal !== false || bVal !== false) {
        // sort as numbers: this is most probably what the programmer desires
        if (aVal === bVal) return 0;
        if (aVal !== false && b === false) return order;
        if (aVal === false && b !== false) return -order;
        if (aVal < bVal) return -order;
        if (aVal > bVal) return order;
      }
    }
    return StringUtils.compare(a, b, order, this.options);
  },

  /**
   * Sorts an array of items by one or more properties.
   *
   * @param ar: array to sort
   * @param {(string|string[]|objects)} sort: object describing
   * @param order: ascending / descending
   */
  sortBy(ar) {
    if (!_.isArray(ar))
      TypeException("ar", "array");

    var al = arguments.length,
      args = _.toArray(arguments).slice(1, al),
      props = this.getSortCriteria(args);
    props = normalizeOrder(props);
    var l = props.length;
    // Obtain sort by in this shape:
    // [["a", "asc"], ["b", "asc"]]
    // since EcmaScript objects are not guaranteed by standard to be ordered dictionaries
    var isString = _.isString;
    var compareStrings = this.compareStrings.bind(this);
    var und = undefined, nu = null;
    ar.sort(function (a, b) {
      if (a === b) return 0;
      if (a !== und && b === und) return -1;
      if (a === und && b !== und) return 1;
      if (a !== nu && b === nu) return -1;
      if (a === nu && b !== nu) return 1;
      // NB: by design, the order by properties are expected to be in order of importance
      //
      for (var i = 0; i < l; i++) {
        var p = props[i], name = p[0], order = p[1];
        var c = a[name], d = b[name];
        if (c === d) continue; // property is identical, continue to next
        if (c !== und && d === und) return -order;
        if (c === und && d !== und) return order;
        if (c !== nu && d === nu) return -order;
        if (c === nu && d !== nu) return order;
        if (c && !d) return order;
        if (!c && d) return -order;
        if (isString(c) && isString(d))
          //sort, supporting special characters
          return compareStrings(c, d, order);
        if (c < d) return -order;
        if (c > d) return order;
      }
      return 0;
    });
    return ar;
  },

  /**
   * Sorts an array of items by a single property.
   *
   * @param arr: array to sort
   * @param property: name of the sort property
   * @param order: ascending / descending
   */
  sortByProperty(arr, property, order) {
    if (!_.isArray(arr))
      TypeException("arr", "array");
    if (!_.isString(property))
      TypeException("property", "string");
    if (!_.isUnd(order))
      order = "asc";
    order = _.isNumber(order) ? order : (/^asc/i.test(order) ? 1 : -1);
    var o = {};
    o[property] = order;
    return this.sortBy(arr, o);
  },

  /**
   * Searches inside a collection of items by a string property, using the given pattern,
   * sorting the results by number of matches, first index and number of recourrences
  */
  searchByStringProperty(options) {
    _.require(options, ["pattern", "collection", "property"]);
    return this.searchByStringProperties(_.extend(options, {
      properties: [options.property]
    }));
  },

  /**
   * Searches inside a collection of items by all string properties.
   */
  search(a) {
    if (!a || !a.length) return a;
    var l = arguments.length;
    if (l < 2) return a;
    var args = _.toArray(arguments).slice(1, l);
    var props = [], x, item, isString = _.isString;
    for (var i = 0, l = a.length; i < l; i++) {
      item = a[i];
      for (x in item) {
        if (isString(item[x]) && props.indexOf(x) == -1) {
          props.push(x);
        }
      }
    }
    _.each(args, x => { if (!_.isString(x)) { ArgumentException(`Unexpected parameter ${x}`); }});
    return this.searchByStringProperties({
      collection: a,
      pattern: R.getPatternFromStrings(args),
      properties: props,
      normalize: true
    });
  },

  /**
   * Searches inside a collection of items by certains string properties, using the given pattern,
   * sorting the results by number of matches, first index and number of recourrences.
   */
  searchByStringProperties(options) {
    var defaults = {
      order: "asc",
      limit: null,
      keepSearchDetails: false,
      getResults: function (a) {
        if (this.decorate) {
          // add information about which property 
          for (var i = 0, l = a.length; i < l; i++) {
            var item = a[i];
            var matches = _.where(item.matches, m => { return m != null; });
            a[i].obj.__search_matches__ =  matches.length ? _.map(matches, x => {
              return x.matchedProperty;
            }) : [];
          }
        }
        if (this.keepSearchDetails) {
          return a;
        }
        var b = [];
        for (var i = 0, l = a.length; i < l; i++) {
          b.push(a[i].obj);
        }
        return b;
      },
      normalize: true,
      decorate: false // whether to decorate source objects with list of properties that 
    };
    var o = _.extend({}, defaults, options);
    if (!o.order || !o.order.match(/asc|ascending|desc|descending/i)) o.order = "asc";
    var matches = [], rx = o.pattern;
    if (!(rx instanceof RegExp)) {
      if (_.isString(rx)) {
        rx = R.getSearchPattern(rx);
      } else {
        throw new Error("the pattern must be a string or a regular expression");
      }
    }
    var properties = o.properties, len = "length", normalize = o.normalize;
    var collection = o.collection;
    var isArray = _.isArray, isNumber = _.isNumber, flatten = _.flatten, map = _.map;
    for (var i = 0, l = collection[len]; i < l; i++) {
      var obj = collection[i], objmatches = [], totalMatches = 0;

      for (var k = 0, t = properties[len]; k < t; k++) {
        var prop = properties[k],
            val = Reflection.getPropertyValue(obj, prop);

        if (!val) continue;
        if (!val.match) val = val.toString();

        if (isArray(val)) {
          if (!val[len]) {
            continue;
          }
          val = flatten(val);
          var mm = [], firstIndex;
          for (var a = 0, l = val[len]; a < l; a++) {
            var match = val[a].match(rx);
            if (match) {
              if (!isNumber(firstIndex)) {
                firstIndex = a;
              }
              mm.push(match);
            }
          }
          if (mm[len]) {
            objmatches[k] = {
              matchedProperty: prop,
              indexes: [firstIndex],
              recourrences: flatten(mm)[len]
            };
          }
          continue;
        }

        // normalize value
        if (normalize) {
          val = StringUtils.normalize(val);
        }
        var match = val.match(rx);
        if (match) {
          // clone rx
          var rxClone = new RegExp(rx.source, "gi"), m, indexes = [];
          while (m = rxClone.exec(val)) {
            indexes.push(m.index);
          }
          totalMatches += match[len];
          objmatches[k] = {
            matchValue: val,
            matchedProperty: prop,
            indexes: indexes,
            recourrences: match[len]
          };
        }
      }

      if (objmatches[len]) {
        matches.push({
          obj: obj,
          matches: objmatches,
          totalMatches: totalMatches
        });
      }
    }
    var order = o.order.match(/asc|ascending/i) ? 1 : -1,
        lower = "toLowerCase",
        str   = "toString",
        mat   = "matches",
        matp  = "matchedProperty",
        iof   = "indexOf",
        hasp  = "hasOwnProperty",
        rec   = "recourrences",
        obj   = "obj",
        ixs   = "indexes",
        total = "totalMatches";
    //sort the entire collection of matches
    matches.sort(function (a, b) {

      // if one item has more matches than the other, it comes first
      if (a[total] > b[total]) return -order;
      if (a[total] < b[total]) return order;

      for (var k = 0, l = properties[len]; k < l; k++) {
        var am = a[mat][k], bm = b[mat][k];

        // if both objects lack matches in this property, continue
        if (!am && !bm) continue;

        // properties are in order of importance,
        // so if one object has matches in this property and the other does not,
        // it comes first by definition
        if (am && !bm) return -order;
        if (!am && bm) return order;

        // sort by indexes, applies the following rules only if one word started with the search
        var minA = _.min(am[ixs]), minB = _.min(bm[ixs]);
        if (minA < minB) return -order;
        if (minA > minB) return order;
        if (am[ixs][iof](minA) < bm[ixs][iof](minB)) return -order;
        if (am[ixs][iof](minA) > bm[ixs][iof](minB)) return order;


        var ao = a[obj], bo = b[obj];
        //check if objects have matched property because we are supporting search inside arrays and objects subproperties
        if (ao[hasp](am[matp]) && bo[hasp](bm[matp])) {
          //sort by alphabetical order
          if (ao[am[matp]][str]()[lower]() < bo[bm[matp]][str]()[lower]()) return -order;
          if (ao[am[matp]][str]()[lower]() > bo[bm[matp]][str]()[lower]()) return order;
        }

        //order by the number of recourrences
        if (am[rec] > bm[rec]) return -order;
        if (am[rec] < bm[rec]) return order;
      }
      return 0;
    });
    var limit = o.limit;
    if (limit)
      matches = matches.slice(0, _.min(limit, matches[len]));
    return o.getResults(matches);
  }
}
