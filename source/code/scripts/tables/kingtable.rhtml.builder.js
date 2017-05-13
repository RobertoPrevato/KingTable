/**
 * KingTable rich HTML builder.
 * Renders tabular data in HTML format, with event handlers and tools.
 * Suitable for web pages and desktop applications powered by Node.js.
 *
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import { VHtmlElement, VTextElement, VCommentElement, VWrapperElement, VHtmlFragment } from "../../scripts/data/html"
import { menuBuilder, menuItemBuilder } from "../../scripts/menus/kingtable.menu.html"
import KingTableHtmlBuilder from "../../scripts/tables/kingtable.html.builder"
import KingTableBaseHtmlBuilder from "../../scripts/tables/kingtable.html.base.builder"
import KingTableMenuFunctions from "../../scripts/menus/kingtable.menu"
import KingTableMenuHtml from "../../scripts/menus/kingtable.menu.html"
import raise from "../../scripts/raise"
import _ from "../../scripts/utils"
import $ from "../../scripts/dom"
import FileUtils from "../../scripts/data/file"
// import xml from "../../scripts/data/xml"
const SPACE = " "
const CHECKBOX_TYPE = "checkbox"
const KingTableClassName = "king-table"

function classObj(name) {
  return {"class": name};
}

/**
 * Default methods to build a Gallery view for KingTableRichHtmlBuilder.
 * NB: functions are executed in the context of the KingTableRichHtmlBuilder.
 */
class KingTableRhGalleryViewResolver extends KingTableBaseHtmlBuilder {

  buildView(table, columns, data) {
    return new VHtmlElement("div", classObj("king-table-gallery"), 
    [
      this.buildBody(table, columns, data),
      new VHtmlElement("br", classObj("break"))
    ]);
  }

  /**
   * Builds a table body in HTML from given table and data.
   */
  buildBody(table, columns, data) {
    var builder = this,
        formattedSuffix = table.options.formattedSuffix,
        searchPattern = table.searchText ? table.filters.getRuleByKey("search").value : null,
        autoHighlight = table.options.autoHighlightSearchProperties;
    var ix = -1;
    var rows = _.map(data, item => {
      ix += 1;
      item.__ix__ = ix;
      var cells = [], x, col;
      for (var i = 0, l = columns.length; i < l; i++) {
        col = columns[i];
        x = col.name;
        if (col.hidden || col.secret) {
          continue;
        }
        var formattedProp = x + formattedSuffix;
        var valueEl, value = _.has(item, formattedProp) ? item[formattedProp] : item[x];

        // does the column define an html resolver?
        if (col.html) {
          if (!_.isFunction(col.html)) {
            raise(24, "Invalid 'html' option for property");
          }
          // NB: it is responsibility of the user of the library to escape HTML characters that need to be escaped
          var html = col.html.call(builder, item, value);
          valueEl = new VHtmlFragment(html || "");
        } else {
          if (value === null || value === undefined || value === "") {
            valueEl = new VTextElement("");
          } else {
            // is a search active?
            if (searchPattern && autoHighlight && _.isString(value)) {
              // an html fragment is required to display an highlighted value
              valueEl = new VHtmlFragment(builder.highlight(value, searchPattern));
            } else {
              valueEl = new VTextElement(value);
            }
          }
        }

        cells.push(new VHtmlElement(col.name == "ε_row" ? "strong" : "span", col ? {
          "class": col.css || col.name,
          "title": col.displayName
        } : {}, valueEl))
      }
      return new VHtmlElement("li", builder.getItemAttrObject(ix, item), cells);
    })
    return new VHtmlElement("ul", {"class": "king-table-body"}, rows);
  }
}

const SortModes = {
  Simple: "simple",  // only one property at a time;
  Complex: "complex" // sort by multiple properties;
}


/**
 * Normalizes
 */
function normalizeExtraView(o) {
  if (!o) raise(34, "Invalid extra view configuration.");
  if (!o.name) raise(35, "Missing name in extra view configuration.");

  if (o.getItemTemplate) {
    _.extend(o, {
      resolver: {
        getItemTemplate: o.getItemTemplate,
        
        buildView: function (table, columns, data) {
          var itemTemplate = this.getItemTemplate();
          if (!itemTemplate) {
            raise(31, "Invalid getItemTemplate function in extra view.");
          }
          var rows = _.map(data, datum => {
            var html = itemTemplate.replace(/\{\{(.+?)\}\}/g, (s, a) => {
              if (!datum.hasOwnProperty(a))
                raise(32, `Missing property ${a}, for template`);
              return table.getItemValue(datum, a);
            });
            return new VHtmlFragment(html);
          });
          return new VHtmlElement("div", {"class": `king-table-body ${o.name}`.toLowerCase()}, rows);
        }
      }
    });
    delete o.getItemTemplate;
  }
  return o;
}


class KingTableRichHtmlBuilder extends KingTableHtmlBuilder {

