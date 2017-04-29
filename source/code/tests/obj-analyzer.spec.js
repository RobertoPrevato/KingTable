/**
 * Tests for Analyzer class.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../scripts/utils";
import Analyzer from "../scripts/data/object-analyzer";

const a = new Analyzer();


describe("Objects Analyzer class", () => {
  it("must describe an object structure", () => {
    var o = {
      a: "Hello",
      b: true,
      c: /aaa/,
      d: 300,
      e: 45.56
    };

    var schema = a.describe(o);
    expect(_.equal(schema, {
      "a": "string",
      "b": "boolean",
      "c": "regex",
      "d": "number",
      "e": "number"
    })).toEqual(true, "the properties contain values of asserted types");
  });

  it("must describe the structure of list items", () => {
    var data = [{
      age: 30,
      name: "Roberto",
      status: "M",
      gender: "M"
    }];

    var schema = a.describeList(data, { limit: 1 });
    expect(_.equal(schema, {
      "age": "number",
      "name": "string",
      "gender": "string",
      "status": "string"
    })).toEqual(true);
  });

  it("must describe the structure of list items with nullable properties", () => {
    var data = [{
      age: undefined,
      name: "AA",
      status: "M",
      gender: null
    },{
      age: undefined,
      name: "BB",
      status: "M",
      gender: null
    },{
      age: 30,
      name: "CC",
      status: "M",
      gender: "M"
    }];

    var schema = a.describeList(data);
    expect(_.equal(schema, {
      "age": "number",
      "name": "string",
      "gender": "string",
      "status": "string"
    })).toEqual(true);
  });

});
