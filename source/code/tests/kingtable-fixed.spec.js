/**
 * Tests for KingTable fixed mode.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import KingTable from "../scripts/tables/kingtable";
import { MockConsole } from "../tests/mock/console"
import COLORS from "../tests/data/colors"
import LATEST_SCORES from "../tests/data/latest-scores"
import _ from "../scripts/utils";
var Promise = require("es6-promise").Promise;

// disable the KingTable LRU cache while unit testing,
// since it would require an id for each table
KingTable.defaults.lruCacheSize = 0;
KingTable.prototype.getFiltersStore = () => { return null; };

describe("KingTable (fixed mode)", () => {

  it("must log an user-friendly message if data is not an array", () => {
    var mock = new MockConsole()

    mock.fire(() => {
      var table = new KingTable({
        data: "Wrong parameters"
      });
      table.render().catch(() => { /* gnom gnom */ });
    })

    expect(mock.log[0]).toEqual("ERROR: Data is not an array. For further details: https://github.com/RobertoPrevato/KingTable/wiki/Errors#3")
    // dispose the mock console
    mock.dispose()
  });

  it("must update items numbers when changing page", () => {
    var a = new KingTable({
      data: COLORS,
      resultsPerPage: 30
    })

    expect(a.fixed).toEqual(true, "fixed because initialized with data");

    // items must be paginated
    var data = a.getData();
    expect(data.length).toEqual(30, "first page must contain 30 items");
    expect(data.length).toEqual(a.pagination.resultsPerPage, "first page must contain {pagination.resultsPerPage} items");

    const rowNum = "ε_row";
    expect(data[0][rowNum]).toEqual("1");
    expect(data[1][rowNum]).toEqual("2");
    expect(data[2][rowNum]).toEqual("3");

    // go to next page
    a.pagination.next();

    var data = a.getData();
    expect(data.length).toEqual(30, "second page must contain 30 items");
    expect(data.length).toEqual(a.pagination.resultsPerPage, "second page must contain {pagination.resultsPerPage} items");

    // the page number must increase:
    expect(data[0][rowNum]).toEqual("31");
    expect(data[1][rowNum]).toEqual("32");
    expect(data[2][rowNum]).toEqual("33");

    // go to next page
    a.pagination.next();

    var data = a.getData();
    expect(data.length).toEqual(30, "second page must contain 30 items");
    expect(data.length).toEqual(a.pagination.resultsPerPage, "second page must contain {pagination.resultsPerPage} items");

    // the page number must increase:
    expect(data[0][rowNum]).toEqual("61");
    expect(data[1][rowNum]).toEqual("62");
    expect(data[2][rowNum]).toEqual("63");
  })

  it("must parse dates automatically", () => {
    var a = new KingTable({
      data: LATEST_SCORES,
      resultsPerPage: 20,
      searchDelay: null
    })

    // search by string representation of a date:
    var data = a.data;
    for (var i = 0, l = data.length; i < l; i++) {
      var item = data[i];
      expect(item.time instanceof Date).toEqual(true, "time given in string format must be parsed automatically as date")
    }
  })

  it("must create string representations of dates and numbers", () => {
    var a = new KingTable({
      data: LATEST_SCORES,
      resultsPerPage: 20,
      searchDelay: null
    })

    // search by string representation of a date:
    var data = a.data;
    for (var i = 0, l = data.length; i < l; i++) {
      var item = data[i];
      expect(typeof item["time_(formatted)"]).toEqual("string", "dates must be formatted")
      expect(typeof item["score_(formatted)"]).toEqual("string", "numeric values must be formatted")
    }
  })

  it("must search in string representations of dates", () => {
    var a = new KingTable({
      data: LATEST_SCORES,
      resultsPerPage: 20,
      searchDelay: null
    })

    // search by string representation of a date:
    a.search("03.02.2017")
    var data = a.getData();
    expect(data.length).toEqual(1, "only one item in mock data contains a date that in default culture looks like '03.02.2017'");
    expect(data[0].score).toEqual(16938, "the score of the game at '03.02.2017' is 16938");
  })
});