  /**
   * Creates a new instance of KingTableRichHtmlBuilder associated with the given table.
   */
  constructor(table) {
    super(table)
    this.options = _.extend({}, KingTableRichHtmlBuilder.defaults, table.options, table.options.rhtml || table.options.html);
    this.setSeachHandler();

    var options = this.options,
      extraViews = options.extraViews;
    if (extraViews) {
      options.views = options.views.concat(_.map(extraViews, o => normalizeExtraView(o)));
    }

    // load settings from stores
    this.loadSettings();

    // initialize global menu event handlers
    if (!KingTableMenuFunctions.initialized) {
      KingTableMenuFunctions.setup();
    }

    this.filtersViewOpen = options.filtersView && options.filtersViewExpandable && options.filtersViewOpen;
  }

  setListeners() {
    super.setListeners();

    // additional listeners
    var self = this, table = self.table;
    if (!table || !table.element) return self;

    self.listenTo(table, {
      "change:pagination": () => {
        if (!this.rootElement) return true;
        self.updatePagination();
      },
      "get-list:failed": () => {
        // pagination must be updated also in this case
        if (!this.rootElement) return true;
        self.updatePagination();
      }
    });
  }

  static get BaseHtmlBuilder() {
    return KingTableBaseHtmlBuilder;
  }

  static get DomUtils() {
    return $;
  }

  loadSettings() {
    var self = this, 
      o = self.options,
      table = self.table, store = table.getFiltersStore();
    if (!store) return self;

    // restore sort mode
    var storedSortMode = table.getPreference("sort-mode");
    if (storedSortMode) {
      o.sortMode = storedSortMode;
    }

    var storedViewType = table.getPreference("view-type");
    if (storedViewType) {
      o.view = storedViewType;
    }

    return self;
  }

   /**
    * Sets a client side search handler for the table.
    */
  setSeachHandler() {
    var delay = this.options.searchDelay;
    function search(text) {
      var table = this.table;
      // set search, but only if the value is of sufficient length
      if (table.validateForSeach(text)) {
        // the value is sufficient to trigger a search
        table.search(text);
      } else if (table.isSearchActive()) {
        // unset search: the value is either too short or empty
        table.unsetSearch();
        table.render();
      }
      table.getFiltersSetCache(); // store filter in cache
      // continue normally
      return true;
    }

    this.search = _.isNumber(delay) && delay > 0
      ? _.debounce(search, delay, this)
      : search;
    return this;
  }

  /**
   * Gets the view resolver currently used by this KingTableRichHtmlBuilder,
   * with validation.
   */
  getViewResolver() {
    var o = this.options,
      view = o.view,
      views = o.views;
    if (!_.isString(view)) {
      raise(21, "Missing view configuration for Rich HTML builder");
    }
    var viewData = _.find(views, v => { return v.name == view; });
    if (!viewData) {
      raise(22, "Missing view resolver for view: " + view);
    }
    var resolver = viewData.resolver;
    if (resolver === true) {
      // use the default functions
      return this;
    }
    if (!resolver)
      raise(33, `Missing resolver in view configuration '${view}'`);
    
    // support both instantiable objects and plain objects
    if (!_.isPlainObject(resolver))
      resolver = new resolver();
    
    if (!_.quacks(resolver, ["buildView"])) {
      raise(23, "Invalid resolver for view: " + view);
    }
    return resolver;
  }

  /**
   * Returns a caption element for the given table.
   */
  buildCaption() {
    var table = this.table;
    var caption = table.options.caption;
    return caption ? new VHtmlElement("div", {
      "class": "king-table-caption"
    }, new VHtmlElement("span", {}, new VTextElement(caption))) : null;
  }

  /**
   * Builds the given instance of KingTable in HTML.
   */
  build() {
    var self = this;
    var table = self.table;
    var element = table.element;
    if (!element) {
      // for this class, it doesn't make sense if a table doesn't have an element.
      // raise(25, "Missing table element"); //TODO: handle for tests
      return self;
    }
    return self.ensureLayout().update();
  }

  /**
   * Ensures that the HTML layout is ready to display the bound table.
   */
  ensureLayout() {
    var self = this;
    if (self.rootElement) {
      return self;
    }
    var table = self.table,
        o = self.options,
        element = table.element,
        view = self.buildView(null, null, new VHtmlFragment(" ")),
        caption = self.buildCaption(),
        root = self.buildRoot(caption, view);
    table.emit("empty:element", element);
    $.empty(element);
    $.addClass(element, KingTableClassName);
    element.innerHTML = root.toString();
    // add reference to root element
    self.rootElement = $.findFirstByClass(element, "king-table-region");
    // bind events
    self.bindEvents();

    _.ifcall(o.onLayoutRender, self, [element]);
    if (o.filtersView) {
      _.ifcall(o.onFiltersRender, self, [$.findFirstByClass(element, "kt-filters")]);
    }
    return self;
  }

