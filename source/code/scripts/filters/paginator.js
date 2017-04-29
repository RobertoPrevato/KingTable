/**
 * Paginator class.
 * Offers methods to handle pagination of items and page number.s
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../scripts/utils"

function checkNumber() {
  var i, l = arguments.length, a;
  for (i = 0; i < l; i++) {
    a = arguments[i];
    if (!_.isNumber(a))
      throw new Error("invalid type")
  }
}
function checkNullableNumber() {
  var i, l = arguments.length, a;
  for (i = 0; i < l; i++) {
    a = arguments[i];
    if (!_.isUnd(a) && !_.isNumber(a))
      throw new Error("invalid type")
  }
}

export default class Paginator {

  constructor(options) {
    options = options || {};
    checkNullableNumber(options.page, options.totalItemsCount, options.resultsPerPage)
    this.page = options.page || 0;
    this.resultsPerPage = options.resultsPerPage || 30;
    this.totalItemsCount = options.totalItemsCount || Infinity;
    this.totalPageCount = Infinity;
    this.firstObjectNumber = undefined;
    this.lastObjectNumber = undefined;
    if (!_.isUnd(options.totalItemsCount)) {
      this.setTotalItemsCount(options.totalItemsCount, true);
    }
    if (_.isFunction(options.onPageChange)) {
      // override
      this.onPageChange = options.onPageChange;
    }
  }

  get resultsPerPage() {
    return this._resultsPerPage;
  }

  set resultsPerPage(value) {
    if (!value) value = 0;
    checkNumber(value);
    var self = this, totalItemsCount = self.totalItemsCount;
    // is total items count known?
    if (totalItemsCount) {
      var totalPages = self.getPageCount(totalItemsCount, value);
      self.totalPageCount = totalPages;
      if (totalPages <= self._page) {
        // go to last page
        self.page = totalPages;
      }
    }
    self._resultsPerPage = value;
    self.updateItemsNumber();
  }

  /**
   * Gets the current page of this paginator.
   */
  get page() {
    return this._page;
  }

  /**
   * Sets the current page of this paginator.
   */
  set page(value) {
    checkNumber(value)
    if (value != this.page) {
      this._page = value;
      this.updateItemsNumber();
      this.onPageChange();
    }
  }

  /**
   * Returns a summary of this paginator.
   */
  data() {
    var data = this;
    return {
      page: data._page,
      totalPageCount: data.totalPageCount,
      resultsPerPage: data.resultsPerPage,
      firstObjectNumber: data.firstObjectNumber,
      lastObjectNumber: data.lastObjectNumber,
      totalItemsCount: data.totalItemsCount
    };
  }

  /**
   * Goes to previous page.
   */
  prev() {
    var self = this,
      a = self.page - 1;
    if (self.validPage(a)) {
      self.page = a;
    }
    return self;
  }

  /**
   * Goes to next page.
   */
  next() {
    var self = this,
      a = self.page + 1;
    if (self.validPage(a)) {
      self.page = a;
    }
    return self;
  }

  /**
   * Goes to the first page.
   */
  first() {
    this.page = 1;
    return this;
  }

  /**
   * Goes to the last page.
   */
  last() {
    this.page = this.totalPageCount;
    return this;
  }

  /**
   * Updates the objects numbers in memory.
   */
  updateItemsNumber() {
    var self = this, totalItemsCount = self.totalItemsCount;
    self.firstObjectNumber = (self.page * self.resultsPerPage) - self.resultsPerPage + 1;
    self.lastObjectNumber = Math.min(_.isNumber(totalItemsCount) ? totalItemsCount : Infinity, self.page * self.resultsPerPage);
  }

  /**
   * Sets the total items count of this paginator.
   */
  setTotalItemsCount(itemsCount, uponInitialization) {
    checkNumber(itemsCount);
    var self = this;
    self.totalItemsCount = itemsCount;
    var totalPages = self.getPageCount(itemsCount, self.resultsPerPage);
    self.totalPageCount = totalPages;
    //if the current page is greater than the total pages count; set automatically the page to 1
    // NB: the following does not make sense upon initialization!!
    if (!uponInitialization && totalPages < self.page) {
      self.page = 1;
    }
    self.updateItemsNumber();
    return self;
  }

  /**
   * Returns a value indicating whether the given value is a valid page number for this paginator.
   *
   * @param val: page number
   */
  validPage(val) {
    var p = this;
    return !(isNaN(val) || val < 1 || val > p.totalPageCount || val === p.page);
  }

  /**
   * Function fired when changing page.
   */
  onPageChange() { }

  /**
   * Gets the total page count to display n objects, given the number of objects per page.
   *
   * @param objectsCount: total items count
   * @param objectsPerPage: page size, number of items per page
   */
  getPageCount(objectsCount, objectsPerPage) {
    checkNumber(objectsCount, objectsPerPage)
    if (objectsCount === Infinity) return Infinity;
    if (objectsCount === -Infinity) return 0;
    if (objectsCount < 1)
      return 0;
    if (objectsCount > objectsPerPage) {
      if (objectsCount % objectsPerPage == 0) {
        return objectsCount / objectsPerPage;
      }
      return Math.ceil(objectsCount / objectsPerPage);
    }
    return 1;
  }

  dispose() {
    delete this.onPageChange;
  }
}
