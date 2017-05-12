/**
 * Date utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../scripts/utils.js"
import {
  ArgumentException,
  TypeException
} from "../../scripts/exceptions"

function zeroFill(s, l) {
  if ("string" != typeof s) s = s.toString();
  while (s.length < l)
    s = "0" + s;
  return s;
};

// Freely inspired by .NET methods
// https://msdn.microsoft.com/en-us/library/8kb3ddd4%28v=vs.110%29.aspx
var parts = {
  year: {
    rx: /Y{1,4}/,
    fn: function (date, format) {
      var re = date.getFullYear().toString();
      while (re.length > format.length)
        re = re.substr(1, re.length);
      return re;
    }
  },
  month: {
    rx: /M{1,4}/,
    fn: function (date, format, fullFormat, regional) {
      var re = (date.getMonth() + 1).toString();
      switch (format.length) {
        case 1:
          return re;
        case 2:
          return zeroFill(re, 2);
        case 3:
          // short name
          re = date.getMonth();
          return regional.monthShort[re];
        case 4:
          // long name
          re = date.getMonth();
          return regional.month[re];
      }
    }
  },
  day: {
    rx: /D{1,4}/,
    fn: function (date, format, fullFormat, regional) {
      var re = date.getDate().toString();
      switch (format.length) {
        case 1:
          return re;
        case 2:
          return zeroFill(re.toString(), 2);
        case 3:
          //short name
          re = date.getDay();
          return regional.weekShort[re];
        case 4:
          //long name
          re = date.getDay();
          return regional.week[re];
      }
    }
  },
  hour: {
    rx: /h{1,2}/i,
    fn: function (date, format, fullformat) {
      var re = date.getHours(), ampm = /t{1,2}/i.test(fullformat);
      if (ampm && re > 12)
        re = re % 12;
      re = re.toString();
      while (re.length < format.length)
        re = "0" + re;
      return re;
    }
  },
  minute: {
    rx: /m{1,2}/,
    fn: function (date, format) {
      var re = date.getMinutes().toString();
      while (re.length < format.length)
        re = "0" + re;
      return re;
    }
  },
  second: {
    rx: /s{1,2}/,
    fn: function (date, format) {
      var re = date.getSeconds().toString();
      while (re.length < format.length)
        re = "0" + re;
      return re;
    }
  },
  millisecond: {
    rx: /f{1,4}/,
    fn: function (date, format) {
      var l = format.length;
      var re = date.getMilliseconds().toString();
      while (re.length < l)
        re = "0" + re;
      if (re.length > l) {
        return re.substr(0, l);
      }
      return re;
    }
  },
  hoursoffset: {
    rx: /z{1,3}/i,
    fn: function (date, format, fullformat) {
      var re = -(date.getTimezoneOffset() / 60), sign = re > 0 ? "+" : "";
      switch (format.length) {
        case 1:
          return sign + re;
        case 2:
          return sign + zeroFill(re, 2);
        case 3:
          //with minutes
          return sign + zeroFill(re, 2) + ":00";
      }
    }
  },
  ampm: {
    rx: /t{1,2}/i,
    fn: function (date, format) {
      var h = date.getHours(), capitals = /T{1,2}/.test(format), re;
      switch (format.length) {
        case 1:
          re = h > 12 ? "p" : "a";
          break;
        case 2:
          re = h > 12 ? "pm" : "am";
          break;
      }
      return capitals ? re.toUpperCase() : re;
    }
  },
  weekday: {
    rx: /w{1,2}/i,
    fn: function (date, format, fullFormat, regional) {
      var weekDay = date.getDay();
      var key = format.length > 1 ? "week" : "weekShort",
        reg = regional[key];
      if (reg && reg[weekDay] !== undefined)
        return reg[weekDay];
      return weekDay;
    }
  }
};

const isodaterx = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z?$|^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\sUTC)?$/;
const daterx = /^(\d{4})\D(\d{1,2})\D(\d{1,2})(?:\s(\d{1,2})(?:\D(\d{1,2}))?(?:\D(\d{1,2}))?)?$/

export default {

  /**
   * Returns a value indicating whether the given value looks like a date.
   */
  looksLikeDate: function (s) {
    if (!s) return false;
    if (s instanceof Date) return true
    if (typeof s != "string") return false;
    if (!!daterx.exec(s)) return true;
    if (!!isodaterx.exec(s)) return true;
    return false;
  },

  defaults: {
    "format": {
      "short": "DD.MM.YYYY",
      "long": "DD.MM.YYYY HH:mm:ss"
    },
    "week": [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "weekShort": [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ],
    "month": [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    "monthShort": [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ]
  },

  /**
   * Parses a string representing a date into an instance of Date.
   *
   * @param {string} s: string to parse
   */
  parse(s) {
    if (!_.isString(s)) {
      TypeException("s", "string");
    }
    var m = daterx.exec(s);
    if (m) {
      // The date is not in standard format.
      // this means that *some* browsers will make assumptions about the timezone of the date
      var hour = m[4];
      if (hour) {
        var a = new Date(parseInt(m[1]), parseInt(m[2])-1, parseInt(m[3]), parseInt(hour), parseInt(m[5] || 0), parseInt(m[6] || 0));
        return a;
      }
      return new Date(m[1], m[2]-1, m[3]);
    }
    // does the date look like a date in ISO format?
    if (!!isodaterx.exec(s)) {
      // this is the ideal scenario: the server is returning dates in ISO format,
      // so they can be passed safely to Date constructor
      if (!/Z$/.test(s) && s.indexOf("UTC") == -1) s = s + "Z"; // NB: this fix is necessary to have dates that work in Firefox like in Chrome
      // We can do it, because the server is storing and returning dates in UTC
      // The Z suffix is going to be deprecated
      return new Date(s);
    }
    return;
  },

  /**
   * Returns a string representation of a date without time,
   * optionally using a given regional object.
   *
   * @param {date} d: date to format;
   * @param {object} [regional] - regional object
   */
  format(date, format, regional) {
    if (!format) format = this.defaults.format.short;
    if (!regional) regional = this.defaults;
    var re = format;
    for (var x in parts) {
      var part = parts[x],
        m = format.match(part.rx);
      if (!m) continue;
      re = re.replace(part.rx, part.fn(date, m[0], format, regional));
    }
    return re;
  },

  /**
   * Returns a string representation of a date and time,
   * optionally using a given regional object.
   *
   * @param {date} d: date to format;
   * @param {object} [regional] - regional object
   */
  formatWithTime(d, regional) {
    return this.format(d, this.defaults.format.long, regional);
  },

  /**
   * Returns a value indicating whether the given argument is a valid date.
   *
   * @param {any} v: value to check.
   */
  isValid(v) {
    return v instanceof Date && isFinite(v);
  },

  /**
   * Returns a value indicating whether two dates are in the same day.
   *
   * @param {date} a: date to check;
   * @param {date} b: date to check;
   */
  sameDay(a, b) {
    return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
  },

  /**
   * Returns a value indicating whether a date is today.
   *
   * @param {date} a: date to check;
   */
  isToday(a) {
    return this.sameDay(a, new Date());
  },

  /**
   * Returns a value indicating whether a date has a time component.
   *
   * @param {date} a: date to check;
   */
  hasTime(a) {
    var hours = a.getHours(), minutes = a.getMinutes(), seconds = a.getSeconds();
    return !!(hours || minutes || seconds);
  },

  /**
   * Returns a standardized ISO 8601 formatted string.
   * 2011-06-29T16:52:48.000Z
   */
  toIso8601(a) {
    return this.format(a, "YYYY-MM-DD") + "T" + this.format(a, "hh:mm:ss") + "." + this.format(a, "fff") + "Z";
  },

  /**
   * Returns a value representing a date in Excel-style.
   * Excel stores dates as sequential serial numbers so that they can be used in calculations. 
   * By default, January 1, 1900 is serial number 1, and January 1, 2008 is serial number 39448 because it is 39,447 days after January 1, 1900.
   */
  toExcelDateValue(v) {
    var a = 25569.0 + ((v.getTime() - (v.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
    return a.toString().substr(0,5);
  }
}