  /**
   * Updates the current rendered view to current table state.
   */
  update() {
    this.updatePagination().updateView();
  }

  /**
   * Updates the current rendered pagination view to current table state.
   */
  updatePagination() {
    var table = this.table,
      data = table.pagination,
      rootElement = this.rootElement;
    if (!rootElement) {
      raise(26, "missing root element");
    }
    var reg = this.getReg(),
        o = table.options,
        data = table.pagination,
        page = data.page,
        totalPageCount = data.totalPageCount,
        resultsPerPage = data.resultsPerPage,
        firstObjectNumber = data.firstObjectNumber,
        lastObjectNumber = data.lastObjectNumber,
        totalItemsCount = data.totalItemsCount,
        dataAnchorTime = table.getFormattedAnchorTime(),
        isNum = _.isNumber,
        findByClass = $.findFirstByClass,
        addClass = $.addClass,
        removeClass = $.removeClass;
    
    var pageEl = findByClass(rootElement, "pagination-bar-page-number");
    pageEl.value = page;

    var sizeEl = findByClass(rootElement, "pagination-bar-results-select");
    sizeEl.value = resultsPerPage;

    var a = "pagination-button", b = "pagination-button-disabled";
    _.each(["pagination-bar-first-page", "pagination-bar-prev-page"], name => {
      var el = findByClass(rootElement, name);
      if (page > 1) {
        addClass(el, a)
        removeClass(el, b)
      } else {
        addClass(el, b)
        removeClass(el, a)
      }
    });

    _.each(["pagination-bar-last-page", "pagination-bar-next-page"], name => {
      var el = findByClass(rootElement, name);
      if (page < totalPageCount) {
        addClass(el, a)
        removeClass(el, b)
      } else {
        addClass(el, b)
        removeClass(el, a)
      }
    });

    var resultsInfo = "";
    if (isNum(firstObjectNumber) && isNum(lastObjectNumber) && lastObjectNumber > 0) {
      resultsInfo += reg.results + ` ${firstObjectNumber} - ${lastObjectNumber}`;
      if (isNum(totalItemsCount)) {
        resultsInfo += ` ${reg.of} - ${totalItemsCount}`
      }
    }
    var anchorTimeInfo = "";
    if (dataAnchorTime && table.options.showAnchorTimestamp) {
      anchorTimeInfo = `${reg.anchorTime} ${dataAnchorTime}`;
    }

    var info = {
      "results-info": resultsInfo,
      "anchor-timestamp-info": anchorTimeInfo,
      "total-page-count": reg.of + " " + totalPageCount
    }, x;
    for (x in info) {
      var el = findByClass(rootElement, x);
      if (el) {
        el.innerHTML = info[x];
      }
    }

    var search = table.searchText || "";
    var searchEl = findByClass(rootElement, "search-field");
    // update the search element value, but only if it is not currently
    // focused. Because if it is focused, the user is using it.
    if (searchEl && searchEl.value != search && $.isFocused(searchEl) == false) {
      searchEl.value = search;
    }

    return this;
  }

  /**
   * Updates the table view to the current table state.
   */
  updateView() {
    var self = this,
      o = self.options,
      table = self.table,
      data = table.pagination,
      rootElement = self.rootElement;
    if (!rootElement) {
      raise(26, "missing root element");
    }

    // classes
    _.each({
      "kt-search-active": table.searchText,
      "kt-search-sorting": table.options.searchSortingRules
    }, (condition, key) => {
      $.modClass(rootElement, key, condition);
    });

    // get data to display
    var data = table.getData({
      format: true,
      hide: false
    });
    var viewEl = $.findFirstByClass(rootElement, "king-table-view");
    if (!data || !data.length) {
      // display empty view inside the table view region
      viewEl.innerHTML = self.emptyView().toString();
      return self;
    }
    var columns = self.getFields();
    // do tools need to be built for the first time?
    // TODO: eventually, support reinitializing columns (current implementation supports only tables that do not change between ajax requests)
    if (self._must_build_tools) {
      // get element
      var toolsEl = document.getElementById(self.toolsRegionId);
      toolsEl.innerHTML = self.buildToolsInner(true);
      delete self._must_build_tools;
    }
    self.currentItems = data;
    var view = self.buildView(columns, data);
    viewEl.innerHTML = view.children[0].toString();
    _.ifcall(o.onViewUpdate, self, [viewEl]); // call if exists
    return self;
  }

  /**
   * Displays a built table.
   */
  display(built) {
    var table = this.table, o = this.options;
    // if a table has an element, assume that is a DOM element;
    if (!_.isString(built))
      built = built.toString();
    this.ensureLayout();
    var root = this.rootElement;
    // update view only
    var viewEl = $.findFirstByClass(root, "king-table-view");
    viewEl.innerHTML = built;
    _.ifcall(o.onViewUpdate, this, [viewEl]); // call if exists
  }

