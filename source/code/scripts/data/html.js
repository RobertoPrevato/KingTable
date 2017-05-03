/**
 * XML and HTML utilities to build HTML strings.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

function isNum(x) {
  return typeof x == "number";
}

/**
 * A virtual XML element.
 */
class VXmlElement {

  constructor(tagName, attributes, children) {
    this.tagName = tagName
    this.attributes = attributes || {}
    if (children && children instanceof Array == false) {
      // NB: children can be anything implementing a toString method (duck typing)
      children = [children];
    }
    this.children = children || []
    this.hidden = false;
    this.empty = false;
  }

  get tagName() {
    return this._tagName;
  }

  set tagName(val) {
    if (typeof val != "string") throw new Error("tagName must be a string");
    if (!val.trim()) throw new Error("tagName must have a length");
    if (val.indexOf(" ") > -1) throw new Error("tagName cannot contain spaces");
    this._tagName = val
  }

  appendChild(child) {
    this.children.push(child)
  }

  /**
   * Converts this VXmlElement into an XML fragment.
   */
  toString(indent, indentChar, level) {
    var self = this,
        empty = self.empty,
        tagName = self.tagName,
        attrs = self.attributes,
        indent = isNum(indent) ? indent : 0,
        level = isNum(level) ? level : 0,
        indentString = indent > 0 ? new Array((indent * level)+1).join(indentChar || " ") : "",
        s = "<" + tagName,
        x;
    for (x in attrs) {
      if (attrs[x] !== undefined) {
        if (BOOLEAN_PROPERTIES.indexOf(x) > -1) {
          s += ` ${x}`;
        } else {
          s += ` ${x}="${attrs[x]}"`;
        }
      }
    }
    if (empty) {
      s += " />";
      if (indent > 0) {
        // add the indent at the beginning of the string
        s = indentString + s + "\n";
      }
      return s;
    }
    s += ">";
    var children = self.children;
    if (indent > 0 && children.length) {
      s += "\n";
    }
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      if (!child) continue;
      // support HTML fragments
      if (typeof child == "string") {
        s += (indentString + child + "\n");
      } else {
        if (!child.hidden) {
          s += child.toString(indent, indentChar, level + 1);
        }
      }
    }
    if (children && children.length) {
      s += (indentString + `</${tagName}>`);
    } else {
      s += `</${tagName}>`;
    }
    if (indent > 0) {
      // add the indent at the beginning of the string
      s = indentString + s + "\n";
    }
    return s;
  }
}

const EMPTY_ELEMENTS = "area base basefont br col frame hr img input isindex link meta param".split(" ");
const BOOLEAN_PROPERTIES = "checked selected disabled readonly multiple ismap isMap defer noresize noResize nowrap noWrap noshade noShade compact".split(" ");

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
 }

/**
 * A virtual HTML element.
 */
class VHtmlElement extends VXmlElement {

  constructor(tagName, attributes, children) {
    super(tagName, attributes, children)
    this.empty = EMPTY_ELEMENTS.indexOf(tagName.toLowerCase()) > -1;
  }

  get id() {
    return this.attributes.id;
  }

  set id(val) {
    this.attributes.id = val
  }
}

/**
 * A virtual text element.
 */
class VTextElement {

  constructor(text) {
    this.text = text
  }

  get text() {
    return this._text;
  }

  set text(val) {
    // escape characters that need to be escaped
    if (!val) val = "";
    if (typeof val != "string") val = val.toString();
    this._text = escapeHtml(val);
  }

  toString(indent, indentChar, level) {
    var indent = isNum(indent) ? indent : 0,
        level = isNum(level) ? level : 0,
        indentString = indent > 0 ? new Array((indent * level)+1).join(indentChar || " ") : "";
    return indentString + this.text + (indentString ? "\n" : "")
  }
}

/**
 * A piece of HTML fragment that should be rendered without escaping.
 */
class VHtmlFragment {
  constructor(html) {
    this.html = html
  }

  toString(indent, indentChar, level) {
    var indent = isNum(indent) ? indent : 0,
        level = isNum(level) ? level : 0,
        indentString = indent > 0 ? new Array((indent * level)+1).join(indentChar || " ") : "";
    return indentString + this.html + (indentString ? "\n" : "")
  }
}

/**
 * A virtual comment element.
 */
class VCommentElement {

  constructor(text) {
    this.text = text
  }

  get text() {
    return this._text;
  }

  set text(val) {
    if (!val) val = "";
    if (typeof val != "string") val = val.toString();
    // disallows <!-- and --> inside the comment text
    val = val.replace(/<!--/g, "").replace(/-->/g, "");
    this._text = val;
  }

  toString(indent, indentChar, level) {
    var indent = isNum(indent) ? indent : 0,
        level = isNum(level) ? level : 0,
        indentString = indent > 0 ? new Array((indent * level)+1).join(indentChar || " ") : "";
    return indentString + "<!--" + this.text + "-->" + (indentString ? "\n" : "")
  }
}

/**
 * Virtual wrapper element for multiple elements without single root.
 */
class VWrapperElement {
  constructor(children) {
    this.children = children
    this.hidden = false;
  }

  toString(indent, indentChar, level) {
    var s = "", children = this.children;
    if (!children || this.hidden) return s;

    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      if (!child) continue;
      if (!child.hidden) {
        s += child.toString(indent, indentChar, level);
      }
    }
    return s;
  }
}

export {
  VXmlElement,
  VHtmlElement,
  VHtmlFragment,
  VTextElement,
  VCommentElement,
  VWrapperElement,
  escapeHtml
}
