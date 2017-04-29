/**
 * Vanilla AJAX helper using Promise.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../scripts/utils"
import json from "../../scripts/data/json"

const FORM_DATA = "application/x-www-form-urlencoded; charset=UTF-8"
const JSON_DATA = "application/json"

var defaults = {
  type: "POST",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": JSON_DATA
  },
  json: {
    parseDates: true
  }
};

// TODO: common call with options (POST, type, etc.)
export default {

  defaults: defaults,

  /**
   * Extensibility point.
   * Allows to define global logic before sending any request.
   */
  requestBeforeSend(xhr, options, originalOptions) { },

  /**
   * Extensibility point.
   * Allows to override global defaults for AJAX requests.
   */
  setup(o) {
    if (!_.isPlainObject(o))
      throw new Error("Invalid options for AJAX setup.");
    _.extend(this.defaults, o);
    return this;
  },

  converters: {
    "application/json": function (response, req, options) {
      return json.parse(response, options.json);
    }
  },

  shot(options) {
    if (!options) options = {};
    if (options.headers) {
      var extraHeaders = options.headers;
    }
    var o = _.extend({}, this.defaults, options);
    if (options.headers) {
      // keep default headers, even if the user is adding more
      o.headers = _.extend({}, this.defaults.headers, options.headers);
    }
    var url = o.url;
    if (!url)
      throw new Error("missing url for XMLHttpRequest");

    var self = this, converters = self.converters;
    // Return a new promise.
    return new Promise(function(resolve, reject) {
      // Do the usual XHR stuff
      var req = new XMLHttpRequest();
      req.open(o.type, url);

      var headers = o.headers;
      if (headers) {
        var x;
        for (x in headers) {
          req.setRequestHeader(x, headers[x]);
        }
      }
      var contentType = headers["Content-Type"];

      req.onload = function() {
        // This is called even on 404 etc
        // so check the status
        if (req.status == 200) {
          // Resolve the promise with the response text
          // parse automatically the response
          var data = req.response;
          var converter = converters[contentType];
          if (_.isFunction(converter)) {
            data = converter(data, req, o);
          }
          resolve(data, req.status, req);
        }
        else {
          // Otherwise reject with the status text
          // which will hopefully be a meaningful error
          reject(Error(req.statusText));
        }
      };

      // Handle network errors
      req.onerror = function() {
        reject(req, null, Error("Network Error"));
      };

      var data = o.data;
      if (data) {
        // does data require to be serialized in JSON?
        if (contentType.indexOf("/json") > -1) {
          data = json.compose(data);
        } else if (contentType == FORM_DATA) {
          // TODO: support x-www-form-urlencoded POST data
          throw "Not implemented";
        } else {
          throw "invalid or not implemented content type: " + contentType;
        }
        self.requestBeforeSend(req, o, options);
        req.send(data);
      } else {
        // Make the request
        self.requestBeforeSend(req, o, options);
        req.send();
      }
    });
  },

  get(url) {
    // Return a new promise.
    var self = this;
    return new Promise(function(resolve, reject) {
      // Do the usual XHR stuff
      var req = new XMLHttpRequest();
      req.open("GET", url);

      req.onload = function() {
        // This is called even on 404 etc
        // so check the status
        if (req.status == 200) {
          // Resolve the promise with the response text
          resolve(req.response);
        }
        else {
          // Otherwise reject with the status text
          // which will hopefully be a meaningful error
          reject(req, req.status, Error(req.statusText));
        }
      };

      // Handle network errors
      req.onerror = function() {
        reject(req, null, Error("Network Error"));
      };

      // Make the request
      self.requestBeforeSend(req, o, options);
      req.send();
    });
  },

  post(url, options) {
    var o = _.extend(this.defaults, options || {});
  }

}
