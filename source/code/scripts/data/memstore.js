/**
 * Memory storage. Allows to replace use of localStorage and sessionStorage
 * with an in-memory storage that implements the same interface.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

const CACHE = {};

export default {

  items() {
    return CACHE;
  },

  length() {
    var x, i = 0;
    for (x in CACHE) { i++; }
    return i;
  },

  getItem(name) {
    return CACHE[name];
  },

  setItem(name, value) {
    CACHE[name] = value;
  },

  removeItem(name) {
    delete CACHE[name];
  },

  clear() {
    var x;
    for (x in CACHE) {
      delete CACHE[x];
    }
  }
}
