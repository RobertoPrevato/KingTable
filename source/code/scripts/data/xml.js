/**
 * XML format functions.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../scripts/utils"

export default {
  normal: function (xml) {
    return "<?xml version=\"1.0\"?>" + xml.replace(/\sxmlns="http:\/\/www\.w3\.org\/\d+\/xhtml"/, "");
  },

  pretty: function (xml, indentation) {
    xml = this.normal(xml);
    if (typeof indentation != "number")
      indentation = 2;
    var reg = /(>)(<)(\/*)/g, a = [];
    xml = xml.replace(reg, "$1\r\n$2$3");
    var pad = 0, parts = xml.split('\r\n'), l = parts.length;

    for (var i = 0; i < l; i++) {
      var node = parts[i];
      var indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/)) {
        if (pad != 0) {
          pad -= 1;
        }
      } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }
      var padding = new Array(pad * indentation).join(" ");
      a.push(padding + node + "\r\n");
      pad += indent;
    }
    return a.join("");
  }
}
