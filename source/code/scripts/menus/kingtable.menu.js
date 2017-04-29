/**
 * KingTable menu core functions.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import $ from "../../scripts/dom"
import _ from "../../scripts/utils"

function eventToIgnore(e) {
  return /input|select|textarea|label|^a$/i.test(e.target.tagName);
}

var menufunctions = {

  closeMenus: function (e) {
    var self = this;
    if (e && e.which === 3) return;
    _.each(["ug-menu", "ug-submenu"], className => {
      var elements = document.body.getElementsByClassName(className);
      
      _.each(elements, el => {
        if ($.contains(el, e.target)) return;

        var parent = el.parentNode;
        if (!$.hasClass(parent, "open")) return;

        if (/input|textarea/i.test(e.target.tagName) && $.contains(parent, e.target)) return;

        $.removeClass(parent, "open");
      });
    });
  },

  expandMenu: function (e) {
    if (eventToIgnore(e)) return true;
    var self = this,
      el = e.target, disabled = "disabled";
    if ($.hasClass(el, disabled) || el.hasAttribute(disabled)) {
      return false;
    }
    var parent = el.parentElement, open = "open";
    if ($.hasClass(parent, open)) {
      $.removeClass(parent, open);
    } else {
      $.addClass(parent, open);
    }
    e.preventDefault();
    return false;
  },

  expandSubMenu: function (e) {
    if (eventToIgnore(e)) return true;
    var open = "open",
      el = $.closestWithTag(e.target, "li"),
      siblings = $.siblings(el);
    _.each(siblings, sib => {
      $.removeClass(sib, open);
      var allOpen = sib.getElementsByClassName(open);
      _.each(allOpen, a => {
        $.removeClass(a, open);
      });
    });
    $.addClass(el, open);
    return false;
  }
};

export default {

  setup() {
    if (this.initialized) {
      return false;
    }
    this.initialized = true;
    var click = "click.menus",
      keydown = "keydown.menus", bo = document.body;
    $.off(bo, click)
    $.on(bo, click, menufunctions.closeMenus); // order is important
    $.on(bo, click, ".ug-expander", menufunctions.expandMenu);
    $.on(bo, click, ".ug-submenu", menufunctions.expandSubMenu);
  }
}