  /**
   * Builds a root virtual element for the given table, with given
   * table children.
   */
  buildRoot(caption, view) {
    var table = this.table;
    var rootAttr = {
      "class": "king-table-region"
    };
    if (table.id) {
      rootAttr.id = table.id;
    }
    return new VHtmlElement("div", rootAttr, [
      caption,
      this.buildPaginationBar(),
      this.buildFiltersView(),
      view
    ])
  }

  /**
   * Builds a header from given table and columns.
   *
   * @param {object[]} columns;
   * @param {object[]} data;
   */
  buildPaginationBar() {
    var table = this.table,
        reg = this.getReg(),
        o = this.options,
        data = table.pagination,
        page = data.page,
        totalPageCount = data.totalPageCount,
        resultsPerPage = data.resultsPerPage,
        firstObjectNumber = data.firstObjectNumber,
        lastObjectNumber = data.lastObjectNumber,
        totalItemsCount = data.totalItemsCount,
        filtersView = o.filtersView,
        filtersViewExpandable = filtersView && o.filtersViewExpandable,
        filtersViewOpen = filtersViewExpandable && o.filtersViewOpen,
        dataAnchorTime = table.getFormattedAnchorTime(),
        isNum = _.isNumber;
    
    var resultsInfo = "";
    if (isNum(firstObjectNumber) && isNum(lastObjectNumber) && lastObjectNumber > 0) {
      resultsInfo += reg.results + ` ${firstObjectNumber} - ${lastObjectNumber}`;
      if (isNum(totalItemsCount)) {
        resultsInfo += ` ${reg.of} - ${totalItemsCount}`
      }
    }
    var anchorTimeInfo;
    if (dataAnchorTime && table.options.showAnchorTimestamp) {
      anchorTimeInfo = `${reg.anchorTime} ${dataAnchorTime}`;
    }
    var advancedFilters = reg.advancedFilters;
    var searchElement = o.allowSearch ? new VHtmlElement("span", {
          "class": "pagination-bar-filters"
        }, new VHtmlElement("input", {
          "type": "text",
          "class": "search-field",
          "value": table.searchText || ""
        })) : null;
    var span = "span", separator = new VHtmlElement(span, {"class": "separator"});
    return new VHtmlElement("div", {
      "class": "pagination-bar",
    }, [
        this.buildTools(),
        new VHtmlElement(span, {"class": "pagination-bar-buttons"}, [
        new VHtmlElement(span, {
          "tabindex": "0",
          "class": "pagination-button pagination-bar-first-page oi",
          "data-glyph": "media-step-backward",
          "title": reg.firstPage
        }),
        new VHtmlElement(span, {
          "tabindex": "0",
          "class": "pagination-button pagination-bar-prev-page oi",
          "data-glyph": "caret-left",
          "title": reg.prevPage
        }),
        separator,
        new VHtmlElement(span, {
          "class": "valigned"
        }, new VTextElement(reg.page)),
        new VHtmlElement("input", {
          "type": "text",
          "name": "page-number",
          "class": "must-integer pagination-bar-page-number",
          "value": data.page
        }),
        new VHtmlElement("span", {
          "class": "valigned total-page-count",
          "value": data.page
        }, new VTextElement(reg.of + " " + data.totalPageCount)),
        separator,
        new VHtmlElement(span, {
          "tabindex": "0",
          "class": "pagination-button pagination-bar-refresh oi",
          "data-glyph": "reload",
          "title": reg.refresh
        }),
        separator,
        new VHtmlElement(span, {
          "tabindex": "0",
          "class": "pagination-button pagination-bar-next-page oi",
          "data-glyph": "caret-right",
          "title": reg.nextPage
        }),
        new VHtmlElement(span, {
          "tabindex": "0",
          "class": "pagination-button pagination-bar-last-page oi",
          "data-glyph": "media-step-forward",
          "title": reg.lastPage
        }),
        separator,
        new VHtmlElement(span, {
          "class": "valigned",
        }, new VTextElement(reg.resultsPerPage)),
        new VHtmlElement("select", {
          "name": "pageresults",
          "class": "pagination-bar-results-select valigned"
        }, _.map(o.resultsPerPageSelect, x => {
          var a = new VHtmlElement("option", {
            "value": x
          }, new VTextElement(x.toString()))
          if (x === o.resultsPerPage) {
            a.attributes.selected = true;
          }
          return a;
        })),
        separator,
        resultsInfo ? new VHtmlElement(span, {
          "class": "valigned results-info"
        }, new VTextElement(resultsInfo)) : null,
        resultsInfo ? separator : null,
        anchorTimeInfo ? new VHtmlElement(span, {
          "class": "valigned anchor-timestamp-info"
        }, new VTextElement(anchorTimeInfo)) : null,
        searchElement ? separator : null,
        searchElement,
        filtersViewExpandable ? separator : null,
        filtersViewExpandable ? new VHtmlElement("button", {
          "class": "btn valigned camo-btn kt-advanced-filters" + (filtersViewOpen ? " kt-open" : "")
        }, new VTextElement(advancedFilters)) : null
      ])
    ]);
  }

