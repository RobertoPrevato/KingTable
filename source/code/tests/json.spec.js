/**
 * Tests for json proxy functions.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import json from "../scripts/data/json"

describe("JSON proxy functions", () => {
  it("must parse dates in ISO format automatically", () => {
    var a = '{"a":"2017-02-08T15:32:27.118Z"}';
    var b = json.parse(a);

    expect(b.a instanceof Date).toEqual(true, "a string in ISO format should be parsed automatically as date");
    expect(b.a.getFullYear()).toEqual(2017);
    expect(b.a.getMonth()).toEqual(1);
    expect(b.a.getDate()).toEqual(8);
    expect(b.a.getUTCHours()).toEqual(15);
    expect(b.a.getUTCMinutes()).toEqual(32);
  })

  it("must parse dates not in ISO format automatically (HH:mm:ss)", () => {
    var a = '{"a":"2017-02-08 15:32:15"}';
    var b = json.parse(a);

    expect(b.a instanceof Date).toEqual(true, "a string in ISO format should be parsed automatically as date");
    expect(b.a.getFullYear()).toEqual(2017);
    expect(b.a.getMonth()).toEqual(1);
    expect(b.a.getDate()).toEqual(8);
    expect(b.a.getHours()).toEqual(15);
    expect(b.a.getMinutes()).toEqual(32);
    expect(b.a.getSeconds()).toEqual(15);
  })

  it("must parse dates not in ISO format automatically (HH:mm)", () => {
    var a = '{"a":"2017-02-08 15:32"}';
    var b = json.parse(a);

    expect(b.a instanceof Date).toEqual(true, "a string in ISO format should be parsed automatically as date");
    expect(b.a.getFullYear()).toEqual(2017);
    expect(b.a.getMonth()).toEqual(1);
    expect(b.a.getDate()).toEqual(8);
    expect(b.a.getHours()).toEqual(15);
    expect(b.a.getMinutes()).toEqual(32);
    expect(b.a.getSeconds()).toEqual(0);
  })

  it("must parse dates not in ISO format automatically (HH)", () => {
    var a = '{"a":"2017-02-08 15"}';
    var b = json.parse(a);

    expect(b.a instanceof Date).toEqual(true, "a string in ISO format should be parsed automatically as date");
    expect(b.a.getFullYear()).toEqual(2017);
    expect(b.a.getMonth()).toEqual(1);
    expect(b.a.getDate()).toEqual(8);
    expect(b.a.getHours()).toEqual(15);
    expect(b.a.getMinutes()).toEqual(0);
    expect(b.a.getSeconds()).toEqual(0);
  })

  it("must include properties with undefined values in serialized strings", () => {
    var a = {"someProperty": undefined };
    var b = json.compose(a);

    expect(b.indexOf("someProperty") != -1).toEqual(true, "a serialized JSON object must include undefined properties");
    expect(b.indexOf("someProperty\":null") != -1).toEqual(true, "undefined values are serialized as null");
  })
});
