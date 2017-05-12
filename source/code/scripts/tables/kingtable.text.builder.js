/**
 * KingTable plain text builder.
 * Defines a table builder that renders tabular data in plain text,
 * suitable for debug, unit tests, console output and plain text emails.
 *
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import KingTableBuilder from "../../scripts/tables/kingtable.builder"
import { TextSlider } from "../../scripts/literature/text-slider"
import {
  ArgumentException,
  ArgumentNullException,
  TypeException,
  OutOfRangeException
} from "../../scripts/exceptions"
import raise from "../../scripts/raise"
import _ from "../../scripts/utils"
import S from "../../scripts/components/string"
const SPACE = " "
const RN = "\r\n"
const LINE_SEP = S.repeat("*", 65);


export default class KingTableTextBuilder extends KingTableBuilder {

  /**
   * Creates a new instance of KingTableTextBuilder associated with the given table.
   */
  constructor(table) {
    super(table)
    this.slider = new TextSlider("....")
    this.setListeners(table);
  }

  /**
   * Sets listeners for the given table.
   */
  setListeners(table) {
    if (!table) return;
    var self = this;

    if (table.element && KingTableTextBuilder.options.handleLoadingInfo) {
      self.listenTo(table, "fetching:data", () => {
        self.loadingHandler(table);
      });
      self.listenTo(table, "fetched:data", () => {
        self.unsetLoadingHandler();
      });
      self.listenTo(table, "fetch:fail", () => {
        self.unsetLoadingHandler().display(table, self.errorView());
      });
      self.listenTo(table, "no-results", () => {
        self.unsetLoadingHandler().display(table, self.emptyView());
      });
    }
  }

  /**
   * Global options for every KingTableTextBuilder.
   */
  static get options() {
    return {
      headerLineSeparator: "=",
      headerCornerChar: "=",
      cornerChar: "+",
      headersAlignment: "l",
      rowsAlignment: "l",
      padding: 1,
      cellVerticalLine: "|",
      cellHorizontalLine: "-",
      minCellWidth: 0,
      handleLoadingInfo: true, // whether to display loading information (suitable for console applications)
      loadInfoDelay: 500       // how many milliseconds should wait, before displaying the "Loading..." information
    };
  }

  /**
   * Returns an information for the table in a single line, including
   * table caption and pagination information, if available.
   */
  singleLine(table, line) {
    return this.tabulate([[line]], [], _.extend({
      caption: table.options.caption
    }, table.pagination.totalPageCount > 0 ? table.pagination.data() : null))
  }

  /**
   * Returns an error view.
   */
  errorView() {
    var table = this.table;
    var reg = this.getReg();
    return this.singleLine(table, reg.errorFetchingData);
  }

  loadingHandler(table) {
    var self = this;
    self.unsetLoadingHandler();
    var slider = this.slider;
    var reg = this.getReg()
    var label = reg.loading + " ";

    var delayInfo = table.hasData() ? KingTableTextBuilder.options.loadInfoDelay : 0;
    // display a loading information, but only if waiting for more than n milliseconds
    var element = table.element;
    self.showLoadingTimeout = setTimeout(function () {
      if (!table.loading) {
        return self.unsetLoadingHandler();
      }
      var text = self.singleLine(table, label + slider.next());
      if (element) {
        element.innerHTML = text;
      }

      // set interval, to display a nice text animation while loading
      //
      self.loadingInterval = setInterval(function () {
        if (!table.loading) {
          return self.unsetLoadingHandler();
        }
        var text = self.singleLine(table, label + slider.next());
        element.innerHTML = text;
      }, 600);
    }, delayInfo)
  }

  unsetLoadingHandler() {
    clearInterval(this.loadingInterval);
    clearTimeout(this.showLoadingTimeout);
    this.loadingInterval = this.showLoadingTimeout = null;
    return this;
  }

  /**
   * Disposes of this KingTableTextBuilder.
   */
  dispose() {
    var element = table.element;
    if (element) {
      element.innerHTML = "";
    }
    this.stopListening(this.table);
    this.table = null;
    this.slider = null;
  }

  /**
   * Displays a built table.
   */
  display(table, built) {
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
      table.emit("empty:element", element);
      while (element.hasChildNodes()) {
        element.removeChild(element.lastChild);
      }
      if (element.tagName != "PRE") {
        // append a PRE element
        var child = document.createElement("pre");
        element.appendChild(child);
        element = child;
      }
      element.innerHTML = built;
      //
      // TODO: add method to dispose the element for each view handler?
    }
  }

  /**
   * Builds the given instance of KingTable in plain text.
   */
  build(table) {
    if (!table) table = this.table;
    var a = table.getData({
      optimize: true,
      format: true
    });
    if (!a || !a.length) {
      return this.display(table, this.emptyView())
    }
    var headers = a.shift();
    var built = this.tabulate(headers, a, _.extend({
      caption: table.options.caption,
      dataAnchorTime: table.options.showAnchorTimestamp ? table.getFormattedAnchorTime() : null
    }, table.pagination.data()));
    //
    // display the table:
    //
    this.display(table, built);
  }

  emptyView() {
    var reg = this.getReg()
    return LINE_SEP + RN + reg.noData + RN + LINE_SEP;
  }

  paginationInfo(data) {
    var s = "", sep = " - ";
    var reg = this.getReg(),
        page = data.page,
        totalPageCount = data.totalPageCount,
        firstObjectNumber = data.firstObjectNumber,
        lastObjectNumber = data.lastObjectNumber,
        totalItemsCount = data.totalItemsCount,
        dataAnchorTime = data.dataAnchorTime,
        isNum = _.isNumber;
    if (isNum(page)) {
      s += reg.page + SPACE + page;

      if (isNum(totalPageCount)) {
        s += SPACE + reg.of + SPACE + totalPageCount;
      }

      if (isNum(firstObjectNumber) && isNum(lastObjectNumber)) {
        s += sep + reg.results + S.format(" {0} - {1}", firstObjectNumber, lastObjectNumber);
        if (isNum(totalItemsCount)) {
          s += S.format(" " + reg.of + " {0}", totalItemsCount);
        }
      }
    }
    if (dataAnchorTime) {
      s += sep + `${reg.anchorTime} ${dataAnchorTime}`;
    }
    return s;
  }

  /**
   * Sanitizes a string for display in a plain text table.
   */
  checkValue(s) {
    if (!s) return "";
    if (typeof s != "string") s = s.toString();
    return s ? s.replace(/\r/g, "␍").replace(/\n/g, "␊") : "";
  }

  /**
   * Creates a plain text tabular representation of data, given a set of headers and rows of values.
   * NB: this function is not responsible of formatting values! e.g. create string representations of numbers or dates
   *
   * @example
   * // returns +-------+-------+-------+
                |  id   | name  | value |
                +-------+-------+-------+
                | 1     | AAA   | A11   |
                +-------+-------+-------+
                | 2     | BBB   | B11   |
                +-------+-------+-------+
                | 3     | CCC   | C11   |
                +-------+-------+-------+
                | 4     | DDD   | D11   |
                +-------+-------+-------+
      var a = new KingTableTextBuilder();
      a.tabulate(["id", "name", "value"],
      [
        [1, "AAA", "A11"],
        [2, "BBB", "B11"],
        [3, "CCC", "C11"],
        [4, "DDD", "D11"]
      ]);
   */
  tabulate(
    headers,
    rows,
    options) {
    if (!_.isArray(headers))
      TypeException("headers", "array")
    if (!rows)
      TypeException("rows", "array")
    if (_.any(rows, x => { return !_.isArray(x); }))
      TypeException("rows child", "array")
    var o = _.extend({}, KingTableTextBuilder.options, options || {});
    var headersAlignment = o.headersAlignment,
        rowsAlignment = o.rowsAlignment,
        padding = o.padding,
        cornerChar = o.cornerChar,
        headerLineSeparator = o.headerLineSeparator,
        cellVerticalLine = o.cellVerticalLine,
        cellHorizontalLine = o.cellHorizontalLine,
        minCellWidth = o.minCellWidth,
        headerCornerChar = o.headerCornerChar;
    if (padding < 0)
      OutOfRangeException("padding", 0)
    var self = this;
    // validate the length of headers and of each row: it must be the same
    var headersLength = headers.length;
    if (!headersLength)
      ArgumentException("headers must contain at least one item")
    if (_.any(rows, x => { x.length != headersLength; }))
      ArgumentException("each row must contain the same number of items")

    var s = ""

    // sanitize all values
    _.reach(headers, x => {
      return this.checkValue(x);
    })
    _.reach(rows, x => {
      return this.checkValue(x);
    })

    var valueLeftPadding = S.ofLength(SPACE, padding)
    padding = padding * 2;
    // for each column, get the cell width
    var cols = _.cols([headers].concat(rows)),
      colsLength = _.map(cols, x => {
        return Math.max(_.max(x, y => { return y.length; }), minCellWidth) + padding;
      });
    // does the table contains a caption?
    var totalRowLength;
    var caption = o.caption, checkLength = 0;
    if (caption) {
      checkLength = padding + caption.length + 2;
    }

    // does option contains information about the pagination?
    var paginationInfo = self.paginationInfo(o);
    if (paginationInfo) {
      // is the pagination info bigger than whole row length?
      var pageInfoLength = padding + paginationInfo.length + 2;
      checkLength = Math.max(checkLength, pageInfoLength);
    }

    // check if the last column length should be adapted to the header length
    if (checkLength > 0) {
      totalRowLength = _.sum(colsLength) + (colsLength.length) + 1;
      if (checkLength > totalRowLength) {
        var fix = checkLength - totalRowLength;
        colsLength[colsLength.length - 1] += fix;
        totalRowLength = checkLength;
      }
    }

    if (caption) {
      s += cellVerticalLine + valueLeftPadding + caption + S.ofLength(SPACE, totalRowLength - caption.length - 3) + cellVerticalLine + RN;
    }
    if (paginationInfo) {
      s += cellVerticalLine + valueLeftPadding + paginationInfo + S.ofLength(SPACE, totalRowLength - paginationInfo.length - 3) + cellVerticalLine + RN;
    }

    var headCellsSeps = _.map(colsLength, l => {
        return S.ofLength(headerLineSeparator, l);
      }),
      cellsSeps = _.map(colsLength, l => {
        return S.ofLength(cellHorizontalLine, l);
      });

    var headerLineSep = "";
    // add the first line
    _.each(headers, (x, i) => {
      headerLineSep += headerCornerChar + headCellsSeps[i];
    });
    // add last vertical separator
    headerLineSep += headerCornerChar + RN;

    if (paginationInfo || caption) {
      s = headerLineSep + s;
    }
    s += headerLineSep;

    // add headers
    _.each(headers, (x, i) => {
      s += cellVerticalLine + self.align(valueLeftPadding + x, colsLength[i], headersAlignment);
    });

    // add last vertical singleLineSeparator
    s += cellVerticalLine + RN;

    // add header separator
    s += headerLineSep;

    // build line separator
    var lineSep = "", i;
    for (i = 0; i < headersLength; i++)
      lineSep += cornerChar + cellsSeps[i];
    lineSep += cornerChar;

    // build rows
    var rowsLength = rows.length, j, row, value;
    for (i = 0; i < rowsLength; i++) {
      row = rows[i];
      for (j = 0; j < headersLength; j++) {
        value = row[j];
        s += cellVerticalLine + self.align(valueLeftPadding + value, colsLength[j], rowsAlignment);
      }
      s += cellVerticalLine + RN;
      s += lineSep + RN;
    }
    return s;
  }

  /**
   * Applies an alignment to the given text, using the given length and filler, by alignment code.
   */
  align(text, length, alignment, filler) {
    if (!filler) filler = SPACE;
    if (!alignment)
      ArgumentNullException("alignment");
    switch (alignment) {
      case "c":
      case "center":
        return S.center(text, length, filler);
      case "l":
      case "left":
        return S.ljust(text, length, filler);
      break;
      case "r":
      case "right":
        return S.rjust(text, length, filler);
      default:
        ArgumentException("alignment: " + alignment);
    }
  }
}
