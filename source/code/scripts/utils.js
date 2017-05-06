/**
 * Generic utilities to work with objects and functions.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
const OBJECT = "object",
  STRING = "string",
  NUMBER = "number",
  FUNCTION = "function",
  LEN = "length",
  REP = "replace";
import {
  ArgumentException,
  ArgumentNullException
} from "../scripts/exceptions"
function map(a, fn) {
  if (!a || !a[LEN]) {
    if (isPlainObject(a)) {
      var x, b = [];
      for (x in a) {
        b.push(fn(x, a[x]));
      }
      return b;
    }
  };
  var b = [];
  for (var i = 0, l = a[LEN]; i < l; i++)
    b.push(fn(a[i]));
  return b;
}
function each(a, fn) {
  if (isPlainObject(a)) {
    for (var x in a)
      fn(a[x], x);
    return a;
  }
  if (!a || !a[LEN]) return a;
  for (var i = 0, l = a[LEN]; i < l; i++)
    fn(a[i], i);
}
function exec(fn, j) {
  for (var i = 0; i < j; i++)
    fn(i);
}
function isString(s) {
  return typeof s == STRING;
}
function isNumber(o) {
  // in JavaScript NaN (Not a Number) if of type "number" (curious..)
  // However, when checking if something is a number it's desirable to return
  // false if it is NaN!
  if (isNaN(o)) {
    return false;
  }
  return typeof o == NUMBER;
}
function isFunction(o) {
  return typeof o == FUNCTION;
}
function isObject(o) {
  return typeof o == OBJECT;
}
function isArray(o) {
  return o instanceof Array;
}
function isDate(o) {
  return o instanceof Date;
}
function isRegExp(o) {
  return o instanceof RegExp;
}
function isPlainObject(o) {
  return typeof o == OBJECT && o !== null && o.constructor == Object;
}
function isEmpty(o) {
  if (!o) return true;
  if (isArray(o)) {
    return o.length == 0;
  }
  if (isPlainObject(o)) {
    var x;
    for (x in o) {
      return false;
    }
    return true;
  }
  if (isString(o)) {
    return o === "";
  }
  if (isNumber(o)) {
    return o === 0;
  }
  throw new Error("invalid argument");
}
function hasOwnProperty(o, n) {
  return o && o.hasOwnProperty(n);
}
function upper(s) {
  return s.toUpperCase();
}
function lower(s) {
  return s.toLowerCase();
}
function first(a, fn) {
  if (!fn) {
    return a ? a[0] : undefined;
  }
  for (var i = 0, l = a[LEN]; i < l; i++) {
    if (fn(a[i])) return a[i];
  }
}
function toArray(a) {
  if (isArray(a)) return a;
  if (typeof a == OBJECT && a[LEN])
    return map(a, function (o) { return o; });
  return Array.prototype.slice.call(arguments);
}
function flatten(a) {
  if (isArray(a))
    return [].concat.apply([], map(a, flatten));
  return a;
}
var _id = -1;
function uniqueId(name) {
  _id++;
  return (name || "id") + _id;
}
function resetSeed() {
  _id = -1;
}
function keys(o) {
  if (!o) return [];
  var x, a = [];
  for (x in o) {
    a.push(x);
  }
  return a;
}
function values(o) {
  if (!o) return [];
  var x, a = [];
  for (x in o) {
    a.push(o[x]);
  }
  return a;
}
function minus(o, props) {
  if (!o) return o;
  if (!props) props = [];
  var a = {}, x;
  for (x in o) {
    if (props.indexOf(x) == -1) {
      a[x] = o[x];
    }
  }
  return a;
}
function isUnd(x) {
  return typeof x === "undefined";
}
/**
 * Deep clones an item (except function types).
 */
