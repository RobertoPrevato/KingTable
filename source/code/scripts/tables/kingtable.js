/**
 * KingTable core class.
 * This class is responsible of fetching data, handling responses,
 * configuring columns.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import KingTableTextBuilder from "../../scripts/tables/kingtable.text.builder"
import KingTableHtmlBuilder from "../../scripts/tables/kingtable.html.builder"
import KingTableBaseHtmlBuilder from "../../scripts/tables/kingtable.html.base.builder"
import KingTableRichHtmlBuilder from "../../scripts/tables/kingtable.rhtml.builder"
import KingTableRegional from "../../scripts/tables/kingtable.regional"
import EventsEmitter from "../../scripts/components/events"
import Analyzer from "../../scripts/data/object-analyzer"
import Sanitizer from "../../scripts/data/sanitizer"
import FiltersManager from "../../scripts/filters/filters-manager"
import Paginator from "../../scripts/filters/paginator"
import ajax from "../../scripts/data/ajax"
import raise from "../../scripts/raise"
import _ from "../../scripts/utils"
import S from "../../scripts/components/string"
import R from "../../scripts/components/regex"
import N from "../../scripts/components/number"
import D from "../../scripts/components/date"
import A from "../../scripts/components/array"
import csv from "../../scripts/data/csv"
import json from "../../scripts/data/json"
import xml from "../../scripts/data/xml"
import FileUtil from "../../scripts/data/file"
import lru_cache from "../../scripts/data/lru"
import MemStore from "../../scripts/data/memstore"
import {
  ArgumentException,
  ArgumentNullException,
  OperationException
} from "../../scripts/exceptions"
const VERSION = "2.0.0"

const DEFAULTS = {
  
  // Table language.
  lang: "en",

  // Table caption.
  caption: null,

  // Whether to display the item number or not.
  itemCount: true,

  // Default schema for each table column.
  columnDefault: {
    name: "",
    type: "text",
    sortable: true,
    allowSearch: true,
    hidden: false
    // secret: undefined
    // format: undefined (allows to define formatting function) 
  },

  httpMethod: "GET", // method to use to fetch data, when using AJAX requests

  // Whether to allow search, or not.
  allowSearch: true,

  // Minimum number of characters inside the search field to trigger a search.
  minSearchChars: 3,

  // Default first page.
  page: 1,

  // Default page size
  resultsPerPage: 30,

  // Suffix to use for formatted properties
  formattedSuffix: "_(formatted)",

  // Permits to specify whether the collection is fixed or not
  // default changes if the table is instantiated passing a collection
  fixed: undefined,

  // Permits to specify an initial search when generating the table for the first time
  search: "",

  // Permits to specify how sort by information must be transmitted
  sortByFormatter: A.humanSortBy,

  // Permits to specify the search mode to use during live search
  // FullString, SplitWords or SplitSentences
  searchMode: "FullString",

  // Default export formats.
  exportFormats: [
    {
      name: "Csv",
      format: "csv",
      type: "text/csv",
      cs: true  // client side
    },
    {
      name: "Json",
      format: "json",
      type: "application/json",
      cs: true  // client side
    },
    {
      name: "Xml",
      format: "xml",
      type: "text/xml",
      cs: true  // client side
    }
  ],

  // Whether to prettify xml when exporting, or not.
  prettyXml: true,

  // Allows to specify csv serialization options
  csvOptions: {},

  // Whether to include hidden properties in the export; or not.
  exportHiddenProperties: false,

  // Kind of builder.
  builder: "rhtml",

  // Whether to store data returned by `getTableData` function, or not.
  // If true, data is stored in memory and in data storage for later use.
  storeTableData: true,

  // The LRU cache size (how many items per key can be stored).
  lruCacheSize: 10,

  // The LRU cache max age in milliseconds - default 15 minutes; (<= 0 for no expiration).
  lruCacheMaxAge: 60*1e3*15,

  // Whether the anchor timestamp should be shown or not
  showAnchorTimestamp: true,

  collectionName: "data",

  // When text search is used, its sort logic takes precedence over the sort criteria defined clicking on columns.
  searchSortingRules: true,

  // The name of the property that should be used as id.
  idProperty: null,

  // Whether searched values should be automatically highlighted
  autoHighlightSearchProperties: true,

  // Value to use for represent null or empty values.
  emptyValue: ""
}

const BUILDERS = {
  "text": KingTableTextBuilder,
  "html": KingTableHtmlBuilder,
  "rhtml": KingTableRichHtmlBuilder
};

const UNDEFINED = "undefined";

if (typeof Promise == UNDEFINED) {
  var fixed = false;
  // check if ES6Promise was loaded
  if (typeof ES6Promise != UNDEFINED && ES6Promise.polyfill) {
    try {
      ES6Promise.polyfill();
      fixed = typeof Promise != UNDEFINED;
    } catch (ex) {
      // ignore
    }
  }
  if (!fixed) {
    raise(1, "Missing implementation of Promise (missing dependency)")
  }
}

class KingTable extends EventsEmitter {

  /**
   * Creates a new instance of KingTable with the given options and static properties.
   *
   * @param options: options to use for this instance of KingTable.
   * @param staticProperties: properties to override in the instance of KingTable.
   */
  constructor(options, staticProperties) {
    super();
    options = options || {};
    var self = this;
    //
    // The second argument allows to override properties of the KingTable instance.
    //
    if (staticProperties) {
      _.extend(self, staticProperties);
    }
    //
    // Base properties are automatically set from the first argument into the instance
    //
    _.each(self.baseProperties(), x => {
      if (_.has(options, x)) {
        self[x] = options[x];
        delete options[x];
      }
    });
    var sortBy = options.sortBy;
    if (_.isString(sortBy)) {
      self.sortCriteria = A.getSortCriteria(sortBy);
    }

    // Set options
    options = self.options = _.extend({}, KingTable.defaults, options);
    self.loading = false;
    self.init(options, staticProperties);
  }

  /**
   * An array of property names, that can be overridden using the first argument (options) of KingTable constructor,
   * instead of using the second argument, which allows to override any property in an instance of KingTable.
   * Properties outside of this array and passed as first argument, are instead put in the "options" property of a KingTable.
   */
  baseProperties() {
    return [
      "id",                    // allows to set an id to the kingtable
      "onInit",                // function to execute after initialization
      "element",               // allows to specify the table element
      "context",               // table context
      "fixed",                 //
      "prepareData",           //
      "getExtraFilters",       //
      "getTableData",          // function to get required data to render the table
      "afterRender",           // function to execute after render
      "beforeRender",          // function to execute before render
      "numberFilterFormatter", // function to format numbers for filters
      "dateFilterFormatter"    // function to format dates for filters
    ];
  }

  static get regional() {
    return KingTableRegional;
  }

  static get version() {
    return VERSION;
  }

  static get Utils() {
    return _;
  }

  static get StringUtils() {
    return S;
  }

  static get NumberUtils() {
    return N;
  }

  static get ArrayUtils() {
    return A;
  }

  static get DateUtils() {
    return D;
  }

  static get json() {
    return json;
  }

  static get Paginator() {
    return Paginator;
  }

  static get PlainTextBuilder() {
    return KingTableTextBuilder;
  }

  static get HtmlBuilder() {
    return KingTableHtmlBuilder;
  }

  static get RichHtmlBuilder() {
    return KingTableRichHtmlBuilder;
  }

  static get BaseHtmlBuilder() {
    return KingTableBaseHtmlBuilder;
  }

  /**
   * Gives access to KingTable builders, to allow overriding their functions.
   */
  static get builders() {
    return BUILDERS;
  }

  /**
   * Gives access to KingTable custom storages, implementing an interface compatible
   * with sessionStorage and localStorage.
   */
  static get stores() {
    return {
      "memory": MemStore
    }
  }

  /**
   * Initializes an instance of KingTable.
   */
  init(options) {
    var self = this;
    self.cache = {};
    self.disposables = [];
    self.analyst = new Analyzer();
    self.sanitizer = new Sanitizer();
    self.filters = new FiltersManager({}, {
      context: self
    });

    var data = options.data;
    if (data) {
      if (!_.isArray(data))
        raise(3, "Data is not an array");
      // KingTable initialized passing an array of items,
      // unless specified otherwise, assume that it is a fixed table
      // (i.e. a table that doesn't require server side pagination)

      // Apply the same logic that would be applied if data was coming from
      // server side (e.g. parsing of dates)
      data = json.clone(data);
      self.setFixedData(data);
    }
    // NB: it is important to load settings after setting data;
    // because if client side search is used, search filter requires search properties
    self.loadSettings(); // load settings from storage, if applicable
    self.setPagination();

    if (!self.fixed) {
      // if the table collection is not fixed;
      // then there is no need to perform search operations on the client side;
      self.filters.searchDisabled = true;
    }

    // initialize the current builder
    // this is required to allow displaying loading information
    self.setBuilder(options.builder).onInit();
    return self;
  }

  /**
   * Returns the translations for the current language configuration.
   */
  getReg() {
    var lang = this.options.lang;
    if (!lang) raise (15, "Missing language option (cannot be null or falsy)")
    var o = KingTable.regional[lang];
    if (!o) raise(15, `Missing regional for language ${lang}`);
    return o;
  }

  /**
   * Sets the builder handler.
   *
   * @param {string} name: builder type.
   */
  setBuilder(name) {
    if (!name)
      raise(8, "name cannot be null or empty");
    var self = this,
        o = self.options,
        builders = KingTable.builders;
    if (self.builder) {
      self.disposeOf(self.builder);
    }
    var builderType = builders[name];
    if (!builderType) {
      raise(10, "Missing handler for builder: " + name);
    }
    var builder = new builderType(self);
    self.builder = builder;
    self.disposables.push(builder);
    return self;
  }

  /**
   * Applies client side pagination to an array, on the basis of current configuration.
   */
  getSubSet(a) {
    var pagination = this.pagination;
    var from = (pagination.page - 1) * pagination.resultsPerPage, to = pagination.resultsPerPage + from;
    return a.slice(from, to);
  }

  /**
   * Sets the pagination data inside the instance of KingTable.
   *
   * @returns {KingTable}
   */
  setPagination() {
    var self = this,
      data = self.data,
      options = self.options,
      page = options.page,
      resultsPerPage = options.resultsPerPage,
      totalItemsCount = options.totalItemsCount || (data ? data.length : 0);
    if (self.pagination) {
      self.disposeOf(self.pagination);
    }
    var pagination = self.pagination = new Paginator({
      page: page,
      resultsPerPage: resultsPerPage,
      totalItemsCount: totalItemsCount,
      onPageChange: () => {
        self.render();
      }
    });
    self.disposables.push(pagination);
    return self;
  }

  /**
   * Updates the pagination, according to the total count of items
   * that satisfy the current filters.
   *
   * @param totalItemsCount: the total count of items that satisfy the current filters (except page number)
   * @returns {KingTable}
   */
  updatePagination(totalItemsCount) {
    var self = this;
    if (!self.pagination) self.setPagination();
    if (!_.isNumber(totalItemsCount))
      throw "invalid type";
    var pagination = self.pagination;
    pagination.setTotalItemsCount(totalItemsCount);
    // results count change
    _.ifcall(self.onResultsCountChange, self);
    self.trigger("change:pagination");
    return self;
  }

  /**
   * Function called when initialization is completed.
   * Extensibility point.
   */
  onInit() { }

  /**
   * Returns a value indicating whether this instance of KingTable has data or
   * not.
   */
  hasData() {
    var data = this.data;
    return !!(data && data.length);
  }

  /**
   * Returns the structure of the collection items.
   * By default, it is assumed that all items inside the collection have the
   * same structure.
   */
  getItemStructure() {
    // analyze whole collection, if necessary, only the first item if possible
    // if necessary == if any property is nullable and it's necessary to check
    // multiple items until a certain value is found (e.g. nullable numbers, dates)
    return this.analyst.describe(this.data, { lazy: true });
  }

  /**
   * Initializes the columns information for this KingTable.
   */
  initColumns() {
    var n = "columnsInitialized",
      self = this;
    if (self[n] || !self.hasData()) return self;
    self[n] = true;
    var columns = [];

    // gets the first object of the table as starting point
    var objSchema = self.getItemStructure();
    var x, properties = [];
    for (x in objSchema) {
      objSchema[x] = { name: x, type: objSchema[x] };
      properties.push(x);
    }
    var optionsColumns = self.options.columns;

    // does the user specified columns in constructor options?
    if (optionsColumns) {
      var i = 0, name;
      for (x in optionsColumns) {
        var col = optionsColumns[x];
        if (_.isPlainObject(optionsColumns)) {
          name = x;
        } else if (_.isArray(optionsColumns)) {
          if (_.isString(col)) {
            raise(16, `invalid columns option ${col}`);
          }
          name = col.name;
          if (!name) {
            raise(17, "missing name in column option");
          }
        } else {
          raise(16, "invalid columns option");
        }
        // is the name inside the object schema?
        if (_.indexOf(properties, name) == -1) {
          raise(18, `A column is defined with name "${name}", but this property was not found among object properties. Items properties are: ${properties.join(', ')}`);
        }

        // support defining only the columns by their display name (to save programmers's time)
        if (_.isString(col)) {
          // normalize
          col = optionsColumns[x] = { displayName: col };
        }
        if (_.isString(col.name)) {
          // if a name property is defined, replace it with the key `displayName`,
          // since the KingTable requires the name to be equal to the actual property name.
          col.displayName = col.name;
          delete col.name;
        }
        objSchema[name] = _.extend(objSchema[name], col);

        var colPos = col.position;
        if (_.isNumber(colPos)) {
          objSchema[name].position = colPos;
        } else {
          objSchema[name].position = i;
        }
        i++;
      }
    }

    for (x in objSchema) {
      var base = { name: x },
        schema = objSchema[x],
        type = schema.type;
      if (!type) schema.type = type = "string";
      // extend with table column default options
      var col = _.extend({}, self.options.columnDefault, base, schema);
      // assign a unique id to this column object:
      col.cid = _.uniqueId("col");
      type = _.lower(type);
      //set default properties by field type
      var a = KingTable.Schemas.DefaultByType;
      if (_.has(a, type)) {
        //default schema by type
        var def = a[type];
        if (_.isFunction(def)) def = def.call(self, schema, objSchema);
        _.extend(base, def);
      }
      //set default properties by name
      a = KingTable.Schemas.DefaultByName;
      if (_.has(a, x)) {
        //default schema by name
        _.extend(base, a[x]);
      }

      _.extend(col, base);

      if (optionsColumns) {
        //the user esplicitly defined some column options
        //columns are defined in the options, so take their defaults, supporting both arrays or plain objects
        var definedSchema = _.isArray(optionsColumns)
          ? _.find(optionsColumns, function (o) { return o.name == x; })
          : optionsColumns[x];
        if (definedSchema) {
          //some options are explicitly defined for a field: extend existing schema with column defaults
          _.extend(col, definedSchema);
        }
      }
      // set css name for column
      n = "css";
      if (!_.isString(col[n])) {
        col[n] = S.kebabCase(col.name);
      }

      if (!_.isString(col.displayName))
        col.displayName = col.name;
      columns.push(col);
    }

    // if the user defined the columns inside the options;
    // automatically set their position on the basis of their index
    var p = "position";
    if (optionsColumns) {
      var i = 0;
      for (var x in optionsColumns) {
        var col = _.find(columns, function (o) {
          return o.name == x;
        });
        if (col && !_.has(col, p))
          col[p] = i;
        i++;
      }
    }

    // restore columns information from cache
    //
    var columnsData = self.getCachedColumnsData();
    var h = "hidden";
    if (columnsData) {
      _.each(columnsData, c => {
        var col = _.find(columns, function (o) {
          return o.name == c.name;
        });
        if (col) {
          col[p] = c[p];  // position
          col[h] = c[h];  // hidden
        }
      });
    }
    self.columns = columns;
    // Now columns information is initialized:
    // it may be necessary to set a search filter, for fixed tables
    if (self.fixed && self.searchText) {
      self.setSearchFilter(self.searchText, true);
    }
    return self;
  }

  storePreference(plainKey, value) {
    var store = this.getFiltersStore();
    if (!store) return false;
    var key = this.getMemoryKey(plainKey);
    store.setItem(key, value);
  }

  getPreference(plainKey) {
    var store = this.getFiltersStore();
    if (!store) return;
    var key = this.getMemoryKey(plainKey);
    return store.getItem(key);
  }

  /**
   * Returns the storage used to store filters settings.
   */
  getFiltersStore() {
    return localStorage;
  }

  /**
   * Returns the storage used to store data.
   */
  getDataStore() {
    return sessionStorage;
  }

  /**
   * Loads settings from configured storage.
   */
  loadSettings() {
    if (this.getTableData) {
      // table requires data: try to restore from cache
      this.restoreTableData();
    }
    return this.restoreFilters();
  }

  /**
   * Restore filters from cache.
   */
  restoreFilters() {
    var self = this, options = self.options;

    // restore filters from storage
    var filtersStore = self.getFiltersStore();
    if (!filtersStore) return self;

    var key = self.getMemoryKey("filters");
    var filtersCache = filtersStore.getItem(key);
    if (!filtersCache) return self;
    
    try {
      var filters = json.parse(filtersCache);
      var basicFilters = "page size sortBy search timestamp".split(" ");
      self.trigger("restore:filters", filters);
      // restore table inner filters
      _.each(basicFilters, function (x) {
        // size maps to results per page! (because table 'size' would be unclear)
        if (x == "search") {
          if (self.validateForSeach(filters[x])) {
            self.setSearchFilter(filters[x], true);
          }
        } else if (x == "sortBy") {
          self.sortCriteria = filters[x];
        } else if (x == "size") {
          options.resultsPerPage = filters[x];
        } else {
          options[x] = filters[x];
        }
      });
      // call a function and fire an event, so the user of the library can restore
      // custom, table specific filters.
      var extraFilters = _.minus(filters, basicFilters);
      if (!_.isEmpty(extraFilters)) {
        self.restoreExtraFilters(filters);
      }
    } catch (ex) {
      // deserialization failed: remove item from cache
      filtersStore.removeItem(key);
    }
    return self;
  }

  /**
   * Returns the current filters of this KingTable.
   * Filters include page number, page size, order by (property name); sort criteria,
   * free text search, timestamp of the first time the table was rendered (this timestamp is updated when the user clicks on the refresh button).
   */
  getFilters() {
    var self = this,
        pagination = self.pagination;
    // NB: this function disallow overriding basic filters (page number, size, sortBy, search, timestamp);
    // using the following order of elements:
    var anchorTime = "anchorTime";
    if (_.isUnd(self[anchorTime])) {
      // set anchor time: it can be used for fast growing tables.
      // this must be fetched before caching filters
      self[anchorTime] = new Date();
    }
    return _.extend({}, self.getExtraFilters(), {
      page: pagination.page,           // page number
      size: pagination.resultsPerPage, // page size; i.e. results per page
      sortBy: self.sortCriteria || null,          // sort criteria (one or more properties)
      search: self.searchText || null,
      timestamp: self.anchorTime || null  // the timestamp of the first time the table was rendered
    });
  }

  /**
   * Returns the current filters of this KingTable, including a caching mechanism (set only).
   */
  getFiltersSetCache() {
    var self = this,
        filters = self.getFilters(),
        store = self.getFiltersStore();
    if (store) {
      // store current filters set; this is used to restore
      // filters upon reload or page refresh
      var key = self.getMemoryKey("filters");
      self.trigger("store:filters", filters);
      store.setItem(key, json.compose(filters));
    }
    return filters;
  }

  /**
   * Function that allows to return extra filters for a specific instance of KingtTable.
   * This function is used to collect filters that relates to a specific context, and merge them with
   * table basic filters (page number, page size, sort order).
   * Extensibility point.
   *
   * @return {object}
   */
  getExtraFilters() { }

  /**
   * Function that allows to restore extra filters from cache, for a specific instance of KingtTable.
   * This function is used restore cached filters in the table context, so they can be read when fetching a collection of items.
   * Extensibility point.
   *
   * @return {object}
   */
  restoreExtraFilters(filters) {}

  /**
   * Function to run before rendering.
   * Extensibility point.
   */
  beforeRender() {}

  /**
   * Function to run after rendering.
   * Extensibility point.
   */
  afterRender() {}

  /**
   * Function to run when an AJAX request starts.
   * Extensibility point.
   */
  onFetchStart() {}

  /**
   * Function to run when an AJAX request ends positively.
   * Extensibility point.
   */
  onFetchDone() {}

  /**
   * Function to run when an AJAX request ends negatively.
   * Extensibility point.
   */
  onFetchFail() {}

  /**
   * Function to run when an AJAX request ends (in any case).
   * Extensibility point.
   */
  onFetchEnd() {}

  /**
   * Function to run when search filter is empty.
   * Extensibility point.
   */
  onSearchEmpty() {}

  /**
   * Function to run when search starts.
   * Extensibility point.
   */
  onSearchStart(val) {}

  /**
   * Define a function that allows to preprocess data upon fetching.
   * Extensibility point.
   */
  prepareData(data) {
    // handle this.data (e.g. parsing dates, etc.)
    // data === this.data
    return this;
  }

  /**
   * Formats the values inside the items (requires columns information).
   */
  formatValues(data) {
    // first use the function that is designed to be overridable by programmers
    var self = this, o = self.options;
    if (!data) data = self.data;
    // apply formatting by column
    var formattedSuffix = self.options.formattedSuffix, n, v;
    var formattedProperties = _.where(self.columns, x => { return _.isFunction(x.format); });
    _.each(data, x => {
      _.each(formattedProperties, c => {
        n = c.name + formattedSuffix;
        v = x[c.name];
        x[n] = (_.isUnd(v) || v === null || v === "") ? o.emptyValue : c.format(v, x) || o.emptyValue;
      });
    });
    return self;
  }

  /**
   * Sets the columns order by property name.
   */
  setColumnsOrder() {
    var args = _.stringArgs(arguments);
    var l = args.length;
    if (!l) return false;
    var cols = this.columns, found = [];
    for (var i = 0; i < l; i++) {
      var n = args[i];
      var col = _.find(cols, x => { return x.name == n; });
      if (!col) raise(19, `missing column with name "${n}"`);
      col.position = i;
      found.push(col);
    }
    var notFound = _.where(cols, x => { return found.indexOf(x) == -1; });
    _.each(notFound, x => {
      l++;
      x.position = l;
    });
    A.sortBy(cols, "position");
    // store in memory
    this.storeColumnsData().render();
    return this;
  }

  /**
   * Shows or hides columns, depending on parameter.
   */
  toggleColumns(param) {
    var cols = this.columns;
    _.each(param, x => {
      if (_.isArray(x)) {
        var name = x[0], visible = x[1];
      } else {
        var name = x.name, visible = x.visible;
      }
      
      var col = _.find(cols, col => { return col.name == name; });
      if (!col) {
        raise(19, `missing column with name "${name}"`);
      }
      if (visible) {
        col.hidden = col.secret ? true : false;
      } else {
        col.hidden = true;
      }
    });
    this.storeColumnsData().render();
    return this;
  }

  /**
   * Hides one or more columns by name.
   */
  hideColumns() {
    return this.columnsVisibility(_.stringArgs(arguments), false);
  }

  /**
   * Shows one or more columns by name.
   */
  showColumns() {
    return this.columnsVisibility(_.stringArgs(arguments), true);
  }

  /**
   * Sets columns visibility.
   */
  columnsVisibility(args, visible) {
    if (args.length == 1 && args[0] == "*") {
      _.each(this.columns, x => {
        if (visible) {
          x.hidden = x.secret ? true : false;
        } else {
          x.hidden = true;
        }
      });
    } else {
      _.each(args, x => {
        this.colAttr(x, "hidden", !visible);
      });
    }
    this.storeColumnsData().render();
    return this;
  }

  /**
   * Sets a column property by names and value.
   *
   * @param {string} name: column name
   * @param {string} attr: attribute name
   * @param {any} value: attribute value
   */
  colAttr(name, attr, value) {
    if (!name) ArgumentNullException("name");
    var cols = this.columns;
    if (!cols) raise(20, "missing columns information (properties not initialized)");
    var col = _.find(cols, x => { return x.name == name; });
    if (!col) raise(19, `missing column with name "${name}"`);
    col[attr] = value;
    return col;
  }

  /**
   * Stores columns data in cache.
   * NB: this is used only to store columns position, hidden data.
   * Objects structure still controls the columns data.
   */
  storeColumnsData() {
    var store = this.getDataStore(),
        key = this.getMemoryKey("columns:data"),
        options = this.options,
        data = this.columns;
    if (store && options.storeTableData) {
      store.setItem(key, json.compose(data));
    }
    return this;
  }

  /**
   * Gets columns data from storage.
   * NB: this is used only to store columns position, hidden data.
   * Objects structure still controls the columns data.
   */
  getCachedColumnsData() {
    var store = this.getDataStore(),
        key = this.getMemoryKey("columns:data"),
        options = this.options;
    if (store && options.storeTableData) {
      var data = store.getItem(key);
      if (data) {
        try {
          return json.parse(data);
        } catch (ex) {
          store.removeItem(key);
        }
      }
    }
    return null;
  }

  /**
   * Sorts columns, according to their current position setting.
   */
  sortColumns() {
    if (arguments.length) {
      return this.setColumnsOrder.apply(this, arguments);
    }
    // default function to sort columns: they are sorted
    // by position first, then display name
    var isNumber = _.isNumber, columns = this.columns;
    columns.sort(function (a, b) {
      var p = "position";
      if (isNumber(a[p]) && !isNumber(b[p])) return -1;
      if (!isNumber(a[p]) && isNumber(b[p])) return 1;
      if (a[p] > b[p]) return 1;
      if (a[p] < b[p]) return -1;
      // compare display name
      p = "displayName";
      return S.compare(a[p], b[p], 1);
    });
    for (var i = 0, l = columns.length; i < l; i++)
      columns[i].position = i;
    return this;
  }

  setTools() {
    // TODO: keep this class abstracted from DOM
    return this;
  }

  /**
   * Allows to define a function that returns data required to render the table itself.
   * This is commonly necessary, for example, when an AJAX request is required to fetch filters information
   * (e.g. an array of possible types for a select)
   * Extensibility point.
   */
  // getTableData() { }

  /**
   * Handles data returned by the 'getTableData' promise, if any.
   * By default, this function simply stores the table data in a property called 'tableData'
   * Extensibility point.
   *
   * @param {object} data: data returned by getTableData promise (if any).
   */
  handleTableData(data) {
    this.tableData = data;
  }

  /*
   * Refreshes the KingTable, clearing its data cache and
   * performing a new rendering.
   */
  refresh() {
    delete this.anchorTime;
    // clear data cache

    return this.render({
      clearDataCache: true
    });
  }

  /**
   * Performs an hard refresh on the KingTable; clearing all its cached data
   * and performing a new rendering.
   */
  hardRefresh() {
    this.trigger("hard:refresh").clearTableData();
    return this.render({
      clearDataCache: true
    });
  }

  /**
   * Renders the KingTable, using its current view and view builder.
   * If necessary, it also fetches data required by the table itself
   * (e.g. information to render the filters view).
   */
  render(options) {
    var self = this;

    return new Promise(function (resolve, reject) {
      function handle() {
        self.beforeRender();

        self.initColumns()
          .sortColumns()
          .setTools()
          .build();
        self.afterRender();
        resolve();
      }

      function callback() {
        // TODO: the `hasData` check is not specific enough. (maybe?)
        if (self.fixed && self.hasData()) {
          //
          // resolve automatically: the data is already available and not changing
          // however, filters need to be stored for consistency with paginated sets.
          self.getFiltersSetCache();
          handle();
        } else {
          // it is necessary to fetch data
          var timestamp = self.lastFetchTimestamp = new Date().getTime();
          self.getList(options, timestamp).then(function success(data) {
            if (!data || !data.length && !self.columnsInitialized) {
              // there is no data: this may happen if the server is not returning any
              // object
              return self.emit("no-results");
            }
            handle();
          }, function fail() {
            self.emit("get-list:failed");
            reject("get-list:failed");
          });
        }
      }

      //
      // if necessary, fetch list data (e.g. filters data, or anything else that need to be fetched
      // from the server side before displaying a rendered table)
      //
      if (self.getTableData && !self.cache.tableDataFetched) {
        // was the data already fetched?

        var tableDataPromise = self.getTableData();
        // NB: here duck typing is used.
        if (!_.quacksLikePromise(tableDataPromise)) {
          raise(13, "getTableData must return a Promise or Promise-like object.");
        }

        tableDataPromise.then(function (data) {
          if (self.options.storeTableData) {
            self.cache.tableDataFetched = true;
            // store table data in store
            self.storeTableData(data);
          }
          self.handleTableData(data);
          callback();
        }, function () {
          // fetching table data failed
          self.emit("get-table-data:failed");
          reject();
        });
      } else {
        // table requires no data
        callback();
      }
    });
  }

  /**
   * Allows to clear stored table data.
   */
  clearTableData() {
    var self = this,
        store = self.getDataStore(),
        key = self.getMemoryKey("table:data"),
        options = self.options;
    if (store && options.storeTableData) {
      store.removeItem(key);
    }
    self.cache.tableDataFetched = false;
    delete self.tableData;
    return self;
  }

  /**
   * Stores table data for later use.
   */
  storeTableData(data) {
    var store = this.getDataStore(),
        key = this.getMemoryKey("table:data"),
        options = this.options;
    if (store && options.storeTableData) {
      store.setItem(key, json.compose(data));
    }
    return this;
  }

  /**
   * Restores table data from cache.
   */
  restoreTableData() {
    var self = this,
        store = self.getDataStore(),
        key = self.getMemoryKey("table:data"),
        options = self.options;
    if (store && options.storeTableData) {
      var data = store.getItem(key);
      if (data) {
        // table data is available in cache
        try {
          // TODO: use the same function to parse, used by ajax proxy functions
          data = json.parse(data);
        } catch (ex) {
          // parsing failed
          store.removeItem(key);
        }
        self.handleTableData(data);
        self.cache.tableDataFetched = true;
      }
    }
    return self;
  }

  /**
   * Builds the KingTable, using its current state and view builder.
   */
  build() {
    // depending on the current view, use the right builder to build
    // the table at its current state.
    var self = this;
    var builder = self.builder;
    if (!builder) {
      return;
    }
    builder.build();
  }

  /**
   * Returns a memory key for this KingTable.
   */
  getMemoryKey(name) {
    var a = location.pathname + location.hash + ".kt";
    var id = this.id;
    if (id) a = id + ":" + a
    return name ? (a + ":::" + name) : a;
  }

  /**
   * Handles fixed data.
   */
  setFixedData(data) {
    var self = this;
    data = self.normalizeCollection(data);
    self.fixed = true;
    self.filters.searchDisabled = false;
    self.prepareData(data);
    self.data = data;
    self.initColumns();
    self.formatValues(data);
    self.updatePagination(data.length);
    return data;
  }

  /**
   * Fetches the data for this KingTable and handles its response.
   * The default implementation performs an ajax request.
   */
  getList(options, timestamp) {
    options = options || {};
    var self = this;
    // obtain fetch options
    var fetchOptions = self.mixinFetchData();

    return new Promise(function (resolve, reject) {
      self.emit("fetch:start")
          .onFetchStart();
      self.getFetchPromiseWithCache(fetchOptions, options)
          .then(function done(data) {
        // check if there is a newer call to function
        if (timestamp < self.lastFetchTimestamp) {
          // do nothing because there is a newer call to loadData
          return;
        }
        if (!data) {
          // invalid promise: the function must return something when resolving
          raise(14, "`getFetchPromise` did not return a value when resolving");
        }
        self.emit("fetch:done").onFetchDone(data);

        // check if returned data is an array or a catalog
        if (_.isArray(data)) {
          //
          // The server returned an array, so take for good that this collection
          // is complete and doesn't require server side pagination. This is by design.
          //
          data = self.setFixedData(data);
          //
          // The collection is complete: apply client side pagination
          //
          resolve(self.getSubSet(data))
        } else {
          //
          // The server returned an object, so take for good that this collection requires
          // server side pagination; expect the returned data to include information like:
          // total number of results (possibly), so a client side pagination can be built;
          //
          // expect catalog structure (page count, page number, etc.)
          var subset = data.items || data.subset;
          if (!_.isArray(subset))
            raise(6, "The returned object is not a catalog");
          if (!_.isNumber(data.total))
            raise(7, "Missing total items count in response object.");

          subset = self.normalizeCollection(subset);
          // set data
          self.prepareData(subset);
          self.data = subset;
          self.initColumns();
          self.formatValues(subset);
          self.updatePagination(data.total);
          resolve(subset);
        }
      }, function fail() {
        // check if there is a newer call to function
        if (timestamp < self.lastFetchTimestamp) {
          // do nothing because there is a newer call to loadData
          return;
        }
        self.emit("fetch:fail").onFetchFail();
        reject();
      }).then(function always() {
        self.emit("fetch:end").onFetchEnd();
      });
    });
  }

  /**
   * Performs a search by text.
   */
  search(val) {
    if (_.isUnd(val)) val = "";
    var self = this;
    if (self.validateForSeach(val)) {
      // add filters inside the filters manager
      if (!val) {
        // remove filter
        self.unsetSearch();
      } else {
        self.onSearchStart(val);
        self.setSearchFilter(val);
      }
      // go to first page
      self.pagination.page = 1;
    } else {
      // value is not valid for search: remove the rule by key
      self.unsetSearch();
    }
    self.render();
  }

  isSearchActive() {
    var filter = this.filters.getRuleByKey("search");
    return !!filter;
  }

  /**
   * Unsets the search filters in this table.
   */
  unsetSearch() {
    var self = this;
    if (!self.isSearchActive()) {
      return self;
    }
    self.filters.removeRuleByKey("search");
    self.searchText = null;
    if (self.hasData())
      self.updatePagination(self.data.length);
    self.trigger("search-empty").onSearchEmpty();
    return self;
  }

  /**
   * Sets a search filter for the table.
   *
   * @param {string} val: search value.
   * @param {bool} skipStore: whether to skip storing the filter in cache or not.
   */
  setSearchFilter(val, skipStore) {
    var self = this;
    self.searchText = val;
    if (!skipStore) {
      self.getFiltersSetCache(); // store filter in cache
    }
    var searchProperties = self.getSearchProperties();
    // NB: if data is fetched from the server after table initialization,
    // then searchProperties may still be not available.
    self.filters.set({
      type: "search",
      key: "search",
      value: R.getSearchPattern(S.getString(val), {
        searchMode: self.options.searchMode
      }),
      searchProperties: searchProperties && searchProperties.length ? searchProperties : false
    });
    self.trigger("search-active");
    return self;
  }

  /**
   * Gets the properties that should be used to search in this table.
   */
  getSearchProperties() {
    var self = this, options = self.options;
    if (options.searchProperties)
      // the user explicitly specified the search properties
      return options.searchProperties;

    // if data is not initialized yet, return false; search properties will be set later
    if (!self.data || !self.columnsInitialized)
      return false;

    var searchable = _.where(self.columns, col => {
      return col.allowSearch && (!col.secret); // exclude secret columns
    });
    //
    // When searching, it's desirable to search inside string representations of
    // values, while keeping real values in the right type (for sorting numbers and dates, for instance)
    // However, it is also nice to search by actual values (e.g. searching "1000" should match numbers that are represented with thousands separators, too --> like '1,000.00')
    //
    var formattedSuffix = options.formattedSuffix;
    return _.flatten(_.map(searchable, x => {
      if (_.isFunction(x.format)) {
        // TODO: which properties should also be searched in their default string representation? (Dates not likely, Numbers most probably yes)
        return x.type == "number" ? [x.name + formattedSuffix, x.name] : x.name + formattedSuffix;
      }
      return x.name;
    }));
  }

  /**
   * Returns true if a string value should trigger a search, false otherwise.
   */
  validateForSeach (val) {
    if (!val) return false;
    var minSearchChars = this.options.minSearchChars;
    if (val.match(/^[\s]+$/g) || (_.isNumber(minSearchChars) && val.length < minSearchChars)) {
      return false;
    }
    return true;
  }

  /**
   * Returns a string representation of the anchor fetch time.
   * Time used to `anchor` fetching of items for fast growing tables
   * (i.e. items can be fetched if their creation time is before anchor timestamp)
   */
  getFormattedAnchorTime() {
    var time = this.anchorTime;
    if (time instanceof Date) {
      if (D.isToday(time)) {
        return D.format(time, "HH:mm:ss");
      }
      return D.formatWithTime(time);
    }
    return "";
  }

  /**
   * Returns a string representation of the data fetch time.
   */
  getFormattedFetchTime() {
    var time = this.dataFetchTime;
    if (time instanceof Date) {
      if (D.isToday(time)) {
        return D.format(time, "HH:mm:ss");
      }
      return D.formatWithTime(time);
    }
    return "";
  }

  /**
   * Returns a promise object responsible of fetching data including a LRU caching mechanism;
   *
   * @param params
   * @returns {Promise}
   */
  getFetchPromiseWithCache(params, options) {
    // LRU caching mechanism. If the fetch options didn't change (it means: same filters),
    // and there is already data in the local storage or session storage, use stored data.
    if (!options) options = {};
    var self = this,
      o = self.options,
      lruCacheSize = o.lruCacheSize,
      store = self.getDataStore(),
      useLru = !!(lruCacheSize && store);
    var anchorTime = "anchorTime";
    if (useLru) {
      // check if there is data in the store
      var frozen = json.parse(json.compose(params));
      var key = self.getMemoryKey("catalogs"),
        cachedData = lru_cache.get(key, x => {
          return _.equal(frozen, x.filters);
        }, store, true);
      if (cachedData) {
        if (options.clearDataCache) {
          // clear the cache for all pages,
          // this is important to not confuse the user
          // because if only the cache for a specific page number were cleared, it would be difficult to understand
          lru_cache.remove(key, undefined, store);
        } else {
          // set timestamp of when data was fetched
          self[anchorTime] = new Date(cachedData.data[anchorTime]);
          self.dataFetchTime = new Date(cachedData.ts);
          return new Promise(function (resolve, reject) {
            //
            // NB: it is important to use a timeout of 0 milliseconds, to
            // recreate similar scenario like the one given by an AJAX request
            // (e.g. for libraries like Knockout or Vue.js)
            // Otherwise the view would be build in different ways
            //
            setTimeout(() => {
              resolve(cachedData.data.data);
            }, 0);
          });
        }
      }
    }
    // fetch remotely
    return new Promise(function (resolve, reject) {
      self.loading = true;
      self.emit("fetching:data");
      self.getFetchPromise(params).then(function done(data) {
        if (useLru) {
          // store in cache
          lru_cache.set(key, {
            data: data,
            filters: params,
            anchorTime: self[anchorTime].getTime()
          }, o.lruCacheSize, o.lruCacheMaxAge, store);
        }
        self.dataFetchTime = new Date();
        self.loading = false;
        self.emit("fetched:data");
        resolve(data);
      }, function fail() {
        self.loading = false;
        reject();
      });
    });
  }

  /**
   * Returns a promise object responsible of fetching data;
   * Override this function if data should be fetched in other ways
   * (for example, reading a file from file system).
   * This function must return a Promise object or a compatible object.
   *
   * @param params
   * @returns {Promise}
   */
  getFetchPromise(params) {
    // The default implementation implements getFetchPromise by generating an AJAX call,
    // since this is the most common use case scenario.
    // However, this class is designed to be almost abstracted from AJAX, so overriding this single
    // function allows to fetch data from other sources (e.g. reading files in chunks from file system; returning mock data for unit tests; etc).
    var options = this.options;
    var url = options.url;
    if (!url) raise(5, "Missing url option, to fetch data");

    // NB: if method is GET, ajax helper will automatically convert it to a query string
    // with keys in alphabetical order; conversion is done transparently
    var method = options.httpMethod;

    // format fetch data
    params = this.formatFetchData(params);

    return ajax.shot({
      type: method,
      url: url,
      data: params
    });
  }

  numberFilterFormatter(propertyName, value) {
    return value;
  }

  dateFilterFormatter(propertyName, value) {
    return D.toIso8601(value);
  }

  formatFetchData(data) {
    var options = this.options;
    var sortByFormatter = options.sortByFormatter;
    if (data.sortBy && _.isFunction(sortByFormatter)) {
      data.sortBy = sortByFormatter(data.sortBy);
    }

    var x;
    for (x in data) {
      var v = data[x];
      if (v instanceof Date) {
        data[x] = this.dateFilterFormatter(x, v);
      }
      if (v instanceof Number) {
        data[x] = this.numberFilterFormatter(x, v);
      }
    }
    return data;
  }

  /**
   * Returns an object that describe all filters and necessary options to fetch data.
   */
  mixinFetchData() {
    var extraData = this.options.fetchData;
    if (_.isFunction(extraData)) 
      extraData = extraData.call(this);
    return _.extend(this.getFiltersSetCache(), extraData || {});
  }

  /**
   * Ensures that a collection is normalized, if the server is returning an optimized
   * collection in the shape of array of arrays.
   * Optimized collections are converted in dictionaries, for easier handling during rendering,
   * as values can be handled by property name instead of array index.
   *
   * @param collection: collection to normalize
   */
  normalizeCollection(collection) {
    var l = collection.length;
    if (!l)
      return collection;
    var first = collection[0];
    if (_.isArray(first)) {
      // assumes that the server is returning an optimized collection:
      // the first array contains the column names; while the others the values.
      var a = [], i, j = first.length, k;
      for (i = 1; i < l; i++) {
        var o = {};
        for (k = 0; k < j; k++) {
          o[first[k]] = collection[i][k];
        }
        a.push(o);
      }
      return a;
    }
    // the collection is not optimized
    return collection;
  }

  /**
   * Returns the current collection of items.
   */
  getData(options) {
    var o = _.extend({
      optimize: false,
      itemCount: true,
      hide: true  // whether to exclude `hidden` columns
    }, options),
      self = this,
      itemCount = self.options.itemCount && o.itemCount;
    var data = self.getItemsToDisplay();
    var columns = _.clone(self.columns);
    if (o.hide) {
      // delete hidden properties
      _.each(_.where(self.columns, o => {
        return o.hidden || o.secret;
      }), o => {
        _.each(data, d => {
          delete d[o.name];
        });
      });
      columns = _.where(self.columns, o => {
        return !o.hidden && !o.secret;
      });
    }
    if (itemCount) {
      self.setItemsNumber(data);
    }
    if (o.optimize) {
      if (itemCount) {
        columns.unshift({
          name: "ε_row",
          displayName: "#"
        });
      }
      return self.optimizeCollection(data, columns, o);
    }
    return data;
  }

  /**
   * Returns a list of items to display for this table at its current state.
   */
  getItemsToDisplay() {
    var self = this, 
        options = self.options,
        data = self.data;
    if (!data || !data.length)
      return [];
    //
    // clone the data; this is required to alter items
    // without affecting original items
    //
    data = _.clone(data);

    if (!self.fixed) return data;

    // paginate, filter and sort client side
    var l = data.length;
    // apply filters here
    data = self.filters.skim(data);
    if (data.length != l) {
      self.updatePagination(data.length);
    }
    // apply sorting logic, but only if there is no search specified (the search by string property is already sorting really well),
    // or if the search sorting is configured to not rules over the regular sorting
    if (!self.searchText || !options.searchSortingRules) {
      var sortCriteria = self.sortCriteria;
      if (!_.isEmpty(sortCriteria)) {
        A.sortBy(data, sortCriteria);
      }
    }
    // obtain a subset of data, after sorting (this order is really important)
    var subset = self.getSubSet(data);
    return subset;
  }

  /**
   * Sorts the underlying items by one or more properties.
   *
   * @param {(string|string[]|objects)} criteria: object describing
   */
  sortBy() {
    var criteria = A.getSortCriteria(arguments);
    if (!criteria || !criteria.length) {
      return this.unsetSortBy();
    }
    var self = this;
    self.sortCriteria = criteria;
    if (self.hasData()) {
      // render (will trigger storing filters in cache)
      A.sortBy(self.data, criteria);
      self.render();
    } else {
      // store filters in cache
      self.getFiltersSetCache();
    }
    return self;
  }

  /**
   * Progress sort order for a property with the given name.
   */
  progressSortBy(name) {
    if (!name) ArgumentNullException("name");
    var self = this;
    var columns = self.columns;
    if (!columns) {
      // this function can be called only when columns information are initialized
      raise(20, "Missing columns information");
    }
    var property = _.find(columns, x => {
      return x.name == name;
    });
    if (!property) {
      raise(19, "Column '${name}' is not found among columns.");
    }
    var criteria = self.sortCriteria || [];
    var existingSort = _.find(criteria, x => {
      return x[0] == name;
    });
    if (!existingSort) {
      // start by ascending, by default
      criteria.push([name, 1]);
    } else {
      var order = existingSort[1];
      if (order === -1) {
        // remove
        criteria = _.reject(criteria, x => {
          return x[0] == name;
        });
      } else {
        // order can only be 1, move by 1
        existingSort[1] = -1;
      }
    }
    self.sortBy(criteria);
  }

  /**
   * Progress sort order for a single property with the given name.
   */
  progressSortBySingle(name) {
    if (!name) ArgumentNullException("name");
    var self = this;
    var columns = self.columns;
    if (!columns) {
      // this function can be called only when columns information are initialized
      raise(20, "Missing columns information");
    }
    var property = _.find(columns, x => {
      return x.name == name;
    });
    if (!property) {
      raise(19, "Column '${name}' is not found among columns.");
    }
    var criteria = self.sortCriteria || [];
    var existingSort = _.find(criteria, x => {
      return x[0] == name;
    });
    if (!existingSort) {
      // start by ascending, by default
      criteria = [name, 1];
    } else {
      var order = existingSort[1];
      if (order === -1) {
        criteria = [name, 1];
      } else {
        criteria = [name, -1];
      }
    }
    self.sortBy([criteria]);
  }

  /**
   * Unsets the sort by criteria for this table.
   */
  unsetSortBy() {
    this.sortCriteria = null;
    // render (will trigger storing filters in cache)
    this.render();
    return this;
  }

  /**
   * Sets the numeration inside a given array of items.
   */
  setItemsNumber(arr) {
    var self = this,
        pag = self.pagination,
        offset = (pag.page - 1) * pag.resultsPerPage;
    if (!arr) arr = self.data;
    var l = arr.length;
    for (var i = 0; i < l; i++) {
      arr[i].ε_row = (i + 1 + offset).toString();
    }
    return arr;
  }

  /**
   * Optimizes a collection; making its structure smaller by removing the property names.
   *
   * @param data
   * @param {string[]} columns: columns to include.
   * @param {object} options: options to optimize the collection.
   */
  optimizeCollection(data, columns, options) {
    if (!columns) columns = this.columns;
    if (!options) options = {
      format: true
    };
    var a = [_.map(columns, o => o.displayName)], len = "length",
         push = "push",
         format = options.format,
         formattedSuffix = this.options.formattedSuffix,
         obj;
    for (var i = 0, l = data[len]; i < l; i++) {
      var b = [];
      for (var k = 0, j = columns[len]; k < j; k++) {
        var colname = columns[k].name,
            formattedName = colname + formattedSuffix;
        obj = data[i];
        if (format && _.has(obj, formattedName)) {
          b[push](obj[formattedName]);
        }  else {
          // NB: if the object does not have a property, string empty is added
          // to fill the property place.
          b[push](obj[colname] || "");
        }
      }
      a[push](b);
    }
    return a;
  }

  /**
   * Returns the value of the given property from the given item,
   * eventually returning the formatted value.
   */
  getItemValue(item, name) {
    if (!item) ArgumentNullException("item");
    var options = this.options,
        formattedSuffix = options.formattedSuffix,
        formattedName = name + formattedSuffix;
    return _.has(item, formattedName) ? item[formattedName] : item[name];
  }

  /**
   * Default function to get the name of the id property of displayed objects.
   */
  getIdProperty() {
    var o = this.options;
    if (_.isString(o.idProperty)) return o.idProperty;

    var columns = this.columns;
    if (!columns || !columns.length) raise(4, "id property cannot be determined: columns are not initialized.");

    for (var i = 0, l = columns.length; i < l; i++) {
      var name = columns[i].name;
      if (/^_?id$|^_?guid$/i.test(name))
        return name;
    }
    raise(4, "id property cannot be determined, please specify it using 'idProperty' option.");
  }

  getExportFileName(format) {
    return this.options.collectionName + "." + format;
  }

  getColumnsForExport() {
    var columns = this.columns;
    return this.options.exportHiddenProperties
      ? columns
      : _.reject(columns, function (o) {
        return o.hidden || o.secret;
      });
  }

  /**
   * Client side export for a specific format.
   */
  exportTo(format) {
    if (!format) ArgumentException("format");

    var self = this, options = self.options;
    var filename = self.getExportFileName(format),
      exportFormat = _.find(self.options.exportFormats, function (o) {
        return o.format === format;
      }),
      columns = self.getColumnsForExport();
    if (!exportFormat || !exportFormat.type) raise(30, "Missing format information");

    var itemsToDisplay = self.getData({ itemCount: false });
    var contents = "";
    if (exportFormat.handler) {
      //user defined handler
      contents = exportFormat.handler.call(self, itemsToDisplay);
    } else {
      //use default export handlers
      switch (format) {
        case "csv":
          var data = self.optimizeCollection(itemsToDisplay);
          contents = csv.serialize(data, options.csvOptions);
          break;
        case "json":
          contents = json.compose(itemsToDisplay, 2, 2);
          break;
        case "xml":
          contents = self.dataToXml(itemsToDisplay);
          break;
        default:
          throw "export format " + format + "not implemented";
      }
    }
    if (contents)
      FileUtil.exportfile(filename, contents, exportFormat.type);
  }

  /**
   * Basic function to convert the given data into an xml structure.
   */
  dataToXml (data) {
    var self = this,
      columns = self.getColumnsForExport(),
      options = self.options,
      len = "length",
      d = document,
      s = new XMLSerializer(),
      createElement = "createElement",
      appendChild = "appendChild",
      root = d[createElement](options.collectionName || "collection");
      
    for (var i = 0, l = data[len]; i < l; i++) {
      var item = d[createElement](options.entityName || "item");
      for (var k = 0, j = columns[len]; k < j; k++) {
        var col = columns[k], name = col.name, value = data[i][name];
        if (options.entityUseProperties) {
          //use properties
          item.setAttribute(name, value);
        } else {
          //use elements
          var subitem = d[createElement](name);
          subitem.innerText = value;
          item[appendChild](subitem);
        }
      }
      root[appendChild](item);
    }
    var a = s.serializeToString(root);
    return options.prettyXml ? xml.pretty(a) : xml.normal(a);
  }

  /**
   * 
   * @param {*} obj 
   */
  disposeOf(obj) {
    obj.dispose();
    _.removeItem(this.disposables, obj);
  }

  /**
   * Disposes this KingTable.
   */
  dispose() {
    delete this.context;
    delete this.search;
    delete this.filters.context;
    _.each(this.disposables, x => {
      if (x.dispose)
        x.dispose();
      if (_.isFunction(x))
        x();
    });
    this.disposables = [];
    var o = this.options;
    _.ifcall(o.onDispose, this);
  }
}

