/**
 * KingTable menu builder function.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../scripts/utils"
import $ from "../../scripts/dom"
import { ArgumentNullException } from "../../scripts/exceptions"
import { VHtmlElement, VTextElement, VCommentElement, VWrapperElement } from "../../scripts/data/html"

function buildMenuItemCaret() {
  return new VHtmlElement("span", {
    "class": "oi",
    "data-glyph": "caret-right"
  });
}

function menuBuilder(menus) {
  if (!menus) throw "missing menus";
  if (_.isPlainObject(menus)) return menuBuilder([menus]);
  if (!_.isArray(menus) || !menus.length) throw "missing menus";
  //normalize schema, if needed
  var first = menus[0];
  if (!first.items && first.menu) {
    menus = [{ items: menus }];
  }
  var a = _.map(menus, menu => {
    var items = menu.items;
    return new VHtmlElement("ul", {
      "id": menu.id,
      "class": "ug-menu"
    }, items ? _.map(items, x => {
      if (!x) return;
      return menuItemBuilder(x);
    }) : null);
  });
  return new VWrapperElement(a);
}

function menuItemCaret() {
  return new VHtmlElement("span", {
    "class": "oi",
    "data-glyph": "caret-right"
  })
}

function menuItemBuilder(options) {
    var o = options || {};
    var type = o.type,
        href = o.href,
        classes = [],
        name = o.name,
        submenu = o.menu,
        attr = o.attr,
        caret = submenu ? buildMenuItemCaret() : null,
        children = [],
        el,
        nameTextEl = new VTextElement(name || "");
    if (attr && attr.css && !attr["class"]) {
      // allow to use attribute css for class
      attr["class"] = attr.css;
      delete attr.css;
    }
    switch (type) {
      case "checkbox":
        var cid = _.uniqueId("mnck-");
        var checked = o.checked ? true : undefined;
        el = new VWrapperElement([new VHtmlElement("input", _.extend({}, attr, {
          "id": cid,
          "type": "checkbox",
          "checked": checked
        })), new VHtmlElement("label", {
          "for": cid
        }, nameTextEl)]);
        break;
      case "radio":
        var value = o.value;
        if (!value) throw new Error("missing 'value' for radio menu item");
        var cid = _.uniqueId("mnrd-");
        var checked = o.checked ? true : undefined;
        el = new VWrapperElement([new VHtmlElement("input", _.extend({}, attr, {
          "id": cid,
          "type": "radio",
          "checked": checked,
          "value": value
        })), new VHtmlElement("label", {
          "for": cid
        }, nameTextEl)]);
        break;
      default:
        if (href) {
          el = new VHtmlElement("a",  _.extend({
            "href": href
          }, attr), [nameTextEl, caret]);
        } else {
          el = new VHtmlElement("span", _.extend({
            "tabindex": "0"
          }, attr), [nameTextEl, caret]);
        }
        break;
    }
    // name element
    children.push(el);

    if (submenu) {
      children.push(menuBuilder(submenu));
    }

    return new VHtmlElement("li", {
      "id": o.id,
      "class": submenu ? "ug-submenu" : undefined
    }, children);
}

export { menuBuilder, menuItemBuilder }