  /**
   * Builds a header from given table and columns.
   *
   * @param {object[]} columns;
   * @param {object[]} data;
   */
  buildHead(columns) {
    var table = this.table;
    var builder = table.builder;
    var sortCriteria = table.sortCriteria, reg = builder.getReg();
    var row = new VHtmlElement("tr", {}, _.map(_.values(columns), prop => {
      if (prop.hidden || prop.secret) {
        return; // skip
      }
      var sorting = false, order, classes = [prop.css];
      if (prop.sortable) {
        classes.push("sortable");
        // is the table currently sorted by this property?
        var sortedBy = _.find(sortCriteria, x => {
          return x[0] === prop.name;
        })
        if (sortedBy) {
          sorting = true;
          order = sortedBy[1];
        }
      }
      var displayName = prop.displayName;
      var cell = new VHtmlElement("th", {"class": classes.join(" "), "data-prop": prop.name}, new VHtmlElement("div", {}, [
        new VHtmlElement("span", {}, new VTextElement(displayName)),
        sorting ? new VHtmlElement("span", {
          "class": "oi kt-sort-glyph",
          "data-glyph": order == 1 ? "sort-ascending" : "sort-descending",
          "aria-hidden": true,
          "title": _.format(order == 1 ? reg.sortAscendingBy : reg.sortDescendingBy, { name: displayName })
        }) : null
      ]))

      return cell;
    }));
    return new VHtmlElement("thead", {"class": "king-table-head"}, row);
  }

  /**
   * Builds a view for the given table.
   *
   * @param {KingTable} table;
   * @param {object[]} columns;
   * @param {object[]} data;
   */
  buildView(columns, data, subView) {
    var table = this.table;
    var view;
    if (subView) {
      view = subView;
    } else if (!data || !data.length) {
      view = new VHtmlElement("div", {
        "class": "king-table-view"
      }, this.emptyView());
    } else {
      var resolver = this.getViewResolver(), view;
      if (resolver === this) {
        // use default resolver
        view = new VHtmlElement("table", {
          "class": "king-table"
        }, [
          this.buildHead(columns),
          this.buildBody(columns, data)
        ]);
      } else {
        // use custom resolver
        // add reference to table and options
        resolver.table = this.table;
        resolver.options = table.options;

        view = resolver.buildView(table, columns, data);
        // remove reference
        delete resolver.table;
        delete resolver.options;
      }
    }
    // wrap in view root element
    return new VHtmlElement("div", {
      "class": "king-table-view"
    }, view);
  }

  getTemplate(option, type) {
    if (_.isFunction(option)) {
      return option.call(this);
    }
    if (!_.isString(option)) {
      raise(38, `Cannot obtain HTML from given parameter ${type}, must be a function or a string.`);
    }
    var element = document.getElementById(option);
    if (element != null) {
      if (/script/i.test(element.tagName)) {
        return element.innerText;
      }
      raise(38, `Cannot obtain HTML from parameter ${type}. Element is not <script>.`);
    }
    // option treated as html fragment itself
    return option;
  }

  /**
   * Builds a filters view for the given table.
   */
  buildFiltersView() {
    var self = this,
      o = self.options,
      filtersView = o.filtersView;
    
    if (!filtersView) return;
    var filtersViewOpen = o.filtersViewOpen,
        filtersViewExpandable = o.filtersViewExpandable,
        template = self.getTemplate(filtersView, "filtersView"),
        css = ["kt-filters"];

    if (filtersViewOpen || (!filtersViewExpandable)) css.push("kt-open");
    if (filtersViewExpandable) css.push("kt-expandable");

    return new VHtmlElement("div", {
      "class": css.join(" ")
    }, [new VHtmlFragment(template)]);
  }

  /**
   * Builds a tools view for the given table.
   */
  buildTools() {
    // tools can be either built immediately (if columns information are ready);
    // or afterwards upon update
    var table = this.table, colsInitialized = table.columnsInitialized;
    if (!colsInitialized) {
      this._must_build_tools = true;
    }
    var _id = this.toolsRegionId = _.uniqueId("tools-region"); 
    return new VHtmlElement("div", {
      "id": _id,
      "class": "tools-region"
    }, this.buildToolsInner(colsInitialized));
  }

  buildToolsInner(colsInitialized) {
    return new VWrapperElement([
      new VHtmlElement("span", {
        "class": "oi ug-expander",
        "tabindex": "0",
        "data-glyph": "cog"
      }),
      colsInitialized ? this.buildMenu() : null
    ]);
  }

