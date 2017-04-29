/**
 * Tests for KingTable normal mode (paginated remotely - e.g. on the server side).
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import KingTable from "../scripts/tables/kingtable";
import _ from "../scripts/utils";
import { MockConsole } from "../tests/mock/console"
var Promise = require("es6-promise").Promise;

// disable the KingTable LRU cache while unit testing,
// since it would require an id for each table
KingTable.defaults.lruCacheSize = 0;
KingTable.prototype.getFiltersStore = () => { return null; };

global.addEventListener('unhandledrejection', event => {
  console.log("************************************");
  console.log(event);
});

class KingTablePaginated extends KingTable {
/**
 * Overrides the getFetchPromise function to return hard coded data;
 * for testing purpose.
 */
  getMockData(o) {
  switch (o.page) {
    case 1:
      return [
        ["id", "name", "value", "time"],
        [1, "AAA", "A11", "2017-02-01T10:25:40.000Z"],
        [2, "BBB", "B11", "2017-02-02T10:25:40.000Z"],
        [3, "CCC", "C11", "2017-02-03T10:25:40.000Z"],
        [4, "DDD", "D11", "2017-02-04T10:25:40.000Z"],
        [5, "EEE", "E11", "2017-02-05T10:25:40.000Z"]
      ];
    case 2:
      return [
        ["id", "name", "value", "time"],
        [6, "FFF", "F11", "2017-02-06T10:25:40.000Z"],
        [7, "GGG", "G11", "2017-02-07T10:25:40.000Z"],
        [8, "HHH", "H11", "2017-02-08T10:25:40.000Z"],
        [9, "III", "I11", "2017-02-09T10:25:40.000Z"],
        [10, "JJJ", "J11", "2017-02-10T10:25:40.000Z"]
      ];
    case 3:
      return [
        ["id", "name", "value", "time"],
        [11, "KKK", "K11", "2017-02-11T10:25:40.000Z"],
        [12, "LLL", "L11", "2017-02-12T10:25:40.000Z"],
        [13, "MMM", "M11", "2017-02-13T10:25:40.000Z"],
        [14, "NNN", "N11", "2017-02-14T10:25:40.000Z"],
        [15, "OOO", "O11", "2017-02-15T10:25:40.000Z"]
      ];
    case 4:
      return [
        ["id", "name", "value", "time"],
        [16, "PPP", "P11", "2017-02-16T10:25:40.000Z"],
        [17, "QQQ", "Q11", "2017-02-17T10:25:40.000Z"],
        [18, "RRR", "R11", "2017-02-18T10:25:40.000Z"],
        [19, "SSS", "S11", "2017-02-19T10:25:40.000Z"],
        [20, "TTT", "T11", "2017-02-20T10:25:40.000Z"]
      ];
    case 5:
      return [
        ["id", "name", "value", "time"],
        [21, "UUU", "U11", "2017-02-21T10:25:40.000Z"],
        [22, "VVV", "V11", "2017-02-22T10:25:40.000Z"],
        [23, "WWW", "W11", "2017-02-23T10:25:40.000Z"],
        [24, "XXX", "X11", "2017-02-24T10:25:40.000Z"],
        [25, "YYY", "Y11", "2017-02-25T10:25:40.000Z"]
      ];
    case 6:
      return [
        ["id", "name", "value", "time"],
        [26, "ZZZ", "Z11", "2017-02-26T00:03:00.000Z"]
      ];
    }
  }

  getFetchPromise(options) {
    return new Promise((resolve, reject) => {
      // resolve with a page catalog: a paginated set of results.
      setTimeout(() => {
        resolve({
          total: 26,
          items: KingTable.json.clone(this.getMockData(options))
        })
      }, 0)
    });
  }
}

