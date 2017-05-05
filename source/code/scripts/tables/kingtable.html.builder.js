/**
 * KingTable bare HTML builder.
 * Renders tabular data in HTML format, without event handlers.
 * Suitable for web pages and emails.
 *
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import { VHtmlElement, VTextElement, VCommentElement, VWrapperElement, VHtmlFragment, escapeHtml } from "../../scripts/data/html"
import KingTableBaseHtmlBuilder from "../../scripts/tables/kingtable.html.base.builder"
import raise from "../../scripts/raise"
import _ from "../../scripts/utils"
import $ from "../../scripts/dom"
const SPACE = " "

export default class KingTableHtmlBuilder extends KingTableBaseHtmlBuilder {

  /**
   * Creates a new instance of KingTableHtmlBuilder associated with the given table.
   */
  constructor(table) {
    super(table)
    this.options = _.extend({}, table ? table.options : null);
    this.setListeners();
  }

  /**
   * Global options for every KingTableHtmlBuilder.
   */
  static get options() {
    return {
      handleLoadingInfo: true, // whether to display loading information (suitable for console applications)
      loadInfoDelay: 500,      // how many milliseconds should wait, before displaying the "Loading..." information
      paginationInfo: true     // whether to show pagination info or not
    };
  }

  /**
   * Sets listeners for the given table.
   */
  setListeners() {
    var self = this;
    var table = self.table;
    if (!table || !table.element) return self;

    self.listenTo(table, {
      "fetching:data": () => {
        self.loadingHandler();
      },
      "fetched:data": () => {
        self.unsetLoadingHandler();
      },
      "fetch:fail": () => {
        self.unsetLoadingHandler().display(self.errorView());
      },
      "no-results": () => {
        self.unsetLoadingHandler().display(self.emptyView());
      }
    });
  }

  /**
   * Gets auto-generated fields by options.
   */
  getGeneratedFields() {
    var o = this.options,
      reg = this.getReg(),
      detailRoute = o.detailRoute,
      a = [],
      goToDetails = reg.goToDetails;

    if (detailRoute) {
      if (!/\/$/.test(detailRoute)) {
        detailRoute = o.detailRoute = detailRoute + "/";
      }
      // Following could cause exception if id property cannot be determined automatically
      var idProperty = this.table.getIdProperty();

      a.push({
        name: "details-link",
        html: item => {
          var itemDetailRoute = detailRoute + item[idProperty];
          return `<a class='kt-details-link' href='${itemDetailRoute}'>${goToDetails}</a>`;
        }
      });
    }
    return a;
  }

  /**
   * Gets the fields to be displayed.
   * Fields comprises objects properties and extra information for every item.
   */
  getFields() {
    var table = this.table;
    var fields = _.clone(table.columns),
        o = this.options,
        itemCount = o.itemCount,
        generatedFields = this.getGeneratedFields(),
        countField = itemCount ? {
          name: "ε_row",
          displayName: "#"
        } : null;

    if (countField) {
      fields.unshift(countField);
    }

    // allow extending the table with extra fields
    var extraFields = o.fields;
    if (extraFields) {
      if (_.isFunction(extraFields)) {
        extraFields = extraFields.call(this, fields);
      }
      fields = generatedFields.concat(extraFields.concat(fields));
    } else {
      fields = generatedFields.concat(fields);
    }
    return fields;
  }

  /**
   * Builds the given instance of KingTable in HTML.
   */
  build() {
    var self = this;
    var table = self.table;
    var data = table.getData({
      format: true,
      hide: false
    });
    if (!data || !data.length) {
      return self.display(self.emptyView())
    }
    var fields = self.getFields();
    var caption = self.buildCaption();
    var view = self.buildView(fields, data);
    var root = self.buildRoot(caption, view);
    self.display(root);
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
      view
    ])
  }

  /**
   * Builds a default view.
   */
  buildView(fields, data) {
    var table = this.table;
    return new VHtmlElement("table", {
      "class": "king-table"
    }, [
      this.buildHead(fields),
      this.buildBody(fields, data)
    ]);
  }

  /**
   * Builds a header.
   */
  buildHead(fields) {
    var table = this.table;
    var row = new VHtmlElement("tr", {}, _.map(_.values(fields), prop => {
      if (prop.hidden || prop.secret) {
        return; // skip
      }
      return new VHtmlElement("th", {"class": prop.css}, new VTextElement(prop.displayName));
    }));
    return new VHtmlElement("thead", {"class": "king-table-head"}, row);
  }

  /**
   * Builds a table body in HTML from given table and data.
   */
  buildBody(fields, data) {
    var table = this.table,
        builder = table.builder,
        formattedSuffix = table.options.formattedSuffix,
        searchPattern = table.searchText ? table.filters.getRuleByKey("search").value : null,
        autoHighlight = table.options.autoHighlightSearchProperties;
    // at every table build, assign an id to the represented item
    var ix = -1;
    var rows = _.map(data, item => {
      ix += 1;
      item.__ix__ = ix;
      var cells = [], x, col;
      for (var i = 0, l = fields.length; i < l; i++) {
        col = fields[i];
        x = col.name;
        if (col.hidden || col.secret) {
          continue;
        }
        var formattedProp = x + formattedSuffix;

        var valueEl, value = _.has(item, formattedProp) ? item[formattedProp] : item[x];

        // does the column define an html resolver?
        if (col.html) {
          if (!_.isFunction(col.html)) {
            raise(24, "Invalid 'html' option for property, it must be a function.");
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

        cells.push(new VHtmlElement("td", col ? {
          "class": col.css || col.name
        } : {}, valueEl))
      }
      return new VHtmlElement("tr", this.getItemAttrObject(ix, item), cells);
    })
    return new VHtmlElement("tbody", {"class": "king-table-body"}, rows);
  }

  /**
   * Returns a caption element for the given table.
   */
  buildCaption() {
    var table = this.table;
    var caption = table.options.caption;
    var paginationInfo = KingTableHtmlBuilder.options.paginationInfo
      ? this.buildPaginationInfo()
      : null;
    return caption || paginationInfo ? new VHtmlElement("div", {
      "class": "king-table-caption"
    }, [
      caption ? new VHtmlElement("span", {}, new VTextElement(caption)) : null,
      paginationInfo
      ? (caption ? new VHtmlElement("br") : null)
      : null, paginationInfo]) : null;
  }

  /**
   * Returns pagination information about the given table.
   */
  buildPaginationInfo() {
    var table = this.table;
    var data = table.pagination,
        reg = this.getReg(),
        page = data.page,
        totalPageCount = data.totalPageCount,
        resultsPerPage = data.resultsPerPage,
        firstObjectNumber = data.firstObjectNumber,
        lastObjectNumber = data.lastObjectNumber,
        totalItemsCount = data.totalItemsCount,
        dataAnchorTime = table.getFormattedAnchorTime(),
        isNum = _.isNumber;
    // render simply pagination information,
    // since event handlers are out of the scope of this class
    var s = "", sep = " - ";
    if (isNum(page)) {
      s += reg.page + SPACE + page;

      if (isNum(totalPageCount) && totalPageCount > 0) {
        s += SPACE + reg.of + SPACE + totalPageCount;
      }

      if (isNum(firstObjectNumber) && isNum(lastObjectNumber) && lastObjectNumber > 0) {
        s += sep + reg.results + ` ${firstObjectNumber} - ${lastObjectNumber}`;
        if (isNum(totalItemsCount)) {
          s += ` ${reg.of} - ${totalItemsCount}`
        }
      }
    }
    if (dataAnchorTime && table.options.showAnchorTimestamp) {
      s += sep + `${reg.anchorTime} ${dataAnchorTime}`;
    }
    var paginationInfo = new VHtmlElement("span", {
      "class": "pagination-info"
    }, new VTextElement(s));
    return paginationInfo;
  }

  emptyView(bare) {
    var reg = this.getReg();
    var el = new VHtmlElement("div", {"class": "king-table-empty"},
      new VHtmlElement("span", 0, new VTextElement(reg.noData)));
    return bare ? el : this.singleLine(this.table, el);
  }

  errorView(message) {
    if (!message) {
      message = this.getReg().errorFetchingData;
    }
    return this.singleLine(this.table, new VHtmlFragment(`<div class="king-table-error">
      <span class="message">
        <span>${message}</span>
        <span class="oi" data-glyph="warning" aria-hidden="true"></span>
      </span>
    </div>`));
  }

  loadingView() {
    var table = this.table;
    var reg = this.getReg()
    var caption = this.buildCaption();
    caption.children.push(new VHtmlElement("div", {
      "class": "loading-info"
    }, [new VHtmlElement("span", {
      "class": "loading-text"
    }, new VTextElement(reg.loading)), new VHtmlElement("span", {
      "class": "mini-loader"
    })]));
    return this.buildRoot([caption]);
  }

  /**
   * Displays a built table.
   */
  display(built) {
    var table = this.table;
    // If a table has an element, assume that is a DOM element;
    if (!_.isString(built))
      built = built.toString();
    //
    // NB: aside from this piece of code, this class is abstracted
    // from DOM manipulation;
    // If a table has an element, assume that is a DOM element;
    //
    var element = table.element;
    if (element) {
      //
      // NB: this class does not set any event handler,
      // hence does not try to unset any event handler when removing an element.
      //
      // a custom event is fired, so the user of the library can unset any event added
      // by other means (e.g. vanilla JavaScript or jQuery)
      //
      element.classList.add("king-table");
      table.emit("empty:element", element);
      while (element.hasChildNodes()) {
        element.removeChild(element.lastChild);
      }
      element.innerHTML = built;
    }
  }

  /**
   * Returns an information for the table in a single line, including
   * table caption and pagination information, if available.
   */
  singleLine(line) {
    var table = this.table;
    var caption = this.buildCaption();
    caption.children.push(new VHtmlElement("br"), new VHtmlElement("div", {
      "class": "loading-info"
    }, _.isString(line) ? new VTextElement(line) : line));
    return this.buildRoot([caption]);
  }

  loadingHandler() {
    var self = this, table = self.table;
    self.unsetLoadingHandler();

    var delayInfo = table.hasData() ? KingTableHtmlBuilder.options.loadInfoDelay : 0;
    // display a loading information, but only if waiting for more than n milliseconds
    self.showLoadingTimeout = setTimeout(function () {
      if (!table.loading) {
        return self.unsetLoadingHandler();
      }
      self.display(self.loadingView());
    }, delayInfo)
  }

  unsetLoadingHandler() {
    clearTimeout(this.showLoadingTimeout);
    this.showLoadingTimeout = null;
    return this;
  }

  /**
   * Disposes of this KingTableHtmlBuilder.
   */
  dispose() {
    var table = this.table;
    var element = table.element;
    if (element) {
      $.empty(element);
    }
    this.stopListening(this.table);
    this.table = null;
    delete this.options;
  }
}
