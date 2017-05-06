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
const JSON_MIME = "application/json"
const CONTENT_TYPE = "Content-Type"

var defaults = {
  type: "POST",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": JSON_MIME // deleted for GET requests, as values are placed in query string
  },
  json: {
    parseDates: true
  }
};

function sanitizeContentType(contentType) {
  // just to be sure... since in many cases standard JSON mime type is not used
  if (contentType.indexOf("json") > -1 && contentType != JSON_MIME) {
    return JSON_MIME;
  }
  return contentType;
}

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

  /**
   * Creates a query string
   * 
   * @param {object} data: data to represent in query string.
   */
  createQs(data) {
    if (!data) return "";

    var x, qs = [], v;
    for (x in data) {
      v = data[x];
      if (!_.isNullOrEmptyString(v)) {
        qs.push([x, v]);
      }
    }
    // sort by name
    qs.sort(function (a, b) {
      if (a > b) return 1;
      if (a < b) return -1;
      return 0;
    });
    // return mapped string
    return _.map(qs, o => {
      return encodeURIComponent(o[0]) + "=" + encodeURIComponent(o[1])
    }).join("&");
  },

  shot(options) {
    if (!options) options = {};
    if (options.headers) {
      var extraHeaders = options.headers;
    }
    var o = _.extend({}, _.clone(this.defaults), options);
    if (options.headers) {
      // keep default headers, even if the user is adding more
      o.headers = _.extend({}, this.defaults.headers, options.headers);
    }
    var url = o.url;
    if (!url)
      throw new Error("missing `url` for XMLHttpRequest");

    var self = this, converters = self.converters;

    var method = o.type;
    if (!method)
      throw new Error("missing `type` for XMLHttpRequest");
    
    // if the request if of GET method and there is data to send,
    // convert automatically data to query string and append it to url
    var isGet = method == "GET", inputData = o.data;
    if (isGet && inputData) {
      var qs = this.createQs(inputData);
      var hasQueryString = url.indexOf("?") != -1;
      url += ((hasQueryString ? "&" : "?") + qs);
      delete o.headers[CONTENT_TYPE]; // since data is placed in query string
    }

    // Return a new promise.
    return new Promise(function(resolve, reject) {
      // Do the usual XHR stuff
      var req = new XMLHttpRequest();
      req.open(method, url);

      var headers = o.headers;
      if (headers) {
        var x;
        for (x in headers) {
          req.setRequestHeader(x, headers[x]);
        }
      }

      req.onload = function() {
        // This is called even on 404 etc
        // so check the status
        if (req.status == 200) {
          // Resolve the promise with the response text
          // parse automatically the response
          var data = req.response;

          // NB: if the server does not return a content-type header, this function does no conversion
          // this function is kept intentionally simple and does not do content-type sniffing whatsoever
          var contentType = sanitizeContentType(req.getResponseHeader(CONTENT_TYPE) || "");
          
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
      if (data && (!isGet)) {
        var contentType = o.headers[CONTENT_TYPE];
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

  get(url, options) {
    options = options || {};
    options.url = url;
    options.type = "GET";
    return this.shot(options);
  },

  post(url, options) {
    options = options || {};
    options.url = url;
    options.type = "POST";
    return this.shot(options);
  }
}
