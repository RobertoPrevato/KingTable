/**
 * Tests for AJAX utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../scripts/utils";
import ajax from "../scripts/data/ajax";

describe("AJAX utilities", () => {

  it("must allow to produce query strings (single parameter)", () => {
    var a = {
      "search": "Hello"
    }

    var qs = ajax.createQs(a)
    expect(qs).toEqual("search=Hello")
  })

  it("must allow to produce query strings (multiple parameters)", () => {
    var a = {
      "search": "Hello",
      "page": 1,
      "size": 30
    }

    var qs = ajax.createQs(a)
    expect(qs).toEqual("page=1&search=Hello&size=30")
  })

  it("must allow to produce query strings, ignoring null values (multiple parameters)", () => {
    var a = {
      "search": null,
      "page": 1,
      "size": 30,
      "moo": undefined,
      "foo": ""
    }

    var qs = ajax.createQs(a)
    expect(qs).toEqual("page=1&size=30")
  })

  it("must allow to produce query strings, handling null and undefined values", () => {
    expect(ajax.createQs(null)).toEqual("", "null must produce an empty query string")

    expect(ajax.createQs(undefined)).toEqual("", "undefined must produce an empty query string")
  })
})
