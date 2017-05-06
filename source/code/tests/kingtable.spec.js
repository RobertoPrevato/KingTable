/**
 * Core tests for KingTable class.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import KingTable from "../scripts/tables/kingtable"
import { MockConsole } from "../tests/mock/console"
import _ from "../scripts/utils"
import LATEST_SCORES from "../tests/data/latest-scores"
var Promise = require("es6-promise").Promise

// disable the KingTable LRU cache while unit testing,
// since it would require an id for each table
KingTable.defaults.lruCacheSize = 0;

global.addEventListener('unhandledrejection', event => {
  console.log("************************************");
  console.log(event);
});

class TestKingTableFixed extends KingTable {
  /**
   * Overrides the getFetchPromise function to return hard coded data;
   * for testing purpose.
   */
    getFetchPromise() {
      return new Promise((resolve, reject) => {
        // resolve with an array of items: in this case the table is 'fixed'
        // (it is assumed that the array contains all items)
        setTimeout(() => {
          resolve([
            ["id", "name", "value"],
            [1, "AAA", "A11"],
            [2, "BBB", "B11"],
            [3, "CCC", "C11"],
            [4, "DDD", "D11"],
            [5, "EEE", "E11"]
          ])
        }, 0)
      });
    }
}

// TODO: test following scenario
class TestKingTableFixedEmptyNoColumns extends KingTable {
  /**
   * Overrides the getFetchPromise function to return hard coded data;
   * for testing purpose.
   */
    getFetchPromise() {
      return new Promise((resolve, reject) => {
        // resolve with an empty array of items: in this case the table is 'fixed'
        // and does not know much about its data.
        setTimeout(() => {
          resolve([])
        }, 0)
      });
    }
}

