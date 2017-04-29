/**
 * Tests for Sanitizer class.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../scripts/utils";
import Sanitizer from "../scripts/data/sanitizer";

const san = new Sanitizer();


describe("Sanitizer class", () => {
  it("must escape strings", () => {
    var a = san.escape("<script>alert('foo');</script>");
    expect(a).toEqual("&lt;script&gt;alert(&#039;foo&#039;);&lt;/script&gt;");
  });

  it("must escape strings inside objects", () => {
    var o = {
      a: {
        b: "<script>alert('foo');</script>"
      }
    };
    var a = san.sanitize(o);
    expect(_.equal(o, {
      a: {
        b: "&lt;script&gt;alert(&#039;foo&#039;);&lt;/script&gt;"
      }
    })).toEqual(true);
  });

  it("must escape strings inside arrays", () => {
    var o = {
      a: {
        b: "<script>alert('foo');</script>"
      },
      c: [
        {
          x: "<script>alert('foo');</script>"
        }
      ]
    };
    var a = san.sanitize(o);
    expect(_.equal(o, {
      a: {
        b: "&lt;script&gt;alert(&#039;foo&#039;);&lt;/script&gt;"
      },
      c: [
        {
          x: "&lt;script&gt;alert(&#039;foo&#039;);&lt;/script&gt;"
        }
      ]
    })).toEqual(true);
  });
});
