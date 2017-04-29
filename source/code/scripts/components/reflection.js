/**
 * Reflection utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../scripts/utils"

export default {
   // gets value or values of a given object, from a name or namespace (example: "dog.name")
  getPropertyValue(o, name) {
    var a = name.split("."), x = o, p;
    while (p = a.shift()) {
      if (_.has(x, p)) {
        x = x[p];
      }
      if (_.isArray(x)) {
        break;
      }
    }
    if (_.isArray(x)) {
      if (!a.length) {
        return x;
      }
      return this.getCollectionPropertiesValue(x, a.join("."));
    }
    return x;
  },

  // gets properties values from a given collection
  getCollectionPropertiesValue(collection, name, includeEmptyValues) {
    if (!name) {
      return collection;
    }
    if (typeof includeEmptyValues != "boolean") {
      includeEmptyValues = false;
    }
    var a = name.split("."), values = [];
    for (var i = 0, l = collection.length; i < l; i++) {
      var o = collection[i];

      if (!_.has(o, a[0])) {
        if (includeEmptyValues) {
          values.push(null);
        }
        continue;
      }
      if (_.isArray(o)) {
        var foundColl = this.getCollectionPropertiesValue(o, name);
        if (includeEmptyValues || foundColl.length) {
          values.push(foundColl);
        }
      } else if (_.isPlainObject(o)) {
        var foundVal = this.getPropertyValue(o, name);
        if (includeEmptyValues || this.validateValue(foundVal)) {
          values.push(foundVal);
        }
      } else {
        if (includeEmptyValues || this.validateValue(o)) {
          values.push(o);
        }
      }
    }
    return values;
  },

  // returns true if the object has a significant value, false otherwise
  validateValue(o) {
    if (!o) return false;
    if (_.isArray(o)) {
      return !!o.length;
    }
    return true;
  }
}
