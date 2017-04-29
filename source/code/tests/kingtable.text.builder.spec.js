/**
 * Tests for KingTableTextBuilder class.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import KingTableTextBuilder from "../scripts/tables/kingtable.text.builder";
import COLORS from "../tests/data/colors"
import LATEST_SCORES from "../tests/data/latest-scores"
import _ from "../scripts/utils";

describe("KingTableTextBuilder", () => {

  it("must output data in plain text tabular format", () => {
    var a = new KingTableTextBuilder();

    var txt = a.tabulate(["id", "name", "value"],
    [
      [1, "AAA", "A11"],
      [2, "BBB", "B11"],
      [3, "CCC", "C11"],
      [4, "DDD", "D11"]
    ], { headersAlignment: "c" });

    /*
      +----+------+-------+
      | id | name | value |
      +----+------+-------+
      | 1  | AAA  | A11   |
      +----+------+-------+
      | 2  | BBB  | B11   |
      +----+------+-------+
      | 3  | CCC  | C11   |
      +----+------+-------+
      | 4  | DDD  | D11   |
      +----+------+-------+
    */
    expect(txt.indexOf("+----+------+-------+") > -1).toEqual(true);
    expect(txt.indexOf("| id | name | value |") > -1).toEqual(true);
    expect(txt.indexOf("| 1  | AAA  | A11   |") > -1).toEqual(true);
    expect(txt.indexOf("| 2  | BBB  | B11   |") > -1).toEqual(true);
    expect(txt.indexOf("| 3  | CCC  | C11   |") > -1).toEqual(true);
    expect(txt.indexOf("| 4  | DDD  | D11   |") > -1).toEqual(true);

    var lines = txt.split(/\n/g);
    var width = lines[0].length;
    for (var i = 0, l = lines.length - 1; i < l; i++) {
      expect(lines[i].length).toEqual(width, "all lines width must be equal");
    }
  });

  it("must handle CRLF inside values", () => {
    var a = new KingTableTextBuilder();

    var txt = a.tabulate(["id", "name", "value"],
    [
      [1, "AAA", "A11\r\nFOO"],
      [2, "BBB", "B11"],
      [3, "CCC", "C11"],
      [4, "DDD", "D11"]
    ], { headersAlignment: "c" });

    /*
      +----+------+-----------+
      | id | name | value     |
      +----+------+-----------+
      | 1  | AAA  | A11␍␊FOO |
      +----+------+-----------+
      | 2  | BBB  | B11       |
      +----+------+-----------+
      | 3  | CCC  | C11       |
      +----+------+-----------+
      | 4  | DDD  | D11       |
      +----+------+-----------+
    */
    expect(txt.indexOf("| 1  | AAA  | A11␍␊FOO |") > -1).toEqual(true);

    var lines = txt.split(/\n/g);
    var width = lines[0].length;
    for (var i = 0, l = lines.length - 1; i < l; i++) {
      expect(lines[i].length).toEqual(width, "all lines width must be equal");
    }
  });

  it("must render pagination information", () => {
    var a = new KingTableTextBuilder();
    var s = a.paginationInfo({
      page: 10
    });

    expect(s).toEqual("Page 10");

    var s = a.paginationInfo({
      page: 10,
      totalPageCount: 20
    });
    expect(s).toEqual("Page 10 of 20");

    var s = a.paginationInfo({
      page: 10,
      totalPageCount: 20,
      resultsPerPage: 30,
      firstObjectNumber: 301,
      lastObjectNumber: 331
    });
    expect(s).toEqual("Page 10 of 20 - Results 301 - 331");

    var s = a.paginationInfo({
      page: 10,
      totalPageCount: 20,
      firstObjectNumber: 301,
      lastObjectNumber: 331,
      totalItemsCount: 580
    });
    expect(s).toEqual("Page 10 of 20 - Results 301 - 331 of 580");
  });

  it("must render table caption (longer than contents)", () => {
    var a = new KingTableTextBuilder();
    var txt = a.tabulate(["id", "name", "value"],
    [
      [1, "AAA", "A11"],
      [2, "BBB", "B11"],
      [3, "CCC", "C11"],
      [4, "DDD", "D11"]
    ], { caption: "Lorem ipsum dolor sit amet" });

    /*
      ==============================
      | Lorem ipsum dolor sit amet |
      ==============================
      | id | name | value          |
      ==============================
      | 1  | AAA  | A11            |
      +----+------+----------------+
      | 2  | BBB  | B11            |
      +----+------+----------------+
      | 3  | CCC  | C11            |
      +----+------+----------------+
      | 4  | DDD  | D11            |
      +----+------+----------------+
    */
    expect(txt.indexOf("Lorem ipsum dolor sit amet")).not.toEqual(-1, "generated text must contain caption");
    var lines = txt.split(/\n/g);
    var width = lines[0].length;
    for (var i = 0, l = lines.length - 1; i < l; i++) {
      expect(lines[i].length).toEqual(width, "all lines width must be equal");
    }
  });

  it("must render table caption plus pagination info (longer than contents)", () => {
    var a = new KingTableTextBuilder();
    var txt = a.tabulate(["id", "name", "value"],
    [
      [1, "AAA", "A11"],
      [2, "BBB", "B11"],
      [3, "CCC", "C11"],
      [4, "DDD", "D11"]
    ], { caption: "Lorem ipsum dolor sit amet", page: 1, totalPageCount: 10, resultsPerPage: 4, firstObjectNumber: 1, lastObjectNumber: 4 });

    /*
      =====================================================
      | Lorem ipsum dolor sit amet                        |
      | Page 1 of 10 - Results per page 4 - Results 1 - 4 |
      =====================================================
      | id | name | value                                 |
      =====================================================
      | 1  | AAA  | A11                                   |
      +----+------+---------------------------------------+
      | 2  | BBB  | B11                                   |
      +----+------+---------------------------------------+
      | 3  | CCC  | C11                                   |
      +----+------+---------------------------------------+
      | 4  | DDD  | D11                                   |
      +----+------+---------------------------------------+
    */
    expect(txt.indexOf("Lorem ipsum dolor sit amet")).not.toEqual(-1, "generated text must contain caption");
    expect(txt.indexOf("Page 1 of 10")).not.toEqual(-1, "generated text must contain page number and total");
    expect(txt.indexOf("Results 1 - 4")).not.toEqual(-1, "generated text must contain results range");

    var lines = txt.split(/\n/g);
    var width = lines[0].length;
    for (var i = 0, l = lines.length - 1; i < l; i++) {
      expect(lines[i].length).toEqual(width, "all lines width must be equal");
    }
  });

  it("must render table caption plus pagination info (shorter than contents)", () => {
    var a = new KingTableTextBuilder();
    var txt = a.tabulate(["id", "name", "value"],
    [
      [1, "AAA", "A11"],
      [2, "BBB", "B11"],
      [3, "CCC", "C11"],
      [4, "DDD", "D11"]
    ], { caption: "Lorem", page: 1, totalPageCount: 10 });

    /*
      =====================
      | Lorem             |
      | Page 1 of 10      |
      =====================
      | id | name | value |
      =====================
      | 1  | AAA  | A11   |
      +----+------+-------+
      | 2  | BBB  | B11   |
      +----+------+-------+
      | 3  | CCC  | C11   |
      +----+------+-------+
      | 4  | DDD  | D11   |
      +----+------+-------+
    */
    expect(txt.indexOf("Lorem")).not.toEqual(-1, "generated text must contain caption");
    expect(txt.indexOf("Page 1 of 10")).not.toEqual(-1, "generated text must contain page number and total");

    var lines = txt.split(/\n/g);
    var width = lines[0].length;
    for (var i = 0, l = lines.length - 1; i < l; i++) {
      expect(lines[i].length).toEqual(width, "all lines width must be equal");
    }
  });

  it("must render table caption plus pagination info (caption longer than contents and page info)", () => {
    var a = new KingTableTextBuilder();
    var txt = a.tabulate(["id", "name", "value"],
    [
      [1, "AAA", "A11"],
      [2, "BBB", "B11"],
      [3, "CCC", "C11"],
      [4, "DDD", "D11"]
    ], { caption: "Lorem ipsum dolor sit amet consectetur", page: 1, totalPageCount: 10 });

    /*
      ==========================================
      | Lorem ipsum dolor sit amet consectetur |
      | Page 1 of 10                           |
      ==========================================
      | id | name | value                      |
      ==========================================
      | 1  | AAA  | A11                        |
      +----+------+----------------------------+
      | 2  | BBB  | B11                        |
      +----+------+----------------------------+
      | 3  | CCC  | C11                        |
      +----+------+----------------------------+
      | 4  | DDD  | D11                        |
      +----+------+----------------------------+
    */
    expect(txt.indexOf("Lorem")).not.toEqual(-1, "generated text must contain caption");
    expect(txt.indexOf("Page 1 of 10")).not.toEqual(-1, "generated text must contain page number and total");

    var lines = txt.split(/\n/g);
    var width = lines[0].length;
    for (var i = 0, l = lines.length - 1; i < l; i++) {
      expect(lines[i].length).toEqual(width, "all lines width must be equal");
    }
  });

  it("must render table caption plus pagination info (page info longer than contents and caption)", () => {
    var a = new KingTableTextBuilder();
    var txt = a.tabulate(["id", "name", "value"],
    [
      [1, "AAA", "A11"],
      [2, "BBB", "B11"],
      [3, "CCC", "C11"],
      [4, "DDD", "D11"]
    ], { caption: "Lorem", page: 1, totalPageCount: 10, resultsPerPage: 4, firstObjectNumber: 1, lastObjectNumber: 4 });

    /*
      =====================================================
      | Lorem                                             |
      | Page 1 of 10 - Results per page 4 - Results 1 - 4 |
      =====================================================
      | id | name | value                                 |
      =====================================================
      | 1  | AAA  | A11                                   |
      +----+------+---------------------------------------+
      | 2  | BBB  | B11                                   |
      +----+------+---------------------------------------+
      | 3  | CCC  | C11                                   |
      +----+------+---------------------------------------+
      | 4  | DDD  | D11                                   |
      +----+------+---------------------------------------+
    */
    expect(txt.indexOf("Lorem")).not.toEqual(-1, "generated text must contain caption");
    expect(txt.indexOf("Page 1 of 10")).not.toEqual(-1, "generated text must contain page number and total");

    var lines = txt.split(/\n/g);
    var width = lines[0].length;
    for (var i = 0, l = lines.length - 1; i < l; i++) {
      expect(lines[i].length).toEqual(width, "all lines width must be equal");
    }
  });

  it("must render table caption (shorter than contents)", () => {
    var a = new KingTableTextBuilder();
    var txt = a.tabulate(["id", "name", "value"],
    [
      [1, "AAA", "A11"],
      [2, "BBB", "B11"],
      [3, "CCC", "C11"],
      [4, "DDD", "D11"]
    ], { caption: "Lorem" });

    /*
      =====================
      | Lorem             |
      =====================
      | id | name | value |
      =====================
      | 1  | AAA  | A11   |
      +----+------+-------+
      | 2  | BBB  | B11   |
      +----+------+-------+
      | 3  | CCC  | C11   |
      +----+------+-------+
      | 4  | DDD  | D11   |
      +----+------+-------+
    */
    expect(txt.indexOf("Lorem")).not.toEqual(-1, "generated text must contain caption");

    var lines = txt.split(/\n/g);
    var width = lines[0].length;
    for (var i = 0, l = lines.length - 1; i < l; i++) {
      expect(lines[i].length).toEqual(width, "all lines width must be equal");
    }
  });

  it("must render table pagination info (longer than contents)", () => {
    var a = new KingTableTextBuilder();
    var txt = a.tabulate(["id", "name", "value"],
    [
      [1, "AAA", "A11"],
      [2, "BBB", "B11"],
      [3, "CCC", "C11"],
      [4, "DDD", "D11"]
    ], { page: 1, totalPageCount: 10, resultsPerPage: 4, firstObjectNumber: 1, lastObjectNumber: 4 });

    /*
      =====================================================
      | Page 1 of 10 - Results per page 4 - Results 1 - 4 |
      =====================================================
      | id | name | value                                 |
      =====================================================
      | 1  | AAA  | A11                                   |
      +----+------+---------------------------------------+
      | 2  | BBB  | B11                                   |
      +----+------+---------------------------------------+
      | 3  | CCC  | C11                                   |
      +----+------+---------------------------------------+
      | 4  | DDD  | D11                                   |
      +----+------+---------------------------------------+
    */
    expect(txt.indexOf("Page 1 of 10")).not.toEqual(-1, "generated text must contain page number and total");

    var lines = txt.split(/\n/g);
    var width = lines[0].length;
    for (var i = 0, l = lines.length - 1; i < l; i++) {
      expect(lines[i].length).toEqual(width, "all lines width must be equal");
    }
  });

  it("must render table pagination info (shorter than contents)", () => {
    var a = new KingTableTextBuilder();
    var txt = a.tabulate(["id", "name", "value"],
    [
      [1, "AAA", "A11"],
      [2, "BBB", "B11"],
      [3, "CCC", "C11"],
      [4, "DDD", "D11"]
    ], { page: 1, totalPageCount: 10 });

    /*
      =====================
      | Page 1 of 10      |
      =====================
      | id | name | value |
      =====================
      | 1  | AAA  | A11   |
      +----+------+-------+
      | 2  | BBB  | B11   |
      +----+------+-------+
      | 3  | CCC  | C11   |
      +----+------+-------+
      | 4  | DDD  | D11   |
      +----+------+-------+
    */
    expect(txt.indexOf("Page 1 of 10")).not.toEqual(-1, "generated text must contain page number and total");

    var lines = txt.split(/\n/g);
    var width = lines[0].length;
    for (var i = 0, l = lines.length - 1; i < l; i++) {
      expect(lines[i].length).toEqual(width, "all lines width must be equal");
    }
  });
});