  buildMenu() {
    var self = this, 
      o = self.options, 
      extraTools = o.tools;
    
    var tools = [
      self.getColumnsMenuSchema(),
      self.getViewsMenuSchema(),
      o.allowSortModes ? self.getSortModeSchema() : null,
      self.getExportMenuSchema()
    ];

    if (extraTools) {
      if (_.isFunction(extraTools)) extraTools = extraTools.call(this);
      if (extraTools) {
        if (!_.isArray(extraTools)) {
          raise(40, "Tools is not an array or a function returning an array.");
        }
        tools = tools.concat(extraTools);
      }
    }

    if (o.prepTools) {
      if (!_.isFunction(o.prepTools)) {
        raise(41, "prepTools option must be a function.");
      }
      o.prepTools.call(this, tools);
    }

    return menuBuilder({
        items: tools
    });
  }

  getSortModeSchema() {
    var reg = this.getReg();
    var options = this.options, currentMode = options.sortMode;
    var items = _.map(SortModes, (key, value) => {
      return {
        name: reg.sortModes[value],
        checked: currentMode == value,
        type: "radio",
        value: value, // this is the radio value; and is required
        attr: {
          "name": "kt-sort-mode",
          "class": "sort-mode-radio"
        }
      };
    });
    return {
      name: reg.sortOptions,
      menu: {
        items: items
      }
    };
  }

  /**
   * Builds a default schema for columns menu.
   */
  getColumnsMenuSchema() {
    // TODO: allow to disable by configuration
    if (!this.table.columns || !this.table.columns.length) {
      throw "Columns not initialized.";
    }
    var columns = _.where(this.table.columns, x => {
      return !x.secret;
    });
    var reg = this.getReg();
    return {
      name: reg.columns,
      menu: {
        items: _.map(columns, x => {
          return {
            name: x.displayName,
            checked: !x.hidden,
            type: CHECKBOX_TYPE,
            attr: {
              "name": x.name,
              "class": "visibility-check"
            }
          };
        })
      }
    };
  }

  /**
   * Builds a default schema for views menu.
   */
  getViewsMenuSchema() {
    var reg = this.getReg();
    var o = this.options, views = o.views, currentView = o.view;
    var items = _.map(views, o => {
      var value = o.name;
      return {
        name: reg.viewsType[value] || value,
        checked: currentView == value,
        type: "radio",
        value: value,
        attr: {
          "name": "kt-view-type",
          "class": "view-type-radio"
        }
      };
    });
    return {
      name: reg.view,
      menu: {
        items: items
      }
    };
  }

  /**
   * Builds a default schema for export tools.
   */
  getExportMenuSchema() {
    var table = this.table,
       exportFormats = table.options.exportFormats;
    if (!exportFormats || !exportFormats.length) return null; // disabled
    // if the client does not support client side export, remove the client side export formats
    if (!FileUtils.supportsCsExport()) {
      exportFormats = _.reject(exportFormats, o => o.cs || o.clientSide);
    }
    if (!exportFormats || !exportFormats.length) return null; // disabled
    
    var reg = this.getReg();

    var items = _.map(exportFormats, o => {
      return {
        name: reg.exportFormats[o.format] || o.name,
        attr: {
          css: "export-btn",
          "data-format": o.format
        }
      };
    });

    return {
      name: reg.export,
      menu: {
        items: items
      }
    };
  }

  goToPrev() {
    this.table.pagination.prev();
  }

  goToNext() {
    this.table.pagination.next();
  }

  goToFirst() {
    this.table.pagination.first();
  }

  goToLast() {
    this.table.pagination.last();
  }

  refresh() {
    this.table.refresh();
  }

  changePage(e) {
    var v = e.target.value;
    if (/^\d+$/.test(v) && this.table.pagination.validPage(parseInt(v))) {
      // update
      this.table.pagination.page = parseInt(v);
      this.table.render();
    } else {
      // revert value
      e.target.value = this.table.pagination.page;
    }
  }

  changeResultsNumber(e) {
    var v = e.target.value;
    this.table.pagination.resultsPerPage = parseInt(v);
    this.table.render();
  }

  /**
   * Obtains the item related to the given event.
   * 
   * @param Event e: event
   */
  getItemByEv(e, ignoreMissing) {
    if (!e) return;
    return this.getItemByEl(e.target, ignoreMissing);
  }

  /**
   * Obtains the item to which a given HTML pertains.
   * 
   * @param HTMLElement el: element
   */
  getItemByEl(el, ignoreMissing) {
    if (!el) return;
    var itemElement = $.closestWithClass(el, "kt-item");
    if (!itemElement) {
      // the element is not contained in an kt-item
      if (ignoreMissing) return;
      // not what the user of the library wants
      raise(36, "Cannot retrieve an item by event data. Make sure that HTML elements generated for table items have 'kt-item' class.");
    }
    var itemIx = itemElement.dataset.itemIx;
    if (_.isUnd(itemIx)) {
      raise(37, "Cannot retrieve an item by element data. Make sure that HTML elements generated for table items have 'data-ix' attribute.");
    }
    return this.currentItems[itemIx];//_.find(this.currentItems, i => i.__ix__ == itemIx);
  }

