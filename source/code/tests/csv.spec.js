/**
 * Tests for csv utility functions.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import csv from "../scripts/data/csv"

const BOM = "\uFEFF"

describe("CSV helper functions", () => {
  it("must allow to serialize collections in CSV", () => {
    var a = [
      ["id", "firstname", "lastname"],
      [1, "Giulio", "Cesare"]
    ];
    var b = csv.serialize(a);

    var expected = `${BOM}id,firstname,lastname
1,Giulio,Cesare`;
    expect(b).toEqual(expected);
  })

  it("must handle values containing commas", () => {
    var a = [
      ["id", "model", "something"],
      [1, "A31, KOP", "Hello World"]
    ];
    var b = csv.serialize(a);

    var expected = `${BOM}id,model,something
1,"A31, KOP",Hello World`;
    expect(b).toEqual(expected);
  })

  it("must handle values containing commas and double quotes", () => {
    var a = [
      ["id", "model", "something"],
      [1, "A31, \"KOP\"", "Hello World"]
    ];
    var b = csv.serialize(a);
    var expected = `${BOM}id,model,something
1,"A31, \"\"KOP\"\"",Hello World`;
    expect(b).toEqual(expected);
  })

  it("must allow to use custom separators", () => {
    var a = [
      ["id", "model", "something"],
      [1, "A31, KOP", "Hello World"]
    ];
    var b = csv.serialize(a, { separator: "|" });

    var expected = `${BOM}id|model|something
1|A31, KOP|Hello World`;
    expect(b).toEqual(expected);
  })

  it("must allow to remove BOM", () => {
    var a = [
      ["id", "model", "something"],
      [1, "A31, KOP", "Hello World"]
    ];
    var b = csv.serialize(a, { addBom: false, separator: "|" });

    var expected = `id|model|something
1|A31, KOP|Hello World`;
    expect(b).toEqual(expected);
  })

  it("must allow to include separator, for MS Excel", () => {
    var a = [
      ["id", "firstname", "lastname"],
      [1, "Giulio", "Cesare"]
    ];
    var b = csv.serialize(a, { addSeparatorLine: true });

    var expected = `${BOM}id,firstname,lastname
1,Giulio,Cesare
\t,`;
    expect(b).toEqual(expected);
  })

});