describe("KingTable", () => {

  it("must have a version number", () => {
    var version = KingTable.version;
    expect(/\d\.\d\.\d/.test(version)).toEqual(true);
  });

  it("must allow to normalize optimized collections", () => {
    var table = new KingTable();

    var data = [
      ["id", "name", "value"],
      [1, "AAA", "A11"],
      [2, "BBB", "B11"],
      [3, "CCC", "C11"],
      [4, "DDD", "D11"],
      [5, "EEE", "E11"]
    ];

    expect(_.equal([
      {
        "id": 1,
        "name": "AAA",
        "value": "A11"
      },
      {
        "id": 2,
        "name": "BBB",
        "value": "B11"
      },
      {
        "id": 3,
        "name": "CCC",
        "value": "C11"
      },
      {
        "id": 4,
        "name": "DDD",
        "value": "D11"
      },
      {
        "id": 5,
        "name": "EEE",
        "value": "E11"
      }
    ], table.normalizeCollection(data))).toEqual(true);
  });

  it("must have default options", () => {
    var table = new KingTable();
    var options = table.options;
    expect(options).toEqual(jasmine.any(Object));

    expect(options.page).toEqual(1, "initial default page number must be 1")
    expect(options.resultsPerPage).toEqual(jasmine.any(Number), "initial default page size must be a number");
    expect(options.resultsPerPage).toEqual(KingTable.defaults.resultsPerPage, "initial default page size must be the same as KingTable.defaults")
  })

  it("must allow to override default options", () => {
    var table = new KingTable({
      url: "/dyna/test",
      page: 20,
      resultsPerPage: 120
    });
    var options = table.options;
    expect(options).toEqual(jasmine.any(Object));

    expect(options.url).toEqual("/dyna/test", "fetch url must be configurable")
    expect(options.page).toEqual(20, "initial page number must be configurable")
    expect(options.resultsPerPage).toEqual(120, "page size must be configurable")
  })

  it("must allow to define a table id", () => {
    var table = new KingTable({
      id: "test-id",
      url: "/dyna/test",
      page: 20,
      resultsPerPage: 120
    });
    var options = table.options;
    expect(options).toEqual(jasmine.any(Object));

    expect(table.id).toEqual("test-id", "table id must be stored inside the table itself")
  })

  it("memory keys must contain the table id", () => {
    var table = new KingTable({
      id: "test-id",
      url: "/dyna/test",
      page: 20,
      resultsPerPage: 120
    });
    var options = table.options;
    expect(options).toEqual(jasmine.any(Object));

    expect(table.id).toEqual("test-id", "table id must be stored inside the table itself")
    expect(table.getMemoryKey("name").indexOf(table.id) > -1).toEqual(true, "table id must be included in memory keys");
  })

  it("must allow to create an instance with data (optimized array)", () => {
    var data = [
      ["id", "name", "value"],
      [1, "AAA", "A11"],
      [2, "BBB", "B11"],
      [3, "CCC", "C11"],
      [4, "DDD", "D11"],
      [5, "EEE", "E11"]
    ];
    var table = new KingTable({
      data: data
    });

    // expect the table to be fixed by default, when instantiated with data
    // and no "fixed" option
    expect(table.fixed).toEqual(true, "when instantiated with data, the table is fixed by default");
    expect(table.pagination.totalItemsCount).toEqual(data.length - 1, "pagination totalItemsCount must equal the total number of items in data");

    // expect the data to be normalized upon initialization (and formatted)
    expect(_.equal([
      {
        "id": 1,
        "id_(formatted)": "1",
        "name": "AAA",
        "value": "A11"
      },
      {
        "id": 2,
        "id_(formatted)": "2",
        "name": "BBB",
        "value": "B11"
      },
      {
        "id": 3,
        "id_(formatted)": "3",
        "name": "CCC",
        "value": "C11"
      },
      {
        "id": 4,
        "id_(formatted)": "4",
        "name": "DDD",
        "value": "D11"
      },
      {
        "id": 5,
        "id_(formatted)": "5",
        "name": "EEE",
        "value": "E11"
      }
    ], table.normalizeCollection(table.data))).toEqual(true);
  });

  it("must allow to create an instance with data (not optimized array)", () => {
    var data = LATEST_SCORES;
    var table = new KingTable({
      data: data
    });

    // expect the table to be fixed by default, when instantiated with data
    // and no "fixed" option
    expect(table.fixed).toEqual(true, "when instantiated with data, the table is fixed by default");
    expect(table.data.length).toEqual(data.length, "when instantiated with data, the data must be available through table.data property");
  })

  it("must extract columns information", () => {
    var table = new KingTable({
      data: [
        ["id", "name", "value", "loremIpsum"],
        [1, "AAA", "A11", 555],
        [2, "BBB", "B11", 777],
        [3, "CCC", "C11", 888],
        [4, "DDD", "D11", 999],
        [5, "EEE", "E11", 1000]
      ],
      columns: {
        "name": "Name",
        "value": "Value"
      }
    });

    var columns = table.columns;
    expect(columns).toEqual(jasmine.any(Array));

    expect(columns.length).toEqual(4);

    var lorem = _.find(columns, x => { return x.name == "loremIpsum"; });

    expect(lorem).toEqual(jasmine.any(Object));
    // conversion from camelCase to kebab-case for css names
    expect(lorem.css).toEqual("lorem-ipsum");

    var name = _.find(columns, x => { return x.name == "name"; });
    expect(name.type).toEqual("string");
  });

  it("must allow to override columns type by configuration", () => {
    var table = new KingTable({
      data: [
        ["id", "name", "value", "loremIpsum"],
        [1, "AAA", "A11", 555],
        [2, "BBB", "B11", 777],
        [3, "CCC", "C11", 888],
        [4, "DDD", "D11", 999],
        [5, "EEE", "E11", 1000]
      ],
      columns: {
        "name": { name: "Name", type: "special-string" },
        "value": "Value"
      }
    });

    // NB: normally, the "name" property would be considered of type string,
    // but since in the options it's described as "special-string", the type must
    // be kept. This allows to handle specific scenarios.
    // NB: the "name" property is automatically put inside "displayName", for the KingTable
    // the column name must be the same as the property name.
    var col = _.find(table.columns, x => { return x.name == "name"; });
    expect(col).toEqual(jasmine.any(Object));
    expect(col.type).toEqual("special-string");
  });

  it("must throw exception if columns option is misconfigured", () => {
    function faulty() {
      var table = new KingTable({
        data: [
          ["id", "name", "value", "loremIpsum"],
          [1, "AAA", "A11", 555],
          [2, "BBB", "B11", 777],
          [3, "CCC", "C11", 888],
          [4, "DDD", "D11", 999],
          [5, "EEE", "E11", 1000]
        ],
        columns: {
          "foo": { name: "Name", type: "special-string" }
        }
      });
    }

    // NB: Jasmine toThrow is polluting the console output with error messages
    // using a mocked console is cleaner
    //expect(faulty).toThrow(new Error('A column is defined with name "foo", but this property was not found among object properties. Items properties are: id, name, value, loremIpsum. For further details: https://github.com/RobertoPrevato/KingTable/wiki/Errors#18'));
    var mock = new MockConsole()
    mock.fire(faulty)
    expect(mock.log[0]).toEqual("ERROR: A column is defined with name \"foo\", but this property was not found among object properties. Items properties are: id, name, value, loremIpsum. For further details: https://github.com/RobertoPrevato/KingTable/wiki/Errors#18")
    // dispose the mock console
    mock.dispose()
  });

  it("must log an error when trying to set position of non-existing columns", () => {
    function faulty() {
      var table = new KingTable({
        data: [
          ["id", "name", "value", "loremIpsum"],
          [1, "AAA", "A11", 555],
          [2, "BBB", "B11", 777],
          [3, "CCC", "C11", 888],
          [4, "DDD", "D11", 999],
          [5, "EEE", "E11", 1000]
        ]
      });
      table.setColumnsOrder("mooo");
    }

    // NB: Jasmine toThrow is polluting the console output with error messages
    // using a mocked console is cleaner
    //expect(faulty).toThrow(new Error('A column is defined with name "foo", but this property was not found among object properties. Items properties are: id, name, value, loremIpsum. For further details: https://github.com/RobertoPrevato/KingTable/wiki/Errors#18'));
    var mock = new MockConsole()
    mock.fire(faulty)
    expect(mock.log[0]).toEqual('ERROR: missing column with name "mooo". For further details: https://github.com/RobertoPrevato/KingTable/wiki/Errors#19')
    // dispose the mock console
    mock.dispose()
  });

  it("must log an error when trying to hide/show a non-existing columns", () => {
    function faulty() {
      var table = new KingTable({
        data: [
          ["id", "name", "value", "loremIpsum"],
          [1, "AAA", "A11", 555],
          [2, "BBB", "B11", 777],
          [3, "CCC", "C11", 888],
          [4, "DDD", "D11", 999],
          [5, "EEE", "E11", 1000]
        ]
      });
      table.hideColumns("mooo");
    }

    // NB: Jasmine toThrow is polluting the console output with error messages
    // using a mocked console is cleaner
    //expect(faulty).toThrow(new Error('A column is defined with name "foo", but this property was not found among object properties. Items properties are: id, name, value, loremIpsum. For further details: https://github.com/RobertoPrevato/KingTable/wiki/Errors#18'));
    var mock = new MockConsole()
    mock.fire(faulty)
    expect(mock.log[0]).toEqual('ERROR: missing column with name "mooo". For further details: https://github.com/RobertoPrevato/KingTable/wiki/Errors#19')

    function faulty2() {
      var table = new KingTable({
        data: [
          ["id", "name", "value", "loremIpsum"],
          [1, "AAA", "A11", 555],
          [2, "BBB", "B11", 777],
          [3, "CCC", "C11", 888],
          [4, "DDD", "D11", 999],
          [5, "EEE", "E11", 1000]
        ]
      });
      table.showColumns("maaa");
    }

    mock.fire(faulty2)
    expect(mock.log[1]).toEqual('ERROR: missing column with name "maaa". For further details: https://github.com/RobertoPrevato/KingTable/wiki/Errors#19')
    // dispose the mock console
    mock.dispose()
  });

  it("must log an error when trying to hide/show columns that are not initialized", () => {
    function faulty() {
      var table = new KingTable({
        url: "dyna/test"
      });
      table.hideColumns("mooo");
    }

    // NB: Jasmine toThrow is polluting the console output with error messages
    // using a mocked console is cleaner
    //expect(faulty).toThrow(new Error('A column is defined with name "foo", but this property was not found among object properties. Items properties are: id, name, value, loremIpsum. For further details: https://github.com/RobertoPrevato/KingTable/wiki/Errors#18'));
    var mock = new MockConsole()
    mock.fire(faulty)
    expect(mock.log[0]).toEqual('ERROR: missing columns information (properties not initialized). For further details: https://github.com/RobertoPrevato/KingTable/wiki/Errors#20')
    mock.dispose();
  });

  it("must allow to override columns type by configuration (array mode)", () => {
    var table = new KingTable({
      data: [
        ["id", "name", "value", "loremIpsum"],
        [1, "AAA", "A11", 555],
        [2, "BBB", "B11", 777],
        [3, "CCC", "C11", 888],
        [4, "DDD", "D11", 999],
        [5, "EEE", "E11", 1000]
      ],
      columns: [
        { name: "name", type: "special-string" },
        { name: "value" }
      ]
    });

    // NB: normally, the "name" property would be considered of type string,
    // but since in the options it's described as "special-string", the type must
    // be kept. This allows to handle specific scenarios.
    // NB: the "name" property is automatically put inside "displayName", for the KingTable
    // the column name must be the same as the property name.
    var col = _.find(table.columns, x => { return x.name == "name"; });
    expect(col).toEqual(jasmine.any(Object));
    expect(col.type).toEqual("special-string");
  });

  it("must extract columns information, even if certain values are null (object mode)", () => {
    var table = new KingTable({
      data: [
        ["id", "name", "value", "loremIpsum"],
        [1, "AAA", "A11", null],
        [2, "BBB", "B11", null],
        [3, "CCC", "C11", null],
        [4, "DDD", "D11", 999],
        [5, "EEE", "E11", null]
      ],
      columns: {
        "name": { name: "Name", type: "special-string" },
        "value": "Value"
      }
    });

    // NB: only one of the items have the property 'loremIpsum' populated,
    // which is a nullable number
    // The KingTable must understand it
    var col = _.find(table.columns, x => { return x.name == "loremIpsum"; });
    expect(col).toEqual(jasmine.any(Object));
    expect(col.type).toEqual("number", "loremIpsum type is number");
  });

  it("must extract columns information, even if certain values are null (array mode)", () => {
    var table = new KingTable({
      data: [
        ["id", "name", "value", "loremIpsum"],
        [1, "AAA", "A11", null],
        [2, "BBB", "B11", null],
        [3, "CCC", "C11", null],
        [4, "DDD", "D11", 999],
        [5, "EEE", "E11", null]
      ],
      columns: [
        { name: "name", type: "special-string" },
        { name: "value" }
      ]
    });

    // NB: only one of the items have the property 'loremIpsum' populated,
    // which is a nullable number
    // The KingTable must understand it
    var col = _.find(table.columns, x => { return x.name == "loremIpsum"; });
    expect(col).toEqual(jasmine.any(Object));
    expect(col.type).toEqual("number", "loremIpsum type is number");
  });

  it("must allow to set column display name using the 'name' column option (object only)", () => {
    var table = new KingTable({
      data: [
        ["id", "name", "value", "loremIpsum"],
        [1, "AAA", "A11", 999]
      ],
      columns: {
        "name": { name: "Object Name" },
        "value": "Value"
      }
    });

    // NB: only one of the items have the property 'loremIpsum' populated,
    // which is a nullable number
    var col = _.find(table.columns, x => { return x.name == "name"; });
    expect(col).toEqual(jasmine.any(Object));
    expect(col.displayName).toEqual("Object Name", "name column option must be placed in displayName property");
    expect(col.name).toEqual("name", "name column option must be the items property name");
  });

  it("must return filters information", () => {
    var table = new KingTable();

    var filters = table.getFilters()

    expect(filters).toEqual(jasmine.any(Object), "filters must be an object with data");
    filters.timestamp = null;
    expect(_.equal(filters, {
      "page": 1,
      "size": 30,
      "sortBy": null,
      "search": null,
      "timestamp": null
    })).toEqual(true, "default filters must contain only basic information (page, size, sortBy, search)")
  });

  it("must allow to extend filters with custom filters", () => {
    var table = new KingTable({
      getExtraFilters() {
        expect(this).toEqual(table, "getExtraFilters must be called in the context of the table")
        return {
          "type": "AAA",
          "active": true
        };
      }
    });

    var filters = table.getFilters()

    expect(filters).toEqual(jasmine.any(Object), "filters must be an object with data");
    filters.timestamp = null;
    expect(_.equal(filters, {
      "page": 1,
      "size": 30,
      "sortBy": null,
      "search": null,
      "timestamp": null,
      "type": "AAA",
      "active": true
    })).toEqual(true, "default filters must contain default filters plus custom filters")
  });

  it("must allow to instantiate the table with context", () => {
    var table = new KingTable({
      context: {
        // imagine a Knockout.js model
        "type": "AAA",
        "active": true
      },
      getExtraFilters() {
        var context = this.context;
        return {
          "type": context.type,
          "active": context.active
        };
      }
    });

    var filters = table.getFilters()

    expect(filters).toEqual(jasmine.any(Object), "filters must be an object with data");
    filters.timestamp = null;
    expect(_.equal(filters, {
      "page": 1,
      "size": 30,
      "sortBy": null,
      "search": null,
      "timestamp": null,
      "type": "AAA",
      "active": true
    })).toEqual(true, "default filters must contain default filters plus custom filters")
  });

  it("must obtain columns information from items", (always) => {
    var table = new TestKingTableFixed({
      url: "/dyna/test"
    });
    function done(data) {
      // NB: the resolve function can return a single value
      //expect(isSync).toEqual(false, "the TestKingTableFixed class is using a fetch promise")
      expect(data).toEqual(jasmine.any(Array))
      expect(data.length).toEqual(5, "the items returned by test class")

      expect(table.columnsInitialized).toEqual(true, "columns should be initialized once data is fetched")
      expect(_.find(table.columns, x => { return x.name == "id"; })).toEqual(jasmine.any(Object));
      expect(_.find(table.columns, x => { return x.name == "name"; })).toEqual(jasmine.any(Object));
      expect(_.find(table.columns, x => { return x.name == "value"; })).toEqual(jasmine.any(Object));
      always();
    }
    function fail(error) {
      expect(error).toBeUndefined();
      always();
    }

    table.getList().then(done, fail);
  })

  it("must obtain return items properly paginated 1", (always) => {
    var table = new TestKingTableFixed({
      url: "/dyna/test",
      resultsPerPage: 2
    });

    expect(table.options.resultsPerPage).toEqual(2);

    function done(data) {
      // NB: the resolve function can return a single value
      //expect(isSync).toEqual(false, "the TestKingTableFixed class is using a fetch promise")
      expect(data).toEqual(jasmine.any(Array))
      expect(data.length).toEqual(2, "the items returned by test class")
      expect(table.pagination.totalPageCount).toEqual(3, "three pages are required to display 5 items with page size 2")

      expect(data[0].id).toEqual(1);
      expect(data[1].id).toEqual(2);

      always();
    }
    function fail(error) {
      expect(error).toBeUndefined();
      always();
    }

    table.getList().then(done, fail);
  })

  it("must obtain return items properly paginated 2", (always) => {
    var table = new TestKingTableFixed({
      url: "/dyna/test",
      resultsPerPage: 1
    });

    expect(table.options.resultsPerPage).toEqual(1);

    function done(data) {
      // NB: the resolve function can return a single value
      //expect(isSync).toEqual(false, "the TestKingTableFixed class is using a fetch promise")
      expect(data).toEqual(jasmine.any(Array))
      expect(data.length).toEqual(1, "the items returned by test class")
      expect(table.pagination.totalPageCount).toEqual(5, "five pages are required to display 5 items with page size 1")

      expect(data[0].id).toEqual(1);

      always();
    }
    function fail(error) {
      expect(error).toBeUndefined();
      always();
    }

    table.getList().then(done, fail);
  })

  it("must initialize column after fetching data", (always) => {
    var table = new TestKingTableFixed({
      url: "/dyna/test"
    });
    function done() {
      // NB: the resolve function can return a single value
      // expect(isSync).toEqual(false, "the TestKingTableFixed class is using a fetch promise")
      var data = table.data;
      expect(data).toEqual(jasmine.any(Array))
      expect(data.length).toEqual(5, "the items returned by test class")

      expect(table.columnsInitialized).toEqual(true, "columns should be initialized once data is fetched")
      expect(_.find(table.columns, x => { return x.name == "id"; })).toEqual(jasmine.any(Object));
      expect(_.find(table.columns, x => { return x.name == "name"; })).toEqual(jasmine.any(Object));
      expect(_.find(table.columns, x => { return x.name == "value"; })).toEqual(jasmine.any(Object));
      always();
    }
    function fail(error) {
      expect(error).toBeUndefined();
      always();
    }
    table.render().then(done, fail);
  })

  it("must allow to preprocess data", (always) => {
    class TestKingTableFixed2 extends KingTable {
      /**
       * Overrides the getFetchPromise function to return hard coded data;
       * for testing purpose.
       */
        getFetchPromise() {
          return new Promise((resolve, reject) => {
            // resolve with an array of items: in this case the table is 'fixed'
            // (it is assumed that the array contains all items)
            setTimeout(() => {
              resolve([
                {
                  "time": "2017-02-03T10:25:40.000Z",
                  "player": "UnregisteredUser",
                  "score": 16938
                },
                {
                  "time": "2017-02-02T18:24:34.000Z",
                  "player": "UnregisteredUser",
                  "score": 4934
                },
                {
                  "time": "2017-02-02T18:10:01.000Z",
                  "player": "UnregisteredUser",
                  "score": 10316
                },
                {
                  "time": "2017-02-02T17:57:36.000Z",
                  "player": "UnregisteredUser",
                  "score": 5346
                }])
            }, 0)
          });
        }
    }

    var table = new TestKingTableFixed2({
      url: "/dyna/test",
      prepareData: data => {
        // NB: in this example, the dates are parsed automatically after fetching values
        _.each(data, o => {
          o.time = new Date(o.time);
        })
      }
    });

    function done(data) {
      // NB: the resolve function can return a single value
      expect(data).toEqual(jasmine.any(Array))
      expect(data.length).toEqual(4, "the items returned by test class")

      var col = _.find(table.columns, c => { return c.name == "time"; })
      expect(col).toEqual(jasmine.any(Object));
      expect(col.type).toEqual("date", "the time column must be of date type (since it was parsed)");

      always();
    }
    function fail(error) {
      expect(error).toBeUndefined();
      always();
    }

    table.getList().then(done, fail);
  })

  it("must allow to define function to fetch data required by the table itself", (always) => {
    var table = new TestKingTableFixed({
      url: "/dyna/test",
      getTableData: () => {
        // NB: this example simulates the common scenario in which, before to render
        // a table, other information must be obtained from the server side.
        // For example, information to render a filters view.
        return new Promise(function (resolve, reject) {
          resolve({
            types: ["A", "B", "C", "D", "E"],
            statuses: ["1", "2", "3", "4", "5"]
          })
        });
      }
    });

    function done(data) {
      // NB: the resolve function can return a single value
      var data = table.data;
      expect(data).toEqual(jasmine.any(Array))
      expect(data.length).toEqual(5, "the items returned by test class")

      expect(table.columnsInitialized).toEqual(true, "columns should be initialized once data is fetched")
      expect(_.find(table.columns, x => { return x.name == "id"; })).toEqual(jasmine.any(Object));
      expect(_.find(table.columns, x => { return x.name == "name"; })).toEqual(jasmine.any(Object));
      expect(_.find(table.columns, x => { return x.name == "value"; })).toEqual(jasmine.any(Object));

      // by default, the table data must be stored in `tableData` property
      expect(_.equal(table.tableData, {
        types: ["A", "B", "C", "D", "E"],
        statuses: ["1", "2", "3", "4", "5"]
      })).toEqual(true);

      always();
    }
    function fail(error) {
      expect(error).toBeUndefined();
      always();
    }

    table.render().then(done, fail);
  })

  it("must cache the data that is required by the table itself", (always) => {
    var k = 0, times = 0;
    var table = new TestKingTableFixed({
      id: "table-data-test1",
      url: "/dyna/test",
      getTableData: () => {
        // NB: this example simulates the common scenario in which, before to render
        // a table, other information must be obtained from the server side.
        // For example, information to render a filters view.
        k++; // increase counter
        return new Promise(function (resolve, reject) {
          resolve({
            types: ["A", "B", "C", "D", "E"],
            statuses: ["1", "2", "3", "4", "5"]
          })
        });
      }
    });
    // clear table data, so it is not restored from previous tests
    table.clearTableData();
    function done(data) {
      // NB: the resolve function can return a single value
      var data = table.data;
      expect(data).toEqual(jasmine.any(Array))
      expect(data.length).toEqual(5, "the items returned by test class")

      expect(table.columnsInitialized).toEqual(true, "columns should be initialized once data is fetched")
      expect(_.find(table.columns, x => { return x.name == "id"; })).toEqual(jasmine.any(Object));
      expect(_.find(table.columns, x => { return x.name == "name"; })).toEqual(jasmine.any(Object));
      expect(_.find(table.columns, x => { return x.name == "value"; })).toEqual(jasmine.any(Object));
      times++;
      expect(k).toEqual(1); // because it was increased the first time, but not anymore in later calls.

      // by default, the table data must be stored in `tableData` property
      expect(_.equal(table.tableData, {
        types: ["A", "B", "C", "D", "E"],
        statuses: ["1", "2", "3", "4", "5"]
      })).toEqual(true);

      if (times < 3) {
        // render again the table: this time the counter should not increase, as
        // table data is still in memory
        table.render().then(done, fail);
      } else {
        always(); // complete
      }
    }
    function fail(error) {
      expect(error).toBeUndefined();
      always();
    }

    table.render().then(done, fail);
  })

  it("must allow to hide columns, when getting data", () => {
    var table = new KingTable({
      data: [
        ["id", "name", "value", "loremIpsum"],
        [1, "AAA", "A11", null],
        [2, "BBB", "B11", null],
        [3, "CCC", "C11", null],
        [4, "DDD", "D11", 999],
        [5, "EEE", "E11", null]
      ]
    });

    // hide
    table.hideColumns("loremIpsum")
    // NB: only one of the items have the property 'loremIpsum' populated,
    // which is a nullable number
    // The KingTable must understand it
    var data = table.getData();
    for (var i = 0, l = data.length; i < l; i++) {
      expect(data[i].loremIpsum).toEqual(undefined);
    }

    // show
    table.showColumns("loremIpsum")
    var data = table.getData();
    for (var i = 0, l = data.length; i < l; i++) {
      expect(data[i].loremIpsum).not.toEqual(undefined);
    }
  })

  it("must allow to configure hidden columns", () => {
    var table = new KingTable({
      storeTableData: false, // disable cache
      data: [
        ["id", "name", "value", "loremIpsum"],
        [1, "AAA", "A11", null],
        [2, "BBB", "B11", null],
        [3, "CCC", "C11", null],
        [4, "DDD", "D11", 999],
        [5, "EEE", "E11", null]
      ],
      columns: [
        { name: "value", hidden: true },
        { name: "loremIpsum", hidden: true }
      ]
    });

    var valueCol = _.find(table.columns, x => { return x.name == "loremIpsum"; });
    expect(valueCol.hidden).toEqual(true, "value column must be hidden by configuration")
    var loremIpsumCol = _.find(table.columns, x => { return x.name == "loremIpsum"; });
    expect(loremIpsumCol.hidden).toEqual(true, "loremIpsum column must be hidden by configuration")
    // NB: only one of the items have the property 'loremIpsum' populated,
    // which is a nullable number
    // The KingTable must understand it
    var data = table.getData();
    for (var i = 0, l = data.length; i < l; i++) {
      expect(data[i].loremIpsum).toEqual(undefined);
      expect(data[i].value).toEqual(undefined);
    }

    var col = _.find(table.columns, c => { return c.name == "value"; })
    expect(col).toEqual(jasmine.any(Object));
    expect(col.hidden).toEqual(true, "the value column is hidden by configuration");

    // show
    table.showColumns("loremIpsum value")
    var data = table.getData();
    for (var i = 0, l = data.length; i < l; i++) {
      expect(data[i].loremIpsum).not.toEqual(undefined);
      expect(data[i].value).not.toEqual(undefined);
    }
  })

  it("must store the time at which data was fetched", (always) => {
    var table = new TestKingTableFixed({
      url: "/dyna/test"
    });
    function done(data) {
      // NB: the resolve function can return a single value
      //expect(isSync).toEqual(false, "the TestKingTableFixed class is using a fetch promise")
      expect(table.dataFetchTime instanceof Date).toEqual(true, "data fetch timestamp is stored as date");
      always();
    }
    function fail(error) {
      expect(error).toBeUndefined();
      always();
    }
    table.getList().then(done, fail);
  })

  it("must obtain the time at which data was fetched, when using cached data", (always) => {
    var table = new TestKingTableFixed({
      id: "cachetest",
      url: "/dyna/test",
      lruCacheSize: 5
    });
    table.anchorTime = new Date();
    sessionStorage.setItem(table.getMemoryKey("catalogs"), JSON.stringify([{
      ts: new Date(2016, 2, 26, 3, 0, 0),
      data: {
        data: [{ a: true }],
        filters: {page: 1, size: 30, sortBy: null, search: null, timestamp: table.anchorTime}
      },
      expiration: -1
    }]));
    function done(data) {
      // NB: the resolve function can return a single value
      //expect(isSync).toEqual(false, "the TestKingTableFixed class is using a fetch promise")
      expect(table.dataFetchTime instanceof Date).toEqual(true, "data fetch timestamp is stored as date");
      expect(table.dataFetchTime.getFullYear()).toEqual(2016, "cached date is in 2016");
      expect(table.dataFetchTime.getMonth()).toEqual(2, "cached date is in March");
      expect(table.dataFetchTime.getDate()).toEqual(26, "cached date is in 26");
      expect(table.dataFetchTime.getHours()).toEqual(3, "cached date is at 3:00 AM");
      always();
    }
    function fail(error) {
      expect(error).toBeUndefined();
      always();
    }
    table.getList().then(done, fail);
  })

  it("must allow to sort items by single property (single string)", () => {
    var table = new KingTable({
      data: [
        ["id", "name", "value", "loremIpsum"],
        [1, "AAA", "A11", 555],
        [2, "BBB", "B11", 777],
        [3, "CCC", "C11", 888],
        [4, "DDD", "D11", 999],
        [5, "EEE", "E11", 1000]
      ]
    });

    table.sortBy("loremIpsum");

    var criteria = table.sortCriteria;
    expect(_.equal(criteria, [["loremIpsum", 1]])).toEqual(true, "sort criteria must be normalized, defaulting to ascending");
  });

  it("must allow to sort items by multiple properties (multiple strings)", () => {
    var table = new KingTable({
      data: [
        ["id", "name", "value", "loremIpsum"],
        [1, "AAA", "A11", 555],
        [2, "BBB", "B11", 777],
        [3, "CCC", "C11", 888],
        [4, "DDD", "D11", 999],
        [5, "EEE", "E11", 1000]
      ]
    });

    table.sortBy("loremIpsum", "value", "name");

    var criteria = table.sortCriteria;
    expect(_.equal(criteria, [["loremIpsum", 1], ["value", 1], ["name", 1]])).toEqual(true, "sort criteria must be normalized, defaulting to ascending");
  });

  it("must allow to sort items by single property (object with asc)", () => {
    var table = new KingTable({
      data: [
        ["id", "name", "value", "loremIpsum"],
        [1, "AAA", "A11", 555],
        [2, "BBB", "B11", 777],
        [3, "CCC", "C11", -888],
        [4, "DDD", "D11", 666],
        [5, "EEE", "E11", 1000]
      ]
    });

    table.sortBy({"loremIpsum": "asc"});
    var criteria = table.sortCriteria;
    expect(_.equal(criteria, [["loremIpsum", 1]])).toEqual(true, "sort criteria must be normalized, defaulting to ascending");

    var data = table.getItemsToDisplay();
    expect(data[0].id).toEqual(3);
    expect(data[1].id).toEqual(1);
    expect(data[2].id).toEqual(4);
    expect(data[3].id).toEqual(2);
    expect(data[4].id).toEqual(5);
  });

  it("must allow to sort items by single property (object with 1)", () => {
    var table = new KingTable({
      data: [
        ["id", "name", "value", "loremIpsum"],
        [1, "AAA", "A11", 555],
        [2, "BBB", "B11", 777],
        [3, "CCC", "C11", -888],
        [4, "DDD", "D11", 666],
        [5, "EEE", "E11", 1000]
      ]
    });

    table.sortBy({"loremIpsum": 1});
    var criteria = table.sortCriteria;
    expect(_.equal(criteria, [["loremIpsum", 1]])).toEqual(true, "sort criteria must be normalized, defaulting to ascending");
  });

  it("must allow to sort items by multiple properties (object)", () => {
    var table = new KingTable({
      data: [
        ["id", "name", "value", "loremIpsum"],
        [1, "AAA", "A11", 1],
        [2, "BBB", "B11", 1],
        [3, "CCC", "C11", -1],
        [4, "DDD", "D11", -1],
        [5, "EEE", "E11", 0]
      ]
    });

    table.sortBy({"loremIpsum": 1, "name": -1, "value": 1});
    var criteria = table.sortCriteria;
    expect(_.equal(criteria, [["loremIpsum", 1], ["name", -1], ["value", 1]])).toEqual(true, "sort criteria must be normalized, defaulting to ascending");

    var data = table.getItemsToDisplay();
    expect(data[0].id).toEqual(5);
    expect(data[1].id).toEqual(4);
    expect(data[2].id).toEqual(3);
    expect(data[3].id).toEqual(2);
    expect(data[4].id).toEqual(1);
  });

  it("must allow to sort items by almost normalized value", () => {
    var table = new KingTable({
      data: [
        ["id", "name", "value", "loremIpsum"],
        [1, "AAA", "A11", 555],
        [2, "BBB", "B11", 777],
        [3, "CCC", "C11", 888],
        [4, "DDD", "D11", 999],
        [5, "EEE", "E11", 1000]
      ]
    });

    table.sortBy([["loremIpsum", "asc"]]);
    var criteria = table.sortCriteria;
    expect(_.equal(criteria, [["loremIpsum", 1]])).toEqual(true, "sort criteria must be normalized, defaulting to ascending");
  });

  it("must allow to sort items by normalized value", () => {
    var table = new KingTable({
      data: [
        ["id", "name", "value", "loremIpsum"],
        [1, "AAA", "A11", 555],
        [2, "BBB", "B11", 777],
        [3, "CCC", "C11", 888],
        [4, "DDD", "D11", 999],
        [5, "EEE", "E11", 1000]
      ]
    });

    table.sortBy([["loremIpsum", 1]]);
    var criteria = table.sortCriteria;
    expect(_.equal(criteria, [["loremIpsum", 1]])).toEqual(true, "sort criteria must be normalized, defaulting to ascending");
  });

  it("must allow to progress sort of properties (single property)", () => {
    var table = new KingTable({
      data: [
        ["id", "name", "value", "loremIpsum"],
        [1, "AAA", "A11", 555],
        [2, "BBB", "B11", 777],
        [3, "CCC", "C11", 888],
        [4, "DDD", "D11", 999],
        [5, "EEE", "E11", 1000]
      ]
    });

    table.sortBy([["loremIpsum", 1]]);
    var criteria = table.sortCriteria;
    expect(_.equal(criteria, [["loremIpsum", 1]])).toEqual(true, "sort criteria must be normalized, defaulting to ascending");

    table.progressSortBy("loremIpsum");
    criteria = table.sortCriteria;
    expect(_.equal(criteria, [["loremIpsum", -1]])).toEqual(true, "after 1 (asc), -1 (desc)");

    table.progressSortBy("loremIpsum");
    criteria = table.sortCriteria;
    expect(_.equal(criteria, null)).toEqual(true, "after -1 (desc), undefined sorting");

    table.progressSortBy("loremIpsum");
    criteria = table.sortCriteria;
    expect(_.equal(criteria, [["loremIpsum", 1]])).toEqual(true, "after undefined, 1 (asc)");
  });

  it("must allow to progress sort of properties (multiple properties)", () => {
    var table = new KingTable({
      data: [
        ["id", "name", "value", "loremIpsum"],
        [1, "AAA", "A11", 555],
        [2, "BBB", "B11", 777],
        [3, "CCC", "C11", 888],
        [4, "DDD", "D11", 999],
        [5, "EEE", "E11", 1000]
      ]
    });

    table.progressSortBy("loremIpsum");
    var criteria = table.sortCriteria;
    expect(_.equal(criteria, [["loremIpsum", 1]])).toEqual(true);

    table.progressSortBy("value");
    criteria = table.sortCriteria;
    expect(_.equal(criteria, [["loremIpsum", 1], ["value", 1]])).toEqual(true);

    table.progressSortBy("value");
    criteria = table.sortCriteria;
    expect(_.equal(criteria, [["loremIpsum", 1], ["value", -1]])).toEqual(true);

    table.progressSortBy("value");
    criteria = table.sortCriteria;
    expect(_.equal(criteria, [["loremIpsum", 1]])).toEqual(true);

    table.progressSortBy("name");
    criteria = table.sortCriteria;
    expect(_.equal(criteria, [["loremIpsum", 1], ["name", 1]])).toEqual(true);

    table.progressSortBy("id");
    criteria = table.sortCriteria;
    expect(_.equal(criteria, [["loremIpsum", 1], ["name", 1], ["id", 1]])).toEqual(true);

    table.progressSortBy("name");
    criteria = table.sortCriteria;
    expect(_.equal(criteria, [["loremIpsum", 1], ["name", -1], ["id", 1]])).toEqual(true);
  });
});
