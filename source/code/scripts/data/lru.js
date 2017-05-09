/**
 * LRU cache.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../scripts/utils"
import json from "../../scripts/data/json"
import {
  ArgumentNullException
} from "../../scripts/exceptions"

function getStorage(type) {
  if (_.isObject(type)) return type;
  switch (type) {
    case 1:
      return localStorage;
    case 2:
      return sessionStorage;
    default:
      return sessionStorage;
  }
}

export default {

  get: function (name, condition, type, details) {
    if (condition === true) {
      details = true;
      condition = undefined;
    }
    if (type === true) {
      details = true;
      type = undefined;
    }
    var storage = getStorage(type);
    var i, o = storage.getItem(name);
    if (o) {
      try {
        o = json.parse(o);
      } catch (ex) {
        storage.removeItem(name);
        return;
      }
      // set timestamp in each item data
      if (!condition)
        return _.map(o, x => { return details ? x : x.data; });
      var toRemove = [], toReturn;
      var l = o.length;
      for (i = 0; i < l; i++) {
        var ca = o[i];
        if (!ca) continue;
        var data = ca.data, expiration = data.expiration;
        if (_.isNumber(expiration) && expiration > 0) {
          // is the data expired?
          if (new Date().getTime() > expiration) {
            // the item expired, it should be removed
            toRemove.push(ca);
            // skip
            continue;
          }
        }
        if (condition(data)) {
          toReturn = details ? ca : data;
        }
      }
      if (toRemove.length) {
        this.remove(name, x => {
          return toRemove.indexOf(x) > -1;
        });
      }
      return toReturn;
    }
  },

  /**
   * Removes an item from the cache, eventually using a condition.
   */
  remove: function (name, condition, type) {
    var storage = getStorage(type);
    if (!condition) {
      storage.removeItem(name);
      return;
    }
    var i, o = storage.getItem(name);

    if (o) {
      try {
        o = json.parse(o);
      } catch (ex) {
        storage.removeItem(name);
        return;
      }
      var l = o.length;
      var toKeep = [];
      for (i = 0; i < l; i++) {
        var ca = o[i];
        if (!ca) continue;
        var data = ca.data;
        if (!condition(data)) {
          // keep this item
          toKeep.push(ca);
        }
      }
      return storage.setItem(name, json.compose(toKeep));
    }
  },

  set: function (name, value, maxSize, maxAge, type) {
    if (!_.isNumber(maxSize))
      maxSize = 10;
    if (!_.isNumber(maxAge))
      maxAge = -1;
    var storage = getStorage(type);
    var ts = new Date().getTime(), exp = maxAge > 0 ? ts + maxAge : -1;
    var data = {
      ts: ts,
      expiration: exp,
      data: value
    };
    var o = storage.getItem(name);
    if (o) {
      try {
        o = json.parse(o);
      } catch (ex) {
        storage.removeItem(name);
        return this.set(name, value, maxSize);
      }
      if (o.length >= maxSize) {
        // remove oldest item
        o.shift();
      }
      o.push(data);
    } else {
      // new object
      o = [{
        ts: ts,
        expiration: exp,
        data: value
      }];
    }
    return storage.setItem(name, json.compose(o));
  }
}