  onItemClick(e) {
    var item = this.getItemByEl(e.target),
      options = this.options, pure = options.purist, und;
    options.onItemClick.call(this, item, pure ? und : e);
  }

  toggleAdvancedFilters() {
    var name = "filtersViewOpen", oc = "kt-open";
    var filtersView = $.findByClass(this.rootElement, "kt-filters")[0];
    var open = $.hasClass(filtersView, oc);
    this[name] = !open;
    $.modClass(filtersView, oc, this[name]);
  }

  clearFilters() {
    // TODO
  }

  sort(e) {
    var el = e.target, options = this.options;
    // if sorting by search, ignore
    if (this.table.searchText && options.searchSortingRules) {
      return true;
    }

    if (!/th/i.test(el.tagName)) {
      el = $.closestWithTag(el, "th");
    }
    var property = el.dataset.prop, table = this.table;;
    if (property && _.any(this.table.columns, x => {
      return x.name == property;
    })) {
      switch (options.sortMode) {
        case SortModes.Simple:
          // sort by single property
          table.progressSortBySingle(property);
          break;
        case SortModes.Complex:
          // sort by multiple properties, in order of definition
          table.progressSortBy(property);
          break;
        default:
          raise(28, "Invalid sort mode options. Value must be either 'simple' or 'complex'.");
      }
    }
  }

  onSearchKeyUp(e) {
    var a = e.target.value;
    this.search(a);
  }

  onSearchChange(e) {
    var a = e.target.value;
    this.search(a);
  }

  viewToModel() {
    console.log("TODO")
  }

  prepareEvents(events, purist) {
    if (!events) return;
    if (_.isFunction(events)) events = events.call(this);
    var x, newObj = {};
    for (x in events) {
      let fn = events[x];
      newObj[x] = _.isString(fn) ? fn : function (e) {
        var item = this.getItemByEv(e, true);
        if (purist) {
          var re = fn.call(this, item);
        } else {
          var re = fn.call(this, e, item);
        }
        return re === false ? false : true;
      };
    }
    return newObj;
  }

  getEvents() {
    var options = this.options,
        purist = options.purist,
        events = options.events, 
        ievents = options.ievents;
    // wrap custom events to receive the item as first parameter (if available), and maybe the event
    events = this.prepareEvents(events, purist);
    ievents = this.prepareEvents(ievents, true);
    var baseevents = this.getBaseEvents();
    return _.extend({}, baseevents, events, ievents);
  }

  setSortMode(name) {
    this.options.sortMode = name;
    // store sort mode in memory;
    this.table.storePreference("sort-mode", name);
  }

  setViewType(name) {
    this.options.view = name;
    // store sort mode in memory;
    this.table.storePreference("view-type", name);
    this.table.render();
  }

  getColumnsVisibility() {
    var columnsCheckbox = $.findByClass(this.rootElement, "visibility-check");
    return _.map(columnsCheckbox, x => { return { name: $.attr(x, "name"), visible: x.checked } });
  }

  /**
   * Event handler for default columns visibility checkbox change.
   */
  onColumnVisibilityChange() {
    var columnsVisibility = this.getColumnsVisibility();
    this.table.toggleColumns(columnsVisibility);
  }

  onViewChange(e) {
    if (!e) return true;
    var target = e.target;
    this.setViewType(target.value);
  }

  onSortModeChange(e) {
    if (!e) return true;
    var target = e.target;
    this.setSortMode(target.value);
  }

  onExportClick(e) {
    var el = e.target,
      format = el.dataset.format;
    if (!format) {
      raise(29, "Missing format in export element's dataset.");
    }
    this.table.exportTo(format);
  }

  getBaseEvents() {
    var baseevents = {
      "click .pagination-bar-first-page": "goToFirst",
      "click .pagination-bar-last-page": "goToLast",
      "click .pagination-bar-prev-page": "goToPrev",
      "click .pagination-bar-next-page": "goToNext",
      "click .pagination-bar-refresh": "refresh",
      "change .pagination-bar-page-number": "changePage",
      "change .pagination-bar-results-select": "changeResultsNumber",
      "click .kt-advanced-filters": "toggleAdvancedFilters",
      "click .btn-clear-filters": "clearFilters",
      "click .king-table-head th.sortable": "sort",
      "keyup .search-field": "onSearchKeyUp",
      "paste .search-field, cut .search-field": "onSearchChange",
      "keyup .filters-region input[type='text']": "viewToModel",
      "keyup .filters-region textarea": "viewToModel",
      "change .filters-region input[type='checkbox']": "viewToModel",
      "change .filters-region input[type='radio']": "viewToModel",
      "change .filters-region select": "viewToModel",
      "change .visibility-check": "onColumnVisibilityChange",
      "click .export-btn": "onExportClick",
      "change [name='kt-view-type']": "onViewChange",
      "change [name='kt-sort-mode']": "onSortModeChange"
    };
    // different input types
    _.each("text date datetime datetime-local email tel time search url week color month number".split(" "), function (inputType) {
      baseevents["change .filters-region input[type='" + inputType + "']"] = "viewToModel";
    });
    var options = this.options;
    if (options.onItemClick) {
      baseevents["click .kt-item"] = "onItemClick";
    }
    return baseevents;
  }

