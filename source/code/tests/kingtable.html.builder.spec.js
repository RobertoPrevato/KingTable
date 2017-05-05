/**
 * Tests for KingTableHtmlBuilder class.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import KingTableHtmlBuilder from "../scripts/tables/kingtable.html.builder";
import COLORS from "../tests/data/colors"
import LATEST_SCORES from "../tests/data/latest-scores"
import _ from "../scripts/utils";

describe("KingTableHtmlBuilder", () => {

  it("must produce html fragments for highlighted texts", () => {
    var a = new KingTableHtmlBuilder();
    var text = "Hello World";
    var pattern = /(world)/gim;

    var html = a.highlight(text, pattern);
    expect(html).toEqual(`Hello <span class="kt-search-highlight">World</span>`);
  });

  it("must produce html fragments for highlighted texts (beginning of string)", () => {
    var a = new KingTableHtmlBuilder();
    var text = "Hello World";
    var pattern = /(hello)/gim;

    var html = a.highlight(text, pattern);
    expect(html).toEqual(`<span class="kt-search-highlight">Hello</span> World`);
  });

  it("must produce html fragments for highlighted texts, with multiple matches (beginning of string)", () => {
    var a = new KingTableHtmlBuilder();
    var text = "Hello World hell-o)))-ween";
    var pattern = /hell/gim;

    var html = a.highlight(text, pattern);
    expect(html).toEqual(`<span class="kt-search-highlight">Hell</span>o World <span class="kt-search-highlight">hell</span>-o)))-ween`);
  });

  it("must produce html fragments for highlighted texts, with multiple matches", () => {
    var a = new KingTableHtmlBuilder();
    var text = "Hello World Kitty world";
    var pattern = /(world)/gim;

    var html = a.highlight(text, pattern);
    expect(html).toEqual(`Hello <span class="kt-search-highlight">World</span> Kitty <span class="kt-search-highlight">world</span>`);
  });

  it("must produce html fragments for highlighted texts, with multiple matches (no group)", () => {
    var a = new KingTableHtmlBuilder();
    var text = "Hello World Kitty world";
    var pattern = /world/gim;

    var html = a.highlight(text, pattern);
    expect(html).toEqual(`Hello <span class="kt-search-highlight">World</span> Kitty <span class="kt-search-highlight">world</span>`);
  });

  it("must escape html characters when producing html fragments for highlighted texts, of highlighted string", () => {
    var a = new KingTableHtmlBuilder();
    var text = "Hello <script>console.error('This should not happen')</script>World";
    var pattern = /(<script>console.error\('This should not happen'\)<\/script>)/gim;

    var html = a.highlight(text, pattern);
    expect(html).toEqual(`Hello <span class="kt-search-highlight">&lt;script&gt;console.error(&#039;This should not happen&#039;)&lt;/script&gt;</span>World`);
  });

  it("must escape html characters when producing html fragments for highlighted texts, multiple matches", () => {
    var a = new KingTableHtmlBuilder();
    var text = "Hello <script>alert('foo!')</script> <script>console.error('This should not happen')</script>World";
    var pattern = /(<script>console.error\('This should not happen'\)<\/script>)/gim;

    var html = a.highlight(text, pattern);
    expect(html).toEqual(`Hello &lt;script&gt;alert(&#039;foo!&#039;)&lt;/script&gt; <span class="kt-search-highlight">&lt;script&gt;console.error(&#039;This should not happen&#039;)&lt;/script&gt;</span>World`);
  });

  it("must produce html fragments for highlighted texts (without matches)", () => {
    var a = new KingTableHtmlBuilder();
    var text = "Hello World";
    var pattern = /(without)/gim;

    var html = a.highlight(text, pattern);
    expect(html).toEqual("Hello World");
  });

  it("must escape html fragments", () => {
    var a = new KingTableHtmlBuilder();
    var text = "<script>alert('Foo')</script>";
    var pattern = /scri/gim;

    var html = a.highlight(text, pattern);
    expect(html).toEqual(`&lt;<span class="kt-search-highlight">scri</span>pt&gt;alert(&#039;Foo&#039;)&lt;/<span class="kt-search-highlight">scri</span>pt&gt;`);
  });

  it("must support diacritics in highlights", () => {
    var a = new KingTableHtmlBuilder();
    var text = "Błażkiewicz";
    var pattern = /laz/gim;

    var html = a.highlight(text, pattern);
    expect(html).toEqual(`B<span class="kt-search-highlight">łaż</span>kiewicz`);
  });

  it("must support diacritics, two outside highlight", () => {
    var a = new KingTableHtmlBuilder();
    var text = "Barłysław";
    var pattern = /bar/gim;

    var html = a.highlight(text, pattern);
    expect(html).toEqual(`<span class="kt-search-highlight">Bar</span>łysław`);
  })

  it("must support diacritics, many outside highlight", () => {
    var a = new KingTableHtmlBuilder();
    var text = "Barłysławłłł";
    var pattern = /bar/gim;

    var html = a.highlight(text, pattern);
    expect(html).toEqual(`<span class="kt-search-highlight">Bar</span>łysławłłł`);
  })
});