function clone(o) {
  var x, a;
  if (o === null) return null;
  if (o === undefined) return undefined;
  if (isObject(o)) {
    if (isArray(o)) {
      a = [];
      for (var i = 0, l = o.length; i < l; i++) {
        a[i] = clone(o[i]);
      }
    } else {
      a = {};
      var v;
      for (x in o) {
        v = o[x];
        if (v === null || v === undefined) {
          a[x] = v;
          continue;
        }
        if (isObject(v)) {
          if (isDate(v)) {
            a[x] = new Date(v.getTime());
          } else if (isRegExp(v)) {
            a[x] = new RegExp(v.source, v.flags);
          } else if (isArray(v)) {
            a[x] = [];
            for (var i = 0, l = v.length; i < l; i++) {
              a[x][i] = clone(v[i]);
            }
          } else {
            a[x] = clone(v);
          }
        } else {
          a[x] = v;
        }
      }
    }
  } else {
    a = o;
  }
  return a;
}

export default {
  extend() {
    var args = arguments;
    if (!args[LEN]) return;
    if (args[LEN] == 1) return args[0];
    var a = args[0], b, x;
    for (var i = 1, l = args[LEN]; i < l; i++) {
      b = args[i];
      if (!b) continue;
      for (x in b) {
        a[x] = b[x];
      }
    }
    return a;
  },

  stringArgs(a) {
    if (!a || isUnd(a.length)) throw new Error("expected array argument");
    if (!a.length) return [];
    var l = a.length;
    if (l === 1) {
      var first = a[0];
      if (isString(first) && first.indexOf(" ") > -1) {
        return first.split(/\s+/g);
      }
    }
    return a;
  },

  uniqueId,

  resetSeed,

  flatten,

  each,

  exec,

  keys,

  values,

  minus,

  map,

  first,

  toArray,

  isArray,

  isDate,

  isString,

  isNumber,

  isObject,

  isPlainObject,

  isEmpty,

  isFunction,

  has: hasOwnProperty,

  isNullOrEmptyString(v) {
    return v === null || v === undefined || v === "";
  },

  lower,

  upper,

  clone,

  /**
   * Duck typing: checks if an object "Quacks like a Promise"
   *
   * @param {Promise} o;
   */
  quacksLikePromise(o) {
    if (o && typeof o.then == FUNCTION) {
      return true;
    }
    return false;
  },

  /**
   * Returns the sum of values inside an array, eventually by predicate.
   */
  sum(a, fn) {
    if (!a) return;
    var b, l = a[LEN];
    if (!l) return;
    for (var i = 0, l = a[LEN]; i < l; i++) {
      var v = fn ? fn(a[i]) : a[i];
      if (isUnd(b)) {
        b = v;
      } else {
        b += v;
      }
    }
    return b;
  },

  /**
   * Returns the maximum value inside an array, by predicate.
   */
  max(a, fn) {
    var o = -Infinity;
    for (var i = 0, l = a[LEN]; i < l; i++) {
      var v = fn ? fn(a[i]) : a[i];
      if (v > o)
        o = v;
    }
    return o;
  },

  /**
   * Returns the minimum value inside an array, by predicate.
   */
  min(a, fn) {
    var o = Infinity;
    for (var i = 0, l = a[LEN]; i < l; i++) {
      var v = fn ? fn(a[i]) : a[i];
      if (v < o)
        o = v;
    }
    return o;
  },

  /**
   * Returns the item with the maximum value inside an array, by predicate.
   */
  withMax(a, fn) {
    var o;
    for (var i = 0, l = a[LEN]; i < l; i++) {
      if (!o) {
        o = a[i];
        continue;
      }
      var v = fn(a[i]);
      if (v > fn(o))
        o = a[i];
    }
    return o;
  },

  /**
   * Returns the item with the minimum value inside an array, by predicate.
   */
  withMin(a, fn) {
    var o;
    for (var i = 0, l = a[LEN]; i < l; i++) {
      if (!o) {
        o = a[i];
        continue;
      }
      var v = fn(a[i]);
      if (v < fn(o))
        o = a[i];
    }
    return o;
  },

  indexOf(a, o) {
    return a.indexOf(o);
  },

  contains(a, o) {
    return a.indexOf(o) > -1;
  },

  /**
   * Returns a value indicating whether any object inside an array, or any
   * key-value pair inside an object, respect a given predicate.
   *
   * @param a: input array or object
   * @param fn: predicate to test items or key-value pairs
   */
  any(a, fn) {
    if (isPlainObject(a)) {
      var x;
      for (x in a) {
        if (fn(x, a[x]))
          return true;
      }
      return false;
    }
    for (var i = 0, l = a[LEN]; i < l; i++) {
      if (fn(a[i]))
        return true;
    }
    return false;
  },

  /**
   * Returns a value indicating whether all object inside an array, or any
   * key-value pair inside an object, respect a given predicate.
   *
   * @param a: input array or object
   * @param fn: predicate to test items or key-value pairs
   */
  all(a, fn) {
    if (isPlainObject(a)) {
      var x;
      for (x in a) {
        if (!fn(x, a[x]))
          return false;
      }
      return true;
    }
    for (var i = 0, l = a[LEN]; i < l; i++) {
      if (!fn(a[i]))
        return false;
    }
    return true;
  },

  /**
   * Finds the first item or property that respects a given predicate.
   */
  find(a, fn) {
    if (!a) return null;
    if (isArray(a)) {
      if (!a || !a[LEN]) return;
      for (var i = 0, l = a[LEN]; i < l; i++) {
        if (fn(a[i]))
          return a[i];
      }
    }
    if (isPlainObject(a)) {
      var x;
      for (x in a) {
        if (fn(a[x], x))
          return a[x];
      }
    }
    return;
  },

  where(a, fn) {
    if (!a || !a[LEN]) return [];
    var b = [];
    for (var i = 0, l = a[LEN]; i < l; i++) {
      if (fn(a[i]))
        b.push(a[i]);
    }
    return b;
  },

  removeItem(a, o) {
    var x = -1;
    for (var i = 0, l = a[LEN]; i < l; i++) {
      if (a[i] === o) {
        x = i;
        break;
      }
    }
    a.splice(x, 1);
  },

  reject(a, fn) {
    if (!a || !a[LEN]) return [];
    var b = [];
    for (var i = 0, l = a[LEN]; i < l; i++) {
      if (!fn(a[i]))
        b.push(a[i]);
    }
    return b;
  },

  pick(o, arr, exclude) {
    var a = {};
    if (exclude) {
      for (var x in o) {
        if (arr.indexOf(x) == -1)
          a[x] = o[x];
      }
    } else {
      for (var i = 0, l = arr[LEN]; i < l; i++) {
        var p = arr[i];
        if (hasOwnProperty(o, p))
          a[p] = o[p];
      }
    }
    return a;
  },

  /**
   * Requires an object to be defined and to have the given properties.
   *
   * @param {Object} o: object to validate
   * @param {String[]} props: list of properties to require
   * @param {string} [name=options]:
   */
  require(o, props, name) {
    if (!name) name = "options";
    var error = "";
    if (o) {
      this.each(props, x => {
        if (!hasOwnProperty(o, x)) {
          error += "missing '" + x + "' in " + name;
        }
      });
    } else {
      error = "missing " + name;
    }
    if (error)
      throw new Error(error);
  },

  wrap(fn, callback, context) {
    var wrapper = () => {
      return callback.apply(this, [fn].concat(toArray(arguments)));
    };
    wrapper.bind(context || this);
    return wrapper;
  },

  unwrap(o) {
    return isFunction(o) ? unwrap(o()) : o;
  },

  defer(fn) {
    setTimeout(fn, 0);
  },

  /**
   * Returns a new function that can be invoked at most n times.
   */
  atMost(n, fn, context) {
    var m = n, result;
    function a() {
      if (n > 0) {
        n--;
        result = fn.apply(context || this, arguments);
      }
      return result;
    }
    return a;
  },

  isUnd,

  /**
   * Returns a new function that can be invoked at most once.
   */
  once(fn, context) {
    return this.atMost(1, fn, context);
  },

  /**
   * Returns a new function that is executed always passing the given arguments to it.
   * Python-fashion.
  */
  partial(fn) {
    var self = this;
    var args = self.toArray(arguments);
    args.shift();
    return function partial() {
      var bargs = self.toArray(arguments);
      return fn.apply({}, args.concat(bargs));
    };
  },

  /**
   * Quasi Pythonic object comparer
   */
  equal(a, b) {
    var NONE = null, und, t = true, f = false, s = "";
    if (a === b) return t;
    if (a === und || b === und || a === NONE || b === NONE || a === t || b === t || a === f || b === f || a === s || b === s)
      return false;
    if (isArray(a)) {
      if (isArray(b) && a[LEN] == b[LEN]) {
        // like in Python: return true if all objects
        // inside are equal, in the same order
        var i, l = a[LEN];
        for (i = 0; i < l; i++) {
          if (!this.equal(a[i], b[i])) {
            return f;
          }
        }
        return t;
      } else {
        return f;
      }
    }
    if (isNumber(a) || isString(a))
      return a == b;
    if (a === NONE && b === NONE)
      return t;
    if (a === und && b === und)
      return t;
    var x, q = 0, w = 0;
    for (x in a) {
      if (a[x] !== und)
        q += 1;
      if (!this.equal(a[x], b[x]))
        return f;
    }
    for (x in b) {
      if (b[x] !== und)
        w += 1;
    }
    var diff = q == w;
    return diff;
  },

  /**
   * Given a list of arrays, returns a new list of columns obtained from them.
   */
  cols(a) {
    if (!a || !a.length) return [];
    var maxLength = this.max(a, x => { return x.length; });
    var b = [], i, j, l = a.length;
    for (j = 0; j < maxLength; j++) {
      var col = [];
      for (i = 0; i < l; i++) {
        col.push(a[i][j]);
      }
      b.push(col);
    }
    return b;
  },

  /**
   * Sorts an array of numbers in ascending order.
   */
  sortNums(a) {
    return a.sort((i, j) => { if (i > j) return 1; if (i < j) return -1; return 0;});
  },

  /**
   * Returns a new function that can be fired only once every n milliseconds.
   * The function is fired after the timeout, and as late as possible.
   *
   * @param fn: function
   * @param ms: milliseconds
   * @param {any} context: function context.
   */
  debounce(fn, ms, context) {
    var it;
    function d() {
      if (it) {
        clearTimeout(it);
      }
      var args = arguments.length ? toArray(arguments) : undefined;
      it = setTimeout(() => {
        it = null;
        fn.apply(context, args);
      }, ms);
    }
    return d;
  },

  /**
   * Edits the items of an array by using a given function.
   *
   * @param {array} a: array of items.
   * @param {function} fn: editing function.
   */
  reach(a, fn) {
    if (!isArray(a)) throw new Error("expected array");
    var item;
    for (var i = 0, l = a.length; i < l; i++) {
      item = a[i];
      if (isArray(item)) {
        this.reach(item, fn);
      } else {
        a[i] = fn(item);
      }
    }
    return a;
  },

  /**
   * Returns a value indicating whether the given object implements all given methods.
   */
  quacks(o, methods) {
    if (!o) return false;
    if (!methods) throw "missing methods list";
    if (isString(methods)) {
      methods = toArray(arguments).slice(1, arguments.length);
    }
    for (var i = 0, l = methods.length; i < l; i++) {
      if (!isFunction(o[methods[i]])) {
        return false;
      }
    }
    return true;
  },

  /**
   * Replaces values in strings, using mustaches.
   */
  format(s, o) {
    return s.replace(/\{\{(.+?)\}\}/g, function (s, a) {
      if (!o.hasOwnProperty(a))
        return s;
      return o[a];
    });
  },

  /**
   * Proxy function to fn bind.
   */
  bind(fn, o) {
    return fn.bind(o);
  },

  ifcall(fn, ctx, args) {
    if (!fn) return;
    if (!args) {
      fn.call(ctx);
      return;
    }
    switch (args.length) {
      case 0: fn.call(ctx); return;
      case 1: fn.call(ctx, args[0]); return;
      case 2: fn.call(ctx, args[0], args[1]); return;
      case 3: fn.call(ctx, args[0], args[1], args[2]); return;
      default: fn.apply(ctx, args);
    }
  }
};