  bindEvents() {
    var a = "__events__bound";
    if (this[a]) return this;
    this[a] = 1;
    return this
      .delegateEvents()
      .bindWindowEvents();
  }

  anyMenuIsOpen() {
    return false;// TODO
  }

  bindWindowEvents() {
    if (typeof window != "undefined") {
      var self = this.unbindWindowEvents();
      $.on(document.body, "keydown.king-table", function(e) {
        //if any menu is open, or any input is focused, do nothing
        if ($.anyInputFocused() || self.anyMenuIsOpen()) return true;
        var kc = e.keyCode;
        //if the user clicked the left arrow, or A, go to previous page
        if (_.contains([37, 65], kc)) {
          //prev page
          self.goToPrev();
        }
        //if the user clicked the right arrow, or D, go to next page
        if (_.contains([39, 68], kc)) {
          //next page
          self.goToNext();
        }
      });
    }
    //TODO: support swipe events; using HammerJs library
    return this;
  }

  unbindWindowEvents() {
    if (typeof window != "undefined") {
      var self = this;
      $.off(document.body, "keydown.king-table");
    }
    return this;
  }

  /**
   * Applies event handlers.
   */
  delegateEvents() {
    var self = this,
      table = self.table,
      options = self.options,
      root = self.table.element,
      events = self.getEvents(),
      delegateEventSplitter = /^(\S+)\s*(.*)$/;
    self.undelegateEvents();
    for (var key in events) {
      var val = events[key],
        method = val;
      if (!method) raise(27, "Invalid method definition");
      // if method try to read from builder itself
      if (!_.isFunction(method)) method = self[method];
      if (!method && _.isFunction(options[val]))
        // try to read from options
        method = options[val];

      if (!_.isFunction(method)) throw new Error("method not defined inside the model: " + events[key]);
      var match = key.match(delegateEventSplitter);
      var eventName = match[1], selector = match[2];
      method = _.bind(method, self);
      eventName += ".delegate";
      if (selector === "") {
        // TODO: support
        throw new Error("delegates without selector are not implemented");
      } else {
        $.on(root, eventName, selector, method);
      }
    }
    var a = "__events__bound";
    self[a] = 0;
    return self;
  }

  /**
   * Clears all event handlers associated with this table builder.
   */
  undelegateEvents() {
    $.off(this.table.element);
    return this;
  }

  /**
   * Disposes of this KingTableRichHtmlBuilder.
   */
  dispose() {
    // undelegate events
    this.undelegateEvents().unbindWindowEvents();
    // remove element
    $.remove(this.rootElement);
    $.removeClass(this.table.element, KingTableClassName);

    // removes reference to root element (it gets removed from DOM inside base dispose)
    this.currentItems = this.rootElement = null;
    super.dispose();
  }

  emptyView() {
    var reg = this.getReg();
    return new VHtmlElement("div", {"class": "king-table-empty"},
      new VHtmlElement("span", 0, new VTextElement(reg.noData)));
  }

  errorView(message) {
    if (!message) {
      message = this.getReg().errorFetchingData;
    }
    return new VHtmlFragment(`<div class="king-table-error">
      <span class="message">
        <span>${message}</span>
        <span class="oi" data-glyph="warning" aria-hidden="true"></span>
      </span>
    </div>`);
  }

  loadingView() {
    var reg = this.getReg()
    return new VHtmlElement("div", {
      "class": "loading-info"
    }, [new VHtmlElement("span", {
      "class": "loading-text"
    }, new VTextElement(reg.loading)), new VHtmlElement("span", {
      "class": "mini-loader"
    })]);
  }

  singleLine() {
    throw new Error("make targeted updates");
  }
}

KingTableRichHtmlBuilder.defaults = {
  view: "table",
  views: [
    {name:"table", resolver: true},
    {name:"gallery", resolver: KingTableRhGalleryViewResolver}
  ],
  filtersView: null, // allows to define a view for advanced filters
  filtersViewExpandable: true, // whether the advanced filters view should be expandable; or always visible.
  filtersViewOpen: false, // whether filters view should be automatically displayed, upon table render.
  searchDelay: 50,
  sortMode: SortModes.Simple,
  allowSortModes: true, // whether to allow selecting sort mode
  purist: false,         // whether to exclude event and other DOM data in high level callbacks

  // Permits to specify the options of the results per page select
  resultsPerPageSelect: [10, 30, 50, 100, 200],

  // Permits to specify extra tools for this table
  tools: null,

  // Allows to alter tools before render
  prepTools: null,

  // Whether to automatically highlight values that answer to text search criteria.
  autoHighlightSearchProperties: true
};

export default KingTableRichHtmlBuilder;