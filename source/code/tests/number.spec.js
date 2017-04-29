/**
 * Tests for Number utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../scripts/utils";
//import N from "../scripts/components/number";

describe("Number utilities", () => {
  
  it("must support Intl", () => {
    expect(typeof Intl).not.toEqual("undefined", "Intl must be defined");
  });

  it("must support Intl.NumberFormat", () => {
    var a = Intl.NumberFormat();
    expect(a.format(1000)).toEqual("1,000")
  });
});
