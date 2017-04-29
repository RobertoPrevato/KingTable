/**
 * Tests for RegExp utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../scripts/utils";
import R from "../scripts/components/regex";

describe("Regex utilities", () => {
  it("must prepare strings for RegExp", () => {

    expect(R.escapeCharsForRegex("Hello.World?")).toEqual("Hello\\.World\\?", "dots and question marks must be escaped")
    expect(R.escapeCharsForRegex("(Hello World)")).toEqual("\\(Hello\\sWorld\\)", "parentheses must be escaped")
    expect(R.escapeCharsForRegex("[Hello World]")).toEqual("\\[Hello\\sWorld\\]", "square brackets must be escaped")
    expect(R.escapeCharsForRegex("{Hello World}")).toEqual("\\{Hello\\sWorld\\}", "curly braces must be escaped")
    expect(R.escapeCharsForRegex("Hello World*")).toEqual("Hello\\sWorld\\*", "stars must be escaped")
    expect(R.escapeCharsForRegex("Hello^ World$")).toEqual("Hello\\^\\sWorld\\$", "^ and $ must be escaped")
  });

  it("must allow to obtain regex from multiple words", () => {

    var a = R.getPatternFromStrings(["Hello", "World", "Kitty"])
    expect(a instanceof RegExp).toEqual(true, "return object must be a regex")
    expect(a.source).toEqual("(Hello|World|Kitty)", "words must be alternatives")
    expect(a.flags).toEqual("gim", "pattern must be global, case insensitive and multiline")
  });
});
