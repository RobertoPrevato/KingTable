/**
 * Filters manager.
 * Provides methods to handle client side filtering logic for arrays.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import EventsEmitter from "../../scripts/components/events"
import _ from "../../scripts/utils"
import raise from "../../scripts/raise"
import RegexUtils from "../../scripts/components/regex"
import ArrayUtils from "../../scripts/components/array"
import S from "../../scripts/components/string"


export default class FiltersManager extends EventsEmitter {

  constructor(options, staticProperties) {
    super()
    this.rules = [];
    this.searchDisabled = false;
    this.init(options, staticProperties);
    return this;
  }

  init(options, staticProperties) {
    if (staticProperties)
      _.extend(this, staticProperties)
    this.options = _.extend({}, this.defaults, options);
  }

  set(filter, options) {
    options = _.extend({
      silent: false
    }, options || {});
    if (!filter) return this;
    if (filter.id && !filter.key) filter.key = filter.id;
    if (filter.key) {
      this.rules = _.reject(this.rules, function (r) { return r.key === filter.key; });
    }
    if (filter.fromLiveFilters)
      return this.setLiveFilter(filter);
    this.rules.push(filter);
    if (!options.silent) {
      this.onRulesChange(filter);
    }
    return this;
  }

  setLiveFilter(filter) {
    raise(12, "LiveFilter feature not implemented.");
  }

  static get defaults() {
    return {};
  }

  /**
   * Gets a rule by key.
   */
  getRuleByKey(key) {
    return _.find(this.rules, (rule) => { return rule.key == key; });
  }

  /**
   * Get all rules by type.
   */
  getRulesByType(type) {
    return _.where(this.rules, (rule) => { return rule.type == type; });
  }

  /**
   * Removes a single rule by key.
   */
  removeRuleByKey (key, options) {
    options = _.extend({
      silent: false
    }, options || {});
    var self = this, rules = self.rules;
    var ruleToRemove = _.find(rules, (r) => { return r.key == key; });
    if (ruleToRemove) {
      self.rules = _.reject(rules, (r) => { return r === ruleToRemove; });
      if (!options.silent) {
        self.onRulesChange();
      }
    }
    return self;
  }

  /**
   * Function to fire when rules change.
   * Extensibility point.
   */
  onRulesChange() {}

  /**
   * Searches inside a collection for all items that respect a given search string.
   */
  search(collection, s, options) {
    if (!s || !collection || this.searchDisabled) return collection;
    var rx = s instanceof RegExp ? s : RegexUtils.getSearchPattern(S.getString(s), options);
    if (!rx) return false;
    if (!options.searchProperties)
      // try to get search properties from the context
      options.searchProperties = this.context.getSearchProperties();
    if (!options.searchProperties)
      raise(11, "missing search properties");
    return ArrayUtils.searchByStringProperties({
      pattern: rx,
      properties: options.searchProperties,
      collection: collection,
      keepSearchDetails: false
    });
  }

  /**
   * Skims an array, applying all configured filters.
   */
  skim(arr) {
    var self = this, rules = self.rules, l = rules.length;
    if (!l) return arr;
    var a = arr;
    for (var i = 0; i < l; i++) {
      var filter = self.rules[i];
      if (filter.disabled) continue;
      a = self.applyFilter(a, filter);
    }
    return a;
  }

  /**
   * Applies a given filter to an array.
   */
  applyFilter(arr, filter) {
    switch (filter.type) {
      case "search":
        return this.search(arr, filter.value, filter);
      case "fn":
      case "function":
        return _.where(arr, _.partial(filter.fn.bind(filter.context || this), filter));
    }
    return arr;
  }

  /**
   * Resets this FiltersManager, removing all filter rules in it.
   */
  reset () {
    var rule;
    while (rule = this.rules.shift()) {
      if (rule.onReset) {
        rule.onReset.call(this);
      }
    }
    return this;
  }
}
