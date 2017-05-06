/**
 * Tests for date utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import D from "../scripts/components/date"
D.format.short = "DD.MM.YYYY";

const it_reg = {
  "week": [
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato"
  ],
  "weekShort": [
    "Dom",
    "Lun",
    "Mar",
    "Mer",
    "Gio",
    "Ven",
    "Sab"
  ],
  "month": [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre"
  ],
  "monthShort": [
    "Gen",
    "Feb",
    "Mar",
    "Apr",
    "Mag",
    "Giu",
    "Lug",
    "Ago",
    "Set",
    "Ott",
    "Nov",
    "Dic"
  ]
}

describe("Date utilities", () => {
  it("must format dates, with default format", () => {
    var a = new Date(2000, 4, 30);
    var s = D.format(a);

    expect(s).toEqual("30.05.2000");
  })

  it("must format dates, with time", () => {
    var a = new Date(2000, 4, 30, 12, 45, 30);
    var s = D.formatWithTime(a);

    expect(s).toEqual("30.05.2000 12:45:30");
  })

  it("must format dates, with given format", () => {
    var a = new Date(2000, 4, 30);
    var s = D.format(a, "MM-DD-YYYY");

    expect(s).toEqual("05-30-2000");
  })

  it("must format dates with times, in given format", () => {
    var a = new Date(2000, 4, 30, 12, 30, 15);
    var s = D.format(a, "DD.MM.YYYY HH:mm:ss");

    expect(s).toEqual("30.05.2000 12:30:15");
  })

  it("must format times", () => {
    var a = new Date(2000, 4, 30, 12, 30, 15);
    var s = D.format(a, "HH:mm:ss");
    expect(s).toEqual("12:30:15");

    s = D.format(a, ">HH:mm<");
    expect(s).toEqual(">12:30<");
  })

  it("must format times with week days", () => {
    var a = new Date(2016, 2, 26);
    var s = D.format(a, "DD.MM.YYYY, ww");
    expect(s).toEqual("26.03.2016, Saturday");
  })

  it("must format times with short week days", () => {
    var a = new Date(2016, 2, 26);
    var s = D.format(a, "DD.MM.YYYY, w");
    expect(s).toEqual("26.03.2016, Sat");
  })

  it("must format times with week days and optional regional", () => {
    var a = new Date(2016, 2, 25);
    var s = D.format(a, "DD.MM.YYYY, ww", it_reg);
    expect(s).toEqual("25.03.2016, Venerdì", "it must use given regional (it)");
  })

  it("must format times with short week days and optional regional", () => {
    var a = new Date(2016, 2, 25);
    var s = D.format(a, "DD.MM.YYYY, w", it_reg);
    expect(s).toEqual("25.03.2016, Ven", "it must use given regional (it)");
  })

  it("must format times with milliseconds", () => {
    var a = new Date(2000, 4, 30, 12, 30, 15, 656);
    var s = D.format(a, "HH:mm:ss fff");
    expect(s).toEqual("12:30:15 656");

    s = D.format(a, ">HH:mm:ss ff<");
    expect(s).toEqual(">12:30:15 65<");
  })

  it("must tell whether two dates are in the same day", () => {
    var a = new Date(2016, 2, 25, 10, 12, 15);
    var b = new Date(2016, 2, 26, 3, 0, 0);

    expect(D.sameDay(a, b)).toEqual(false, "two dates with different date are in different days");

    b = new Date(2016, 2, 25, 3, 0, 0);
    expect(D.sameDay(a, b)).toEqual(true, "two dates with different time are in same day");
  })

  it("must format dates with day names", () => {
    var a = new Date(2016, 2, 26, 3, 0, 0);
    var s = D.format(a, "DDDD", it_reg);
    expect(s).toEqual("Sabato");

    s = D.format(a, "DDD", it_reg);
    expect(s).toEqual("Sab");
  })

  it("must format dates with day numbers, optionally zerofilled", () => {
    var a = new Date(2016, 2, 6);
    var s = D.format(a, "DD", it_reg);
    expect(s).toEqual("06");

    s = D.format(a, "D", it_reg);
    expect(s).toEqual("6");
  })

  it("must format dates with default months names", () => {
    var a = new Date(2016, 5, 26);
    var s = D.format(a, "DD MMMM YYYY");
    expect(s).toEqual("26 June 2016");

    s = D.format(a, "DD MMM. YYYY");
    expect(s).toEqual("26 Jun. 2016");
  })

  it("must format dates with months names", () => {
    var a = new Date(2016, 2, 26, 3, 0, 0);
    var s = D.format(a, "DD MMMM YYYY", it_reg);
    expect(s).toEqual("26 Marzo 2016");

    s = D.format(a, "DD MMM. YYYY", it_reg);
    expect(s).toEqual("26 Mar. 2016");
  })

  it("must format times with am / pm", () => {
    var a = new Date(2016, 2, 26, 3, 0);
    var s = D.format(a, "DD MMM YYYY HH:mm tt");
    expect(s).toEqual("26 Mar 2016 03:00 am");

    a = new Date(2016, 2, 26, 13, 0);
    s = D.format(a, "DD MMM YYYY HH:mm tt");
    expect(s).toEqual("26 Mar 2016 01:00 pm");
  })

  it("must format times with AM / PM", () => {
    var a = new Date(2016, 2, 26, 3, 0);
    var s = D.format(a, "DD MMM YYYY HH:mm TT");
    expect(s).toEqual("26 Mar 2016 03:00 AM");

    a = new Date(2016, 2, 26, 13, 0);
    s = D.format(a, "DD MMM YYYY HH:mm TT");
    expect(s).toEqual("26 Mar 2016 01:00 PM");
  })

  it("must format times with a / p", () => {
    var a = new Date(2016, 2, 26, 3, 0);
    var s = D.format(a, "DD MMM YYYY HH:mm t");
    expect(s).toEqual("26 Mar 2016 03:00 a");

    a = new Date(2016, 2, 26, 13, 0);
    s = D.format(a, "DD MMM YYYY HH:mm t");
    expect(s).toEqual("26 Mar 2016 01:00 p");
  })

  it("must format times with A / P", () => {
    var a = new Date(2016, 2, 26, 3, 0);
    var s = D.format(a, "DD MMM YYYY HH:mm T");
    expect(s).toEqual("26 Mar 2016 03:00 A");

    a = new Date(2016, 2, 26, 13, 0);
    s = D.format(a, "DD MMM YYYY HH:mm T");
    expect(s).toEqual("26 Mar 2016 01:00 P");
  })

  it("must parse dates in ISO format", () => {
    var s = "2017-02-08T14:33:52.183Z";
    var a = D.parse(s);

    expect(a.getFullYear()).toEqual(2017);
    expect(a.getMonth() + 1).toEqual(2);
    expect(a.getDate()).toEqual(8);
    expect(a.getUTCHours()).toEqual(14);
    expect(a.getUTCMinutes()).toEqual(33);
    expect(a.getUTCSeconds()).toEqual(52);
    expect(a.getUTCMilliseconds()).toEqual(183);
  })

  it("must parse dates in non-ISO format (with HH:mm:ss)", () => {
    var s = "2017-02-08 14:33:52";
    var a = D.parse(s);
    expect(a.getFullYear()).toEqual(2017);
    expect(a.getMonth() + 1).toEqual(2);
    expect(a.getDate()).toEqual(8);
    expect(a.getHours()).toEqual(14);
    expect(a.getMinutes()).toEqual(33);
    expect(a.getSeconds()).toEqual(52);
    expect(a.getMilliseconds()).toEqual(0);
  })

  it("must parse dates in non-ISO format (with HH:mm)", () => {
    var s = "2017-02-08 14:33";
    var a = D.parse(s);
    expect(a.getFullYear()).toEqual(2017);
    expect(a.getMonth() + 1).toEqual(2);
    expect(a.getDate()).toEqual(8);
    expect(a.getHours()).toEqual(14);
    expect(a.getMinutes()).toEqual(33);
    expect(a.getSeconds()).toEqual(0);
    expect(a.getMilliseconds()).toEqual(0);
  })

  it("must allow to know whether a date has time data", () => {
    var a = new Date(1986, 4, 30);
    expect(D.hasTime(a)).toEqual(false, "a date with only year, month and date can be described without time information")

    a = new Date(1986, 4, 30, 10, 30);
    expect(D.hasTime(a)).toEqual(true, "a date with hours and minutes has time information")

    a = new Date(1986, 4, 30, 10, 30);
    expect(D.hasTime(a)).toEqual(true, "a date with hours and minutes has time information")
  })

  it("must allow to format dates in ISO 8601 format, with detailed dates", () => {
    var a = new Date(2011, 5, 29, 16, 52, 48, 123);
    var s = D.toIso8601(a);
    expect(s).toEqual("2011-06-29T16:52:48.123Z");
  })

  it("must allow to format dates in ISO 8601 format, without time information", () => {
    var a = new Date(2011, 5, 29);
    var s = D.toIso8601(a);
    expect(s).toEqual("2011-06-29T00:00:00.000Z");
  })

  it("must allow to format dates in ISO 8601 format, without time but with ms information", () => {
    var a = new Date(2011, 5, 29, 0, 0, 0, 656);
    var s = D.toIso8601(a);
    expect(s).toEqual("2011-06-29T00:00:00.656Z");
  })
});