describe("KingTable (normal mode)", () => {

  it("must log an user-friendly message if url parameter is missing", () => {
    var mock = new MockConsole()

    mock.fire(() => {
      var table = new KingTable();
      table.render().catch(() => { /* gnom gnom */ });
    })

    expect(mock.log[0]).toEqual("ERROR: Missing url option, to fetch data. For further details: https://github.com/RobertoPrevato/KingTable/wiki/Errors#5")
    // dispose the mock console
    mock.dispose()
  });

  it("must fetch items by page number", always => {
    var a = new KingTablePaginated({
      resultsPerPage: 5
    });

    function onFail() {
      always()
    }

    // disable automatic rendering upon page change
    a.pagination.onPageChange = function () {}

    // items must be paginated
    var data = a.getData();
    expect(data.length).toEqual(0, "because the table list need to be fetched first")

    a.getList().then(function done() {

      var data = a.getData();
      expect(data.length).toEqual(5, "first page must contain 5 items");
      expect(data.length).toEqual(a.pagination.resultsPerPage, "first page must contain {pagination.resultsPerPage} items");

      const rowNum = "ε_row", n = "name";
      expect(data[0][rowNum]).toEqual("1");
      expect(data[1][rowNum]).toEqual("2");
      expect(data[2][rowNum]).toEqual("3");
      expect(data[0][n]).toEqual("AAA");
      expect(data[1][n]).toEqual("BBB");
      expect(data[2][n]).toEqual("CCC");

      // go to next page
      a.pagination.next();
      a.getList().then(function done() {
        var data = a.getData();
        expect(data.length).toEqual(5, "second page must contain 30 items");
        expect(data.length).toEqual(a.pagination.resultsPerPage, "second page must contain {pagination.resultsPerPage} items");

        // the page number must increase:
        expect(data[0][rowNum]).toEqual("6");
        expect(data[1][rowNum]).toEqual("7");
        expect(data[2][rowNum]).toEqual("8");
        expect(data[0][n]).toEqual("FFF");
        expect(data[1][n]).toEqual("GGG");
        expect(data[2][n]).toEqual("HHH");

        // go to next page
        a.pagination.next();
        a.getList().then(function done() {
          var data = a.getData();
          expect(data.length).toEqual(5, "nth page must contain 30 items");
          expect(data.length).toEqual(a.pagination.resultsPerPage, "nth page must contain {pagination.resultsPerPage} items");

          // the page number must increase:
          expect(data[0][rowNum]).toEqual("11");
          expect(data[1][rowNum]).toEqual("12");
          expect(data[2][rowNum]).toEqual("13");
          expect(data[0][n]).toEqual("KKK");
          expect(data[1][n]).toEqual("LLL");
          expect(data[2][n]).toEqual("MMM");
          // go to next page
          a.pagination.next();
          a.getList().then(function done() {
            var data = a.getData();
            expect(data.length).toEqual(5, "nth page must contain 30 items");
            expect(data.length).toEqual(a.pagination.resultsPerPage, "nth page must contain {pagination.resultsPerPage} items");

            // the page number must increase:
            expect(data[0][rowNum]).toEqual("16");
            expect(data[1][rowNum]).toEqual("17");
            expect(data[2][rowNum]).toEqual("18");
            expect(data[0][n]).toEqual("PPP");
            expect(data[1][n]).toEqual("QQQ");
            expect(data[2][n]).toEqual("RRR");

            // go to next page
            a.pagination.next();
            a.getList().then(function done() {
              var data = a.getData();
              expect(data.length).toEqual(5, "nth page must contain 30 items");
              expect(data.length).toEqual(a.pagination.resultsPerPage, "nth page must contain {pagination.resultsPerPage} items");

              // the page number must increase:
              expect(data[0][rowNum]).toEqual("21");
              expect(data[1][rowNum]).toEqual("22");
              expect(data[2][rowNum]).toEqual("23");
              expect(data[0][n]).toEqual("UUU");
              expect(data[1][n]).toEqual("VVV");
              expect(data[2][n]).toEqual("WWW");

              // go to next page (last)
              a.pagination.next();
              a.getList().then(function done() {
                var data = a.getData();
                expect(data.length).toEqual(1, "the last page contains only the Z");

                // the page number must increase:
                expect(data[0][rowNum]).toEqual("26");
                expect(data[0][n]).toEqual("ZZZ");
                always();
              }, onFail)
            }, onFail)
          }, onFail)
        }, onFail)
      }, onFail)
    }, onFail);
  })

  // ************************************************************************************************************** //
  // NB: currently, dates are parsed automatically only when using default getFetchPromise,
  // which is using AJAX; by design parsing happens automatically when getting the response from the server
  // This also mean that if somebody implements a custom getFetchPromise, he's responsible for proper value types
  // (Dates are not parsed automatically for custom getFetchPromise implementations).
  // ************************************************************************************************************** //
  it("must parse dates automatically", always => {
    var a = new KingTablePaginated({
      resultsPerPage: 5
    });

    function onFail() {
      always()
    }

    // disable automatic rendering upon page change
    a.pagination.onPageChange = function () {}

    // items must be paginated
    var data = a.getData();
    expect(data.length).toEqual(0, "because the table list need to be fetched first")

    a.getList().then(function done() {

      var data = a.getData();
      expect(data.length).toEqual(5, "first page must contain 5 items");
      expect(data.length).toEqual(a.pagination.resultsPerPage, "first page must contain {pagination.resultsPerPage} items");

      const n = "time";
      expect(data[0][n] instanceof Date).toEqual(true, "dates must be parsed automatically");
      expect(data[1][n] instanceof Date).toEqual(true, "dates must be parsed automatically");
      expect(data[2][n] instanceof Date).toEqual(true, "dates must be parsed automatically");

      always();
    }, onFail);
  })

  it("must create string representations of dates and numbers", always => {
    var a = new KingTablePaginated({
      resultsPerPage: 5
    });

    function onFail() {
      always()
    }

    // disable automatic rendering upon page change
    a.pagination.onPageChange = function () {}

    // items must be paginated
    var data = a.getData();
    expect(data.length).toEqual(0, "because the table list need to be fetched first")

    a.getList().then(function done() {

      var data = a.getData();
      expect(data.length).toEqual(5, "first page must contain 5 items");
      expect(data.length).toEqual(a.pagination.resultsPerPage, "first page must contain {pagination.resultsPerPage} items");

      const n = "time_(formatted)";
      const o = "score_(formatted)"
      expect(typeof data[0][n]).toEqual("string", "dates must be formatted");
      expect(typeof data[1][n]).toEqual("string", "dates must be parsed");
      expect(typeof data[2][n]).toEqual("string", "dates must be parsed");
      expect(typeof data[0][n]).toEqual("string", "numeric properties must be formatted");
      expect(typeof data[1][n]).toEqual("string", "numeric properties must be parsed");
      expect(typeof data[2][n]).toEqual("string", "numeric properties must be parsed");

      always();
    }, onFail);
  })
});
