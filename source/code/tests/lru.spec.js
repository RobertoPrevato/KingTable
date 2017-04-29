/**
 * Tests for LRU caching mechanism.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../scripts/utils";
import lru from "../scripts/data/lru"

describe("LRU cache", () => {

  it("must store least recently used items by key", () => {
    var key = "a"
    sessionStorage.removeItem(key);

    for (var i = 0; i < 10; i++) {
      lru.set(key, i);
    }

    var val = lru.get(key);
    expect(val instanceof Array).toEqual(true, "getter with only key must return an array of cached items");
    _.sortNums(val);
    expect(val[0]).toEqual(0);
    expect(val[1]).toEqual(1);
    expect(val[2]).toEqual(2);
    expect(val[3]).toEqual(3);
    expect(val[4]).toEqual(4);
    expect(val[5]).toEqual(5);
    expect(val[6]).toEqual(6);
    expect(val[7]).toEqual(7);
    expect(val[8]).toEqual(8);
    expect(val[9]).toEqual(9);
  });

  it("must allow to discard older items", () => {
    var key = "b";
    sessionStorage.removeItem(key);
    var maxSize = 5;

    for (var i = 0; i < 10; i++) {
      lru.set(key, i, maxSize);
    }

    var val = lru.get(key);
    expect(val instanceof Array).toEqual(true, "getter with only key must return an array of cached items");
    _.sortNums(val);
    expect(val.length).toEqual(maxSize);
    expect(val[0]).toEqual(5);
    expect(val[1]).toEqual(6);
    expect(val[2]).toEqual(7);
    expect(val[3]).toEqual(8);
    expect(val[4]).toEqual(9);

    lru.set(key, 20, maxSize);
    var val = lru.get(key);
    expect(val instanceof Array).toEqual(true, "getter with only key must return an array of cached items");
    _.sortNums(val);
    expect(val.length).toEqual(maxSize);
    expect(val[0]).toEqual(6);
    expect(val[1]).toEqual(7);
    expect(val[2]).toEqual(8);
    expect(val[3]).toEqual(9);
    expect(val[4]).toEqual(20);
  });

  it("must retrieve single items by key and condition", () => {
    var key = "c";
    sessionStorage.removeItem(key);

    for (var i = 0; i < 10; i++) {
      lru.set(key, i);
    }

    var val = lru.get(key, x => { return x === 6; });
    expect(val instanceof Array).toEqual(false, "getter with key and condition must return an exact item");
    expect(val).toEqual(6);
  });

  it("must remove items by key and condition", () => {
    var key = "d";
    sessionStorage.removeItem(key);

    for (var i = 0; i < 5; i++) {
      lru.set(key, i);
    }

    var val = lru.get(key);
    expect(val instanceof Array).toEqual(true, "getter with only key must return an array of cached items");
    expect(val.length).toEqual(5);
    _.sortNums(val);
    expect(val[0]).toEqual(0);
    expect(val[1]).toEqual(1);
    expect(val[2]).toEqual(2);
    expect(val[3]).toEqual(3);
    expect(val[4]).toEqual(4);

    lru.remove(key, x => { return x >= 3; });
    val = lru.get(key);
    expect(val instanceof Array).toEqual(true, "getter with only key must return an array of cached items");
    expect(val.length).toEqual(3);
    _.sortNums(val);
    expect(val[0]).toEqual(0);
    expect(val[1]).toEqual(1);
    expect(val[2]).toEqual(2);
  });

  it("must allow to retrieve single objects by key and condition", () => {
    var key = "e";
    sessionStorage.removeItem(key);

    for (var i = 0; i < 10; i++) {
      lru.set(key, { val: i });
    }

    var o = lru.get(key, x => { return x.val === 6; });
    expect(o instanceof Array).toEqual(false, "getter with key and condition must return an exact item");
    expect(o.val).toEqual(6);
  });

  it("must allow to return items with their caching details", () => {
    var key = "f";
    sessionStorage.removeItem(key);

    for (var i = 0; i < 10; i++) {
      lru.set(key, { val: i });
    }

    var o = lru.get(key, x => { return x.val === 6; }, true);
    expect(o instanceof Array).toEqual(false, "getter with key and condition must return an exact item");
    expect(typeof o.ts).toEqual("number", "lru getter must return details with caching ts");
    expect(o.data.val).toEqual(6, "lru getter must return details with data in 'data' property");
  });
});
