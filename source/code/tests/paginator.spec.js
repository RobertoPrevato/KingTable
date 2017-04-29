/**
 * Tests for Paginator class.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import Paginator from "../scripts/filters/paginator";

var paginator = new Paginator();

describe("Paginator class", () => {
  it("next must increase page number", () => {
    paginator.page = 0;
    expect(paginator.next()).toEqual(paginator);

    expect(paginator.page).toEqual(1);

    paginator.next();

    expect(paginator.page).toEqual(2);
  });

  it("must return the number of pages to display n items, with k page size", () => {
    expect(paginator.getPageCount(0, 30)).toEqual(0);
    expect(paginator.getPageCount(10, 30)).toEqual(1);
    expect(paginator.getPageCount(20, 30)).toEqual(1);
    expect(paginator.getPageCount(30, 30)).toEqual(1);
    expect(paginator.getPageCount(41, 30)).toEqual(2);
    expect(paginator.getPageCount(50, 30)).toEqual(2);
    expect(paginator.getPageCount(60, 30)).toEqual(2);
    expect(paginator.getPageCount(61, 30)).toEqual(3);
    expect(paginator.getPageCount(61, 10)).toEqual(7);
    expect(paginator.getPageCount(123, 10)).toEqual(13);
    expect(paginator.getPageCount(149, 10)).toEqual(15);
    expect(paginator.getPageCount(150, 10)).toEqual(15);
  });

  it("must fire a callback whenever page changes", () => {
    // example: note that the static method is called on the class
    var i = 0;
    paginator.onPageChange = () => { i++; }

    paginator.next()
    expect(i).toEqual(1);

    paginator.next();
    expect(i).toEqual(2);

    paginator.prev();
    expect(i).toEqual(3);

    paginator.first();
    expect(i).toEqual(4);

    paginator.page = 100;
    expect(i).toEqual(5);
  });
});
