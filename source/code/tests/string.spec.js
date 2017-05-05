/**
 * Tests for String utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../scripts/utils";
import S from "../scripts/components/string";

describe("String utilities", () => {
  it("must allow to remove multiple spaces", () => {
    var a = "Hello   World";
    expect(S.removeMultipleSpaces(a)).toEqual("Hello World");
    a = "  Hello   World  ";
    expect(S.removeMultipleSpaces(a)).toEqual(" Hello World ");
  });

  it("must allow to convert strings to snake case", () => {
    // from mess to snake case:
    expect(S.snakeCase(" Hello World ")).toEqual("hello_world");

    // from mess to snake case:
    expect(S.snakeCase(" Hello    World ")).toEqual("hello_world");

    // from camel case to snake case:
    expect(S.snakeCase("helloWorld")).toEqual("hello_world");

    // from kebab case to snake case:
    expect(S.snakeCase(" hello-world  ")).toEqual("hello_world");

    // from mess to snake case:
    expect(S.snakeCase("_hello__world_")).toEqual("_hello_world_");
  });

  it("must allow to convert strings to camel case", () => {
    // from mess to snake case:
    expect(S.camelCase(" Hello World ")).toEqual("helloWorld");

    // from snake case to camel case:
    expect(S.camelCase("hello_world")).toEqual("helloWorld");

    // from snake case to camel case:
    expect(S.camelCase("   hello_  world")).toEqual("helloWorld");

    // from kebab case to camel case:
    expect(S.camelCase(" hello-world  ")).toEqual("helloWorld");
  });

  it("must allow to convert strings to kebab case", () => {
    expect(S.kebabCase(" Hello World ")).toEqual("hello-world");

    expect(S.kebabCase("hello_world")).toEqual("hello-world");

    expect(S.kebabCase("   hello_  world")).toEqual("hello-world");

    expect(S.kebabCase("helloWorld")).toEqual("hello-world");
  });

  it("must allow to center strings, in Python fashion", () => {
    expect(S.center("Hello", 10)).toEqual("  Hello   ");

    expect(S.center("Hello", 10, "*")).toEqual("**Hello***");

    expect(S.center("Hello", 11, "*")).toEqual("***Hello***");
  });

  it("must allow to left just strings, Python fashion", () => {
    expect(S.ljust("Hello", 10)).toEqual("Hello     ");

    expect(S.ljust("Hello", 10, "*")).toEqual("Hello*****");

    expect(S.ljust("Hello", 11, "*")).toEqual("Hello******");
  });

  it("must allow to right just strings, Python fashion", () => {
    expect(S.rjust("Hello", 10)).toEqual("     Hello");

    expect(S.rjust("Hello", 10, "*")).toEqual("*****Hello");

    expect(S.rjust("Hello", 11, "*")).toEqual("******Hello");
  });

  it("must allow to normalize texts lines width", () => {
    var text =
`Hello World
Something
Cat`
    var expected =
`Hello World
Something__
Cat________`
    expect(S.fixWidth(text, "_")).toEqual(expected);
  });

  it("must allow to normalize the width of strings in array", () => {
    var lines = [
      "Hello World",
      "Something",
      "Cat"
    ];
    var expected = [
      "Hello World",
      "Something__",
      "Cat________"
    ];
    expect(_.equal(S.fixWidth(lines, "_"), expected)).toEqual(true);
  });

  it("must return the widths of lines in strings", () => {
    var text =
`Hello World
Something
Cat`
    var a = S.linesWidths(text);

    expect(a instanceof Array).toEqual(true);
    expect(a[0]).toEqual(11);
    expect(a[1]).toEqual(9);
    expect(a[2]).toEqual(3);
  });

  it("must return the widths of lines in arrays", () => {
    var text = ["Hello World", "Something", "Cat"]
    var a = S.linesWidths(text);

    expect(a instanceof Array).toEqual(true);
    expect(a[0]).toEqual(11);
    expect(a[1]).toEqual(9);
    expect(a[2]).toEqual(3);
  });

  it("must allow to normalize strings for sorting and searching", () => {
    expect(S.normalize("Cześć!")).toEqual("Czesc!", "Cześć -> Czesc");
    expect(S.normalize("Łukasz")).toEqual("Lukasz", "Łukasz -> Lukasz");
  })

  it("must allow to replace strings at index", () => {
    var a = "Hello World"
    var b = S.replaceAt(a, 6, "Dear!")

    expect(b).toEqual("Hello Dear!")
  })

  it("must allow to restore diacritics in strings", () => {
    var a = "Zelazowskieasdaz"
    var diacritics = [
      {i: 0, v: 'Ż'}, {i: 10, v: 'ę'}, {i: 14, v: 'ą'}, {i: 15, v: 'ż'}
    ];
    
    expect(S.restoreDiacritics(a, diacritics)).toEqual("Żelazowskięasdąż")
  })

  it("must allow to restore diacritics in strings, with offset", () => {
    var a = "Henrik Nordvargr Björkk"
    var diacritics = [{i: 19, v: "ö"}];
    
    var portion = "Bjorkk";
    var offset = a.indexOf("B");
    expect(S.restoreDiacritics(portion, diacritics, offset)).toEqual("Björkk")
  })

  it("must allow to find diacritics in strings", () => {
    var a = "Żelazowskięasdąż"
    var diacritics = S.findDiacritics(a)
    
    expect(diacritics).toEqual([
      {i: 0, v: 'Ż'}, {i: 10, v: 'ę'}, {i: 14, v: 'ą'}, {i: 15, v: 'ż'}
    ])
  })
});
