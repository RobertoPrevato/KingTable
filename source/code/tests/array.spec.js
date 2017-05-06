/**
 * Tests for array utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../scripts/utils"
import A from "../scripts/components/array"
import LATEST_SCORES from "../tests/data/latest-scores"
import COLORS_PART from "../tests/data/colors-part"

const HUE_MIX = [
  {hue: "5°"},
  {hue: "50°"},
  {hue: "6°"},
  {hue: "60°"},
  {hue: "600°"},
  {hue: "8°"},
  {hue: "80°"},
  {hue: "800°"},
  {hue: "9°"},
  {hue: "900°"},
  {hue: "90°"},
  {hue: "__°"}
];

const PEOPLE = [
  { name: "Adam" },
  { name: "Łukasz" },
  { name: "Lucia" },
  { name: "Luca" },
  { name: "Lucetta" },
  { name: "Lucio" },
  { name: "Monica" },
  { name: "Roberto" },
  { name: "Stanisław" },
  { name: "Bogumił" }
];
const PEOPLE_2 = [
  { name: "Adam", age: 60 },
  { name: "Adam", age: 40 },
  { name: "Łukasz", age: 40 },
  { name: "Lucia", age: 30 },
  { name: "Lucia", age: 48 },
  { name: "Luca", age: 35 },
  { name: "Luca", age: 20 },
  { name: "Lucetta", age: 21 },
  { name: "Lucio", age: 40 },
  { name: "Monica", age: 10 },
  { name: "Monica", age: 14 },
  { name: "Roberto", age: 20 },
  { name: "Roberto", age: 31 },
  { name: "Stanisław", age: 30 },
  { name: "Bogumił", age: 29 }
];
//
// NB: in following object, prices are intentionally strings with currency;
// The sorting function must be smart and sort the prices using the numeric value
//
const PRODUCTS = [
  { name: "A", price: "$ 60.00" },
  { name: "B", price: "$ 40.20" },
  { name: "C", price: "$ 40.10" },
  { name: "D", price: "$ 30.20" },
  { name: "E", price: "$ 48.20" },
  { name: "F", price: "$ 35.20" },
  { name: "G", price: "$ 20.20" },
  { name: "H", price: "$ 21.20" },
  { name: "I", price: "$ 10.66" },
  { name: "J", price: "$ 40.20" },
  { name: "K", price: "$ 14.50" },
  { name: "L", price: "$ 20.33" },
  { name: "M", price: "$ 31.54" },
  { name: "N", price: "$ 30.43" },
  { name: "O", price: "$ 29.12" },
  { name: "P", price: "$ 129.12" },
  { name: "Q", price: "$ 1,000.12" },
  { name: "R", price: "$ 5,129.12" },
  { name: "S", price: "$ 2,129.12" }
]
// The following object is to test search by multiple properties.
const EXAMPLE = [
  { a: "A", b: "S", c: "Z" },
  { a: "B", b: "R", c: "B" },
  { a: "C", b: "Q", c: "P" },
  { a: "D", b: "P", c: "P" },
  { a: "E", b: "O", c: "R" },
  { a: "F", b: "N", c: "A" },
  { a: "G", b: "M", c: "B" },
  { a: "H", b: "L", c: "W" },
  { a: "I", b: "K", c: "Q" },
  { a: "J", b: "J", c: "J" },
  { a: "K", b: "I", c: "H" },
  { a: "L", b: "H", c: "A" },
  { a: "M", b: "G", c: "T" },
  { a: "N", b: "F", c: "D" },
  { a: "O", b: "E", c: "E" },
  { a: "P", b: "D", c: "E" },
  { a: "Q", b: "C", c: "C" },
  { a: "R", b: "B", c: "G" },
  { a: "S", b: "A", c: "A" }
]

describe("Array utilities", () => {

  it("must allow to normalize order values", () => {
    var a = [["name","asc"],  ["age", "asc"], ["mana", "desc"]];
    var b = A.normalizeOrder(a);
    expect(b.length).toEqual(3);
    expect(b[0][1]).toEqual(1, "asc must be translated into 1");
    expect(b[1][1]).toEqual(1, "asc must be translated into 1");
    expect(b[2][1]).toEqual(-1, "desc must be translated into -1");
  })

  it("must sort strings in case insensitive way, by default", () => {
    var a = [{ letter: "a" },
             { letter: "A" },
             { letter: "c" },
             { letter: "C" }];
    var b = A.sortBy(a, "letter");

    // NB: if not handled, JavaScript would sort this way: "a", "c", "A", "C"
    // NB: different browsers handle order differently, hence the assertions just assert that the letters are close to each other
    expect(b[0].letter.toLowerCase()).toEqual("a");
    expect(b[1].letter.toLowerCase()).toEqual("a");
    expect(b[2].letter.toLowerCase()).toEqual("c");
    expect(b[3].letter.toLowerCase()).toEqual("c");
  });

  it("must allow to sort strings in case sensitive way", () => {
    var a = [{ letter: "a" },
             { letter: "A" },
             { letter: "c" },
             { letter: "C" }];
    A.options.ci = false; // set case insensitive to false
    var b = A.sortBy(a, "letter");

    expect(b[0].letter).toEqual("A");
    expect(b[1].letter).toEqual("C");
    expect(b[2].letter).toEqual("a");
    expect(b[3].letter).toEqual("c");
    A.options.ci = true; // restore case insensitive option
  });

  it("must sort arrays of objects by properties described using objects", () => {
    var b = A.sortBy(PEOPLE, { name: "asc" })

    expect(b.length).toEqual(PEOPLE.length, "sorting should not affect the array length");
    expect(b).toEqual(PEOPLE, "sorting must sort and return the original array");
    expect(b[0].name).toEqual("Adam");
    expect(b[1].name).toEqual("Bogumił");
    expect(b[2].name).toEqual("Luca");
    expect(b[3].name).toEqual("Lucetta");
    expect(b[4].name).toEqual("Lucia");
    expect(b[5].name).toEqual("Lucio");
    expect(b[6].name).toEqual("Łukasz");
    expect(b[7].name).toEqual("Monica");
    expect(b[8].name).toEqual("Roberto");
    expect(b[9].name).toEqual("Stanisław");
  })

  it("must sort arrays of objects by properties described using arrays", () => {
    var b = A.sortBy(PEOPLE, [["name", "asc"]])

    expect(b.length).toEqual(PEOPLE.length, "sorting should not affect the array length");
    expect(b).toEqual(PEOPLE, "sorting must sort and return the original array");
    expect(b[0].name).toEqual("Adam");
    expect(b[1].name).toEqual("Bogumił");
    expect(b[2].name).toEqual("Luca");
    expect(b[3].name).toEqual("Lucetta");
    expect(b[4].name).toEqual("Lucia");
    expect(b[5].name).toEqual("Lucio");
    expect(b[6].name).toEqual("Łukasz");
    expect(b[7].name).toEqual("Monica");
    expect(b[8].name).toEqual("Roberto");
    expect(b[9].name).toEqual("Stanisław");
  })

  it("must sort arrays of objects with undefined properties", () => {
    var x = _.clone(PEOPLE);
    x[2].name = undefined;
    x[7].name = undefined;
    var b = A.sortBy(x, { name: "asc" })

    expect(b.length).toEqual(x.length, "sorting should not affect the array length");
    expect(b).toEqual(x, "sorting must sort and return the original array");

    expect(b[0].name).toEqual("Adam");
    expect(b[1].name).toEqual("Bogumił");
    expect(b[2].name).toEqual("Lucetta");
    expect(b[3].name).toEqual("Lucia");
    expect(b[4].name).toEqual("Lucio");
    expect(b[5].name).toEqual("Łukasz");
    expect(b[6].name).toEqual("Roberto");
    expect(b[7].name).toEqual("Stanisław");
    expect(b[8].name).toEqual(undefined);
    expect(b[9].name).toEqual(undefined);
  })

  it("must sort arrays containing null or undefined objects with undefined properties", () => {
    var x = _.clone(PEOPLE);
    x[2] = undefined;
    x[7] = null;
    var b = A.sortBy(x, { name: "asc" })
    expect(b.length).toEqual(x.length, "sorting should not affect the array length");
    expect(b).toEqual(x, "sorting must sort and return the original array");
    expect(b[0].name).toEqual("Adam");
    expect(b[1].name).toEqual("Bogumił");
    expect(b[2].name).toEqual("Lucetta");
    expect(b[3].name).toEqual("Lucia");
    expect(b[4].name).toEqual("Lucio");
    expect(b[5].name).toEqual("Łukasz");
    expect(b[6].name).toEqual("Roberto");
    expect(b[7].name).toEqual("Stanisław");
    expect(b[8]).toEqual(null);
    expect(b[9]).toEqual(undefined);
  })

  it("must sort arrays of objects by single property passed as string (default ascending)", () => {
    var b = A.sortBy(PEOPLE, "name");

    expect(b.length).toEqual(PEOPLE.length, "sorting should not affect the array length");
    expect(b).toEqual(PEOPLE, "sorting must sort and return the original array");
    expect(b[0].name).toEqual("Adam");
    expect(b[1].name).toEqual("Bogumił");
    expect(b[2].name).toEqual("Luca");
    expect(b[3].name).toEqual("Lucetta");
    expect(b[4].name).toEqual("Lucia");
    expect(b[5].name).toEqual("Lucio");
    expect(b[6].name).toEqual("Łukasz");
    expect(b[7].name).toEqual("Monica");
    expect(b[8].name).toEqual("Roberto");
    expect(b[9].name).toEqual("Stanisław");
  })

  it("must sort arrays of objects by multiple properties passed as strings (all default ascending)", () => {
    var b = A.sortBy(PEOPLE_2, "name", "age");

    expect(b.length).toEqual(PEOPLE_2.length, "sorting should not affect the array length");
    expect(b).toEqual(PEOPLE_2, "sorting must sort and return the original array");

    expect(b[0].name).toEqual("Adam");
    expect(b[0].age).toEqual(40);
    expect(b[1].name).toEqual("Adam");
    expect(b[1].age).toEqual(60);
    expect(b[2].name).toEqual("Bogumił");
    expect(b[2].age).toEqual(29);
    expect(b[3].name).toEqual("Luca");
    expect(b[3].age).toEqual(20);
    expect(b[4].name).toEqual("Luca");
    expect(b[4].age).toEqual(35);
    expect(b[5].name).toEqual("Lucetta");
    expect(b[5].age).toEqual(21);
    expect(b[6].name).toEqual("Lucia");
    expect(b[6].age).toEqual(30);
    expect(b[7].name).toEqual("Lucia");
    expect(b[7].age).toEqual(48);
    expect(b[8].name).toEqual("Lucio");
    expect(b[8].age).toEqual(40);
    expect(b[9].name).toEqual("Łukasz");
    expect(b[9].age).toEqual(40);
    expect(b[10].name).toEqual("Monica");
    expect(b[10].age).toEqual(10);
    expect(b[11].name).toEqual("Monica");
    expect(b[11].age).toEqual(14);
    expect(b[12].name).toEqual("Roberto");
    expect(b[12].age).toEqual(20);
    expect(b[13].name).toEqual("Roberto");
    expect(b[13].age).toEqual(31);
    expect(b[14].name).toEqual("Stanisław");
    expect(b[14].age).toEqual(30);
  })

  it("must sort arrays of objects by multiple properties passed as dictionaries (desc)", () => {
    var b = A.sortBy(PEOPLE_2, { name: "desc", age: "desc" });

    expect(b.length).toEqual(PEOPLE_2.length, "sorting should not affect the array length");
    expect(b).toEqual(PEOPLE_2, "sorting must sort and return the original array");

    expect(b[0].name).toEqual("Stanisław");
    expect(b[0].age).toEqual(30);
    expect(b[1].name).toEqual("Roberto");
    expect(b[1].age).toEqual(31);
    expect(b[2].name).toEqual("Roberto");
    expect(b[2].age).toEqual(20);
    expect(b[3].name).toEqual("Monica");
    expect(b[3].age).toEqual(14);
    expect(b[4].name).toEqual("Monica");
    expect(b[4].age).toEqual(10);
    expect(b[5].name).toEqual("Łukasz");
    expect(b[5].age).toEqual(40);
    expect(b[6].name).toEqual("Lucio");
    expect(b[6].age).toEqual(40);
    expect(b[7].name).toEqual("Lucia");
    expect(b[7].age).toEqual(48);
    expect(b[8].name).toEqual("Lucia");
    expect(b[8].age).toEqual(30);
    expect(b[9].name).toEqual("Lucetta");
    expect(b[9].age).toEqual(21);
    expect(b[10].name).toEqual("Luca");
    expect(b[10].age).toEqual(35);
    expect(b[11].name).toEqual("Luca");
    expect(b[11].age).toEqual(20);
    expect(b[12].name).toEqual("Bogumił");
    expect(b[12].age).toEqual(29);
    expect(b[13].name).toEqual("Adam");
    expect(b[13].age).toEqual(60);
    expect(b[14].name).toEqual("Adam");
    expect(b[14].age).toEqual(40);
  })

  it("must sort arrays of objects by multiple properties passed as dictionaries (desc, asc)", () => {
    var b = A.sortBy(PEOPLE_2, { name: "desc", age: "asc" });

    expect(b.length).toEqual(PEOPLE_2.length, "sorting should not affect the array length");
    expect(b).toEqual(PEOPLE_2, "sorting must sort and return the original array");

    expect(b[0].name).toEqual("Stanisław");
    expect(b[0].age).toEqual(30);
    expect(b[1].name).toEqual("Roberto");
    expect(b[1].age).toEqual(20);
    expect(b[2].name).toEqual("Roberto");
    expect(b[2].age).toEqual(31);
    expect(b[3].name).toEqual("Monica");
    expect(b[3].age).toEqual(10);
    expect(b[4].name).toEqual("Monica");
    expect(b[4].age).toEqual(14);
    expect(b[5].name).toEqual("Łukasz");
    expect(b[5].age).toEqual(40);
    expect(b[6].name).toEqual("Lucio");
    expect(b[6].age).toEqual(40);
    expect(b[7].name).toEqual("Lucia");
    expect(b[7].age).toEqual(30);
    expect(b[8].name).toEqual("Lucia");
    expect(b[8].age).toEqual(48);
    expect(b[9].name).toEqual("Lucetta");
    expect(b[9].age).toEqual(21);
    expect(b[10].name).toEqual("Luca");
    expect(b[10].age).toEqual(20);
    expect(b[11].name).toEqual("Luca");
    expect(b[11].age).toEqual(35);
    expect(b[12].name).toEqual("Bogumił");
    expect(b[12].age).toEqual(29);
    expect(b[13].name).toEqual("Adam");
    expect(b[13].age).toEqual(40);
    expect(b[14].name).toEqual("Adam");
    expect(b[14].age).toEqual(60);
  })

  it("must sort arrays of objects by multiple properties passed as arrays (desc, asc)", () => {
    var b = A.sortBy(PEOPLE_2, [["name", "desc"], ["age", "asc"]]);

    expect(b.length).toEqual(PEOPLE_2.length, "sorting should not affect the array length");
    expect(b).toEqual(PEOPLE_2, "sorting must sort and return the original array");

    expect(b[0].name).toEqual("Stanisław");
    expect(b[0].age).toEqual(30);
    expect(b[1].name).toEqual("Roberto");
    expect(b[1].age).toEqual(20);
    expect(b[2].name).toEqual("Roberto");
    expect(b[2].age).toEqual(31);
    expect(b[3].name).toEqual("Monica");
    expect(b[3].age).toEqual(10);
    expect(b[4].name).toEqual("Monica");
    expect(b[4].age).toEqual(14);
    expect(b[5].name).toEqual("Łukasz");
    expect(b[5].age).toEqual(40);
    expect(b[6].name).toEqual("Lucio");
    expect(b[6].age).toEqual(40);
    expect(b[7].name).toEqual("Lucia");
    expect(b[7].age).toEqual(30);
    expect(b[8].name).toEqual("Lucia");
    expect(b[8].age).toEqual(48);
    expect(b[9].name).toEqual("Lucetta");
    expect(b[9].age).toEqual(21);
    expect(b[10].name).toEqual("Luca");
    expect(b[10].age).toEqual(20);
    expect(b[11].name).toEqual("Luca");
    expect(b[11].age).toEqual(35);
    expect(b[12].name).toEqual("Bogumił");
    expect(b[12].age).toEqual(29);
    expect(b[13].name).toEqual("Adam");
    expect(b[13].age).toEqual(40);
    expect(b[14].name).toEqual("Adam");
    expect(b[14].age).toEqual(60);
  })

  it("must sort arrays of objects by multiple properties passed as arrays (desc)", () => {
    var b = A.sortBy(PEOPLE_2, [["name", "desc"], ["age", "desc"]]);

    expect(b.length).toEqual(PEOPLE_2.length, "sorting should not affect the array length");
    expect(b).toEqual(PEOPLE_2, "sorting must sort and return the original array");

    expect(b[0].name).toEqual("Stanisław");
    expect(b[0].age).toEqual(30);
    expect(b[1].name).toEqual("Roberto");
    expect(b[1].age).toEqual(31);
    expect(b[2].name).toEqual("Roberto");
    expect(b[2].age).toEqual(20);
    expect(b[3].name).toEqual("Monica");
    expect(b[3].age).toEqual(14);
    expect(b[4].name).toEqual("Monica");
    expect(b[4].age).toEqual(10);
    expect(b[5].name).toEqual("Łukasz");
    expect(b[5].age).toEqual(40);
    expect(b[6].name).toEqual("Lucio");
    expect(b[6].age).toEqual(40);
    expect(b[7].name).toEqual("Lucia");
    expect(b[7].age).toEqual(48);
    expect(b[8].name).toEqual("Lucia");
    expect(b[8].age).toEqual(30);
    expect(b[9].name).toEqual("Lucetta");
    expect(b[9].age).toEqual(21);
    expect(b[10].name).toEqual("Luca");
    expect(b[10].age).toEqual(35);
    expect(b[11].name).toEqual("Luca");
    expect(b[11].age).toEqual(20);
    expect(b[12].name).toEqual("Bogumił");
    expect(b[12].age).toEqual(29);
    expect(b[13].name).toEqual("Adam");
    expect(b[13].age).toEqual(60);
    expect(b[14].name).toEqual("Adam");
    expect(b[14].age).toEqual(40);
  })

  it("must sort arrays of objects with numeric strings in a smart way (asc)", () => {
    var b = A.sortBy(PRODUCTS, "price", "name");

    expect(b.length).toEqual(PRODUCTS.length, "sorting should not affect the array length");
    expect(b).toEqual(PRODUCTS, "sorting must sort and return the original array");

    // Behold the magic
    expect(b[0].name).toEqual("I");
    expect(b[0].price).toEqual("$ 10.66");
    expect(b[1].name).toEqual("K");
    expect(b[1].price).toEqual("$ 14.50");
    expect(b[2].name).toEqual("G");
    expect(b[2].price).toEqual("$ 20.20");
    expect(b[3].name).toEqual("L");
    expect(b[3].price).toEqual("$ 20.33");
    expect(b[4].name).toEqual("H");
    expect(b[4].price).toEqual("$ 21.20");
    expect(b[5].name).toEqual("O");
    expect(b[5].price).toEqual("$ 29.12");
    expect(b[6].name).toEqual("D");
    expect(b[6].price).toEqual("$ 30.20");
    expect(b[7].name).toEqual("N");
    expect(b[7].price).toEqual("$ 30.43");
    expect(b[8].name).toEqual("M");
    expect(b[8].price).toEqual("$ 31.54");
    expect(b[9].name).toEqual("F");
    expect(b[9].price).toEqual("$ 35.20");
    expect(b[10].name).toEqual("C");
    expect(b[10].price).toEqual("$ 40.10");
    expect(b[11].name).toEqual("B");
    expect(b[11].price).toEqual("$ 40.20");
    expect(b[12].name).toEqual("J");
    expect(b[12].price).toEqual("$ 40.20");
    expect(b[13].name).toEqual("E");
    expect(b[13].price).toEqual("$ 48.20");
    expect(b[14].name).toEqual("A");
    expect(b[14].price).toEqual("$ 60.00");
    expect(b[15].name).toEqual("P");
    expect(b[15].price).toEqual("$ 129.12");
    expect(b[16].name).toEqual("Q");
    expect(b[16].price).toEqual("$ 1,000.12");
    expect(b[17].name).toEqual("S");
    expect(b[17].price).toEqual("$ 2,129.12");
    expect(b[18].name).toEqual("R");
    expect(b[18].price).toEqual("$ 5,129.12");
  })

  it("must sort arrays of objects with numeric strings in a smart way (desc)", () => {
    var b = A.sortBy(PRODUCTS, { price: "desc", name: "desc" });

    expect(b.length).toEqual(PRODUCTS.length, "sorting should not affect the array length");
    expect(b).toEqual(PRODUCTS, "sorting must sort and return the original array");

    expect(b[0].name).toEqual("R");
    expect(b[0].price).toEqual("$ 5,129.12");
    expect(b[1].name).toEqual("S");
    expect(b[1].price).toEqual("$ 2,129.12");
    expect(b[2].name).toEqual("Q");
    expect(b[2].price).toEqual("$ 1,000.12");
    expect(b[3].name).toEqual("P");
    expect(b[3].price).toEqual("$ 129.12");
    expect(b[4].name).toEqual("A");
    expect(b[4].price).toEqual("$ 60.00");
    expect(b[5].name).toEqual("E");
    expect(b[5].price).toEqual("$ 48.20");
    expect(b[6].name).toEqual("J");
    expect(b[6].price).toEqual("$ 40.20");
    expect(b[7].name).toEqual("B");
    expect(b[7].price).toEqual("$ 40.20");
    expect(b[8].name).toEqual("C");
    expect(b[8].price).toEqual("$ 40.10");
    expect(b[9].name).toEqual("F");
    expect(b[9].price).toEqual("$ 35.20");
    expect(b[10].name).toEqual("M");
    expect(b[10].price).toEqual("$ 31.54");
    expect(b[11].name).toEqual("N");
    expect(b[11].price).toEqual("$ 30.43");
    expect(b[12].name).toEqual("D");
    expect(b[12].price).toEqual("$ 30.20");
    expect(b[13].name).toEqual("O");
    expect(b[13].price).toEqual("$ 29.12");
    expect(b[14].name).toEqual("H");
    expect(b[14].price).toEqual("$ 21.20");
    expect(b[15].name).toEqual("L");
    expect(b[15].price).toEqual("$ 20.33");
    expect(b[16].name).toEqual("G");
    expect(b[16].price).toEqual("$ 20.20");
    expect(b[17].name).toEqual("K");
    expect(b[17].price).toEqual("$ 14.50");
    expect(b[18].name).toEqual("I");
    expect(b[18].price).toEqual("$ 10.66");
  })

  it("must sort percentages in a smart way", () => {
    var b = A.sortBy(COLORS_PART, { blue: "asc" });

    expect(b.length).toEqual(COLORS_PART.length, "sorting should not affect the array length");
    expect(b).toEqual(COLORS_PART, "sorting must sort and return the original array");

    // NB: 1% is not close to 100%, like they would be in alphabetical order
    //
    expect(b[0].name).toEqual("Alien Armpit");
    expect(b[0].blue).toEqual("1%");
    expect(b[1].name).toEqual("Alloy orange");
    expect(b[1].blue).toEqual("6%");
    expect(b[2].name).toEqual("Acid green");
    expect(b[2].blue).toEqual("10%");
    expect(b[3].name).toEqual("Alabama crimson");
    expect(b[3].blue).toEqual("16%");
    expect(b[4].name).toEqual("Alizarin crimson");
    expect(b[4].blue).toEqual("21%");
    expect(b[5].name).toEqual("Air Force blue (USAF)");
    expect(b[5].blue).toEqual("56%");
    expect(b[6].name).toEqual("Air Force blue (RAF)");
    expect(b[6].blue).toEqual("66%");
    expect(b[7].name).toEqual("Absolute Zero");
    expect(b[7].blue).toEqual("73%");
    expect(b[8].name).toEqual("African violet");
    expect(b[8].blue).toEqual("75%");
    expect(b[9].name).toEqual("Air superiority blue");
    expect(b[9].blue).toEqual("76%");
    expect(b[10].name).toEqual("Aero blue");
    expect(b[10].blue).toEqual("90%");
    expect(b[11].name).toEqual("Aero");
    expect(b[11].blue).toEqual("91%");
    expect(b[12].name).toEqual("Alice blue");
    expect(b[12].blue).toEqual("100%");
  })

  it("must sort grades in a smart way", () => {
    var b = A.sortBy(COLORS_PART, { hue: "asc" });

    expect(b.length).toEqual(COLORS_PART.length, "sorting should not affect the array length");
    expect(b).toEqual(COLORS_PART, "sorting must sort and return the original array");

    // NB: 27° is not close to 204°, like they would be in alphabetical order
    //
    expect(b[0].name).toEqual("Alloy orange");
    expect(b[0].hue).toEqual("27°");
    expect(b[1].name).toEqual("Acid green");
    expect(b[1].hue).toEqual("65°");
    expect(b[2].name).toEqual("Alien Armpit");
    expect(b[2].hue).toEqual("85°");
    expect(b[3].name).toEqual("Aero blue");
    expect(b[3].hue).toEqual("151°");
    expect(b[4].name).toEqual("Air Force blue (RAF)");
    expect(b[4].hue).toEqual("204°");
    expect(b[5].name).toEqual("Air superiority blue");
    expect(b[5].hue).toEqual("205°");
    expect(b[6].name).toEqual("Aero");
    expect(b[6].hue).toEqual("206°");
    expect(b[7].name).toEqual("Alice blue");
    expect(b[7].hue).toEqual("208°");
    expect(b[8].name).toEqual("Absolute Zero");
    expect(b[8].hue).toEqual("217°");
    expect(b[9].name).toEqual("Air Force blue (USAF)");
    expect(b[9].hue).toEqual("220°");
    expect(b[10].name).toEqual("African violet");
    expect(b[10].hue).toEqual("288°");
    expect(b[11].name).toEqual("Alabama crimson");
    expect(b[11].hue).toEqual("346°");
    expect(b[12].name).toEqual("Alizarin crimson");
    expect(b[12].hue).toEqual("355°");
  })

  it("must sort grades in ascending order in a smart way, using arrays", () => {
    var b = A.sortBy(COLORS_PART, [["hue", 1]]);

    expect(b.length).toEqual(COLORS_PART.length, "sorting should not affect the array length");
    expect(b).toEqual(COLORS_PART, "sorting must sort and return the original array");

    // NB: 27° is not close to 204°, like they would be in alphabetical order
    //
    expect(b[0].name).toEqual("Alloy orange");
    expect(b[0].hue).toEqual("27°");
    expect(b[1].name).toEqual("Acid green");
    expect(b[1].hue).toEqual("65°");
    expect(b[2].name).toEqual("Alien Armpit");
    expect(b[2].hue).toEqual("85°");
    expect(b[3].name).toEqual("Aero blue");
    expect(b[3].hue).toEqual("151°");
    expect(b[4].name).toEqual("Air Force blue (RAF)");
    expect(b[4].hue).toEqual("204°");
    expect(b[5].name).toEqual("Air superiority blue");
    expect(b[5].hue).toEqual("205°");
    expect(b[6].name).toEqual("Aero");
    expect(b[6].hue).toEqual("206°");
    expect(b[7].name).toEqual("Alice blue");
    expect(b[7].hue).toEqual("208°");
    expect(b[8].name).toEqual("Absolute Zero");
    expect(b[8].hue).toEqual("217°");
    expect(b[9].name).toEqual("Air Force blue (USAF)");
    expect(b[9].hue).toEqual("220°");
    expect(b[10].name).toEqual("African violet");
    expect(b[10].hue).toEqual("288°");
    expect(b[11].name).toEqual("Alabama crimson");
    expect(b[11].hue).toEqual("346°");
    expect(b[12].name).toEqual("Alizarin crimson");
    expect(b[12].hue).toEqual("355°");
  })

  it("must sort number-like strings including non-numeric values in descending order in a smart way, using arrays", () => {
    var b = A.sortBy(HUE_MIX, [["hue", -1]]);

    expect(b.length).toEqual(HUE_MIX.length, "sorting should not affect the array length");
    expect(b).toEqual(HUE_MIX, "sorting must sort and return the original array");

    expect(b[0].hue).toEqual("900°");
    expect(b[1].hue).toEqual("800°");
    expect(b[2].hue).toEqual("600°");
    expect(b[3].hue).toEqual("90°");
    expect(b[4].hue).toEqual("80°");
    expect(b[5].hue).toEqual("60°");
    expect(b[6].hue).toEqual("50°");
    expect(b[7].hue).toEqual("9°");
    expect(b[8].hue).toEqual("8°");
    expect(b[9].hue).toEqual("6°");
    expect(b[10].hue).toEqual("5°");
    expect(b[11].hue).toEqual("__°");
  })

  it("must sort number-like strings including non-numeric values in ascending order in a smart way, using arrays", () => {
    var b = A.sortBy(HUE_MIX, [["hue", 1]]);

    expect(b.length).toEqual(HUE_MIX.length, "sorting should not affect the array length");
    expect(b).toEqual(HUE_MIX, "sorting must sort and return the original array");

    expect(b[0].hue).toEqual("__°");
    expect(b[1].hue).toEqual("5°");
    expect(b[2].hue).toEqual("6°");
    expect(b[3].hue).toEqual("8°");
    expect(b[4].hue).toEqual("9°");
    expect(b[5].hue).toEqual("50°");
    expect(b[6].hue).toEqual("60°");
    expect(b[7].hue).toEqual("80°");
    expect(b[8].hue).toEqual("90°");
    expect(b[9].hue).toEqual("600°");
    expect(b[10].hue).toEqual("800°");
    expect(b[11].hue).toEqual("900°");
  })

  it("must detect strings that can be sorted as numbers", () => {
    var a = A.lookSortableAsNumber("355°")
    expect(a).toEqual(355, "'355°' is sortable as a number")

    a = A.lookSortableAsNumber("3 000,50 PLN")
    expect(a).toEqual(3000.50, "'3 000,50 PLN' is sortable as a number")

    a = A.lookSortableAsNumber("$ 3 000,50")
    expect(a).toEqual(3000.50, "'$ 3 000,50' is sortable as a number")

    a = A.lookSortableAsNumber("50%")
    expect(a).toEqual(50, "'50%' is sortable as a number")

    a = A.lookSortableAsNumber("#000FFF")
    expect(a).toEqual(false, "'#000FFF' should not be sorted as a number")

    a = A.lookSortableAsNumber("40.00 $ 20.00 $")
    expect(a).toEqual(false, "'40.00 $ 20.00 $' should not be sorted as a number, because it contains more than one number")
  })

  it("must allow to search objects by string property", () => {
    var a = A.searchByStringProperty({
      pattern: "Luc",
      collection: PEOPLE,
      property: "name"
    });
    expect(a.length).toEqual(4, "only 4 items in test collection contain the letters 'luc' in their name property");
  })

  it("must allow to search objects by multiple string properties", () => {
    var a = A.searchByStringProperties({
      pattern: "a",
      collection: EXAMPLE,
      properties: "a b c".split(" "),
      keepSearchDetails: false
    });
    // console.log(JSON.stringify(a, 2, 2))
    expect(a.length).toEqual(4, "4 items in test collection contain the letter 'a' in any of their properties");
    expect(_.equal(a[0], {
      "a": "S",
      "b": "A",
      "c": "A"
    })).toEqual(true, "the item with more matches must be first in order");
    expect(_.equal(a[1], {
      "a": "A",
      "b": "S",
      "c": "Z"
    })).toEqual(true, "the item with a match in a left-side property must be first than others (properties are in order of importance)");
  })

  it("must allow to return details of properties that gave a match", () => {
    var a = A.searchByStringProperties({
      pattern: "a",
      collection: EXAMPLE,
      properties: "a b c".split(" "),
      keepSearchDetails: false,
      decorate: true
    });
    // console.log(JSON.stringify(a, 2, 2))
    expect(a.length).toEqual(4, "4 items in test collection contain the letter 'a' in any of their properties");
    expect(a[0].__search_matches__.indexOf("b") > -1 && a[0].__search_matches__.indexOf("c") > -1).toEqual(true, "the item with more matches has match in 'c' and 'b'");
    expect(_.equal(a[1].__search_matches__, ["a"])).toEqual(true, "the second item has a match in 'a'");
    expect(_.equal(a[2].__search_matches__, ["c"])).toEqual(true, "the third item has a match in 'c'");
  })

  it("must allow to search objects by string property, normalized values", () => {
    var a = A.searchByStringProperty({
      pattern: "Luk",
      collection: PEOPLE,
      property: "name"
    });
    expect(a.length).toEqual(1, "only 1 item in test collection contain the letters 'luk' in their normalized name property");
  })

  it("must allow to search objects by string property, disabling normalization", () => {
    var a = A.searchByStringProperty({
      pattern: "Luk",
      collection: PEOPLE,
      property: "name",
      normalize: false
    });
    expect(a.length).toEqual(0, "no items in the test collection contain exactly the letters 'Luk'");
  })

  it("must list which values respect text search condition", () => {
    var a = A.searchByStringProperty({
      pattern: "Luc",
      collection: PEOPLE,
      property: "name"
    });
    expect(a.length).toEqual(4, "only 4 items in test collection contain the letters 'luc' in their name property");
  })

  it("must normalize sort criteria (single string)", () => {
    var args = ["name"];
    var b = A.getSortCriteria(args);
    expect(b instanceof Array).toEqual(true, "returned object must be an array");
    expect(b.length).toEqual(1, "returned array must be an array with one child array");
    expect(b[0][0]).toEqual("name", "returned child array must contain as first item the property name");
    expect(b[0][1]).toEqual("asc", "returned child array must contain as default ascending order");
  })

  it("must normalize sort criteria (multiple strings)", () => {
    var args = ["name", "age", "foo"];
    var b = A.getSortCriteria(args);
    expect(b instanceof Array).toEqual(true, "returned object must be an array");
    expect(b.length).toEqual(3, "returned array must be an array with three children array");
    expect(b[0][0]).toEqual("name", "returned child array must contain as first item the property name");
    expect(b[0][1]).toEqual("asc", "returned child array must contain as default ascending order");

    expect(b[1][0]).toEqual("age", "returned child array must contain as first item the property name");
    expect(b[1][1]).toEqual("asc", "returned child array must contain as default ascending order");

    expect(b[2][0]).toEqual("foo", "returned child array must contain as first item the property name");
    expect(b[2][1]).toEqual("asc", "returned child array must contain as default ascending order");
  })

  it("must normalize sort criteria (object)", () => {
    var args = [{
      name: "asc",
      age: "desc",
      foo: "asc"
    }];
    var b = A.getSortCriteria(args);
    expect(b instanceof Array).toEqual(true, "returned object must be an array");
    expect(b.length).toEqual(3, "returned array must be an array with three children array");
    expect(b[0][0]).toEqual("name", "returned child array must contain as first item the property name");
    expect(b[0][1]).toEqual("asc", "returned child array must contain as default ascending order");

    expect(b[1][0]).toEqual("age", "returned child array must contain as first item the property name");
    expect(b[1][1]).toEqual("desc", "returned child array must contain as default ascending order");

    expect(b[2][0]).toEqual("foo", "returned child array must contain as first item the property name");
    expect(b[2][1]).toEqual("asc", "returned child array must contain as default ascending order");
  })

  it("must normalize sort criteria (object with single property)", () => {
    var args = [{
      name: "desc"
    }];
    var b = A.getSortCriteria(args);
    expect(b instanceof Array).toEqual(true, "returned object must be an array");
    expect(b.length).toEqual(1, "returned array must be an array with three children array");
    expect(b[0][0]).toEqual("name", "returned child array must contain as first item the property name");
    expect(b[0][1]).toEqual("desc", "returned child array must contain as default ascending order");
  })

  it("must allow to search by single string", () => {
    var a = A.search(PEOPLE_2, "Luc")
    expect(a instanceof Array).toEqual(true, "returned object must be an array");
    expect(a.length).toEqual(6, "6 items in PEOPLE_2 contain the letters 'Luc'");
  })

  it("must allow to search by multiple strings", () => {
    var a = A.search(PEOPLE_2, "Luc", "ada")
    expect(a instanceof Array).toEqual(true, "returned object must be an array");
    expect(a.length).toEqual(8, "8 items in PEOPLE_2 contain the letters 'Luc' or 'Ada'");
  })

  it("must normalize strings when searching by strings", () => {
    var a = A.search(PEOPLE_2, "Luk")
    expect(a instanceof Array).toEqual(true, "returned object must be an array");
    expect(a.length).toEqual(1, "1 item in PEOPLE_2 contain the letters 'Luk' --> 'Łukasz'");
  })

  it("must parse order by strings in SQL style", () => {
    var a = A.parseSortBy("name");
    expect(a).toEqual([["name", 1]]);

    var a = A.parseSortBy("name desc");
    expect(a).toEqual([["name", -1]]);

    var a = A.parseSortBy("name, age desc");
    expect(a).toEqual([["name", 1], ["age", -1]]);

    var a = A.parseSortBy("name desc, age desc");
    expect(a).toEqual([["name", -1], ["age", -1]]);
  })

  it("must convert sort by criteria in human readable strings", () => {
    var a = A.humanSortBy([["name", 1]]);
    expect(a).toEqual("name");

    var a = A.humanSortBy([["name", -1]]);
    expect(a).toEqual("name desc");

    var a = A.humanSortBy([["name", 1], ["age", -1]]);
    expect(a).toEqual("name, age desc");

    var a = A.humanSortBy([["name", -1], ["age", -1]]);
    expect(a).toEqual("name desc, age desc");
  })
});