// Extend KingTable object with properties that are meant to be globally available and editable
// for users of the library (programmers)
// NB: static get wouldn't work because the object would not be editable.
//
KingTable.defaults = DEFAULTS;

KingTable.Schemas = {
  /**
   * Default columns properties, by field value type.
   * This object is meant to be extended by implementers; following their personal preferences.
   */
  DefaultByType: {
    number: function (columnSchema, objSchema) {
      return {
        format: function (value) {
          // NB: this function is used only if a formatter function is not
          // defined for the given property; so here we suggest a format that makes sense for the value.
          return N.format(value);
        }
      };
    },
    date: function (columnSchema, objSchema) {
      return {
        format: function dateFormatter(value) {
          // NB: this function is used only if a formatter function is not
          // defined for the given property; so here we suggest a format that makes sense for the value.

          // support date format defined inside column schema
          // use a format that makes sense for the value
          // if the date has time component, use format that contains time; otherwise only date part
          var hasTime = KingTable.DateUtils.hasTime(value);
          var format = KingTable.DateUtils.defaults.format[hasTime ? "long" : "short"];
          return KingTable.DateUtils.format(value, format);
        }
      };
    }
  },

  /**
   * Default columns properties, by field name.
   * This object is meant to be extended by implementers; following their personal preferences.
   */
  DefaultByName: {
    id: {
      name: "id",
      type: "id",
      hidden: true,
      secret: true
    },
    guid: {
      name: "guid",
      type: "guid",
      hidden: true,
      secret: true
    }
  }
};

// expose ajax functions
KingTable.Ajax = ajax;

// Pollute the window namespace with the KingTable object,
// this is intentional, so the users of the library that don't work with ES6, yet,
// can override its functions using: KingTable.prototype.propertyName = function something() {}
// Haters are gonna hate. But if you don't like, you can always create a custom build without following three lines! (MIT License)
if (typeof window !== UNDEFINED) {
  window.KingTable = KingTable
}

export default KingTable
